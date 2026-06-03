import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function splitHeroTitle(): void {
	const title = document.querySelector('.hero-title');
	if (!title || title.querySelector('.hero-title-word')) return;

	const html = title.innerHTML;
	const parts = html.split(/(<[^>]+>.*?<\/[^>]+>)/g).filter(Boolean);

	title.innerHTML = '';
	for (const part of parts) {
		if (part.startsWith('<')) {
			const wrapper = document.createElement('span');
			wrapper.className = 'hero-title-chunk';
			wrapper.style.display = 'inline-block';
			wrapper.innerHTML = part;
			title.appendChild(wrapper);
			continue;
		}
		const words = part.trim().split(/\s+/);
		for (const word of words) {
			if (!word) continue;
			const span = document.createElement('span');
			span.className = 'hero-title-word';
			span.style.display = 'inline-block';
			span.textContent = word;
			title.appendChild(span);
			title.appendChild(document.createTextNode(' '));
		}
	}
}

export function initLandingAnimations(): () => void {
	if (prefersReducedMotion()) {
		gsap.set('[data-animate], [data-reveal], [data-reveal-item]', { clearProps: 'all' });
		return () => {};
	}

	splitHeroTitle();

	const ctx = gsap.context(() => {
		const headerTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
		headerTl
			.from('.landing-header', {
				y: -24,
				autoAlpha: 0,
				filter: 'blur(8px)',
				duration: 0.7,
			})
			.from('.landing-brand', { x: -12, autoAlpha: 0, duration: 0.45 }, '-=0.4')
			.from('.landing-nav a, .landing-nav .btn, .landing-menu-btn', {
				y: -8,
				autoAlpha: 0,
				stagger: 0.06,
				duration: 0.35,
			}, '-=0.25');

		const heroTl = gsap.timeline({
			defaults: { ease: 'power4.out' },
			delay: 0.08,
		});

		heroTl.addLabel('intro', 0);

		heroTl
			.from('.hero .section-phase', {
				y: 16,
				autoAlpha: 0,
				filter: 'blur(6px)',
				duration: 0.5,
			}, 'intro')
			.from('.hero-badge', {
				scale: 0.85,
				autoAlpha: 0,
				filter: 'blur(4px)',
				duration: 0.55,
				ease: 'back.out(1.6)',
			}, 'intro+=0.12')
			.from('.hero-title-word, .hero-title-chunk', {
				y: '110%',
				autoAlpha: 0,
				rotateX: 28,
				transformOrigin: '50% 100%',
				stagger: { each: 0.045, from: 'start' },
				duration: 0.75,
				ease: 'power4.out',
			}, 'intro+=0.22')
			.from('.hero-lead', {
				y: 28,
				autoAlpha: 0,
				filter: 'blur(10px)',
				duration: 0.65,
			}, '-=0.35')
			.from('.hero-social', {
				scale: 0.96,
				autoAlpha: 0,
				y: 20,
				duration: 0.55,
				ease: 'power3.out',
			}, '-=0.3');

		heroTl.addLabel('actions', '-=0.1');

		heroTl
			.from('.hero-actions .btn', {
				y: 24,
				autoAlpha: 0,
				scale: 0.92,
				stagger: 0.09,
				duration: 0.5,
				ease: 'back.out(1.4)',
			}, 'actions')
			.from('.hero-stat', {
				y: 20,
				autoAlpha: 0,
				stagger: 0.07,
				duration: 0.45,
			}, 'actions+=0.08');

		heroTl.addLabel('panel', '-=0.05');

		const isMobile = window.matchMedia('(max-width: 959px)').matches;

		heroTl
			.from('.hero-panel', {
				y: isMobile ? 32 : 0,
				x: isMobile ? 0 : 48,
				scale: 0.94,
				autoAlpha: 0,
				filter: 'blur(12px)',
				duration: 0.9,
				ease: 'power3.out',
			}, 'panel')
			.from('.hero-feed-item', {
				x: isMobile ? 0 : 20,
				y: isMobile ? 16 : 0,
				autoAlpha: 0,
				stagger: 0.11,
				duration: 0.5,
				ease: 'power3.out',
			}, 'panel+=0.15')
			.from('.hero-panel-footer', {
				y: 14,
				autoAlpha: 0,
				duration: 0.4,
			}, '-=0.15');

		gsap.to('.hero-orb', {
			y: '+=28',
			x: '+=12',
			scale: '+=0.06',
			duration: 5,
			ease: 'sine.inOut',
			repeat: -1,
			yoyo: true,
			stagger: { each: 0.9, from: 'random' },
		});

		ScrollTrigger.batch('[data-reveal]', {
			start: 'top 90%',
			once: true,
			onEnter: (batch) => {
				const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
				tl.from(batch, {
					y: 56,
					autoAlpha: 0,
					filter: 'blur(8px)',
					stagger: 0.08,
					duration: 0.75,
					clearProps: 'filter',
				});
			},
		});

		gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((container) => {
			const items = container.querySelectorAll('[data-reveal-item]');
			if (!items.length) return;

			const sectionTl = gsap.timeline({
				scrollTrigger: {
					trigger: container,
					start: 'top 88%',
					toggleActions: 'play none none none',
				},
				defaults: { ease: 'power4.out' },
			});

			sectionTl.from(items, {
				y: 48,
				autoAlpha: 0,
				scale: 0.94,
				rotateX: 6,
				transformOrigin: '50% 100%',
				stagger: { each: 0.1, from: 'start' },
				duration: 0.65,
				clearProps: 'transform',
			});
		});

		gsap.utils.toArray<HTMLElement>('.pricing-row').forEach((row) => {
			const cards = row.querySelectorAll('.pricing-card');
			if (!cards.length) return;

			const pricingTl = gsap.timeline({
				scrollTrigger: {
					trigger: row,
					start: 'top 88%',
					toggleActions: 'play none none none',
				},
			});

			pricingTl.from(cards, {
				y: 40,
				autoAlpha: 0,
				scale: 0.92,
				stagger: 0.12,
				duration: 0.6,
				ease: 'back.out(1.2)',
				clearProps: 'transform,opacity',
			});
		});

		gsap.from('.cta-banner', {
			scrollTrigger: {
				trigger: '.cta-banner',
				start: 'top 88%',
				toggleActions: 'play none none none',
			},
			scale: 0.94,
			y: 40,
			autoAlpha: 0,
			filter: 'blur(10px)',
			duration: 0.85,
			ease: 'power4.out',
			clearProps: 'filter',
		});
	});

	return () => ctx.revert();
}
