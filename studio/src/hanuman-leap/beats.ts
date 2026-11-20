// "Hanuman's leap": the story's timeline (frames keyed to the narration) and where things stand in each world.
// Source: Valmiki Ramayana, Kishkindha Kanda (the rishis' curse, Jambavan's reminder) and Sundara Kanda (the leap
// from Mahendra, Ashoka Vatika, Shri Ram's ring for Sita).
import type {V3} from '../shared/flat';

// seconds of narration -> frame
export const s = (sec: number) => Math.round(sec * 30);

export const B = {
  hanumanNamed: s(4.64),
  armyHeadsDown: s(16.96),
  flashbackIn: s(19.12),
  rishiMeditate: s(22.48),
  yagya: s(24.0),
  leapOverFire: s(24.5),
  potTips: s(24.75),
  curse: s(26.4),
  curseGiven: s(27.2),
  forget: s(29.44),
  flashbackOut: s(33.4),
  jambavanWalks: s(34.0),
  jambavanArrives: s(36.2),
  pavanputra: s(38.32),
  sky: s(39.92),
  whoYouAre: s(45.76),
  growStart: s(48.4),
  growEnd: s(51.0),
  mahendra: s(51.68),
  jaiShriRam: s(53.92),
  crouch: s(56.6),
  leap: s(57.12),
  overSea: s(58.56),
  vatika: s(59.92),
  hanumanDrops: s(60.96),
  ring: s(63.04),
  maa: s(65.2),
  sitaSmiles: s(66.16),
  prabhu: s(67.52),
  lesson: s(69.5),
  yourJambavan: s(76.5),
  comment: s(79.36),
};

// ----- Sea world: the southern shore, the ocean, Mahendra and far Lanka -----
export const ROCK: V3 = [-1.5, 0, -0.2]; // the rock Hanuman stands on, by the water
export const ROCK_TOP = 0.66;
export const HANUMAN_SHORE: V3 = [ROCK[0], ROCK_TOP, ROCK[2]];
export const JAMBAVAN_FROM: V3 = [-4.4, 0, 3.0];
export const JAMBAVAN_AT: V3 = [-2.35, 0, 0.3];
export const MAHENDRA: V3 = [16, 0, 16]; // foot of the mountain
export const MAHENDRA_H = 9;
export const SUMMIT: V3 = [MAHENDRA[0], MAHENDRA_H - 0.25, MAHENDRA[2]];
export const LANKA: V3 = [12, 0, -330];
export const GIANT = 6.5; // Hanuman's size on the mountain, as a multiple of normal

// ----- Ashram world (flashback) -----
export const RISHI: V3 = [0, 0, 0];
export const RISHI2: V3 = [-1.25, 0, -0.5];
export const KUND: V3 = [0.75, 0, 0.95];
export const POT: V3 = [-0.45, 0, 0.62];
export const CHILD_AFTER: V3 = [1.55, 0, 1.35];

// ----- Ashoka Vatika (night) -----
export const SITA: V3 = [-0.55, 0.26, 0];
export const HANUMAN_VATIKA: V3 = [0.62, 0, 0.55];
export const H_VATIKA = 1.2;
// Where the ring sits in Hanuman's raised hand ('offer' pose: canvas point 452, 410 of 512 x 1024).
export const RING: V3 = [HANUMAN_VATIKA[0] + (452 / 512 - 0.5) * H_VATIKA * 0.5, (1 - 410 / 1024) * H_VATIKA, HANUMAN_VATIKA[2] + 0.02];
