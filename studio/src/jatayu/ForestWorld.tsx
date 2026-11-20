// The forest south of Panchavati: a sea of trees, Jatayu's tall rock with a dead tree, a clearing, a river bank.
// Three lights: a golden afternoon (the fight), dusk (Ram arrives, the rites) and a deep sunset gold (the ending).
import React, {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {Flat, canvasSprite, mythicSprite, useCam, V3} from '../shared/flat';
import {CAST} from '../shared/mythic';
import {drawDonkey, drawJatayu, drawJatayuLying, drawRavana, DONKEY_ASPECT, JATAYU_LYING_ASPECT, RAVANA_ASPECT} from '../shared/epic';
import {DustBurst, Flame, Glow, Particles, SkyDome} from '../shared/fx';
import {barkTexture, cloudTexture, earthTexture, foliageTexture, grassTexture, rippleTexture, rockTexture, sandTexture, skyTexture} from '../shared/nature';
import {rng} from '../shared/toon';
import {ramp} from '../shared/camera';
import {B, CLEAR, CLIFF, CLIFF_H, DONKEY_H, J_H, MAN_H, PERCH, PYRE, RAVANA_PLANE_H, s} from './beats';
import {CH_DIR, CH_YAW, chariotAt, jatayuAt, lakshmanAt, Mode, modeAt, ramAt, ravanaAt, sitaAt} from './story';

const LIGHT: Record<Mode, {sky: [number, string][]; fog: string; near: number; far: number; sun: string; sunI: number; hemiTop: string; hemiBottom: string; hemiI: number; tint: string; sunDir: V3; glow: string}> = {
  day: {
    sky: [[0, '#4f86cf'], [0.36, '#a9cbe8'], [0.48, '#ffe0b4'], [0.5, '#f4c78e'], [0.52, '#7d9460'], [1, '#33461f']],
    fog: '#d7d6c2', near: 50, far: 300, sun: '#ffd9a0', sunI: 2.9, hemiTop: '#d8e6ff', hemiBottom: '#5a6a34', hemiI: 1.0, tint: '#fff6ea',
    sunDir: [-0.7, 0.42, 0.58], glow: '#ffd38a',
  },
  dusk: {
    sky: [[0, '#25204f'], [0.3, '#5b3f7a'], [0.44, '#d0647a'], [0.49, '#ffae6a'], [0.51, '#3e3a3a'], [1, '#1c1e18']],
    fog: '#6a4f6e', near: 30, far: 200, sun: '#ff9a70', sunI: 1.25, hemiTop: '#7f78c8', hemiBottom: '#2a2420', hemiI: 0.75, tint: '#efd2dc',
    sunDir: [-0.85, 0.12, 0.5], glow: '#ff8a5a',
  },
  gold: {
    sky: [[0, '#5a3c7a'], [0.3, '#c45c6a'], [0.44, '#ff9a4a'], [0.49, '#ffd27a'], [0.51, '#6a4a2a'], [1, '#2a2014']],
    fog: '#e09a6a', near: 40, far: 260, sun: '#ffb46a', sunI: 2.6, hemiTop: '#ffc8a0', hemiBottom: '#4a3020', hemiI: 0.9, tint: '#ffe4c4',
    sunDir: [-0.8, 0.2, -0.56], glow: '#ffb050',
  },
};

// A directional sun that follows the action, so the shadow box stays small and sharp.
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

// The billboard's right-hand direction as the camera sees a figure standing at p.
const camRight = (cam: THREE.Vector3, p: V3): V3 => {
  const yaw = Math.atan2(cam.x - p[0], cam.z - p[2]);
  return [Math.cos(yaw), 0, -Math.sin(yaw)];
};
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

// ----- The golden chariot with its donkey team -----
const GOLD = {color: '#e9b23c', metalness: 0.65, roughness: 0.32, emissive: '#5a3a08', emissiveIntensity: 0.25};

const Chariot: React.FC<{f: number; tint: string}> = ({f, tint}) => {
  const cam = useCam();
  const c = chariotAt(f);
  const b = c.broken;
  const fly = b > 0 && !c.grounded ? b : c.grounded ? 1 : 0;
  // the canopy and its three bamboo poles are torn away; one wheel comes off
  const canopyOff: V3 = c.grounded ? [2.6, -2.4, 1.6] : [fly * 2.5, fly * 3.0, fly * 1.5];
  const wheelOff: V3 = [fly * 1.6, -fly * 0.2, fly * 0.6];
  const gallop = Math.floor(f / 4) % 2 as 0 | 1;
  const donkeyS = [canvasSprite('donkey|0', () => drawDonkey(0)), canvasSprite('donkey|1', () => drawDonkey(1))];
  const yaw = CH_YAW;
  const local = (x: number, y: number, z: number): V3 => [
    c.pos[0] + x * Math.cos(yaw) + z * Math.sin(yaw),
    c.pos[1] + y,
    c.pos[2] - x * Math.sin(yaw) + z * Math.cos(yaw),
  ];
  return (
    <>
      <group position={c.pos} rotation={[0, yaw, c.tilt, 'YXZ']}>
        {/* floor and sides */}
        <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 0.28, 2.7]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * 1.1, 0.5, 0.1]} castShadow>
            <boxGeometry args={[0.1, 0.5, 2.3]} />
            <meshStandardMaterial {...GOLD} />
          </mesh>
        ))}
        {/* the curved front panel with a red stone */}
        <mesh position={[0, 0.5, -1.3]} castShadow>
          <boxGeometry args={[2.3, 0.45, 0.12]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
        <mesh position={[0, 0.55, -1.38]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial color="#d7263d" emissive="#ff2a3a" emissiveIntensity={0.8} />
        </mesh>
        {/* wheels */}
        {[-1, 1].map((sx) => (
          <group key={sx} position={sx > 0 ? (wheelOff.map((v, i) => [1.28, 0.55, 0.55][i] + v) as V3) : [-1.28, 0.55, 0.55]} rotation={[f * 0.08 * (c.grounded ? 0 : 1), 0, Math.PI / 2]}>
            <mesh castShadow>
              <torusGeometry args={[0.72, 0.08, 10, 32]} />
              <meshStandardMaterial {...GOLD} />
            </mesh>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} rotation={[0, (k * Math.PI) / 4, 0]}>
                <boxGeometry args={[1.4, 0.05, 0.05]} />
                <meshStandardMaterial {...GOLD} />
              </mesh>
            ))}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.14, 0.14, 0.2, 12]} />
              <meshStandardMaterial color="#d7263d" />
            </mesh>
          </group>
        ))}
        {/* the shaft to the team */}
        <mesh position={[0, 0.45, -2.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.6, 8]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
        {/* canopy on three bamboo poles, with pennants */}
        <group position={canopyOff} rotation={[fly * 1.2, fly * 0.6, fly * 0.9]}>
          {[-0.9, 0, 0.9].map((x, i) => (
            <group key={i}>
              <mesh position={[x, 1.6, 1.05]} castShadow>
                <cylinderGeometry args={[0.05, 0.06, 2.9, 8]} />
                <meshStandardMaterial color="#c9a050" roughness={0.6} />
              </mesh>
              <mesh position={[x + 0.22, 3.05, 1.05]} rotation={[0, 0, Math.sin(f * 0.25 + i) * 0.25]}>
                <planeGeometry args={[0.45, 0.24]} />
                <meshStandardMaterial color={i === 1 ? '#ffd23f' : '#d7263d'} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 2.95, 0.35]} castShadow>
            <coneGeometry args={[1.55, 0.55, 28, 1, true]} />
            <meshStandardMaterial color="#f6f1e0" side={THREE.DoubleSide} emissive="#fff4d0" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 2.7, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.55, 0.05, 8, 40]} />
            <meshStandardMaterial {...GOLD} />
          </mesh>
        </group>
      </group>
      {/* the magic that carries it: a golden haze under the floor */}
      {!c.grounded && <Glow pos={add(c.pos, [0, -0.2, 0])} size={4.5} color="#ffcf6a" opacity={0.35 * (1 - b)} />}
      {/* the donkeys gallop on the air */}
      {c.donkeys &&
        [-0.65, 0.65].map((x, i) => {
          const p = local(x, 0.05 + Math.abs(Math.sin(f * 0.4 + i)) * 0.08, -4.0 - i * 0.15);
          const r = camRight(cam, p);
          const facingRight = r[0] * CH_DIR[0] + r[2] * CH_DIR[2] > 0;
          return <Flat key={i} s={donkeyS[(gallop + i) % 2]} pos={p} h={DONKEY_H} aspect={DONKEY_ASPECT} flip={!facingRight} tint={tint} airborne />;
        })}
      {f >= B.chariotSmash && f < B.chariotSmash + 40 && <DustBurst f={f} from={B.chariotSmash} pos={add(c.pos, [0, 1, 0])} size={2.4} color="#ffe0a0" n={12} />}
      {f >= B.crash && <DustBurst f={f} from={B.crash} pos={c.pos} size={3} n={14} />}
    </>
  );
};

// Ravana's bow, snapped in two, tumbling away.
const BrokenBow: React.FC<{f: number; at: V3}> = ({f, at}) => {
  const d = f - B.bowSnap;
  if (d < 0 || d > 50) return null;
  return (
    <>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[at[0] + sx * d * 0.03, at[1] + d * 0.02 - d * d * 0.0025, at[2] + d * 0.01]} rotation={[d * 0.15 * sx, d * 0.1, d * 0.2 * sx]}>
          <torusGeometry args={[0.6, 0.05, 6, 16, Math.PI * 0.45]} />
          <meshStandardMaterial color="#b8743a" />
        </mesh>
      ))}
      {d < 10 && <Glow pos={at} size={1.6} color="#fff2c0" opacity={1 - d / 10} />}
    </>
  );
};

export const ForestWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const cam = useCam();
  const mode = modeAt(f);
  const L = LIGHT[mode];
  const tex = useMemo(
    () => ({
      grass: grassTexture('#4f7f36', [60, 60]),
      earth: earthTexture([6, 6]),
      rock: rockTexture('#8b7f72', [2, 4], 9),
      bark: barkTexture('#5a4636'),
      sand: sandTexture([30, 4]),
      water: rippleTexture([6, 80]),
      cloud: cloudTexture(),
      leaves: [
        foliageTexture('#3f7a33', '#7cb050', '#24501f', 4),
        foliageTexture('#4f8a3a', '#9ac868', '#2c5a24', 8),
        foliageTexture('#56803a', '#a8c070', '#33502a', 12, '#e06a3a'),
      ],
    }),
    [],
  );
  const skies = useMemo(() => ({day: skyTexture(LIGHT.day.sky), dusk: skyTexture(LIGHT.dusk.sky), gold: skyTexture(LIGHT.gold.sky)}), []);

  // trees: a dense forest, kept clear of the rock, the clearing, the river and the pyre
  const trees = useMemo(() => {
    const r = rng(23);
    const list: {pos: V3; h: number; s: number; t: number; near: boolean}[] = [];
    let n = 0;
    while (list.length < 420 && n < 4000) {
      n++;
      const a = r() * Math.PI * 2;
      const d = 5 + Math.pow(r(), 0.7) * 170;
      const pos: V3 = [Math.cos(a) * d + 4, 0, Math.sin(a) * d - 6];
      if (Math.hypot(pos[0] - CLEAR[0], pos[2] - CLEAR[2]) < 8) continue;
      if (Math.hypot(pos[0] - CLIFF[0], pos[2] - CLIFF[2]) < 4.5) continue;
      if (pos[0] > -23 && pos[0] < -9.5) continue; // river and its banks
      if (Math.hypot(pos[0] - PYRE[0], pos[2] - PYRE[2]) < 6) continue;
      list.push({pos, h: 3.5 + r() * 3, s: 4.5 + r() * 3.5, t: Math.floor(r() * 3), near: d < 40});
    }
    return list;
  }, []);
  const clouds = useMemo(() => {
    const r = rng(41);
    return Array.from({length: 26}, () => ({pos: [(r() - 0.5) * 320, 26 + r() * 30, (r() - 0.5) * 320 - 40] as V3, s: 18 + r() * 26}));
  }, []);
  const hills = useMemo(() => {
    const r = rng(5);
    return Array.from({length: 18}, (_, i) => {
      const a = (i / 18) * Math.PI * 2 + r() * 0.2;
      const d = 200 + r() * 60;
      return {pos: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, r: 40 + r() * 40, h: 22 + r() * 30};
    });
  }, []);

  // the figures
  const rav = ravanaAt(f);
  const sita = sitaAt(f);
  const jat = jatayuAt(f);
  const ram = ramAt(f);
  const lak = lakshmanAt(f);
  const darken = mode === 'gold' ? ramp(f, B.realValour, B.realValour + 60) * (f < B.stand ? 1 : 0) : 0;
  const ravTint = darken > 0 ? new THREE.Color(L.tint).lerp(new THREE.Color('#5a4058'), darken).getStyle() : L.tint;
  const ravS = canvasSprite(`ravana|${rav.pose}|${rav.expr}|${rav.held}`, () => drawRavana(rav.pose, rav.expr, rav.held));
  const jatS = canvasSprite(`jatayu|${jat.pose}|${jat.expr}`, () => drawJatayu(jat.pose, jat.expr));
  const lying = jat.pose === 'wounded' && jat.roll >= 1.35 && f >= B.landed;
  const right = camRight(cam, rav.pos);
  const sitaPos: V3 = f < B.crash && f < B.later ? add(add(rav.pos, right, -1.05), [0, 0, 0]) : sita.pos;
  const sun: V3 = [focus[0] + L.sunDir[0] * 500, focus[1] + L.sunDir[1] * 500, focus[2] + L.sunDir[2] * 500];

  // the sword stroke and the feathers
  const swoosh = f >= B.cut - 2 && f < B.cut + 8 ? 1 - Math.abs(f - B.cut - 2) / 8 : 0;
  const pyreFire = ramp(f, B.pyre, B.pyre + 45);

  return (
    <>
      <fog attach="fog" args={[L.fog, L.near, L.far]} />
      <SkyDome tex={skies[mode]} radius={620} center={[cam.x, 0, cam.z]} />
      <Glow pos={sun} size={mode === 'dusk' ? 70 : 90} color={L.glow} opacity={0.9} />
      <Glow pos={sun} size={22} color="#fff6dc" opacity={0.9} />
      <hemisphereLight args={[L.hemiTop, L.hemiBottom, L.hemiI]} />
      <Sun focus={focus} dir={L.sunDir} color={L.sun} intensity={L.sunI} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial map={tex.grass} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CLEAR[0], 0.01, CLEAR[2]]} receiveShadow>
        <circleGeometry args={[7.5, 48]} />
        <meshStandardMaterial map={tex.earth} roughness={1} />
      </mesh>
      {/* the river with sandy banks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, 0.015, -20]} receiveShadow>
        <planeGeometry args={[13, 900]} />
        <meshStandardMaterial map={tex.sand} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-17.5, 0.03, -20]}>
        <planeGeometry args={[7, 900]} />
        <meshStandardMaterial map={tex.water} color={mode === 'day' ? '#5d9cc0' : mode === 'dusk' ? '#6a5a8a' : '#d08a5a'} metalness={0.4} roughness={0.25} />
      </mesh>
      {/* far hills */}
      {hills.map((h, i) => (
        <mesh key={i} position={[h.pos[0], h.h * 0.3, h.pos[2]]} scale={[h.r, h.h, h.r]}>
          <sphereGeometry args={[1, 16, 10]} />
          <meshStandardMaterial color="#47643a" roughness={1} />
        </mesh>
      ))}

      {/* Jatayu's rock: stacked boulders, with a dead tree on top */}
      <group position={CLIFF}>
        {[
          [0, 1.6, 0, 3.2, 3.4],
          [0.3, 4.6, 0.2, 2.7, 3.2],
          [-0.2, 7.4, -0.1, 2.3, 3.0],
          [0.2, 10.1, 0.15, 1.9, 2.6],
        ].map(([x, y, z, r, h], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0, i * 0.9, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[r * 0.85, r, h, 9, 2]} />
            <meshStandardMaterial map={tex.rock} roughness={1} flatShading />
          </mesh>
        ))}
        <mesh position={[0.2, CLIFF_H - 0.35, 0.15]} castShadow receiveShadow>
          <cylinderGeometry args={[1.75, 1.7, 0.7, 10]} />
          <meshStandardMaterial map={tex.rock} roughness={1} flatShading />
        </mesh>
        <group position={[-0.7, CLIFF_H, -0.5]}>
          <mesh position={[0, 1.4, 0]} rotation={[0, 0, 0.12]} castShadow>
            <cylinderGeometry args={[0.1, 0.2, 2.8, 7]} />
            <meshStandardMaterial map={tex.bark} />
          </mesh>
          {[[0.5, 2.2, 0.9], [-0.55, 2.0, -0.8], [0.3, 2.7, -0.5]].map(([x, y, a], i) => (
            <mesh key={i} position={[x * 0.9, y, 0]} rotation={[0, 0, a]} castShadow>
              <cylinderGeometry args={[0.04, 0.08, 1.4, 6]} />
              <meshStandardMaterial map={tex.bark} />
            </mesh>
          ))}
        </group>
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
            <spriteMaterial map={tex.leaves[t.t]} alphaTest={0.5} color={mode === 'dusk' ? '#9a8aa8' : mode === 'gold' ? '#ffd8b0' : '#f4ffe8'} />
          </sprite>
        </group>
      ))}

      {/* clouds drifting */}
      {clouds.map((c, i) => (
        <sprite key={i} position={[c.pos[0] + ((f * 0.03 + i * 13) % 60), c.pos[1], c.pos[2]]} scale={[c.s * 2, c.s, 1]}>
          <spriteMaterial map={tex.cloud} transparent depthWrite={false} opacity={mode === 'dusk' ? 0.45 : 0.8} color={mode === 'dusk' ? '#e8a0b0' : mode === 'gold' ? '#ffd0a0' : '#ffffff'} />
        </sprite>
      ))}

      {/* leaves on the wind */}
      <Particles
        count={40}
        color={mode === 'dusk' ? '#8a7a5a' : '#c9a24a'}
        seed={9}
        at={(i, r) => {
          const life = 220;
          const age = (f + r() * life) % life;
          const base: V3 = [focus[0] + (r() - 0.5) * 14, focus[1] + (r() - 0.3) * 6, focus[2] + (r() - 0.5) * 14];
          return {pos: [base[0] + age * 0.04, base[1] - age * 0.01 + Math.sin(age * 0.1 + i) * 0.3, base[2] + Math.sin(age * 0.05 + i) * 0.5], size: 0.14, spin: age * 0.15 + i};
        }}
      />

      {/* the chariot (the recall at the end shows it unbroken) */}
      {(f < B.later || (f >= B.feared && f < B.stand)) && <Chariot f={f} tint={L.tint} />}
      {f < B.later && <BrokenBow f={f} at={add(add(rav.pos, right, 0.5), [0, 1.3, 0])} />}

      {/* Ravana and Sita */}
      {rav.visible && <Flat s={ravS} pos={rav.pos} h={RAVANA_PLANE_H} aspect={RAVANA_ASPECT} tint={ravTint} airborne={rav.pos[1] > 1} maxTilt={0.35} />}
      {sita.visible && <Flat s={mythicSprite('sita', CAST.sita.look, sita.pose, sita.expr)} pos={sitaPos} h={MAN_H} tint={L.tint} airborne={sitaPos[1] > 1} maxTilt={0.35} bob={sita.pose === 'fly' ? Math.abs(Math.sin(f * 0.25)) * 0.04 : 0} />}

      {/* Jatayu */}
      {lying ? (
        <Flat s={canvasSprite('jatayu|lying', () => drawJatayuLying('weak'))} pos={jat.pos} h={J_H} aspect={JATAYU_LYING_ASPECT} tint={L.tint} maxTilt={0.5} squash={1 + Math.sin(f * 0.12) * 0.012} />
      ) : (
        <Flat s={jatS} pos={jat.pos} h={J_H} aspect={1} tint={L.tint} roll={jat.roll} airborne={jat.airborne} maxTilt={jat.airborne ? 0.9 : 0.5} squash={jat.pose === 'fly' || jat.pose === 'attack' ? 1 + Math.sin(f * 0.5) * 0.03 : 1} />
      )}
      {jat.glow > 0 && <Glow pos={add(jat.pos, [0, lying ? 0.6 : J_H * 0.5, 0])} size={J_H * 3.2} color="#ffd98a" opacity={0.6 * jat.glow} />}
      {jat.glow > 0.05 && (
        <Particles
          count={24}
          color="#ffe6a0"
          glow
          shape="dot"
          seed={21}
          at={(i, r) => {
            const life = 70;
            const age = (f + r() * life) % life;
            return {pos: [jat.pos[0] + (r() - 0.5) * 2, jat.pos[1] + 0.3 + age * 0.04, jat.pos[2] + (r() - 0.5) * 1.2], size: 0.18 * (1 - age / life) * jat.glow};
          }}
        />
      )}

      {/* the sword stroke and the feathers */}
      {swoosh > 0 && (
        <group position={add(jat.pos, [0, J_H * 0.55, 0.3])} rotation={[0, Math.atan2(cam.x - jat.pos[0], cam.z - jat.pos[2]), -0.6]}>
          <mesh>
            <torusGeometry args={[1.5, 0.08 * swoosh + 0.01, 6, 30, Math.PI * 0.9]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={swoosh} toneMapped={false} />
          </mesh>
        </group>
      )}
      {f >= B.cut && f < B.cut + 90 && (
        <Particles
          count={36}
          color="#5e4a3a"
          seed={31}
          at={(i, r) => {
            const d = f - B.cut;
            const a = r() * Math.PI * 2;
            const v = 0.05 + r() * 0.08;
            return {pos: [jat.pos[0] + Math.cos(a) * v * d, jat.pos[1] + 1.2 + Math.sin(a) * v * d * 0.6 - d * 0.006, jat.pos[2] + (r() - 0.5) * v * d], size: 0.28, spin: d * 0.12 + i};
          }}
        />
      )}
      {f >= B.landed - 2 && f < B.later && <DustBurst f={f} from={B.landed - 2} pos={jat.pos} size={2.2} n={10} color="#8a6a4a" />}

      {/* Ram and Lakshman */}
      {ram.visible && <Flat s={mythicSprite('ram', CAST.ram.look, ram.pose, ram.expr)} pos={ram.pos} h={MAN_H * 1.04} bob={ram.bob} tint={L.tint} />}
      {lak.visible && <Flat s={mythicSprite('lakshman', CAST.lakshman.look, lak.pose, lak.expr)} pos={lak.pos} h={MAN_H} bob={lak.bob} tint={L.tint} />}

      {/* the pyre on the river bank */}
      <group position={PYRE}>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} position={[0, 0.12 + k * 0.17, 0]} rotation={[0, k % 2 ? Math.PI / 2 : 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.16, 1.0]} />
            <meshStandardMaterial map={tex.bark} roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 0.82, 0]} castShadow>
          <capsuleGeometry args={[0.32, 1.1, 6, 12]} />
          <meshStandardMaterial color="#f4ede0" roughness={0.9} />
        </mesh>
        <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.82, 0]} />
        {pyreFire > 0 && (
          <>
            {[[-0.6, 0.1], [0, -0.1], [0.6, 0.15], [-0.3, 0.3], [0.3, -0.3]].map(([x, z], i) => (
              <Flame key={i} pos={[x, 0.7, z]} size={1.4 * pyreFire} f={f} seed={i * 1.7} />
            ))}
            <pointLight position={[0, 1.8, 0.4]} color="#ff9a3a" intensity={(18 + 3 * Math.sin(f * 0.8)) * pyreFire} distance={14} decay={2} />
            <Particles
              count={30}
              color="#ffb347"
              glow
              shape="dot"
              seed={44}
              at={(i, r) => {
                const life = 60;
                const age = (f + r() * life) % life;
                return {pos: [(r() - 0.5) * 1.6 + Math.sin(age * 0.15 + i) * 0.2, 1 + age * 0.06, (r() - 0.5) * 0.8], size: 0.12 * (1 - age / life) * pyreFire};
              }}
            />
            {[0, 1, 2, 3].map((i) => {
              const age = (f * 0.6 + i * 30) % 120;
              return <Glow key={i} pos={[Math.sin(age * 0.05 + i) * 0.5, 2.5 + age * 0.05, 0]} size={2 + age * 0.04} color="#7a6a70" opacity={0.35 * (1 - age / 120) * pyreFire} />;
            })}
          </>
        )}
      </group>
      {/* the dusk scenes get a warm lamp of their own */}
      {mode === 'dusk' && f < B.pyre && <pointLight position={[JATAYU_LAMP[0], 2.5, JATAYU_LAMP[2]]} color="#ffb070" intensity={6} distance={10} decay={2} />}
    </>
  );
};

const JATAYU_LAMP: V3 = [CLEAR[0] - 1, 0, CLEAR[2] + 1.5];
void s;
void PERCH;
