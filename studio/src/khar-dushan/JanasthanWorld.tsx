// Panchavati and the plain of Janasthana: the hut by the Godavari, the rocky hill with the cave,
// and the open plain where Ram stands alone against Khara's army.
// Three lights: storm (the hook and the battle), a fresh morning (Panchavati), and sunset gold (the ending).
import React, {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {Flat, canvasSprite, mythicSprite, placeFlat, standingPlane, useCam, V3} from '../shared/flat';
import {CAST, drawMythic} from '../shared/mythic';
import {drawFallen, drawTrishira, FALLEN_ASPECT, TRISHIRA_ASPECT} from '../shared/epic';
import {DustBurst, Flame, Glow, Particles, SkyDome} from '../shared/fx';
import {barkTexture, cloudTexture, earthTexture, foliageTexture, grassTexture, rippleTexture, rockTexture, sandTexture, skyTexture, thatchTexture} from '../shared/nature';
import {plasterTexture, rng} from '../shared/toon';
import {ramp} from '../shared/camera';
import {B, s as sec, CAVE_MOUTH, CAVE_YAW, HILL_H, HILL_R, LAK_HUT, GENERAL_H, HUT, KHARA_H, MAN_H, RAM_B, RAM_H, RIVER_Z, ROCK, SOLDIER_H} from './beats';
import {add, armyExtra, armyVisible, arrowsAt, generalAt, kharaPlainAt, lakshmanAt, Mode, modeAt, ramAt, shurpanakhaDayAt, sitaAt, SOLDIERS, soldierAt} from './story';

type Light = {sky: [number, string][]; fog: string; near: number; far: number; sun: string; sunI: number; hemiTop: string; hemiBottom: string; hemiI: number; tint: string; sunDir: V3; glow: string; grass: string};
export const LIGHT: Record<Mode, Light> = {
  storm: {
    sky: [[0, '#1f1b2e'], [0.3, '#3d3150'], [0.43, '#8a4652'], [0.49, '#e0844e'], [0.51, '#3a3026'], [1, '#1a1814']],
    fog: '#5c4650', near: 28, far: 160, sun: '#ffa86a', sunI: 2.5, hemiTop: '#8c86c0', hemiBottom: '#3a2a22', hemiI: 0.8, tint: '#ecdcd6',
    sunDir: [-0.55, 0.32, 0.77], glow: '#ff8a4a', grass: '#7a8a5a',
  },
  day: {
    sky: [[0, '#4f86cf'], [0.36, '#a9cbe8'], [0.48, '#ffe6bf'], [0.5, '#f4d29e'], [0.52, '#7d9460'], [1, '#33461f']],
    fog: '#d7dcc8', near: 50, far: 300, sun: '#ffe0b0', sunI: 2.9, hemiTop: '#d8e6ff', hemiBottom: '#5a6a34', hemiI: 1.05, tint: '#fff8ee',
    sunDir: [0.62, 0.5, 0.6], glow: '#ffe2a0', grass: '#ffffff',
  },
  gold: {
    sky: [[0, '#5a3c7a'], [0.3, '#c45c6a'], [0.44, '#ff9a4a'], [0.49, '#ffd27a'], [0.51, '#6a4a2a'], [1, '#2a2014']],
    fog: '#e09a6a', near: 40, far: 240, sun: '#ffb46a', sunI: 2.6, hemiTop: '#ffc8a0', hemiBottom: '#4a3020', hemiI: 0.9, tint: '#ffe6c8',
    sunDir: [-0.66, 0.2, 0.72], glow: '#ffb050', grass: '#ffd8a8',
  },
};

const Sun: React.FC<{focus: V3; dir: V3; color: string; intensity: number}> = ({focus, dir, color, intensity}) => {
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(focus[0], focus[1], focus[2]);
  target.updateMatrixWorld();
  if (light.current) light.current.target = target;
  return (
    <>
      <primitive object={target} />
      <directionalLight
        ref={light}
        target={target}
        position={[focus[0] + dir[0] * 40, focus[1] + dir[1] * 40, focus[2] + dir[2] * 40]}
        intensity={intensity}
        color={color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-bias={-0.0006}
      />
    </>
  );
};

// The billboard's right-hand direction as the camera sees a figure standing at p.
const camRight = (cam: THREE.Vector3, p: V3): V3 => {
  const yaw = Math.atan2(cam.x - p[0], cam.z - p[2]);
  return [Math.cos(yaw), 0, -Math.sin(yaw)];
};

// ----- The army: one instanced mesh per look, standing and fallen -----
const LOOKS = [CAST.rakshasaA, CAST.rakshasaB, CAST.rakshasaC];
const instanced = (sp: {mat: THREE.MeshBasicMaterial; depth: THREE.MeshDepthMaterial}, h: number, aspect: number, count: number) => {
  const m = new THREE.InstancedMesh(standingPlane(h, aspect), sp.mat.clone(), count);
  m.castShadow = true;
  m.customDepthMaterial = sp.depth;
  m.frustumCulled = false;
  return m;
};

const Army: React.FC<{f: number; tint: string}> = ({f, tint}) => {
  const cam = useCam();
  const meshes = useMemo(() => {
    const counts = [0, 0, 0];
    for (const sd of SOLDIERS) counts[sd.v]++;
    return LOOKS.map((c, v) => ({
      up: instanced(mythicSprite(`rakshasa${v}`, c.look, 'hold', 'roar'), SOLDIER_H, 0.5, counts[v]),
      down: instanced(canvasSprite(`fallen|rakshasa${v}`, () => drawFallen(() => drawMythic({...c.look, held: undefined}, 'stand', 'sad'))), SOLDIER_H / 2, FALLEN_ASPECT, counts[v]),
    }));
  }, []);
  const vis = armyVisible(f);
  const idx = [0, 0, 0];
  for (const sd of SOLDIERS) {
    const i = idx[sd.v]++;
    const st = soldierAt(sd, f);
    const m = meshes[sd.v];
    placeFlat(m.up, i, cam, st.pos[0], st.pos[1], st.pos[2], vis && !st.fallen, 0.9);
    placeFlat(m.down, i, cam, st.pos[0], 0, st.pos[2], vis && st.fallen, 1.25);
  }
  for (const m of meshes) {
    m.up.instanceMatrix.needsUpdate = true;
    m.down.instanceMatrix.needsUpdate = true;
    (m.up.material as THREE.MeshBasicMaterial).color.set(tint);
    (m.down.material as THREE.MeshBasicMaterial).color.set(tint);
  }
  return (
    <>
      {meshes.map((m, v) => (
        <React.Fragment key={v}>
          <primitive object={m.up} />
          <primitive object={m.down} />
        </React.Fragment>
      ))}
    </>
  );
};

// ----- Arrows of light -----
const Y = new THREE.Vector3(0, 1, 0);
const s53 = sec(53.0);
const Arrows: React.FC<{f: number}> = ({f}) => {
  const list = arrowsAt(f);
  return (
    <>
      {list.map((a, i) => {
        const u = (f - a.t0) / (a.t1 - a.t0);
        if (u > 1) {
          const k = 1 - (f - a.t1) / 3;
          return <Glow key={i} pos={a.to} size={1.6} color="#fff0b0" opacity={0.9 * k} />;
        }
        const arc = Math.sin(Math.PI * u) * 0.8;
        const p: V3 = [a.from[0] + (a.to[0] - a.from[0]) * u, a.from[1] + (a.to[1] - a.from[1]) * u + arc, a.from[2] + (a.to[2] - a.from[2]) * u];
        const dir = new THREE.Vector3(a.to[0] - a.from[0], a.to[1] - a.from[1] + Math.cos(Math.PI * u) * 2.5, a.to[2] - a.from[2]).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(Y, dir);
        const back = (len: number): V3 => [p[0] - dir.x * len * 0.5, p[1] - dir.y * len * 0.5, p[2] - dir.z * len * 0.5];
        // the trail grows out of the bow, so it never reaches back past Ram
        const went = u * Math.hypot(a.to[0] - a.from[0], a.to[2] - a.from[2]);
        const core = Math.max(0.05, Math.min(1.2, went));
        const trail = Math.max(0.05, Math.min(4.2, went));
        return (
          <group key={i}>
            <mesh position={back(core)} quaternion={q}>
              <cylinderGeometry args={[0.03, 0.03, core, 5]} />
              <meshBasicMaterial color="#fff6d8" toneMapped={false} fog={false} />
            </mesh>
            <mesh position={back(trail)} quaternion={q}>
              <cylinderGeometry args={[0.09, 0.01, trail, 6]} />
              <meshBasicMaterial color="#ffc85a" transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
            </mesh>
            <Glow pos={p} size={0.9 * Math.min(1, 0.25 + went / 4)} color="#ffd36a" opacity={0.9} />
          </group>
        );
      })}
    </>
  );
};

// ----- The hut at Panchavati -----
const Hut: React.FC<{tex: {thatch: THREE.Texture; mud: THREE.Texture; bark: THREE.Texture}; f: number; mode: Mode}> = ({tex, f, mode}) => (
  <group position={HUT}>
    <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[2.1, 2.2, 1.9, 24]} />
      <meshStandardMaterial map={tex.mud} roughness={1} />
    </mesh>
    <mesh position={[0, 2.75, 0]} castShadow receiveShadow>
      <coneGeometry args={[2.95, 1.9, 24]} />
      <meshStandardMaterial map={tex.thatch} roughness={1} />
    </mesh>
    <mesh position={[0, 3.75, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.1, 0.5, 6]} />
      <meshStandardMaterial map={tex.bark} />
    </mesh>
    {/* the doorway */}
    <mesh position={[0, 0.75, 2.17]}>
      <planeGeometry args={[0.9, 1.5]} />
      <meshStandardMaterial color="#2a1a12" roughness={1} />
    </mesh>
    {/* a low fence of sticks, a wood pile and water pots */}
    {Array.from({length: 22}, (_, i) => {
      const a = -1.1 + (i / 21) * 2.2;
      if (Math.abs(a) < 0.26) return null;
      return (
        <mesh key={i} position={[Math.sin(a) * 6.2, 0.45, Math.cos(a) * 6.2]} rotation={[0, 0, (i % 3) * 0.05 - 0.05]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.9, 6]} />
          <meshStandardMaterial map={tex.bark} />
        </mesh>
      );
    })}
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[-3.1, 0.12 + Math.floor(i / 3) * 0.2, 1.0 + (i % 3) * 0.22]} rotation={[0, 0.2, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 1.3, 7]} />
        <meshStandardMaterial map={tex.bark} />
      </mesh>
    ))}
    {[[2.6, 1.7], [2.95, 1.35]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.26, z]} castShadow>
        <sphereGeometry args={[0.27, 14, 10]} />
        <meshStandardMaterial color="#b8643a" roughness={0.8} />
      </mesh>
    ))}
    {/* the morning fire, with a thread of smoke */}
    {mode === 'day' && (
      <group position={[-1.9, 0, 3.6]}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, 0.08, 0]} rotation={[0, (k * Math.PI) / 3, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
            <meshStandardMaterial map={tex.bark} />
          </mesh>
        ))}
        <Flame pos={[0, 0.05, 0]} size={0.5} f={f} />
        {[0, 1, 2, 3].map((i) => {
          const age = (f * 0.7 + i * 30) % 120;
          return <Glow key={i} pos={[Math.sin(age * 0.05 + i) * 0.3, 0.8 + age * 0.03, 0]} size={0.6 + age * 0.015} color="#b8b0b0" opacity={0.3 * (1 - age / 120)} />;
        })}
      </group>
    )}
  </group>
);

export const JanasthanWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const cam = useCam();
  const mode = modeAt(f);
  const L = LIGHT[mode];
  const tex = useMemo(
    () => ({
      grass: grassTexture('#5d8a3c', [70, 70]),
      earth: earthTexture([24, 24]),
      rock: rockTexture('#8b7f72', [3, 2], 9),
      bark: barkTexture('#5a4636'),
      sand: sandTexture([60, 3]),
      water: rippleTexture([80, 6]),
      cloud: cloudTexture(),
      thatch: thatchTexture(),
      mud: plasterTexture('#c99a6a', 5),
      leaves: [
        foliageTexture('#3f7a33', '#7cb050', '#24501f', 4),
        foliageTexture('#4f8a3a', '#9ac868', '#2c5a24', 8),
        foliageTexture('#56803a', '#a8c070', '#33502a', 12, '#e06a3a'),
      ],
    }),
    [],
  );
  const skies = useMemo(() => ({storm: skyTexture(LIGHT.storm.sky), day: skyTexture(LIGHT.day.sky), gold: skyTexture(LIGHT.gold.sky)}), []);

  // trees: the forest around Panchavati, kept off the plain, the river, the hut and the hill
  const trees = useMemo(() => {
    const r = rng(23);
    const list: {pos: V3; h: number; s: number; t: number; near: boolean}[] = [];
    let n = 0;
    while (list.length < 460 && n < 6000) {
      n++;
      const a = r() * Math.PI * 2;
      const d = 6 + Math.pow(r(), 0.7) * 180;
      const pos: V3 = [Math.cos(a) * d, 0, Math.sin(a) * d];
      if (Math.hypot(pos[0], pos[2]) < 7.5) continue;
      if (pos[2] > 6 && pos[2] < 100 && Math.abs(pos[0]) < 85 - Math.max(0, 40 - pos[2]) * 0.6) continue; // the plain
      if (pos[2] > RIVER_Z - 6 && pos[2] < RIVER_Z + 4.5) continue;
      if (Math.hypot(pos[0] - ROCK[0], pos[2] - ROCK[2]) < 10) continue;
      if (Math.hypot(pos[0] - ROCK[0], pos[2] - ROCK[2]) < HILL_R + 3) continue;
      {
        // the path from the hut to the cave
        const ax = LAK_HUT[0], az = LAK_HUT[2], bx = CAVE_MOUTH[0], bz = CAVE_MOUTH[2];
        const t = Math.max(0, Math.min(1, ((pos[0] - ax) * (bx - ax) + (pos[2] - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2)));
        if (Math.hypot(pos[0] - (ax + (bx - ax) * t), pos[2] - (az + (bz - az) * t)) < 6) continue;
      }
      list.push({pos, h: 3.5 + r() * 3, s: 4.5 + r() * 3.5, t: Math.floor(r() * 3), near: d < 45});
    }
    return list;
  }, []);
  const clouds = useMemo(() => {
    const r = rng(41);
    return Array.from({length: 30}, () => ({pos: [(r() - 0.5) * 340, 24 + r() * 30, (r() - 0.5) * 340 + 30] as V3, s: 18 + r() * 26}));
  }, []);
  const hills = useMemo(() => {
    const r = rng(5);
    return Array.from({length: 20}, (_, i) => {
      const a = (i / 20) * Math.PI * 2 + r() * 0.2;
      const d = 210 + r() * 60;
      return {pos: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, r: 40 + r() * 40, h: 22 + r() * 34};
    });
  }, []);

  const ram = ramAt(f);
  const sita = sitaAt(f);
  const lak = lakshmanAt(f);
  const shurp = shurpanakhaDayAt(f);
  const dus = generalAt('dushana', f);
  const tri = generalAt('trishira', f);
  const kha = kharaPlainAt(f);
  const sun: V3 = [focus[0] + L.sunDir[0] * 500, focus[1] + L.sunDir[1] * 500, focus[2] + L.sunDir[2] * 500];
  const battle = mode === 'storm';
  // Ram aims at whichever side of the picture the army is on
  const right = camRight(cam, RAM_B);
  const toArmy = right[2]; // the army lies toward +z
  const ramFlip = ram.pose === 'shoot' ? toArmy > 0 : false;
  const flash = f >= B.kharaHit && f < B.kharaHit + 10 ? 1 - (f - B.kharaHit) / 10 : 0;
  const ramGlow = f >= B.courageIs ? ramp(f, B.courageIs, B.courageIs + 40) : 0;
  const lightning = battle && (f % 173 < 3 || (f > B.allSides && f % 97 < 2)) ? 1 : 0;

  return (
    <>
      <fog attach="fog" args={[L.fog, L.near, L.far]} />
      <SkyDome tex={skies[mode]} radius={620} center={[cam.x, 0, cam.z]} />
      <Glow pos={sun} size={mode === 'storm' ? 60 : 90} color={L.glow} opacity={mode === 'storm' ? 0.6 : 0.9} />
      <Glow pos={sun} size={20} color="#fff6dc" opacity={mode === 'storm' ? 0.5 : 0.9} />
      <hemisphereLight args={[L.hemiTop, L.hemiBottom, L.hemiI + lightning * 1.4]} />
      <Sun focus={focus} dir={L.sunDir} color={L.sun} intensity={L.sunI} />

      {/* ground: grass, the bare trampled plain, the river with sandy banks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial map={tex.grass} color={L.grass} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 52]} receiveShadow>
        <circleGeometry args={[52, 64]} />
        <meshStandardMaterial map={tex.earth} color={battle ? '#c8b0a0' : '#ffffff'} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, RIVER_Z]} receiveShadow>
        <planeGeometry args={[900, 10]} />
        <meshStandardMaterial map={tex.sand} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, RIVER_Z - 0.6]}>
        <planeGeometry args={[900, 5.5]} />
        <meshStandardMaterial map={tex.water} color={mode === 'day' ? '#5d9cc0' : mode === 'storm' ? '#5a5a7a' : '#d08a5a'} metalness={0.4} roughness={0.25} />
      </mesh>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.pos[0], h.h * 0.3, h.pos[2]]} scale={[h.r, h.h, h.r]}>
          <sphereGeometry args={[1, 16, 10]} />
          <meshStandardMaterial color="#47643a" roughness={1} />
        </mesh>
      ))}

      <Hut tex={tex} f={f} mode={mode} />

      {/* the rocky hill with the cave */}
      <group position={ROCK}>
        <mesh scale={[HILL_R, HILL_H, HILL_R]} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial map={tex.rock} roughness={1} flatShading />
        </mesh>
        {[[-5, 6, -3, 3.4], [3, 6.6, -4, 2.8], [-1, 8.2, -2, 2.4], [6.5, 1.2, 4.5, 1.6], [-7.5, 1.0, 3.5, 1.4], [9.0, 0.6, 1.0, 1.0]].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[i, i * 0.7, 0]} castShadow receiveShadow>
            <dodecahedronGeometry args={[r, 0]} />
            <meshStandardMaterial map={tex.rock} roughness={1} flatShading />
          </mesh>
        ))}
      </group>
      <group position={[CAVE_MOUTH[0], 0, CAVE_MOUTH[2]]} rotation={[0, CAVE_YAW, 0]}>
        <mesh position={[0, 1.2, 0.08]}>
          <circleGeometry args={[1.35, 32, 0, Math.PI]} />
          <meshBasicMaterial color="#120c0a" />
        </mesh>
        <mesh position={[0, 0.6, 0.08]}>
          <planeGeometry args={[2.7, 1.2]} />
          <meshBasicMaterial color="#120c0a" />
        </mesh>
      </group>

      {/* trees */}
      {trees.map((t, i) => (
        <group key={i} position={t.pos}>
          {t.near && (
            <mesh position={[0, t.h / 2, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.3, t.h, 7]} />
              <meshStandardMaterial map={tex.bark} roughness={1} />
            </mesh>
          )}
          <sprite position={[0, t.h + t.s * 0.25, 0]} scale={[t.s, t.s, 1]}>
            <spriteMaterial map={tex.leaves[t.t]} alphaTest={0.5} color={mode === 'storm' ? '#a09aa8' : mode === 'gold' ? '#ffd8b0' : '#f4ffe8'} />
          </sprite>
        </group>
      ))}

      {/* clouds: dark and heavy in the storm */}
      {clouds.map((c, i) => (
        <sprite key={i} position={[c.pos[0] + ((f * (battle ? 0.08 : 0.03) + i * 13) % 60), c.pos[1] - (battle ? 6 : 0), c.pos[2]]} scale={[c.s * 2, c.s, 1]}>
          <spriteMaterial map={tex.cloud} transparent depthWrite={false} opacity={battle ? 0.85 : 0.75} color={battle ? '#5a4a5e' : mode === 'gold' ? '#ffd0a0' : '#ffffff'} />
        </sprite>
      ))}
      {lightning > 0 && <Glow pos={[cam.x - 60, 40, cam.z + 160]} size={160} color="#c8c0ff" opacity={0.5} />}

      {/* something always moves: dust on the storm wind, leaves in the morning, motes in the sunset */}
      <Particles
        count={50}
        color={battle ? '#8a7060' : mode === 'gold' ? '#ffd890' : '#c9a24a'}
        glow={mode === 'gold'}
        shape={mode === 'gold' ? 'dot' : 'leaf'}
        seed={9}
        at={(i, r) => {
          const life = 200;
          const age = (f + r() * life) % life;
          const wind = battle ? 0.09 : 0.03;
          const base: V3 = [focus[0] + (r() - 0.5) * 16, focus[1] + (r() - 0.3) * 6, focus[2] + (r() - 0.5) * 16];
          return {pos: [base[0] + age * wind, base[1] - age * 0.005 + Math.sin(age * 0.1 + i) * 0.3, base[2] + Math.sin(age * 0.05 + i) * 0.5], size: mode === 'gold' ? 0.1 : 0.14, spin: age * 0.15 + i};
        }}
      />
      {/* the army's dust as it charges in */}
      {f >= s53 && f < B.unshaken + 30 &&
        [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
          const a = -1.4 + k * 0.4;
          const d = 32;
          const extra = armyExtra(f);
          return <Glow key={k} pos={[Math.sin(a) * (d + extra), 1.5, RAM_B[2] + Math.cos(a) * (d + extra)]} size={22} color="#b89878" opacity={0.35 * (1 - ramp(f, B.unshaken, B.unshaken + 30))} />;
        })}

      <Army f={f} tint={L.tint} />
      <Arrows f={f} />

      {/* the three generals */}
      {dus.visible && (dus.fallen ? (
        <Flat s={canvasSprite('fallen|dushana', () => drawFallen(() => drawMythic({...CAST.dushana.look, held: undefined}, 'stand', 'sad')))} pos={dus.pos} h={GENERAL_H / 2} aspect={FALLEN_ASPECT} tint={L.tint} maxTilt={1.2} />
      ) : (
        <Flat s={mythicSprite('dushana', CAST.dushana.look, dus.pose, dus.expr)} pos={dus.pos} h={GENERAL_H} tint={L.tint} />
      ))}
      {tri.visible && (tri.fallen ? (
        <Flat s={canvasSprite('fallen|trishira', () => drawFallen(() => drawMythic({...CAST.trishira.look, held: undefined}, 'stand', 'sad')))} pos={tri.pos} h={GENERAL_H / 2} aspect={FALLEN_ASPECT} tint={L.tint} maxTilt={1.2} />
      ) : (
        <Flat s={canvasSprite(`trishira|${tri.expr}`, () => drawTrishira('hold', tri.expr))} pos={tri.pos} h={(GENERAL_H * 1100) / 1024} aspect={TRISHIRA_ASPECT} tint={L.tint} />
      ))}
      {kha.visible && (kha.fallen ? (
        <Flat s={canvasSprite('fallen|khara', () => drawFallen(() => drawMythic({...CAST.khara.look, held: undefined}, 'stand', 'sad')))} pos={kha.pos} h={KHARA_H / 2} aspect={FALLEN_ASPECT} tint={L.tint} maxTilt={1.2} />
      ) : (
        <Flat s={mythicSprite('khara', CAST.khara.look, kha.pose, kha.expr)} pos={kha.pos} h={KHARA_H} tint={L.tint} />
      ))}
      {[[B.dushanaFalls, dus.pos], [B.trishiraFalls, tri.pos], [B.kharaHit + 4, kha.pos]].map(([t, p], i) => (
        <DustBurst key={i} f={f} from={t as number} pos={p as V3} size={2.2} n={10} color="#a08870" />
      ))}
      {flash > 0 && <Glow pos={add(kha.pos, [0, 1.3, 0])} size={7} color="#fff2c0" opacity={flash} />}

      {/* Ram, Sita, Lakshman, Shurpanakha */}
      {ramGlow > 0 && <Glow pos={add(ram.pos, [0, 1.25, -0.2])} size={4.2} color="#ffd98a" opacity={0.55 * ramGlow} />}
      {ram.visible && <Flat s={mythicSprite('ram', CAST.ram.look, ram.pose, ram.expr)} pos={ram.pos} h={RAM_H} tint={L.tint} flip={ramFlip} />}
      {sita.visible && <Flat s={mythicSprite('sita', CAST.sita.look, sita.pose, sita.expr)} pos={sita.pos} h={MAN_H * 0.96} tint={L.tint} />}
      {lak.visible && <Flat s={mythicSprite('lakshman', CAST.lakshman.look, lak.pose, lak.expr)} pos={lak.pos} h={MAN_H} tint={L.tint} />}
      {shurp.visible && <Flat s={mythicSprite('shurpanakha', CAST.shurpanakha.look, shurp.pose, shurp.expr)} pos={shurp.pos} h={MAN_H * 1.02} tint={L.tint} />}
    </>
  );
};
