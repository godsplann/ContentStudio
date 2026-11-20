// Small effects shared by story worlds: glows, a sky dome, flames, swirling leaves, fireflies, dust bursts.
// Everything is driven by the frame number passed in, so renders repeat exactly.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import type {V3} from './flat';
import {glowTexture, rng} from './toon';
import {flameTexture} from './nature';

let glowTex: THREE.Texture | null = null;
export const useGlowTex = () => {
  if (!glowTex) glowTex = glowTexture();
  return glowTex;
};

// Additive glow sprite: lamps, the sun, divine light. Tone mapping off so it blooms bright.
export const Glow: React.FC<{pos: V3; size: number; color: string; opacity?: number; sx?: number}> = ({pos, size, color, opacity = 0.8, sx = 1}) => {
  const tex = useGlowTex();
  if (opacity <= 0.001 || size <= 0) return null;
  return (
    <sprite position={pos} scale={[size * sx, size, 1]} renderOrder={5}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
    </sprite>
  );
};

// A big inside-out sphere carrying a painted gradient. The camera sits inside it.
export const SkyDome: React.FC<{tex: THREE.Texture; radius?: number; center?: V3}> = ({tex, radius = 700, center = [0, 0, 0]}) => (
  <mesh position={center} renderOrder={-10}>
    <sphereGeometry args={[radius, 32, 24]} />
    <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} toneMapped={false} depthWrite={false} />
  </mesh>
);

// A flickering flame made of two crossed glowing cards plus a glow.
let flameTex: THREE.Texture | null = null;
export const Flame: React.FC<{pos: V3; size: number; f: number; seed?: number}> = ({pos, size, f, seed = 0}) => {
  if (!flameTex) flameTex = flameTexture();
  const flick = 1 + 0.12 * Math.sin(f * 0.9 + seed) + 0.08 * Math.sin(f * 2.3 + seed * 2);
  const sway = 0.06 * Math.sin(f * 0.7 + seed);
  return (
    <group position={pos}>
      {[0, 1].map((i) => (
        <sprite key={i} position={[sway * size * (i ? -1 : 1), size * flick * 0.5, 0]} scale={[size * (0.55 - i * 0.12), size * flick * (1 - i * 0.18), 1]}>
          <spriteMaterial map={flameTex!} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} opacity={0.95} />
        </sprite>
      ))}
      <Glow pos={[0, size * 0.45, 0]} size={size * 3.2 * flick} color="#ff9a3a" opacity={0.55} />
    </group>
  );
};

// Particles placed by a function of (index, frame): leaves on the wind, embers, fireflies, sparkles.
export const Particles: React.FC<{
  count: number;
  at: (i: number, r: () => number) => {pos: V3; size: number; visible?: boolean; spin?: number};
  color: string;
  glow?: boolean;
  seed?: number;
  shape?: 'leaf' | 'dot';
}> = ({count, at, color, glow = false, seed = 7, shape = 'leaf'}) => {
  const tex = useGlowTex();
  const mesh = useMemo(() => {
    const geo = shape === 'leaf' ? new THREE.PlaneGeometry(1, 0.5) : new THREE.PlaneGeometry(1, 1);
    const mat = glow
      ? new THREE.MeshBasicMaterial({map: tex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide})
      : new THREE.MeshBasicMaterial({color, side: THREE.DoubleSide, toneMapped: false});
    const m = new THREE.InstancedMesh(geo, mat, count);
    m.frustumCulled = false;
    return m;
  }, [count, color, glow, shape, tex]);
  const o = useMemo(() => new THREE.Object3D(), []);
  for (let i = 0; i < count; i++) {
    const r = rng(seed * 1000 + i);
    const p = at(i, r);
    o.position.set(p.pos[0], p.pos[1], p.pos[2]);
    o.rotation.set(p.spin ?? 0, (p.spin ?? 0) * 1.7, (p.spin ?? 0) * 0.6);
    const s = p.visible === false ? 0 : p.size;
    o.scale.set(s, s, s);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

// A dust burst: soft puffs expanding and fading from a point, starting at frame `from`.
export const DustBurst: React.FC<{f: number; from: number; pos: V3; size: number; color?: string; n?: number}> = ({f, from, pos, size, color = '#d8b98a', n = 10}) => {
  const d = f - from;
  if (d < 0 || d > 40) return null;
  const u = d / 40;
  const puffs = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = size * (0.3 + u * 1.4);
    puffs.push(
      <Glow
        key={i}
        pos={[pos[0] + Math.cos(a) * rr, pos[1] + size * 0.2 + u * size * 0.4 * ((i % 3) + 1) * 0.5, pos[2] + Math.sin(a) * rr * 0.6]}
        size={size * (0.8 + u * 1.2)}
        color={color}
        opacity={0.55 * (1 - u)}
      />,
    );
  }
  return <>{puffs}</>;
};
