import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.defaults({
	toggleActions: 'play none none none',
});

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
			const mask = document.createElement('span');
			mask.className = 'hero-title-mask';
			const inner = document.createElement('span');
			inner.className = 'hero-title-chunk';
			inner.innerHTML = part;
			mask.appendChild(inner);
			title.appendChild(mask);
			continue;
		}
		const words = part.trim().split(/\s+/);
		for (const word of words) {
			if (!word) continue;
			const mask = document.createElement('span');
			mask.className = 'hero-title-mask';
			const span = document.createElement('span');
			span.className = 'hero-title-word';
			span.textContent = word;
			mask.appendChild(span);
			title.appendChild(mask);
			title.appendChild(document.createTextNode(' '));
		}
	}
}

function setInitialStates(): void {
	gsap.set('.landing-header', { y: -20, autoAlpha: 0, filter: 'blur(6px)' });
	gsap.set('.landing-brand', { x: -14, autoAlpha: 0 });
	gsap.set('.landing-nav a, .landing-nav .btn, .landing-menu-btn', { y: -10, autoAlpha: 0 });
	gsap.set('.hero .section-phase', { y: 18, autoAlpha: 0, filter: 'blur(4px)' });
	gsap.set('.hero-badge', { scale: 0.88, autoAlpha: 0, filter: 'blur(4px)' });
	gsap.set('.hero-lead', { y: 28, autoAlpha: 0, filter: 'blur(8px)' });
	gsap.set('.hero-social', { y: 22, scale: 0.96, autoAlpha: 0 });
	gsap.set('.hero-title-mask', { autoAlpha: 0 });
	gsap.set('.hero-title-word, .hero-title-chunk', { yPercent: 115, rotateX: 32 });
	gsap.set('.hero-actions .btn', { y: 26, autoAlpha: 0, scale: 0.92 });
	gsap.set('.hero-stat', { y: 22, autoAlpha: 0 });
	gsap.set('.hero-panel', { autoAlpha: 0, scale: 0.96, filter: 'blur(10px)' });
	gsap.set('.hero-feed-item', { autoAlpha: 0, y: 18 });
	gsap.set('.hero-panel-footer', { autoAlpha: 0, y: 16 });
	gsap.set('[data-reveal], [data-reveal-item]', { autoAlpha: 0 });
	gsap.set('.pricing-card', { autoAlpha: 0, y: 36, scale: 0.95 });
}

function buildHeroTimeline(isMobile: boolean): gsap.core.Timeline {
	if (isMobile) {
		gsap.set('.hero-panel', { y: 36, x: 0 });
		gsap.set('.hero-feed-item', { y: 18, x: 0 });
	} else {
		gsap.set('.hero-panel', { x: 56, y: 0 });
		gsap.set('.hero-feed-item', { x: 24, y: 0 });
	}

	const tl = gsap.timeline({
		defaults: { ease: 'power3.out' },
		delay: 0.05,
	});

	tl.addLabel('boot', 0);

	tl.to('.landing-header', {
		y: 0,
		autoAlpha: 1,
		filter: 'blur(0px)',
		duration: 0.65,
		ease: 'power4.out',
		clearProps: 'filter',
	}, 'boot')
		.to('.landing-brand', { x: 0, autoAlpha: 1, duration: 0.4 }, 'boot+=0.18')
		.to('.landing-nav a, .landing-nav .btn, .landing-menu-btn', {
			y: 0,
			autoAlpha: 1,
			stagger: 0.05,
			duration: 0.35,
			clearProps: 'y',
		}, 'boot+=0.28');

	tl.addLabel('hook', '+=0.06');

	tl.to('.hero .section-phase', {
		y: 0,
		autoAlpha: 1,
		filter: 'blur(0px)',
		duration: 0.45,
		clearProps: 'filter,y',
	}, 'hook')
		.to('.hero-badge', {
			scale: 1,
			autoAlpha: 1,
			filter: 'blur(0px)',
			duration: 0.5,
			ease: 'back.out(1.7)',
			clearProps: 'filter',
		}, 'hook+=0.08')
		.to('.hero-title-mask', { autoAlpha: 1, duration: 0.01 }, 'hook+=0.14')
		.to('.hero-title-word, .hero-title-chunk', {
			yPercent: 0,
			rotateX: 0,
			stagger: { each: 0.04, from: 'start' },
			duration: 0.8,
			ease: 'power4.out',
			clearProps: 'transform',
		}, 'hook+=0.16');

	tl.addLabel('story', '-=0.42');

	tl.to('.hero-lead', {
		y: 0,
		autoAlpha: 1,
		filter: 'blur(0px)',
		duration: 0.6,
		clearProps: 'filter,y',
	}, 'story')
		.to('.hero-social', {
			y: 0,
			scale: 1,
			autoAlpha: 1,
			duration: 0.5,
			clearProps: 'transform,y',
		}, 'story+=0.1');

	tl.addLabel('cta', '+=0.04');

	tl.to('.hero-actions .btn', {
		y: 0,
		autoAlpha: 1,
		scale: 1,
		stagger: 0.08,
		duration: 0.48,
		ease: 'back.out(1.35)',
		clearProps: 'transform,y',
	}, 'cta')
		.to('.hero-stat', {
			y: 0,
			autoAlpha: 1,
			stagger: 0.06,
			duration: 0.42,
			clearProps: 'y',
		}, 'cta+=0.06');

	tl.addLabel('live', isMobile ? 'cta+=0.14' : 'cta+=0.04');

	tl.to('.hero-panel', {
		x: 0,
		y: 0,
		scale: 1,
		autoAlpha: 1,
		filter: 'blur(0px)',
		duration: 0.85,
		ease: 'power3.out',
		clearProps: 'filter,transform',
	}, 'live')
		.to('.hero-feed-item', {
			x: 0,
			y: 0,
			autoAlpha: 1,
			stagger: 0.09,
			duration: 0.45,
			clearProps: 'transform,y',
		}, 'live+=0.2')
		.to('.hero-panel-footer', {
			y: 0,
			autoAlpha: 1,
			duration: 0.38,
			clearProps: 'y',
		}, 'live+=0.42');

	return tl;
}

function buildSectionScrollTimeline(section: HTMLElement): void {
	const label = section.querySelector<HTMLElement>('.section-aida__label[data-reveal]');
	const header = section.querySelector<HTMLElement>('.section-header[data-reveal]');
	const headerLines = header
		? header.querySelectorAll<HTMLElement>('.section-title, .section-sub')
		: [];
	const standalone = Array.from(
		section.querySelectorAll<HTMLElement>('[data-reveal]:not(.section-header):not(.section-aida__label)'),
	).filter((el) => !el.closest('[data-reveal-stagger]'));
	const staggerContainers = section.querySelectorAll<HTMLElement>('[data-reveal-stagger]');
	const pricingRows = section.querySelectorAll<HTMLElement>('.pricing-row');

	if (!label && !headerLines.length && !standalone.length && !staggerContainers.length && !pricingRows.length) {
		return;
	}

	if (label) gsap.set(label, { y: 28, clipPath: 'inset(100% 0 0% 0)' });
	if (headerLines.length) gsap.set(headerLines, { y: 36, autoAlpha: 0 });
	standalone.forEach((el) => {
		const isVideo = el.classList.contains('how-it-works-video-wrap');
		gsap.set(el, { y: isVideo ? 56 : 44, scale: isVideo ? 0.96 : 0.97, autoAlpha: 0 });
	});
	staggerContainers.forEach((container) => {
		gsap.set(container.querySelectorAll('[data-reveal-item]'), { y: 52, autoAlpha: 0, scale: 0.94 });
	});

	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: section,
			start: 'top 82%',
			once: true,
			fastScrollEnd: 3000,
		},
		defaults: { ease: 'power3.out', duration: 0.65 },
	});

	tl.addLabel('enter', 0);

	if (label) {
		tl.to(label, {
			y: 0,
			autoAlpha: 1,
			clipPath: 'inset(0% 0 0% 0)',
			duration: 0.5,
			clearProps: 'clipPath,y',
		}, 'enter');
	}

	if (headerLines.length) {
		tl.to(headerLines, {
			y: 0,
			autoAlpha: 1,
			stagger: 0.09,
			duration: 0.6,
			clearProps: 'y',
		}, label ? 'enter+=0.14' : 'enter');
	}

	tl.addLabel('body', '+=0.08');

	standalone.forEach((el, i) => {
		const isVideo = el.classList.contains('how-it-works-video-wrap');
		tl.to(
			el,
			{
				y: 0,
				scale: 1,
				autoAlpha: 1,
				duration: isVideo ? 0.85 : 0.65,
				ease: isVideo ? 'power4.out' : 'power3.out',
				clearProps: 'transform,y',
			},
			i === 0 ? 'body' : 'body+=0.12',
		);
	});

	staggerContainers.forEach((container, index) => {
		const items = container.querySelectorAll<HTMLElement>('[data-reveal-item]');
		if (!items.length) return;

		tl.to(
			items,
			{
				y: 0,
				autoAlpha: 1,
				scale: 1,
				stagger: { amount: 0.38, from: 'start' },
				duration: 0.58,
				clearProps: 'transform,y',
			},
			index === 0 ? 'body+=0.06' : '-=0.24',
		);
	});

	pricingRows.forEach((row) => {
		const cards = row.querySelectorAll<HTMLElement>('.pricing-card');
		if (!cards.length) return;

		tl.to(
			cards,
			{
				y: 0,
				autoAlpha: 1,
				scale: 1,
				stagger: 0.1,
				duration: 0.58,
				ease: 'back.out(1.15)',
				clearProps: 'transform,y',
			},
			'body+=0.1',
		);
	});
}

function buildCtaTimeline(): void {
	const banner = document.querySelector<HTMLElement>('.cta-banner');
	if (!banner) return;

	const phase = banner.querySelector<HTMLElement>('.section-phase');
	const title = banner.querySelector<HTMLElement>('.cta-banner__title');
	const lead = banner.querySelector<HTMLElement>('.cta-banner__lead');
	const actions = banner.querySelectorAll<HTMLElement>('.cta-banner__actions .btn');
	const note = banner.querySelector<HTMLElement>('.cta-banner__note');

	gsap.set(banner, { y: 48, scale: 0.95, autoAlpha: 0 });
	if (phase) gsap.set(phase, { y: 20, autoAlpha: 0 });
	if (title) gsap.set(title, { y: 32, autoAlpha: 0 });
	if (lead) gsap.set(lead, { y: 28, autoAlpha: 0 });
	if (actions.length) gsap.set(actions, { y: 24, autoAlpha: 0, scale: 0.94 });
	if (note) gsap.set(note, { autoAlpha: 0 });

	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: banner,
			start: 'top 86%',
			once: true,
			fastScrollEnd: 3000,
		},
		defaults: { ease: 'power3.out' },
	});

	tl.addLabel('cta', 0);

	tl.to(banner, {
		y: 0,
		scale: 1,
		autoAlpha: 1,
		duration: 0.75,
		ease: 'power4.out',
		clearProps: 'transform,y',
	}, 'cta');

	if (phase) {
		tl.to(phase, { y: 0, autoAlpha: 1, duration: 0.45, clearProps: 'y' }, 'cta+=0.12');
	}

	const copy = [title, lead].filter(Boolean) as HTMLElement[];
	if (copy.length) {
		tl.to(copy, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.55, clearProps: 'y' }, 'cta+=0.2');
	}

	if (actions.length) {
		tl.to(
			actions,
			{
				y: 0,
				autoAlpha: 1,
				scale: 1,
				stagger: 0.07,
				duration: 0.48,
				ease: 'back.out(1.3)',
				clearProps: 'transform,y',
			},
			'cta+=0.34',
		);
	}

	if (note) {
		tl.to(note, { autoAlpha: 1, duration: 0.4 }, 'cta+=0.48');
	}
}

function buildFooterTimeline(): void {
	const footer = document.querySelector<HTMLElement>('.site-footer');
	if (!footer) return;

	const items = footer.querySelectorAll<HTMLElement>('[data-reveal-item]');
	if (!items.length) return;

	gsap.set(items, { y: 40, autoAlpha: 0 });

	gsap.timeline({
		scrollTrigger: {
			trigger: footer,
			start: 'top 92%',
			once: true,
		},
		defaults: { ease: 'power3.out' },
	}).to(items, {
		y: 0,
		autoAlpha: 1,
		stagger: { amount: 0.32, from: 'start' },
		duration: 0.55,
		clearProps: 'y',
	});
}

export function initLandingAnimations(): () => void {
	if (prefersReducedMotion()) {
		gsap.set('[data-animate], [data-reveal], [data-reveal-item], .cta-banner, .pricing-card', {
			clearProps: 'all',
		});
		return () => {};
	}

	splitHeroTitle();
	setInitialStates();

	const ctx = gsap.context(() => {
		const mm = gsap.matchMedia();

		mm.add('(max-width: 959px)', () => {
			buildHeroTimeline(true);
		});

		mm.add('(min-width: 960px)', () => {
			buildHeroTimeline(false);
		});

		gsap.to('.hero-orb', {
			y: '+=32',
			x: '+=14',
			scale: '+=0.05',
			duration: 6,
			ease: 'sine.inOut',
			repeat: -1,
			yoyo: true,
			stagger: { each: 1.1, from: 'random' },
		});

		document.querySelectorAll<HTMLElement>('.section, .section-pricing').forEach(buildSectionScrollTimeline);
		buildCtaTimeline();
		buildFooterTimeline();

		requestAnimationFrame(() => ScrollTrigger.refresh());
	});

	return () => ctx.revert();
}
