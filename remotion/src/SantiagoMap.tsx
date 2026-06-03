import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {
	ANDES_SILHOUETTE,
	MAPOCHO_RIVER,
	SANTIAGO_OUTLINE,
	comunaPoint,
} from './santiagoGeo';
import { colors } from './theme';

const { fontFamily } = loadFont('normal', {
	weights: ['400', '600', '700', '800'],
	subsets: ['latin'],
});

type PedidaEvent = {
	id: string;
	comuna: string;
	title: string;
	price: string;
	appearFrame: number;
};

type PerkinEvent = {
	id: string;
	fromComuna: string;
	toPedidaId: string;
	appearFrame: number;
	travelFrames: number;
};

const PEDIDAS: PedidaEvent[] = [
	{
		id: 'p1',
		comuna: 'Providencia',
		title: 'Farmacia',
		price: '$8.500',
		appearFrame: 20,
	},
	{
		id: 'p2',
		comuna: 'Maipú',
		title: 'Compras',
		price: '$12.000',
		appearFrame: 120,
	},
	{
		id: 'p3',
		comuna: 'Las Condes',
		title: 'Traslado',
		price: '$15.000',
		appearFrame: 240,
	},
	{
		id: 'p4',
		comuna: 'Ñuñoa',
		title: 'Persiana',
		price: '$18.000',
		appearFrame: 360,
	},
	{
		id: 'p5',
		comuna: 'La Florida',
		title: 'Supermercado',
		price: '$9.500',
		appearFrame: 480,
	},
];

const PERKINS: PerkinEvent[] = [
	{
		id: 'k1',
		fromComuna: 'Ñuñoa',
		toPedidaId: 'p1',
		appearFrame: 55,
		travelFrames: 70,
	},
	{
		id: 'k2',
		fromComuna: 'Estación Central',
		toPedidaId: 'p2',
		appearFrame: 155,
		travelFrames: 80,
	},
	{
		id: 'k3',
		fromComuna: 'Vitacura',
		toPedidaId: 'p3',
		appearFrame: 275,
		travelFrames: 65,
	},
	{
		id: 'k4',
		fromComuna: 'Macul',
		toPedidaId: 'p4',
		appearFrame: 395,
		travelFrames: 75,
	},
	{
		id: 'k5',
		fromComuna: 'Peñalolén',
		toPedidaId: 'p5',
		appearFrame: 515,
		travelFrames: 70,
	},
];

const Background: React.FC = () => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse 70% 50% at 60% 30%, ${colors.accentGlow} 0%, transparent 55%),
        radial-gradient(ellipse 40% 35% at 15% 85%, rgba(129, 140, 248, 0.12) 0%, transparent 50%),
        linear-gradient(165deg, ${colors.bg} 0%, ${colors.bgSoft} 50%, ${colors.bg} 100%)`,
		}}
	/>
);

const MapCanvas: React.FC<{ mapSize: number }> = ({ mapSize }) => {
	const frame = useCurrentFrame();
	const mapEnter = interpolate(frame, [0, 35], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});

	return (
		<svg
			width={mapSize}
			height={mapSize}
			viewBox="0 0 720 720"
			style={{
				opacity: mapEnter,
				transform: `scale(${interpolate(mapEnter, [0, 1], [0.96, 1])})`,
			}}
		>
			<defs>
				<linearGradient id="valleyFill" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="rgba(20, 28, 48, 0.95)" />
					<stop offset="100%" stopColor="rgba(15, 22, 40, 0.85)" />
				</linearGradient>
				<linearGradient id="andesFill" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="rgba(30, 41, 59, 0.5)" />
					<stop offset="100%" stopColor="rgba(15, 23, 42, 0.85)" />
				</linearGradient>
			</defs>

			{/* Grid */}
			{Array.from({ length: 12 }).map((_, i) => (
				<line
					key={`v-${i}`}
					x1={60 + i * 50}
					y1={120}
					x2={60 + i * 50}
					y2={640}
					stroke="rgba(255,255,255,0.04)"
					strokeWidth={1}
				/>
			))}
			{Array.from({ length: 12 }).map((_, i) => (
				<line
					key={`h-${i}`}
					x1={60}
					y1={120 + i * 45}
					x2={660}
					y2={120 + i * 45}
					stroke="rgba(255,255,255,0.04)"
					strokeWidth={1}
				/>
			))}

			<path d={ANDES_SILHOUETTE} fill="url(#andesFill)" opacity={0.7} />
			<path
				d={SANTIAGO_OUTLINE}
				fill="url(#valleyFill)"
				stroke="rgba(255,255,255,0.12)"
				strokeWidth={2}
			/>
			<path
				d={MAPOCHO_RIVER}
				fill="none"
				stroke="rgba(96, 165, 250, 0.35)"
				strokeWidth={3}
				strokeLinecap="round"
			/>

			{/* Autopistas estilizadas */}
			<path
				d="M 100 450 L 280 380 L 420 360 L 580 340"
				fill="none"
				stroke="rgba(255,255,255,0.06)"
				strokeWidth={4}
				strokeLinecap="round"
			/>
			<path
				d="M 200 600 L 350 520 L 500 480 L 620 420"
				fill="none"
				stroke="rgba(255,255,255,0.05)"
				strokeWidth={3}
				strokeLinecap="round"
			/>
		</svg>
	);
};

const RouteLine: React.FC<{
	from: { x: number; y: number };
	to: { x: number; y: number };
	progress: number;
}> = ({ from, to, progress }) => {
	if (progress <= 0) return null;

	const midX = (from.x + to.x) / 2;
	const midY = Math.min(from.y, to.y) - 40;
	const path = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
	const dashOffset = interpolate(progress, [0, 1], [200, 0]);

	return (
		<svg
			style={{
				position: 'absolute',
				inset: 0,
				pointerEvents: 'none',
				overflow: 'visible',
			}}
			width="100%"
			height="100%"
		>
			<path
				d={path}
				fill="none"
				stroke={colors.accent}
				strokeWidth={2}
				strokeDasharray="6 8"
				strokeDashoffset={dashOffset}
				opacity={interpolate(progress, [0, 0.2, 1], [0, 0.6, 0.85])}
			/>
		</svg>
	);
};

const PedidaMarker: React.FC<{
	x: number;
	y: number;
	title: string;
	price: string;
	appearFrame: number;
}> = ({ x, y, title, price, appearFrame }) => {
	const frame = useCurrentFrame();
	const local = frame - appearFrame;
	if (local < 0) return null;

	const enter = interpolate(local, [0, 18], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.back(1.4)),
	});
	const pulse = 1 + Math.sin(local * 0.15) * 0.12;

	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -100%) scale(${enter * pulse})`,
				opacity: enter,
				fontFamily,
				zIndex: 10,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '100%',
					width: 28,
					height: 28,
					marginLeft: -14,
					marginTop: -8,
					borderRadius: '50%',
					background: 'rgba(129, 140, 248, 0.25)',
					transform: `scale(${pulse})`,
				}}
			/>
			<div
				style={{
					background: 'rgba(99, 102, 241, 0.92)',
					border: '2px solid rgba(255,255,255,0.25)',
					borderRadius: 12,
					padding: '8px 12px',
					boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
					minWidth: 90,
					textAlign: 'center',
				}}
			>
				<div
					style={{
						fontSize: 10,
						fontWeight: 700,
						color: 'rgba(255,255,255,0.75)',
						textTransform: 'uppercase',
						letterSpacing: '0.06em',
						marginBottom: 2,
					}}
				>
					Pedida
				</div>
				<div
					style={{
						fontSize: 13,
						fontWeight: 700,
						color: '#fff',
						whiteSpace: 'nowrap',
					}}
				>
					{title}
				</div>
				<div
					style={{
						fontSize: 12,
						fontWeight: 800,
						color: '#c7d2fe',
						marginTop: 2,
					}}
				>
					{price}
				</div>
			</div>
			<div
				style={{
					width: 10,
					height: 10,
					background: colors.accent2,
					borderRadius: '50% 50% 50% 0',
					transform: 'rotate(-45deg)',
					margin: '4px auto 0',
					border: '2px solid #fff',
				}}
			/>
		</div>
	);
};

const PerkinMarker: React.FC<{
	x: number;
	y: number;
	appearFrame: number;
}> = ({ x, y, appearFrame }) => {
	const frame = useCurrentFrame();
	const local = frame - appearFrame;
	if (local < 0) return null;

	const enter = interpolate(local, [0, 15], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const bounce = 1 + Math.sin(local * 0.2) * 0.08;

	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) scale(${enter * bounce})`,
				opacity: enter,
				zIndex: 20,
			}}
		>
			<div
				style={{
					width: 36,
					height: 36,
					borderRadius: '50%',
					background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDim})`,
					border: '2px solid rgba(255,255,255,0.35)',
					boxShadow: `0 0 20px ${colors.accentGlow}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 16,
				}}
			>
				🦸
			</div>
		</div>
	);
};

const MapHUD: React.FC<{ pedidaCount: number; perkinCount: number }> = ({
	pedidaCount,
	perkinCount,
}) => (
	<>
		<div
			style={{
				position: 'absolute',
				top: 24,
				left: 24,
				right: 24,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'flex-start',
				fontFamily,
				zIndex: 30,
			}}
		>
			<div>
				<div
					style={{
						fontSize: 22,
						fontWeight: 800,
						color: colors.text,
						letterSpacing: '-0.03em',
					}}
				>
					Santiago · RM
				</div>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 6,
						marginTop: 6,
						fontSize: 11,
						fontWeight: 700,
						color: colors.accent,
						textTransform: 'uppercase',
						letterSpacing: '0.08em',
					}}
				>
					<span
						style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							background: colors.accent,
							boxShadow: `0 0 12px ${colors.accentGlow}`,
						}}
					/>
					En vivo
				</div>
			</div>
			<div
				style={{
					background: 'rgba(6, 10, 18, 0.75)',
					border: `1px solid ${colors.border}`,
					borderRadius: 12,
					padding: '10px 14px',
					backdropFilter: 'blur(12px)',
				}}
			>
				<div
					style={{
						fontSize: 11,
						color: colors.muted,
						fontWeight: 600,
						marginBottom: 4,
					}}
				>
					Ahora mismo
				</div>
				<div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>
					<span style={{ color: colors.accent2 }}>{pedidaCount} pedidas</span>
					<span style={{ color: colors.muted, margin: '0 6px' }}>·</span>
					<span style={{ color: colors.accent }}>{perkinCount} Perkins</span>
				</div>
			</div>
		</div>

		<div
			style={{
				position: 'absolute',
				bottom: 24,
				left: 24,
				display: 'flex',
				gap: 16,
				fontFamily,
				fontSize: 11,
				fontWeight: 700,
				zIndex: 30,
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
				<span
					style={{
						width: 10,
						height: 10,
						borderRadius: 3,
						background: colors.accent2,
					}}
				/>
				<span style={{ color: colors.muted }}>Pedida (vioh)</span>
			</div>
			<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
				<span
					style={{
						width: 10,
						height: 10,
						borderRadius: '50%',
						background: colors.accent,
					}}
				/>
				<span style={{ color: colors.muted }}>Perkin en ruta</span>
			</div>
		</div>
	</>
);

export const SantiagoMap: React.FC = () => {
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();
	const mapSize = Math.min(width - 48, height - 120);

	const visiblePedidas = PEDIDAS.filter((p) => frame >= p.appearFrame);
	const visiblePerkins = PERKINS.filter((p) => frame >= p.appearFrame);

	const pedidaPositions = Object.fromEntries(
		PEDIDAS.map((p) => {
			const pt = comunaPoint(p.comuna, mapSize, mapSize);
			return [p.id, pt];
		}),
	);

	return (
		<AbsoluteFill style={{ fontFamily }}>
			<Background />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					paddingTop: 40,
				}}
			>
				<div
					style={{
						position: 'relative',
						width: mapSize,
						height: mapSize,
					}}
				>
					<MapCanvas mapSize={mapSize} />

					{PERKINS.map((perkin) => {
						const pedida = PEDIDAS.find((p) => p.id === perkin.toPedidaId);
						if (!pedida || frame < perkin.appearFrame) return null;

						const from = comunaPoint(
							perkin.fromComuna,
							mapSize,
							mapSize,
						);
						const to = pedidaPositions[perkin.toPedidaId];
						const travelProgress = interpolate(
							frame - perkin.appearFrame,
							[0, perkin.travelFrames],
							[0, 1],
							{ extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) },
						);

						const x = interpolate(travelProgress, [0, 1], [from.x, to.x]);
						const y = interpolate(travelProgress, [0, 1], [from.y, to.y]);

						return (
							<div key={perkin.id}>
								<RouteLine from={from} to={to} progress={travelProgress} />
								<PerkinMarker
									x={x}
									y={y}
									appearFrame={perkin.appearFrame}
								/>
							</div>
						);
					})}

					{visiblePedidas.map((pedida) => {
						const pt = pedidaPositions[pedida.id];
						return (
							<PedidaMarker
								key={pedida.id}
								x={pt.x}
								y={pt.y}
								title={pedida.title}
								price={pedida.price}
								appearFrame={pedida.appearFrame}
							/>
						);
					})}
				</div>
			</div>

			<MapHUD
				pedidaCount={visiblePedidas.length}
				perkinCount={visiblePerkins.length}
			/>

			{/* Marca Perkins */}
			<div
				style={{
					position: 'absolute',
					bottom: 24,
					right: 24,
					fontFamily,
					fontSize: 14,
					fontWeight: 800,
					color: 'rgba(248, 250, 252, 0.35)',
					letterSpacing: '-0.02em',
				}}
			>
				Perkins
			</div>
		</AbsoluteFill>
	);
};
