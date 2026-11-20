// "What is a GPU?": a toon-3D short. Flat inked characters in lit 3D worlds, a camera that never rests,
// word-by-word captions. All motion comes from the frame number.
import React, {useEffect, useState} from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, continueRender, delayRender, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {BoardWorld} from './BoardWorld';
import {DeskWorld} from './DeskWorld';
import {CamCtx, V3} from '../shared/flat';
import {WordCaptions} from '../shared/WordCaptions';
import {at, DURATION_FRAMES, words} from './words';

export const whatIsGpuDuration = DURATION_FRAMES;

type Key = {f: number; p: V3; t: V3; fov: number; ease?: 'sine' | 'whip'};
type Shot = {world: 'desk' | 'board'; from: number; keys: Key[]};

// One row per shot. A new shot is a hard cut; keys inside a shot are camera moves.
const SHOTS: Shot[] = [
  {
    // "Your screen redraws millions of pixels, sixty times every second."  Low on the desk, pushing into the screen.
    world: 'desk',
    from: 0,
    keys: [
      {f: 0, p: [-0.3, 0.34, 3.95], t: [-0.2, 0.98, 0], fov: 52},
      {f: at('pixels'), p: [0.3, 1.0, 3.0], t: [0, 1.55, 0], fov: 48},
      {f: 150, p: [0.12, 1.62, 0.95], t: [0.05, 1.62, 0], fov: 44},
    ],
  },
  {
    // "That's too much math for the CPU alone." / "A CPU has a few powerful cores..."
    world: 'board',
    from: 150,
    keys: [
      {f: 150, p: [1.05, 1.1, 5.6], t: [1.25, 2.0, 2.4], fov: 56},
      {f: at('alone'), p: [1.0, 1.2, 5.15], t: [1.3, 1.8, 2.4], fov: 56},
      {f: at('A', 7), p: [0.8, 1.55, 5.1], t: [0.7, 1.5, 1.8], fov: 54},
      {f: at('A', 7) + 24, p: [0.1, 6.3, 5.0], t: [0, 0.86, 0.4], fov: 50},
      {f: at('A', 12), p: [0.05, 5.8, 4.3], t: [0, 0.86, 0.1], fov: 50},
      // whip to the GPU
      {f: at('A', 12) + 9, p: [28.9, 1.15, 7.4], t: [29.7, 0.7, 5.2], fov: 52, ease: 'whip'},
      {f: at('thousands'), p: [29.0, 1.22, 7.0], t: [29.7, 0.7, 4.9], fov: 52},
      {f: at('all', 15), p: [30, 8.5, 12.0], t: [30, 0.6, 1.0], fov: 50},
      {f: 522, p: [30, 15.5, 4.2], t: [30, 0.6, 0.2], fov: 50},
    ],
  },
  {
    // "GPU stands for graphics processing unit" (sign), then "...games, video and AI" on the screen.
    world: 'desk',
    from: 522,
    keys: [
      {f: 522, p: [0.05, 0.55, 4.25], t: [-0.4, 0.6, 2.3], fov: 46},
      {f: 618, p: [-0.12, 0.58, 3.7], t: [-0.42, 0.62, 2.3], fov: 46},
      {f: 642, p: [0.3, 1.55, 6.4], t: [0, 1.5, 0], fov: 46},
      {f: DURATION_FRAMES, p: [0.5, 1.45, 7.6], t: [0, 1.48, 0], fov: 46},
    ],
  },
];

const KICKS = [{f: at('alone'), amp: 0.06}];
const WHIP = {from: at('A', 12), to: at('A', 12) + 9};

const sine = (u: number) => -(Math.cos(Math.PI * u) - 1) / 2;
const cubic = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const mix = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];

export const cameraAt = (f: number) => {
  const shot = [...SHOTS].reverse().find((s) => f >= s.from)!;
  const k = shot.keys;
  let p = k[k.length - 1].p;
  let t = k[k.length - 1].t;
  let fov = k[k.length - 1].fov;
  for (let i = 0; i < k.length - 1; i++) {
    if (f >= k[i].f && f < k[i + 1].f) {
      const u = (f - k[i].f) / (k[i + 1].f - k[i].f);
      const e = k[i + 1].ease === 'whip' ? cubic(u) : sine(u);
      p = mix(k[i].p, k[i + 1].p, e);
      t = mix(k[i].t, k[i + 1].t, e);
      fov = k[i].fov + (k[i + 1].fov - k[i].fov) * e;
      break;
    }
  }
  if (f < k[0].f) {
    p = k[0].p;
    t = k[0].t;
    fov = k[0].fov;
  }
  // impact kicks
  let dx = 0;
  let dy = 0;
  for (const kick of KICKS) {
    const d = f - kick.f;
    if (d >= 0 && d < 12) {
      const a = kick.amp * Math.exp(-d / 3.5);
      dx += Math.sin(d * 2.7) * a;
      dy += Math.cos(d * 3.3) * a;
    }
  }
  return {world: shot.world, p: [p[0] + dx, p[1] + dy, p[2]] as V3, t, fov};
};

const Rig: React.FC<{p: V3; t: V3; fov: number}> = ({p, t, fov}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(p[0], p[1], p[2]);
  camera.fov = fov;
  camera.near = 0.05;
  camera.far = 200;
  camera.updateProjectionMatrix();
  camera.lookAt(t[0], t[1], t[2]);
  return null;
};

const useFontsLoaded = () => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fontsReady
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

export const WhatIsGPU: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const ready = useFontsLoaded();
  const cam = cameraAt(f);
  const camVec = new THREE.Vector3(...cam.p);
  const w = (f - WHIP.from) / (WHIP.to - WHIP.from);
  const blur = w > 0 && w < 1 ? Math.sin(Math.PI * w) * 18 : 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#0b1526'}}>
      {ready && (
        <AbsoluteFill style={{filter: blur ? `blur(${blur.toFixed(1)}px)` : undefined}}>
          <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 50, position: [0, 1, 5]}}>
            <Rig p={cam.p} t={cam.t} fov={cam.fov} />
            <CamCtx.Provider value={camVec}>{cam.world === 'desk' ? <DeskWorld f={f} /> : <BoardWorld f={f} />}</CamCtx.Provider>
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      {ready && <WordCaptions words={words} />}
      {audio && <Html5Audio src={staticFile('audio/what-is-a-gpu-voice.mp3')} />}
      {audio && <Html5Audio src={staticFile('audio/what-is-a-gpu-bed.wav')} />}
    </AbsoluteFill>
  );
};
