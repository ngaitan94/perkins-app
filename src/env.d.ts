/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly PUBLIC_SUPABASE_URL: string;
	readonly PUBLIC_SUPABASE_ANON_KEY: string;
	readonly PUBLIC_APP_URL: string;
	readonly MP_PUBLIC_KEY: string;
	readonly PLATFORM_FEE_PERCENT: string;
	readonly SUPABASE_SERVICE_ROLE_KEY: string;
	readonly MP_ACCESS_TOKEN: string;
	readonly MP_CLIENT_ID: string;
	readonly MP_CLIENT_SECRET: string;
	readonly MP_WEBHOOK_SECRET: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace App {
	interface Locals {
		supabase: import('@supabase/supabase-js').SupabaseClient;
		user: import('@supabase/supabase-js').User | null;
		profile: import('@/lib/types').Profile | null;
	}
}
