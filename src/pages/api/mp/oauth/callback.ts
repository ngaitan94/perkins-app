import type { APIRoute } from 'astro';
import { exchangeOAuthCode, getServiceClient, isDemoMode } from '../../../../lib/mp-server';

export const GET: APIRoute = async ({ url, locals, redirect }) => {
	const user = locals.user;
	if (!user) return redirect('/login');

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (!code) return redirect('/app/perfil?error=oauth');

	if (state !== user.id) {
		return redirect('/app/perfil?error=oauth_state');
	}

	if (isDemoMode()) {
		return redirect('/app/perfil?mp=demo');
	}

	try {
		const tokens = await exchangeOAuthCode(code);
		const service = getServiceClient();
		if (service) {
			await service.from('profiles').update({
				mp_access_token: tokens.access_token,
				mp_seller_id: String(tokens.user_id),
				mp_connected: true,
			}).eq('id', user.id);
		}
		return redirect('/app/perfil?mp=connected');
	} catch {
		return redirect('/app/perfil?error=oauth');
	}
};
