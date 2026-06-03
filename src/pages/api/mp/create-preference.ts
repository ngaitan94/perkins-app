import type { APIRoute } from 'astro';
import { createCheckoutPreference, getServiceClient, isDemoMode } from '../../../lib/mp-server';

export const POST: APIRoute = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

	let body: { solicitud_id?: string };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400 });
	}

	const solicitudId = body.solicitud_id;
	if (!solicitudId) return new Response(JSON.stringify({ error: 'solicitud_id requerido' }), { status: 400 });

	const { data: solicitud, error } = await locals.supabase
		.from('solicitudes')
		.select('*')
		.eq('id', solicitudId)
		.eq('requester_id', user.id)
		.single();

	if (error || !solicitud) {
		return new Response(JSON.stringify({ error: 'Solicitud no encontrada' }), { status: 404 });
	}

	if (isDemoMode()) {
		const service = getServiceClient();
		if (service) {
			await service.from('payments').insert({
				solicitud_id: solicitudId,
				payer_id: user.id,
				amount_clp: solicitud.total_clp,
				marketplace_fee_clp: solicitud.platform_fee_clp,
				status: 'approved',
			});
			await service.from('solicitudes').update({
				status: 'open',
				published_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
			}).eq('id', solicitudId);
		}
		return new Response(JSON.stringify({ demo_mode: true }), { status: 200 });
	}

	try {
		const preference = await createCheckoutPreference({
			solicitud_id: solicitudId,
			title: solicitud.title,
			total_clp: solicitud.total_clp,
			marketplace_fee_clp: solicitud.platform_fee_clp,
		});

		await locals.supabase.from('payments').insert({
			solicitud_id: solicitudId,
			payer_id: user.id,
			mp_preference_id: preference.id,
			amount_clp: solicitud.total_clp,
			marketplace_fee_clp: solicitud.platform_fee_clp,
			status: 'pending',
		});

		return new Response(JSON.stringify({
			init_point: preference.init_point,
			preference_id: preference.id,
		}), { status: 200 });
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Error desconocido';
		return new Response(JSON.stringify({ error: msg }), { status: 500 });
	}
};
