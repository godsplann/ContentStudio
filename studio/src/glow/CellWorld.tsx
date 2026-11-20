// Inside a cell: a mitochondrion burning fuel, free radicals flying out, crashing into a fat and a protein,
// which hold the energy and let it go as a flash of light. Also the "cells at work" wide shot near the end.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, useCam, V3} from '../shared/flat';
import {clamp01, ramp} from '../shared/camera';
import {DustBurst, Flame, Glow, Particles} from '../shared/fx';
import {Ball, Board, Box, Cyl, KeyLight} from '../shared/kit';
import {boardTexture} from '../shared/people';
import {B} from './beats';
import {person, radical} from './cast';
import {cytoFloorTex, membraneTex, mitoTex} from './textures';

export const MITO: V3 = [0, 1.55, -5];
export const MOUTH: V3 = [0, 1.45, -3.55];
export const FAT_P: V3 = [-2.1, 0, 1.3];
export const PRO_P: V3 = [2.1, 0, 1.3];
export const MOL_H = 1.5;
const MOL_HEAD = ((1024 - 300) / 1024) * MOL_H;

const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
const hop = (a: V3, b: V3, u: number, height: number): V3 => {
  const p = lerp3(a, b, u);
  p[1] += Math.sin(Math.PI * u) * height;
  return p;
};

type Run = {out: number; land: V3; landAt: number; target: V3; hit: number};
// Where a free radical is at frame f: shot out of the furnace, landing, running at its target, bouncing off.
const radicalAt = (r: Run, f: number): {pos: V3; airborne: boolean; crash: boolean; visible: boolean} => {
  if (f < r.out) return {pos: MOUTH, airborne: true, crash: false, visible: false};
  if (f < r.landAt) return {pos: hop(MOUTH, r.land, (f - r.out) / (r.landAt - r.out), 1.6), airborne: true, crash: false, visible: true};
  if (f < r.hit) {
    const u = (f - r.landAt) / (r.hit - r.landAt);
    const p = lerp3(r.land, [r.target[0] * 0.82, 0, r.target[2] - 0.15], u);
    p[1] = Math.abs(Math.sin(u * Math.PI * 5)) * 0.12;
    return {pos: p, airborne: false, crash: false, visible: true};
  }
  const d = f - r.hit;
  if (d < 10) return {pos: [r.target[0] * 0.82, 0, r.target[2] - 0.15], airborne: false, crash: true, visible: true};
  const u = clamp01((d - 10) / 40);
  const away: V3 = [r.target[0] * 0.2, 0, r.target[2] - 6];
  return {pos: hop([r.target[0] * 0.82, 0, r.target[2] - 0.15], away, u, 1.2), airborne: true, crash: false, visible: u < 1};
};

const R1: Run = {out: B.burning + 6, land: [-0.9, 0, -1.6], landAt: B.burning + 34, target: FAT_P, hit: B.hitFat};
const R2: Run = {out: B.burning + 18, land: [1.0, 0, -1.4], landAt: B.burning + 48, target: PRO_P, hit: B.hitProtein};

// A charged molecule: lit up after the hit, strained while holding the energy, back to normal after the flash.
const charge = (f: number, hit: number, flash: number) => (f < hit ? 0 : f < flash ? 0.35 + 0.65 * ramp(f, B.pass, B.hold + 20) : 1 - ramp(f, flash, flash + 10));

export const CellWorld: React.FC<{f: number}> = ({f}) => {
  const tex = useMemo(
    () => ({
      membrane: membraneTex(),
      floor: cytoFloorTex(),
      mito: mitoTex(),
      fuel: boardTexture('cell-fuel', 512, 220, '#fff6e0', [{text: 'FUEL', size: 120, y: 0.55, color: '#c4561c'}]),
      sign: boardTexture('cell-sign', 768, 300, '#2a1240', [{text: 'MITOCHONDRION', size: 76, y: 0.38, color: '#ffcf3a'}, {text: 'the cell’s power plant', size: 46, y: 0.72, color: '#ffd9ec', weight: 500}], {border: '#ffcf3a'}),
    }),
    [],
  );
  const cam = useCam();
  // Sugar cubes ride a belt into the furnace; the fire flares as each one goes in.
  const cubes = 7;
  const period = 26;
  const flare = Math.max(0, ...Array.from({length: cubes}, (_, i) => {
    const t = ((f + i * (period / 1)) % (period * cubes)) / period;
    return t > 6.8 ? 1 - (t - 6.8) * 4 : 0;
  }));
  const burn = 1 + 0.25 * flare + 0.1 * Math.sin(f * 0.6);

  const fatC = charge(f, B.hitFat, B.flash);
  const proC = charge(f, B.hitProtein, B.flash + 10);
  const fatExpr = f < B.hitFat ? 'calm' : f < B.flash ? (f < B.hitFat + 14 ? 'awe' : 'strain') : 'happy';
  const proExpr = f < B.hitProtein ? (f > B.hitFat ? 'awe' : 'calm') : f < B.flash + 10 ? (f < B.hitProtein + 14 ? 'awe' : 'strain') : 'happy';
  const shake = (c: number, k: number) => (c > 0.4 ? Math.sin(f * 1.7 + k) * 0.02 * c : 0);

  // the photon each molecule lets go of, flying towards the camera
  const photon = (from: V3, at: number) => {
    const d = f - at;
    if (d < 0 || d > 26) return null;
    const u = d / 26;
    const camP: V3 = [cam.x, cam.y, cam.z];
    const p = lerp3(from, lerp3(from, camP, 0.85), u * u);
    return (
      <>
        <Glow pos={p} size={0.35 + u * 0.4} color="#fff6c8" opacity={0.95} />
        <Glow pos={p} size={1.2 + u} color="#ffd06a" opacity={0.35 * (1 - u * 0.5)} />
      </>
    );
  };
  const headOf = (p: V3): V3 => [p[0], MOL_HEAD - 0.1, p[2] + 0.1];
  const late = f >= B.chem;

  return (
    <>
      <color attach="background" args={['#3a1840']} />
      <fog attach="fog" args={['#6a2a5e', 8, 34]} />
      <hemisphereLight args={['#ffb0d8', '#4a1838', 1.0]} />
      <KeyLight focus={[0, 0, 0]} dir={[3, 8, 6]} color="#ffe0f0" intensity={1.4} size={9} />
      <pointLight position={[MOUTH[0], MOUTH[1], MOUTH[2] + 1.2]} intensity={12 * burn} distance={10} decay={1.4} color="#ff8a3a" />
      {fatC > 0.05 && <pointLight position={[FAT_P[0], 1.2, FAT_P[2] + 0.6]} intensity={5 * fatC} distance={4} decay={1.5} color="#ffd06a" />}
      {proC > 0.05 && <pointLight position={[PRO_P[0], 1.2, PRO_P[2] + 0.6]} intensity={5 * proC} distance={4} decay={1.5} color="#ffd06a" />}

      {/* the cell: soft floor and curved walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial map={tex.floor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[30, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial map={tex.membrane} side={THREE.BackSide} roughness={1} />
      </mesh>
      {/* floating vesicles and a far nucleus */}
      {[[-6, 3.5, -9, 1.2], [7, 4.5, -11, 1.6], [-9, 2, -4, 0.8], [5, 1.2, -2, 0.5], [-3.5, 5, -14, 1]].map(([x, y, z, r], i) => (
        <Ball key={i} p={[x, y + Math.sin(f * 0.03 + i) * 0.2, z]} rad={r} c={['#ffb3d1', '#c9a0ff', '#ffd9a0'][i % 3]} opacity={0.75} rough={0.3} shadow={false} />
      ))}
      <Ball p={[-12, 4, -20]} rad={5} c="#7a4ab8" rough={0.6} />
      <Ball p={[-12, 4, -20]} rad={5.4} c="#b98af0" opacity={0.25} shadow={false} />
      {/* protein strands on the floor */}
      {Array.from({length: 18}, (_, i) => {
        const a = i * 2.39;
        const r = 5 + (i % 5) * 2.2;
        return <Cyl key={i} p={[Math.cos(a) * r, 0.08, Math.sin(a) * r - 2]} rt={0.08} h={1.6} r={[Math.PI / 2, a, 0]} c={['#ffcf3a', '#43b97f', '#ff8fb5'][i % 3]} />;
      })}

      {/* the mitochondrion: the furnace */}
      <mesh position={MITO} scale={[3.3, 1.55, 1.55]} castShadow receiveShadow>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial map={tex.mito} roughness={0.6} />
      </mesh>
      <mesh position={[MOUTH[0], MOUTH[1], MOUTH[2] - 0.02]}>
        <circleGeometry args={[0.62, 40]} />
        <meshBasicMaterial color="#2a0a08" />
      </mesh>
      <mesh position={[MOUTH[0], MOUTH[1], MOUTH[2]]}>
        <torusGeometry args={[0.66, 0.1, 12, 48]} />
        <meshStandardMaterial color="#8a3a1a" roughness={0.5} />
      </mesh>
      <Flame pos={[MOUTH[0], MOUTH[1] - 0.45, MOUTH[2] + 0.05]} size={0.75 * burn} f={f} />
      <Glow pos={[MOUTH[0], MOUTH[1], MOUTH[2] + 0.3]} size={2.6 * burn} color="#ff7a2a" opacity={0.5} />
      <Board p={[MITO[0] + 2.6, 3.7, MITO[2] + 0.4]} w={1.9} h={0.74} map={tex.sign} />
      <Cyl p={[MITO[0] + 2.6, 1.6, MITO[2] + 0.38]} rt={0.04} h={3.2} c="#2b2a3a" />

      {/* fuel belt */}
      <Box p={[3.2, 0.62, MOUTH[2] + 0.35]} s={[5.6, 0.12, 0.6]} c="#3a3f4c" metal={0.3} />
      {[1, 2.6, 4.2, 5.8].map((x) => <Cyl key={x} p={[x, 0.3, MOUTH[2] + 0.35]} rt={0.05} h={0.6} c="#2b2a3a" />)}
      <Box p={[0.55, 1.05, MOUTH[2] + 0.35]} s={[0.6, 0.8, 0.6]} r={[0, 0, -0.5]} c="#4a4f5c" metal={0.3} />
      {Array.from({length: cubes}, (_, i) => {
        const t = ((f + i * period) % (period * cubes)) / period;
        const x = 6 - t * 0.78;
        if (x < 0.9) return null;
        return <Box key={i} p={[x, 0.82, MOUTH[2] + 0.35]} s={[0.28, 0.28, 0.28]} r={[0, t * 0.2, 0]} c="#fbfaf4" rough={0.6} />;
      })}
      <Board p={[5.6, 1.5, MOUTH[2] + 0.36]} w={0.8} h={0.34} map={tex.fuel} />
      {/* sparks out of the furnace */}
      <Particles
        count={30}
        seed={5}
        glow
        shape="dot"
        color="#ffb050"
        at={(i, r) => {
          const life = ((f * (0.02 + r() * 0.02) + r()) % 1);
          const a = r() * Math.PI * 2;
          return {pos: [MOUTH[0] + Math.cos(a) * life * 1.4, MOUTH[1] + Math.sin(a) * life * 0.9 + life * 0.6, MOUTH[2] + 0.2 + life * 1.2], size: 0.08 * (1 - life) * (f >= B.burning ? 1.6 : 0.8)};
        }}
      />

      {/* free radicals: two that matter, a few more bouncing around */}
      {[R1, R2].map((r, k) => {
        const st = radicalAt(r, f);
        if (!st.visible) return null;
        const jit = Math.sin(f * 1.3 + k) * 0.03;
        return (
          <group key={k}>
            <Flat s={radical(st.crash ? 'crash' : 'wild')} pos={[st.pos[0] + jit, st.pos[1], st.pos[2]]} h={0.75} aspect={1} airborne={st.airborne} roll={st.airborne ? Math.sin(f * 0.4 + k) * 0.4 : 0} />
            <Glow pos={[st.pos[0], st.pos[1] + 0.4, st.pos[2] + 0.05]} size={0.9} color="#ff6a3a" opacity={0.35} />
          </group>
        );
      })}
      {f >= B.burning &&
        [0, 1, 2, 3, 4].map((k) => {
          const out = B.burning + 30 + k * 11;
          if (f < out) return null;
          const a = k * 1.3 + 0.6;
          const land: V3 = [Math.cos(a) * (3.5 + k * 0.5), 0, -3 + Math.sin(a) * 2.5];
          const u = clamp01((f - out) / 30);
          const p = u < 1 ? hop(MOUTH, land, u, 2) : [land[0] + Math.sin((f - out) * 0.12 + k) * 0.6, Math.abs(Math.sin((f - out) * 0.3 + k)) * 0.15, land[2] + Math.cos((f - out) * 0.1 + k) * 0.4] as V3;
          return <Flat key={k} s={radical(k % 2 ? 'wild' : 'crash')} pos={p} h={0.55} aspect={1} airborne={u < 1} />;
        })}
      <DustBurst f={f} from={B.hitFat} pos={[FAT_P[0] * 0.9, 0.5, FAT_P[2]]} size={0.5} color="#ffcf6a" n={10} />
      <DustBurst f={f} from={B.hitProtein} pos={[PRO_P[0] * 0.9, 0.5, PRO_P[2]]} size={0.5} color="#ffcf6a" n={10} />

      {/* the fat and the protein */}
      <Flat s={person('fat', f >= B.hitFat && f < B.flash ? 'shrug' : 'stand', fatExpr)} pos={[FAT_P[0] + shake(fatC, 0), 0, FAT_P[2]]} h={MOL_H} tint={'#' + new THREE.Color('#ffffff').lerp(new THREE.Color('#fff2b0'), fatC).getHexString()} />
      <Flat s={person('protein', f >= B.hitProtein && f < B.flash + 10 ? 'shrug' : 'stand', proExpr)} pos={[PRO_P[0] + shake(proC, 1), 0, PRO_P[2]]} h={MOL_H} tint={'#' + new THREE.Color('#ffffff').lerp(new THREE.Color('#fff2b0'), proC).getHexString()} />
      {fatC > 0.02 && <Glow pos={[FAT_P[0], 0.95, FAT_P[2] + 0.12]} size={1.4 + 0.2 * Math.sin(f * 0.5)} color="#ffd06a" opacity={0.5 * fatC} sx={0.8} />}
      {proC > 0.02 && <Glow pos={[PRO_P[0], 0.95, PRO_P[2] + 0.12]} size={1.4 + 0.2 * Math.sin(f * 0.5 + 1)} color="#ffd06a" opacity={0.5 * proC} sx={0.8} />}
      {photon(headOf(FAT_P), B.flash)}
      {photon(headOf(PRO_P), B.flash + 10)}
      {f >= B.flash && f < B.flash + 6 && <Glow pos={headOf(FAT_P)} size={3 * (1 - (f - B.flash) / 6)} color="#ffffff" opacity={0.8} />}
      {f >= B.flash + 10 && f < B.flash + 16 && <Glow pos={headOf(PRO_P)} size={3 * (1 - (f - B.flash - 10) / 6)} color="#ffffff" opacity={0.8} />}

      {/* near the end: tiny flashes all over the cell */}
      {late && (
        <Particles
          count={70}
          seed={91}
          glow
          shape="dot"
          color="#fff2b0"
          at={(i, r) => {
            const x = (r() - 0.5) * 18;
            const z = -r() * 14 + 2;
            const y = 0.2 + r() * 3.5;
            const ph = r() * 40;
            const blink = ((f - B.chem + ph) % 40) / 40;
            return {pos: [x, y, z], size: blink < 0.18 ? 0.35 * Math.sin((blink / 0.18) * Math.PI) : 0};
          }}
        />
      )}
    </>
  );
};
