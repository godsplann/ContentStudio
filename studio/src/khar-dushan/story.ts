// Where every figure is, and what it is doing, at frame f. The camera (KharDushan.tsx) and the worlds read these.
import type {V3} from '../shared/flat';
import type {MythicExpr, MythicPose} from '../shared/mythic';
import {clamp01, mix3, ramp} from '../shared/camera';
import {rng} from '../shared/toon';
import {B, CAVE_MOUTH, DUSHANA_B, KHARA_B, KHARA_MEET, LAK_HUT, RAM_B, RAM_HUT, s, SITA_HUT, TRISHIRA_B} from './beats';

export const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const lin = (f: number, a: number, b: number) => clamp01((f - a) / Math.max(1, b - a));

export type Mode = 'storm' | 'day' | 'gold';
export const isFlashback = (f: number) => f >= B.think && f < B.couldNot;
export const modeAt = (f: number): Mode => {
  if (f < B.panchavati) return 'storm';
  if (f < B.alone) return 'day';
  if (f < B.over) return 'storm';
  if (isFlashback(f)) return 'storm';
  return 'gold';
};

// ----- The army of the plain -----
// Soldiers stand in a wide fan in front of Ram (angle a from the +z axis, distance r).
export type Soldier = {a: number; r: number; v: 0 | 1 | 2; jit: number; fallT: number; hookFallT: number; arrow: boolean; flip: boolean};
const GENERALS = [DUSHANA_B, TRISHIRA_B, KHARA_B];

export const SOLDIERS: Soldier[] = (() => {
  const r = rng(77);
  const list: Soldier[] = [];
  let n = 0;
  while (list.length < 3000 && n < 20000) {
    n++;
    const a = (r() * 2 - 1) * 1.95;
    const d = 10 + Math.pow(r(), 1.25) * 62;
    const p: V3 = [RAM_B[0] + Math.sin(a) * d, 0, RAM_B[2] + Math.cos(a) * d];
    if (GENERALS.some((g) => Math.hypot(p[0] - g[0], p[2] - g[2]) < 2.4)) continue;
    if (Math.abs(p[0]) < 1.6 && p[2] < KHARA_B[2] && p[2] > RAM_B[2]) continue; // Khara's lane
    const jit = r();
    const fallT = s(76.2 + ((d - 10) / 62) * 8.4 + jit * 1.1);
    const hookFallT = d < 18 && Math.abs(a) < 0.75 ? s(18.4 + ((d - 10) / 8) * 2.6 + jit * 0.7) : Infinity;
    list.push({a, r: d, v: Math.floor(r() * 3) as 0 | 1 | 2, jit, fallT, hookFallT, arrow: r() < 0.45, flip: r() < 0.5});
  }
  return list;
})();

// How far beyond its place in the fan the army still is: marching in from far away, then closing the ring.
export const armyExtra = (f: number) => {
  if (f < B.panchavati || isFlashback(f)) return 0;
  return 50 * (1 - lin(f, s(53.0), s(68.9))) + 18 * (1 - ramp(f, B.allSides, B.unshaken));
};
export const armyVisible = (f: number) => f < B.panchavati || f >= s(53.0);

// While the army is still marching in it is a narrower wedge; it fans out as it closes.
export const fanAt = (f: number) => 1 - 0.78 * clamp01(armyExtra(f) / 50);
export const soldierAt = (sd: Soldier, f: number) => {
  const d = sd.r + armyExtra(f);
  const a = sd.a * fanAt(f);
  const charging = f >= s(53.0) && f < B.unshaken && !isFlashback(f);
  const stride = charging ? Math.abs(Math.sin(f * 0.45 + sd.jit * 9)) * 0.12 : Math.abs(Math.sin(f * 0.12 + sd.jit * 9)) * 0.03;
  const pos: V3 = [RAM_B[0] + Math.sin(a) * d, stride, RAM_B[2] + Math.cos(a) * d];
  let fallen = false;
  if (f < B.panchavati) fallen = f >= sd.hookFallT;
  else if (!isFlashback(f)) fallen = f >= sd.fallT;
  return {pos, fallen};
};

// Glowing arrows from Ram's bow to the soldiers they strike (impact at the soldier's fall).
export type Arrow = {from: V3; to: V3; t0: number; t1: number};
const FLIGHT = 6;
const bowAt: V3 = add(RAM_B, [0, 1.25, 0.3]);
export const ARROWS: Arrow[] = (() => {
  const list: Arrow[] = [];
  for (const sd of SOLDIERS) {
    const at = (t: number): V3 => {
      const d = sd.r;
      return [RAM_B[0] + Math.sin(sd.a) * d, 1.0, RAM_B[2] + Math.cos(sd.a) * d];
    };
    if (sd.hookFallT < Infinity) list.push({from: bowAt, to: at(sd.hookFallT), t0: sd.hookFallT - FLIGHT, t1: sd.hookFallT});
    if (sd.arrow) list.push({from: bowAt, to: at(sd.fallT), t0: sd.fallT - FLIGHT, t1: sd.fallT});
  }
  // the opening volley, before the first falls
  const r = rng(5);
  for (let t = B.arrows; t < s(76.4); t += 2) {
    const a = (r() * 2 - 1) * 1.3;
    const d = 30 + r() * 30;
    list.push({from: bowAt, to: [Math.sin(a) * d, 1.2, RAM_B[2] + Math.cos(a) * d], t0: t, t1: t + 9});
  }
  for (const [g, t] of [[DUSHANA_B, B.dushanaFalls], [TRISHIRA_B, B.trishiraFalls]] as [V3, number][])
    list.push({from: bowAt, to: add(g, [0, 1.3, 0]), t0: t - FLIGHT, t1: t});
  list.push({from: bowAt, to: add(KHARA_MEET, [0, 1.5, 0]), t0: B.kharaHit - 5, t1: B.kharaHit});
  return list;
})();

export const arrowsAt = (f: number) =>
  ARROWS.filter((a) => f >= a.t0 && f <= a.t1 + 3 && (f < B.panchavati ? a.t1 < B.panchavati : a.t0 >= B.alone && f < B.over));

// ----- The three generals on the plain -----
export type Fig = {pos: V3; pose: MythicPose; expr: MythicExpr; visible: boolean; fallen: boolean; flip?: boolean};

const onPlain = (p: V3, f: number): V3 => {
  const d = Math.hypot(p[0] - RAM_B[0], p[2] - RAM_B[2]);
  const a = Math.atan2(p[0] - RAM_B[0], p[2] - RAM_B[2]) * fanAt(f);
  const e = d + armyExtra(f);
  return [RAM_B[0] + Math.sin(a) * e, 0, RAM_B[2] + Math.cos(a) * e];
};

export const generalAt = (which: 'dushana' | 'trishira', f: number): Fig => {
  const base = which === 'dushana' ? DUSHANA_B : TRISHIRA_B;
  const fallT = which === 'dushana' ? B.dushanaFalls : B.trishiraFalls;
  const fallen = f >= B.panchavati && !isFlashback(f) && f >= fallT;
  return {pos: onPlain(base, f), pose: 'hold', expr: f > B.allSides ? 'roar' : 'stern', visible: armyVisible(f), fallen};
};

export const kharaPlainAt = (f: number): Fig => {
  const fallen = f >= B.panchavati && !isFlashback(f) && f >= B.kharaHit + 4;
  let pos = onPlain(KHARA_B, f);
  if (f >= B.khara && !isFlashback(f) && f >= B.panchavati) {
    const u = lin(f, B.khara, B.kharaArrow - 6);
    pos = mix3(KHARA_B, KHARA_MEET, u);
    pos = add(pos, [0, Math.abs(Math.sin(f * 0.5)) * 0.1 * (u < 1 ? 1 : 0), 0]);
  }
  if (fallen) pos = KHARA_MEET;
  return {pos, pose: 'hold', expr: 'roar', visible: armyVisible(f), fallen};
};

// ----- Ram, Sita, Lakshman, Shurpanakha -----
export const ramAt = (f: number): Fig => {
  if (f >= B.panchavati && f < B.alone) {
    let pose: MythicPose = 'stand';
    let expr: MythicExpr = 'happy';
    if (f >= B.oneDay) expr = 'calm';
    if (f >= B.insulted) expr = 'stern';
    if (f >= B.lakshman) (pose = 'hold'), (expr = 'calm');
    if (f >= B.order + 6 && f < B.alone) (pose = 'bless'), (expr = 'calm');
    return {pos: RAM_HUT, pose, expr, visible: true, fallen: false};
  }
  let pose: MythicPose = 'hold';
  let expr: MythicExpr = 'stern';
  if (f < B.panchavati && f >= B.ramayan) pose = 'shoot';
  if (f >= B.unshaken && f < B.over) expr = 'calm';
  if (f >= B.arrows && f < B.over) (pose = 'shoot'), (expr = 'stern');
  if (f >= B.khara && f < B.kharaArrow) (pose = 'hold'), (expr = 'stern');
  if (f >= B.over) expr = 'calm';
  if (f >= B.courageIs) expr = 'happy';
  return {pos: RAM_B, pose, expr, visible: true, fallen: false};
};

const walk = (f: number, a: V3, b: V3, t0: number, t1: number) => {
  const u = lin(f, t0, t1);
  const moving = u > 0 && u < 1;
  return {pos: add(mix3(a, b, u), [0, moving ? Math.abs(Math.sin(f * 0.4)) * 0.06 : 0, 0]), moving};
};

const SITA_E: V3 = add(RAM_B, [-1.25, 0, -0.5]);
const LAK_E: V3 = add(RAM_B, [-2.5, 0, -1.1]);
export const sitaAt = (f: number): Fig => {
  if (f >= B.panchavati && f < B.alone + s(2)) {
    const w = walk(f, SITA_HUT, add(CAVE_MOUTH, [0.4, 0, 0.9]), B.cave + 10, s(66.8));
    return {pos: w.pos, pose: w.moving ? 'stand' : 'namaste', expr: f >= B.insulted && f < B.order ? 'sad' : 'calm', visible: true, fallen: false};
  }
  if (f >= B.taught) {
    const w = walk(f, add(SITA_E, [-6, 0, -4]), SITA_E, B.taught, B.taught + s(2.8));
    return {pos: w.pos, pose: w.moving ? 'stand' : 'namaste', expr: 'happy', visible: true, fallen: false};
  }
  return {pos: SITA_HUT, pose: 'namaste', expr: 'calm', visible: false, fallen: false};
};
export const lakshmanAt = (f: number): Fig => {
  if (f >= B.panchavati && f < B.alone + s(2)) {
    const w = walk(f, LAK_HUT, add(CAVE_MOUTH, [1.6, 0, 1.4]), B.cave + 4, s(66.6));
    let expr: MythicExpr = 'calm';
    if (f >= B.insulted && f < B.toBrothers) expr = 'stern';
    if (f >= B.lakshman && f < B.cave) expr = 'stern';
    return {pos: w.pos, pose: 'hold', expr, visible: true, fallen: false};
  }
  if (f >= B.taught) {
    const w = walk(f, add(LAK_E, [-6, 0, -4]), LAK_E, B.taught + 8, B.taught + s(3.1));
    return {pos: w.pos, pose: 'hold', expr: 'happy', visible: true, fallen: false};
  }
  return {pos: LAK_HUT, pose: 'hold', expr: 'calm', visible: false, fallen: false};
};

export const SHURP_FROM: V3 = [10, 0, 11];
export const SHURP_AT: V3 = [3.9, 0, 6.6];
export const shurpanakhaDayAt = (f: number): Fig => {
  if (f < B.oneDay || f >= B.toBrothers) return {pos: SHURP_FROM, pose: 'stand', expr: 'calm', visible: false, fallen: false};
  if (f < B.insulted) {
    const w = walk(f, SHURP_FROM, SHURP_AT, B.oneDay, s(32.6));
    return {pos: w.pos, pose: 'stand', expr: 'happy', visible: true, fallen: false};
  }
  const w = walk(f, SHURP_AT, [9.5, 0, 12.5], s(34.7), B.toBrothers);
  return {pos: w.pos, pose: w.moving ? 'stand' : 'grab', expr: w.moving ? 'sad' : 'stern', visible: true, fallen: false};
};
