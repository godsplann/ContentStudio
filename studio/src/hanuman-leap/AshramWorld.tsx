// Flashback: a forest ashram in morning light. Two rishis, a havan kund with a fire, a kamandal,
// a thatched hut, and little Hanuman bouncing through it all. Shown with a warm sepia grade (see HanumanLeap.tsx).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, mythicSprite, V3} from '../shared/flat';
import {CAST, MythicExpr, MythicPose} from '../shared/mythic';
import {Flame, Glow, Particles, SkyDome} from '../shared/fx';
import {barkTexture, brickTexture, earthTexture, foliageTexture, grassTexture, skyTexture, thatchTexture} from '../shared/nature';
import {plasterTexture, rng} from '../shared/toon';
import {ramp} from '../shared/camera';
import {B, CHILD_AFTER, KUND, POT, RISHI, RISHI2} from './beats';

const TINT = '#fff1dc';
const CHILD_H = 0.92;
const RISHI_H = 1.42;

// Where little Hanuman is and what he is doing.
export const childAt = (f: number): {pos: V3; pose: MythicPose; expr: MythicExpr; flip: boolean} => {
  if (f >= B.curseGiven) return {pos: CHILD_AFTER, pose: 'stand', expr: f >= B.forget ? 'sad' : 'awe', flip: false};
  if (f >= B.potTips + 10) {
    // lands, then bounces in place, pleased with himself
    const hop = Math.abs(Math.sin((f - B.potTips) * 0.3)) * 0.28;
    const u = ramp(f, B.potTips + 10, B.curse);
    return {pos: [-0.15 + u * (CHILD_AFTER[0] + 0.15), hop, 0.9 + u * (CHILD_AFTER[2] - 0.9)], pose: 'fly', expr: 'happy', flip: false};
  }
  if (f >= B.leapOverFire) {
    // a big leap over the havan kund, knocking the kamandal on landing
    const u = Math.min(1, (f - B.leapOverFire) / 18);
    const x = 1.75 + (-0.15 - 1.75) * u;
    const z = 1.0 + (0.9 - 1.0) * u;
    return {pos: [x, Math.sin(Math.PI * u) * 1.15, z], pose: 'fly', expr: 'happy', flip: true};
  }
  if (f >= B.rishiMeditate) return {pos: [1.75, Math.abs(Math.sin(f * 0.25)) * 0.2, 1.0], pose: 'stand', expr: 'happy', flip: false};
  // bouncing round the clearing
  const a = (f - B.flashbackIn) * 0.045 + 0.6;
  const hop = Math.abs(Math.sin((f - B.flashbackIn) * 0.22));
  return {pos: [0.9 + Math.cos(a) * 1.4, hop * 0.55, 1.5 + Math.sin(a) * 0.6], pose: hop > 0.5 ? 'fly' : 'stand', expr: 'happy', flip: Math.sin(a) > 0};
};

export const AshramWorld: React.FC<{f: number}> = ({f}) => {
  const tex = useMemo(
    () => ({
      earth: earthTexture([8, 8]),
      grass: grassTexture('#6a9a48', [20, 20]),
      bark: barkTexture('#5e4330'),
      leaves: foliageTexture('#4f8f3a', '#86c25a', '#2f5f28', 4),
      leaves2: foliageTexture('#5fa043', '#9ad06a', '#3a6a2c', 8),
      brick: brickTexture([3, 1]),
      thatch: thatchTexture(),
      mud: plasterTexture('#c99a6a', 5),
      sky: skyTexture([[0, '#8fb8e0'], [0.45, '#e8f0d8'], [0.52, '#d6e6b8'], [1, '#6a8a4a']]),
    }),
    [],
  );

  const trees = useMemo(() => {
    const r = rng(77);
    const list: {pos: V3; h: number; s: number; tex: number}[] = [];
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2;
      const d = 6 + r() * 12;
      const pos: V3 = [Math.cos(a) * d, 0, Math.sin(a) * d - 2];
      if (pos[2] > 3 && Math.abs(pos[0]) < 6) continue; // keep the camera side open
      list.push({pos, h: 3 + r() * 3, s: 2.4 + r() * 1.6, tex: i % 2});
    }
    return list;
  }, []);

  // the kamandal tips over when little Hanuman lands
  const tip = ramp(f, B.potTips + 6, B.potTips + 14) * 1.45;
  const spill = f >= B.potTips + 10 && f < B.potTips + 60;

  // the curse: the rishi raises his hand, golden light flows to the child, the child's glow fades away
  const cursing = f >= B.curseGiven;
  const rishiPose: MythicPose = cursing ? 'bless' : 'stand';
  const rishiExpr: MythicExpr = f >= B.curse ? 'stern' : 'calm';
  const handGlow = cursing ? Math.min(1, (f - B.curseGiven) / 8) * (f < B.flashbackOut - 30 ? 1 : 0.4) : 0;
  const hand: V3 = [RISHI[0] + (402 / 512 - 0.5) * RISHI_H * 0.5, (1 - 404 / 1024) * RISHI_H, RISHI[2] + 0.05];
  const childAura = f < B.curseGiven ? 0.5 : f < B.forget ? 1 : Math.max(0, 1 - (f - B.forget) / 40);

  const child = childAt(f);
  const cc = CAST.baalHanuman;
  const rc = CAST.rishi;

  return (
    <>
      <fog attach="fog" args={['#e6e2c4', 14, 48]} />
      <SkyDome tex={tex.sky} radius={80} />
      <hemisphereLight args={['#dfe8ff', '#8a6a40', 1.0]} />
      <directionalLight
        position={[-7, 9, 6]}
        intensity={2.6}
        color="#ffe2b0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
      />

      {/* ground: a beaten-earth clearing in grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial map={tex.grass} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.01, 0.6]} receiveShadow>
        <circleGeometry args={[4.2, 40]} />
        <meshStandardMaterial map={tex.earth} roughness={1} />
      </mesh>

      {/* the hut */}
      <group position={[-3.4, 0, -2.6]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.6, 1.4, 20]} />
          <meshStandardMaterial map={tex.mud} roughness={1} />
        </mesh>
        <mesh position={[0, 2.0, 0]} castShadow>
          <coneGeometry args={[2.2, 1.6, 20, 1]} />
          <meshStandardMaterial map={tex.thatch} roughness={1} />
        </mesh>
        <mesh position={[0.5, 0.55, 1.45]} rotation={[0, 0.35, 0]}>
          <planeGeometry args={[0.6, 1.0]} />
          <meshStandardMaterial color="#3a2618" />
        </mesh>
      </group>

      {/* havan kund with its fire */}
      <group position={KUND}>
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.24, 0.72]} />
          <meshStandardMaterial map={tex.brick} roughness={1} />
        </mesh>
        <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshStandardMaterial color="#2a160c" emissive="#ff6a1f" emissiveIntensity={0.6} />
        </mesh>
        <Flame pos={[0, 0.24, 0]} size={0.55} f={f} />
        <Flame pos={[0.1, 0.24, 0.05]} size={0.4} f={f} seed={2} />
        <pointLight position={[0, 0.7, 0]} color="#ff9a3a" intensity={2.2 + 0.4 * Math.sin(f * 0.9)} distance={4} decay={2} />
      </group>
      <Particles
        count={20}
        color="#ffb347"
        glow
        shape="dot"
        seed={3}
        at={(i, r) => {
          const life = 50;
          const age = (f + r() * life) % life;
          return {pos: [KUND[0] + (r() - 0.5) * 0.3 + Math.sin(age * 0.2 + i) * 0.08, 0.4 + age * 0.03, KUND[2] + (r() - 0.5) * 0.3], size: 0.06 * (1 - age / life)};
        }}
      />

      {/* kamandal (water pot) */}
      <group position={POT} rotation={[0, 0, tip]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial color="#b8743a" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.08, 0.1, 12]} />
          <meshStandardMaterial color="#b8743a" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>
      {spill && (
        <Particles
          count={24}
          color="#bfe6ff"
          glow
          shape="dot"
          seed={11}
          at={(i, r) => {
            const age = f - B.potTips - 10 - r() * 10;
            const vx = -0.04 - r() * 0.04;
            return {pos: [POT[0] - 0.3 + vx * age, Math.max(0.02, 0.25 + 0.02 * age - 0.0018 * age * age), POT[2] + (r() - 0.5) * 0.3], size: 0.07, visible: age > 0};
          }}
        />
      )}

      {/* trees around the clearing */}
      {trees.map((t, i) => (
        <group key={i} position={t.pos}>
          <mesh position={[0, t.h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.28, t.h, 8]} />
            <meshStandardMaterial map={tex.bark} roughness={1} />
          </mesh>
          {[
            [0, t.h + 0.4, 0, 1],
            [-0.6, t.h - 0.2, 0.3, 0.8],
            [0.6, t.h, -0.2, 0.85],
          ].map(([x, y, z, k], j) => (
            <sprite key={j} position={[x, y, z]} scale={[t.s * k, t.s * k, 1]}>
              <spriteMaterial map={t.tex ? tex.leaves : tex.leaves2} alphaTest={0.5} color="#f2ffe8" />
            </sprite>
          ))}
        </group>
      ))}

      {/* the rishis */}
      <Flat s={mythicSprite('rishi', rc.look, rishiPose, rishiExpr)} pos={RISHI} h={RISHI_H} tint={TINT} />
      <Flat s={mythicSprite('rishi', rc.look, f >= B.curseGiven ? 'bless' : 'namaste', f >= B.curse ? 'stern' : 'calm')} pos={RISHI2} h={RISHI_H * 0.96} tint="#f4e6d0" />
      {handGlow > 0 && <Glow pos={hand} size={0.7 + 0.1 * Math.sin(f * 0.6)} color="#ffd56a" opacity={0.9 * handGlow} />}
      {f >= B.curseGiven && f < B.forget + 20 && (
        <Particles
          count={26}
          color="#ffd56a"
          glow
          shape="dot"
          seed={13}
          at={(i, r) => {
            const u = ((f - B.curseGiven) * 0.03 + r()) % 1;
            const p: V3 = [hand[0] + (CHILD_AFTER[0] - hand[0]) * u, hand[1] + (0.6 - hand[1]) * u + Math.sin(u * Math.PI) * 0.35, hand[2] + (CHILD_AFTER[2] - hand[2]) * u];
            return {pos: p, size: 0.09 + 0.05 * Math.sin(i + f * 0.3)};
          }}
        />
      )}

      {/* little Hanuman */}
      <Flat s={mythicSprite('baalHanuman', cc.look, child.pose, child.expr)} pos={child.pos} h={CHILD_H} flip={child.flip} tint={TINT} />
      {childAura > 0.01 && f >= B.yagya && <Glow pos={[child.pos[0], child.pos[1] + CHILD_H * 0.55, child.pos[2]]} size={1.6} color="#ffcf5a" opacity={0.55 * childAura} />}

      {/* motes of dust in the light */}
      <Particles
        count={40}
        color="#fff4c8"
        glow
        shape="dot"
        seed={21}
        at={(i, r) => ({pos: [(r() - 0.5) * 8 + Math.sin(f * 0.01 + i) * 0.3, 0.3 + r() * 3 + Math.sin(f * 0.02 + i) * 0.2, (r() - 0.5) * 5 + 0.5], size: 0.035})}
      />
    </>
  );
};
