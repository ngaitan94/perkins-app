import { defineMiddleware } from 'astro:middleware';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { applySecurityHeaders } from './lib/security-headers.js';
import { getDefaultDashboard, isAdmin } from './lib/roles';
import type { Profile } from './lib/types';

const publicPaths = new Set([
	'/',
	'/como-funciona',
	'/precios',
	'/login',
	'/registro',
	'/terminos',
	'/privacidad',
]);

const publicPrefixes = ['/api/mp/webhook'];

function normalizePathname(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith('/')) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

function isPublicPath(pathname: string): boolean {
	if (publicPaths.has(pathname)) return true;
	return publicPrefixes.some((p) => pathname.startsWith(p));
}

function isProtectedPath(pathname: string): boolean {
	if (isPublicPath(pathname)) return false;
	if (pathname.startsWith('/_')) return false;
	if (/\.[a-zA-Z0-9]{2,12}$/.test(pathname)) return false;
	return true;
}

async function loadProfile(
	supabase: App.Locals['supabase'],
	userId: string,
): Promise<Profile | null> {
	const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
	return data as Profile | null;
}

export const onRequest = defineMiddleware(async (context, next) => {
	const supabaseUrlRaw = import.meta.env.PUBLIC_SUPABASE_URL;
	const supabaseKeyRaw = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
	const supabaseUrl = typeof supabaseUrlRaw === 'string' ? supabaseUrlRaw.trim() : '';
	const supabaseKey = typeof supabaseKeyRaw === 'string' ? supabaseKeyRaw.trim() : '';

	if (!supabaseUrl || !supabaseKey) {
		const r = new Response(
			'Servicio no configurado: defina PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY.',
			{ status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
		);
		return applySecurityHeaders(r, '');
	}

	const supabase = createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll() {
				return parseCookieHeader(context.request.headers.get('Cookie') ?? '');
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					context.cookies.set(name, value, options);
				});
			},
		},
	});

	const {
		data: { user },
	} = await supabase.auth.getUser();

	let profile: Profile | null = null;
	if (user) {
		profile = await loadProfile(supabase, user.id);
	}

	context.locals.supabase = supabase;
	context.locals.user = user;
	context.locals.profile = profile;

	const path = normalizePathname(context.url.pathname);

	if (path.startsWith('/admin')) {
		if (!user || !isAdmin(profile)) {
			return applySecurityHeaders(
				context.redirect(user ? getDefaultDashboard(profile) : '/login'),
				supabaseUrl,
			);
		}
	}

	if (isProtectedPath(path)) {
		if (!user) {
			return applySecurityHeaders(
				context.redirect(`/login?next=${encodeURIComponent(path)}`),
				supabaseUrl,
			);
		}
	}

	if (user && (path === '/login' || path === '/registro')) {
		return applySecurityHeaders(context.redirect(getDefaultDashboard(profile)), supabaseUrl);
	}

	const response = await next();
	return applySecurityHeaders(response, supabaseUrl);
});
