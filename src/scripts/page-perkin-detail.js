export async function initPerkinDetail(solicitudId) {
	const actions = document.getElementById('perkin-actions');
	if (!actions) return;

	const status = actions.dataset.status;
	const mpConnected = actions.dataset.mpConnected === 'true';
	const { getBrowserClient } = await import('./supabase-browser.js');
	const supabase = getBrowserClient();

	if (status === 'open') {
		if (!mpConnected) {
			actions.innerHTML = `
				<div class="alert info">Conecta Mercado Pago en tu perfil pa agarrar paletiadas y cobrar lucas.</div>
				<a href="/app/perfil?onboard=mp" class="btn btn-primary">Conectar Mercado Pago</a>
			`;
			return;
		}
		actions.innerHTML = `<button type="button" class="btn btn-primary" id="btn-accept">Me pego la misión</button>`;
		document.getElementById('btn-accept')?.addEventListener('click', async () => {
			const { data: { user } } = await supabase.auth.getUser();
			const { error } = await supabase
				.from('solicitudes')
				.update({ status: 'assigned', assigned_perkin_id: user.id })
				.eq('id', solicitudId)
				.eq('status', 'open');
			if (error) { alert(error.message); return; }
			await supabase.from('solicitudes').update({ status: 'in_progress' }).eq('id', solicitudId);
			await supabase.from('payments').update({ payee_id: user.id }).eq('solicitud_id', solicitudId);
			window.location.href = `/app/solicitudes/${solicitudId}`;
		});
	} else {
		actions.innerHTML = `<a href="/app/solicitudes/${solicitudId}" class="btn btn-primary">Ver detalle y chat</a>`;
	}
}
