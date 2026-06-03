export const colors = {
	bg: '#060a12',
	bgSoft: '#0f1628',
	bgElevated: '#141c30',
	text: '#f8fafc',
	muted: 'rgba(248, 250, 252, 0.65)',
	accent: '#10b981',
	accentDim: '#059669',
	accentGlow: 'rgba(16, 185, 129, 0.45)',
	accent2: '#818cf8',
	border: 'rgba(255, 255, 255, 0.1)',
} as const;

export const FPS = 30;
export const DURATION_FRAMES = 450;
export const INTRO_FRAMES = 50;
export const STEP_FRAMES = 120;
export const OUTRO_FRAMES =
	DURATION_FRAMES - INTRO_FRAMES - STEP_FRAMES * 3;
