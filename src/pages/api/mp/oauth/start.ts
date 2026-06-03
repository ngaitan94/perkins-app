import type { APIRoute } from 'astro';
import { getOAuthUrl, isDemoMode } from '../../../../lib/mp-server';

export const GET: APIRoute = async ({ locals, redirect }) => {
	const user = locals.user;
	if (!user) return redirect('/login');

	if (isDemoMode()) {
		await locals.supabase.from('profiles').update({
			mp_connected: true,
			mp_seller_id: `demo-${user.id.slice(0, 8)}`,
		}).eq('id', user.id);
		return redirect('/app/perfil?mp=demo');
	}

	const url = getOAuthUrl(user.id);
	return redirect(url);
};
