import { Composition } from 'remotion';
import { PerkinsHowItWorks } from './PerkinsHowItWorks';
import { DURATION_FRAMES, FPS } from './theme';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="PerkinsHowItWorks"
				component={PerkinsHowItWorks}
				durationInFrames={DURATION_FRAMES}
				fps={FPS}
				width={1280}
				height={720}
			/>
		</>
	);
};
