import { formatCLP } from '../lib/money-clp.js';
import { STATUS_LABELS } from '../lib/roles.js';

function renderItem(s) {
	return `
		<a href="/app/perkin/solicitudes/${s.id}" class="solicitud-item">
			<div class="solicitud-item__head">
				<div>
					<strong>${s.title}</strong>
					<p class="muted">${s.comuna} · ${s.categories?.name ?? ''}</p>
				</div>
				<span class="solicitud-item__amount">${formatCLP(s.amount_clp)}</span>
			</div>
			${s.visibility === 'premium_only' ? '<span class="badge badge-premium">Premium</span>' : ''}
		</a>
	`;
}

export async function initPerkinFeed() {
	const { getBrowserClient } = await import('./supabase-browser.js');
	const supabase = getBrowserClient();
	const feed = document.getElementById('perkin-feed');
	const empty = document.getElementById('perkin-empty');
	const assigned = document.getElementById('perkin-assigned');
	const filterForm = document.getElementById('filter-form');

	async function loadFeed() {
		const fd = new FormData(/** @type {HTMLFormElement} */ (filterForm));
		let query = supabase
			.from('solicitudes')
			.select('id, title, comuna, amount_clp, visibility, categories(name)')
			.eq('status', 'open')
			.order('published_at', { ascending: false });

		const comuna = String(fd.get('comuna') || '').trim();
		const minAmount = Number(fd.get('min_amount') || 0);
		if (comuna) query = query.ilike('comuna', `%${comuna}%`);
		if (minAmount > 0) query = query.gte('amount_clp', minAmount);

		const { data, error } = await query;
		if (error) {
			if (feed) feed.innerHTML = `<div class="alert error">${error.message}</div>`;
			return;
		}
		if (!data?.length) {
			if (feed) feed.innerHTML = '';
			if (empty) empty.hidden = false;
		} else {
			if (empty) empty.hidden = true;
			if (feed) feed.innerHTML = data.map(renderItem).join('');
		}
	}

	async function loadAssigned() {
		const { data: { user } } = await supabase.auth.getUser();
		const { data } = await supabase
			.from('solicitudes')
			.select('id, title, comuna, amount_clp, status, visibility, categories(name)')
			.eq('assigned_perkin_id', user.id)
			.in('status', ['assigned', 'in_progress'])
			.order('updated_at', { ascending: false });
		if (assigned) {
			assigned.innerHTML = data?.length
				? data.map((s) => `
					<a href="/app/solicitudes/${s.id}" class="solicitud-item">
						<strong>${s.title}</strong>
						<span class="badge badge-status">${STATUS_LABELS[s.status]}</span>
						<span class="solicitud-item__amount">${formatCLP(s.amount_clp)}</span>
					</a>
				`).join('')
				: '<p class="muted card">No tienes paletiadas activas. Revisa el feed pa hacer lucas.</p>';
		}
	}

	filterForm?.addEventListener('input', loadFeed);
	await loadFeed();
	await loadAssigned();
}
