import { gsap } from 'gsap';

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initAppAnimations(): () => void {
	if (prefersReducedMotion()) return () => {};

	const ctx = gsap.context(() => {
		gsap.from('.app-header', { y: -12, autoAlpha: 0, duration: 0.45, ease: 'power2.out' });
		gsap.from('.app-main .card, .app-main .solicitud-item, .app-main .kpi', {
			y: 20,
			autoAlpha: 0,
			duration: 0.5,
			stagger: 0.06,
			ease: 'power2.out',
			delay: 0.08,
		});
	});

	return () => ctx.revert();
}
