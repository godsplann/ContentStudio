// "The Soldier Who Ate His Cigarettes": the second Undercover short (Wojtek, the Polish army's bear), toon-3D with the
// Undercover finish (sticker-outlined figures, Bebas captions with a gold key word, paper grain and a warm wash).
// Places: the dock with the enlistment desk (opening and middle), the camp in Iran, the supply dump at Monte Cassino
// (with the same desk for the ending, so the last shot repeats the first). All motion comes from the frame number.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CamCtx, V3} from '../shared/flat';
import {cameraAt, CamKey, Kick, Rig, Shot, useFontsLoaded} from '../shared/camera';
import {WordCaptions} from '../shared/WordCaptions';
import {Finish, Graded} from '../shared/finish';
import {THEMES} from '../themes';
import {B, s} from './beats';
import {DURATION_FRAMES, words} from './words';
import {CampWorld, CassinoWorld, DockWorld} from './Worlds';
import {CAMP_CRATE, FORM, OFFICER, rampWalk, SIGN, STACK, TRUCK, WATCH_SEAT} from './story';

export const wojtekDuration = DURATION_FRAMES;
const T = THEMES.undercover;

type W = 'dock' | 'camp' | 'cassino';
const k = (f: number, p: V3, t: V3, fov: number, ease?: CamKey['ease']): CamKey => ({f, p, t, fov, ease});
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const END = DURATION_FRAMES;

// The desk framing: used for the first shot and again for the last but one, so the clip loops.
const DESK_WIDE_A: V3 = [-3.3, 2.0, 8.1];
const DESK_WIDE_B: V3 = [-3.4, 1.85, 7.0];
const DESK_T: V3 = [-3.75, 1.0, 2.0];
const FORM_HI = add(FORM, [0, 0.86, 0.3]);
const FORM_LO = add(FORM, [0, 0.66, 0.2]);
const BADGE: V3 = add(TRUCK, [2.3, 1.5, 1.112]);

const SHOTS: Shot<W>[] = [
  // "The Polish army once gave a bear his own soldier's paybook."  The bear sits across the desk from the sergeant.
  {world: 'dock', from: 0, keys: [k(0, DESK_WIDE_A, DESK_T, 44), k(B.sergeant, DESK_WIDE_B, DESK_T, 44)]},
  // "A sergeant fills in the papers."  Closer on the sergeant, pen at work.
  {world: 'dock', from: B.sergeant, keys: [k(B.sergeant, [-4.15, 1.55, 4.5], [-4.35, 1.05, 1.7], 42), k(B.name, [-4.2, 1.5, 4.0], [-4.35, 1.05, 1.7], 42)]},
  // "Name. Rank. Number."  Straight down on the form as each line is written.
  {world: 'dock', from: B.name, keys: [k(B.name, FORM_HI, FORM, 40), k(B.iran, FORM_LO, FORM, 40)]},
  // "Iran, 1942."  High over the camp, then a whip down to the stencilled crate.
  {world: 'camp', from: B.iran, keys: [
    k(B.iran, [9, 9, 14], [0, 0.6, -1], 46),
    k(B.y1942 - 8, [6.5, 5.5, 9.5], [1.5, 0.6, -1], 46),
    k(B.y1942 + 4, add(CAMP_CRATE, [0.1, 0.65, 2.0]), add(CAMP_CRATE, [0, 0.38, 0]), 40, 'whip'),
    k(B.buy, add(CAMP_CRATE, [0.08, 0.6, 1.65]), add(CAMP_CRATE, [0, 0.38, 0]), 40),
  ]},
  // "Polish soldiers buy an orphan bear cub from a boy."
  {world: 'camp', from: B.buy, keys: [k(B.buy, [0.1, 1.75, 7.0], [0.1, 1.05, 0.9], 46), k(B.named, [0.05, 1.7, 6.2], [0.1, 1.05, 0.9], 46)]},
  // "They name him Wojtek."  Down at the cub.
  {world: 'camp', from: B.named, keys: [k(B.named, [0.3, 0.8, 3.4], [0.2, 0.55, 1.6], 44), k(B.feed, [0.3, 0.72, 2.9], [0.2, 0.5, 1.6], 42)]},
  // "They feed him milk from an old vodka bottle."
  {world: 'camp', from: B.feed, keys: [k(B.feed, [0.7, 0.72, 3.1], [0.2, 0.5, 1.6], 40), k(B.grows, [0.45, 0.66, 2.6], [0.2, 0.5, 1.6], 38)]},
  // "Wojtek grows up with the men."  Dusk: along the line of men, the bear a head taller.
  {world: 'camp', from: B.grows, keys: [k(B.grows, [-2.4, 1.7, 6.2], [-0.5, 1.3, 0.6], 46, 'linear'), k(B.beer, [1.8, 1.7, 6.0], [0.8, 1.3, 0.6], 46, 'linear')]},
  // "He drinks their beer."
  {world: 'camp', from: B.beer, keys: [k(B.beer, [0.3, 1.45, 3.9], [0, 1.15, 0.6], 44), k(B.cigs, [0.25, 1.4, 3.4], [0, 1.15, 0.6], 42)]},
  // "He even eats their cigarettes."
  {world: 'camp', from: B.cigs, keys: [k(B.cigs, [0.9, 1.4, 4.8], [0.55, 1.05, 0.7], 44), k(B.italy, [0.75, 1.35, 4.0], [0.5, 1.1, 0.7], 42)]},
  // "Then the army must sail to Italy."  Down from above the troopship to the quay.
  {world: 'dock', from: B.italy, keys: [k(B.italy, [30, 22, 30], [4, 3, -6], 46), k(B.ship, [17, 8, 17], [4, 2.5, -4], 46)]},
  // "The ship says: no pets."  In to the sign.
  {world: 'dock', from: B.ship, keys: [k(B.ship, [8.8, 1.85, 4.6], [SIGN[0], 1.7, SIGN[2]], 40), k(B.officer, [7.9, 1.78, 2.5], [SIGN[0], 1.75, SIGN[2]], 40)]},
  // "A British officer laughs."
  {world: 'dock', from: B.officer, keys: [k(B.officer, add(OFFICER, [0.4, 1.55, 3.4]), add(OFFICER, [0, 1.2, 0]), 42), k(B.lads, add(OFFICER, [0.35, 1.5, 2.8]), add(OFFICER, [0, 1.22, 0]), 42)]},
  // "Lads, a bear can't go to war."  The officer points at the bear and his men.
  {world: 'dock', from: B.lads, keys: [k(B.lads, [3.4, 1.75, 6.6], [3.35, 1.2, 0.8], 46), k(B.so, [3.35, 1.7, 5.8], [3.35, 1.2, 0.8], 46)]},
  // "So the soldiers make Wojtek a soldier."  Back at the desk.
  {world: 'dock', from: B.so, keys: [k(B.so, [-3.45, 1.9, 7.6], DESK_T, 44), k(B.rankList, [-3.5, 1.8, 6.8], DESK_T, 44)]},
  // "A rank, a paybook, a number."  The form and the paybook.
  {world: 'dock', from: B.rankList, keys: [k(B.rankList, [-4.2, 2.2, 2.55], [-4.2, 0.79, 2.1], 58), k(B.private, [-4.2, 2.02, 2.5], [-4.2, 0.79, 2.1], 58)]},
  // "Private Wojtek walks up the ramp."  Low at the foot of the gangway, rising with him.
  {world: 'dock', from: B.private, keys: [
    k(B.private, [4.6, 0.95, 4.6], add(rampWalk(B.private), [0, 1.4, 0]), 48, 'linear'),
    k(B.cassino, [4.8, 1.9, 2.2], add(rampWalk(B.cassino), [0, 1.4, 0]), 48, 'linear'),
  ]},
  // "At Monte Cassino, his company hauls heavy boxes of shells."  The monastery on its hill; the men at work.
  {world: 'cassino', from: B.cassino, keys: [k(B.cassino, [-5.5, 3.0, 10.5], [0.5, 3.0, -6], 46), k(B.watches, [-3.0, 2.2, 9.0], [1.5, 1.4, -1], 46)]},
  // "Wojtek watches the men lift them."
  {world: 'cassino', from: B.watches, keys: [k(B.watches, add(WATCH_SEAT, [-0.3, 1.45, 3.2]), add(WATCH_SEAT, [0.3, 1.1, -0.2]), 44), k(B.then, add(WATCH_SEAT, [-0.25, 1.4, 2.5]), add(WATCH_SEAT, [0.3, 1.1, -0.2]), 44)]},
  // "Then, his comrades said, he picked one up too."  He walks to the truck and takes a crate.
  {world: 'cassino', from: B.then, keys: [k(B.then, [1.4, 1.7, 7.0], [1.4, 1.2, 0.6], 46), k(B.another, [2.2, 1.7, 5.6], [2.0, 1.2, 0.2], 46)]},
  // "And another."  The stack grows.
  {world: 'cassino', from: B.another, keys: [k(B.another, add(STACK, [0.9, 1.7, 5.0]), add(STACK, [0.6, 1.0, 0.4]), 46), k(B.never, add(STACK, [0.9, 1.65, 4.5]), add(STACK, [0.6, 1.0, 0.4]), 46)]},
  // "He never dropped one."  Low, travelling with him.
  {world: 'cassino', from: B.never, keys: [
    k(B.never, [1.4, 0.7, 5.8], [1.0, 1.3, 0.4], 50),
    k(B.badge, [1.2, 0.65, 5.2], [0.9, 1.3, 0.4], 50),
  ]},
  // "His company gets a new badge: a bear carrying a shell."  In on the cab door, then back to see him pass it.
  {world: 'cassino', from: B.badge, keys: [
    k(B.badge, add(BADGE, [0.0, 0.25, 2.4]), BADGE, 40),
    k(B.bearCarrying, add(BADGE, [0.0, 0.2, 1.7]), BADGE, 40),
    k(B.bearCarrying + 12, [2.4, 2.2, 7.4], [1.6, 1.2, 0.2], 50, 'whip'),
    k(B.pulls, [2.2, 2.1, 6.8], [1.3, 1.2, 0.2], 50),
  ]},
  // "And the sergeant pulls out those papers again."  The desk, framed exactly like the opening.
  {world: 'cassino', from: B.pulls, keys: [k(B.pulls, DESK_WIDE_A, DESK_T, 44), k(B.crosses, DESK_WIDE_B, DESK_T, 44)]},
  // "He crosses out 'Private.'"  The form; cut as the line goes through.
  {world: 'cassino', from: B.crosses, keys: [k(B.crosses, FORM_HI, FORM, 40), k(END, FORM_LO, FORM, 40)]},
];

const KICKS: Kick[] = [
  {f: B.eats + 4, amp: 0.03},
  {f: B.laughs, amp: 0.04},
  {f: B.picked + 66, amp: 0.05},
  {f: B.badgeWord, amp: 0.04},
];
const WHIPS = [{from: B.y1942 - 8, to: B.y1942 + 4}, {from: B.bearCarrying, to: B.bearCarrying + 12}];

export const Wojtek: React.FC<{audio?: boolean; at?: number}> = ({audio = true, at}) => {
  const now = useCurrentFrame();
  const f = at ?? now;
  const {width, height} = useVideoConfig();
  const ready = useFontsLoaded();
  const cam = cameraAt(SHOTS, KICKS, f);
  const camVec = new THREE.Vector3(...cam.p);
  let blur = 0;
  for (const w of WHIPS) {
    const u = (f - w.from) / (w.to - w.from);
    if (u > 0 && u < 1) blur = Math.sin(Math.PI * u) * 14;
  }
  // the reveal: a short warm flash as the badge appears
  const pop = f >= B.badgeWord && f < B.badgeWord + 7 ? 0.24 * (1 - (f - B.badgeWord) / 7) : 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#1a1410'}}>
      {ready && (
        <Graded theme={T} blur={blur}>
          <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 50, position: [0, 1, 5]}}>
            <Rig p={cam.p} t={cam.t} fov={cam.fov} far={1200} />
            <CamCtx.Provider value={camVec}>
              {cam.world === 'dock' && <DockWorld f={f} focus={cam.t} />}
              {cam.world === 'camp' && <CampWorld f={f} focus={cam.t} />}
              {cam.world === 'cassino' && <CassinoWorld f={f} focus={cam.t} />}
            </CamCtx.Provider>
          </ThreeCanvas>
        </Graded>
      )}
      {pop > 0 && <AbsoluteFill style={{backgroundColor: '#fff3c8', opacity: pop}} />}
      <Finish theme={T} f={f} />
      {ready && at === undefined && <WordCaptions words={words} theme={T} />}
      {audio && <Html5Audio src={staticFile('audio/wojtek-voice.mp3')} />}
      {audio && <Html5Audio src={staticFile('audio/wojtek-bed.wav')} />}
    </AbsoluteFill>
  );
};

// Contact frames for checking framing: one or two per shot.
const sec = [1.5, 5.4, 8.6, 9.8, 11.0, 13.4, 16.2, 18.6, 21.2, 22.8, 24.6, 27.0, 29.6, 31.5, 33.9, 36.9, 39.8, 42.4, 45.5, 48.7, 51.0, 52.8, 53.8, 55.6, 57.8, 59.3, 61.6, 64.6];
export const STILL_FRAMES = sec.map((x) => s(x));
export const WojtekStills: React.FC = () => {
  const i = useCurrentFrame();
  return <Wojtek audio={false} at={STILL_FRAMES[Math.min(i, STILL_FRAMES.length - 1)]} />;
};
