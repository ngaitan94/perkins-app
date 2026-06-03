import { calcPlatformFee, calcTotal, formatCLP } from '../lib/money-clp.js';

export function initCreateSolicitud(feePercent = 12) {
	const form = document.getElementById('create-form');
	const err = document.getElementById('create-error');
	const preview = document.getElementById('fee-preview');
	const amountInput = form?.querySelector('[name="amount_clp"]');

	function updatePreview() {
		const amount = Number(amountInput?.value || 0);
		if (amount > 0 && preview) {
			const fee = calcPlatformFee(amount, feePercent);
			preview.textContent = `Comisión plataforma (${feePercent}%): ${formatCLP(fee)} · Total a pagar: ${formatCLP(calcTotal(amount, feePercent))}`;
		}
	}

	amountInput?.addEventListener('input', updatePreview);
	updatePreview();

	form?.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (err) err.hidden = true;

		const fd = new FormData(/** @type {HTMLFormElement} */ (e.target));
		const amount = Number(fd.get('amount_clp'));
		const platformFee = calcPlatformFee(amount, feePercent);
		const total = calcTotal(amount, feePercent);
		const premiumOnly = fd.get('premium_only') === 'on';

		const { getBrowserClient } = await import('./supabase-browser.js');
		const supabase = getBrowserClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;

		const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
		if (premiumOnly && profile?.subscription_tier !== 'premium_requester') {
			if (err) { err.textContent = 'Necesitas Vioh Premium pa paletiadas solo para Perkins con más ficha.'; err.hidden = false; }
			return;
		}

		const deadline = fd.get('deadline_at') ? String(fd.get('deadline_at')) : null;

		const { data: solicitud, error: insertErr } = await supabase
			.from('solicitudes')
			.insert({
				requester_id: user.id,
				category_id: String(fd.get('category_id')),
				title: String(fd.get('title')).trim(),
				description: String(fd.get('description')).trim(),
				address_text: String(fd.get('address_text') || '').trim() || null,
				comuna: String(fd.get('comuna')),
				amount_clp: amount,
				platform_fee_clp: platformFee,
				total_clp: total,
				visibility: premiumOnly ? 'premium_only' : 'standard',
				status: 'draft',
				deadline_at: deadline ? new Date(deadline).toISOString() : null,
			})
			.select('id')
			.single();

		if (insertErr) {
			if (err) { err.textContent = insertErr.message; err.hidden = false; }
			return;
		}

		const payRes = await fetch('/api/mp/create-preference', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ solicitud_id: solicitud.id }),
		});
		const payData = await payRes.json();

		if (!payRes.ok) {
			if (err) { err.textContent = payData.error || 'Error al crear pago'; err.hidden = false; }
			return;
		}

		if (payData.init_point) {
			window.location.href = payData.init_point;
		} else if (payData.demo_mode) {
			window.location.href = `/app/solicitudes/${solicitud.id}?paid=demo`;
		}
	});
}
