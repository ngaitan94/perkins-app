export function initLogout() {
	document.querySelectorAll('[data-auth="signout"]').forEach((el) => {
		el.addEventListener('click', async () => {
			const { getBrowserClient } = await import('./supabase-browser.js');
			const supabase = getBrowserClient();
			await supabase.auth.signOut();
			window.location.href = '/';
		});
	});
}
