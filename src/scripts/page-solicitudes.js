import { formatCLP } from '../lib/money-clp.js';
import { STATUS_LABELS } from '../lib/roles.js';

/** @param {string} status */
function statusBadge(status) {
	const label = STATUS_LABELS[status] ?? status;
	return `<span class="badge badge-status">${label}</span>`;
}

export async function initSolicitudesList() {
	const { getBrowserClient } = await import('./supabase-browser.js');
	const supabase = getBrowserClient();
	const list = document.getElementById('solicitudes-list');
	const empty = document.getElementById('solicitudes-empty');

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;

	const { data, error } = await supabase
		.from('solicitudes')
		.select('id, title, comuna, amount_clp, status, visibility, created_at')
		.eq('requester_id', user.id)
		.order('created_at', { ascending: false });

	if (error) {
		if (list) list.innerHTML = `<div class="alert error">${error.message}</div>`;
		return;
	}

	if (!data?.length) {
		if (empty) empty.hidden = false;
		return;
	}

	if (list) {
		list.innerHTML = data.map((s) => `
			<a href="/app/solicitudes/${s.id}" class="solicitud-item">
				<div class="solicitud-item__head">
					<div>
						<strong>${s.title}</strong>
						<p class="muted">${s.comuna} · ${new Date(s.created_at).toLocaleDateString('es-CL')}</p>
					</div>
					<span class="solicitud-item__amount">${formatCLP(s.amount_clp)}</span>
				</div>
				${statusBadge(s.status)}
				${s.visibility === 'premium_only' ? ' <span class="badge badge-premium">Premium</span>' : ''}
			</a>
		`).join('');
	}
}
