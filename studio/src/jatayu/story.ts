// Where the chariot, Jatayu, Ravana, Sita, Ram and Lakshman are, and what they are doing, at every frame.
// The camera (Jatayu.tsx) and the world (ForestWorld.tsx) both read these, so they always agree.
import type {V3} from '../shared/flat';
import type {MythicExpr, MythicPose} from '../shared/mythic';
import type {JatayuExpr, JatayuPose} from '../shared/epic';
import {clamp01, mix3, ramp} from '../shared/camera';
import {B, CLEAR, J_H, JATAYU_G, PERCH, PYRE, RAVANA_G, s, SITA_G} from './beats';

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sine = (u: number) => -(Math.cos(Math.PI * clamp01(u)) - 1) / 2;

// ----- The chariot -----
export const CH_FROM: V3 = [30, 17.5, 74];
export const HOVER: V3 = [8, 15.5, -4];
const ARRIVE = s(42.6);
const d0 = [HOVER[0] - CH_FROM[0], HOVER[2] - CH_FROM[2]];
const dl = Math.hypot(d0[0], d0[1]);
export const CH_DIR: V3 = [d0[0] / dl, 0, d0[1] / dl];
export const CH_YAW = Math.atan2(-CH_DIR[0], -CH_DIR[2]);
export const CRASH: V3 = [CLEAR[0] + 4.5, 0, CLEAR[2] - 4.0];

export type ChariotState = {pos: V3; broken: number; grounded: boolean; donkeys: boolean; tilt: number};

// The recall at the end shows the fight again in golden light: the chariot hangs where it fought.
const recall = (f: number) => f >= B.feared;

export const chariotAt = (f: number): ChariotState => {
  if (recall(f)) {
    const p = add(HOVER, [0, Math.sin(f * 0.05) * 0.15, -(f - B.feared) * 0.01]);
    return {pos: p, broken: 0, grounded: false, donkeys: true, tilt: 0};
  }
  if (f < ARRIVE) {
    const u = f / ARRIVE;
    // flying on a steady line, gently easing into the hover over the last stretch
    const e = u < 0.85 ? u * 0.97 : 0.8245 + (1 - Math.pow(1 - (u - 0.85) / 0.15, 2)) * 0.1755;
    const p = mix3(CH_FROM, HOVER, e);
    return {pos: add(p, [0, Math.sin(f * 0.06) * 0.18, 0]), broken: 0, grounded: false, donkeys: true, tilt: 0};
  }
  const hover = add(HOVER, [Math.sin(f * 0.04) * 0.3, Math.sin(f * 0.07) * 0.2, -(f - ARRIVE) * 0.012]);
  if (f < B.chariotSmash) {
    // jolted by every strike
    let jolt = 0;
    for (const h of [B.hit1, s(46.9), B.bowSnap]) if (f >= h && f < h + 12) jolt = Math.sin((f - h) * 1.6) * (1 - (f - h) / 12) * 0.25;
    return {pos: add(hover, [jolt, jolt * 0.5, 0]), broken: 0, grounded: false, donkeys: true, tilt: jolt * 0.4};
  }
  const top = add(HOVER, [0, 0, -(B.chariotSmash - ARRIVE) * 0.012]);
  if (f < B.crash) {
    const u = (f - B.chariotSmash) / (B.crash - B.chariotSmash);
    const p = mix3(top, CRASH, u * u);
    return {pos: p, broken: u, grounded: false, donkeys: false, tilt: u * 0.5};
  }
  return {pos: CRASH, broken: 1, grounded: true, donkeys: false, tilt: 0.42};
};

// ----- Jatayu -----
// Lying on his side the square drawing is turned a quarter round its middle; this drops it so the body touches the ground.
export const LIE_Y = -0.62;
export type JatayuState = {pos: V3; pose: JatayuPose; expr: JatayuExpr; roll: number; glow: number; airborne: boolean};

// Positions around the chariot during the fight, relative to the chariot (x right of travel, y up, z back).
type JK = {f: number; o: V3; pose: JatayuPose};
const FIGHT: JK[] = [
  {f: B.attack, o: [3.6, 2.2, 3.4], pose: 'fly'},
  {f: B.hit1, o: [1.1, 0.7, 0.7], pose: 'attack'},
  {f: s(45.2), o: [-3.2, 2.6, -1.2], pose: 'fly'},
  {f: B.battle, o: [-3.4, 1.0, 2.0], pose: 'fly'},
  {f: s(46.9), o: [-1.0, 1.0, 0.6], pose: 'attack'},
  {f: s(47.8), o: [2.8, 3.0, -2.2], pose: 'fly'},
  {f: B.bow, o: [3.2, 1.6, 1.8], pose: 'fly'},
  {f: B.bowSnap, o: [1.2, 1.0, 0.6], pose: 'attack'},
  {f: s(51.2), o: [3.0, 2.4, -1.4], pose: 'fly'},
  {f: B.chariotSmash, o: [0.2, 1.8, -1.6], pose: 'attack'},
];

const interpK = (keys: JK[], f: number) => {
  if (f <= keys[0].f) return {o: keys[0].o, pose: keys[0].pose};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f < b.f) {
      const u = sine((f - a.f) / (b.f - a.f));
      // an arc: lift in the middle of each pass
      const o = add(mix3(a.o, b.o, u), [0, Math.sin(Math.PI * u) * 0.8, 0]);
      return {o, pose: u > 0.7 ? b.pose : a.pose === 'attack' && u < 0.25 ? 'attack' : 'fly'};
    }
  }
  const l = keys[keys.length - 1];
  return {o: l.o, pose: l.pose};
};

// Turn a chariot-relative offset into the world.
export const rel = (c: V3, o: V3): V3 => {
  const rx = -CH_DIR[2];
  const rz = CH_DIR[0];
  return [c[0] + rx * o[0] - CH_DIR[0] * o[2], c[1] + o[1], c[2] + rz * o[0] - CH_DIR[2] * o[2]];
};

export const jatayuAt = (f: number): JatayuState => {
  // the ending: back on his rock at sunset, wings wide open
  if (f >= B.stand) return {pos: PERCH, pose: 'fly', expr: 'stern', roll: 0, glow: 0.35, airborne: false};
  if (recall(f)) {
    const c = chariotAt(f).pos;
    if (f < B.oldBird) return {pos: rel(c, [4.5, 3.6, -1.5]), pose: 'fly', expr: 'stern', roll: -0.2, glow: 0, airborne: true};
    if (f < B.because) {
      const u = sine((f - B.oldBird) / (B.because - B.oldBird));
      return {pos: rel(c, mix3([4.0, 3.2, -1.2], [1.4, 1.2, 0.4], u)), pose: 'attack', expr: 'stern', roll: -0.35 * (1 - u), glow: 0, airborne: true};
    }
    if (f < B.realValour) {
      // rising into the light
      const u = ramp(f, B.because, B.realValour);
      const from = rel(c, [1.4, 1.2, 0.4]);
      return {pos: mix3(from, add(from, [-6, 16, -14]), u), pose: 'fly', expr: 'calm', roll: 0, glow: u, airborne: true};
    }
    return {pos: add(rel(c, [0, 0, 0]), [-6, 40, -14]), pose: 'fly', expr: 'calm', roll: 0, glow: 1, airborne: true};
  }
  // the opening promise: the old bird on his rock, wings thrown open
  if (f >= B.butOld && f < B.when) return {pos: PERCH, pose: 'fly', expr: 'stern', roll: 0, glow: 0, airborne: false};
  if (f < B.launch) {
    const expr: JatayuExpr = f >= B.decided ? 'stern' : 'calm';
    // the wind ruffles him; he rises a little when he decides
    return {pos: PERCH, pose: f >= s(40.4) ? 'fly' : 'perch', expr, roll: 0, glow: 0, airborne: false};
  }
  if (f < B.attack) {
    const u = sine((f - B.launch) / (B.attack - B.launch));
    const to = rel(chariotAt(B.attack).pos, FIGHT[0].o);
    const mid = add(mix3(PERCH, to, 0.5), [0, 4, 0]);
    const p = mix3(mix3(PERCH, mid, u), mix3(mid, to, u), u);
    return {pos: p, pose: 'fly', expr: 'stern', roll: -0.25 * Math.sin(Math.PI * u), glow: 0, airborne: true};
  }
  if (f < B.chariotSmash + 4) {
    const k = interpK(FIGHT, f);
    const c = chariotAt(f).pos;
    return {pos: rel(c, k.o), pose: k.pose, expr: 'stern', roll: k.pose === 'attack' ? -0.2 : 0.15 * Math.sin(f * 0.1), glow: 0, airborne: true};
  }
  const groundHover: V3 = add(JATAYU_G, [0, 0.9, 0]);
  if (f < B.crash + 10) {
    const u = sine((f - B.chariotSmash - 4) / (B.crash + 10 - B.chariotSmash - 4));
    const from = rel(chariotAt(B.chariotSmash + 4).pos, FIGHT[FIGHT.length - 1].o);
    return {pos: mix3(from, groundHover, u), pose: 'fly', expr: 'stern', roll: 0, glow: 0, airborne: true};
  }
  if (f < B.cut) {
    // between Ravana and Sita, lunging and beating his wings
    const lunge = Math.max(0, Math.sin((f - B.crash) * 0.16));
    return {pos: add(groundHover, [-lunge * 0.6, Math.sin(f * 0.3) * 0.15, 0]), pose: lunge > 0.6 ? 'attack' : 'fly', expr: 'stern', roll: 0, glow: 0, airborne: true};
  }
  if (f < B.fall) return {pos: groundHover, pose: 'wounded', expr: 'weak', roll: 0.1 * Math.min(1, (f - B.cut) / 10), glow: 0, airborne: true};
  if (f < B.landed) {
    const u = ramp(f, B.fall, B.landed);
    return {pos: add(JATAYU_G, [0.4 * u, 0.9 * (1 - u * u) + LIE_Y * u, 0]), pose: 'wounded', expr: 'weak', roll: 1.35 * u, glow: 0, airborne: false};
  }
  // lying where he fell
  const glow = f >= B.andThen ? ramp(f, B.andThen, B.rites) : 0;
  // (ForestWorld swaps to the lying drawing, which already sits on the ground)
  return {pos: add(JATAYU_G, [0.4, 0, 0]), pose: 'wounded', expr: 'weak', roll: 1.35, glow, airborne: false};
};

// ----- Ravana and Sita -----
export type FigureState = {pos: V3; pose: MythicPose; expr: MythicExpr; visible: boolean; held?: 'sword' | 'bow' | 'none'};

export const RIDE_RAVANA: V3 = [0, 0.32, 0.25]; // on the chariot floor, chariot-relative

export const ravanaAt = (f: number): FigureState => {
  if (f >= B.stand) return {pos: RAVANA_G, pose: 'stand', expr: 'stern', visible: false};
  if (recall(f)) {
    const c = chariotAt(f).pos;
    const pose: MythicPose = f >= B.oldBird && f < B.because ? 'raise' : 'hold';
    return {pos: rel(c, RIDE_RAVANA), pose, expr: 'stern', visible: true, held: 'sword'};
  }
  if (f >= B.later) return {pos: RAVANA_G, pose: 'stand', expr: 'stern', visible: false};
  const c = chariotAt(f);
  if (f < B.crash) {
    let pose: MythicPose = 'grab';
    let held: FigureState['held'] = 'sword';
    if (f >= B.attack && f < B.bow) pose = Math.sin((f - B.attack) * 0.12) > 0 ? 'raise' : 'hold';
    if (f >= B.bow && f < B.bowSnap) {
      pose = 'hold';
      held = 'bow';
    }
    if (f >= B.bowSnap && f < B.chariotSmash) {
      pose = 'stand';
      held = 'none';
    }
    const p = f < B.chariotSmash ? rel(c.pos, RIDE_RAVANA) : add(c.pos, [-0.6, 0.3, 0.4]);
    return {pos: p, pose, expr: 'stern', visible: true, held};
  }
  if (f < B.raise) return {pos: RAVANA_G, pose: 'grab', expr: 'stern', visible: true, held: 'sword'};
  if (f < B.cut + 20) return {pos: RAVANA_G, pose: 'raise', expr: 'stern', visible: true, held: 'sword'};
  return {pos: RAVANA_G, pose: 'hold', expr: 'stern', visible: true, held: 'sword'};
};

export const sitaAt = (f: number): FigureState => {
  if (f >= B.later || recall(f)) return {pos: SITA_G, pose: 'namaste', expr: 'sad', visible: false};
  // on the chariot she stands beside Ravana; ForestWorld places her to his left as the camera sees it
  if (f < B.crash) return {pos: [0, 0, 0], pose: 'fly', expr: f >= B.attack ? 'awe' : 'sad', visible: true};
  return {pos: SITA_G, pose: f >= B.cut ? 'fly' : 'namaste', expr: f >= B.cut ? 'sad' : 'awe', visible: true};
};

// ----- Ram and Lakshman, at dusk -----
export const RAM_AT: V3 = add(JATAYU_G, [-1.7, 0, 1.0]);
export const LAKSHMAN_AT: V3 = add(JATAYU_G, [-2.8, 0, 0.5]);
const WALK_FROM: V3 = add(JATAYU_G, [-7, 0, 4]);

export const ramAt = (f: number): FigureState & {bob: number} => {
  if (f < B.later || f >= B.feared) return {pos: RAM_AT, pose: 'hold', expr: 'calm', visible: false, bob: 0};
  if (f >= B.pyre) return {pos: add(PYRE, [1.4, 0, 2.6]), pose: 'namaste', expr: 'sad', visible: true, bob: 0};
  const u = ramp(f, B.later, B.ramArrives);
  const walking = u > 0 && u < 1;
  const pos = mix3(WALK_FROM, RAM_AT, u);
  const pose: MythicPose = f >= B.rites ? 'namaste' : 'hold';
  const expr: MythicExpr = f >= B.lastBreath ? 'sad' : f >= B.found ? 'awe' : 'calm';
  return {pos, pose, expr, visible: true, bob: walking ? Math.abs(Math.sin(f * 0.32)) * 0.05 : 0};
};

export const lakshmanAt = (f: number): FigureState & {bob: number} => {
  if (f < B.later || f >= B.feared) return {pos: LAKSHMAN_AT, pose: 'hold', expr: 'calm', visible: false, bob: 0};
  if (f >= B.pyre) return {pos: add(PYRE, [2.7, 0, 2.0]), pose: 'namaste', expr: 'sad', visible: true, bob: 0};
  const u = ramp(f, B.later + 10, B.ramArrives + 14);
  const walking = u > 0 && u < 1;
  const pos = mix3(add(WALK_FROM, [-1.2, 0, 0.4]), LAKSHMAN_AT, u);
  const pose: MythicPose = f >= B.rites ? 'namaste' : 'hold';
  const expr: MythicExpr = f >= B.found ? 'sad' : 'calm';
  return {pos, pose, expr, visible: true, bob: walking ? Math.abs(Math.sin(f * 0.32 + 1.3)) * 0.05 : 0};
};

// ----- Light: golden afternoon for the fight, dusk for Ram's arrival and the rites, a deep gold for the end -----
export type Mode = 'day' | 'dusk' | 'gold';
export const modeAt = (f: number): Mode => (f >= B.feared ? 'gold' : f >= B.later ? 'dusk' : 'day');

export const J_SIZE = J_H;
