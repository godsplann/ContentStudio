// The North Atlantic, 1916: the rusty steamer (a Q-ship), its lifeboats, the U-boat, and far off
// a second U-boat shelling a small sailing ship. Fully lit 3D world; figures are flat stickers.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, useCam, V3} from '../shared/flat';
import {ramp} from '../shared/camera';
import {DustBurst, Glow, SkyDome} from '../shared/fx';
import {Ball, Box, Cyl, KeyLight} from '../shared/kit';
import {cloudTexture, rippleTexture, skyTexture} from '../shared/nature';
import {woodTexture} from '../shared/toon';
import {PRONE_ASPECT} from '../shared/people';
import {B} from './beats';
import {hen, person, prone, Who} from './cast';
import {
  BEAM, boatAt, BOATS_X, BRIDGE, PRONE_X, CAPT_DRILL, COOP, CRATE, DECK, DUMMY, huntAt, LINEUP_X, phaseAt, PREY, RAIL_Z, SUB_LEN, subAt, WING,
} from './story';
import {coopTexture, crateTexture, housePaint, hullTexture, steelTexture} from './textures';

const H = 1.75; // figure height
const SUN_DIR: V3 = [0.55, 0.62, 0.62];
const TINT = '#fff4e6';

// The sea surface height, shared by the ocean mesh and everything that floats.
export const waveY = (x: number, z: number, f: number) => {
  const t = f / 30;
  return 0.16 * Math.sin(x * 0.21 + t * 1.1 + z * 0.05) + 0.1 * Math.sin(z * 0.33 - t * 1.5) + 0.04 * Math.sin((x + z) * 0.9 + t * 2.6);
};

// ---------- The steamer ----------

const HULL_PTS: [number, number][] = [
  [-20, 0], [-17.5, 1.6], [-14, 2.7], [-10, BEAM], [14, BEAM], [16.6, 2.6], [18.2, 1.4], [18.6, 0],
  [18.2, -1.4], [16.6, -2.6], [14, -BEAM], [-10, -BEAM], [-14, -2.7], [-17.5, -1.6],
];

const useShipParts = () =>
  useMemo(() => {
    const shape = new THREE.Shape();
    HULL_PTS.forEach(([x, z], i) => (i ? shape.lineTo(x, z) : shape.moveTo(x, z)));
    shape.closePath();
    const depth = 5.6;
    const hull = new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: false});
    hull.rotateX(Math.PI / 2);
    hull.translate(0, DECK, 0);
    const side = hullTexture();
    side.repeat.set(1 / 10, -1 / depth);
    side.offset.set(0, 1);
    const deck = woodTexture();
    deck.wrapS = deck.wrapT = THREE.RepeatWrapping;
    deck.repeat.set(0.25, 0.5);
    const mats = [
      new THREE.MeshStandardMaterial({map: deck, roughness: 0.85, color: '#c9b9a0'}),
      new THREE.MeshStandardMaterial({map: side, roughness: 0.7, metalness: 0.1}),
    ];
    // bulwark segments along the outline, slightly inside the hull edge
    const segs: {p: V3; len: number; yaw: number}[] = [];
    for (let i = 0; i < HULL_PTS.length; i++) {
      const [ax, az] = HULL_PTS[i];
      const [bx, bz] = HULL_PTS[(i + 1) % HULL_PTS.length];
      const len = Math.hypot(bx - ax, bz - az);
      segs.push({p: [(ax + bx) / 2 * 0.985, DECK + 0.5, (az + bz) / 2 * 0.95], len: len + 0.1, yaw: -Math.atan2(bz - az, bx - ax)});
    }
    return {
      hull,
      mats,
      segs,
      house: housePaint(true),
      wheel: housePaint(false),
      crate: crateTexture(),
      coop: coopTexture(),
    };
  }, []);

const Bulwark: React.FC<{segs: {p: V3; len: number; yaw: number}[]}> = ({segs}) => (
  <>
    {segs.map((s, i) => (
      <group key={i} position={s.p} rotation={[0, s.yaw, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[s.len, 1.0, 0.14]} />
          <meshStandardMaterial color="#41464b" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.53, 0]} castShadow>
          <boxGeometry args={[s.len, 0.08, 0.24]} />
          <meshStandardMaterial color="#d6cdb6" roughness={0.6} />
        </mesh>
      </group>
    ))}
  </>
);

// A ship's lifeboat: a rounded hull, thwarts, a little rudder. Local origin at the waterline, length along x.
const Lifeboat: React.FC<{pos: V3; f: number; inWater: boolean; children?: React.ReactNode}> = ({pos, f, inWater, children}) => {
  const bob = inWater ? waveY(pos[0], pos[2], f) : 0;
  const roll = inWater ? 0.05 * Math.sin(f * 0.09 + pos[0]) : 0;
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} rotation={[roll, 0, 0.03 * Math.sin(f * 0.07)]}>
      <mesh scale={[3.2, 0.75, 1.0]} position={[0, 0.25, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#f1ece0" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.15, 0.98, 1]}>
        <circleGeometry args={[1, 28]} />
        <meshStandardMaterial color="#9a6a3c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.25, 0]} scale={[3.22, 0.1, 1.02]}>
        <torusGeometry args={[1, 0.06, 6, 40]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      {[-1.4, 0, 1.4].map((x) => (
        <Box key={x} p={[x, 0.3, 0]} s={[0.25, 0.08, 1.7]} c="#b9854f" />
      ))}
      {children}
    </group>
  );
};

// The deck gun: pedestal, breech, shield and barrel. yaw 0 points along -x (stowed).
const DeckGun: React.FC<{yaw: number; pitch: number; scale?: number; color?: string; recoil?: number}> = ({yaw, pitch, scale = 1, color = '#4a5048', recoil = 0}) => (
  <group scale={scale}>
    <Cyl p={[0, 0.35, 0]} rt={0.22} rb={0.32} h={0.7} c={color} metal={0.4} rough={0.5} />
    <group position={[0, 0.85, 0]} rotation={[0, yaw, 0]}>
      <group rotation={[0, 0, -pitch]}>
        <Box p={[0.15 + recoil, 0, 0]} s={[0.8, 0.36, 0.36]} c={color} metal={0.4} rough={0.5} />
        <Cyl p={[-0.95 + recoil, 0.04, 0]} r={[0, 0, Math.PI / 2]} rt={0.08} rb={0.1} h={1.9} c="#34392f" metal={0.5} rough={0.4} />
        <Box p={[-0.35, 0.1, 0]} s={[0.06, 0.8, 1.0]} c={color} metal={0.3} />
      </group>
    </group>
  </group>
);

// ---------- The U-boat ----------
// Points towards -z. Local origin at the middle of the hull's axis.
const UBoat: React.FC<{steel: THREE.Texture; scope: number; gunYaw?: number; recoil?: number; children?: React.ReactNode}> = ({steel, scope, gunYaw = -Math.PI / 2, recoil = 0, children}) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <capsuleGeometry args={[1.35, SUB_LEN - 4, 10, 24]} />
      <meshStandardMaterial map={steel} color="#7f8a92" roughness={0.55} metalness={0.3} />
    </mesh>
    {/* deck casing */}
    <Box p={[0, 1.35, 0]} s={[1.3, 0.35, SUB_LEN - 6]} c="#5f6a72" map={steel} rough={0.6} />
    {/* bow saw and stern */}
    <Box p={[0, 1.1, -SUB_LEN / 2 + 1.5]} s={[0.12, 1.2, 2.6]} r={[0.5, 0, 0]} c="#4d575e" />
    {/* conning tower */}
    <mesh position={[0, 2.25, 0.4]} scale={[1, 1, 1.8]} castShadow receiveShadow>
      <cylinderGeometry args={[0.85, 1.0, 1.9, 24]} />
      <meshStandardMaterial map={steel} color="#7a858d" roughness={0.55} metalness={0.3} />
    </mesh>
    <Box p={[0, 3.25, 0.4]} s={[1.9, 0.12, 3.2]} c="#59636a" />
    <Box p={[0, 3.55, 1.6]} s={[1.6, 0.5, 0.1]} c="#59636a" />
    {/* periscopes */}
    <Cyl p={[0.25, 3.6 + scope * 1.8, 0.0]} rt={0.07} h={1.8} c="#3a4046" metal={0.5} />
    <Cyl p={[0.25, 4.5 + scope * 1.8, -0.06]} rt={0.09} h={0.18} r={[Math.PI / 2, 0, 0]} c="#2b2f33" metal={0.6} />
    <Cyl p={[-0.3, 3.5, 0.6]} rt={0.05} h={1.2} c="#3a4046" />
    {/* net cutter wire */}
    <Cyl p={[0, 3.4, -6]} rt={0.02} h={12.6} r={[1.38, 0, 0]} c="#2b2f33" shadow={false} />
    {/* deck gun forward of the tower */}
    <group position={[0, 1.5, -3.4]}>
      <DeckGun yaw={gunYaw} pitch={0.12} color="#59636a" recoil={recoil} />
    </group>
    {children}
  </group>
);

// ---------- A small sailing ship (the hunter's prey) ----------
const Schooner: React.FC<{f: number; hit: number}> = ({f, hit}) => (
  <group rotation={[0.04 * Math.sin(f * 0.08), 0.6, 0.06 * Math.sin(f * 0.06) + hit * 0.18]}>
    <Box p={[0, 0.5, 0]} s={[9, 1.6, 2.6]} c="#6b4a32" />
    <Box p={[-4.9, 0.7, 0]} s={[1.6, 1.2, 1.6]} r={[0, Math.PI / 4, 0]} c="#6b4a32" />
    <Box p={[0, 1.33, 0]} s={[9, 0.08, 2.4]} c="#c9a477" />
    {[-1.6, 2.2].map((x) => (
      <group key={x}>
        <Cyl p={[x, 4.8, 0]} rt={0.1} h={7} c="#5a3e28" />
        <mesh position={[x + 0.9, 4.6, 0]} castShadow>
          <planeGeometry args={[1.8, 5]} />
          <meshStandardMaterial color="#f1e9d4" side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      </group>
    ))}
  </group>
);

// ---------- The world ----------

export const SeaWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const cam = useCam();
  const parts = useShipParts();
  const tex = useMemo(
    () => ({
      sky: skyTexture([
        [0, '#6f9cc8'],
        [0.32, '#a9c6de'],
        [0.47, '#f2dcc0'],
        [0.5, '#f6e2c6'],
        [0.53, '#9fb5c0'],
        [1, '#6d8796'],
      ]),
      cloud: cloudTexture(),
      ripple: rippleTexture([46, 46]),
      rippleFar: rippleTexture([180, 180]),
      steel: steelTexture('#6b767e', [8, 1]),
    }),
    [],
  );

  // Ocean: a displaced grid that follows the area being filmed, waves in world coordinates.
  const ocean = useMemo(() => {
    const g = new THREE.PlaneGeometry(240, 240, 140, 140);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const basePos = useMemo(() => Float32Array.from(ocean.attributes.position.array as Float32Array), [ocean]);
  const ox = Math.round(focus[0] / 10) * 10;
  const oz = Math.round(focus[2] / 10) * 10;
  {
    const pos = ocean.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) pos[i + 1] = waveY(basePos[i] + ox, basePos[i + 2] + oz, f);
    ocean.attributes.position.needsUpdate = true;
    ocean.computeVertexNormals();
  }
  tex.ripple.offset.set(f * 0.0006 - ox / 240 * 46, -f * 0.0012 + oz / 240 * 46);
  tex.rippleFar.offset.set(f * 0.0003, -f * 0.0006);

  const ph = phaseAt(f);
  const t = f / 30;
  const shipBob = 0.07 * Math.sin(t * 0.9);
  const shipRoll = 0.012 * Math.sin(t * 0.7);
  const sunFar: V3 = [cam.x + SUN_DIR[0] * 520, cam.y + SUN_DIR[1] * 300, cam.z + SUN_DIR[2] * 520];

  // ---- who stands where, by phase ----
  const figs: {who: Who; pose: Parameters<typeof person>[1]; expr: Parameters<typeof person>[2]; pos: V3; carry?: Parameters<typeof person>[3]; flip?: boolean; bob?: number; roll?: number; }[] = [];

  if (ph === 'abandon') figs.push({who: 'captain', pose: 'point', expr: 'focused', pos: [WING[0] + 0.3, WING[1], WING[2] - 0.2]});
  if (ph === 'normal') {
    figs.push({who: 'captain', pose: 'stand', expr: 'calm', pos: [WING[0], WING[1], WING[2] - 0.2]});
    figs.push({who: 'c3', pose: 'stand', expr: 'calm', pos: [CRATE[0] + 1.6, DECK, 2.1]});
    figs.push({who: 'c1', pose: 'carry', expr: 'focused', pos: [-13.4, DECK, -0.8], flip: true});
  }
  if (ph === 'drill') {
    const run = ramp(f, B.running, B.running + 22);
    const crew: Who[] = ['newbie', 'c1', 'c2', 'c3', 'c4'];
    crew.forEach((w, i) => {
      const x0 = LINEUP_X[i];
      if (w === 'newbie') {
        // he stays put, frowning, then argues, then tumbles into the boat
        const fall = ramp(f, B.lifeboat - 4, B.lifeboat + 12);
        const inBoat = f >= B.lifeboat + 12;
        const bx = BOATS_X[0];
        const p: V3 = [x0 + (bx - x0) * fall, DECK + Math.sin(Math.PI * fall) * 1.3 + fall * 0.1, 1.6 + (BEAM + 1.0 - 1.6) * fall];
        if (inBoat) figs.push({who: w, pose: 'armsUp', expr: 'awe', pos: [bx + 0.6, DECK + 0.65, BEAM + 1.0]});
        else
          figs.push({
            who: w,
            pose: f >= B.lifeboat - 4 ? 'armsUp' : f >= B.sir ? 'shrug' : 'stand',
            expr: f >= B.lifeboat - 4 ? 'awe' : f >= B.newHand ? 'focused' : 'calm',
            pos: p,
            roll: fall * 4.2,
          });
        return;
      }
      const tx = BOATS_X[i % 2] + (i > 2 ? 0.8 : -0.8);
      const p: V3 = [x0 + (tx - x0) * run, DECK, 1.6 + (2.35 - 1.6) * run];
      const running = run > 0 && run < 1;
      figs.push({who: w, pose: run > 0 ? 'armsUp' : 'stand', expr: run > 0 ? 'awe' : 'calm', pos: p, bob: running ? Math.abs(Math.sin(f * 0.6 + i)) * 0.18 : 0, flip: i % 2 === 1});
    });
    figs.push({
      who: 'captain',
      pose: f >= B.reply ? 'point' : f >= B.thing && f < B.running + 30 ? 'point' : 'stand',
      expr: f >= B.reply ? 'happy' : f >= B.sir ? 'calm' : 'focused',
      pos: CAPT_DRILL,
      flip: f >= B.reply,
    });
  }
  if (ph === 'attack') {
    // the captain crouched on the bridge wing, eyes above the canvas screen; he nods on "nods"
    const nod = f >= B.nods && f < B.nods + 14 ? -0.07 * Math.sin((Math.PI * (f - B.nods)) / 14) : 0;
    figs.push({who: 'captain', pose: 'stand', expr: f >= B.nods ? 'focused' : 'calm', pos: [WING[0] + 0.4, WING[1] + nod, 2.9]});
    // the coop's gun crew springs up as it opens
    if (f >= B.falls) {
      figs.push({who: 'g1', pose: 'reach', expr: 'focused', pos: [COOP[0] + 1.0, DECK, COOP[2] - 0.6]});
      figs.push({who: 'g3', pose: 'point', expr: 'happy', pos: [COOP[0] - 1.2, DECK, COOP[2] - 0.5]});
    }
  }
  // the drill's crew on deck running to the boats as the periscope shows
  const scrambleCrew: Who[] = ['c2', 'c1', 'c4', 'newbie'];
  if (ph === 'attack' && f < B.scramble + 34) {
    const run = ramp(f, B.scramble - 6, B.scramble + 26);
    scrambleCrew.forEach((w, i) => {
      const x0 = 2 + i * 1.6;
      const tx = BOATS_X[i % 2] + (i > 1 ? 0.8 : -0.8);
      figs.push({who: w, pose: 'armsUp', expr: 'awe', pos: [x0 + (tx - x0) * run, DECK, 0.6 + 1.6 * run], bob: Math.abs(Math.sin(f * 0.7 + i)) * 0.2, flip: i % 2 === 0});
    });
  }

  // prone figures: the "isn't empty" reveal
  const proneList: {who: Who; x: number; expr: 'hold' | 'peek'}[] =
    ph === 'attack' && f < B.falls
      ? [
          {who: 'g1', x: PRONE_X.g1, expr: f >= B.notBreathing ? 'hold' : 'peek'},
          {who: 'g3', x: PRONE_X.g3, expr: 'hold'},
          {who: 'g2', x: PRONE_X.g2, expr: f >= B.flat ? 'hold' : 'peek'},
          {who: 'c3', x: PRONE_X.c3, expr: 'hold'},
        ]
      : [];
  const standing = figs;

  // lifeboats and who is in them
  const boats = [0, 1].map((i) => boatAt(i, f));
  const inBoat = (i: number): {who: Who; pose: Parameters<typeof person>[1]; expr: Parameters<typeof person>[2]; carry?: Parameters<typeof person>[3]; x: number}[] => {
    if (ph === 'abandon')
      return i === 0
        ? [{who: 'c1', pose: 'armsUp', expr: 'awe', x: -1.2}, {who: 'newbie', pose: 'shrug', expr: 'strain', x: 0.2}, {who: 'c4', pose: 'hold', expr: 'calm', carry: 'teacup', x: 1.4}]
        : [{who: 'c2', pose: 'armsUp', expr: 'awe', x: -0.6}, {who: 'c3', pose: 'armsUp', expr: 'strain', x: 0.9}];
    if (ph !== 'attack' || f < B.scramble + 30) return [];
    const shout = f >= B.shouting && Math.floor(f / 8) % 2 === 0;
    const rehearsedTick = f >= B.rehearsed;
    return i === 0
      ? [
          {who: 'c1', pose: f >= B.everyScream ? 'hold' : 'armsUp', expr: f >= B.everyScream ? (rehearsedTick ? 'happy' : 'focused') : shout ? 'awe' : 'strain', carry: f >= B.everyScream ? 'clipboard' : undefined, x: -1.3},
          {who: 'c4', pose: f >= B.oneMan ? 'hold' : 'armsUp', expr: f >= B.oneMan ? 'calm' : 'awe', carry: 'teacup', x: 1.3},
        ]
      : [
          {who: 'c2', pose: 'armsUp', expr: shout ? 'awe' : 'strain', x: -0.8},
          {who: 'newbie', pose: f >= B.men ? 'armsUp' : 'shrug', expr: shout || f >= B.men ? 'awe' : 'strain', x: 1.0},
        ];
  };

  // falling oars on "dropping oars"
  const oars = [0, 1].map((i) => {
    const d = f - (B.dropping + i * 6);
    if (ph !== 'attack' || d < 0) return null;
    const u = Math.min(1, d / 18);
    const b = boats[0].pos;
    const y = Math.max(waveY(b[0], b[2] + 1.2, f) + 0.05, b[1] + 1.2 - u * u * 3);
    return {pos: [b[0] - 1 + i * 2, y, b[2] + 1.0 + u * 0.6] as V3, rot: u * (1.4 + i * 0.5)};
  });

  // the U-boat in our story
  const sub = subAt(f);
  const showSub = ph === 'attack';
  const subBob = sub.depth < 0.5 ? waveY(sub.pos[0], sub.pos[2], f) * 0.6 : 0;
  const rising = f >= B.rises && f < B.creeps + 20;

  // the hunter far away
  const hunt = huntAt(f);
  const showHunt = f >= B.german && f < B.steamer;
  const huntRecoil = f >= B.gun && f < B.gun + 8 ? 0.25 * (1 - (f - B.gun) / 8) : 0;
  const huntFlash = f >= B.gun && f < B.gun + 6 ? 1 - (f - B.gun) / 6 : 0;
  const hit = f >= B.gun + 9 ? Math.min(1, (f - B.gun - 9) / 20) : 0;

  // the coop bursting open
  const open = ramp(f, B.falls, B.falls + 9);
  const swing = ramp(f, B.falls + 6, B.falls + 22);
  const henFly = f >= B.falls ? (f - B.falls) / 30 : 0;

  // the dummy deckhouse's wall, ajar on "Q-ships"
  const ajar = ramp(f, B.qships - 4, B.qships + 14) * 0.6;

  // smoke from the funnel
  const smoke = Array.from({length: 9}, (_, i) => {
    const u = ((f / 30 + i * 0.7) % 6.3) / 6.3;
    return {p: [0.6 + u * 9, DECK + 8.4 + u * 6, 0 - u * 2] as V3, r: 0.7 + u * 2.4, o: 0.55 * (1 - u)};
  });

  const shadowSize = Math.abs(focus[0] - HUNT_X) < 60 ? 24 : 16;

  return (
    <>
      <fog attach="fog" args={['#d9dcd6', 70, 520]} />
      <SkyDome tex={tex.sky} center={[cam.x, cam.y, cam.z]} radius={700} />
      <Glow pos={sunFar} size={150} color="#ffd9a0" opacity={0.75} />
      <Glow pos={sunFar} size={40} color="#fff7e0" opacity={1} />
      {[
        [-220, 70, -420, 200],
        [140, 90, -460, 230],
        [-40, 110, -500, 260],
        [320, 60, -320, 160],
        [420, 80, 120, 200],
        [-380, 70, 160, 210],
      ].map(([x, y, z, w], i) => (
        <sprite key={i} position={[x + f * 0.03 * (i + 1), y, z]} scale={[w, w * 0.4, 1]}>
          <spriteMaterial map={tex.cloud} color="#ffffff" transparent opacity={0.85} depthWrite={false} fog={false} />
        </sprite>
      ))}

      <hemisphereLight args={['#c4d8f0', '#3f5a66', 1.05]} />
      <KeyLight focus={focus} dir={[SUN_DIR[0] * 40, SUN_DIR[1] * 40, SUN_DIR[2] * 40]} color="#ffe6c4" intensity={2.4} size={shadowSize} />

      {/* ocean */}
      <group position={[ox, 0, oz]}>
        <mesh geometry={ocean} receiveShadow>
          <meshStandardMaterial color="#3a6a80" roughness={0.25} metalness={0.25} />
        </mesh>
        <mesh geometry={ocean} renderOrder={1}>
          <meshBasicMaterial map={tex.ripple} transparent opacity={0.4} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cam.x, -0.3, cam.z]}>
        <planeGeometry args={[2400, 2400]} />
        <meshStandardMaterial color="#3a6a80" roughness={0.3} metalness={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cam.x, -0.25, cam.z]} renderOrder={1}>
        <planeGeometry args={[2400, 2400]} />
        <meshBasicMaterial map={tex.rippleFar} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <Glow pos={[cam.x + SUN_DIR[0] * 150, 0.5, cam.z + SUN_DIR[2] * 150]} size={70} sx={0.3} color="#ffe2b0" opacity={0.35} />

      {/* ---- the steamer ---- */}
      <group position={[0, shipBob, 0]} rotation={[shipRoll, 0, 0.004 * Math.sin(t * 0.5)]}>
        <mesh geometry={parts.hull} material={parts.mats} castShadow receiveShadow />
        <Bulwark segs={parts.segs} />
        {/* foam along the waterline */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05 - shipBob, 0]} scale={[21, 4.2, 1]} renderOrder={2}>
          <ringGeometry args={[0.92, 1.0, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35 + 0.15 * Math.sin(f * 0.1)} depthWrite={false} />
        </mesh>

        {/* hatches, ventilators, masts */}
        {[-15.4, -6.4].map((x, i) => (
          <group key={x}>
            <Box p={[x, DECK + 0.35, i ? -0.5 : 0]} s={[3.0, 0.7, i ? 2.0 : 3.0]} c="#4b4a3a" rough={0.95} />
            <Box p={[x, DECK + 0.72, i ? -0.5 : 0]} s={[3.1, 0.06, i ? 2.1 : 3.1]} c="#6b6a52" rough={0.95} />
          </group>
        ))}
        {[
          [-0.9, 1.5],
          [9.2, -1.6],
        ].map(([x, z]) => (
          <group key={`${x}${z}`}>
            <Cyl p={[x, DECK + 0.8, z]} rt={0.22} h={1.6} c="#e9e1cc" />
            <Cyl p={[x, DECK + 1.75, z + 0.15]} rt={0.42} rb={0.26} h={0.5} r={[0.6, 0, 0]} c="#e9e1cc" />
            <Cyl p={[x, DECK + 1.77, z + 0.2]} rt={0.32} rb={0.2} h={0.46} r={[0.6, 0, 0]} c="#b0432f" />
          </group>
        ))}
        {[
          [-12.2, 12.5],
          [14.4, 11],
        ].map(([x, h]) => (
          <group key={x}>
            <Cyl p={[x, DECK + h / 2, 0]} rt={0.12} rb={0.2} h={h} c="#c9a46a" />
            <Box p={[x, DECK + h * 0.72, 0]} s={[0.2, 0.2, 3.2]} c="#c9a46a" />
            <Cyl p={[x + (x < 0 ? -2.4 : 2.0), DECK + 2.2, 0]} rt={0.08} h={6} r={[0, 0, x < 0 ? 1.15 : -1.15]} c="#a8844a" />
            <Cyl p={[x, DECK + h * 0.5, 1.4]} rt={0.015} h={h * 1.05} r={[-0.12, 0, 0]} c="#2a2a2a" shadow={false} />
            <Cyl p={[x, DECK + h * 0.5, -1.4]} rt={0.015} h={h * 1.05} r={[0.12, 0, 0]} c="#2a2a2a" shadow={false} />
          </group>
        ))}
        {/* stays from mast to mast over the funnel */}
        <Cyl p={[1.1, DECK + 10.5, 0]} rt={0.015} h={26.8} r={[0, 0, Math.PI / 2 + 0.06]} c="#2a2a2a" shadow={false} />

        {/* the bridge house, bridge deck with wings, wheelhouse */}
        <Box p={[BRIDGE[0], DECK + 1.3, 0]} s={[5, 2.6, 4.4]} map={parts.house} rough={0.8} />
        <Box p={[BRIDGE[0], BRIDGE[1] + 0.05, 0]} s={[5.4, 0.1, 6.9]} c="#d8cfb6" />
        <Box p={[BRIDGE[0] - 0.4, BRIDGE[1] + 1.1, 0]} s={[3.0, 2.1, 3.4]} map={parts.house} rough={0.8} />
        <Box p={[BRIDGE[0] - 1.92, BRIDGE[1] + 1.35, 0]} s={[0.05, 0.6, 3.0]} c="#2b3a4a" emissive="#5a7a90" ei={0.25} />
        <Box p={[BRIDGE[0] - 0.4, BRIDGE[1] + 2.2, 0]} s={[3.4, 0.12, 3.8]} c="#a89c84" />
        {/* canvas dodgers on the wings */}
        {[3.42, -3.42].map((z) => (
          <group key={z}>
            <Box p={[BRIDGE[0], BRIDGE[1] + 0.43, z]} s={[2.6, 0.85, 0.06]} c="#d9cfb4" rough={0.95} />
            <Box p={[BRIDGE[0] - 1.3, BRIDGE[1] + 0.43, z * 0.86]} s={[0.06, 0.85, 1.0]} c="#d9cfb4" rough={0.95} />
            <Box p={[BRIDGE[0], BRIDGE[1] + 0.9, z]} s={[2.7, 0.06, 0.1]} c="#7a5a3a" />
          </group>
        ))}
        {/* the funnel */}
        <Cyl p={[0.6, DECK + 3.0, 0]} rt={1.05} h={6.0} c="#c9a46a" rough={0.7} />
        <Cyl p={[0.6, DECK + 5.4, 0]} rt={1.07} h={0.7} c="#b0432f" rough={0.7} />
        <Cyl p={[0.6, DECK + 7.0, 0]} rt={1.07} h={2.0} c="#1f1f22" rough={0.7} />
        {smoke.map((s, i) => (
          <Ball key={i} p={s.p} rad={s.r} c="#5a5752" opacity={s.o} shadow={false} rough={1} />
        ))}

        {/* lifeboat davits */}
        {BOATS_X.map((x) => (
          <group key={x}>
            {[-1.9, 1.9].map((dx) => (
              <group key={dx}>
                <Cyl p={[x + dx, DECK + 1.2, BEAM - 0.1]} rt={0.08} h={2.4} c="#d6cdb6" />
                <Cyl p={[x + dx, DECK + 2.35, BEAM + 0.45]} rt={0.07} h={1.2} r={[Math.PI / 2, 0, 0]} c="#d6cdb6" />
              </group>
            ))}
          </group>
        ))}

        {/* the coral cargo crate with the stencil */}
        <Box p={[CRATE[0], DECK + 0.62, CRATE[2]]} s={[1.7, 1.24, 1.24]} map={parts.crate} rough={0.85} emissive="#f4805c" ei={0.35} />
        <Box p={[CRATE[0] - 0.3, DECK + 1.5, CRATE[2] - 0.2]} s={[1.0, 0.5, 0.8]} c="#b98a55" rough={0.9} />

        {/* the dummy deckhouse aft, its front wall hinged at the bottom */}
        <Box p={[DUMMY[0], DECK + 1.1, DUMMY[2] - 0.15]} s={[2.6, 2.2, 2.1]} map={parts.house} rough={0.8} />
        <Box p={[DUMMY[0], DECK + 2.25, DUMMY[2]]} s={[2.8, 0.1, 2.6]} c="#a89c84" />
        <group position={[DUMMY[0], DECK, DUMMY[2] + 0.93]} rotation={[ajar, 0, 0]}>
          <Box p={[0, 1.1, 0]} s={[2.6, 2.2, 0.08]} map={parts.house} rough={0.8} />
        </group>
        <group position={[DUMMY[0] - 0.2, DECK, DUMMY[2] - 0.2]}>
          <DeckGun yaw={Math.PI / 2} pitch={0.05} scale={0.9} />
        </group>
        {ajar > 0.01 && <Glow pos={[DUMMY[0] + 0.3, DECK + 1.6, DUMMY[2] + 0.6]} size={0.6} color="#ffd25e" opacity={0.7 * (ajar / 0.6)} />}

        {/* the chicken coop on the foredeck, with a gun inside */}
        <group position={COOP}>
          <Box p={[0, 0.04, 0]} s={[2.7, 0.08, 2.3]} c="#7a5a3a" />
          {/* back wall (-z) */}
          <Box p={[0, 0.8, -1.12]} s={[2.7, 1.6, 0.08]} map={parts.coop} rough={0.9} />
          {/* side walls fall outwards */}
          <group position={[-1.33, 0.05, 0]} rotation={[0, 0, open * (Math.PI / 2 - 0.05)]}>
            <Box p={[0, 0.8, 0]} s={[0.08, 1.6, 2.3]} map={parts.coop} rough={0.9} />
          </group>
          <group position={[1.33, 0.05, 0]} rotation={[0, 0, -open * (Math.PI / 2 - 0.05)]}>
            <Box p={[0, 0.8, 0]} s={[0.08, 1.6, 2.3]} map={parts.coop} rough={0.9} />
          </group>
          {/* front wall (+z) drops flat */}
          <group position={[0, 0.05, 1.13]} rotation={[open * (Math.PI / 2 - 0.04), 0, 0]}>
            <Box p={[0, 0.8, 0]} s={[2.7, 1.6, 0.08]} map={parts.coop} rough={0.9} />
          </group>
          {/* the roof flips up and back */}
          <group position={[0, 1.62, -1.15]} rotation={[-open * 1.9, 0, 0]}>
            <Box p={[0, 0.04, 1.15]} s={[2.9, 0.08, 2.5]} c="#8a6a44" rough={0.9} />
          </group>
          {/* the gun: stowed along the coop, swings to point at the U-boat */}
          <group position={[0.1, 0.05, -0.1]}>
            <DeckGun yaw={swing * 1.82} pitch={0.04 + swing * 0.06} />
          </group>
          {open > 0 && <Glow pos={[0, 1.1, 0.4]} size={3.2 * open} color="#ffd25e" opacity={0.45 * open} />}
          {open > 0 && <DustBurst f={f} from={B.falls + 2} pos={[0, 0.1, 0.6]} size={1.6} color="#e7c46a" n={12} />}
        </group>
        {/* hens: perched on the coop, then flapping off */}
        {[0, 1, 2].map((i) => {
          const base: V3 = [COOP[0] - 0.9 + i * 0.9, DECK + 1.68, COOP[2] + 0.3 - (i % 2) * 0.5];
          const fly = henFly;
          const p: V3 = fly > 0 ? [base[0] + (i - 1) * fly * 2.5, base[1] + fly * (2.2 + i * 0.6), base[2] + fly * (1 + i * 0.4)] : base;
          return <Flat key={i} s={hen(fly > 0 ? 'flap' : 'sit', i)} pos={p} h={0.62} aspect={1} tint={TINT} flip={i === 1} roll={fly > 0 ? Math.sin(f * 0.8 + i) * 0.3 : 0} />;
        })}

        {/* the people on board */}
        {standing.map((g, i) => (
          <Flat key={`${g.who}${i}`} s={person(g.who, g.pose, g.expr, g.carry)} pos={g.pos} h={H} tint={TINT} flip={g.flip} bob={g.bob ?? 0} roll={g.roll ?? 0} />
        ))}
        {proneList.map((p) => (
          <Flat key={p.who} s={prone(p.who, p.expr)} pos={[p.x, DECK + 0.02, RAIL_Z - 1.0]} h={0.82} aspect={PRONE_ASPECT} tint={TINT} maxTilt={0.45} />
        ))}

        {/* lifeboats on the davits ride with the ship */}
        {boats.map((b, i) =>
          b.inWater ? null : (
            <Lifeboat key={i} pos={b.pos} f={f} inWater={false}>
              {inBoat(i).map((p) => (
                <Flat key={p.who} s={person(p.who, p.pose, p.expr, p.carry)} pos={[p.x, 0.0, 0]} h={H} tint={TINT} />
              ))}
            </Lifeboat>
          ),
        )}
      </group>

      {/* lifeboats in the water */}
      {boats.map((b, i) =>
        b.inWater ? (
          <Lifeboat key={i} pos={b.pos} f={f} inWater>
            {inBoat(i).map((p) => (
              <Flat
                key={p.who}
                s={person(p.who, p.pose, p.expr, p.carry)}
                pos={[p.x, 0.0, 0]}
                h={H}
                tint={TINT}
                bob={p.pose === 'armsUp' ? Math.abs(Math.sin(f * 0.5 + p.x)) * 0.12 : 0}
              />
            ))}
          </Lifeboat>
        ) : null,
      )}
      {oars.map((o, i) =>
        o ? <Cyl key={i} p={o.pos} rt={0.05} h={3.2} r={[Math.PI / 2 - 0.3, 0, o.rot]} c="#c9915a" /> : null,
      )}
      {oars.map((o, i) => (o && o.pos[1] < 0.3 ? <DustBurst key={`s${i}`} f={f} from={B.dropping + i * 6 + 14} pos={[o.pos[0], 0, o.pos[2]]} size={0.9} color="#ffffff" n={8} /> : null))}

      {/* ---- our U-boat ---- */}
      {showSub && (
        <group position={[sub.pos[0], sub.pos[1] + subBob, sub.pos[2]]} rotation={[0.01 * Math.sin(t), 0, 0.015 * Math.sin(t * 0.8)]}>
          <UBoat steel={tex.steel} scope={sub.scope} />
          {f >= B.slow && <Flat s={person('hunter', 'hold', 'happy', 'binoculars')} pos={[0, 3.3, 0.6]} h={H} tint={TINT} />}
        </group>
      )}
      {showSub && sub.scope > 0.3 && sub.depth > 0.5 && (
        <>
          <Glow pos={[sub.pos[0] + 0.25, 0.5, sub.pos[2]]} size={1.2} color="#ffffff" opacity={0.3} />
          <Glow pos={[sub.pos[0] + 0.25, 0.3, sub.pos[2] + 1.4]} size={1.6} sx={0.5} color="#ffffff" opacity={0.22} />
        </>
      )}
      {showSub && f >= B.breaks && f < B.breaks + 8 && <Glow pos={[sub.pos[0] + 0.25, 1.62, sub.pos[2] - 0.15]} size={2.2 * (1 - (f - B.breaks) / 8)} color="#fff6c8" opacity={1} />}
      {showSub && rising && (
        <>
          <DustBurst f={f} from={B.rises + 14} pos={[sub.pos[0], 0, sub.pos[2]]} size={2.6} color="#ffffff" n={12} />
        </>
      )}

      {/* ---- the hunter and its prey, far away ---- */}
      {showHunt && (
        <>
          <group position={[hunt.pos[0], -0.15 - hunt.depth * 4.4 + waveY(hunt.pos[0], hunt.pos[2], f) * 0.6, hunt.pos[2]]} rotation={[0, 0.25, 0.015 * Math.sin(t)]}>
            <UBoat steel={tex.steel} scope={0.4} gunYaw={-Math.PI / 2 - 0.2} recoil={huntRecoil}>
              {hunt.depth < 0.2 && (
                <>
                  <Flat s={person('hunter', f >= B.easiest - 60 ? 'hold' : 'point', 'happy', f >= B.easiest - 60 ? 'binoculars' : undefined)} pos={[0, 3.3, 0.6]} h={H} tint={TINT} />
                  {f >= B.finish && <Flat s={person('g2', 'reach', 'focused')} pos={[0.9, 1.5, -2.6]} h={H} tint={TINT} />}
                </>
              )}
            </UBoat>
          </group>
          {huntFlash > 0 && (
            <>
              <Glow pos={[hunt.pos[0] - 0.4, 2.5, hunt.pos[2] - 6]} size={5 * huntFlash} color="#ffcf70" opacity={1} />
              <DustBurst f={f} from={B.gun} pos={[hunt.pos[0] - 0.4, 2, hunt.pos[2] - 6]} size={1.6} color="#c8c2b8" n={8} />
            </>
          )}
          <group position={[PREY[0], waveY(PREY[0], PREY[2], f) * 0.8, PREY[2]]}>
            <Schooner f={f} hit={hit} />
          </group>
          {hit > 0 && <DustBurst f={f} from={B.gun + 9} pos={[PREY[0], 1.5, PREY[2]]} size={3} color="#e8e2d8" n={12} />}
          {hit > 0 && <Glow pos={[PREY[0], 2, PREY[2]]} size={6 * (1 - hit)} color="#ff9a3a" opacity={0.9} />}
        </>
      )}
    </>
  );
};

const HUNT_X = 160;
