import type { APIRoute } from 'astro';
import { createSubscriptionPreapproval, getServiceClient, isDemoMode } from '../../../../lib/mp-server';

export const POST: APIRoute = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

	let body: { plan_slug?: string };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400 });
	}

	const planSlug = body.plan_slug;
	if (!planSlug) return new Response(JSON.stringify({ error: 'plan_slug requerido' }), { status: 400 });

	const { data: plan, error } = await locals.supabase
		.from('subscription_plans')
		.select('*')
		.eq('slug', planSlug)
		.eq('active', true)
		.single();

	if (error || !plan) {
		return new Response(JSON.stringify({ error: 'Plan no encontrado' }), { status: 404 });
	}

	if (isDemoMode()) {
		const service = getServiceClient();
		const tier = plan.target_role === 'perkin' ? 'premium_perkin' : 'premium_requester';
		if (service) {
			await service.from('user_subscriptions').insert({
				user_id: user.id,
				plan_id: plan.id,
				status: 'active',
				mp_preapproval_id: `demo-${planSlug}`,
			});
			await service.from('profiles').update({ subscription_tier: tier }).eq('id', user.id);
		}
		return new Response(JSON.stringify({ demo_mode: true }), { status: 200 });
	}

	try {
		const preapproval = await createSubscriptionPreapproval({
			plan_slug: planSlug,
			plan_name: plan.name,
			price_clp: plan.price_clp,
			payer_email: user.email ?? '',
			user_id: user.id,
		});

		await locals.supabase.from('user_subscriptions').insert({
			user_id: user.id,
			plan_id: plan.id,
			status: 'pending',
			mp_preapproval_id: preapproval.id,
		});

		return new Response(JSON.stringify({
			init_point: preapproval.init_point,
			preapproval_id: preapproval.id,
		}), { status: 200 });
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Error desconocido';
		return new Response(JSON.stringify({ error: msg }), { status: 500 });
	}
};
