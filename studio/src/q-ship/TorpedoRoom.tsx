// Inside the U-boat's bow: the torpedo room, lamp-lit, with a chalk tally of what's left.
// The commander hugs a torpedo like treasure on "Torpedoes are precious".
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, V3} from '../shared/flat';
import {Glow} from '../shared/fx';
import {Board, Box, Cyl, KeyLight} from '../shared/kit';
import {B} from './beats';
import {person} from './cast';
import {steelTexture, tallyTexture} from './textures';

export const TORP_HERO: V3 = [0.75, 0.95, 0.6]; // the torpedo he hugs (centre)
export const COMMANDER: V3 = [0.55, 0, 1.55];
export const TALLY: V3 = [-1.8, 1.85, 1.5];

const Torpedo: React.FC<{p: V3; shine?: number}> = ({p, shine = 0}) => (
  <group position={p}>
    <Cyl p={[0, 0, 0]} rt={0.27} h={4.6} r={[Math.PI / 2, 0, 0]} c="#9aa3a0" metal={0.6} rough={0.35} emissive="#ffd25e" ei={shine * 0.08} />
    <mesh position={[0, 0, -2.3]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
      <sphereGeometry args={[0.27, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#b8863a" metalness={0.6} roughness={0.3} />
    </mesh>
    <Cyl p={[0, 0, 2.45]} rt={0.12} rb={0.27} h={0.3} r={[Math.PI / 2, 0, 0]} c="#8a8f8c" metal={0.6} />
    <Box p={[0, 0, 2.55]} s={[0.9, 0.05, 0.22]} c="#6b706d" />
    <Box p={[0, 0, 2.55]} s={[0.05, 0.9, 0.22]} c="#6b706d" />
    <Cyl p={[0, 0, -1.4]} rt={0.275} h={0.12} r={[Math.PI / 2, 0, 0]} c="#c0392b" />
  </group>
);

export const TorpedoRoom: React.FC<{f: number}> = ({f}) => {
  const tex = useMemo(() => ({steel: steelTexture('#59625f', [4, 3]), tally: tallyTexture()}), []);
  const room = useMemo(() => {
    const g = new THREE.CylinderGeometry(2.0, 2.0, 9, 32, 1, true);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const hug = f >= B.precious - 6;
  const flicker = 1 + 0.05 * Math.sin(f * 0.7) + 0.03 * Math.sin(f * 1.9);
  return (
    <>
      <color attach="background" args={['#120f0c']} />
      <fog attach="fog" args={['#1a1510', 3, 11]} />
      <hemisphereLight args={['#7a6a58', '#1a1410', 0.55]} />
      <KeyLight focus={[0, 0, 0.5]} dir={[2, 6, 3]} color="#ffcf8a" intensity={1.5} size={4} />
      <pointLight position={[0.2, 2.2, 0.8]} intensity={9 * flicker} distance={7} decay={1.7} color="#ffb860" castShadow={false} />
      <pointLight position={[-1.2, 1.6, -3]} intensity={3} distance={5} decay={1.6} color="#ff5a3a" />
      {/* the pressure hull, seen from inside */}
      <mesh geometry={room} position={[0, 1.3, -0.5]} receiveShadow>
        <meshStandardMaterial map={tex.steel} side={THREE.BackSide} roughness={0.6} metalness={0.3} />
      </mesh>
      <Box p={[0, -0.02, -0.5]} s={[3.2, 0.06, 9]} c="#3a3430" rough={0.9} />
      {/* ribs */}
      {[-4, -2.6, -1.2, 0.2, 1.6, 3.0].map((z) => (
        <mesh key={z} position={[0, 1.3, z]}>
          <torusGeometry args={[1.95, 0.06, 6, 40]} />
          <meshStandardMaterial color="#4a514e" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      {/* bow tube doors at the far end */}
      {[-0.55, 0.55].map((x) => (
        <group key={x}>
          <Cyl p={[x, 1.25, -4.8]} rt={0.36} h={0.2} r={[Math.PI / 2, 0, 0]} c="#7a6a4a" metal={0.6} rough={0.4} />
          <Cyl p={[x, 1.25, -4.68]} rt={0.12} h={0.12} r={[Math.PI / 2, 0, 0]} c="#c9a24a" metal={0.7} />
        </group>
      ))}
      {/* racks and torpedoes */}
      {[
        [-1.0, 0.75, -0.6],
        [-1.0, 1.55, -0.6],
        [1.0, 1.75, -0.4],
      ].map((p, i) => (
        <Torpedo key={i} p={p as V3} />
      ))}
      <Torpedo p={TORP_HERO} shine={hug ? 1 : 0} />
      <Box p={[0.75, 0.45, 0.6]} s={[0.7, 0.9, 0.12]} c="#4a3a2a" />
      <Box p={[0.75, 0.45, -1.2]} s={[0.7, 0.9, 0.12]} c="#4a3a2a" />
      <Box p={[-1.0, 0.45, -0.6]} s={[0.6, 0.9, 0.12]} c="#4a3a2a" />
      {/* the lamp */}
      <Cyl p={[0.2, 2.45, 0.8]} rt={0.12} rb={0.2} h={0.2} c="#2a2520" />
      <Glow pos={[0.2, 2.28, 0.8]} size={0.9 * flicker} color="#ffcf8a" opacity={0.9} />
      <Glow pos={[-1.2, 1.6, -3]} size={0.5} color="#ff6a4a" opacity={0.8} />
      {/* the chalk tally: four left */}
      <Board p={TALLY} w={1.1} h={0.55} map={tex.tally} r={[0, 1.23, 0]} lit />
      {/* pipes */}
      <Cyl p={[1.4, 2.4, -0.5]} rt={0.05} h={9} r={[Math.PI / 2, 0, 0]} c="#8a6a44" metal={0.6} />
      <Cyl p={[-1.45, 2.3, -0.5]} rt={0.06} h={9} r={[Math.PI / 2, 0, 0]} c="#5a6a6a" metal={0.6} />
      {/* the commander */}
      <Flat s={person('hunter', hug ? 'hold' : 'point', hug ? 'happy' : 'focused')} pos={COMMANDER} h={1.75} tint="#ffe2c0" bob={hug ? 0.02 * Math.sin(f * 0.3) : 0} />
      {hug && <Glow pos={[TORP_HERO[0], TORP_HERO[1] + 0.3, TORP_HERO[2] + 0.4]} size={0.8} color="#ffd25e" opacity={0.25 + 0.15 * Math.sin(f * 0.4)} />}
    </>
  );
};
