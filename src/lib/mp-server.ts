import { createClient } from '@supabase/supabase-js';

export function getServiceClient() {
	const url = import.meta.env.PUBLIC_SUPABASE_URL;
	const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) return null;
	return createClient(url, key);
}

export function isDemoMode(): boolean {
	return !import.meta.env.MP_ACCESS_TOKEN || import.meta.env.MP_ACCESS_TOKEN === 'your-marketplace-access-token';
}

export function getAppUrl(): string {
	return import.meta.env.PUBLIC_APP_URL || 'http://localhost:4321';
}

export function getFeePercent(): number {
	const n = Number.parseInt(String(import.meta.env.PLATFORM_FEE_PERCENT ?? '12'), 10);
	return Number.isFinite(n) ? n : 12;
}

interface PreferencePayload {
	solicitud_id: string;
	title: string;
	total_clp: number;
	marketplace_fee_clp: number;
	seller_access_token?: string | null;
}

export async function createCheckoutPreference(payload: PreferencePayload) {
	if (isDemoMode()) {
		return { demo_mode: true, id: `demo-${payload.solicitud_id}` };
	}

	const accessToken = import.meta.env.MP_ACCESS_TOKEN;
	const appUrl = getAppUrl();

	const body: Record<string, unknown> = {
		items: [{
			title: payload.title,
			quantity: 1,
			unit_price: payload.total_clp,
			currency_id: 'CLP',
		}],
		external_reference: payload.solicitud_id,
		back_urls: {
			success: `${appUrl}/app/solicitudes/${payload.solicitud_id}?paid=1`,
			failure: `${appUrl}/app/solicitudes/nueva?error=payment`,
			pending: `${appUrl}/app/solicitudes/${payload.solicitud_id}?paid=pending`,
		},
		auto_return: 'approved',
		notification_url: `${appUrl}/api/mp/webhook`,
		marketplace_fee: payload.marketplace_fee_clp,
	};

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${payload.seller_access_token || accessToken}`,
	};

	const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Mercado Pago error: ${err}`);
	}

	return res.json();
}

export async function createSubscriptionPreapproval(params: {
	plan_slug: string;
	plan_name: string;
	price_clp: number;
	payer_email: string;
	user_id: string;
}) {
	if (isDemoMode()) {
		return { demo_mode: true, id: `demo-sub-${params.plan_slug}` };
	}

	const accessToken = import.meta.env.MP_ACCESS_TOKEN;
	const appUrl = getAppUrl();

	const body = {
		reason: params.plan_name,
		external_reference: `${params.user_id}:${params.plan_slug}`,
		payer_email: params.payer_email,
		auto_recurring: {
			frequency: 1,
			frequency_type: 'months',
			transaction_amount: params.price_clp,
			currency_id: 'CLP',
		},
		back_url: `${appUrl}/precios?subscribed=1`,
		status: 'pending',
	};

	const res = await fetch('https://api.mercadopago.com/preapproval', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Mercado Pago subscription error: ${err}`);
	}

	return res.json();
}

export function getOAuthUrl(state: string): string {
	const clientId = import.meta.env.MP_CLIENT_ID;
	const redirectUri = `${getAppUrl()}/api/mp/oauth/callback`;
	return `https://auth.mercadopago.cl/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function exchangeOAuthCode(code: string) {
	const res = await fetch('https://api.mercadopago.com/oauth/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id: import.meta.env.MP_CLIENT_ID,
			client_secret: import.meta.env.MP_CLIENT_SECRET,
			grant_type: 'authorization_code',
			code,
			redirect_uri: `${getAppUrl()}/api/mp/oauth/callback`,
		}),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

export async function handlePaymentWebhook(data: { type?: string; data?: { id?: string } }) {
	const service = getServiceClient();
	if (!service) return;

	if (data.type === 'payment' && data.data?.id) {
		const paymentId = data.data.id;
		const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
			headers: { Authorization: `Bearer ${import.meta.env.MP_ACCESS_TOKEN}` },
		});
		if (!mpRes.ok) return;
		const payment = await mpRes.json();
		const solicitudId = payment.external_reference;
		if (!solicitudId) return;

		if (payment.status === 'approved') {
			await service.from('payments').upsert({
				solicitud_id: solicitudId,
				payer_id: payment.metadata?.payer_id,
				mp_payment_id: String(paymentId),
				mp_preference_id: payment.order?.id ? String(payment.order.id) : null,
				amount_clp: Math.round(payment.transaction_amount),
				marketplace_fee_clp: Math.round(payment.application_fee || 0),
				status: 'approved',
			}, { onConflict: 'solicitud_id' });

			await service.from('solicitudes').update({
				status: 'open',
				published_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
			}).eq('id', solicitudId);
		}
	}

	if (data.type === 'subscription_preapproval' && data.data?.id) {
		const preapprovalId = data.data.id;
		const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
			headers: { Authorization: `Bearer ${import.meta.env.MP_ACCESS_TOKEN}` },
		});
		if (!mpRes.ok) return;
		const sub = await mpRes.json();
		const [userId, planSlug] = (sub.external_reference || ':').split(':');
		if (!userId || !planSlug) return;

		const { data: plan } = await service.from('subscription_plans').select('id, target_role').eq('slug', planSlug).single();
		if (!plan) return;

		const tier = plan.target_role === 'perkin' ? 'premium_perkin' : 'premium_requester';

		if (sub.status === 'authorized') {
			await service.from('user_subscriptions').upsert({
				user_id: userId,
				plan_id: plan.id,
				status: 'active',
				mp_preapproval_id: preapprovalId,
				current_period_end: sub.next_payment_date,
			});
			await service.from('profiles').update({ subscription_tier: tier }).eq('id', userId);
		}
	}
}
