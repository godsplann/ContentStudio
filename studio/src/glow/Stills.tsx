// Contact frames for checking framing: frame i of this composition shows frame STILL_FRAMES[i] of the video.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Glowing} from './Glowing';

const sec = [1, 3.6, 5, 7.5, 9.5, 11, 13.5, 15.5, 17.8, 20, 24, 27.5, 29.5, 31, 33, 35.6, 37.5, 40, 42, 44.5, 46.5, 48.5, 52, 54, 55.2, 56.6, 58.6, 61, 64, 66.5, 67.8, 70, 72.5, 74.5, 78, 81, 83, 85, 87.5, 90, 93, 95, 96.5, 97.8, 99.5, 101.5, 104, 106.8, 108.6, 110];
export const STILL_FRAMES = sec.map((x) => Math.round(x * 30));

export const GlowingStills: React.FC = () => {
  const i = useCurrentFrame();
  return <Glowing audio={false} at={STILL_FRAMES[Math.min(i, STILL_FRAMES.length - 1)]} />;
};
