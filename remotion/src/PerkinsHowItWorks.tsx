import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';
import {
	AbsoluteFill,
	Sequence,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {
	INTRO_FRAMES,
	OUTRO_FRAMES,
	STEP_FRAMES,
	colors,
} from './theme';

const { fontFamily } = loadFont('normal', {
	weights: ['400', '600', '700', '800'],
	subsets: ['latin'],
});

const STEPS = [
	{
		num: '1',
		title: 'Publica el favor',
		body: 'Cuenta qué necesitas, tu comuna y cuántas lucas ofreces en CLP.',
		mockTitle: 'Arreglar persiana',
		mockMeta: 'Ñuñoa · $18.000',
		icon: '📋',
	},
	{
		num: '2',
		title: 'Perkin que trae',
		body: '¿Te pegai la misión? Un Perkin con buena ficha se pone la capa y trae la paletiada.',
		mockTitle: 'María aceptó tu favor',
		mockMeta: 'Ficha 4.9 · 12 favores',
		icon: '🤝',
	},
	{
		num: '3',
		title: 'Lucas seguras',
		body: 'Mercado Pago retiene el pago hasta que confirmas. Todos juegan limpio.',
		mockTitle: 'Pago retenido',
		mockMeta: 'Liberado al confirmar ✓',
		icon: '🔒',
	},
] as const;

const Background: React.FC = () => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse 80% 60% at 70% 20%, ${colors.accentGlow} 0%, transparent 55%),
        radial-gradient(ellipse 50% 40% at 10% 80%, rgba(129, 140, 248, 0.15) 0%, transparent 50%),
        linear-gradient(165deg, ${colors.bg} 0%, ${colors.bgSoft} 50%, ${colors.bg} 100%)`,
		}}
	/>
);

const BrandBar: React.FC<{ opacity: number }> = ({ opacity }) => (
	<div
		style={{
			position: 'absolute',
			top: 48,
			left: 72,
			right: 72,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			opacity,
			fontFamily,
		}}
	>
		<span
			style={{
				fontSize: 28,
				fontWeight: 800,
				color: colors.text,
				letterSpacing: '-0.03em',
			}}
		>
			Perkins
		</span>
		<span
			style={{
				fontSize: 14,
				fontWeight: 600,
				color: colors.muted,
				textTransform: 'uppercase',
				letterSpacing: '0.08em',
			}}
		>
			Cómo funciona
		</span>
	</div>
);

const Intro: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const enter = spring({ frame, fps, config: { damping: 200 } });
	const titleY = interpolate(enter, [0, 1], [40, 0]);

	return (
		<AbsoluteFill style={{ fontFamily }}>
			<BrandBar opacity={interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })} />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0 80px',
					opacity: enter,
					transform: `translateY(${titleY}px)`,
				}}
			>
				<p
					style={{
						margin: '0 0 16px',
						fontSize: 16,
						fontWeight: 700,
						color: colors.accent,
						textTransform: 'uppercase',
						letterSpacing: '0.1em',
					}}
				>
					Paletiadas entre viohs
				</p>
				<h1
					style={{
						margin: 0,
						fontSize: 56,
						fontWeight: 800,
						color: colors.text,
						textAlign: 'center',
						letterSpacing: '-0.04em',
						lineHeight: 1.1,
						maxWidth: 900,
					}}
				>
					Tres pasos, cero enredos
				</h1>
				<p
					style={{
						margin: '24px 0 0',
						fontSize: 22,
						color: colors.muted,
						textAlign: 'center',
						maxWidth: 640,
						lineHeight: 1.5,
					}}
				>
					Vioh que pide, Perkin que trae — las lucas quedan retenidas hasta que
					confirmas que llegó la paletiada.
				</p>
			</div>
		</AbsoluteFill>
	);
};

const StepSlide: React.FC<(typeof STEPS)[number] & { index: number }> = ({
	num,
	title,
	body,
	mockTitle,
	mockMeta,
	icon,
	index,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const enter = spring({ frame, fps, config: { damping: 180 } });
	const cardX = interpolate(enter, [0, 1], [60, 0]);
	const mockScale = spring({
		frame: frame - 15,
		fps,
		config: { damping: 200 },
	});

	return (
		<AbsoluteFill style={{ fontFamily }}>
			<BrandBar opacity={1} />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 64,
					padding: '120px 72px 72px',
				}}
			>
				<div
					style={{
						flex: '0 0 48%',
						opacity: enter,
						transform: `translateX(${-cardX}px)`,
					}}
				>
					<span
						style={{
							display: 'inline-flex',
							width: 48,
							height: 48,
							alignItems: 'center',
							justifyContent: 'center',
							background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDim})`,
							color: '#fff',
							borderRadius: 999,
							fontWeight: 800,
							fontSize: 20,
							marginBottom: 24,
						}}
					>
						{num}
					</span>
					<h2
						style={{
							margin: '0 0 16px',
							fontSize: 44,
							fontWeight: 800,
							color: colors.text,
							letterSpacing: '-0.03em',
						}}
					>
						{title}
					</h2>
					<p
						style={{
							margin: 0,
							fontSize: 20,
							color: colors.muted,
							lineHeight: 1.55,
							maxWidth: 420,
						}}
					>
						{body}
					</p>
					<div
						style={{
							marginTop: 32,
							display: 'flex',
							gap: 8,
						}}
					>
						{STEPS.map((_, i) => (
							<div
								key={i}
								style={{
									width: i === index ? 32 : 8,
									height: 8,
									borderRadius: 999,
									background:
										i === index ? colors.accent : 'rgba(255,255,255,0.2)',
									transition: 'width 0.2s',
								}}
							/>
						))}
					</div>
				</div>

				<div
					style={{
						flex: '0 0 42%',
						opacity: mockScale,
						transform: `scale(${interpolate(mockScale, [0, 1], [0.92, 1])})`,
					}}
				>
					<div
						style={{
							background: 'rgba(255, 255, 255, 0.06)',
							border: `1px solid ${colors.border}`,
							borderRadius: 20,
							padding: 28,
							backdropFilter: 'blur(20px)',
							boxShadow: '0 32px 64px rgba(6, 10, 18, 0.35)',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 12,
								marginBottom: 20,
								paddingBottom: 20,
								borderBottom: `1px solid ${colors.border}`,
							}}
						>
							<span style={{ fontSize: 32 }}>{icon}</span>
							<span
								style={{
									fontSize: 13,
									fontWeight: 700,
									color: colors.muted,
									textTransform: 'uppercase',
									letterSpacing: '0.06em',
								}}
							>
								Perkins · app
							</span>
						</div>
						<p
							style={{
								margin: '0 0 8px',
								fontSize: 22,
								fontWeight: 700,
								color: colors.text,
							}}
						>
							{mockTitle}
						</p>
						<p
							style={{
								margin: 0,
								fontSize: 18,
								fontWeight: 700,
								color: colors.accent,
							}}
						>
							{mockMeta}
						</p>
						{index === 2 && (
							<div
								style={{
									marginTop: 20,
									padding: '12px 16px',
									background: 'rgba(16, 185, 129, 0.12)',
									borderRadius: 12,
									border: `1px solid rgba(16, 185, 129, 0.35)`,
									fontSize: 14,
									color: colors.text,
									fontWeight: 600,
								}}
							>
								Mercado Pago Split · modo demo sin credenciales
							</div>
						)}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const Outro: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const enter = spring({ frame, fps, config: { damping: 200 } });

	return (
		<AbsoluteFill
			style={{
				fontFamily,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				opacity: enter,
			}}
		>
			<p
				style={{
					margin: '0 0 12px',
					fontSize: 20,
					color: colors.muted,
				}}
			>
				Hecho en Chile 🇨🇱
			</p>
			<h2
				style={{
					margin: 0,
					fontSize: 40,
					fontWeight: 800,
					color: colors.text,
					letterSpacing: '-0.03em',
				}}
			>
				perkins.cl
			</h2>
			<div
				style={{
					marginTop: 28,
					padding: '14px 32px',
					background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDim})`,
					borderRadius: 999,
					color: '#fff',
					fontWeight: 700,
					fontSize: 18,
					boxShadow: `0 10px 28px ${colors.accentGlow}`,
				}}
			>
				Registrarse gratis
			</div>
		</AbsoluteFill>
	);
};

export const PerkinsHowItWorks: React.FC = () => {
	return (
		<AbsoluteFill>
			<Background />
			<Sequence durationInFrames={INTRO_FRAMES}>
				<Intro />
			</Sequence>
			{STEPS.map((step, i) => (
				<Sequence
					key={step.num}
					from={INTRO_FRAMES + i * STEP_FRAMES}
					durationInFrames={STEP_FRAMES}
				>
					<StepSlide {...step} index={i} />
				</Sequence>
			))}
			<Sequence
				from={INTRO_FRAMES + STEPS.length * STEP_FRAMES}
				durationInFrames={OUTRO_FRAMES}
			>
				<Outro />
			</Sequence>
		</AbsoluteFill>
	);
};
