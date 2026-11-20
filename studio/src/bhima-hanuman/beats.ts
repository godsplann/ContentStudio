// "Bhima and the old monkey": the story's timeline (frames keyed to the narration at 1.15x) and where everyone stands.
// Source: Vyasa's Mahabharata, Vana Parva 146-150. Times come from words.ts (seconds, already divided by 1.15).
import type {V3} from '../shared/flat';
import type {MythicExpr, MythicPose} from '../shared/mythic';
import {ramp} from '../shared/camera';

export const s = (sec: number) => Math.round(sec * 30);

export const B = {
  // hook: flash-forward to Bhima straining at the tail
  oldMonkey: s(2.92), // "एक बूढ़े बंदर की पूँछ तक नहीं हिला सका।"
  // the lotus, at the forest camp (morning)
  exile: s(6.12), // "वनवास के दिनों में,"
  wind: s(7.44), // "हवा उड़ाकर द्रौपदी के पास"
  lotus: s(9.25), // "एक दिव्य, सुगंधित कमल ले आई।"
  caught: s(11.2),
  asks: s(12.03), // "द्रौपदी ने भीम से ऐसे और फूल माँगे।"
  // the climb (afternoon)
  climb: s(15.23), // "भीम गदा उठाकर गंधमादन पर्वत पर चढ़ चले"
  roar: s(18.43), // "गरजते हुए,"
  uproot: s(19.41), // "पेड़ उखाड़ते हुए।"
  // the banana grove
  grove: s(21.04), // "केले के एक घने वन में, संकरे रास्ते पर,"
  lying: s(24.03), // "एक बूढ़ा बंदर लेटा था।"
  shout: s(26.09), // "भीम ने ज़ोर से कहा — हटो, रास्ता दो!"
  hato: s(27.59),
  eyes: s(29.5), // "बंदर ने धीरे से आँखें खोलीं"
  open: s(30.9),
  oldSick: s(32.0), // "मैं बूढ़ा और बीमार हूँ। लाँघकर निकल जाओ।"
  stopped: s(36.31), // "भीम रुक गए।"
  soul: s(37.84), // "हर शरीर में परमात्मा है। मैं तुम्हें लाँघूँगा नहीं।"
  leap: s(41.88), // "वरना मैं वैसे ही छलाँग लगाता, जैसे मेरे भाई हनुमान ने समुद्र लाँघा था।"
  smiled: s(46.96), // "बंदर मुस्कुराया…"
  unaware: s(48.63), // "भीम नहीं जानते थे कि वे किससे बात कर रहे हैं।"
  moveTail: s(52.1), // "तो मेरी पूँछ हटाकर निकल जाओ।"
  laughed: s(54.47), // "भीम ने हँसकर एक हाथ से पूँछ उठाई…"
  oneHand: s(55.65),
  noMove: s(57.53), // "पूँछ नहीं हिली।"
  bothHands: s(58.96), // "फिर दोनों हाथ लगाए। भौंहें तन गईं, पसीना छूट गया…"
  stillNot: s(63.3), // "पूँछ टस से मस नहीं हुई।"
  ashamed: s(65.88), // "लज्जित भीम ने हाथ जोड़े — आप कौन हैं?"
  reveal: s(69.66), // "मैं वही हनुमान हूँ। तुम्हारा बड़ा भाई। हम दोनों पवन-पुत्र हैं।"
  brothers: s(72.7),
  godsPath: s(74.82), // "आगे देवताओं का मार्ग है, मनुष्यों का नहीं।"
  blocked: s(77.88), // "इसीलिए मैंने तुम्हारा रास्ता रोका।"
  pleads: s(80.28), // "भीम ने विनती की — मुझे वह रूप दिखाइए, जिससे आपने समुद्र लाँघा था।"
  agePassed: s(85.84), // "हनुमान बोले — वह युग बीत गया। समय बदल चुका है।"
  insists: s(90.68), // "पर भीम नहीं माने।"
  grow: s(92.24), // "तब हनुमान बढ़ने लगे… पूरे वन को ढकते हुए, पर्वत जितने ऊँचे।"
  tall: s(95.6),
  dazzled: s(97.39), // "भीम की आँखें चौंधिया गईं। उन्होंने आँखें मूँद लीं।"
  shrink: s(100.3),
  ravana: s(101.25), // "फिर भीम ने पूछा — इतनी शक्ति होते हुए, आपने रावण को ख़ुद क्यों नहीं मारा?"
  answer: s(106.99), // "हनुमान ने कहा — तब श्रीराम की कीर्ति कम हो जाती।"
  glory: s(108.52),
  embrace: s(111.34), // "उन्होंने भीम को गले लगाया — तुम्हें छूकर मुझे श्रीराम की याद आ गई।"
  remember: s(113.5),
  promise: s(116.59), // "और वचन दिया —"
  flag: s(118.03), // "युद्ध में मैं अर्जुन के रथ की ध्वजा पर रहूँगा।"
  thunder: s(121.22), // "मेरी गर्जना शत्रुओं का साहस तोड़ देगी।"
  gita: s(124.63), // "इसीलिए गीता में अर्जुन को कहा गया — कपिध्वज, जिसकी ध्वजा पर वानर है।"
  kapi: s(127.1),
  boon: s(130.09), // "और श्रीराम का वरदान है — जब तक धरती पर राम-कथा कही जाएगी, हनुमान जीवित रहेंगे।"
  katha: s(131.97),
  ending: s(136.77), // "जिस पूँछ को भीम हिला न सके, उसी ने उन्हें सबसे बड़ी सीख दी —"
  bow: s(141.66), // "असली बल, झुकने में है।"
};

// ----- Places -----
// The grove is at the origin; the path runs along z (Bhima comes from +z, heading on to -z).
export const MONKEY: V3 = [-1.45, 0, -0.1]; // the old monkey lies beside the path, his tail across it
export const TAIL_TIP: V3 = [1.05, 0, 0.05]; // where the tail curls up off the ground (Bhima grips here)
export const HANUMAN_AT: V3 = [-1.0, 0, -0.35]; // where Hanuman stands once revealed
export const GIANT_AT: V3 = [-7, 0, -16]; // he steps back as he grows, so he does not crush Bhima
export const BHIMA_STOP: V3 = [0.2, 0, 1.75];
export const BHIMA_GRAB: V3 = [1.12, 0, 0.62];
export const CAMP: V3 = [-110, 0, 60]; // the Pandavas' forest camp
export const HUT: V3 = [CAMP[0] - 3, 0, CAMP[2] - 4];
export const FIRE: V3 = [CAMP[0] + 0.5, 0, CAMP[2] + 0.5];
export const SLOPE: V3 = [95, 0, 95]; // the climb up Gandhamadana
export const SLOPE_A = 0.22; // the hillside rises towards -z at this angle
export const slopeY = (z: number) => Math.max(0, (SLOPE[2] - z) * Math.tan(SLOPE_A));

export const BHIMA_H = 1.95;
export const MAN_H = 1.6;
export const DRAUPADI_H = 1.55;
export const HANUMAN_H = 1.75;
export const MONKEY_H = 1.15; // the lying drawing's plane height (aspect 2)

export type Mode = 'day' | 'gold' | 'divine' | 'night' | 'sunset';
export const modeAt = (f: number): Mode =>
  f >= B.ending ? 'sunset' : f >= B.boon && f < B.ending ? 'night' : f >= B.grow && f < B.promise ? 'divine' : f >= B.exile && f < B.climb ? 'day' : 'gold';

const mix = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
export const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

type Fig = {pos: V3; pose: MythicPose; expr: MythicExpr; bob: number; visible: boolean; scale?: number; roll?: number};

// ----- Bhima -----
export const BHIMA_CAMP: V3 = add(CAMP, [0.95, 0, 0.8]);
const slopeStart: V3 = add(SLOPE, [0, 0, 9]);
const slopeEnd: V3 = add(SLOPE, [0.8, 0, -10]);
export const bhimaSlope = (f: number): V3 => {
  const p = mix(slopeStart, slopeEnd, Math.min(1, Math.max(0, (f - B.climb) / (B.grove - B.climb))));
  return [p[0], slopeY(p[2]), p[2]];
};
const groveStart: V3 = [0.15, 0, 13];

export const bhimaAt = (f: number): Fig => {
  const walk = (on: boolean) => (on ? Math.abs(Math.sin(f * 0.33)) * 0.05 : 0);
  // hook: the flash-forward to the strain
  if (f < B.exile) return {pos: BHIMA_GRAB, pose: 'lift', expr: 'strain', bob: Math.sin(f * 1.3) * 0.01, visible: true};
  if (f < B.climb) return {pos: BHIMA_CAMP, pose: 'hold', expr: f < B.asks + 40 ? 'calm' : 'happy', bob: 0, visible: f >= B.asks - 10};
  if (f < B.grove) return {pos: bhimaSlope(f), pose: 'hold', expr: f >= B.roar ? 'roar' : 'stern', bob: walk(true), visible: true};
  if (f < B.shout) {
    const u = Math.min(1, (f - B.grove) / (B.shout - 12 - B.grove));
    return {pos: mix(groveStart, BHIMA_STOP, u), pose: 'hold', expr: 'stern', bob: walk(u < 1), visible: true};
  }
  if (f < B.stopped) return {pos: BHIMA_STOP, pose: 'hold', expr: f < B.eyes ? 'roar' : 'stern', bob: 0, visible: true};
  if (f < B.leap) return {pos: BHIMA_STOP, pose: 'namaste', expr: 'calm', bob: 0, visible: true};
  if (f < B.laughed) return {pos: BHIMA_STOP, pose: 'hold', expr: f < B.unaware ? 'stern' : 'calm', bob: 0, visible: true};
  if (f < B.bothHands) {
    const u = ramp(f, B.laughed, B.laughed + 30);
    return {pos: mix(BHIMA_STOP, BHIMA_GRAB, u), pose: 'grab', expr: f < B.noMove ? 'happy' : 'awe', bob: 0, visible: true};
  }
  if (f < B.ashamed) return {pos: BHIMA_GRAB, pose: 'lift', expr: 'strain', bob: Math.sin(f * 1.3) * 0.012, visible: true};
  if (f < B.reveal) return {pos: mix(BHIMA_GRAB, BHIMA_STOP, ramp(f, B.ashamed, B.ashamed + 24)), pose: 'namaste', expr: 'sad', bob: 0, visible: true};
  if (f < B.pleads) return {pos: BHIMA_STOP, pose: 'namaste', expr: 'awe', bob: 0, visible: true};
  if (f < B.grow) return {pos: BHIMA_STOP, pose: 'namaste', expr: f >= B.insists ? 'stern' : 'calm', bob: 0, visible: true};
  if (f < B.ravana) return {pos: BHIMA_STOP, pose: 'namaste', expr: f >= B.dazzled ? 'strain' : 'awe', bob: 0, visible: true};
  if (f < B.embrace) return {pos: BHIMA_STOP, pose: 'namaste', expr: f < B.answer ? 'awe' : 'calm', bob: 0, visible: true};
  if (f < B.promise) return {pos: [0.35, 0, 1.15], pose: 'namaste', expr: 'happy', bob: 0, visible: true};
  if (f >= B.boon && f < B.ending) return {pos: add(FIRE, [1.6, 0, 1.4]), pose: 'namaste', expr: 'calm', bob: 0, visible: true};
  // the ending: bowing to his brother
  return {pos: BHIMA_STOP, pose: 'namaste', expr: 'happy', bob: 0, visible: true, roll: -0.1 * ramp(f, B.bow - 10, B.bow + 20)};
};

// ----- The old monkey, then Hanuman -----
export const monkeyExpr = (f: number): MythicExpr => {
  if (f < B.exile) return 'calm';
  if (f < B.open) return 'sleep';
  if (f < B.stopped) return 'sad';
  if (f >= B.smiled && f < B.ashamed) return 'happy';
  return 'calm';
};
// 0 = the frail old monkey lying down; 1 = Hanuman standing in his own form
export const revealAt = (f: number) => (f >= B.ending ? 1 : ramp(f, B.reveal, B.reveal + 18));
export const hanumanAt = (f: number): Fig & {glow: number} => {
  const grow = ramp(f, B.grow, B.tall);
  const shrink = ramp(f, B.shrink, B.ravana - 4);
  const g = grow * (1 - shrink);
  const scale = 1 + 34 * Math.pow(g, 1.6);
  const pos = mix(HANUMAN_AT, GIANT_AT, Math.min(1, g * 3));
  let pose: MythicPose = 'bless';
  let expr: MythicExpr = 'happy';
  if (f >= B.godsPath && f < B.pleads) {
    pose = 'bless';
    expr = 'calm';
  }
  if (f >= B.agePassed && f < B.grow) expr = 'calm';
  if (f >= B.grow && f < B.ravana) pose = 'fly';
  if (f >= B.answer && f < B.embrace) pose = 'namaste';
  if (f >= B.embrace && f < B.promise) {
    pose = 'bless';
    expr = 'happy';
  }
  const atEmbrace: V3 = [-0.35, 0, 0.75];
  const p = f >= B.embrace && f < B.promise ? mix(HANUMAN_AT, atEmbrace, ramp(f, B.embrace, B.embrace + 30)) : pos;
  const glow = f >= B.reveal ? 0.5 + 0.5 * ramp(f, B.reveal, B.reveal + 20) * (1 - ramp(f, B.reveal + 20, B.reveal + 70)) : 0;
  return {pos: p, pose, expr, bob: 0, visible: true, scale, glow: Math.max(glow, g)};
};

// ----- Draupadi and the lotus -----
export const DRAUPADI_AT: V3 = add(CAMP, [-0.4, 0, 0.2]);
export const draupadiAt = (f: number): Fig => ({
  pos: DRAUPADI_AT,
  pose: f >= B.caught ? 'hold' : 'stand',
  expr: f < B.lotus ? 'calm' : f < B.caught ? 'awe' : 'happy',
  bob: 0,
  visible: true,
});
// the lotus rides the wind down to her hand
const lotusPath: V3[] = [add(CAMP, [14, 9, -18]), add(CAMP, [6, 5, -6]), add(CAMP, [1.5, 2.6, -1]), add(DRAUPADI_AT, [0.3, 1.25, 0.25])];
export const lotusAt = (f: number): V3 | null => {
  if (f < B.wind || f >= B.caught) return null;
  const u = (f - B.wind) / (B.caught - B.wind);
  const seg = Math.min(2, Math.floor(u * 3));
  const v = u * 3 - seg;
  const e = -(Math.cos(Math.PI * v) - 1) / 2;
  const p = mix(lotusPath[seg], lotusPath[seg + 1], e);
  return [p[0] + Math.sin(f * 0.15) * 0.3, p[1] + Math.sin(f * 0.21) * 0.15, p[2]];
};

// ----- The Kurukshetra chariot (the promise) -----
export const CHARIOT: V3 = [0, 0, 0];
export const FLAG_TOP: V3 = [0, 7.6, 1.1];
