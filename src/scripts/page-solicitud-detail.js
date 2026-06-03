import { formatCLP } from '../lib/money-clp.js';
import { STATUS_LABELS } from '../lib/roles.js';

export async function initSolicitudDetail(solicitudId, isRequester) {
	const { getBrowserClient } = await import('./supabase-browser.js');
	const supabase = getBrowserClient();
	const actions = document.getElementById('solicitud-actions');
	const chatBox = document.getElementById('chat-box');
	const chatForm = document.getElementById('chat-form');
	const reviewSection = document.getElementById('review-section');
	const reviewForm = document.getElementById('review-form');

	const params = new URLSearchParams(window.location.search);
	if (params.get('paid') === 'demo') {
		const banner = document.createElement('div');
		banner.className = 'alert success';
		banner.textContent = 'Pago demo listo. Tu paletiada ya está publicada — esperando al Perkin que la traiga.';
		actions?.prepend(banner);
	}

	async function renderActions() {
		const { data: s } = await supabase.from('solicitudes').select('status, assigned_perkin_id').eq('id', solicitudId).single();
		if (!actions || !s) return;
		let html = '';

		if (isRequester && s.status === 'in_progress') {
			html += `<button type="button" class="btn btn-primary" id="btn-confirm">¿Pegó la misión? Liberar lucas</button>`;
			html += `<button type="button" class="btn btn-danger btn-sm" id="btn-dispute">Reportar problema</button>`;
		}
		if (isRequester && s.status === 'completed') {
			if (reviewSection) reviewSection.hidden = false;
		}
		actions.innerHTML = html;

		document.getElementById('btn-confirm')?.addEventListener('click', async () => {
			await supabase.from('solicitudes').update({ status: 'completed' }).eq('id', solicitudId);
			await supabase.from('payments').update({ status: 'released' }).eq('solicitud_id', solicitudId);
			location.reload();
		});
		document.getElementById('btn-dispute')?.addEventListener('click', async () => {
			await supabase.from('solicitudes').update({ status: 'disputed' }).eq('id', solicitudId);
			location.reload();
		});
	}

	async function loadMessages() {
		const { data } = await supabase
			.from('solicitud_messages')
			.select('id, sender_id, body, created_at')
			.eq('solicitud_id', solicitudId)
			.order('created_at');
		const { data: { user } } = await supabase.auth.getUser();
		if (!chatBox) return;
		chatBox.innerHTML = (data ?? []).map((m) => `
			<div class="chat-msg ${m.sender_id === user?.id ? 'chat-msg--mine' : 'chat-msg--theirs'}">
				${m.body}
			</div>
		`).join('') || '<p class="muted">Sin mensajes aún.</p>';
		chatBox.scrollTop = chatBox.scrollHeight;
	}

	chatForm?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const fd = new FormData(/** @type {HTMLFormElement} */ (e.target));
		const body = String(fd.get('body') || '').trim();
		if (!body) return;
		const { data: { user } } = await supabase.auth.getUser();
		await supabase.from('solicitud_messages').insert({ solicitud_id: solicitudId, sender_id: user.id, body });
		/** @type {HTMLFormElement} */ (e.target).reset();
		loadMessages();
	});

	reviewForm?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const fd = new FormData(/** @type {HTMLFormElement} */ (e.target));
		const { data: s } = await supabase.from('solicitudes').select('assigned_perkin_id').eq('id', solicitudId).single();
		const { data: { user } } = await supabase.auth.getUser();
		await supabase.from('reviews').insert({
			solicitud_id: solicitudId,
			reviewer_id: user.id,
			reviewee_id: s.assigned_perkin_id,
			rating: Number(fd.get('rating')),
			comment: String(fd.get('comment') || ''),
		});
		if (reviewSection) reviewSection.innerHTML = '<div class="alert success">Listo — actualizaste su ficha. Si pegó la misión, sube; si no, baja. Gracias, vioh.</div>';
	});

	supabase.channel(`chat-${solicitudId}`)
		.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solicitud_messages', filter: `solicitud_id=eq.${solicitudId}` }, loadMessages)
		.subscribe();

	await renderActions();
	await loadMessages();
}
