// Khara's camp at Janasthana, at night: a dais of dark stone with the three generals, tents, banners,
// torches everywhere, and the army packed into the courtyard in front.
import React, {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {Flat, mythicSprite, canvasSprite, placeFlat, standingPlane, useCam, V3} from '../shared/flat';
import {CAST} from '../shared/mythic';
import {drawTrishira, TRISHIRA_ASPECT} from '../shared/epic';
import {Flame, Glow, Particles, SkyDome} from '../shared/fx';
import {earthTexture, rockTexture, skyTexture} from '../shared/nature';
import {rng} from '../shared/toon';
import {ramp} from '../shared/camera';
import {B, DAIS_H, DUSHANA_C, GENERAL_H, KHARA_C, KHARA_H, MAN_H, s, SHURP_C, SOLDIER_H, THRONE, TRISHIRA_C} from './beats';
import {add} from './story';

const TINT = '#e6c8c0';
const LOOKS = [CAST.rakshasaA, CAST.rakshasaB, CAST.rakshasaC];

type Soldier = {pos: V3; v: number; jit: number};
const CROWD: Soldier[] = (() => {
  const r = rng(12);
  const list: Soldier[] = [];
  let n = 0;
  while (list.length < 1500 && n < 12000) {
    n++;
    const x = (r() - 0.5) * 64;
    const z = 6.5 + Math.pow(r(), 0.85) * 70;
    if (Math.abs(x) < 2.2 && z < 30) continue; // Shurpanakha's aisle
    if (Math.abs(x) > 8 + z * 0.9) continue;
    list.push({pos: [x, 0, z], v: Math.floor(r() * 3), jit: r()});
  }
  return list;
})();

const TORCHES: V3[] = (() => {
  const r = rng(3);
  const list: V3[] = [[-3.6, 0, 1.6], [3.6, 0, 1.6], [-2.4, 0, 6], [2.4, 0, 6], [-2.4, 0, 12], [2.4, 0, 12], [-2.4, 0, 18], [2.4, 0, 18]];
  for (let i = 0; i < 40; i++) list.push([(r() - 0.5) * 70, 0, 10 + r() * 70]);
  return list;
})();

const TENTS: {pos: V3; r: number; c: string}[] = (() => {
  const r = rng(8);
  const cols = ['#5a1a2a', '#3a2440', '#6a3a1a', '#2a3a2a'];
  const list: {pos: V3; r: number; c: string}[] = [];
  for (let i = 0; i < 26; i++) {
    const a = Math.PI * 0.5 + (r() - 0.5) * Math.PI * 1.6;
    const d = 12 + r() * 30;
    list.push({pos: [Math.cos(a) * d * 1.3, 0, -Math.sin(a) * d * 0.7 - 2], r: 2 + r() * 1.6, c: cols[i % 4]});
  }
  return list;
})();

const Crowd: React.FC<{f: number}> = ({f}) => {
  const cam = useCam();
  const meshes = useMemo(() => {
    const counts = [0, 0, 0];
    for (const c of CROWD) counts[c.v]++;
    return LOOKS.map((c, v) => {
      const sp = mythicSprite(`rakshasa${v}`, c.look, 'hold', 'roar');
      const m = new THREE.InstancedMesh(standingPlane(SOLDIER_H), sp.mat.clone(), counts[v]);
      m.castShadow = true;
      m.customDepthMaterial = sp.depth;
      m.frustumCulled = false;
      (m.material as THREE.MeshBasicMaterial).color.set(TINT);
      return m;
    });
  }, []);
  // once Khara gives the word, the army turns and marches out (away from the dais)
  const march = Math.max(0, f - B.army) * 0.09;
  const idx = [0, 0, 0];
  for (const c of CROWD) {
    const i = idx[c.v]++;
    const bob = Math.abs(Math.sin(f * (march > 0 ? 0.4 : 0.12) + c.jit * 9)) * (march > 0 ? 0.1 : 0.04);
    placeFlat(meshes[c.v], i, cam, c.pos[0], bob, c.pos[2] + march, true, 0.9);
  }
  for (const m of meshes) m.instanceMatrix.needsUpdate = true;
  return (
    <>
      {meshes.map((m, v) => (
        <primitive key={v} object={m} />
      ))}
    </>
  );
};

const Moon: React.FC<{focus: V3}> = ({focus}) => {
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
        position={[focus[0] + 20, focus[1] + 30, focus[2] - 25]}
        intensity={0.9}
        color="#9aa8ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0006}
      />
    </>
  );
};

export const CampWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const cam = useCam();
  const tex = useMemo(() => ({earth: earthTexture([40, 40]), stone: rockTexture('#4a3e40', [3, 1], 4)}), []);
  const sky = useMemo(() => skyTexture([[0, '#0c0a1e'], [0.35, '#1e1a3e'], [0.47, '#5a2a3a'], [0.5, '#8a3a2a'], [0.52, '#1a1216'], [1, '#0e0a0c']]), []);
  const anger = ramp(f, B.roar, B.roar + 20);
  // Shurpanakha walks up the aisle to the dais, then stands pointing back the way she came
  const u = ramp(f, B.toBrothers, s(39.4));
  const shurpPos: V3 = add([0, 0, 15], [0, Math.abs(Math.sin(f * 0.4)) * 0.06 * (u > 0 && u < 1 ? 1 : 0), -11.4 * u]);
  const shurpPose = f >= B.told ? 'grab' : 'stand';
  const shurpExpr = f >= B.told ? 'stern' : 'sad';
  const kharaExpr = f >= B.roar ? 'roar' : 'stern';
  const genExpr = f >= B.angry ? 'roar' : 'stern';
  void SHURP_C;

  return (
    <>
      <fog attach="fog" args={['#1c1424', 18, 120]} />
      <SkyDome tex={sky} radius={500} center={[cam.x, 0, cam.z]} />
      <Glow pos={[cam.x - 120, 140, cam.z - 300]} size={40} color="#e8e8ff" opacity={0.8} />
      <hemisphereLight args={['#5a5aa0', '#2a1a14', 0.55]} />
      <Moon focus={focus} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial map={tex.earth} color="#9a8070" roughness={1} />
      </mesh>

      {/* the dais and a throne of dark stone, with two red banners */}
      <mesh position={[THRONE[0], DAIS_H / 2, THRONE[2] - 0.6]} castShadow receiveShadow>
        <boxGeometry args={[8.4, DAIS_H, 4.2]} />
        <meshStandardMaterial map={tex.stone} roughness={1} />
      </mesh>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[0, DAIS_H * (k + 0.5) / 3, THRONE[2] + 1.5 + (2 - k) * 0.35]} receiveShadow castShadow>
          <boxGeometry args={[3, DAIS_H / 3, 0.35]} />
          <meshStandardMaterial map={tex.stone} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, DAIS_H + 1.4, -2.1]} castShadow>
        <boxGeometry args={[2.4, 2.8, 0.5]} />
        <meshStandardMaterial color="#3a1420" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, DAIS_H + 2.95, -2.1]} castShadow>
        <coneGeometry args={[0.5, 0.7, 4]} />
        <meshStandardMaterial color="#c8891a" metalness={0.6} roughness={0.35} />
      </mesh>
      {[-3.6, 3.6].map((x, i) => (
        <group key={i} position={[x, 0, -2.4]}>
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 6, 8]} />
            <meshStandardMaterial color="#2a1a14" />
          </mesh>
          <mesh position={[0.55, 4.6, 0]} rotation={[0, Math.sin(f * 0.05 + i) * 0.25, 0]} castShadow>
            <planeGeometry args={[1.1, 2.4]} />
            <meshStandardMaterial color="#8a1a26" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* tents */}
      {TENTS.map((t, i) => (
        <mesh key={i} position={[t.pos[0], t.r * 0.7, t.pos[2]]} castShadow receiveShadow>
          <coneGeometry args={[t.r, t.r * 1.4, 6]} />
          <meshStandardMaterial color={t.c} roughness={0.9} flatShading />
        </mesh>
      ))}

      {/* torches: a pole with a flame; the nearest ones light the scene */}
      {TORCHES.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.07, 2.2, 6]} />
            <meshStandardMaterial color="#3a2a1a" />
          </mesh>
          <Flame pos={[0, 2.15, 0]} size={0.7 * (1 + anger * 0.5)} f={f} seed={i * 1.3} />
        </group>
      ))}
      {TORCHES.slice(0, 8).map((p, i) => (
        <pointLight key={i} position={[p[0], 2.6, p[2]]} color="#ff8a3a" intensity={(9 + 2 * Math.sin(f * 0.7 + i)) * (1 + anger * 0.6)} distance={12} decay={2} />
      ))}
      <Particles
        count={40}
        color="#ffb347"
        glow
        shape="dot"
        seed={44}
        at={(i, r) => {
          const life = 80;
          const age = (f + r() * life) % life;
          const t = TORCHES[i % 8];
          return {pos: [t[0] + Math.sin(age * 0.1 + i) * 0.4, 2.6 + age * 0.05, t[2] + (r() - 0.5) * 0.6], size: 0.1 * (1 - age / life)};
        }}
      />

      <Crowd f={f} />

      {/* the three on the dais */}
      <Flat s={mythicSprite('khara', CAST.khara.look, 'hold', kharaExpr)} pos={KHARA_C} h={KHARA_H} tint={TINT} />
      <Flat s={mythicSprite('dushana', CAST.dushana.look, 'hold', genExpr)} pos={DUSHANA_C} h={GENERAL_H} tint={TINT} />
      <Flat s={canvasSprite(`trishira|${genExpr}`, () => drawTrishira('hold', genExpr))} pos={TRISHIRA_C} h={(GENERAL_H * 1100) / 1024} aspect={TRISHIRA_ASPECT} tint={TINT} />
      {f >= B.toBrothers && f < B.army && (
        <Flat s={mythicSprite('shurpanakha', CAST.shurpanakha.look, shurpPose, shurpExpr)} pos={shurpPos} h={MAN_H * 1.02} tint={TINT} flip />
      )}
      {anger > 0 && <Glow pos={add(KHARA_C, [0, 1.6, -0.4])} size={5 * anger} color="#ff5a2a" opacity={0.35 * anger} />}
    </>
  );
};
