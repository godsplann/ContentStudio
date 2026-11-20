// "जब अकेले श्रीराम के सामने आई 14,000 राक्षसों की सेना!" (Khar-Dushan): an Epic Mythology short in the toon-3D style.
// Two worlds: Panchavati and the plain of Janasthana (storm, morning and sunset light) and Khara's camp at night.
// The hook is a flash-forward to the battle. All motion comes from the frame number.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CamCtx, V3} from '../shared/flat';
import {cameraAt, CamKey, Kick, Rig, Shot, useFontsLoaded} from '../shared/camera';
import {WordCaptions} from '../shared/WordCaptions';
import {THEMES} from '../themes';
import {JanasthanWorld} from './JanasthanWorld';
import {CampWorld} from './CampWorld';
import {B, CAVE_MOUTH, DUSHANA_C, KHARA_C, KHARA_MEET, LAK_HUT, RAM_B, RAM_HUT, s, TRISHIRA_C} from './beats';
import {add, sitaAt, generalAt, kharaPlainAt, SHURP_AT, SHURP_FROM, shurpanakhaDayAt} from './story';
import {DURATION_FRAMES, words} from './words';

export const kharDushanDuration = DURATION_FRAMES;

type W = 'plain' | 'camp';
const k = (f: number, p: V3, t: V3, fov: number, ease?: CamKey['ease']): CamKey => ({f, p, t, fov, ease});
const END = DURATION_FRAMES;
const RAMHEAD: V3 = add(RAM_B, [0, 1.35, 0]);
const KH = (f: number) => add(kharaPlainAt(f).pos, [0, 1.6, 0]);
const DUS = (f: number) => add(generalAt('dushana', f).pos, [0, 1.3, 0]);
const TRI = (f: number) => add(generalAt('trishira', f).pos, [0, 1.3, 0]);
const SI = (f: number) => add(sitaAt(f).pos, [0, 1.1, 0]);
const SH = (f: number) => add(shurpanakhaDayAt(f).pos, [0, 1.2, 0]);
const ARMY_FRONT = (f: number, extra: number): V3 => [0, 1.3, RAM_B[2] + 10 + extra];

const SHOTS: Shot<W>[] = [
  // "कल्पना कीजिए… आपके सामने 14,000 भयानक योद्धाओं की सेना खड़ी हो।"  A wall of roaring rakshasas, to the horizon.
  {world: 'plain', from: 0, keys: [k(0, [2.0, 1.0, 20.5], [0, 1.7, 32], 50), k(B.noArmy, [1.1, 1.1, 22.2], [0, 1.7, 32], 46, 'linear')]},
  // "आपके साथ कोई सेना नहीं, कोई साथी नहीं…"  High over the army: one small figure alone on the empty plain.
  {world: 'plain', from: B.noArmy, keys: [k(B.noArmy, [7, 10, 42], [0, 0.8, 12], 40), k(B.ready, [4, 7.5, 35], [0, 1.0, 13], 38)]},
  // "लेकिन आप अकेले उनका सामना करने के लिए तैयार हों!"  Ram, low and close, bow in hand.
  {world: 'plain', from: B.ready, keys: [k(B.ready, add(RAM_B, [0.9, -0.45, 4.4]), RAMHEAD, 40), k(B.ramayan, add(RAM_B, [0.55, -0.25, 3.0]), RAMHEAD, 38)]},
  // "रामायण में एक ऐसा ही युद्ध हुआ था,"  A whip round behind him: he draws the bow; the army ahead.
  {world: 'plain', from: B.ramayan, keys: [
    k(B.ramayan, add(RAM_B, [0.55, -0.25, 3.0]), RAMHEAD, 38),
    k(B.ramayan + 10, add(RAM_B, [-1.3, 1.2, -4.6]), [0.6, 1.5, 30], 48, 'whip'),
    k(B.faced, add(RAM_B, [-1.0, 1.1, -3.8]), [0.6, 1.5, 30], 46),
  ]},
  // "जब श्रीराम ने अकेले 14,000 राक्षसों का सामना किया था!"  From the side: arrows of light into the front ranks.
  {world: 'plain', from: B.faced, keys: [k(B.faced, [10.5, 1.5, 19.5], [0, 1.4, 22.5], 50), k(B.panchavati, [8.2, 2.2, 21.5], [0, 1.2, 24], 50)]},

  // Morning. "यह उस समय की बात है जब श्रीराम, माता सीता और लक्ष्मण जी पंचवटी में वनवास बिता रहे थे।"  Over the river, down to the hut.
  {world: 'plain', from: B.panchavati, keys: [k(B.panchavati, [16, 15, 32], [0, 1, -4], 44), k(s(26.6), [8, 4.5, 15], [0.6, 1.2, 2.6], 44), k(B.oneDay, [3.2, 1.7, 10.5], [0.7, 1.15, 3.2], 42)]},
  // "एक दिन राक्षसी शूर्पणखा वहाँ पहुँची।"  Low by the trees as she comes up to the hut.
  {world: 'plain', from: B.oneDay, keys: [k(B.oneDay, [9.6, 1.0, 17], SH(B.oneDay), 44), k(B.insulted, [6.6, 1.15, 13.2], add(SH(B.insulted), [-1.2, 0, -1.2]), 42)]},
  // "श्रीराम और लक्ष्मण से अपमानित होने के बाद"  Lakshman stern in front; she backs away.
  {world: 'plain', from: B.insulted, keys: [k(B.insulted, [6.8, 1.4, 9.6], [3.0, 1.1, 5.2], 42), k(B.toBrothers, [7.4, 1.5, 10.6], [4.4, 1.1, 6.6], 44)]},

  // Night, Khara's camp. "वह अपने भाइयों खर और दूषण के पास पहुँची।"  Behind her, up the torch-lit aisle.
  {world: 'camp', from: B.toBrothers, keys: [k(B.toBrothers, [1.4, 2.4, 20.5], [0, 1.8, 2], 46), k(B.told, [0.9, 2.0, 10.0], [0, 1.9, 0], 44)]},
  // "उसने उन्हें अपनी बेइज्जती की कहानी सुनाई"  Her, pointing back the way she came; Khara above.
  {world: 'camp', from: B.told, keys: [k(B.told, [-2.4, 1.5, 7.6], [0, 1.6, 3.2], 40), k(B.incited, [-1.9, 1.5, 6.8], [0, 1.7, 2.8], 38)]},
  // "और श्रीराम से बदला लेने के लिए उकसाया।"  Khara from below; the torches flare as he roars.
  {world: 'camp', from: B.incited, keys: [k(B.incited, add(KHARA_C, [0.6, 0.0, 4.4]), add(KHARA_C, [0, 1.9, 0]), 40), k(B.angry, add(KHARA_C, [0.4, 0.2, 3.2]), add(KHARA_C, [0, 1.85, 0]), 38)]},
  // "गुस्से से भरा खर, दूषण और त्रिशिरा के साथ,"  Khara, then Dushana, then a whip to Trishira.
  {world: 'camp', from: B.angry, keys: [
    k(B.angry, add(KHARA_C, [0, 0.9, 5.2]), add(KHARA_C, [0, 1.8, 0]), 40),
    k(B.dushana - 6, add(KHARA_C, [-0.4, 0.9, 5.0]), add(KHARA_C, [0, 1.8, 0]), 40),
    k(B.dushana + 6, add(DUSHANA_C, [-0.6, 0.8, 4.2]), add(DUSHANA_C, [0, 1.6, 0]), 40, 'whip'),
    k(B.trishira, add(DUSHANA_C, [-0.4, 0.8, 4.0]), add(DUSHANA_C, [0, 1.6, 0]), 40),
    k(B.trishira + 9, add(TRISHIRA_C, [0.5, 0.8, 4.8]), add(TRISHIRA_C, [0, 1.6, 0]), 42, 'whip'),
    k(B.army, add(TRISHIRA_C, [0.4, 0.8, 4.4]), add(TRISHIRA_C, [0, 1.6, 0]), 42),
  ]},
  // "14,000 राक्षसों की विशाल सेना लेकर"  Craning up from the dais over the whole army as it marches out.
  {world: 'camp', from: B.army, keys: [k(B.army, [0, 3.2, -0.6], [0, 1.5, 22], 50), k(B.charge, [0, 20, -7], [0, 0, 40], 52)]},
  // Day. "श्रीराम पर टूट पड़ा।"  On the plain, low in the grass: the army charges at the camera.
  {world: 'plain', from: B.charge, keys: [k(B.charge, [2.6, 0.7, 82.6], ARMY_FRONT(B.charge, 66.6), 50), k(B.lakshman, [2.2, 0.8, 78.8], ARMY_FRONT(B.lakshman, 59.8), 50, 'linear')]},

  // "जब लक्ष्मण जी युद्ध के लिए तैयार हुए,"  Lakshman, bow ready.
  {world: 'plain', from: B.lakshman, keys: [k(B.lakshman, add(LAK_HUT, [0.6, 1.2, 3.6]), add(LAK_HUT, [0, 1.2, 0]), 40), k(B.order, add(LAK_HUT, [0.4, 1.25, 2.8]), add(LAK_HUT, [0, 1.25, 0]), 38)]},
  // "तब श्रीराम ने उन्हें माता सीता को"  Ram gives the order.
  {world: 'plain', from: B.order, keys: [k(B.order, add(RAM_HUT, [0.6, 0.55, 6.6]), add(RAM_HUT, [0.4, 1.05, 0]), 42), k(B.cave, add(RAM_HUT, [0.5, 0.6, 5.4]), add(RAM_HUT, [0.4, 1.1, 0]), 40)]},
  // "पर्वत की एक गुफा में ले जाकर उनकी रक्षा करने का आदेश दिया।"  Sita and Lakshman head for the cave in the rocky hill.
  {world: 'plain', from: B.cave, keys: [k(B.cave, add(SI(B.cave + 30), [4.5, 2.2, 8]), add(SI(B.cave + 30), [-1, 0, -1]), 46), k(s(63.5), add(SI(s(63.5)), [3.6, 2.0, 7]), add(SI(s(63.5)), [-1.5, 0, -1.5]), 44), k(B.alone, add(SI(B.alone), [3.2, 2.0, 6.5]), add(CAVE_MOUTH, [0.5, 1.3, 0.5]), 44)]},

  // Storm. "अब युद्धभूमि में श्रीराम अकेले थे।"  Ram alone on the plain; dust on the horizon.
  {world: 'plain', from: B.alone, keys: [k(B.alone, add(RAM_B, [9, 4.5, -8]), add(RAM_B, [0, 1.0, 6]), 40), k(B.allSides, add(RAM_B, [-7, 4.0, -8]), add(RAM_B, [0, 1.0, 6]), 40)]},
  // "चारों तरफ से राक्षसों ने उन पर हमला कर दिया।"  Straight down: the ring closes on him.
  {world: 'plain', from: B.allSides, keys: [k(B.allSides, add(RAM_B, [0.5, 34, -9]), add(RAM_B, [0, 0, 8]), 52), k(B.unshaken, add(RAM_B, [2, 22, -7]), add(RAM_B, [0, 0, 6]), 54)]},
  // "लेकिन श्रीराम बिल्कुल विचलित नहीं हुए।"  Close on his calm face, the army over his shoulder.
  {world: 'plain', from: B.unshaken, keys: [k(B.unshaken, add(RAM_B, [-3.4, -0.25, -2.4]), RAMHEAD, 34), k(B.arrows, add(RAM_B, [-2.4, -0.15, -1.6]), RAMHEAD, 32)]},
  // "उनके धनुष से निकलते बाण बिजली की गति से"  Over his shoulder: the arrows leave the bow.
  {world: 'plain', from: B.arrows, keys: [k(B.arrows, add(RAM_B, [-0.75, 1.0, -3.8]), [0.4, 1.4, 34], 46), k(B.felling, add(RAM_B, [-0.6, 1.0, -2.9]), [0.4, 1.4, 34], 44)]},
  // "राक्षसों को धराशायी करने लगे।"  Inside the army as the ranks go down.
  {world: 'plain', from: B.felling, keys: [k(B.felling, [6, 1.0, 34], [0, 1.0, 26], 48), k(B.covered, [4.2, 1.3, 30], [0, 1.0, 22], 48)]},
  // "कुछ ही समय में युद्धभूमि गिरे हुए राक्षसों से पट गई।"  Craning up over the fallen.
  {world: 'plain', from: B.covered, keys: [k(B.covered, [5, 3, 22], [0, 0.6, 34], 50), k(B.generals, [14, 32, 0], [0, 0, 36], 52)]},
  // "दूषण और त्रिशिरा भी मारे गए।"  Dushana falls; a whip to Trishira, who falls.
  {world: 'plain', from: B.generals, keys: [
    k(B.generals, add(DUS(B.generals), [-0.8, 0.2, -5.0]), DUS(B.generals), 44),
    k(B.trishiraFalls - 14, add(DUS(B.generals), [-0.6, 0.1, -4.4]), add(DUS(B.generals), [0, -0.5, 0]), 44),
    k(B.trishiraFalls - 4, add(TRI(B.generals), [0.8, 0.2, -5.0]), TRI(B.generals), 44, 'whip'),
    k(B.khara, add(TRI(B.generals), [0.7, 0.1, -4.6]), add(TRI(B.generals), [0, -0.6, 0]), 44),
  ]},
  // "अंत में खर स्वयं श्रीराम से भिड़ा,"  Khara charges, mace up; the camera backs away in front of him.
  {world: 'plain', from: B.khara, keys: [k(B.khara, add(KH(B.khara), [1.2, -0.7, -5.2]), KH(B.khara), 44), k(B.kharaArrow - 6, add(KH(B.kharaArrow), [1.2, -0.7, -5.2]), KH(B.kharaArrow), 44, 'linear'), k(B.kharaArrow, add(KH(B.kharaArrow), [1.1, -0.7, -5.4]), KH(B.kharaArrow), 44)]},
  // "और श्रीराम के बाण से वह भी मारा गया।"  Side on: Ram's arrow, a flash, Khara falls.
  {world: 'plain', from: B.kharaArrow, keys: [k(B.kharaArrow, [20, 1.9, 17.2], [0, 1.2, 17.25], 44), k(B.over, [18.5, 1.7, 17.2], [0, 0.9, 17.3], 44)]},
  // Sunset. "14,000 राक्षसों की पूरी सेना का संहार हो चुका था।"  Pulling up and away: one figure standing in a silent field.
  {world: 'plain', from: B.over, keys: [k(B.over, add(RAM_B, [-3.2, 0.9, -3.6]), add(RAM_B, [0, 1.0, 3]), 44), k(B.think, add(RAM_B, [-14, 15, -12]), add(RAM_B, [0, 0, 12]), 46)]},

  // Storm again, remembered. "सोचिए… जिस सेना को अपनी संख्या पर इतना घमंड था,"  The opening image: the army, roaring.
  {world: 'plain', from: B.think, keys: [k(B.think, [2.0, 1.0, 20.5], [0, 1.7, 32], 50), k(B.couldNot, [1.1, 1.1, 22.2], [0, 1.7, 32], 46, 'linear')]},
  // Gold. "वह एक अकेले योद्धा के सामने टिक नहीं पाई।"  The same place now: the fallen, and him standing beyond.
  {world: 'plain', from: B.couldNot, keys: [k(B.couldNot, [2.2, 1.5, 27], RAMHEAD, 38), k(B.taught, [1.4, 1.5, 23.5], RAMHEAD, 36)]},
  // "श्रीराम ने उस दिन सिर्फ अपनी शक्ति नहीं दिखाई, बल्कि यह भी सिखाया कि…"  Sita and Lakshman come back to him.
  {world: 'plain', from: B.taught, keys: [k(B.taught, add(RAM_B, [1.8, 0.5, 6.4]), add(RAM_B, [-1.2, 1.1, -0.4]), 42), k(B.courageNot, add(RAM_B, [1.2, 0.5, 5.2]), add(RAM_B, [-1.0, 1.15, -0.4]), 40)]},
  // "साहस का मतलब यह नहीं कि आपके सामने कितने लोग हैं।"  Behind him, looking out over the plain.
  {world: 'plain', from: B.courageNot, keys: [k(B.courageNot, add(RAM_B, [0.5, 0.6, -3.8]), [1.0, 1.1, 36], 50), k(B.courageIs, add(RAM_B, [0.4, 0.7, -2.9]), [1.0, 1.2, 36], 48)]},
  // "साहस का मतलब है कि सही के लिए खड़े होने का हौसला कितना है!"  Close and low, in the golden light.
  {world: 'plain', from: B.courageIs, keys: [k(B.courageIs, add(RAM_B, [0.6, -0.45, 3.6]), RAMHEAD, 38), k(B.finale, add(RAM_B, [0.4, -0.3, 2.4]), RAMHEAD, 34)]},
  // "और यही था मर्यादा पुरुषोत्तम श्रीराम का पराक्रम!"  Pulling far back into the sunset.
  {world: 'plain', from: B.finale, keys: [k(B.finale, add(RAM_B, [0.6, 0.0, 4.6]), RAMHEAD, 40), k(END, add(RAM_B, [16, 12, 30]), add(RAM_B, [0, 1, 0]), 44)]},
];

const KICKS: Kick[] = [
  {f: s(18.6), amp: 0.08},
  {f: s(19.6), amp: 0.08},
  {f: s(20.6), amp: 0.1},
  {f: B.roar, amp: 0.1, len: 16},
  {f: s(54.3), amp: 0.08, len: 20},
  {f: s(76.4), amp: 0.06},
  {f: s(78.9), amp: 0.1},
  {f: s(79.8), amp: 0.1},
  {f: B.dushanaFalls, amp: 0.12},
  {f: B.trishiraFalls, amp: 0.12},
  {f: B.kharaHit, amp: 0.28, len: 18},
];
const WHIPS = [
  {from: B.ramayan, to: B.ramayan + 10},
  {from: B.dushana - 6, to: B.dushana + 6},
  {from: B.trishira, to: B.trishira + 9},
  {from: B.trishiraFalls - 14, to: B.trishiraFalls - 4},
];

export const KharDushan: React.FC<{audio?: boolean; at?: number}> = ({audio = true, at}) => {
  const now = useCurrentFrame();
  const f = at ?? now;
  const {width, height} = useVideoConfig();
  const ready = useFontsLoaded();
  const cam = cameraAt(SHOTS, KICKS, f);
  const camVec = new THREE.Vector3(...cam.p);
  let blur = 0;
  for (const w of WHIPS) {
    const u = (f - w.from) / (w.to - w.from);
    if (u > 0 && u < 1) blur = Math.sin(Math.PI * u) * 16;
  }
  const flash = f >= B.kharaHit && f < B.kharaHit + 8 ? 1 - (f - B.kharaHit) / 8 : 0;
  // a soft fade into the remembered army, and out of it
  const memIn = f >= B.think - 5 && f < B.think + 8 ? (f < B.think ? (f - B.think + 5) / 5 : 1 - (f - B.think) / 8) : 0;
  const memOut = f >= B.couldNot - 5 && f < B.couldNot + 8 ? (f < B.couldNot ? (f - B.couldNot + 5) / 5 : 1 - (f - B.couldNot) / 8) : 0;
  const memory = f >= B.think && f < B.couldNot;

  return (
    <AbsoluteFill style={{backgroundColor: '#120a14'}}>
      {ready && (
        <AbsoluteFill style={{filter: [blur ? `blur(${blur.toFixed(1)}px)` : '', memory ? 'sepia(0.35) saturate(0.8)' : ''].join(' ').trim() || undefined}}>
          <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 50, position: [0, 1, 5]}}>
            <Rig p={cam.p} t={cam.t} fov={cam.fov} />
            <CamCtx.Provider value={camVec}>
              {cam.world === 'plain' ? <JanasthanWorld f={f} focus={cam.t} /> : <CampWorld f={f} focus={cam.t} />}
            </CamCtx.Provider>
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      {flash > 0 && <AbsoluteFill style={{backgroundColor: '#fff6dc', opacity: flash * 0.7}} />}
      {(memIn > 0 || memOut > 0) && <AbsoluteFill style={{backgroundColor: '#ffe2b8', opacity: Math.max(memIn, memOut) * 0.8}} />}
      {ready && at === undefined && <WordCaptions words={words} theme={THEMES['indian-mythology']} />}
      {audio && <Html5Audio src={staticFile('audio/khar-dushan-voice.mp3')} />}
      {audio && <Html5Audio src={staticFile('audio/khar-dushan-bed.wav')} />}
    </AbsoluteFill>
  );
};

void KHARA_MEET;
void SHURP_AT;
void SHURP_FROM;
