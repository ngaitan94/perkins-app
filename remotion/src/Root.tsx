import { Composition } from 'remotion';
import { PerkinsHowItWorks } from './PerkinsHowItWorks';
import { SantiagoMap } from './SantiagoMap';
import {
	DURATION_FRAMES,
	FPS,
	MAP_DURATION_FRAMES,
} from './theme';

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
			<Composition
				id="SantiagoMap"
				component={SantiagoMap}
				durationInFrames={MAP_DURATION_FRAMES}
				fps={FPS}
				width={720}
				height={720}
			/>
		</>
	);
};
