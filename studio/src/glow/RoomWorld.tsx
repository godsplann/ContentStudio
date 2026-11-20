// The bedroom at night: the viewer on the bed, a heater, the light gauge on the wall, a glow stick, an "aura".
// Used for the opening, the glow stick, the aura line and the ending.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, V3} from '../shared/flat';
import {ramp} from '../shared/camera';
import {DustBurst, Glow, Particles} from '../shared/fx';
import {Board, Box, Cyl, KeyLight} from '../shared/kit';
import {plasterTexture, woodTexture} from '../shared/toon';
import {B} from './beats';
import {person} from './cast';
import {gaugeTex, nightWindow} from './textures';

export const YOU_SIT: V3 = [1.0, 0, -0.32];
export const YOU_STAND: V3 = [0.45, 0, -0.1];
export const YOU_H = 1.75;
export const GAUGE: V3 = [0.15, 1.75, -2.96];
export const HEATER: V3 = [-2.1, 0, -1.4];

// How strongly the viewer glows (shown far brighter than real, so it can be seen at all).
export const bodyGlow = (f: number) => {
  if (f < B.notHeat) return 0.6 + 0.4 * ramp(f, 0, 40);
  if (f < B.real) return 0.55;
  if (f < B.faint) return 1;
  if (f < B.japan) return 1 - 0.88 * ramp(f, B.thousand, B.thousand + 60);
  if (f >= B.aura && f < B.chem) return 0.18;
  if (f >= B.nextTime) {
    if (f < B.still) return 0.05;
    return 0.05 + 0.85 * ramp(f, B.still, B.still + 14) - 0.9 * ramp(f, B.cantSee + 6, B.end + 10);
  }
  return 0;
};

export const RoomWorld: React.FC<{f: number}> = ({f}) => {
  const tex = useMemo(() => ({wood: woodTexture(), wall: plasterTexture('#3d4870', 9), win: nightWindow(), gauge: gaugeTex()}), []);
  const g = Math.max(0, bodyGlow(f));
  const standing = f >= B.glowStick && f < B.canada;
  const pos = standing ? YOU_STAND : YOU_SIT;
  const inAura = f >= B.aura && f < B.chem;
  const expr = standing ? (f >= B.snap ? 'happy' : 'focused') : inAura ? (f < B.aura + 40 ? 'awe' : 'calm') : f >= B.real && f < B.japan ? 'awe' : f >= B.still ? 'happy' : 'calm';
  const s = standing ? person('you', 'hold', expr, 'glowstick') : person('you', 'sit', expr);
  // head and chest heights for the glow, from the drawing
  const headY = standing ? ((1024 - 300) / 1024) * YOU_H : ((1024 - 400) / 1024) * YOU_H;
  const chestY = headY - 0.55;
  const breathe = Math.sin(f * 0.08) * 0.04;

  // The heater is on for the "not heat" beat, then switches off.
  const heat = f < B.notHeat ? 1 : f < B.japan ? 1 - ramp(f, B.notHeat + 4, B.notHeat + 22) : 0;
  const coil = new THREE.Color('#3a2a2a').lerp(new THREE.Color('#ff5a1e'), heat);

  // The glow stick lights up when it is snapped.
  const stick = standing ? ramp(f, B.snap, B.snap + 10) : 0;
  const stickPos: V3 = [pos[0] - 0.02, ((1024 - 560) / 1024) * YOU_H, pos[2] + 0.06];

  // The rainbow "aura": pops in, wobbles, then bursts.
  const auraIn = inAura ? ramp(f, B.aura + 2, B.aura + 10) : 0;
  const pop = s2(B.aura + 42);
  const auraOut = inAura ? ramp(f, pop, pop + 8) : 0;
  const auraScale = auraIn * (1 + 0.04 * Math.sin(f * 0.3)) * (1 + auraOut * 0.6);
  const auraOpacity = auraIn * (1 - auraOut);

  return (
    <>
      <color attach="background" args={['#0d1022']} />
      <fog attach="fog" args={['#10142a', 6, 16]} />
      <hemisphereLight args={['#6f82c8', '#1a1420', 0.75]} />
      <KeyLight focus={[0, 0, 0]} dir={[-3, 6, 5]} color="#9fb4ff" intensity={0.9} size={6} />
      {heat > 0.01 && <pointLight position={[HEATER[0], 0.6, HEATER[2] + 0.5]} intensity={6 * heat} distance={5} decay={1.6} color="#ff6a2a" />}
      {g > 0.05 && <pointLight position={[pos[0], chestY + 0.2, pos[2] + 0.5]} intensity={2.4 * g} distance={3.5} decay={1.6} color="#9fe8ff" />}
      {stick > 0 && <pointLight position={[stickPos[0], stickPos[1], stickPos[2] + 0.3]} intensity={5 * stick} distance={4} decay={1.5} color="#8dff6a" />}

      {/* Room */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial map={tex.wood} roughness={0.7} color="#8a7a8e" />
      </mesh>
      <mesh position={[0, 3, -3]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial map={tex.wall} roughness={0.95} />
      </mesh>
      <mesh position={[-3.6, 3, 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial map={tex.wall} roughness={0.95} color="#b8bcd8" />
      </mesh>
      <Box p={[0, 0.06, -2.97]} s={[12, 0.12, 0.04]} c="#d8d2c4" shadow={false} />
      {/* Window with moonlight */}
      <Board p={[-1.6, 1.95, -2.97]} w={1.3} h={1.6} map={tex.win} />
      <Glow pos={[-1.6, 1.95, -2.8]} size={2.4} color="#6f8cff" opacity={0.18} />
      {/* Curtains */}
      <Box p={[-2.4, 1.9, -2.9]} s={[0.35, 2.2, 0.06]} c="#6b3f7a" />
      <Box p={[-0.8, 1.9, -2.9]} s={[0.35, 2.2, 0.06]} c="#6b3f7a" />
      <Cyl p={[-1.6, 3.05, -2.88]} rt={0.025} h={2.1} r={[0, 0, Math.PI / 2]} c="#2b2a3a" />

      {/* Bed */}
      <Box p={[1.45, 0.14, -1.55]} s={[2.0, 0.28, 2.6]} map={tex.wood} c="#a0806a" />
      <Box p={[1.45, 0.34, -1.55]} s={[1.92, 0.12, 2.5]} c="#efe9f2" />
      <Box p={[1.45, 0.42, -1.2]} s={[1.96, 0.06, 1.6]} c="#5a4cc0" r={[0.02, 0, 0]} />
      <Box p={[1.45, 0.5, -2.5]} s={[1.3, 0.18, 0.45]} c="#f6f1ea" />
      <Box p={[1.45, 0.7, -2.82]} s={[2.0, 1.1, 0.1]} map={tex.wood} c="#8a6a56" />

      {/* Nightstand and lamp (off) */}
      <Box p={[-0.15, 0.3, -2.5]} s={[0.6, 0.6, 0.5]} map={tex.wood} c="#a0806a" />
      <Cyl p={[-0.15, 0.62, -2.5]} rt={0.12} h={0.04} c="#2b2f3a" />
      <Cyl p={[-0.15, 0.8, -2.5]} rt={0.02} h={0.36} c="#2b2f3a" />
      <Cyl p={[-0.15, 1.02, -2.5]} rt={0.12} rb={0.2} h={0.2} c="#e8d8b0" />
      <Box p={[0.05, 0.63, -2.4]} s={[0.12, 0.02, 0.2]} c="#20242e" />
      {/* Rug */}
      <mesh position={[0.2, 0.005, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.3, 48]} />
        <meshStandardMaterial color="#c0566e" roughness={1} />
      </mesh>
      {/* Bookshelf on the left wall */}
      <Box p={[-3.35, 1.0, 0.4]} s={[0.4, 2.0, 1.4]} map={tex.wood} c="#9a7a64" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3, 4].map((k) => (
          <Box key={`${row}-${k}`} p={[-3.12, 0.42 + row * 0.6, -0.1 + k * 0.24]} s={[0.06, 0.4 - (k % 3) * 0.05, 0.18]} c={['#e8572f', '#3a6fd8', '#ffcf3a', '#3cae5c', '#8e5cd8'][(k + row) % 5]} />
        )),
      )}

      {/* Heater: three coils that glow, then go dark */}
      <Box p={[HEATER[0], 0.42, HEATER[2]]} s={[0.9, 0.8, 0.26]} c="#3a3f4c" metal={0.3} rough={0.5} />
      {[0.26, 0.42, 0.58].map((y) => (
        <Cyl key={y} p={[HEATER[0], y, HEATER[2] + 0.14]} rt={0.035} h={0.72} r={[0, 0, Math.PI / 2]} c={'#' + coil.getHexString()} emissive={'#' + coil.getHexString()} ei={1.4 * heat} shadow={false} />
      ))}
      {heat > 0.02 && <Glow pos={[HEATER[0], 0.42, HEATER[2] + 0.3]} size={1.8} color="#ff5a1e" opacity={0.7 * heat} />}

      {/* The light gauge on the wall */}
      <Board p={GAUGE} w={0.8} h={1.28} map={tex.gauge} lit />
      <Glow pos={[GAUGE[0], GAUGE[1] - 0.6, GAUGE[2] + 0.03]} size={0.18 + 0.03 * Math.sin(f * 0.4)} color="#ffb030" opacity={0.9} />

      {/* The viewer, and their glow */}
      <Flat s={s} pos={pos} h={YOU_H} tint="#d8dcff" bob={standing ? 0 : Math.abs(Math.sin(f * 0.05)) * 0.006} />
      {g > 0.01 && (
        <>
          <Glow pos={[pos[0], chestY, pos[2] + 0.08]} size={(1.9 + breathe) * (0.6 + 0.4 * g)} color="#7fe8ff" opacity={0.42 * g} sx={0.8} />
          <Glow pos={[pos[0], headY, pos[2] + 0.1]} size={1.35 + breathe} color="#fff3c4" opacity={0.5 * g} />
          <Glow pos={[pos[0], headY + 0.05, pos[2] + 0.12]} size={0.7} color="#ffffff" opacity={0.3 * g} />
          <Particles
            count={46}
            seed={31}
            glow
            shape="dot"
            color="#c8f6ff"
            at={(i, r) => {
              const ox = (r() - 0.5) * 0.6;
              const oy = r() * 1.2;
              const speed = 0.004 + r() * 0.006;
              const life = ((f * speed + r()) % 1);
              return {
                pos: [pos[0] + ox + Math.sin(f * 0.05 + i) * 0.05, 0.45 + oy + life * 0.6, pos[2] + 0.12 + r() * 0.2],
                size: (0.035 + r() * 0.03) * Math.sin(Math.PI * life) * Math.min(1, g * 1.3),
              };
            }}
          />
        </>
      )}

      {/* Glow stick */}
      {stick > 0 && (
        <>
          <Glow pos={stickPos} size={0.9 * stick} color="#8dff6a" opacity={0.8} sx={0.7} />
          <Glow pos={stickPos} size={2.6 * stick} color="#5cff8a" opacity={0.25} />
        </>
      )}
      {standing && f >= B.snap && f < B.snap + 12 && <DustBurst f={f} from={B.snap} pos={[stickPos[0], stickPos[1] - 0.1, stickPos[2] + 0.1]} size={0.25} color="#c8ffb0" n={8} />}

      {/* The "aura" that is not real */}
      {inAura && auraOpacity > 0.01 && (
        <group position={[pos[0], headY + 0.05, pos[2] + 0.05]} scale={[auraScale, auraScale, auraScale]}>
          {(['#ff6fb5', '#ffd23a', '#5ff0b8', '#7fb2ff'] as const).map((col, i) => (
            <mesh key={col}>
              <torusGeometry args={[0.27 + i * 0.05, 0.02, 10, 64]} />
              <meshBasicMaterial color={col} transparent opacity={auraOpacity} toneMapped={false} />
            </mesh>
          ))}
          <Glow pos={[0, 0, -0.02]} size={1.6} color="#ffc8f0" opacity={0.3 * auraOpacity} />
        </group>
      )}
      {inAura && <DustBurst f={f} from={pop} pos={[pos[0], headY - 0.1, pos[2] + 0.1]} size={0.35} color="#ffe0f4" n={12} />}
    </>
  );
};

const s2 = (frame: number) => frame;
