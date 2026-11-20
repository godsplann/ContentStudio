// Contact frames for checking framing: frame i of this composition shows frame FRAMES[i] of the video.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Jatayu} from './Jatayu';

export const STILL_FRAMES = [60, 200, 380, 520, 590, 640, 720, 800, 870, 1000, 1110, 1230, 1335, 1420, 1510, 1565, 1640, 1760, 1815, 1900, 2000, 2075, 2130, 2250, 2385, 2470, 2600, 2700, 2795, 2930, 3050, 3200, 3400];

export const JatayuStills: React.FC = () => {
  const i = useCurrentFrame();
  return (
    <Jatayu audio={false} at={STILL_FRAMES[Math.min(i, STILL_FRAMES.length - 1)]} />
  );
};
