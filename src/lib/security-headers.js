/**
 * @param {Response} response
 * @param {string} supabaseUrl project URL for connect-src (may be empty)
 */
export function applySecurityHeaders(response, supabaseUrl) {
	const headers = buildSecurityHeaders(supabaseUrl);
	for (const [key, value] of Object.entries(headers)) {
		response.headers.set(key, value);
	}
	return response;
}

/** @param {string} supabaseUrl */
function buildSecurityHeaders(supabaseUrl) {
	let origin = '';
	try {
		if (supabaseUrl?.trim()) origin = new URL(supabaseUrl.trim()).origin;
	} catch {
		/* ignore */
	}
	const connectSrc = origin
		? `'self' ${origin} https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://www.mercadopago.cl`
		: `'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://www.mercadopago.cl`;

	const csp = [
		"default-src 'self'",
		"base-uri 'self'",
		"frame-ancestors 'none'",
		"form-action 'self' https://www.mercadopago.cl",
		"img-src 'self' data: https:",
		"font-src 'self'",
		"style-src 'self' 'unsafe-inline'",
		"script-src 'self' 'unsafe-inline'",
		"frame-src https://www.mercadopago.cl https://www.mercadolibre.cl",
		`connect-src ${connectSrc}`,
	].join('; ');

	return {
		'Content-Security-Policy': csp,
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	};
}
