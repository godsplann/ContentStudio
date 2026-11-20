// Where everything is, and what time of day it is, at frame f. Two worlds, each with y = 0 as the ground:
//  field: a Normandy field inside hedgerows, with the lane where the cyclists ride, the circle the bulldozer drives,
//         the speaker trucks, the artist's table, the "division" park to the west and the real tanks' road to the east;
//  town:  a small square with a cafe, where the fake general shows off.
import * as THREE from 'three';
import type {V3} from '../shared/flat';
import {clamp01, ramp} from '../shared/camera';
import {B, s} from './beats';

// ---------- The field ----------
export const LIFT: V3 = [0, 0, 3]; // the tank the four GIs hold over their heads (long axis along x)
export const LANE_Z = 10; // the dirt lane runs along x
export const CRATE: V3 = [-6.0, 0.55, 11.8]; // the FRANCE 1944 crate, on top of a plain one (and, at the end, where the secret is kept)
export const CRATE_RY = -0.12;
export const GI_H = 1.8; // a GI, standing
// hands of the armsUp pose, as a share of the figure's height: the bottom of the held tank sits here
export const HANDS = ((992 - 196) / 1024) * GI_H + 0.08;
// the tank is held end-on to the opening camera (barrel towards us): two men under the front, two under the back
export const HOLDERS: V3[] = [
  [1.0, 0, 6.0],
  [-1.0, 0, 6.0],
  [1.3, 0, 1.6],
  [-1.3, 0, 1.6],
];
export const LIFT_RY = -Math.PI / 2; // turns the tank's front (+x) towards +z
// the valve under the front-left of the held tank (world x, z); the front-left man pulls its plug at the end
export const VALVE: [number, number] = [-0.9, 5.2];
// the held tank rides a hand's width above the men's heads
// the cyclists ride in along the lane from the east and stop
export const FR_STOP: V3[] = [
  [4.6, 0, LANE_Z],
  [6.4, 0, LANE_Z + 0.5],
];
export const riderAt = (f: number, i: number): V3 => {
  const u = ramp(f, B.frenchmen - 30 + i * 6, B.freeze + 2);
  const p = FR_STOP[i];
  return [p[0] + (1 - u) * 14, 0, p[2]];
};

// the circle the bulldozer drives at night, and where the rubber tanks stand on it by morning
export const CC: V3 = [0, 0, -11];
export const CR = 7.5;
export const dozerAngle = (f: number) => {
  // two laps over the night, starting at "A bulldozer"
  const u = clamp01((f - (B.bulldozer - 10)) / (B.morning - B.bulldozer));
  return -Math.PI / 2 + u * Math.PI * 4;
};
export const tracksDone = (f: number) => clamp01((f - (B.bulldozer - 10)) / ((B.morning - B.bulldozer) / 2));
export const RING_TANKS = [0.35, 1.4, 2.45, 3.5, 4.55, 5.6].map((a) => a); // angles of the rubber tanks on the circle
export const ringTankPos = (a: number): V3 => [CC[0] + Math.cos(a) * CR, 0, CC[2] + Math.sin(a) * CR];

export const TRUCKS: {p: V3; ry: number}[] = [
  {p: [-12.5, 0, -1], ry: 0.55},
  {p: [12.5, 0, -3], ry: -0.6}, // the one filmed close
];

// the artist's table under the oak by the lane
export const TABLE: V3 = [-7.5, 0, 6.2];
export const TABLE_TOP = 0.78;
export const OAK: V3 = [-9.6, 0, 4.4];

// the bag that is blown up in the reveal, and its compressor
export const BAG: V3 = [6.5, 0, 0.5];
export const COMPRESSOR: V3 = [3.6, 0, 1.9];
export const inflateAt = (f: number) => ramp(f, B.blown - 2, B.eleven - 14);

// the parked "division" to the west, and the road to the east where the real attack goes
export const DIV: V3 = [-62, 0, -26];
export const ROAD_Z = -58;
export const realTankX = (f: number, i: number) => 46 + i * 9.5 + (f - B.whileW) * 0.32;

// the German plane: flies along x, high over the field, twice
export const planeAt = (f: number): {p: V3; on: boolean} => {
  if (f >= B.overhead - 10 && f < B.because) return {p: [(f - B.photos) * 0.55, 34, -9], on: true};
  if (f >= B.so - 10 && f < B.whileW + 4) return {p: [(f - s(49.7)) * 0.62, 21, -10], on: true};
  return {p: [0, 0, 0], on: false};
};

// ---------- The town ----------
export const GENERAL: V3 = [0, 0, 0.6];
export const CAFE_Z = -3.2;

// ---------- Time of day ----------
// Each preset: sky stops (top to bottom), fog, hemisphere sky and ground colours and strength, key light, and the
// tint for the flat figures. Frames between presets blend, so the sky time-lapses inside a shot.
type Preset = {sky: string[]; fog: string; hs: string; hg: string; hi: number; kc: string; ki: number; kd: V3; tint: string; night: number};
const POS = [0, 0.36, 0.48, 0.52, 1];
export const DAY: Preset = {sky: ['#4c8fd4', '#a0caea', '#f6ecd4', '#9fb07e', '#5a6a40'], fog: '#dfe5d8', hs: '#cfe2f5', hg: '#7f8a5a', hi: 1.0, kc: '#ffefd2', ki: 2.7, kd: [16, 24, 18], tint: '#fff6ea', night: 0};
const NIGHT: Preset = {sky: ['#081030', '#1a2a5c', '#34477c', '#1e2a3c', '#0c111a'], fog: '#1c2744', hs: '#5a74c0', hg: '#26304a', hi: 1.15, kc: '#b4c6ff', ki: 1.5, kd: [-12, 30, -14], tint: '#a9b8e8', night: 1};
const DAWN: Preset = {sky: ['#36428a', '#c4869e', '#ffc68c', '#9a8a6c', '#3e3e2c'], fog: '#e6b8a0', hs: '#e0b0bc', hg: '#6a5a48', hi: 0.9, kc: '#ffb27a', ki: 2.1, kd: [-28, 7, 12], tint: '#ffd8c4', night: 0.15};
const MORNING: Preset = {sky: ['#5c96d0', '#b0d2ea', '#fbe6c4', '#a4ae7a', '#5a6a40'], fog: '#e8e2cc', hs: '#d4e2f0', hg: '#86885a', hi: 1.0, kc: '#ffe4bc', ki: 2.6, kd: [-20, 16, 16], tint: '#fff2e2', night: 0};
const GOLD: Preset = {sky: ['#3a4c8c', '#d8907a', '#ffc070', '#a08452', '#4a3a26'], fog: '#e6b28a', hs: '#e2b8a8', hg: '#7a6040', hi: 0.85, kc: '#ffae62', ki: 2.5, kd: [-26, 8, 18], tint: '#ffd4a8', night: 0};
export const TOWN_LIGHT: Preset = {sky: ['#5a98d6', '#acd0ec', '#f8ead0', '#c8b48e', '#7a6a50'], fog: '#ece0c8', hs: '#d6e4f2', hg: '#8a7a5a', hi: 1.0, kc: '#ffe8c4', ki: 2.6, kd: [14, 22, 20], tint: '#fff4e6', night: 0};

const c = new THREE.Color();
const c2 = new THREE.Color();
const mixHex = (a: string, b: string, u: number) => '#' + c.set(a).lerp(c2.set(b), u).getHexString();
const mixP = (a: Preset, b: Preset, u: number): Preset => ({
  sky: a.sky.map((x, i) => mixHex(x, b.sky[i], u)),
  fog: mixHex(a.fog, b.fog, u),
  hs: mixHex(a.hs, b.hs, u),
  hg: mixHex(a.hg, b.hg, u),
  hi: a.hi + (b.hi - a.hi) * u,
  kc: mixHex(a.kc, b.kc, u),
  ki: a.ki + (b.ki - a.ki) * u,
  kd: [a.kd[0] + (b.kd[0] - a.kd[0]) * u, a.kd[1] + (b.kd[1] - a.kd[1]) * u, a.kd[2] + (b.kd[2] - a.kd[2]) * u],
  tint: mixHex(a.tint, b.tint, u),
  night: a.night + (b.night - a.night) * u,
});
// quantise blends, so the sky texture is only redrawn a few dozen times
const qz = (u: number) => Math.round(u * 24) / 24;

// "Fifty years pass": the crate shot runs days and nights by in a few seconds before 1996.
const yearsAt = (f: number) => {
  const u = (f - B.secret) / (B.y1996 - 6 - B.secret);
  if (u < 0 || u >= 1) return null;
  const k = 0.5 - 0.5 * Math.cos(u * Math.PI * 2 * 3.5);
  return mixP(MORNING, NIGHT, qz(k));
};

export const lightAt = (f: number): Preset & {stops: [number, string][]} => {
  let p: Preset;
  if (f < s(14.4)) p = DAY;
  else if (f < s(16.2)) p = mixP(DAY, NIGHT, qz(ramp(f, s(14.4), s(16.2))));
  else if (f < s(24.2)) p = NIGHT;
  else if (f < s(25.5)) p = mixP(NIGHT, DAWN, qz(ramp(f, s(24.2), s(25.5))));
  else if (f < s(26.8)) p = mixP(DAWN, MORNING, qz(ramp(f, s(25.5), s(26.8))));
  else if (f < B.became) p = MORNING;
  else if (f < B.secret) p = GOLD;
  else p = yearsAt(f) ?? DAY;
  return {...p, stops: p.sky.map((x, i) => [POS[i], x] as [number, string])};
};
