// Where everything is, in each of the three places. Every place is its own world with y = 0 as the ground.
//  dock:    an Egyptian quay with the troopship, its gangway, the "no pets" sign and the sergeant's enlistment desk
//  camp:    the Polish army camp in Iran, 1942 (tents, a truck, the stencilled crate)
//  cassino: the supply dump below Monte Cassino (the ammunition truck, the crate stack, the same desk for the ending)
import type {V3} from '../shared/flat';
import {ramp} from '../shared/camera';
import {B} from './beats';

// The enlistment desk sits at the same spot at the dock and at Cassino, so the last shot repeats the first.
export const DESK: V3 = [-4, 0, 2];
export const DESK_TOP = 0.78;
export const SERGEANT: V3 = [-4.55, 0, 1.55]; // sitting behind the desk
export const BEAR_SEAT: V3 = [-3.05, 0, 2.55]; // the bear sitting on a crate beside the desk
export const FORM: V3 = [-3.95, DESK_TOP + 0.006, 2.08]; // the enlistment form lying on the desk
export const BOOK: V3 = [-4.45, DESK_TOP + 0.012, 2.12]; // the paybook beside it

// Dock: the quay edge runs along x at z = -4; the troopship lies beyond it, its side door at the top of the gangway.
export const QUAY_Z = -4;
export const SHIP_Z = -10; // centre line of the hull
export const DOOR: V3 = [6, 3.0, -6.9]; // the open door in the hull side
export const RAMP_FOOT: V3 = [6, 0, -0.6];
export const SIGN: V3 = [7.6, 0, -0.4];
export const OFFICER: V3 = [4.5, 0, 0.4];
// Wojtek walking up the gangway on "Private Wojtek walks up the ramp."
export const rampWalk = (f: number): V3 => {
  const u = ramp(f, B.private - 6, B.cassino);
  return [RAMP_FOOT[0], RAMP_FOOT[1] + u * (DOOR[1] - RAMP_FOOT[1]), RAMP_FOOT[2] + u * (DOOR[2] - RAMP_FOOT[2])];
};

// Camp in Iran.
export const BOY: V3 = [0.2, 0, 1.2];
export const CUB_HELD: V3 = [0.42, 0.4, 1.5];
export const TRADER: V3 = [-1.3, 0, 0.9]; // the soldier handing over tins
export const CAMP_CRATE: V3 = [2.6, 0, -0.6]; // IRAN 1942 stencil
export const FIRE: V3 = [0, 0, -1.6];

// Cassino: the truck at the right, the stack the men build at the left.
export const TRUCK: V3 = [4, 0, -1.5];
export const STACK: V3 = [-2.2, 0, -0.8];
export const WATCH_SEAT: V3 = [-0.6, 0, 2.2];
// Wojtek carrying crates from the truck to the stack, back and forth from "picked one up".
export const bearCarryAt = (f: number): {pos: V3; loaded: boolean; flip: boolean} => {
  const from: V3 = [TRUCK[0] - 1.6, 0, TRUCK[2] + 1.6];
  const to: V3 = [STACK[0] + 1.0, 0, STACK[2] + 1.2];
  if (f < B.picked) return {pos: from, loaded: false, flip: false};
  // out with a crate takes 66 frames, back empty 24: so he is carrying on almost every line
  const OUT = 66;
  const BACK = 24;
  const t = (f - B.picked) % (OUT + BACK);
  const out = t < OUT;
  const u = out ? t / OUT : (t - OUT) / BACK;
  const a = out ? from : to;
  const b = out ? to : from;
  const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  return {pos: [a[0] + (b[0] - a[0]) * e, 0, a[2] + (b[2] - a[2]) * e], loaded: out, flip: !out};
};
// How many crates sit on the stack: it grows as the men (and then the bear) bring more.
export const stackCount = (f: number) => {
  const men = Math.floor(Math.max(0, f - B.cassino) / 40);
  const bear = f < B.picked ? 0 : Math.floor((f - B.picked + 24) / 90);
  return Math.min(14, 3 + men + bear);
};
