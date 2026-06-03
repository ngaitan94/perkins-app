import type { APIRoute } from 'astro';
import { handlePaymentWebhook } from '../../../lib/mp-server';

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		await handlePaymentWebhook(body);
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch {
		return new Response(JSON.stringify({ error: 'Webhook error' }), { status: 500 });
	}
};

export const GET: APIRoute = async () => {
	return new Response(JSON.stringify({ status: 'mp webhook active' }), { status: 200 });
};
