import { formatCLP } from '../lib/money-clp.js';

export async function initSubscriptionPage() {
	const container = document.getElementById('subscription-plans');
	if (!container) return;

	const { getBrowserClient } = await import('./supabase-browser.js');
	const supabase = getBrowserClient();
	const { data: { user } } = await supabase.auth.getUser();
	const { data: profile } = await supabase.from('profiles').select('roles, subscription_tier').eq('id', user.id).single();

	const { data: plans } = await supabase
		.from('subscription_plans')
		.select('*')
		.eq('active', true)
		.order('price_clp');

	const relevant = (plans ?? []).filter((p) => {
		if (p.target_role === 'requester') return profile?.roles?.includes('requester');
		if (p.target_role === 'perkin') return profile?.roles?.includes('perkin');
		return false;
	});

	container.innerHTML = relevant.map((plan) => {
		const benefits = Array.isArray(plan.benefits) ? plan.benefits : JSON.parse(plan.benefits || '[]');
		const isActive = profile?.subscription_tier === `premium_${plan.target_role}`;
		return `
			<div class="pricing-card ${isActive ? 'featured' : ''}" style="margin-bottom:1rem;">
				<h3>${plan.name}</h3>
				<p class="pricing-price">${formatCLP(plan.price_clp)}<span class="muted">/mes</span></p>
				<ul class="pricing-features">${benefits.map((b) => `<li>${b}</li>`).join('')}</ul>
				${isActive
					? '<span class="badge badge-premium">Plan activo</span>'
					: `<button type="button" class="btn btn-primary btn-sm" data-plan="${plan.slug}">Suscribirse</button>`}
			</div>
		`;
	}).join('');

	container.querySelectorAll('[data-plan]').forEach((btn) => {
		btn.addEventListener('click', async () => {
			const planSlug = btn.getAttribute('data-plan');
			const res = await fetch('/api/mp/subscription/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ plan_slug: planSlug }),
			});
			const data = await res.json();
			if (data.init_point) window.location.href = data.init_point;
			else if (data.demo_mode) {
				alert('Modo demo: suscripción activada localmente.');
				location.reload();
			} else alert(data.error || 'Error al crear suscripción');
		});
	});
}
