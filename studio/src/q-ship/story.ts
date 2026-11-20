// Where everything is at frame f, so the worlds and the camera read the same positions.
// The steamer sits at the origin, bow towards -x, deck at DECK. The sea surface is y = 0.
// Lifeboats hang on davits on the +z (port) side; the U-boat comes in from +z.
import type {V3} from '../shared/flat';
import {ramp} from '../shared/camera';
import {B, s} from './beats';

export const DECK = 2.6;
export const BEAM = 3.1; // half the ship's width at the deck
export const BRIDGE: V3 = [5, DECK + 2.6, 0]; // floor of the bridge deck
export const WING: V3 = [5, DECK + 2.6, 3.2]; // the captain's spot on the port bridge wing
export const COOP: V3 = [-9.5, DECK, 1.0];
export const CRATE: V3 = [-3.0, DECK, 1.9];
export const DUMMY: V3 = [16.2, DECK, 0.9]; // the fake deckhouse aft, a gun behind its hinged wall
export const RAIL_Z = 2.75; // inner face of the port bulwark
export const LINEUP_X = [8.4, 9.4, 10.4, 11.4, 12.4]; // crew lined up for the morning drill (z = 1.6)
export const CAPT_DRILL: V3 = [11.2, DECK, -0.4];
export const BOATS_X = [7.2, 11.6];

// Which part of the story a frame belongs to.
export type Phase = 'abandon' | 'normal' | 'drill' | 'attack';
export const phaseAt = (f: number): Phase =>
  f < B.atlantic ? 'abandon' : f < B.every ? 'normal' : f < B.periscope ? 'drill' : 'attack';

// Lifeboat i: on its davits (high), lowered, or in the water rowing away.
export const boatAt = (i: number, f: number): {pos: V3; inWater: boolean} => {
  const x = BOATS_X[i];
  const hang: V3 = [x, DECK + 0.9, BEAM + 1.0];
  const ph = phaseAt(f);
  if (ph === 'normal' || ph === 'drill') return {pos: hang, inWater: false};
  if (ph === 'abandon') {
    // the opening: both boats coming down the side
    const u = ramp(f, 10, B.atlantic - 20) * (i ? 0.75 : 1);
    return {pos: [x, hang[1] - u * (hang[1] - 0.25), hang[2]], inWater: u > 0.95};
  }
  // the attack: lowered on "scrambles", in the water by "shouting", then pulling away
  const down = ramp(f, B.scramble + 10 + i * 8, B.shouting + 6);
  const away = ramp(f, B.shouting + 6, B.men + 40);
  return {pos: [x - away * (i ? -2 : 3), hang[1] - down * (hang[1] - 0.25), hang[2] + away * (7 + i * 3)], inWater: down > 0.98};
};

// The U-boat in our story (attack phase): periscope first, then surfaced and creeping in.
// heading: the boat points towards -z (at the ship).
export const SUB_LEN = 26;
export const subAt = (f: number): {pos: V3; depth: number; scope: number} => {
  const z = 44 - 10 * ramp(f, B.creeps, B.slides) - 8 * ramp(f, B.slides, s(71));
  const x = -3;
  // depth 1 = running submerged (only the periscope shows), 0 = surfaced
  const depth = 1 - ramp(f, B.rises, B.slow + 10);
  const scope = ramp(f, B.periscope + 2, B.breaks + 6);
  return {pos: [x, -0.15 - depth * 4.2, z], depth, scope};
};

// The hunting U-boat early on, far from our ship (separate spot on the same ocean).
export const HUNT: V3 = [160, 0, -140];
export const huntAt = (f: number): {pos: V3; depth: number} => ({
  pos: [HUNT[0] - (f - B.german) * 0.03, 0, HUNT[2]],
  // cruising on the surface while it hunts; under water at the start of "so a sub would rather surface", then up
  depth: f < B.so ? 0 : 1 - ramp(f, B.surface - 4, B.finish + 12),
});
// The small sailing ship the hunter shells, ahead of it.
export const PREY: V3 = [HUNT[0] - 2, 0, HUNT[2] - 48];

// The hidden gun crews lying flat behind the port rail (x positions, z just inside the bulwark).
export const PRONE_X = {g1: -7.6, g3: -5.2, g2: 1.8, c3: 9.6};
