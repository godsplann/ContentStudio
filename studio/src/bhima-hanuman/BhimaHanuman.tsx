// "जब भीम एक बूढ़े बंदर की पूँछ नहीं हिला सके" (Bhima and the old monkey): an Epic Mythology short in the toon-3D style.
// Source: Vyasa's Mahabharata, Vana Parva 146-150. Narration: Shardul K, sped up to 1.15x (Epic Mythology rule).
// Worlds: the Himalayan forest (camp, slope, banana grove), the ocean of Hanuman's leap (a memory), and Kurukshetra.
// The hook is a flash-forward to Bhima straining at the tail. All motion comes from the frame number.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CamCtx, V3} from '../shared/flat';
import {cameraAt, CamKey, Kick, ramp, Rig, Shot, useFontsLoaded} from '../shared/camera';
import {WordCaptions} from '../shared/WordCaptions';
import {THEMES} from '../themes';
import {ForestWorld} from './ForestWorld';
import {FieldWorld, leapAt, SeaWorld} from './MemoryWorlds';
import {add, B, BHIMA_CAMP, BHIMA_GRAB, BHIMA_STOP, bhimaSlope, CAMP, DRAUPADI_AT, FIRE, FLAG_TOP, GIANT_AT, HANUMAN_AT, MONKEY, s, slopeY} from './beats';
import {DURATION_FRAMES, words} from './words';

export const bhimaHanumanDuration = DURATION_FRAMES;

type W = 'forest' | 'sea' | 'field';
const k = (f: number, p: V3, t: V3, fov: number, ease?: CamKey['ease']): CamKey => ({f, p, t, fov, ease});
const END = DURATION_FRAMES;
const BH = (p: V3, y = 1.55): V3 => add(p, [0, y, 0]);
const MONKEY_FACE: V3 = add(MONKEY, [-0.62, 0.5, 0]);
const slopeCam = (f: number, off: V3): V3 => {
  const b = bhimaSlope(f);
  return [b[0] + off[0], slopeY(b[2] + off[2]) + off[1], b[2] + off[2]];
};
const leapCam = (f: number): V3 => add(leapAt(f), [-1.5, -1.2, 7]);

const SHOTS: Shot<W>[] = [
  // "महाभारत का सबसे बलवान योद्धा…"  Low, from beyond the tail: Bhima straining with both hands.
  {world: 'forest', from: 0, keys: [k(0, [1.75, 0.5, -2.3], BH(BHIMA_GRAB, 1.05), 40), k(B.oldMonkey, [1.5, 0.55, -1.6], BH(BHIMA_GRAB, 1.1), 38)]},
  // "एक बूढ़े बंदर की पूँछ तक नहीं हिला सका।"  Wider: the old monkey dozing, his tail across the path.
  {world: 'forest', from: B.oldMonkey, keys: [k(B.oldMonkey, [5.6, 2.3, 4.6], [-0.2, 0.55, 0.3], 44), k(B.exile, [4.8, 2.0, 3.9], [-0.2, 0.55, 0.3], 42)]},

  // Morning. "वनवास के दिनों में, हवा उड़ाकर द्रौपदी के पास"  Down from the trees to the forest camp; the wind brings blossoms.
  {world: 'forest', from: B.exile, keys: [k(B.exile, add(CAMP, [16, 13, 22]), add(CAMP, [0, 1, 0]), 46), k(B.lotus, add(CAMP, [5, 2.6, 8.5]), add(CAMP, [0.5, 1.6, -1]), 44)]},
  // "एक दिव्य, सुगंधित कमल ले आई।"  The glowing lotus drifts down into her hands.
  {world: 'forest', from: B.lotus, keys: [k(B.lotus, add(DRAUPADI_AT, [0.9, 1.5, 4.2]), add(DRAUPADI_AT, [0.3, 1.5, -0.5]), 40), k(B.asks, add(DRAUPADI_AT, [1.0, 1.3, 2.6]), add(DRAUPADI_AT, [0.25, 1.2, 0]), 36)]},
  // "द्रौपदी ने भीम से ऐसे और फूल माँगे।"  The two of them; she holds it out.
  {world: 'forest', from: B.asks, keys: [k(B.asks, add(CAMP, [0.4, 1.3, 7.2]), add(CAMP, [0.3, 1.0, 0.5]), 42), k(B.climb, add(CAMP, [0.35, 1.3, 6.2]), add(CAMP, [0.3, 1.05, 0.5]), 40)]},

  // Afternoon. "भीम गदा उठाकर गंधमादन पर्वत पर चढ़ चले"  Up the mountainside, the camera climbing with him.
  {world: 'forest', from: B.climb, keys: [k(B.climb, slopeCam(B.climb, [5, 2.6, 7]), BH(bhimaSlope(B.climb), 1.2), 46), k(B.roar, slopeCam(B.roar, [4, 2.2, 6]), BH(bhimaSlope(B.roar), 1.2), 44, 'linear')]},
  // "गरजते हुए, पेड़ उखाड़ते हुए।"  Low and ahead of him: he roars, trees fly.
  {world: 'forest', from: B.roar, keys: [k(B.roar, slopeCam(B.roar, [2.2, 0.9, -5.5]), BH(bhimaSlope(B.roar), 1.5), 46), k(B.grove, slopeCam(B.grove, [2.0, 1.0, -5.0]), BH(bhimaSlope(B.grove), 1.5), 46, 'linear')]},

  // "केले के एक घने वन में, संकरे रास्ते पर,"  Down through the banana leaves onto the narrow path.
  {world: 'forest', from: B.grove, keys: [k(B.grove, [3, 13, 22], [0, 1, 2], 46), k(B.lying, [1.1, 1.6, 9.5], [0, 0.8, 0], 44)]},
  // "एक बूढ़ा बंदर लेटा था।"  Low beside the path: the old monkey, asleep.
  {world: 'forest', from: B.lying, keys: [k(B.lying, [2.9, 0.6, 1.9], add(MONKEY, [0, 0.42, 0]), 40), k(B.shout, [2.3, 0.55, 1.4], add(MONKEY, [0, 0.42, 0]), 38)]},
  // "भीम ने ज़ोर से कहा — हटो, रास्ता दो!"  From the ground beyond the tail, looking up at him.
  {world: 'forest', from: B.shout, keys: [k(B.shout, [0.95, 0.4, -0.9], BH(BHIMA_STOP, 1.45), 44), k(B.eyes, [0.85, 0.42, -0.6], BH(BHIMA_STOP, 1.5), 42)]},
  // "बंदर ने धीरे से आँखें खोलीं"  Close on his face as the eyes open.
  {world: 'forest', from: B.eyes, keys: [k(B.eyes, add(MONKEY_FACE, [0.5, 0.15, 1.9]), MONKEY_FACE, 36), k(B.oldSick, add(MONKEY_FACE, [0.35, 0.1, 1.4]), MONKEY_FACE, 34)]},
  // "मैं बूढ़ा और बीमार हूँ। लाँघकर निकल जाओ।"  Over Bhima's shoulder, down at the monkey.
  {world: 'forest', from: B.oldSick, keys: [k(B.oldSick, [0.75, 1.95, 3.7], add(MONKEY, [0.3, 0.35, 0]), 42), k(B.stopped, [0.65, 1.85, 3.2], add(MONKEY, [0.3, 0.35, 0]), 40)]},
  // "भीम रुक गए।"  Bhima stops.
  {world: 'forest', from: B.stopped, keys: [k(B.stopped, add(BHIMA_STOP, [0.5, 1.3, 3.8]), BH(BHIMA_STOP, 1.3), 38), k(B.soul, add(BHIMA_STOP, [0.4, 1.35, 3.2]), BH(BHIMA_STOP, 1.35), 36)]},
  // "हर शरीर में परमात्मा है। मैं तुम्हें लाँघूँगा नहीं।"  Side on: a soft light glows in the old monkey.
  {world: 'forest', from: B.soul, keys: [k(B.soul, [3.6, 1.3, 3.9], [-0.5, 0.75, 0.6], 42), k(B.leap, [3.1, 1.2, 3.3], [-0.5, 0.75, 0.6], 40)]},
  // "वरना मैं वैसे ही छलाँग लगाता, जैसे मेरे भाई हनुमान ने समुद्र लाँघा था।"  Remembered: Hanuman flying over the ocean.
  {world: 'sea', from: B.leap, keys: [k(B.leap, leapCam(B.leap), leapAt(B.leap), 48), k(s(44.4), leapCam(s(44.4)), leapAt(s(44.4)), 48, 'linear'), k(B.smiled, leapCam(B.smiled), leapAt(B.smiled), 48, 'linear')]},
  // "बंदर मुस्कुराया…"  He smiles.
  {world: 'forest', from: B.smiled, keys: [k(B.smiled, add(MONKEY_FACE, [0.45, 0.15, 1.7]), MONKEY_FACE, 36), k(B.unaware, add(MONKEY_FACE, [0.35, 0.12, 1.35]), MONKEY_FACE, 34)]},
  // "भीम नहीं जानते थे कि वे किससे बात कर रहे हैं।"  High in the golden light: the two of them, a glint of something more.
  {world: 'forest', from: B.unaware, keys: [k(B.unaware, [4.6, 4.6, 5.6], [-0.4, 0.5, 0.5], 44), k(B.moveTail, [3.9, 4.0, 4.7], [-0.4, 0.5, 0.5], 42)]},
  // "तो मेरी पूँछ हटाकर निकल जाओ।"  The tail across the path; the tip twitches.
  {world: 'forest', from: B.moveTail, keys: [k(B.moveTail, [2.9, 0.65, -2.0], [0.5, 0.4, 0.05], 38), k(B.laughed, [2.6, 0.6, -1.7], [0.6, 0.42, 0.05], 36)]},
  // "भीम ने हँसकर एक हाथ से पूँछ उठाई…"  From beyond the tail: he laughs and reaches for it.
  {world: 'forest', from: B.laughed, keys: [k(B.laughed, [2.0, 0.6, -2.4], [0.8, 1.0, 1.1], 42), k(B.noMove, [1.8, 0.6, -2.0], BH(BHIMA_GRAB, 1.0), 40)]},
  // "पूँछ नहीं हिली।"  Close: the hand on the tail; nothing moves.
  {world: 'forest', from: B.noMove, keys: [k(B.noMove, [2.1, 0.9, -1.4], [1.05, 0.8, 0.4], 36), k(B.bothHands, [1.95, 0.9, -1.2], [1.05, 0.82, 0.4], 34)]},
  // "फिर दोनों हाथ लगाए। भौंहें तन गईं, पसीना छूट गया…"  Both hands, every muscle; the camera shakes with him.
  {world: 'forest', from: B.bothHands, keys: [k(B.bothHands, [1.65, 0.55, -1.95], BH(BHIMA_GRAB, 1.2), 38), k(B.stillNot, [1.45, 0.62, -1.35], BH(BHIMA_GRAB, 1.3), 34)]},
  // "पूँछ टस से मस नहीं हुई।"  Low and wide: the thin tail, the giant of a man, and it has not moved.
  {world: 'forest', from: B.stillNot, keys: [k(B.stillNot, [4.4, 0.35, -2.9], [0.1, 0.65, 0.3], 44), k(B.ashamed, [4.0, 0.4, -2.5], [0.1, 0.65, 0.3], 42)]},
  // "लज्जित भीम ने हाथ जोड़े — आप कौन हैं?"  Bhima steps back and folds his hands.
  {world: 'forest', from: B.ashamed, keys: [k(B.ashamed, [0.7, 1.35, 4.8], [0.5, 1.3, 1.2], 40), k(B.reveal, [0.5, 1.35, 3.9], BH(BHIMA_STOP, 1.35), 38)]},
  // "मैं वही हनुमान हूँ। तुम्हारा बड़ा भाई। हम दोनों पवन-पुत्र हैं।"  A burst of light: Hanuman stands in his own form.
  {world: 'forest', from: B.reveal, keys: [k(B.reveal, [-1.7, 1.6, 4.0], add(HANUMAN_AT, [0.3, 1.0, 0]), 42), k(B.godsPath, [-1.5, 1.5, 3.2], add(HANUMAN_AT, [0.3, 1.05, 0]), 40)]},
  // "आगे देवताओं का मार्ग है, मनुष्यों का नहीं।"  Up the path beyond them: light, and the shining peak.
  {world: 'forest', from: B.godsPath, keys: [k(B.godsPath, [0.35, 1.5, -1.6], [2, 9, -60], 48), k(B.blocked, [0.35, 3.2, -4.5], [4, 30, -150], 48)]},
  // "इसीलिए मैंने तुम्हारा रास्ता रोका।"
  {world: 'forest', from: B.blocked, keys: [k(B.blocked, add(HANUMAN_AT, [0.9, 1.2, 3.1]), add(HANUMAN_AT, [0, 1.15, 0]), 38), k(B.pleads, add(HANUMAN_AT, [0.7, 1.2, 2.5]), add(HANUMAN_AT, [0, 1.15, 0]), 36)]},
  // "भीम ने विनती की — मुझे वह रूप दिखाइए, जिससे आपने समुद्र लाँघा था।"  From behind Hanuman: Bhima pleading.
  {world: 'forest', from: B.pleads, keys: [k(B.pleads, [-0.7, 1.5, -1.4], BH(BHIMA_STOP, 1.4), 40), k(B.agePassed, [-0.6, 1.5, -1.0], BH(BHIMA_STOP, 1.45), 38)]},
  // "हनुमान बोले — वह युग बीत गया। समय बदल चुका है।"
  {world: 'forest', from: B.agePassed, keys: [k(B.agePassed, [2.8, 1.2, 3.6], [-0.6, 1.0, 0.3], 42), k(B.insists, [2.4, 1.2, 3.1], [-0.6, 1.0, 0.3], 40)]},
  // "पर भीम नहीं माने।"
  {world: 'forest', from: B.insists, keys: [k(B.insists, add(BHIMA_STOP, [0.5, 1.35, 3.4]), BH(BHIMA_STOP, 1.4), 36), k(B.grow, add(BHIMA_STOP, [0.4, 1.35, 2.9]), BH(BHIMA_STOP, 1.45), 34)]},
  // "तब हनुमान बढ़ने लगे… पूरे वन को ढकते हुए, पर्वत जितने ऊँचे।"  Back and up as he grows over the forest.
  {world: 'forest', from: B.grow, keys: [
    k(B.grow, [1.8, 1.0, 5.8], add(HANUMAN_AT, [0, 1.2, 0]), 46),
    k(B.tall, [10, 6, 30], add(GIANT_AT, [0, 30, 0]), 62),
    k(B.dazzled, [11, 6, 33], add(GIANT_AT, [0, 36, 0]), 62),
  ]},
  // "भीम की आँखें चौंधिया गईं। उन्होंने आँखें मूँद लीं।"  Bhima, blinded by the light.
  {world: 'forest', from: B.dazzled, keys: [k(B.dazzled, add(BHIMA_STOP, [0.6, 1.0, 3.4]), BH(BHIMA_STOP, 1.55), 36), k(B.shrink, add(BHIMA_STOP, [0.45, 1.1, 2.8]), BH(BHIMA_STOP, 1.6), 34)]},
  // (he returns to his own size)
  {world: 'forest', from: B.shrink, keys: [k(B.shrink, [7, 3, 12], [-3, 6, -6], 52), k(B.ravana, [5, 2, 9], [-1, 1.5, 0], 48)]},
  // "फिर भीम ने पूछा — इतनी शक्ति होते हुए, आपने रावण को ख़ुद क्यों नहीं मारा?"
  {world: 'forest', from: B.ravana, keys: [k(B.ravana, [3.1, 1.3, 3.3], [-0.3, 1.1, 0.6], 40), k(B.answer, [2.6, 1.25, 2.8], [-0.3, 1.1, 0.6], 38)]},
  // "हनुमान ने कहा — तब श्रीराम की कीर्ति कम हो जाती।"  Hanuman with folded hands; Shri Ram in the sky behind him.
  {world: 'forest', from: B.answer, keys: [k(B.answer, [1.7, 1.0, 5.2], [-1.6, 2.4, -6], 46), k(B.embrace, [1.4, 1.1, 4.4], [-1.8, 2.8, -6], 46)]},
  // "उन्होंने भीम को गले लगाया — तुम्हें छूकर"  Close: the two brothers.
  {world: 'forest', from: B.embrace, keys: [k(B.embrace, [0.4, 1.25, 3.8], [0, 1.15, 0.95], 38), k(B.remember, [0.3, 1.25, 3.2], [0, 1.15, 0.95], 36)]},
  // "मुझे श्रीराम की याद आ गई।"  Pulling back to Shri Ram, remembered in the sky.
  {world: 'forest', from: B.remember, keys: [k(B.remember, [1.0, 1.2, 4.6], [-0.6, 1.4, -1], 42), k(B.promise, [2.6, 2.4, 7.4], [-2.4, 4, -10], 46)]},

  // Kurukshetra at dawn. "और वचन दिया —"  The chariot on the field.
  {world: 'field', from: B.promise, keys: [k(B.promise, [6.4, 1.2, 9.2], [0, 2.6, 0], 46), k(B.flag, [5.2, 1.5, 7.6], [0, 3, 0], 44)]},
  // "युद्ध में मैं अर्जुन के रथ की ध्वजा पर रहूँगा।"  Up the flagstaff to Hanuman on top.
  {world: 'field', from: B.flag, keys: [k(B.flag, [3.4, 3.6, 6.2], add(FLAG_TOP, [0, 0.2, 0]), 42), k(B.thunder, [2.6, 6.2, 4.6], add(FLAG_TOP, [0, 0.7, 0]), 38)]},
  // "मेरी गर्जना शत्रुओं का साहस तोड़ देगी।"  Over the flag at the enemy lines as he roars.
  {world: 'field', from: B.thunder, keys: [k(B.thunder, [1.3, 8.6, 5.6], [0, 3, -46], 50), k(B.gita, [1.0, 8.9, 4.6], [0, 2, -46], 50)]},
  // "इसीलिए गीता में अर्जुन को कहा गया —"  Krishna at the reins, the banner over him.
  {world: 'field', from: B.gita, keys: [k(B.gita, [2.6, 2.0, -4.6], [0, 2.8, -0.4], 46), k(B.kapi, [2.0, 2.3, -3.8], [0, 3.4, 0], 44)]},
  // "कपिध्वज, जिसकी ध्वजा पर वानर है।"  The banner with the vanara on it.
  {world: 'field', from: B.kapi, keys: [k(B.kapi, [3.4, 6.6, 3.9], [1.3, 6.6, 1.1], 38), k(B.boon, [3.0, 6.8, 3.4], [1.3, 6.8, 1.1], 36)]},

  // Night at the camp. "और श्रीराम का वरदान है —"  A sage tells the Ram-katha by the fire.
  {world: 'forest', from: B.boon, keys: [k(B.boon, add(FIRE, [3.6, 1.7, 5.0]), add(FIRE, [-1, 0.9, 0.2]), 44), k(B.katha, add(FIRE, [2.8, 1.5, 3.9]), add(FIRE, [-1, 0.9, 0.2]), 42)]},
  // "जब तक धरती पर राम-कथा कही जाएगी, हनुमान जीवित रहेंगे।"  At the edge of the firelight, an old monkey listens.
  {world: 'forest', from: B.katha, keys: [k(B.katha, add(FIRE, [0.6, 1.2, 4.2]), add(FIRE, [-2.2, 0.75, 0.8]), 40), k(B.ending, add(FIRE, [-1.6, 0.9, 3.6]), add(FIRE, [-3.3, 0.7, 1.2]), 36)]},

  // Sunset in the grove. "जिस पूँछ को भीम हिला न सके, उसी ने उन्हें सबसे बड़ी सीख दी —"
  {world: 'forest', from: B.ending, keys: [k(B.ending, [0.6, 0.85, -5.0], [-0.4, 1.0, 0.6], 60), k(B.bow, [0.55, 0.85, -4.5], [-0.4, 1.05, 0.6], 58)]},
  // "असली बल, झुकने में है।"  Bhima bows; the camera rises away into the sunset.
  {world: 'forest', from: B.bow, keys: [k(B.bow, [1.2, 1.3, 4.4], [-0.4, 1.0, 0.6], 42), k(END, [7, 13, 24], [-0.5, 1.5, -2], 46)]},
];

const KICKS: Kick[] = [
  {f: s(0.2), amp: 0.03, len: 30},
  {f: s(18.5), amp: 0.08, len: 16},
  {f: s(19.7), amp: 0.1},
  {f: s(20.3), amp: 0.08},
  {f: B.hato, amp: 0.07, len: 14},
  {f: s(59.5), amp: 0.05},
  {f: s(60.6), amp: 0.06},
  {f: s(61.7), amp: 0.06},
  {f: s(62.6), amp: 0.07},
  {f: B.reveal, amp: 0.08, len: 16},
  {f: s(93.2), amp: 0.25, len: 30},
  {f: s(94.8), amp: 0.3, len: 30},
  {f: B.thunder + 4, amp: 0.25, len: 24},
];

export const BhimaHanuman: React.FC<{audio?: boolean; at?: number}> = ({audio = true, at}) => {
  const now = useCurrentFrame();
  const f = at ?? now;
  const {width, height} = useVideoConfig();
  const ready = useFontsLoaded();
  const cam = cameraAt(SHOTS, KICKS, f);
  const camVec = new THREE.Vector3(...cam.p);
  const memory = cam.world === 'sea';
  // the flash as the old monkey becomes Hanuman, and the blinding light of his true form
  const flash = f >= B.reveal && f < B.reveal + 10 ? 1 - (f - B.reveal) / 10 : 0;
  const blind = f >= B.dazzled && f < B.ravana ? Math.sin(Math.PI * Math.min(1, (f - B.dazzled) / (B.ravana - B.dazzled))) * 0.45 : 0;
  // soft fades into and out of the remembered leap, and into the night
  const fadeAt = (c: number) => (f >= c - 5 && f < c + 8 ? (f < c ? (f - c + 5) / 5 : 1 - (f - c) / 8) : 0);
  const memFade = Math.max(fadeAt(B.leap), fadeAt(B.smiled));
  const nightFade = Math.max(fadeAt(B.boon), fadeAt(B.ending));

  return (
    <AbsoluteFill style={{backgroundColor: '#120a14'}}>
      {ready && (
        <AbsoluteFill style={{filter: memory ? 'sepia(0.4) saturate(0.85)' : undefined}}>
          <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 50, position: [0, 1, 5]}}>
            <Rig p={cam.p} t={cam.t} fov={cam.fov} />
            <CamCtx.Provider value={camVec}>
              {cam.world === 'forest' ? <ForestWorld f={f} focus={cam.t[1] > 6 ? [cam.p[0], 0, cam.p[2]] : cam.t} /> : cam.world === 'sea' ? <SeaWorld f={f} focus={leapAt(f)} /> : <FieldWorld f={f} focus={[0, 0, 0]} />}
            </CamCtx.Provider>
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      {flash > 0 && <AbsoluteFill style={{backgroundColor: '#fff6dc', opacity: flash * 0.75}} />}
      {blind > 0 && <AbsoluteFill style={{backgroundColor: '#fff4d0', opacity: blind}} />}
      {memFade > 0 && <AbsoluteFill style={{backgroundColor: '#ffe2b8', opacity: memFade * 0.8}} />}
      {nightFade > 0 && <AbsoluteFill style={{backgroundColor: '#0a0814', opacity: nightFade * 0.8}} />}
      {ready && at === undefined && <WordCaptions words={words} theme={THEMES['indian-mythology']} />}
      {audio && <Html5Audio src={staticFile('audio/bhima-hanuman-voice.mp3')} />}
      {audio && <Html5Audio src={staticFile('audio/bhima-hanuman-bed.wav')} />}
    </AbsoluteFill>
  );
};

void BHIMA_CAMP;
void ramp;

// Contact frames for checking framing: frame i of the stills composition shows frame STILL_FRAMES[i] of the video.
const sec = [1, 4.5, 7.5, 10.5, 13.5, 16.5, 19.8, 22.5, 25, 27.8, 31, 34, 37, 40, 44, 47.8, 50, 53, 56, 58.2, 61.5, 64.5, 67.5, 71.5, 76.5, 79, 83, 88, 91.5, 94, 96.8, 99, 103, 109.5, 112.5, 115.5, 117.4, 119.5, 122.5, 125.5, 128.5, 131, 134.5, 139, 143];
export const STILL_FRAMES = sec.map((x) => Math.round(x * 30));
export const BhimaHanumanStills: React.FC = () => {
  const i = useCurrentFrame();
  return <BhimaHanuman audio={false} at={STILL_FRAMES[Math.min(i, STILL_FRAMES.length - 1)]} />;
};
