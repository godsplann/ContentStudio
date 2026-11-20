// "The Soldiers Who Lifted a Tank": the third Undercover short (the Ghost Army, France 1944), toon-3D with the
// Undercover finish (sticker-outlined figures, Bebas captions with a gold key word, paper grain and a warm wash).
// One main place, the field, which time-lapses from day to night to morning; a short visit to the town square.
// The last shot repeats the first framing (the tank overhead), so the clip loops. All motion comes from the frame number.
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
import {FieldWorld, flashAt, TownWorld} from './Worlds';

export const ghostArmyDuration = DURATION_FRAMES;
const T = THEMES.undercover;

type W = 'field' | 'town';
const k = (f: number, p: V3, t: V3, fov: number, ease?: CamKey['ease']): CamKey => ({f, p, t, fov, ease});
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const END = DURATION_FRAMES;

// The opening framing, used again for the last shot so the video loops.
const HOOK_A: V3 = [0.0, 1.35, 14.0];
const HOOK_B: V3 = [0.05, 1.3, 12.8];
const HOOK_T: V3 = [-0.1, 2.3, 3.6];
// the plane's path on its first pass (planeAt switches it off outside the shot, so the keys use the path itself)
const plane = (f: number): V3 => [(f - B.photos) * 0.55, 34, -9];

const SHOTS: Shot<W>[] = [
  // "France, 1944."  Frame 0: four grinning GIs hold a tank over their heads; the stencilled crate in front.
  {world: 'field', from: 0, keys: [k(0, HOOK_A, HOOK_T, 46), k(B.four, HOOK_B, HOOK_T, 44)]},
  // "Four soldiers lift a forty-ton tank."  Low from the side; they pump it up on "lift".
  {world: 'field', from: B.four, keys: [k(B.four, [-6.8, 0.6, 9.8], [0, 2.0, 3], 50), k(B.frenchmen, [-6.0, 0.7, 8.6], [0, 2.1, 3], 48)]},
  // "Two Frenchmen on bicycles freeze."  They ride in along the lane and stop dead, the tank beyond them.
  {world: 'field', from: B.frenchmen, keys: [k(B.frenchmen, [9.8, 1.5, 17.8], [3.6, 1.6, 8], 46), k(B.how, [8.9, 1.4, 16.4], [3.4, 1.6, 8], 46)]},
  // "'How?' one asks."
  {world: 'field', from: B.how, keys: [k(B.how, [5.7, 1.35, 13.6], [4.5, 1.25, 10], 42), k(B.soldier, [5.5, 1.3, 12.9], [4.5, 1.25, 10], 40)]},
  // "A soldier shrugs."  He lets go to shrug; the tank tips a little.
  {world: 'field', from: B.soldier, keys: [k(B.soldier, [2.3, 1.5, 10.6], [0.9, 1.6, 6.0], 44), k(B.americans, [2.1, 1.45, 9.8], [0.9, 1.7, 6.0], 42)]},
  // "'The Americans are very strong.'"
  {world: 'field', from: B.americans, keys: [k(B.americans, [4.2, 0.9, 13.0], [0.4, 2.0, 3.4], 46), k(B.night, [3.6, 0.85, 11.6], [0.3, 2.0, 3.4], 46)]},
  // "That night, it gets stranger."  Craning up over the field as the sky time-lapses to night and the moon rises.
  {world: 'field', from: B.night, keys: [k(B.night, [6, 2.5, 17], [0, 2.5, -4], 50), k(B.bulldozer, [9, 9.5, 19], [0, 1, -9], 50)]},
  // "A bulldozer drives in circles around an empty field."  A fixed wide of the circle as the tracks draw in.
  {world: 'field', from: B.bulldozer, keys: [k(B.bulldozer, [9, 6.0, 1.5], [0, 0, -11], 52), k(B.trucks, [7.5, 5.2, -0.5], [0, 0, -11], 52)]},
  // "Trucks with giant speakers blast tank noises."  Low by the horns: rings of sound pulse towards us.
  {world: 'field', from: B.trucks, keys: [k(B.trucks, [7.2, 2.2, 5.2], [12.3, 2.6, -3], 52), k(B.allNight, [7.8, 2.4, 4.0], [12.3, 2.7, -3], 50)]},
  // "All night long."  Wide: the moon crosses, the dozer circles, the rings keep pulsing, dawn comes up.
  {world: 'field', from: B.allNight, keys: [k(B.allNight, [17, 6, 15], [0, 1.5, -6], 52), k(B.morning, [11, 4.5, 17], [-2, 1.5, -6], 52)]},
  // "Next morning, an artist..."  The oak and the artist's table in the low morning sun.
  {world: 'field', from: B.morning, keys: [k(B.morning, [-5.6, 1.6, 10.6], [-7.5, 1.2, 5.8], 46), k(B.paints, [-6.2, 1.45, 9.4], [-7.6, 1.05, 5.8], 44)]},
  // "...paints badges for a division that isn't there."  Macro on the patch filling with paint.
  {world: 'field', from: B.paints, keys: [k(B.paints, [-7.5, 1.6, 6.9], [-7.5, 0.78, 6.26], 46), k(B.town, [-7.46, 1.28, 6.62], [-7.5, 0.78, 6.26], 42)]},
  // "In town, a man in a general's uniform shows off loudly."
  {world: 'town', from: B.town, keys: [k(B.town, [1.2, 1.7, 9.5], [0, 1.9, -0.5], 46), k(B.isnt, [0.6, 1.5, 6.2], [0, 1.5, 0], 44)]},
  // "He isn't a general."  Close: a paper star comes off his cap and flutters down.
  {world: 'town', from: B.isnt, keys: [k(B.isnt, [0.4, 1.35, 3.6], [0.05, 1.1, 0.6], 42), k(B.overhead, [0.32, 0.95, 2.9], [0.08, 0.75, 0.6], 42)]},
  // "Overhead, a German plane takes photos of it all."  Above and behind the plane, the field below; flashes.
  {
    world: 'field',
    from: B.overhead,
    keys: [
      k(B.overhead, add(plane(B.overhead), [-10, 16, 12]), add(plane(B.overhead), [15, -24, -18]), 50, 'linear'),
      k(B.because, add(plane(B.because), [-10, 16, 12]), add(plane(B.because), [15, -24, -18]), 50, 'linear'),
    ],
  },
  // "Because there are no real tanks here."  On the grass: a GI pokes the tank and it wobbles.
  {world: 'field', from: B.because, keys: [k(B.because, [7.4, 1.5, 8.8], [1.0, 1.2, 3.4], 46), k(B.rubber, [6.6, 1.4, 8.0], [1.2, 1.2, 3.4], 44)]},
  // "They're rubber."  He shoves it: a big jelly bounce.
  {world: 'field', from: B.rubber, keys: [k(B.rubber, [5.6, 1.3, 7.2], [1.6, 1.15, 3.8], 44), k(B.blown, [5.3, 1.25, 6.8], [1.6, 1.15, 3.8], 42)]},
  // "Blown up from a bag in twenty minutes."  Time-lapse: a bundle on the grass swells into a tank. The signature shot.
  {world: 'field', from: B.blown, keys: [k(B.blown, [10.4, 0.8, 5.8], [6.4, 0.7, 0.5], 46), k(B.eleven, [12.0, 2.1, 7.8], [6.4, 1.2, 0.5], 52)]},
  // "Eleven hundred men, pretending to be a whole division."  The men drawn up; crane up over rows of rubber tanks.
  {
    world: 'field',
    from: B.eleven,
    keys: [k(B.eleven, [-62, 2.0, -6], [-62, 1.6, -22], 46), k(B.division + 10, [-62, 26, 6], [-62, 0, -36], 52), k(B.so, [-61, 27, 7], [-62, 0, -37], 52)],
  },
  // "So the Germans look here,"  Low among the rubber tanks, looking up at the plane as it flashes again.
  {world: 'field', from: B.so, keys: [k(B.so, [7, 1.0, -0.5], [0, 11, -10], 66), k(B.whileW, [6.2, 1.0, -1.0], [0, 11.5, -10], 64)]},
  // "...while the real attack comes somewhere else."  A whip away to the far road: real tanks rolling in dust.
  {
    world: 'field',
    from: B.whileW,
    keys: [k(B.whileW, [6.2, 1.0, -1.0], [0, 11.5, -10], 64), k(B.whileW + 10, [66, 1.8, -49], [80, 1.3, -58], 46, 'whip'), k(B.became, [82, 2.0, -49], [98, 1.3, -58], 46, 'linear')],
  },
  // "They became known as the Ghost Army."  Golden dusk: the men in a line before their rubber tanks, mist on the grass.
  {world: 'field', from: B.became, keys: [k(B.became, [2.5, 0.6, 9.0], [0, 1.6, -3], 46), k(B.secret, [2.0, 0.7, 7.0], [0, 1.7, -3], 44)]},
  // "Their secret stayed hidden until 1996."  The crate: days and nights race by, leaves fall; the lid lifts on "1996".
  {world: 'field', from: B.secret, keys: [k(B.secret, [-4.6, 2.6, 15.4], [-6.0, 1.1, 11.8], 44), k(B.back, [-5.0, 2.3, 14.5], [-6.0, 1.15, 11.8], 42)]},
  // "Back in the field, a soldier pulls a plug."  The opening picture again, from a little higher so the barrel's droop
  // reads over the hull. Cut on the moment.
  {world: 'field', from: B.back, keys: [k(B.back, [0.9, 3.0, 14.0], [0, 2.5, 3.6], 46), k(END, [0.8, 3.3, 12.6], [0, 2.6, 3.6], 44)]},
];

const KICKS: Kick[] = [
  {f: B.lift + 4, amp: 0.05},
  {f: B.freeze, amp: 0.03},
  {f: B.strong, amp: 0.04},
  {f: B.blast, amp: 0.05, len: 18},
  {f: B.rubberWord, amp: 0.05},
  {f: B.eleven - 14, amp: 0.04},
  {f: B.y1996, amp: 0.03},
];
const WHIPS = [{from: B.whileW, to: B.whileW + 10}];

export const GhostArmy: React.FC<{audio?: boolean; at?: number}> = ({audio = true, at}) => {
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
  // camera flashes from the plane, and a warm pop on the reveals ("rubber", "1996")
  const flash = flashAt(f) * 0.22;
  const popAt = (x: number) => (f >= x && f < x + 8 ? 0.22 * (1 - (f - x) / 8) : 0);
  const pop = Math.max(popAt(B.rubberWord), popAt(B.y1996 + 2));

  return (
    <AbsoluteFill style={{backgroundColor: '#14161c'}}>
      {ready && (
        <Graded theme={T} blur={blur}>
          <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}} camera={{fov: 50, position: [0, 1, 5]}}>
            <Rig p={cam.p} t={cam.t} fov={cam.fov} far={1200} />
            <CamCtx.Provider value={camVec}>
              {cam.world === 'field' && <FieldWorld f={f} focus={cam.t} />}
              {cam.world === 'town' && <TownWorld f={f} focus={cam.t} />}
            </CamCtx.Provider>
          </ThreeCanvas>
        </Graded>
      )}
      {flash > 0 && <AbsoluteFill style={{backgroundColor: '#ffffff', opacity: flash}} />}
      {pop > 0 && <AbsoluteFill style={{backgroundColor: '#fff3c8', opacity: pop}} />}
      <Finish theme={T} f={f} />
      {ready && at === undefined && <WordCaptions words={words} theme={T} />}
      {audio && <Html5Audio src={staticFile('audio/ghost-army-voice.mp3')} />}
      {audio && <Html5Audio src={staticFile('audio/ghost-army-bed.wav')} />}
    </AbsoluteFill>
  );
};

// Contact frames for checking framing: one or two per shot.
const sec = [0.5, 2.0, 4.0, 6.0, 7.8, 9.2, 10.9, 12.6, 14.6, 15.8, 18.0, 19.6, 21.0, 22.9, 24.2, 25.9, 27.6, 29.0, 31.0, 33.3, 34.8, 36.4, 37.7, 39.8, 41.7, 42.6, 43.4, 44.3, 45.6, 47.8, 49.2, 50.0, 51.6, 53.6, 56.0, 57.9, 59.6, 61.2, 62.3];
export const STILL_FRAMES = sec.map((x) => s(x));
export const GhostArmyStills: React.FC = () => {
  const i = useCurrentFrame();
  return <GhostArmy audio={false} at={STILL_FRAMES[Math.min(i, STILL_FRAMES.length - 1)]} />;
};
