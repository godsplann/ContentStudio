// "The ship nobody sank": the first Undercover short, in the toon-3D style with the Undercover finish
// (sticker-outlined figures, Bebas captions with a gold key word, paper grain and a warm wash).
// Worlds: the North Atlantic (the steamer, the boats, the U-boats) and the torpedo room. All motion comes from the frame number.
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
import {SeaWorld} from './SeaWorld';
import {COMMANDER, TALLY, TORP_HERO, TorpedoRoom} from './TorpedoRoom';
import {boatAt, CRATE, DECK, DUMMY, HUNT, PREY, PRONE_X, subAt, WING} from './story';

export const qShipDuration = DURATION_FRAMES;
const T = THEMES.undercover;

type W = 'sea' | 'torp';
const k = (f: number, p: V3, t: V3, fov: number, ease?: CamKey['ease']): CamKey => ({f, p, t, fov, ease});
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const END = DURATION_FRAMES;
const H: V3 = [HUNT[0], 0, HUNT[2]];
const SUB = (f: number) => subAt(f).pos;
const boat = (i: number, f: number) => boatAt(i, f).pos;

const SHOTS: Shot<W>[] = [
  // "The captain ordered his crew to abandon ship."  The bridge wing: the captain points, the boats go down the side.
  {world: 'sea', from: 0, keys: [k(0, [12.0, 5.8, 16.5], [6.6, 3.5, 3.6], 56), k(B.nothing, [10.8, 5.5, 14.4], [6.4, 3.5, 3.7], 54)]},
  // "Nothing was wrong with it."  Along the sound, calm hull from the bow.
  {world: 'sea', from: B.nothing, keys: [k(B.nothing, [-30, 3.2, 12], [-12, 3.4, 0], 46), k(B.atlantic, [-22, 4.8, 13], [0, 4.6, 0], 46)]},
  // "North Atlantic, 1916."  High over the lone ship, then down to the stencil on the crate.
  {world: 'sea', from: B.atlantic, keys: [
    k(B.atlantic, [40, 70, 80], [0, 0, 0], 44),
    k(B.y1916 - 10, [22, 34, 44], [-2, 2, 2], 44),
    k(B.y1916 + 4, add(CRATE, [-0.7, 1.7, -6.2]), add(CRATE, [0, 0.7, 0]), 42, 'whip'),
    k(B.german, add(CRATE, [-0.5, 1.5, -5.4]), add(CRATE, [0, 0.7, 0]), 40),
  ]},
  // "German submarines are hunting lone cargo ships."  Low over the water beside a U-boat on the hunt.
  {world: 'sea', from: B.german, keys: [k(B.german, add(H, [14, 2.6, 16]), add(H, [-1, 2.6, -2]), 46), k(B.torpedoes, add(H, [9, 2.4, 12]), add(H, [-1, 2.8, -3]), 44)]},
  // "Torpedoes are precious,"  Inside: the chalk tally, then the commander hugging a torpedo.
  {world: 'torp', from: B.torpedoes, keys: [
    k(B.torpedoes, [0.3, 1.75, 3.3], TALLY, 46),
    k(B.precious - 6, [1.5, 1.75, 4.0], [0.6, 1.25, 0.9], 50, 'whip'),
    k(B.so, [1.3, 1.65, 3.5], [0.6, 1.3, 1.0], 48),
  ]},
  // "so a sub would rather surface and finish small ships with its deck gun."  It rises, then the gun fires.
  {world: 'sea', from: B.so, keys: [
    k(B.so, add(H, [-14, 4, 20]), add(H, [0, 0.8, -2]), 48),
    k(B.finish, add(H, [-10, 3.4, 15]), add(H, [0, 1.8, -2]), 46),
    k(B.finish + 14, add(H, [2.4, 4.4, 2.2]), [PREY[0], 2, PREY[2]], 42, 'whip'),
    k(B.steamer, add(H, [2.2, 4.1, 1.4]), [PREY[0], 2, PREY[2]], 40),
  ]},
  // "And this rusty old steamer..."  Gliding along the rust streaks at water level.
  {world: 'sea', from: B.steamer, keys: [k(B.steamer, [-10, 2.2, 11.5], [-4, 2.6, 3.1], 48), k(B.easiest, [5, 2.8, 11], [11, 3.4, 3.1], 48)]},
  // "...looks like the easiest target on the ocean."  Small and alone on a wide sea.
  {world: 'sea', from: B.easiest, keys: [k(B.easiest, [34, 5, 54], [0, 4, 0], 36), k(B.every, [42, 7, 68], [0, 4, 0], 36)]},
  // "Every morning, the captain drills his crew in one thing:"  The crew lined up on deck.
  {world: 'sea', from: B.every, keys: [k(B.every, [5.2, 7.2, 8.6], [10.4, 3.4, 0.6], 50), k(B.running, [6.0, 6.6, 7.6], [10.4, 3.4, 0.6], 48)]},
  // "running away."  They bolt for the boats.
  {world: 'sea', from: B.running, keys: [k(B.running, [9.6, 5.0, 7.4], [9.8, 3.5, 2.0], 50), k(B.newHand, [9.3, 4.7, 6.6], [9.6, 3.5, 2.0], 48)]},
  // "A new deckhand frowns."
  {world: 'sea', from: B.newHand, keys: [k(B.newHand, [8.7, 4.05, 4.6], [8.4, 3.75, 1.6], 40), k(B.sir, [8.55, 3.95, 3.8], [8.4, 3.78, 1.6], 38)]},
  // "Sir, shouldn't we practise fighting?"  The deckhand and the captain.
  {world: 'sea', from: B.sir, keys: [k(B.sir, [9.9, 6.3, 7.0], [9.8, 3.4, 0.6], 46), k(B.reply, [9.8, 6.1, 6.4], [9.8, 3.4, 0.6], 44)]},
  // "Practise falling into a lifeboat."  The captain points; the deckhand tumbles in.
  {world: 'sea', from: B.reply, keys: [k(B.reply, [9.6, 6.2, 7.4], [9.4, 3.4, 1.4], 48), k(B.lifeboat + 14, [8.8, 6.0, 8.0], [7.8, 3.4, 3.2], 48), k(B.periscope, [8.6, 5.9, 7.8], [7.6, 3.4, 3.4], 48)]},
  // "Then a periscope breaks the water."  Water level, the ship far behind.
  {world: 'sea', from: B.periscope, keys: [k(B.periscope, [SUB(B.periscope)[0] + 1.6, 0.9, SUB(B.periscope)[2] + 7.5], [SUB(B.periscope)[0] + 0.25, 0.9, SUB(B.periscope)[2]], 40), k(B.scramble, [SUB(B.periscope)[0] + 0.9, 0.8, SUB(B.periscope)[2] + 5.4], [SUB(B.periscope)[0] + 0.25, 1.1, SUB(B.periscope)[2]], 38)]},
  // "The crew scrambles into the boats,"
  {world: 'sea', from: B.scramble, keys: [k(B.scramble, [10.4, 6.4, 12.4], [8.8, 3.2, 2.4], 52), k(B.dropping, [9.6, 5.6, 11], [8.8, 3.0, 3.0], 50)]},
  // "dropping oars,"  Up at the boat from the water.
  {world: 'sea', from: B.dropping, keys: [k(B.dropping, [9.0, 0.9, 11.5], [7.2, 1.8, 4.8], 48), k(B.shouting, [8.6, 0.8, 10.6], [7.2, 1.4, 5.0], 46)]},
  // "shouting,"
  {world: 'sea', from: B.shouting, keys: [k(B.shouting, add(boat(1, B.shouting), [-1, 1.9, 6.2]), add(boat(1, B.shouting), [0, 1.2, 0]), 48), k(B.oneMan, add(boat(1, B.oneMan), [-0.6, 1.8, 5.4]), add(boat(1, B.oneMan), [0, 1.2, 0]), 46)]},
  // "one man still holding his teacup."
  {world: 'sea', from: B.oneMan, keys: [k(B.oneMan, add(boat(0, B.oneMan), [1.5, 1.45, 3.2]), add(boat(0, B.oneMan), [1.3, 1.3, 0]), 38), k(B.rises, add(boat(0, B.rises), [1.4, 1.4, 2.6]), add(boat(0, B.rises), [1.3, 1.32, 0]), 36)]},
  // "The submarine rises, slow and confident,"
  {world: 'sea', from: B.rises, keys: [
    k(B.rises, [SUB(B.rises)[0] + 12, 3.0, SUB(B.rises)[2] + 18], [SUB(B.rises)[0], 1, SUB(B.rises)[2]], 46),
    k(B.slow + 6, [SUB(B.slow)[0] + 9, 3.8, SUB(B.slow)[2] + 14], [SUB(B.slow)[0], 2.0, SUB(B.slow)[2]], 44),
    k(B.slow + 16, [SUB(B.slow)[0] + 1.8, 5.4, SUB(B.slow)[2] + 6.2], [SUB(B.slow)[0], 4.0, SUB(B.slow)[2] + 0.6], 40, 'whip'),
    k(B.creeps, [SUB(B.creeps)[0] + 1.6, 5.2, SUB(B.creeps)[2] + 5.4], [SUB(B.creeps)[0], 4.0, SUB(B.creeps)[2] + 0.6], 38),
  ]},
  // "and creeps toward the empty ship."  High behind the U-boat.
  {world: 'sea', from: B.creeps, keys: [k(B.creeps, add(SUB(B.creeps), [-5, 12, 26]), [-2, 3, 4], 46, 'linear'), k(B.except, add(SUB(B.except), [-4, 10, 22]), [-2, 3, 4], 46, 'linear')]},
  // "Except it isn't empty."  Up the side and over the rail.
  {world: 'sea', from: B.except, keys: [k(B.except, [-6.4, 3.0, 8.8], [-6.4, 3.4, 2.2], 46), k(B.isnt, [-6.4, 3.7, 7.4], [-6.4, 3.4, 2.2], 46), k(B.half, [-6.4, 7.0, 4.6], [-6.4, 2.7, 1.5], 46)]},
  // "Half the crew is still aboard, lying flat behind the rails,"  Along the row from inboard.
  {world: 'sea', from: B.half, keys: [k(B.half, [-7.4, 5.3, -2.0], [-7.4, 2.9, 1.8], 48), k(B.notBreathing, [2.0, 5.2, -1.9], [2.4, 2.9, 1.8], 48, 'linear')]},
  // "not breathing."  Puffed cheeks.
  {world: 'sea', from: B.notBreathing, keys: [k(B.notBreathing, [PRONE_X.g1 + 0.55, DECK + 1.5, 0.3], [PRONE_X.g1 + 0.55, DECK + 0.32, 1.75], 40), k(B.navy, [PRONE_X.g1 + 0.55, DECK + 1.3, 0.6], [PRONE_X.g1 + 0.55, DECK + 0.32, 1.75], 38)]},
  // "The Navy had a name for these decoys:"  The whole trap from above.
  {world: 'sea', from: B.navy, keys: [k(B.navy, [8, 52, 40], [0, 0, 13], 48), k(B.qships, [5, 42, 32], [-1, 0, 13], 46)]},
  // "Q-ships."  The fake deckhouse wall swings ajar on a hidden gun.
  {world: 'sea', from: B.qships, keys: [k(B.qships, add(DUMMY, [0.5, 3.0, 3.9]), add(DUMMY, [0, 1.0, 1.0]), 46), k(B.men, add(DUMMY, [0.4, 2.8, 3.4]), add(DUMMY, [0, 1.0, 1.0]), 44)]},
  // "The men in the boats were the panic party,"
  {world: 'sea', from: B.men, keys: [k(B.men, add(boat(0, B.men), [5, 2.6, 11]), add(boat(0, B.men), [3, 1.2, 1]), 50), k(B.everyScream, add(boat(0, B.everyScream), [4.4, 2.4, 9.6]), add(boat(0, B.everyScream), [3, 1.2, 1]), 48)]},
  // "and every scream was rehearsed."  The clipboard.
  {world: 'sea', from: B.everyScream, keys: [k(B.everyScream, add(boat(0, B.everyScream), [-1.0, 1.5, 3.4]), add(boat(0, B.everyScream), [-1.3, 1.3, 0]), 38), k(B.slides, add(boat(0, B.slides), [-1.1, 1.45, 2.8]), add(boat(0, B.slides), [-1.3, 1.3, 0]), 36)]},
  // "The sub slides closer."  Over a hidden sailor and the rail.
  {world: 'sea', from: B.slides, keys: [k(B.slides, [PRONE_X.g2 + 0.9, DECK + 1.45, 0.1], [-2.5, 2.2, 30], 42), k(B.captainNods, [PRONE_X.g2 + 0.8, DECK + 1.45, 0.5], [-2.5, 2.2, 26], 40)]},
  // "The captain nods."  Eyes over the canvas screen.
  {world: 'sea', from: B.captainNods, keys: [k(B.captainNods, [WING[0] + 0.7, WING[1] + 1.5, 6.6], [WING[0] + 0.4, WING[1] + 1.15, 2.9], 32), k(B.coop, [WING[0] + 0.6, WING[1] + 1.45, 5.9], [WING[0] + 0.4, WING[1] + 1.15, 2.9], 30)]},
  // "And the chicken coop on deck falls open."  Hens on the coop... it bursts, the gun swings out. Cut on the moment.
  {world: 'sea', from: B.coop, keys: [k(B.coop, [-12.0, 6.8, 6.4], [-9.5, 3.4, 1.0], 46), k(B.falls, [-11.6, 6.4, 5.6], [-9.5, 3.4, 1.0], 44), k(END, [-11.4, 6.0, 5.0], [-9.4, 3.5, 1.2], 42)]},
];

const KICKS: Kick[] = [
  {f: B.gun, amp: 0.06},
  {f: B.lifeboat + 12, amp: 0.05},
  {f: B.falls + 3, amp: 0.12, len: 14},
];
const WHIPS = [
  {from: B.y1916 - 10, to: B.y1916 + 4},
  {from: B.precious - 14, to: B.precious - 6},
  {from: B.finish, to: B.finish + 14},
  {from: B.slow + 6, to: B.slow + 16},
];

export const QShip: React.FC<{audio?: boolean; at?: number}> = ({audio = true, at}) => {
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
  // the reveal: a short warm flash as the coop opens
  const pop = f >= B.falls + 2 && f < B.falls + 8 ? 0.28 * (1 - (f - B.falls - 2) / 6) : 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#0e1216'}}>
      {ready && (
        <Graded theme={T} blur={blur}>
          <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 50, position: [0, 1, 5]}}>
            <Rig p={cam.p} t={cam.t} fov={cam.fov} far={1500} />
            <CamCtx.Provider value={camVec}>
              {cam.world === 'sea' && <SeaWorld f={f} focus={cam.t} />}
              {cam.world === 'torp' && <TorpedoRoom f={f} />}
            </CamCtx.Provider>
          </ThreeCanvas>
        </Graded>
      )}
      {pop > 0 && <AbsoluteFill style={{backgroundColor: '#fff3c8', opacity: pop}} />}
      <Finish theme={T} f={f} />
      {ready && at === undefined && <WordCaptions words={words} theme={T} />}
      {audio && <Html5Audio src={staticFile('audio/q-ship-voice.mp3')} />}
      {audio && <Html5Audio src={staticFile('audio/q-ship-bed.wav')} />}
    </AbsoluteFill>
  );
};

// Contact frames for checking framing: one or two per shot.
const sec0 = [1.0, 2.6, 4.0, 5.6, 6.9, 7.6, 9.5, 11.6, 12.6, 13.6, 15.3, 16.8, 18.2, 20.5, 22.5, 25.9, 27.3, 29.8, 32.0, 33.3, 35.5, 37.2, 38.9, 39.6, 40.8, 42.8, 44.6, 45.4, 47.0, 48.8, 50.2, 51.5, 53.5, 54.7, 56.5, 58.4, 60.2, 62.5, 64.8, 66.7, 68.2, 69.6, 70.5];
// set QSTILLS to check a few frames only
const sec = sec0;
export const STILL_FRAMES = sec.map((x) => s(x));
export const QShipStills: React.FC = () => {
  const i = useCurrentFrame();
  return <QShip audio={false} at={STILL_FRAMES[Math.min(i, STILL_FRAMES.length - 1)]} />;
};
