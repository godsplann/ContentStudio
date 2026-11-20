// The southern shore: a beach of vanaras, Hanuman on a rock by the waves, Mahendra mountain, far-off Lanka.
// The same place returns in three lights: late-afternoon gold, dusk, and sunset.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, makeCrowdMesh, mythicSprite, placeFlat, useCam, V3} from '../shared/flat';
import {CAST, MythicExpr, MythicPose} from '../shared/mythic';
import {DustBurst, Glow, Particles, SkyDome} from '../shared/fx';
import {cloudTexture, frondTexture, rippleTexture, rockTexture, sandTexture, skyTexture, barkTexture, grassTexture} from '../shared/nature';
import {rng} from '../shared/toon';
import {ramp} from '../shared/camera';
import {B, GIANT, HANUMAN_SHORE, JAMBAVAN_AT, JAMBAVAN_FROM, LANKA, MAHENDRA, MAHENDRA_H, ROCK, SUMMIT} from './beats';

type MoodId = 'gold' | 'dusk' | 'sunset';
type Mood = {
  sky: [number, string][];
  fog: string;
  sunDir: V3;
  sun: string;
  sunInt: number;
  hemi: [string, string, number];
  water: string;
  tint: string;
  sunGlow: string;
};

const MOODS: Record<MoodId, Mood> = {
  gold: {
    sky: [[0, '#3f78c9'], [0.38, '#8fb9e8'], [0.49, '#ffe0a8'], [0.52, '#f3c98c'], [1, '#8a6a4a']],
    fog: '#f3d6a8',
    sunDir: [-0.45, 0.42, -0.78],
    sun: '#ffe1ae',
    sunInt: 2.7,
    hemi: ['#b5d0ff', '#8a6a44', 0.95],
    water: '#2c7aa0',
    tint: '#fff6ea',
    sunGlow: '#ffe7b0',
  },
  dusk: {
    sky: [[0, '#2b2f6e'], [0.32, '#6a5aa8'], [0.46, '#ff9a72'], [0.51, '#ffc48a'], [1, '#4a3040']],
    fog: '#d99a8a',
    sunDir: [-0.55, 0.2, -0.8],
    sun: '#ffb27a',
    sunInt: 2.3,
    hemi: ['#9d8fe0', '#5a3a3a', 0.8],
    water: '#2f5482',
    tint: '#ffe2d2',
    sunGlow: '#ffb070',
  },
  sunset: {
    sky: [[0, '#3a1f5e'], [0.3, '#a8406e'], [0.44, '#ff7a4a'], [0.5, '#ffc864'], [0.53, '#f08a5a'], [1, '#3a2030']],
    fog: '#ee8f68',
    sunDir: [0.02, 0.1, -1],
    sun: '#ff9a52',
    sunInt: 2.5,
    hemi: ['#c08ad0', '#5a3030', 0.85],
    water: '#5a3a70',
    tint: '#ffd9bc',
    sunGlow: '#ffb45a',
  },
};

export const moodAt = (f: number): MoodId => (f < B.flashbackIn ? 'gold' : f < B.lesson ? 'dusk' : 'sunset');

// ----- Hanuman: where he is, how big, and how he stands, frame by frame -----
type HState = {pos: V3; scale: number; pose: MythicPose; expr: MythicExpr; roll: number; squash: number; aura: number};
export const hanumanAt = (f: number): HState => {
  const base = {roll: 0, squash: 1, aura: 0};
  if (f >= B.yourJambavan - 6) return {...base, pos: HANUMAN_SHORE, scale: 1, pose: 'hold', expr: 'happy'};
  if (f >= B.lesson) {
    // flying across the setting sun, left to right
    const u = (f - B.lesson) / (B.yourJambavan - B.lesson);
    return {...base, pos: [-15 + u * 30, 9 + Math.sin(u * Math.PI) * 2.5, -70], scale: 4.2, pose: 'fly', expr: 'happy', roll: -1.42};
  }
  if (f >= B.overSea) {
    // over the open sea towards Lanka
    const d = f - B.overSea;
    return {...base, pos: [2, 9, -34 - d * 6.2], scale: 1.6, pose: 'fly', expr: 'stern', roll: -1.4};
  }
  if (f >= B.leap) {
    const u = (f - B.leap) / (B.overSea - B.leap);
    return {
      ...base,
      pos: [SUMMIT[0] - u * 10, SUMMIT[1] + u * 26, SUMMIT[2] - u * 40],
      scale: GIANT * (1 - 0.3 * u),
      pose: 'fly',
      expr: 'stern',
      roll: -0.35 - u * 0.5,
    };
  }
  if (f >= B.mahendra) {
    const crouch = f >= B.crouch ? 0.82 + 0.18 * (1 - ramp(f, B.crouch, B.crouch + 8)) : 1;
    return {...base, pos: SUMMIT, scale: GIANT, pose: 'hold', expr: f >= B.jaiShriRam ? 'stern' : 'happy', squash: crouch, aura: f >= B.jaiShriRam ? 1 : 0.4};
  }
  if (f >= B.growStart) {
    const g = ramp(f, B.growStart, B.growEnd);
    return {...base, pos: HANUMAN_SHORE, scale: 1 + g * (GIANT + 1.5 - 1), pose: 'stand', expr: 'stern', aura: 0.6 + 0.4 * g};
  }
  const expr: MythicExpr = f >= B.whoYouAre ? 'awe' : 'sad';
  return {...base, pos: HANUMAN_SHORE, scale: 1, pose: 'stand', expr, aura: f >= B.pavanputra ? 0.25 * ramp(f, B.pavanputra, B.whoYouAre + 20) : 0};
};

// ----- The vanara army on the beach: three looks, four moods each, drawn as instanced crowds -----
const VANARAS = ['vanaraA', 'vanaraB', 'vanaraC'] as const;
type CrowdState = 'calm' | 'sad' | 'awe' | 'cheer';
const crowdState = (f: number): CrowdState => (f >= B.yourJambavan - 6 ? 'cheer' : f >= B.growStart ? 'awe' : f >= B.armyHeadsDown ? 'sad' : 'calm');
const CROWD_N = 66;
const crowdSpots = (() => {
  const r = rng(99);
  const spots: {x: number; z: number; look: number; phase: number}[] = [];
  while (spots.length < CROWD_N) {
    const x = -15 + r() * 22;
    const z = 1.6 + r() * 11;
    const nearPath = Math.hypot(x - -3.4, z - 1.8) < 1.5 || Math.hypot(x - ROCK[0], z - ROCK[2]) < 1.6;
    if (nearPath || spots.some((p) => Math.hypot(p.x - x, p.z - z) < 0.75)) continue;
    spots.push({x, z, look: spots.length % 3, phase: r() * 6.28});
  }
  return spots;
})();

const H = 1.3; // Hanuman's normal height
const VH = 1.15; // a vanara's height

export const SeaWorld: React.FC<{f: number}> = ({f}) => {
  const cam = useCam();
  const moodId = moodAt(f);
  const mood = MOODS[moodId];

  const tex = useMemo(
    () => ({
      sand: sandTexture([40, 20]),
      rock: rockTexture('#8c8378', [1.5, 1.5]),
      mountain: rockTexture('#7d7466', [4, 3], 9),
      grass: grassTexture('#4f8a3c', [6, 6]),
      ripple: rippleTexture([60, 34]),
      rippleFar: rippleTexture([160, 160]),
      frond: frondTexture(),
      bark: barkTexture('#7a5a3c'),
      cloud: cloudTexture(),
      sky: {gold: skyTexture(MOODS.gold.sky), dusk: skyTexture(MOODS.dusk.sky), sunset: skyTexture(MOODS.sunset.sky)},
    }),
    [],
  );

  // Near ocean: a displaced grid, waves computed per frame.
  const ocean = useMemo(() => {
    const g = new THREE.PlaneGeometry(220, 110, 150, 70);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -54);
    return g;
  }, []);
  const basePos = useMemo(() => Float32Array.from(ocean.attributes.position.array as Float32Array), [ocean]);
  {
    const pos = ocean.attributes.position.array as Float32Array;
    const t = f / 30;
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePos[i];
      const z = basePos[i + 2];
      const amp = 0.05 + Math.min(0.42, -z * 0.012);
      pos[i + 1] =
        amp * (Math.sin(z * 0.55 + t * 1.6 + x * 0.08) * 0.6 + Math.sin(x * 0.31 - t * 1.1 + z * 0.2) * 0.3 + Math.sin((x + z) * 0.9 + t * 2.4) * 0.12);
    }
    ocean.attributes.position.needsUpdate = true;
    ocean.computeVertexNormals();
  }
  tex.ripple.offset.set(f * 0.0007, -f * 0.0016);
  tex.rippleFar.offset.set(f * 0.0003, -f * 0.0008);

  const mountain = useMemo(() => {
    const g = new THREE.ConeGeometry(11, MAHENDRA_H, 11, 5, true);
    const p = g.attributes.position;
    const r = rng(7);
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      if (y < MAHENDRA_H / 2 - 0.05) {
        p.setX(i, p.getX(i) * (0.85 + r() * 0.3));
        p.setZ(i, p.getZ(i) * (0.85 + r() * 0.3));
        p.setY(i, y + (r() - 0.5) * 0.6);
      }
    }
    g.computeVertexNormals();
    g.translate(0, MAHENDRA_H / 2, 0);
    return g;
  }, []);

  const rocks = useMemo(() => {
    const r = rng(12);
    const list: {pos: V3; s: V3; rot: number}[] = [{pos: ROCK, s: [1.25, 0.7, 1.0], rot: 0.3}];
    for (let i = 0; i < 14; i++) {
      const x = -18 + r() * 34;
      const z = -1.5 + r() * 3.4;
      if (Math.abs(x - ROCK[0]) < 2.2) continue;
      const k = 0.3 + r() * 0.9;
      list.push({pos: [x, -0.05, z], s: [k * 1.3, k * 0.6, k], rot: r() * 3});
    }
    return list;
  }, []);
  const rockGeo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 1);
    const p = g.attributes.position;
    const r = rng(3);
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.85 + r() * 0.3), Math.max(-0.2, p.getY(i)) * (0.85 + r() * 0.3), p.getZ(i) * (0.85 + r() * 0.3));
    g.computeVertexNormals();
    return g;
  }, []);

  const palms = useMemo(() => {
    const r = rng(21);
    const list: {pos: V3; h: number; lean: number; yaw: number}[] = [];
    for (let i = 0; i < 16; i++) list.push({pos: [-26 + r() * 40, 0, 11 + r() * 16], h: 4 + r() * 3, lean: 0.15 + r() * 0.25, yaw: r() * 6.28});
    list.push({pos: [-7.5, 0, 6], h: 5.2, lean: 0.35, yaw: 2.2}, {pos: [4.5, 0, 7.5], h: 4.6, lean: 0.3, yaw: 4.0});
    return list;
  }, []);

  // crowd meshes, one per look and state
  const crowds = useMemo(() => {
    const states: CrowdState[] = ['calm', 'sad', 'awe', 'cheer'];
    const m: Record<string, THREE.InstancedMesh> = {};
    for (const v of VANARAS)
      for (const st of states) {
        const c = CAST[v];
        const pose: MythicPose = st === 'cheer' ? 'fly' : 'stand';
        const expr: MythicExpr = st === 'cheer' ? 'happy' : st;
        m[`${v}|${st}`] = makeCrowdMesh(mythicSprite(v, c.look, pose, expr), VH, CROWD_N, '#ffffff');
      }
    return m;
  }, []);
  const cs = crowdState(f);
  for (const [key, mesh] of Object.entries(crowds)) {
    const [v, st] = key.split('|');
    (mesh.material as THREE.MeshBasicMaterial).color.set(mood.tint);
    crowdSpots.forEach((p, i) => {
      const show = VANARAS[p.look] === v && st === cs;
      const hop = cs === 'cheer' ? Math.abs(Math.sin(f * 0.32 + p.phase)) * 0.22 : 0;
      placeFlat(mesh, i, cam, p.x, hop, p.z, show, 0.6, cs === 'sad' ? 0.94 : 1);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  // Hanuman
  const hs = hanumanAt(f);
  const hc = CAST.hanuman;
  const hSprite = mythicSprite('hanuman', hc.look, hs.pose, hs.expr);
  const hFlying = hs.pose === 'fly';
  const hMid: V3 = [hs.pos[0], hs.pos[1] + H * hs.scale * 0.55, hs.pos[2]];

  // Jambavan
  const showJ = (f >= B.flashbackOut && f < B.mahendra) || f >= B.yourJambavan - 6;
  const jw = ramp(f, B.jambavanWalks, B.jambavanArrives);
  const jPos: V3 = f >= B.yourJambavan - 6 ? JAMBAVAN_AT : [JAMBAVAN_FROM[0] + (JAMBAVAN_AT[0] - JAMBAVAN_FROM[0]) * jw, 0, JAMBAVAN_FROM[2] + (JAMBAVAN_AT[2] - JAMBAVAN_FROM[2]) * jw];
  const jWalking = jw > 0 && jw < 1;
  const jExpr: MythicExpr = f >= B.yourJambavan - 6 ? 'happy' : f >= B.growStart ? 'awe' : 'calm';
  const jc = CAST.jambavan;

  // light follows the area being filmed
  const target = useMemo(() => new THREE.Object3D(), []);
  const focus: V3 = f >= B.lesson && f < B.yourJambavan - 6 ? [0, 0, -60] : f >= B.mahendra && f < B.overSea ? [SUMMIT[0], 6, SUMMIT[2]] : f >= B.overSea && f < B.vatika ? [hs.pos[0], 0, hs.pos[2]] : [-2, 0, 2];
  target.position.set(...focus);
  target.updateMatrixWorld();
  const shadowBox = f >= B.mahendra && f < B.vatika ? 40 : f >= B.growStart ? 26 : 16;
  const flash = f >= B.jaiShriRam ? Math.max(0, 1 - (f - B.jaiShriRam) / 26) : 0;
  const sunFar: V3 = [cam.x + mood.sunDir[0] * 520, cam.y + mood.sunDir[1] * 520, cam.z + mood.sunDir[2] * 520];

  return (
    <>
      <fog attach="fog" args={[mood.fog, 70, 560]} />
      <SkyDome tex={tex.sky[moodId]} center={[cam.x, cam.y, cam.z]} />
      <Glow pos={sunFar} size={moodId === 'sunset' ? 230 : 120} color={mood.sunGlow} opacity={0.9} />
      <Glow pos={sunFar} size={moodId === 'sunset' ? 70 : 34} color="#fff6dc" opacity={1} />
      {/* clouds */}
      {[
        [-160, 70, -380, 150],
        [120, 95, -420, 190],
        [-40, 120, -460, 220],
        [260, 60, -300, 130],
        [-300, 80, -260, 160],
      ].map(([x, y, z, w], i) => (
        <sprite key={i} position={[x + f * 0.02 * (i + 1), y, z]} scale={[w, w * 0.4, 1]}>
          <spriteMaterial map={tex.cloud} color={moodId === 'gold' ? '#ffffff' : moodId === 'dusk' ? '#ffc0b0' : '#ffb090'} transparent opacity={0.8} depthWrite={false} fog={false} />
        </sprite>
      ))}

      <hemisphereLight args={[mood.hemi[0], mood.hemi[1], mood.hemi[2] + flash * 1.6]} />
      <primitive object={target} />
      <directionalLight
        position={[focus[0] + mood.sunDir[0] * 60, focus[1] + Math.max(0.25, mood.sunDir[1]) * 60, focus[2] + mood.sunDir[2] * 60]}
        target={target}
        intensity={mood.sunInt + flash * 2}
        color={mood.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowBox}
        shadow-camera-right={shadowBox}
        shadow-camera-top={shadowBox}
        shadow-camera-bottom={-shadowBox}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.0006}
      />

      {/* ocean */}
      <mesh geometry={ocean} receiveShadow>
        <meshStandardMaterial color={mood.water} roughness={0.22} metalness={0.25} />
      </mesh>
      <mesh geometry={ocean} renderOrder={1}>
        <meshBasicMaterial map={tex.ripple} transparent opacity={0.45} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, -700]}>
        <planeGeometry args={[2400, 1300]} />
        <meshStandardMaterial color={mood.water} roughness={0.25} metalness={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -700]} renderOrder={1}>
        <planeGeometry args={[2400, 1300]} />
        <meshBasicMaterial map={tex.rippleFar} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* sun path glitter on the water */}
      <Glow pos={[cam.x + mood.sunDir[0] * 160, 0.4, cam.z + mood.sunDir[2] * 160]} size={60} sx={0.35} color={mood.sunGlow} opacity={moodId === 'sunset' ? 0.55 : 0.3} />

      {/* beach */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 59.4]} receiveShadow>
        <planeGeometry args={[260, 120]} />
        <meshStandardMaterial map={tex.sand} roughness={0.95} />
      </mesh>
      {/* wet sand and foam where the waves reach */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0.1 + 0.25 * Math.sin(f * 0.07)]}>
        <planeGeometry args={[260, 0.9]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55 + 0.25 * Math.sin(f * 0.07 + 1)} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0.9]}>
        <planeGeometry args={[260, 1.4]} />
        <meshStandardMaterial color="#b89565" roughness={0.4} transparent opacity={0.6} />
      </mesh>
      {/* inland grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 70]} receiveShadow>
        <planeGeometry args={[260, 80]} />
        <meshStandardMaterial map={tex.grass} roughness={1} />
      </mesh>

      {rocks.map((r, i) => (
        <mesh key={i} geometry={rockGeo} position={r.pos} scale={r.s} rotation={[0, r.rot, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={tex.rock} roughness={0.9} flatShading />
        </mesh>
      ))}

      {/* Mahendra, with lower hills beside it */}
      <mesh geometry={mountain} position={MAHENDRA} castShadow receiveShadow>
        <meshStandardMaterial map={tex.mountain} roughness={1} flatShading />
      </mesh>
      {[
        [30, 0, 30, 9, 6],
        [4, 0, 34, 12, 5],
        [-22, 0, 36, 14, 7],
        [44, 0, 18, 10, 5],
      ].map(([x, y, z, rad, h], i) => (
        <mesh key={i} position={[x, y + h / 2 - 0.2, z]} castShadow receiveShadow>
          <coneGeometry args={[rad, h, 9, 1]} />
          <meshStandardMaterial color="#5d7a45" roughness={1} flatShading />
        </mesh>
      ))}

      {palms.map((p, i) => (
        <Palm key={i} {...p} bark={tex.bark} frond={tex.frond} f={f} i={i} />
      ))}

      {/* Lanka on the horizon: an island with golden towers */}
      <group position={LANKA}>
        <mesh scale={[70, 16, 30]} position={[0, -3, 0]}>
          <sphereGeometry args={[1, 24, 12]} />
          <meshStandardMaterial color="#3d5a4a" roughness={1} flatShading />
        </mesh>
        {[-24, -14, -6, 2, 9, 17, 26].map((x, i) => (
          <group key={i} position={[x, 10 + (i % 3) * 1.5, -6 + (i % 2) * 6]}>
            <mesh>
              <cylinderGeometry args={[1.6, 2, 5 + (i % 3) * 3, 8]} />
              <meshStandardMaterial color="#f4b93a" emissive="#a86a10" emissiveIntensity={0.5} metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0, 4 + (i % 3) * 1.5, 0]}>
              <coneGeometry args={[2, 4, 8]} />
              <meshStandardMaterial color="#ffd24a" emissive="#c07a10" emissiveIntensity={0.6} metalness={0.6} roughness={0.3} />
            </mesh>
            <Glow pos={[0, 4, 3]} size={10} color="#ffcf6a" opacity={0.35} />
          </group>
        ))}
      </group>

      {/* the army */}
      {Object.values(crowds).map((m, i) => (
        <primitive key={i} object={m} />
      ))}

      {/* Jambavan */}
      {showJ && <Flat s={mythicSprite('jambavan', jc.look, 'hold', jExpr)} pos={jPos} h={1.38} tint={mood.tint} bob={jWalking ? Math.abs(Math.sin(f * 0.45)) * 0.06 : 0} />}

      {/* Hanuman, his aura, wind and dust */}
      {f < B.overSea + 1 || f >= B.lesson ? (
        <Flat s={hSprite} pos={hs.pos} h={H} scale={hs.scale} roll={hs.roll} squash={hs.squash} tint={mood.tint} maxTilt={hFlying ? 1.5 : 0.6} airborne={hFlying} />
      ) : (
        <Flat s={hSprite} pos={hs.pos} h={H} scale={hs.scale} roll={hs.roll} tint={mood.tint} maxTilt={1.5} airborne />
      )}
      {hs.aura > 0 && <Glow pos={hMid} size={H * hs.scale * (1.6 + 0.08 * Math.sin(f * 0.5)) + flash * 6} color="#ffcf5a" opacity={0.25 + 0.35 * hs.aura + flash * 0.5} />}
      {f >= B.pavanputra && f < B.growEnd && (
        <Particles
          count={46}
          color="#7fbf4a"
          seed={5}
          at={(i, r) => {
            const age = f - B.pavanputra - r() * 30;
            const a = r() * 6.28 + age * (0.09 + r() * 0.05);
            const rad = 0.7 + r() * 1.3 + (f >= B.growStart ? ramp(f, B.growStart, B.growEnd) * 6 : 0);
            return {
              pos: [HANUMAN_SHORE[0] + Math.cos(a) * rad, 0.3 + r() * 2.2 + Math.sin(age * 0.05 + i) * 0.3, HANUMAN_SHORE[2] + Math.sin(a) * rad * 0.7],
              size: 0.14,
              visible: age > 0,
              spin: age * 0.2 + i,
            };
          }}
        />
      )}
      <DustBurst f={f} from={B.growEnd - 4} pos={[HANUMAN_SHORE[0], 0, HANUMAN_SHORE[2]]} size={2.2} />
      <DustBurst f={f} from={B.leap} pos={SUMMIT} size={5} n={14} />
      {flash > 0 && <Glow pos={[SUMMIT[0], SUMMIT[1] + 6, SUMMIT[2]]} size={40 * flash + 10} color="#ffe08a" opacity={0.7 * flash} />}
      {/* spray behind Hanuman over the sea */}
      {f >= B.overSea && f < B.vatika && (
        <Particles
          count={30}
          color="#fff2c8"
          glow
          shape="dot"
          seed={9}
          at={(i, r) => {
            const lag = r() * 14;
            const p = hanumanAt(Math.max(B.overSea, f - lag)).pos;
            return {pos: [p[0] + (r() - 0.5) * 0.6, p[1] + 0.8 + (r() - 0.5) * 0.6, p[2] + 1], size: 0.5 * (1 - lag / 14)};
          }}
        />
      )}
    </>
  );
};

// A palm: a curved trunk and a crown of drooping fronds that sway a little.
const Palm: React.FC<{pos: V3; h: number; lean: number; yaw: number; bark: THREE.Texture; frond: THREE.Texture; f: number; i: number}> = ({pos, h, lean, yaw, bark, frond, f, i}) => {
  const trunk = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean * h * 0.2, h * 0.55, 0), new THREE.Vector3(lean * h, h, 0));
    return {geo: new THREE.TubeGeometry(curve, 10, 0.16, 7, false), top: curve.getPoint(1)};
  }, [h, lean]);
  const sway = Math.sin(f * 0.05 + i) * 0.06;
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <mesh geometry={trunk.geo} castShadow>
        <meshStandardMaterial map={bark} roughness={1} />
      </mesh>
      <group position={trunk.top}>
        {Array.from({length: 8}).map((_, k) => (
          <group key={k} rotation={[0, (k / 8) * Math.PI * 2, 0]}>
            <mesh position={[1.3, -0.35, 0]} rotation={[-0.25 + sway, 0, -0.42 - (k % 2) * 0.15 + sway]} castShadow>
              <planeGeometry args={[2.8, 0.7]} />
              <meshStandardMaterial map={frond} alphaTest={0.5} side={THREE.DoubleSide} roughness={0.9} />
            </mesh>
          </group>
        ))}
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0.12 * Math.cos(k * 2), -0.15, 0.12 * Math.sin(k * 2)]}>
            <sphereGeometry args={[0.13, 8, 6]} />
            <meshStandardMaterial color="#6b4a2a" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const seaTint = (f: number) => MOODS[moodAt(f)].tint;
