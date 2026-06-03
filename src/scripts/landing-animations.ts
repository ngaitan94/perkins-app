import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initLandingAnimations(): () => void {
	if (prefersReducedMotion()) {
		gsap.set('[data-animate], [data-reveal], [data-reveal-item]', { clearProps: 'all' });
		return () => {};
	}

	const ctx = gsap.context(() => {
		gsap.from('.landing-header', {
			y: -16,
			autoAlpha: 0,
			duration: 0.55,
			ease: 'power3.out',
		});

		const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
		heroTl
			.from('.hero-badge', { y: 20, autoAlpha: 0, duration: 0.5 })
			.from('.hero-title', { y: 36, autoAlpha: 0, duration: 0.7 }, '-=0.28')
			.from('.hero-lead', { y: 24, autoAlpha: 0, duration: 0.55 }, '-=0.38')
			.from('.hero-social', { y: 20, autoAlpha: 0, duration: 0.5 }, '-=0.35')
			.from('.hero-actions .btn', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.45 }, '-=0.28')
			.from('.hero-stat', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.45 }, '-=0.32')
			.from('.hero-panel', { x: 40, autoAlpha: 0, duration: 0.85, ease: 'power2.out' }, '-=0.55')
			.from('.hero-feed-item', { x: 16, autoAlpha: 0, stagger: 0.1, duration: 0.45 }, '-=0.5')
			.from('.hero-panel-footer', { y: 12, autoAlpha: 0, duration: 0.4 }, '-=0.2');

		gsap.to('.hero-orb', {
			y: '+=22',
			x: '+=8',
			duration: 4.2,
			ease: 'sine.inOut',
			repeat: -1,
			yoyo: true,
			stagger: { each: 0.75, from: 'random' },
		});

		gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
			gsap.from(el, {
				y: 48,
				autoAlpha: 0,
				duration: 0.75,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: el,
					start: 'top 88%',
					toggleActions: 'play none none none',
				},
			});
		});

		gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((container) => {
			const items = container.querySelectorAll('[data-reveal-item]');
			if (!items.length) return;
			gsap.from(items, {
				y: 36,
				autoAlpha: 0,
				duration: 0.6,
				stagger: 0.12,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: container,
					start: 'top 86%',
					toggleActions: 'play none none none',
				},
			});
		});

		gsap.utils.toArray<HTMLElement>('.pricing-row').forEach((row) => {
			const cards = row.querySelectorAll('.pricing-card');
			if (!cards.length) return;
			gsap.from(cards, {
				y: 28,
				duration: 0.55,
				stagger: 0.1,
				ease: 'power3.out',
				clearProps: 'transform',
				scrollTrigger: {
					trigger: row,
					start: 'top 88%',
					toggleActions: 'play none none none',
				},
			});
		});
	});

	return () => ctx.revert();
}
