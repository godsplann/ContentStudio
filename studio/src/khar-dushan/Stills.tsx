// Contact frames for checking framing: frame i of this composition shows frame STILL_FRAMES[i] of the video.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {KharDushan} from './KharDushan';

const sec = [1, 4.5, 8, 12, 16.5, 20, 24, 28.5, 31.5, 35, 38, 41, 45, 47, 49.5, 52, 54.5, 57, 59.5, 63.5, 67, 70.5, 74, 77, 80, 83.5, 86, 87.3, 90, 92.6, 96, 101, 105, 110, 115, 120, 125];
export const STILL_FRAMES = sec.map((x) => Math.round(x * 30));

export const KharDushanStills: React.FC = () => {
  const i = useCurrentFrame();
  return <KharDushan audio={false} at={STILL_FRAMES[Math.min(i, STILL_FRAMES.length - 1)]} />;
};
