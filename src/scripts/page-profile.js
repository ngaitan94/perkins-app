export async function initProfilePage() {
	const form = document.getElementById('profile-form');
	const msg = document.getElementById('profile-msg');

	form?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const fd = new FormData(/** @type {HTMLFormElement} */ (e.target));
		const { getBrowserClient } = await import('./supabase-browser.js');
		const supabase = getBrowserClient();
		const { data: { user } } = await supabase.auth.getUser();
		const { error } = await supabase.from('profiles').update({
			display_name: String(fd.get('display_name')).trim(),
			phone: String(fd.get('phone')).trim(),
			comuna: String(fd.get('comuna')),
		}).eq('id', user.id);
		if (error) { alert(error.message); return; }
		if (msg) { msg.textContent = 'Perfil actualizado. Sigue sumando ficha.'; msg.hidden = false; }
	});
}
