// "हनुमान की छलाँग" (Hanuman's leap): an Epic Mythology short in the toon-3D style.
// Three worlds (the shore, the flashback ashram, Ashoka Vatika), a camera that never rests, Hindi word captions.
// All motion comes from the frame number.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CamCtx, V3} from '../shared/flat';
import {cameraAt, CamKey, Kick, Rig, Shot, useFontsLoaded} from '../shared/camera';
import {WordCaptions} from '../shared/WordCaptions';
import {THEMES} from '../themes';
import {AshramWorld} from './AshramWorld';
import {SeaWorld, hanumanAt} from './SeaWorld';
import {VatikaWorld} from './VatikaWorld';
import {B, LANKA, RING, SUMMIT} from './beats';
import {DURATION_FRAMES, words} from './words';

export const hanumanLeapDuration = DURATION_FRAMES;

type W = 'sea' | 'ashram' | 'vatika';
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const k = (f: number, p: V3, t: V3, fov: number, ease?: CamKey['ease']): CamKey => ({f, p, t, fov, ease});
const fly = (f: number) => hanumanAt(f).pos;
const END = DURATION_FRAMES;

// One row per shot. A new shot is a hard cut; keys inside a shot are camera moves.
const SHOTS: Shot<W>[] = [
  // "सौ योजन का विशाल समुद्र… और उसके किनारे खड़े थे हनुमान — जिन्हें अपनी ही शक्ति याद नहीं थी।"
  // Skimming in over the waves to the lone figure on the rock, then pushing in on his downcast face.
  {world: 'sea', from: 0, keys: [k(0, [3, 1.0, -34], [-1.5, 1.4, 0], 50), k(B.hanumanNamed, [-0.9, 1.25, -4.8], [-1.5, 1.35, -0.2], 44), k(264, [-1.4, 1.6, -1.9], [-1.5, 1.42, -0.2], 38)]},
  // "सीता माता की खोज में वानर सेना दक्षिण के समुद्र तट तक आ पहुँची थी।"  Aerial over the army on the beach.
  {world: 'sea', from: 266, keys: [k(266, [-3, 15, 15], [-4, 0, 4], 50), k(405, [-2.5, 8.5, 5.5], [-3.5, 0, 3], 50)]},
  // "पर लंका तक छलाँग कौन लगाए?"  From the beach, whip to far Lanka on the horizon.
  {world: 'sea', from: 405, keys: [k(405, [-1.5, 1.7, 5.5], [-1.5, 1.3, -20], 50), k(418, [-1.4, 1.75, 5.2], [-1.4, 1.35, -20], 50), k(432, [0.5, 2.4, -3], [LANKA[0], 7, LANKA[2]], 24, 'whip'), k(504, [0.6, 2.3, -6.5], [LANKA[0], 8, LANKA[2]], 19)]},
  // "सबने सिर झुका लिया।"  The vanaras' heads drop.
  {world: 'sea', from: 504, keys: [k(504, [-6.5, 1.35, -0.8], [-5, 1.0, 4], 46), k(574, [-6.0, 1.5, 0.2], [-5, 0.9, 4.5], 46)]},
  // Flashback. "बचपन में नन्हे हनुमान बड़े नटखट थे।"  Gliding round the ashram as he bounces about.
  {world: 'ashram', from: B.flashbackIn, keys: [k(B.flashbackIn, [4.2, 2.4, 6.5], [0, 0.7, 0.5], 48), k(674, [2.6, 1.5, 4.2], [0.3, 0.7, 0.6], 46)]},
  // "ऋषियों के ध्यान…"  The rishi, eyes calm.
  {world: 'ashram', from: B.rishiMeditate, keys: [k(B.rishiMeditate, [0.35, 1.45, 2.3], [0.05, 1.18, 0], 40), k(B.yagya, [0.25, 1.42, 1.85], [0, 1.2, 0], 40)]},
  // "…और यज्ञ में बाधा डालते रहते।"  He leaps the havan fire and knocks over the kamandal.
  {world: 'ashram', from: B.yagya, keys: [k(B.yagya, [0.6, 0.9, 4.2], [0.6, 0.6, 0.9], 46), k(B.curse, [0.1, 0.8, 3.6], [0.0, 0.5, 0.8], 44)]},
  // "तब ऋषियों ने श्राप दिया"  Low angle: the rishi raises his hand.
  {world: 'ashram', from: B.curse, keys: [k(B.curse, [0.55, 0.45, 2.1], [0.05, 1.2, 0], 46), k(853, [0.35, 0.55, 1.65], [0.05, 1.22, 0], 44)]},
  // "तुम अपनी शक्ति भूल जाओगे…"  The light flows into the child, and his glow fades.
  {world: 'ashram', from: 853, keys: [k(853, [0.4, 1.0, 3.6], [1.3, 0.6, 1.2], 40), k(930, [1.15, 0.85, 2.9], [1.5, 0.5, 1.3], 38)]},
  // "जब तक कोई तुम्हें याद न दिलाए।"  Pull back from the ashram.
  {world: 'ashram', from: 930, keys: [k(930, [1.0, 1.3, 3.0], [0.6, 0.8, 0.6], 46), k(B.flashbackOut, [2.0, 3.2, 7.5], [0.4, 0.8, 0.4], 46)]},
  // Back at the shore, dusk. "तब वृद्ध जाम्बवान आगे आए और बोले"
  {world: 'sea', from: B.flashbackOut, keys: [k(B.flashbackOut, [-4.9, 1.75, -2.4], [-4.3, 0.85, 2.8], 46), k(B.jambavanWalks, [-4.8, 1.72, -2.35], [-4.25, 0.85, 2.7], 46), k(B.jambavanArrives, [-3.2, 1.55, -3.1], [-2.3, 0.85, 0.45], 44)]},
  // "हनुमान, तुम पवनपुत्र हो।"  Two-shot; the wind begins to stir.
  {world: 'sea', from: B.jambavanArrives, keys: [k(B.jambavanArrives, [-1.92, 1.4, -4.3], [-1.92, 1.05, 0.1], 40), k(B.sky, [-1.92, 1.45, -3.7], [-1.92, 1.1, 0.1], 40)]},
  // "आकाश में उड़ना तुम्हारा स्वभाव है।"  Low, looking up past him into the sky.
  {world: 'sea', from: B.sky, keys: [k(B.sky, [-1.25, 0.4, -2.3], [-1.5, 1.7, -0.2], 52), k(1296, [-1.05, 0.35, -1.9], [-1.6, 3.0, 0.2], 56)]},
  // "तुम बस भूल गए हो कि तुम कौन हो।"  Slow push in; his eyes go wide.
  {world: 'sea', from: 1296, keys: [k(1296, [-1.42, 1.55, -2.6], [-1.5, 1.46, -0.2], 38), k(1412, [-1.48, 1.6, -1.45], [-1.5, 1.5, -0.2], 38)]},
  // "यह सुनते ही हनुमान का शरीर पर्वत जितना विशाल हो गया।"  He grows; the camera falls back to keep him in frame.
  {world: 'sea', from: 1412, keys: [k(1412, [-3.5, 0.6, -6], [-1.5, 1.5, -0.2], 50), k(B.growStart, [-3.7, 0.6, -6.6], [-1.5, 1.6, -0.2], 50), k(B.growEnd, [-8, 1.5, -26], [-1.5, 5.5, -0.2], 50), k(B.mahendra, [-8.4, 1.6, -27], [-1.5, 5.6, -0.2], 50)]},
  // "महेंद्र पर्वत पर पैर जमाए, 'जय श्री राम' का उद्घोष किया…"
  {world: 'sea', from: B.mahendra, keys: [k(B.mahendra, [2, 1.2, -8], [SUMMIT[0], 12, SUMMIT[2]], 50), k(B.jaiShriRam, [5, 2, -3], [SUMMIT[0], 12.5, SUMMIT[2]], 46), k(B.leap, [7, 3, 1], [SUMMIT[0], 13, SUMMIT[2]], 44)]},
  // "…और छलाँग लगा दी!"  He launches; the camera tilts up after him.
  {world: 'sea', from: B.leap, keys: [k(B.leap, [9, 2.5, 4], [SUMMIT[0], 13, SUMMIT[2] - 1], 54), k(B.overSea, [8, 3, 0], [8, 32, -20], 62, 'linear')]},
  // "समुद्र पार कर,"  Flying alongside him over the open sea, Lanka ahead.
  {world: 'sea', from: B.overSea, keys: [k(B.overSea, add(fly(B.overSea), [11, 1.5, 6]), add(fly(B.overSea), [0, 0.6, -1.2]), 46), k(B.vatika, add(fly(B.vatika), [11, 1.5, 6]), add(fly(B.vatika), [0, 0.6, -1.2]), 46, 'linear')]},
  // "अशोक वाटिका में हनुमान ने सीता माता को"  The night garden; Hanuman drops from the tree.
  {world: 'vatika', from: B.vatika, keys: [k(B.vatika, [0.2, 1.8, 7.5], [0, 1.4, 0], 46), k(B.ring - 8, [0.3, 1.35, 4.4], [0.05, 1.1, 0.2], 44)]},
  // "श्रीराम की अंगूठी दी"  He holds out the ring; push in to it.
  {world: 'vatika', from: B.ring - 8, keys: [k(B.ring - 8, [1.1, 1.25, 2.9], [0.35, 0.95, 0.3], 42), k(s2f(63.8), [1.1, 1.2, 2.6], [0.4, 0.95, 0.3], 42), k(B.maa, add(RING, [0.25, 0.08, 1.0]), RING, 38)]},
  // "माँ, धैर्य रखिए।"  Sita's face changes.
  {world: 'vatika', from: B.maa, keys: [k(B.maa, [-0.5, 1.4, 2.05], [-0.55, 1.16, 0], 40), k(B.prabhu, [-0.52, 1.42, 1.7], [-0.55, 1.18, 0], 40)]},
  // "प्रभु आ रहे हैं।"  Into the ring's glow, where Shri Ram appears.
  {world: 'vatika', from: B.prabhu, keys: [k(B.prabhu, add(RING, [0.05, 0.03, 0.62]), RING, 34), k(B.lesson, add(RING, [0.02, 0.0, 0.46]), add(RING, [0, -0.05, 0]), 32)]},
  // "कभी-कभी हमारी सबसे बड़ी शक्ति…"  He flies across the setting sun.
  {world: 'sea', from: B.lesson, keys: [k(B.lesson, [0, 0.9, -8], [0, 7, -70], 34), k(B.yourJambavan, [0, 1.1, -13], [0, 8, -70], 32)]},
  // "आपके जीवन के जाम्बवान कौन हैं?"  Jambavan, smiling, back on the shore at sunset.
  {world: 'sea', from: B.yourJambavan, keys: [k(B.yourJambavan, [-2.5, 1.3, -1.9], [-2.35, 0.78, 0.3], 40), k(B.comment, [-2.45, 1.32, -1.45], [-2.35, 0.8, 0.3], 40)]},
  // "कमेंट में बताइए — और ऐसी ही कथाओं के लिए…"  Pull back and up: Hanuman, Jambavan and the cheering army.
  {world: 'sea', from: B.comment, keys: [k(B.comment, [-2, 1.5, -3.6], [-2, 1.1, 0.2], 46), k(END, [-3, 11, -24], [-3, 0.5, 3], 46)]},
];
function s2f(sec: number) {
  return Math.round(sec * 30);
}

const KICKS: Kick[] = [
  {f: B.potTips + 8, amp: 0.02},
  {f: B.growEnd - 4, amp: 0.16, len: 16},
  {f: B.jaiShriRam, amp: 0.1, len: 14},
  {f: B.leap, amp: 0.3, len: 18},
  {f: B.hanumanDrops + 14, amp: 0.03},
];
const WHIPS = [{from: 418, to: 432}];
const FLASHES = [B.flashbackIn, B.flashbackOut]; // a soft white flash into and out of the memory

export const HanumanLeap: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const ready = useFontsLoaded();
  const cam = cameraAt(SHOTS, KICKS, f);
  const camVec = new THREE.Vector3(...cam.p);
  let blur = 0;
  for (const w of WHIPS) {
    const u = (f - w.from) / (w.to - w.from);
    if (u > 0 && u < 1) blur = Math.sin(Math.PI * u) * 18;
  }
  if (f >= B.overSea && f < B.vatika) blur = Math.max(blur, 2.5);
  let flash = 0;
  for (const x of FLASHES) {
    const d = f - x;
    if (d >= -4 && d < 10) flash = Math.max(flash, d < 0 ? (d + 4) / 4 : 1 - d / 10);
  }
  const memory = cam.world === 'ashram';
  const filters = [blur ? `blur(${blur.toFixed(1)}px)` : '', memory ? 'sepia(0.5) saturate(1.15) brightness(1.04)' : ''].join(' ').trim();

  return (
    <AbsoluteFill style={{backgroundColor: '#120a14'}}>
      {ready && (
        <AbsoluteFill style={{filter: filters || undefined}}>
          <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 50, position: [0, 1, 5]}}>
            <Rig p={cam.p} t={cam.t} fov={cam.fov} />
            <CamCtx.Provider value={camVec}>
              {cam.world === 'sea' && <SeaWorld f={f} />}
              {cam.world === 'ashram' && <AshramWorld f={f} />}
              {cam.world === 'vatika' && <VatikaWorld f={f} />}
            </CamCtx.Provider>
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      {flash > 0 && <AbsoluteFill style={{backgroundColor: '#fff8e8', opacity: flash * 0.85}} />}
      {ready && <WordCaptions words={words} theme={THEMES['indian-mythology']} />}
      {audio && <Html5Audio src={staticFile('audio/hanuman-leap-voice.mp3')} />}
      {audio && <Html5Audio src={staticFile('audio/hanuman-leap-bed.wav')} />}
    </AbsoluteFill>
  );
};
