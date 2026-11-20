// "जटायु" (Jatayu's last stand): an Epic Mythology short in the toon-3D style.
// One forest world in three lights (the fight in the afternoon, Ram's arrival and the rites at dusk, the ending at sunset),
// a camera that never rests, Hindi word captions. All motion comes from the frame number.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CamCtx, V3} from '../shared/flat';
import {cameraAt, CamKey, Kick, Rig, Shot, useFontsLoaded} from '../shared/camera';
import {WordCaptions} from '../shared/WordCaptions';
import {THEMES} from '../themes';
import {ForestWorld} from './ForestWorld';
import {B, JATAYU_G, PERCH, PYRE, RAVANA_G, s} from './beats';
import {chariotAt, CRASH as CRASH_AT, jatayuAt, LAKSHMAN_AT, RAM_AT, rel} from './story';
import {DURATION_FRAMES, words} from './words';

export const jatayuDuration = DURATION_FRAMES;

type W = 'forest';
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const k = (f: number, p: V3, t: V3, fov: number, ease?: CamKey['ease']): CamKey => ({f, p, t, fov, ease});
const C = (f: number) => chariotAt(f).pos;
const J = (f: number) => jatayuAt(f).pos;
const RAV = (f: number) => rel(C(f), [0, 2.0, 0.25]); // Ravana's faces on the chariot
const END = DURATION_FRAMES;
// A camera key framing Ravana and Sita together on the chariot: Sita stands to his left as the camera sees it.
const pair = (f: number, o: V3, fov: number, ease?: CamKey['ease']): CamKey => {
  const p = rel(C(f), o);
  const r = rel(C(f), [0, 0.32, 0.25]);
  const yaw = Math.atan2(p[0] - r[0], p[2] - r[2]);
  return k(f, p, [r[0] - Math.cos(yaw) * 0.55, r[1] + 1.3, r[2] + Math.sin(yaw) * 0.55], fov, ease);
};
const JHEAD: V3 = add(PERCH, [0, 1.7, 0]);
const LYING: V3 = add(JATAYU_G, [-0.1, 0.65, 0]); // Jatayu's head, lying on his side
const MID: V3 = [(RAM_AT[0] + LYING[0]) / 2 + 0.6, 0.7, (RAM_AT[2] + LYING[2]) / 2];

// One row per shot (one per sentence or half-sentence). A new shot is a hard cut; keys inside are camera moves.
const SHOTS: Shot<W>[] = [
  // "रावण से लड़ने की हिम्मत बड़े-बड़े योद्धाओं में भी नहीं थी…"  Low angle on the ten-headed king, crossing the sky.
  {world: 'forest', from: 0, keys: [k(0, rel(C(0), [5.4, -1.2, -2.6]), RAV(0), 46), k(B.butOld, rel(C(B.butOld), [4.2, -0.4, -1.6]), RAV(B.butOld), 42, 'linear')]},
  // "लेकिन एक बूढ़े पक्षी ने अकेले ही उसे चुनौती दे दी!"  The old bird on his rock, wings thrown open against the sun.
  {world: 'forest', from: B.butOld, keys: [k(B.butOld, add(PERCH, [3.4, 0.2, -4.6]), add(PERCH, [0, 1.6, 0]), 50), k(B.when, add(PERCH, [2.2, 0.8, -3.2]), add(PERCH, [0, 1.5, 0]), 46)]},
  // "जब रावण माता सीता का अपहरण करके… लंका ले जा रहा था,"  Aerial: the golden chariot over the forest.
  {world: 'forest', from: B.when, keys: [k(B.when, rel(C(B.when), [-11, 7, 13]), add(C(B.when), [0, 1, 0]), 48), k(B.thenOnTheWay, rel(C(B.thenOnTheWay), [-7, 3.2, 7.5]), add(C(B.thenOnTheWay), [0, 1.2, 0]), 46, 'linear')]},
  // "तभी रास्ते में उसकी नजर पड़ी एक विशाल गिद्ध पर।"  Over Ravana's shoulder to the rock ahead; long lens on the vulture.
  {world: 'forest', from: B.thenOnTheWay, keys: [
    k(B.thenOnTheWay, rel(C(B.thenOnTheWay), [1.6, 4.2, 5.6]), add(PERCH, [0, 2, 0]), 44),
    k(B.vulture - 6, rel(C(B.vulture - 6), [1.6, 4.2, 5.6]), add(PERCH, [0, 2, 0]), 40, 'linear'),
    k(B.vulture + 8, rel(C(B.vulture + 8), [1.6, 4.2, 5.6]), JHEAD, 9, 'whip'),
    k(B.name, rel(C(B.name), [1.6, 4.2, 5.6]), JHEAD, 8.2),
  ]},
  // "उसका नाम था जटायु।"  Slow push in on his face.
  {world: 'forest', from: B.name, keys: [k(B.name, add(PERCH, [0.8, 1.9, 3.6]), JHEAD, 38), k(B.jatayuSaw, add(PERCH, [0.5, 1.8, 2.5]), JHEAD, 36)]},
  // "जटायु ने जब देखा कि रावण माता सीता को…"  Behind him on the rock, looking out at the passing chariot.
  {world: 'forest', from: B.jatayuSaw, keys: [k(B.jatayuSaw, add(PERCH, [-2.6, 2.8, -0.6]), add(C(B.jatayuSaw), [0, 1, 0]), 30), k(B.forcibly, add(PERCH, [-2.3, 2.6, -0.4]), add(C(B.forcibly), [0, 1, 0]), 24)]},
  // "…जबरदस्ती लेकर जा रहा है,"  Sita in Ravana's grip, calling for help.
  {world: 'forest', from: B.forcibly, keys: [pair(B.forcibly, [-4.8, 1.7, -3.4], 42), pair(B.decided, [-4.0, 1.6, -2.8], 40)]},
  // "तो उसने उसे रोकने का फैसला किया।"  Low on Jatayu: his brows come down.
  {world: 'forest', from: B.decided, keys: [k(B.decided, add(PERCH, [1.1, 0.9, 3.0]), JHEAD, 40), k(B.think, add(PERCH, [0.8, 1.1, 2.2]), JHEAD, 38)]},
  // "सोचिए… सामने था दस सिरों वाला शक्तिशाली रावण,"  The hero shot of Ravana: low, tilting up the fan of heads.
  {world: 'forest', from: B.think, keys: [k(B.think, rel(C(B.think), [4.6, -1.4, -3.0]), rel(C(B.think), [0, 1.4, 0.25]), 44), k(B.tenHeads, rel(C(B.tenHeads), [4.3, -1.2, -2.8]), rel(C(B.tenHeads), [0, 1.6, 0.25]), 44), k(B.otherSide, rel(C(B.otherSide), [3.5, -0.6, -2.3]), RAV(B.otherSide), 40)]},
  // "और दूसरी तरफ था एक बूढ़ा पक्षी।"  Wide: one small figure on a lonely rock in the big sky.
  {world: 'forest', from: B.otherSide, keys: [k(B.otherSide, add(PERCH, [7, 1.2, 11]), add(PERCH, [0, 1.6, 0]), 34), k(B.noCare, add(PERCH, [10, 2.5, 15]), add(PERCH, [0, 1.2, 0]), 36)]},
  // "लेकिन जटायु ने अपनी उम्र या ताकत की परवाह नहीं की।"  From under the rock edge: he spreads his wings and launches.
  {world: 'forest', from: B.noCare, keys: [k(B.noCare, add(PERCH, [1.8, -0.8, 3.6]), add(PERCH, [0, 1.8, 0]), 48), k(B.launch, add(PERCH, [1.8, -0.6, 3.2]), add(PERCH, [0, 2.0, 0]), 48), k(B.attack, add(PERCH, [2.6, 0.6, 4.0]), J(B.attack), 54)]},
  // "उसने रावण के रथ पर हमला कर दिया।"  Around the chariot as he dives in.
  {world: 'forest', from: B.attack, keys: [k(B.attack, rel(C(B.attack), [6.5, 3.0, 5.5]), add(C(B.attack), [0, 1.4, 0]), 54), k(B.battle, rel(C(B.battle), [4.0, 1.2, -5.5]), add(C(B.battle), [0, 1.6, 0]), 52)]},
  // "दोनों के बीच भयंकर युद्ध हुआ।"  A whip round to the other side, then circling.
  {world: 'forest', from: B.battle, keys: [k(B.battle, rel(C(B.battle), [4.0, 1.2, -5.5]), add(C(B.battle), [0, 1.6, 0]), 52), k(B.battle + 14, rel(C(B.battle + 14), [-6.5, 3.2, -3.0]), add(C(B.battle + 14), [0, 1.5, 0]), 50, 'whip'), k(B.bow, rel(C(B.bow), [-5.0, 0.6, 4.0]), add(C(B.bow), [0, 1.8, 0]), 50)]},
  // "जटायु ने रावण के धनुष को तोड़ दिया,"  Ravana draws his bow; the bird snaps it.
  {world: 'forest', from: B.bow, keys: [k(B.bow, rel(C(B.bow), [3.6, 1.6, -5.2]), rel(C(B.bow), [0.4, 1.6, 0.25]), 44), k(B.chariot, rel(C(B.chariot), [3.0, 1.8, -4.4]), rel(C(B.chariot), [0.5, 1.7, 0.25]), 44)]},
  // "उसके रथ को तोड़ डाला"  Wide from the side: the canopy torn off, the team gone, the chariot falls.
  {world: 'forest', from: B.chariot, keys: [k(B.chariot, rel(C(B.chariot), [10, 2.5, 1.5]), add(C(B.chariot), [0, 1.2, 0]), 46), k(B.chariotSmash, rel(C(B.chariotSmash), [10.5, 2.5, 1.5]), add(C(B.chariotSmash), [0, 1.2, 0]), 46), k(B.crash + 6, add(CRASH_AT, [8, 5, 11]), add(CRASH_AT, [0, 0.8, 0]), 48)]},
  // "और सीता को बचाने की पूरी कोशिश की।"  On the ground: Ravana gripping Sita, Jatayu beating at him.
  {world: 'forest', from: B.crash + 6, keys: [k(B.crash + 6, [8.6, 1.9, 1.4], [8.4, 1.25, -8.4], 46), k(B.end, [8.7, 1.7, 0.2], [8.4, 1.25, -8.4], 46)]},
  // "लेकिन अंत में रावण ने अपनी तलवार से"  Low angle: the sword goes up.
  {world: 'forest', from: B.end, keys: [k(B.end, add(RAVANA_G, [1.4, 0.4, 5.6]), add(RAVANA_G, [0, 1.7, 0]), 46), k(B.cut, add(RAVANA_G, [1.0, 0.5, 4.6]), add(RAVANA_G, [0.2, 1.9, 0]), 44)]},
  // "जटायु के पंख काट दिए।"  The stroke, and the feathers.
  {world: 'forest', from: B.cut, keys: [k(B.cut, add(JATAYU_G, [0.4, 1.9, 5.0]), add(JATAYU_G, [0, 1.8, 0]), 42), k(B.fall, add(JATAYU_G, [0.5, 1.8, 4.4]), add(JATAYU_G, [0, 1.6, 0]), 42)]},
  // "जटायु जमीन पर गिर पड़ा।"  From above as he comes down.
  {world: 'forest', from: B.fall, keys: [k(B.fall, add(JATAYU_G, [2.0, 5.5, 4.5]), add(JATAYU_G, [0.3, 0.6, 0]), 46), k(B.later, add(JATAYU_G, [1.4, 7.5, 3.6]), add(JATAYU_G, [0.3, 0.2, 0]), 46)]},
  // Dusk. "कुछ समय बाद जब भगवान राम और लक्ष्मण वहाँ पहुँचे,"  The brothers walk into the clearing.
  {world: 'forest', from: B.later, keys: [k(B.later, add(JATAYU_G, [-3.0, 1.8, 12.5]), add(JATAYU_G, [-3.0, 0.8, 1.6]), 54), k(B.found, add(JATAYU_G, [-2.0, 1.6, 9.5]), add(JATAYU_G, [-1.2, 0.7, 0.8]), 52)]},
  // "तो उन्हें घायल जटायु मिला।"  Ram's face; then what he sees.
  {world: 'forest', from: B.found, keys: [k(B.found, add(RAM_AT, [0.5, 1.45, 2.1]), add(RAM_AT, [0, 1.3, 0]), 40), k(s(69.9), add(RAM_AT, [0.5, 1.45, 2.0]), add(RAM_AT, [0, 1.3, 0]), 40), k(B.lastBreath, add(RAM_AT, [0.6, 1.6, 0.4]), LYING, 42)]},
  // "जटायु ने अपनी आखिरी साँसें लेते हुए राम को बताया कि सीता को रावण ले गया है।"  The two of them, close.
  {world: 'forest', from: B.lastBreath, keys: [k(B.lastBreath, add(MID, [0, 1.0, 6.2]), MID, 44), k(B.andThen, add(MID, [0, 0.85, 5.0]), MID, 42)]},
  // "और फिर…"  His eyes are closed; a glow gathers.
  {world: 'forest', from: B.andThen, keys: [k(B.andThen, add(LYING, [0.2, 0.9, 3.0]), LYING, 38), k(B.rites, add(LYING, [0.2, 1.6, 3.4]), LYING, 40)]},
  // "भगवान राम ने जटायु को अपने पिता समान सम्मान दिया"  Ram bows to him, hands joined.
  {world: 'forest', from: B.rites, keys: [k(B.rites, add(MID, [0, 1.4, 6.6]), add(MID, [0, 0.6, 0]), 44), k(B.pyre, add(MID, [0, 1.15, 5.2]), add(MID, [0, 0.7, 0]), 42)]},
  // "और उसका अंतिम संस्कार स्वयं किया।"  The pyre on the river bank; the brothers with joined hands.
  {world: 'forest', from: B.pyre, keys: [k(B.pyre, add(PYRE, [6.0, 2.2, 9.5]), add(PYRE, [1.0, 1.0, 1.2]), 46), k(B.feared, add(PYRE, [4.6, 1.8, 7.2]), add(PYRE, [0.8, 1.2, 1.0]), 44)]},
  // Sunset gold. "जिस रावण से बड़े-बड़े योद्धा डरते थे,"  Ravana again, huge against the sky.
  {world: 'forest', from: B.feared, keys: [k(B.feared, rel(C(B.feared), [5.4, -1.6, -3.2]), RAV(B.feared), 44), k(B.oldBird, rel(C(B.oldBird), [4.4, -1.0, -2.6]), RAV(B.oldBird), 42)]},
  // "उससे एक बूढ़ा पक्षी सिर्फ इसलिए लड़ गया"  The old bird diving at him, once more.
  {world: 'forest', from: B.oldBird, keys: [k(B.oldBird, rel(C(B.oldBird), [9, 3.5, -2.5]), add(C(B.oldBird), [1.2, 2.2, 0]), 46), k(B.because, rel(C(B.because), [8, 2.5, 0.5]), add(C(B.because), [0.8, 1.8, 0]), 44)]},
  // "क्योंकि उसे सही और गलत का फर्क पता था।"  He rises into the light.
  {world: 'forest', from: B.because, keys: [k(B.because, add(J(B.because), [4, -0.6, 7]), add(J(B.because), [0, 1.2, 0]), 44), k(B.realValour, add(J(B.realValour - 1), [4.5, -3.0, 8]), add(J(B.realValour - 1), [0, 1.2, 0]), 44, 'linear')]},
  // "क्योंकि असली वीरता इस बात में नहीं होती कि आप कितने शक्तिशाली हैं…"  Ravana close; the light drains from him.
  {world: 'forest', from: B.realValour, keys: [k(B.realValour, rel(C(B.realValour), [4.4, 0.4, -2.8]), RAV(B.realValour), 42), k(B.stand, rel(C(B.stand), [3.4, 0.8, -2.0]), RAV(B.stand), 40)]},
  // "असली वीरता इस बात में होती है कि जब अन्याय आपके सामने हो, तो आप उसके खिलाफ खड़े होते हैं या नहीं!"
  // Back to the opening image: Jatayu on his rock, wings wide, against the setting sun. Push in, then pull far back.
  {world: 'forest', from: B.stand, keys: [k(B.stand, add(PERCH, [3.6, 0.4, 3.0]), add(PERCH, [0, 1.6, 0]), 48), k(B.standUp, add(PERCH, [2.3, 1.0, 1.9]), add(PERCH, [0, 1.7, 0]), 44), k(END, add(PERCH, [14, 5, 12]), add(PERCH, [0, 0.4, 0]), 46)]},
];

const KICKS: Kick[] = [
  {f: B.hit1, amp: 0.12},
  {f: s(46.9), amp: 0.12},
  {f: B.bowSnap, amp: 0.1},
  {f: B.chariotSmash, amp: 0.22, len: 16},
  {f: B.crash, amp: 0.3, len: 18},
  {f: B.cut, amp: 0.15},
  {f: B.landed, amp: 0.12, len: 14},
];
const WHIPS = [
  {from: B.vulture - 6, to: B.vulture + 8},
  {from: B.battle, to: B.battle + 14},
];

export const Jatayu: React.FC<{audio?: boolean; at?: number}> = ({audio = true, at}) => {
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
  // a soft flash on the sword stroke, and a warm fade into the ending
  const flash = f >= B.cut && f < B.cut + 8 ? 1 - (f - B.cut) / 8 : 0;
  const goldIn = f >= B.feared - 6 && f < B.feared + 10 ? (f < B.feared ? (f - B.feared + 6) / 6 : 1 - (f - B.feared) / 10) : 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#120a14'}}>
      {ready && (
        <AbsoluteFill style={{filter: blur ? `blur(${blur.toFixed(1)}px)` : undefined}}>
          <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 50, position: [0, 1, 5]}}>
            <Rig p={cam.p} t={cam.t} fov={cam.fov} />
            <CamCtx.Provider value={camVec}>
              <ForestWorld f={f} focus={cam.t} />
            </CamCtx.Provider>
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      {flash > 0 && <AbsoluteFill style={{backgroundColor: '#ffffff', opacity: flash * 0.6}} />}
      {goldIn > 0 && <AbsoluteFill style={{backgroundColor: '#ffd9a0', opacity: goldIn * 0.85}} />}
      {ready && at === undefined && <WordCaptions words={words} theme={THEMES['indian-mythology']} />}
      {audio && <Html5Audio src={staticFile('audio/jatayu-voice.mp3')} />}
      {audio && <Html5Audio src={staticFile('audio/jatayu-bed.wav')} />}
    </AbsoluteFill>
  );
};

void LAKSHMAN_AT;
