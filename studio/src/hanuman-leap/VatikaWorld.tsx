// Ashoka Vatika at night: a great ashoka tree in red-orange bloom, Sita seated on a stone under it,
// diyas on stone posts, fireflies, a full moon. Hanuman drops from the branches and offers Shri Ram's ring.
import React, {useMemo} from 'react';
import {Flat, mythicSprite, V3} from '../shared/flat';
import {CAST, MythicExpr, MythicPose} from '../shared/mythic';
import {Flame, Glow, Particles, SkyDome} from '../shared/fx';
import {barkTexture, foliageTexture, grassTexture, rockTexture, skyTexture} from '../shared/nature';
import {rng} from '../shared/toon';
import {ramp} from '../shared/camera';
import {B, H_VATIKA, HANUMAN_VATIKA, RING, SITA} from './beats';

const WARM = '#ffd2a8'; // lit by the diyas
const SITA_H = 1.36;

export const VatikaWorld: React.FC<{f: number}> = ({f}) => {
  const tex = useMemo(
    () => ({
      grass: grassTexture('#2f5a34', [24, 24]),
      bark: barkTexture('#4a3426'),
      bloom: foliageTexture('#3f7a3a', '#5f9a48', '#264a26', 6, '#ff5a2a'),
      bloom2: foliageTexture('#2f6a34', '#4f8a40', '#1f3f22', 9, '#ffa21f'),
      bush: foliageTexture('#2f6a3a', '#4a8a4a', '#1f4a2a', 12),
      stone: rockTexture('#9a948a', [1, 1], 4),
      sky: skyTexture([[0, '#060a24'], [0.35, '#12204e'], [0.5, '#2a3a74'], [0.53, '#1a2440'], [1, '#05070f']]),
    }),
    [],
  );

  const canopy = useMemo(() => {
    const r = rng(5);
    const list: {pos: V3; s: number; k: number}[] = [];
    for (let i = 0; i < 22; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 2.6;
      list.push({pos: [0.2 + Math.cos(a) * d, 3.2 + r() * 1.6 - d * 0.25, -0.9 + Math.sin(a) * d * 0.6], s: 1.6 + r() * 1.0, k: i % 2});
    }
    return list;
  }, []);
  const bushes = useMemo(() => {
    const r = rng(8);
    const list: {pos: V3; s: number}[] = [];
    for (let i = 0; i < 30; i++) {
      const x = -9 + r() * 18;
      const z = -7 + r() * 6;
      list.push({pos: [x, 0.45, z], s: 0.9 + r() * 1.2});
    }
    return list;
  }, []);

  // Hanuman drops from the tree, lands, then holds out the ring
  const drop = ramp(f, B.hanumanDrops, B.hanumanDrops + 14);
  const landed = f >= B.hanumanDrops + 14;
  const squash = landed ? 1 - 0.14 * Math.exp(-(f - B.hanumanDrops - 14) / 3) : 1;
  const hPos: V3 = [HANUMAN_VATIKA[0], (1 - drop) * 3.0, HANUMAN_VATIKA[2]];
  const hPose: MythicPose = f >= B.ring ? 'offer' : f < B.hanumanDrops + 14 ? 'fly' : 'namaste';
  const hExpr: MythicExpr = 'happy';
  const sitaExpr: MythicExpr = f >= B.sitaSmiles ? 'happy' : f >= B.ring + 15 ? 'awe' : 'sad';

  // the ring's glow, and Shri Ram seen in it
  const ringGlow = f >= B.ring ? ramp(f, B.ring, B.ring + 10) * (0.7 + 0.15 * Math.sin(f * 0.4)) : 0;
  const vision = ramp(f, B.prabhu, B.prabhu + 16);
  const hc = CAST.hanuman;
  const sc = CAST.sita;
  const rc = CAST.ram;

  const diyas: V3[] = [
    [-2.6, 0, 1.2],
    [2.4, 0, 1.4],
    [-1.6, 0, -1.8],
    [2.1, 0, -1.5],
  ];

  return (
    <>
      <fog attach="fog" args={['#141d3e', 8, 34]} />
      <SkyDome tex={tex.sky} radius={90} />
      {/* the moon */}
      <Glow pos={[-14, 22, -60]} size={34} color="#9fb4ff" opacity={0.6} />
      <mesh position={[-14, 22, -60]}>
        <circleGeometry args={[3.2, 40]} />
        <meshBasicMaterial color="#f4f1e0" fog={false} toneMapped={false} />
      </mesh>

      <hemisphereLight args={['#5a6ab0', '#1a1a2a', 0.75]} />
      <directionalLight
        position={[-8, 12, -6]}
        intensity={1.1}
        color="#a9b8ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial map={tex.grass} roughness={1} />
      </mesh>

      {/* the ashoka tree */}
      <group position={[0.2, 0, -0.9]}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.42, 2.8, 10]} />
          <meshStandardMaterial map={tex.bark} roughness={1} />
        </mesh>
        {[
          [-0.9, 2.9, 0.1, 0.7],
          [0.95, 3.0, -0.2, -0.65],
          [0.1, 3.3, 0.5, 0.15],
        ].map(([x, y, z, rz], i) => (
          <mesh key={i} position={[x / 2, y - 0.4, z / 2]} rotation={[0, 0, rz]} castShadow>
            <cylinderGeometry args={[0.08, 0.16, 1.5, 7]} />
            <meshStandardMaterial map={tex.bark} roughness={1} />
          </mesh>
        ))}
      </group>
      {canopy.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.s, c.s, 1]}>
          <spriteMaterial map={c.k ? tex.bloom : tex.bloom2} alphaTest={0.5} color="#b7bfee" />
        </sprite>
      ))}
      {/* falling blossoms */}
      <Particles
        count={26}
        color="#ff7a3a"
        seed={4}
        at={(i, r) => {
          const life = 140;
          const age = (f + r() * life) % life;
          return {pos: [-2 + r() * 4.4 + Math.sin(age * 0.06 + i) * 0.3, 4.2 - age * 0.03, -1.6 + r() * 2.6], size: 0.07, spin: age * 0.12 + i};
        }}
      />

      {bushes.map((b, i) => (
        <sprite key={i} position={b.pos} scale={[b.s * 1.4, b.s, 1]}>
          <spriteMaterial map={tex.bush} alphaTest={0.5} color="#8f9ad0" />
        </sprite>
      ))}

      {/* Sita's stone seat */}
      <mesh position={[SITA[0], SITA[1] / 2, SITA[2]]} castShadow receiveShadow>
        <boxGeometry args={[1.5, SITA[1], 0.9]} />
        <meshStandardMaterial map={tex.stone} roughness={0.9} />
      </mesh>

      {/* diyas on stone posts */}
      {diyas.map((d, i) => (
        <group key={i} position={d}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.22, 0.8, 0.22]} />
            <meshStandardMaterial map={tex.stone} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.84, 0]}>
            <cylinderGeometry args={[0.1, 0.05, 0.07, 12]} />
            <meshStandardMaterial color="#b8743a" roughness={0.6} />
          </mesh>
          <Flame pos={[0, 0.87, 0]} size={0.18} f={f} seed={i * 1.7} />
          <pointLight position={[0, 1.05, 0]} color="#ffa84a" intensity={1.4} distance={3.6} decay={2} />
        </group>
      ))}

      <Particles
        count={34}
        color="#d8ff7a"
        glow
        shape="dot"
        seed={17}
        at={(i, r) => {
          const ph = r() * 6.28;
          const blink = 0.5 + 0.5 * Math.sin(f * (0.08 + r() * 0.06) + ph);
          return {pos: [(r() - 0.5) * 9 + Math.sin(f * 0.012 + ph) * 0.6, 0.3 + r() * 2.6 + Math.sin(f * 0.02 + ph) * 0.25, -3 + r() * 5], size: 0.09 * blink};
        }}
      />

      {/* Sita and Hanuman */}
      <Flat s={mythicSprite('sita', sc.look, 'namaste', sitaExpr)} pos={SITA} h={SITA_H} tint={WARM} />
      {f >= B.hanumanDrops - 2 && (
        <Flat s={mythicSprite('hanuman', hc.look, hPose, hExpr)} pos={hPos} h={H_VATIKA} squash={squash} tint={WARM} />
      )}
      {ringGlow > 0 && (
        <>
          <Glow pos={[RING[0], RING[1], RING[2] + 0.02]} size={0.3 + vision * 0.22} color="#ffd56a" opacity={ringGlow * (1 - 0.45 * vision)} />
          <Glow pos={[RING[0], RING[1], RING[2] + 0.02]} size={0.12} color="#ffffff" opacity={ringGlow} />
        </>
      )}
      {vision > 0 && (
        <Flat s={mythicSprite('ram', rc.look, 'hold', 'calm')} pos={[RING[0] - 0.005, RING[1] - 0.1, RING[2] + 0.06]} h={0.2} opacity={0.9 * vision} maxTilt={0} tint="#fff6dc" />
      )}
    </>
  );
};

