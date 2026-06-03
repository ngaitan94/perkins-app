/** @param {string | null | undefined} raw @param {string} [fallback] */
export function getSafeInternalRedirectPath(raw, fallback = '/app/solicitudes') {
	if (typeof raw !== 'string') return fallback;
	const s = raw.trim();
	if (!s.startsWith('/') || s.startsWith('//')) return fallback;
	if (s.includes(':') || s.includes('\\')) return fallback;
	if (s.includes('?') || s.includes('#')) return fallback;
	if (!/^\/[a-zA-Z0-9/_-]*$/.test(s)) return fallback;
	return s || fallback;
}
