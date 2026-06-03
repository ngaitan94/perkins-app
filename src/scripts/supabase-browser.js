import { createBrowserClient } from '@supabase/ssr';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

export function getBrowserClient() {
	if (typeof window === 'undefined') {
		throw new Error('getBrowserClient() solo en el navegador');
	}
	if (!client) {
		const url = import.meta.env.PUBLIC_SUPABASE_URL;
		const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
		if (!url || !key) throw new Error('Supabase no configurado');
		client = createBrowserClient(url, key);
	}
	return client;
}
