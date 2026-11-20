// Two short places outside the forest:
//  - SeaWorld: the memory of Hanuman's leap across the ocean (shown in a warm sepia), when Bhima speaks of it;
//  - FieldWorld: Kurukshetra at dawn, Arjuna's chariot with Hanuman on its flag (the promise, and "Kapidhvaja").
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, mythicSprite, useCam, V3} from '../shared/flat';
import {CAST, drawMythic} from '../shared/mythic';
import {DustBurst, Glow, Particles, SkyDome} from '../shared/fx';
import {cloudTexture, rippleTexture, sandTexture, skyTexture} from '../shared/nature';
import {INK, rng, toTexture} from '../shared/toon';
import {KeyLight} from '../shared/kit';
import {ramp} from '../shared/camera';
import {B, FLAG_TOP, HANUMAN_H, MAN_H} from './beats';

// ----- The leap across the ocean -----
export const LEAP_FROM: V3 = [-26, 9, 6];
export const LEAP_TO: V3 = [26, 12, -12];
export const leapAt = (f: number): V3 => {
  const u = Math.min(1, Math.max(0, (f - B.leap) / (B.smiled - B.leap)));
  return [LEAP_FROM[0] + (LEAP_TO[0] - LEAP_FROM[0]) * u, LEAP_FROM[1] + (LEAP_TO[1] - LEAP_FROM[1]) * u + Math.sin(Math.PI * u) * 5, LEAP_FROM[2] + (LEAP_TO[2] - LEAP_FROM[2]) * u];
};

export const SeaWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const cam = useCam();
  const tex = useMemo(
    () => ({
      sky: skyTexture([[0, '#3a3a8a'], [0.3, '#c46a7a'], [0.45, '#ffb070'], [0.5, '#ffe0a0'], [0.52, '#2a5a7a'], [1, '#10304a']]),
      water: rippleTexture([60, 60]),
      cloud: cloudTexture(),
    }),
    [],
  );
  const clouds = useMemo(() => {
    const r = rng(19);
    return Array.from({length: 18}, () => ({pos: [(r() - 0.5) * 260, 18 + r() * 26, -40 - r() * 160] as V3, s: 16 + r() * 22}));
  }, []);
  const h = leapAt(f);
  return (
    <>
      <fog attach="fog" args={['#e8b088', 60, 320]} />
      <SkyDome tex={tex.sky} radius={600} center={[cam.x, 0, cam.z]} />
      <Glow pos={[60, 40, -400]} size={110} color="#ffc070" opacity={0.9} />
      <hemisphereLight args={['#ffd8b0', '#1a3a5a', 1.0]} />
      <KeyLight focus={focus} dir={[10, 20, -30]} color="#ffc890" intensity={2.4} size={20} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial color="#3a7aa0" map={tex.water} metalness={0.35} roughness={0.3} />
      </mesh>
      {/* the far shore of Lanka */}
      <mesh position={[60, -4, -160]} scale={[60, 22, 26]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color="#3a4a3a" roughness={1} />
      </mesh>
      <Glow pos={[60, 16, -150]} size={30} color="#ffd070" opacity={0.4} />
      {clouds.map((c, i) => (
        <sprite key={i} position={[c.pos[0] + f * 0.05, c.pos[1], c.pos[2]]} scale={[c.s * 2, c.s, 1]}>
          <spriteMaterial map={tex.cloud} transparent depthWrite={false} opacity={0.8} color="#ffd8b0" />
        </sprite>
      ))}
      <Flat s={mythicSprite('hanuman', CAST.hanuman.look, 'fly', 'happy')} pos={h} h={HANUMAN_H * 1.4} roll={-1.15} airborne maxTilt={1.2} tint="#fff0dc" />
      <Glow pos={[h[0], h[1] + 1, h[2]]} size={6} color="#ffd98a" opacity={0.5} />
      <Particles
        count={40}
        color="#fff0c0"
        glow
        shape="dot"
        seed={3}
        at={(i, r) => {
          const lag = r() * 40;
          const p = leapAt(f - lag);
          return {pos: [p[0] + (r() - 0.5), p[1] + 1 + (r() - 0.5), p[2]], size: 0.35 * (1 - lag / 40)};
        }}
      />
    </>
  );
};

// ----- Kurukshetra -----
const flagTexture = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 300;
  const g = c.getContext('2d')!;
  g.beginPath();
  g.moveTo(4, 4);
  g.lineTo(508, 40);
  g.lineTo(440, 150);
  g.lineTo(508, 260);
  g.lineTo(4, 296);
  g.closePath();
  g.fillStyle = INK;
  g.fill();
  g.save();
  g.translate(10, 10);
  g.scale(0.96, 0.93);
  g.beginPath();
  g.moveTo(4, 4);
  g.lineTo(508, 40);
  g.lineTo(440, 150);
  g.lineTo(508, 260);
  g.lineTo(4, 296);
  g.closePath();
  g.fillStyle = '#f08a24';
  g.fill();
  g.restore();
  g.fillStyle = '#ffd34d';
  g.fillRect(10, 262, 420, 14);
  // the vanara on the banner
  const fig = drawMythic(CAST.hanuman.look, 'fly', 'happy');
  g.drawImage(fig, 70, 6, 150, 300);
  return toTexture(c);
};

const Flag: React.FC<{f: number; tex: THREE.Texture}> = ({f, tex}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(2.6, 1.5, 24, 6), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3] + 1.3; // 0 at the pole
    const y = base[i * 3 + 1];
    pos.setXYZ(i, base[i * 3] + 1.3, y - x * x * 0.03, Math.sin(x * 2.2 - f * 0.28) * 0.18 * x);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} position={[FLAG_TOP[0] + 0.06, FLAG_TOP[1] - 0.9, FLAG_TOP[2]]} castShadow>
      <meshBasicMaterial map={tex} side={THREE.DoubleSide} alphaTest={0.5} toneMapped={false} />
    </mesh>
  );
};

export const FieldWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const cam = useCam();
  const tex = useMemo(
    () => ({
      sky: skyTexture([[0, '#2a3a7a'], [0.32, '#a86a8a'], [0.45, '#ffb67a'], [0.5, '#ffe2a8'], [0.52, '#b08a5a'], [1, '#5a4430']]),
      sand: sandTexture([60, 60]),
      cloud: cloudTexture(),
      flag: flagTexture(),
    }),
    [],
  );
  // two armies facing each other across the plain, as rows of spears and banners
  const armies = useMemo(() => {
    const r = rng(88);
    const list: {pos: V3; h: number; banner: boolean; c: string}[] = [];
    for (const zc of [-48, 40])
      for (let i = 0; i < 260; i++) list.push({pos: [(r() - 0.5) * 160, 0, zc + (r() - 0.5) * 14], h: 2.4 + r() * 1.6, banner: r() < 0.18, c: ['#d7263d', '#f6c63c', '#2e6db4', '#f08a24'][Math.floor(r() * 4)]});
    return list;
  }, []);
  const roar = f >= B.thunder && f < B.thunder + 45 ? (f - B.thunder) / 45 : -1;
  return (
    <>
      <fog attach="fog" args={['#e6b98e', 30, 200]} />
      <SkyDome tex={tex.sky} radius={600} center={[cam.x, 0, cam.z]} />
      <Glow pos={[-200, 30, -400]} size={110} color="#ffc070" opacity={0.85} />
      <Glow pos={[-200, 30, -400]} size={24} color="#fff4d0" opacity={0.9} />
      <hemisphereLight args={['#ffd8b8', '#6a4a30', 1.0]} />
      <KeyLight focus={focus} dir={[-24, 14, -30]} color="#ffc890" intensity={2.6} size={12} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial map={tex.sand} color="#d8b890" roughness={1} />
      </mesh>
      {armies.map((a, i) => (
        <group key={i} position={a.pos}>
          <mesh position={[0, a.h / 2, 0]}>
            <cylinderGeometry args={[0.03, 0.03, a.h, 4]} />
            <meshStandardMaterial color="#4a3a2a" />
          </mesh>
          <mesh position={[0, a.h, 0]}>
            <coneGeometry args={[0.08, 0.3, 4]} />
            <meshStandardMaterial color="#c8c8d0" metalness={0.6} roughness={0.4} />
          </mesh>
          {a.banner && (
            <mesh position={[0.3, a.h - 0.4, 0]}>
              <planeGeometry args={[0.6, 0.4]} />
              <meshStandardMaterial color={a.c} side={THREE.DoubleSide} />
            </mesh>
          )}
          <mesh position={[0, 0.7, 0]}>
            <capsuleGeometry args={[0.28, 0.7, 4, 8]} />
            <meshStandardMaterial color="#5a4a40" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Arjuna's chariot */}
      <group>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 0.3, 2.8]} />
          <meshStandardMaterial color="#e9b23c" metalness={0.6} roughness={0.35} emissive="#5a3a08" emissiveIntensity={0.2} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * 1.1, 1.4, 0]} castShadow>
            <boxGeometry args={[0.1, 0.55, 2.4]} />
            <meshStandardMaterial color="#e9b23c" metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 1.45, -1.35]} castShadow>
          <boxGeometry args={[2.3, 0.6, 0.12]} />
          <meshStandardMaterial color="#e9b23c" metalness={0.6} roughness={0.35} />
        </mesh>
        {[-1, 1].map((sx) => (
          <group key={sx} position={[sx * 1.35, 0.85, 0.4]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <torusGeometry args={[0.85, 0.09, 10, 32]} />
              <meshStandardMaterial color="#8a5a2a" roughness={0.7} />
            </mesh>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} rotation={[0, (k * Math.PI) / 4, 0]}>
                <boxGeometry args={[1.65, 0.06, 0.06]} />
                <meshStandardMaterial color="#8a5a2a" />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0, 0.9, -2.8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 3, 8]} />
          <meshStandardMaterial color="#e9b23c" metalness={0.6} />
        </mesh>
        {/* the flagstaff at the back of the car */}
        <mesh position={[FLAG_TOP[0], (FLAG_TOP[1] + 1.1) / 2, FLAG_TOP[2]]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, FLAG_TOP[1] - 1.1, 10]} />
          <meshStandardMaterial color="#c9a050" roughness={0.5} metalness={0.3} />
        </mesh>
        <Flag f={f} tex={tex.flag} />
      </group>
      {/* Krishna at the reins */}
      <Flat s={mythicSprite('krishna', CAST.krishna.look, 'stand', 'calm')} pos={[0, 1.15, -0.9]} h={MAN_H} tint="#fff0e0" />
      {/* Hanuman on top of the flagstaff */}
      {f >= B.flag && (
        <>
          <Flat
            s={mythicSprite('hanuman', CAST.hanuman.look, 'hold', roar >= 0 && roar < 0.8 ? 'roar' : 'happy')}
            pos={[FLAG_TOP[0], FLAG_TOP[1] + 0.02, FLAG_TOP[2]]}
            h={1.25}
            scale={ramp(f, B.flag, B.flag + 14)}
            tint="#fff0e0"
            maxTilt={0.9}
          />
          <Glow pos={[FLAG_TOP[0], FLAG_TOP[1] + 0.7, FLAG_TOP[2]]} size={3} color="#ffd98a" opacity={0.45} />
        </>
      )}
      {roar >= 0 && (
        <>
          <mesh position={[FLAG_TOP[0], FLAG_TOP[1] + 0.8, FLAG_TOP[2]]} rotation={[0, Math.atan2(cam.x - FLAG_TOP[0], cam.z - FLAG_TOP[2]), 0]}>
            <ringGeometry args={[0.5 + roar * 14, 0.7 + roar * 14.6, 48]} />
            <meshBasicMaterial color="#fff2c8" transparent opacity={0.7 * (1 - roar)} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          {[-30, -10, 10, 30].map((x, k) => (
            <DustBurst key={k} f={f} from={B.thunder + 8 + k * 3} pos={[x, 0, -46]} size={6} color="#d8b08a" />
          ))}
        </>
      )}
      <Particles
        count={50}
        color="#e8c89a"
        glow
        shape="dot"
        seed={5}
        at={(i, r) => {
          const life = 200;
          const age = (f + r() * life) % life;
          return {pos: [focus[0] + (r() - 0.5) * 30 + age * 0.05, 0.3 + r() * 4, focus[2] + (r() - 0.5) * 30], size: 0.5 * Math.sin(Math.PI * age / life)};
        }}
      />
    </>
  );
};
