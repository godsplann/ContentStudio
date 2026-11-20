// Shot lists and the camera rig, shared by every video.
// A shot is a hard cut; keys inside a shot are camera moves, eased with a sine (or a fast cubic for whips).
// Also: impact kicks (a short decaying shake) and the font-loading hook every composition needs.
import React, {useEffect, useState} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {continueRender, delayRender} from 'remotion';
import {fontsReady} from '../fonts';
import type {V3} from './flat';

export type CamKey = {f: number; p: V3; t: V3; fov: number; ease?: 'sine' | 'whip' | 'linear'};
export type Shot<W extends string> = {world: W; from: number; keys: CamKey[]};
export type Kick = {f: number; amp: number; len?: number};

const sine = (u: number) => -(Math.cos(Math.PI * u) - 1) / 2;
const cubic = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const mix3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
export const clamp01 = (u: number) => Math.min(1, Math.max(0, u));
// 0 before `a`, 1 after `b`, eased in between. The workhorse for timing anything to the narration.
export const ramp = (f: number, a: number, b: number) => sine(clamp01((f - a) / Math.max(1, b - a)));

export const cameraAt = <W extends string>(shots: Shot<W>[], kicks: Kick[], f: number) => {
  const shot = [...shots].reverse().find((s) => f >= s.from) ?? shots[0];
  const k = shot.keys;
  let p = k[k.length - 1].p;
  let t = k[k.length - 1].t;
  let fov = k[k.length - 1].fov;
  if (f <= k[0].f) {
    p = k[0].p;
    t = k[0].t;
    fov = k[0].fov;
  } else
    for (let i = 0; i < k.length - 1; i++) {
      if (f >= k[i].f && f < k[i + 1].f) {
        const u = (f - k[i].f) / (k[i + 1].f - k[i].f);
        const ease = k[i + 1].ease;
        const e = ease === 'whip' ? cubic(u) : ease === 'linear' ? u : sine(u);
        p = mix3(k[i].p, k[i + 1].p, e);
        t = mix3(k[i].t, k[i + 1].t, e);
        fov = k[i].fov + (k[i + 1].fov - k[i].fov) * e;
        break;
      }
    }
  let dx = 0;
  let dy = 0;
  for (const kick of kicks) {
    const d = f - kick.f;
    const len = kick.len ?? 12;
    if (d >= 0 && d < len) {
      const a = kick.amp * Math.exp(-d / (len / 3.4));
      dx += Math.sin(d * 2.7) * a;
      dy += Math.cos(d * 3.3) * a;
    }
  }
  return {world: shot.world, shotFrom: shot.from, p: [p[0] + dx, p[1] + dy, p[2]] as V3, t, fov};
};

export const Rig: React.FC<{p: V3; t: V3; fov: number; far?: number}> = ({p, t, fov, far = 900}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(p[0], p[1], p[2]);
  camera.fov = fov;
  camera.near = 0.05;
  camera.far = far;
  camera.updateProjectionMatrix();
  camera.lookAt(t[0], t[1], t[2]);
  return null;
};

export const useFontsLoaded = () => {
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
