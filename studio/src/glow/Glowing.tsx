// "You are glowing right now": a Mind Matter short in the toon-3D style.
// Worlds: the bedroom at night, the Japan lab (2009), inside a cell, the Canada lab (2025), a farm at dawn.
// All motion comes from the frame number.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CamCtx, V3} from '../shared/flat';
import {cameraAt, CamKey, Kick, Rig, Shot, useFontsLoaded} from '../shared/camera';
import {WordCaptions} from '../shared/WordCaptions';
import {THEMES} from '../themes';
import {B, s} from './beats';
import {DURATION_FRAMES, words} from './words';
import {GAUGE, HEATER, RoomWorld, YOU_SIT, YOU_STAND} from './RoomWorld';
import {CAM, CHART, CLOCK, haruAt, JapanWorld, MEN, SCREEN, SEAT, SENSOR} from './JapanWorld';
import {CellWorld, FAT_P, MOUTH, PRO_P} from './CellWorld';
import {BOX, CanadaWorld, CLINIC, LEAF, mayaAt, PLANT} from './CanadaWorld';
import {FARMER, FarmWorld, PATCH} from './FarmWorld';

export const glowingDuration = DURATION_FRAMES;

type W = 'room' | 'japan' | 'cell' | 'canada' | 'farm';
const k = (f: number, p: V3, t: V3, fov: number, ease?: CamKey['ease']): CamKey => ({f, p, t, fov, ease});
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const END = DURATION_FRAMES;
const YOU_HEAD = add(YOU_SIT, [0, 1.06, 0]);
const V3HEAD: V3 = [MEN[2][0], SEAT.head, MEN[2][2]];
const HARU = (f: number) => add(haruAt(f), [0, 1.3, 0]);
const MAYA = (f: number) => add(mayaAt(f), [0, 1.25, 0]);

const SHOTS: Shot<W>[] = [
  // "Right now, your body is giving off light."  The dark bedroom; the viewer glows. Slow push in.
  {world: 'room', from: 0, keys: [k(0, [-0.9, 0.95, 3.8], add(YOU_SIT, [-0.3, 0.95, -0.2]), 50), k(B.notHeat, [-0.1, 1.0, 2.6], add(YOU_SIT, [-0.1, 0.95, 0]), 46)]},
  // "Not heat."  The heater's coils go dark.
  {world: 'room', from: B.notHeat, keys: [k(B.notHeat, add(HEATER, [1.4, 0.95, 2.8]), add(HEATER, [0, 0.45, 0.1]), 46), k(B.real, add(HEATER, [1.1, 0.85, 2.3]), add(HEATER, [0, 0.45, 0.1]), 44)]},
  // "Real, visible light."  Close on the face, sparks of light drifting off.
  {world: 'room', from: B.real, keys: [k(B.real, add(YOU_HEAD, [0.2, 0.05, 1.3]), add(YOU_HEAD, [0, -0.1, 0]), 42), k(B.faint, add(YOU_HEAD, [0.08, 0.0, 0.95]), add(YOU_HEAD, [0, -0.08, 0]), 40)]},
  // "It is just a thousand times too faint for your eyes to see."  The gauge, then back to the viewer as the glow fades.
  {world: 'room', from: B.faint, keys: [
    k(B.faint, add(GAUGE, [0.25, -0.1, 1.9]), GAUGE, 46),
    k(s(8.5), add(GAUGE, [0.1, -0.2, 1.3]), add(GAUGE, [0, -0.25, 0]), 44),
    k(s(9.0), [0.4, 1.3, 2.2], add(YOU_SIT, [0, 0.9, 0]), 46, 'whip'),
    k(B.japan, [0.2, 1.25, 1.9], add(YOU_SIT, [0, 0.9, 0]), 46),
  ]},

  // "In 2009, scientists in Japan set out to photograph it."  The lab at dusk; the photographer walks in.
  {world: 'japan', from: B.japan, keys: [k(B.japan, [-24, 5.2, 9.5], [-30, 2.8, -3], 50), k(s(12.4), [-26.2, 2.6, 6.5], HARU(s(12.4)), 48), k(B.sealed, [-28, 1.6, 3.8], HARU(B.sealed), 46)]},
  // "They sealed a room so that not a single ray of outside light could get in."  The door shuts on the light.
  {world: 'japan', from: B.sealed, keys: [k(B.sealed, [1.4, 1.5, 3.8], [4.7, 1.2, 0.6], 50), k(B.closed, [1.9, 1.45, 3.3], [4.75, 1.2, 0.8], 46), k(B.five, [2.3, 1.4, 3.0], [4.8, 1.2, 0.9], 44)]},
  // "Five young men sat in front of a camera in total darkness."  Along the row, the camera in front of them.
  {world: 'japan', from: B.five, keys: [k(B.five, [5.2, 1.4, 1.6], [-1.3, 0.9, -1.15], 54), k(B.sensitive, [4.6, 1.32, 1.25], [-1.3, 0.9, -1.15], 50)]},
  // "The camera was so sensitive it could pick up single particles of light."  Inside the camera: photons land on the sensor.
  {world: 'japan', from: B.sensitive, keys: [k(B.sensitive, add(SENSOR, [0.7, 0.4, 6.2]), SENSOR, 48), k(B.twenty, add(SENSOR, [0.2, 0.1, 3.0]), SENSOR, 44)]},
  // "Each picture took twenty minutes."  The timer on the back of the camera runs to 20:00.
  {world: 'japan', from: B.twenty, keys: [k(B.twenty, add(CAM, [0.45, 1.3, 1.25]), add(CAM, [0, 1.13, 0.2]), 40), k(B.pictures, add(CAM, [0.18, 1.22, 0.85]), add(CAM, [0, 1.13, 0.2]), 36)]},
  // "And in those pictures,"  The monitor: five figures in false colour.
  {world: 'japan', from: B.pictures, keys: [k(B.pictures, add(SCREEN, [0.12, 0.08, 2.3]), SCREEN, 40), k(s(30.2), add(SCREEN, [0.04, 0.04, 2.0]), SCREEN, 40)]},
  // "the men were glowing."  Back in the room: the five glow.
  {world: 'japan', from: s(30.2), keys: [k(s(30.2), [-3.8, 1.3, 3.6], [0.6, 0.95, -1.2], 50), k(B.face, [-3.1, 1.25, 3.0], [0.6, 0.95, -1.2], 48)]},
  // "The light was strongest on the face: the cheeks, the forehead and the neck."  Close on one face as each spot lights.
  {world: 'japan', from: B.face, keys: [k(B.face, add(V3HEAD, [0.3, -0.05, 1.35]), add(V3HEAD, [0, -0.07, 0]), 44), k(B.changed, add(V3HEAD, [0.1, -0.05, 0.95]), add(V3HEAD, [0, -0.08, 0]), 40)]},
  // "And it changed through the day. Dimmest at ten... brightest around four... the body's internal clock."
  {world: 'japan', from: B.changed, keys: [
    k(B.changed, add(CLOCK, [0.3, -0.3, 2.4]), CLOCK, 46),
    k(B.dimmest + 10, [-1.0, 1.85, 1.2], [-0.9, 1.75, -3.4], 52),
    k(B.brightest - 4, [-0.4, 1.9, 0.9], [0.2, 1.8, -3.4], 52),
    k(B.brightest + 14, add(CHART, [0.0, -0.1, 2.4]), CHART, 48),
    k(B.inStep + 12, add(CHART, [-0.2, -0.3, 2.1]), add(CHART, [0, -0.1, 0]), 48),
    k(B.where, [0.3, 1.8, 3.0], [0.2, 1.4, -3.0], 54),
  ]},
  // "So where does it come from?"  Diving into one glowing cheek.
  {world: 'japan', from: B.where, keys: [k(B.where, add(V3HEAD, [0.35, 0.0, 1.4]), add(V3HEAD, [SEAT.cheekX, SEAT.cheek - SEAT.head, 0]), 42), k(B.everyCell, add(V3HEAD, [SEAT.cheekX, SEAT.cheek - SEAT.head, 0.22]), add(V3HEAD, [SEAT.cheekX, SEAT.cheek - SEAT.head, 0]), 18)]},

  // "Every cell in your body burns fuel to stay alive."  Inside a cell: the mitochondrion eats fuel.
  {world: 'cell', from: B.everyCell, keys: [k(B.everyCell, [5.2, 2.6, 5.0], [1.0, 1.4, -4.2], 50), k(B.burning, [3.4, 2.0, 2.4], [0.4, 1.4, -4.0], 48)]},
  // "That burning makes highly reactive molecules called free radicals."  Out of the furnace mouth they fly.
  {world: 'cell', from: B.burning, keys: [k(B.burning, add(MOUTH, [1.4, 0.1, 3.4]), MOUTH, 48), k(B.radicals, add(MOUTH, [0.8, 0.6, 4.6]), add(MOUTH, [0, -0.6, 1.5]), 50), k(B.crash, [0, 2.6, 6.4], [0, 0.6, 0.0], 52)]},
  // "When they crash into the fats and proteins in your cells, they pass on a little energy."
  {world: 'cell', from: B.crash, keys: [
    k(B.crash, add(FAT_P, [0.9, 1.0, 2.8]), add(FAT_P, [0.3, 0.7, 0]), 46),
    k(B.hitFat + 10, add(FAT_P, [0.7, 0.95, 2.4]), add(FAT_P, [0.2, 0.75, 0]), 44),
    k(B.hitProtein - 12, add(FAT_P, [0.6, 0.95, 2.3]), add(FAT_P, [0.2, 0.75, 0]), 44),
    k(B.hitProtein - 4, add(PRO_P, [-0.9, 1.0, 2.8]), add(PRO_P, [-0.3, 0.7, 0]), 46, 'whip'),
    k(B.pass, add(PRO_P, [-0.7, 0.95, 2.5]), add(PRO_P, [-0.2, 0.75, 0]), 44),
    k(B.pass + 24, [0, 2.0, 9.6], [0, 0.85, 1.3], 50),
    k(B.hold, [0, 1.9, 8.8], [0, 0.85, 1.3], 50),
  ]},
  // "Those molecules hold the energy for a moment, then let it go as a tiny flash of light."  The flash comes at us.
  {world: 'cell', from: B.hold, keys: [k(B.hold, add(FAT_P, [0.6, 1.15, 2.6]), add(FAT_P, [0, 0.9, 0]), 44), k(B.glowStick, add(FAT_P, [0.3, 1.1, 1.9]), add(FAT_P, [0, 0.95, 0]), 42)]},
  // "It is the same kind of chemistry that makes a glow stick shine."  Back home: snap, green light.
  {world: 'room', from: B.glowStick, keys: [k(B.glowStick, add(YOU_STAND, [0.5, 1.1, 1.9]), add(YOU_STAND, [0, 0.95, 0]), 46), k(B.canada, add(YOU_STAND, [0.25, 1.0, 1.25]), add(YOU_STAND, [0, 0.9, 0]), 42)]},

  // "In 2025, scientists in Canada took the idea further."  The lab in the snow.
  {world: 'canada', from: B.canada, keys: [k(B.canada, [-24, 5.0, 10], [-30, 2.6, -3], 50), k(s(70.8), [-26.4, 2.4, 6.6], MAYA(s(70.8)), 48), k(B.mice, [-28.2, 1.6, 3.6], MAYA(B.mice), 46)]},
  // "They filmed living mice in the dark, and the mice glowed."
  {world: 'canada', from: B.mice, keys: [k(B.mice, add(BOX, [0.6, 0.5, 2.2]), add(BOX, [0, 0.15, 0]), 44), k(B.died, add(BOX, [0.2, 0.3, 1.45]), add(BOX, [0, 0.1, 0]), 42)]},
  // "After the mice died, the glow almost vanished."
  {world: 'canada', from: B.died, keys: [k(B.died, add(BOX, [-0.2, 0.5, 2.2]), add(BOX, [0, 0.08, 0]), 42), k(B.plants, add(BOX, [-0.12, 0.45, 1.9]), add(BOX, [0, 0.08, 0]), 40)]},
  // "Plants showed something similar."
  {world: 'canada', from: B.plants, keys: [k(B.plants, add(PLANT, [0.7, 0.55, 1.6]), add(PLANT, [0, 0.4, 0]), 44), k(B.leaf, add(PLANT, [0.4, 0.45, 1.1]), add(PLANT, [0, 0.42, 0]), 42)]},
  // "Where a leaf was damaged, it glowed brighter, because its stressed cells were making more of those reactive molecules."
  {world: 'canada', from: B.leaf, keys: [
    k(B.leaf, add(LEAF, [0.0, 0.1, 4.8]), LEAF, 46),
    k(B.brighter, add(LEAF, [0.35, 0.2, 4.4]), add(LEAF, [0.4, 0.18, 0]), 44),
    k(B.doctors, add(LEAF, [0.45, 0.15, 2.0]), add(LEAF, [0.42, 0.1, 0]), 42),
  ]},
  // "...help doctors check the health of tissue without touching it,"  The clinic: a scanner that hovers.
  {world: 'canada', from: B.doctors, keys: [k(B.doctors, add(CLINIC, [0.4, 1.5, 4.4]), add(CLINIC, [-0.1, 1.2, -0.4]), 48), k(B.tissue, add(CLINIC, [0.1, 1.75, 3.2]), add(CLINIC, [0.1, 1.6, -1.7]), 46), k(B.farmers, add(CLINIC, [0.15, 1.85, 2.4]), add(CLINIC, [0.2, 1.85, -1.7]), 46)]},
  // "or help farmers spot sick crops early."  Dawn: the farmer, then the glowing patch.
  {world: 'farm', from: B.farmers, keys: [k(B.farmers, add(FARMER, [1.4, 1.0, 3.0]), add(FARMER, [0, 1.0, 0]), 46), k(B.crops - 6, add(FARMER, [1.2, 1.2, 2.4]), add(FARMER, [0, 1.0, 0]), 46), k(B.aura, add(FARMER, [1.4, 4.0, 3.2]), add(PATCH, [0, 0.4, 0]), 46)]},

  // "This is not a mysterious aura."  A rainbow halo pops on, then bursts.
  {world: 'room', from: B.aura, keys: [k(B.aura, add(YOU_HEAD, [0.25, 0.1, 3.1]), add(YOU_HEAD, [0, -0.15, 0]), 44), k(B.chem, add(YOU_HEAD, [0.12, 0.08, 2.5]), add(YOU_HEAD, [0, -0.15, 0]), 42)]},
  // "It is chemistry, the side effect of your cells at work."  The cell again, tiny flashes everywhere.
  {world: 'cell', from: B.chem, keys: [k(B.chem, [0.5, 2.4, 9.0], [0, 1.4, -3.5], 52), k(B.nextTime, [-3.8, 6.0, 8.2], [0, 1.0, -4.5], 52)]},
  // "So the next time you sit in a dark room, remember."  The opening image again.
  {world: 'room', from: B.nextTime, keys: [k(B.nextTime, [-1.3, 1.3, 4.2], add(YOU_SIT, [-0.4, 0.9, -0.3]), 50), k(B.still, [-0.5, 1.15, 3.0], add(YOU_SIT, [-0.2, 0.95, -0.1]), 48)]},
  // "You are still glowing. You just can't see it."  In close as the glow shows, back out as it fades.
  {world: 'room', from: B.still, keys: [k(B.still, add(YOU_HEAD, [-0.4, 0.0, 2.3]), add(YOU_HEAD, [0, -0.25, 0]), 46), k(B.cantSee, add(YOU_HEAD, [-0.2, 0.0, 1.6]), add(YOU_HEAD, [0, -0.2, 0]), 44), k(END, [-1.5, 1.5, 4.8], add(YOU_SIT, [-0.4, 0.85, -0.4]), 50)]},
];

const KICKS: Kick[] = [
  {f: B.closed, amp: 0.05},
  {f: B.hitFat, amp: 0.12},
  {f: B.hitProtein, amp: 0.12},
  {f: B.flash, amp: 0.05},
  {f: B.snap, amp: 0.05},
];
const WHIPS = [
  {from: s(8.5), to: s(9.0)},
  {from: B.hitProtein - 12, to: B.hitProtein - 4},
];

export const Glowing: React.FC<{audio?: boolean; at?: number}> = ({audio = true, at}) => {
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
  // a white flash as the camera dives into the skin, and a short one on the flash of light
  const dive = f >= B.everyCell - 8 && f < B.everyCell + 10 ? (f < B.everyCell ? (f - B.everyCell + 8) / 8 : 1 - (f - B.everyCell) / 10) : 0;
  const pop = f >= B.flash && f < B.flash + 5 ? 0.35 * (1 - (f - B.flash) / 5) : 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#070912'}}>
      {ready && (
        <AbsoluteFill style={{filter: blur ? `blur(${blur.toFixed(1)}px)` : undefined}}>
          <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 50, position: [0, 1, 5]}}>
            <Rig p={cam.p} t={cam.t} fov={cam.fov} far={400} />
            <CamCtx.Provider value={camVec}>
              {cam.world === 'room' && <RoomWorld f={f} />}
              {cam.world === 'japan' && <JapanWorld f={f} focus={cam.t} />}
              {cam.world === 'cell' && <CellWorld f={f} />}
              {cam.world === 'canada' && <CanadaWorld f={f} focus={cam.t} />}
              {cam.world === 'farm' && <FarmWorld f={f} />}
            </CamCtx.Provider>
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      {(dive > 0 || pop > 0) && <AbsoluteFill style={{backgroundColor: '#fff8e8', opacity: Math.max(dive, pop)}} />}
      {ready && at === undefined && <WordCaptions words={words} theme={THEMES.general} />}
      {audio && <Html5Audio src={staticFile('audio/glow-voice.mp3')} />}
      {audio && <Html5Audio src={staticFile('audio/glow-bed.wav')} />}
    </AbsoluteFill>
  );
};
