// A farm at dawn: rows of crops, one patch of stressed plants glowing, a farmer with a tablet.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, V3} from '../shared/flat';
import {ramp} from '../shared/camera';
import {Glow, Particles, SkyDome} from '../shared/fx';
import {Board, Box, Cyl, KeyLight} from '../shared/kit';
import {earthTexture} from '../shared/nature';
import {B} from './beats';
import {person} from './cast';
import {fieldMapTex, skyGrad} from './textures';

export const FARMER: V3 = [-0.7, 0, 2.6];
export const PATCH: V3 = [2.6, 0, -7];
const inPatch = (x: number, z: number) => Math.abs(x - PATCH[0]) < 1.6 && Math.abs(z - PATCH[2]) < 2.2;

export const FarmWorld: React.FC<{f: number}> = ({f}) => {
  const tex = useMemo(() => ({earth: earthTexture([14, 14]), sky: skyGrad('dawn', [[0, '#3a4a9a'], [0.4, '#c87aa8'], [0.62, '#ffb27a'], [0.72, '#ffe0a8'], [1, '#ffe0a8']]), map: fieldMapTex()}), []);
  const crops = useMemo(() => {
    const pts: V3[] = [];
    for (let row = -7; row <= 7; row++) for (let z = -34; z <= 4; z += 0.7) pts.push([row * 0.9 + 0.2, 0, z + (row % 2) * 0.35]);
    const geo = new THREE.ConeGeometry(0.22, 0.6, 7);
    geo.translate(0, 0.3, 0);
    const mat = new THREE.MeshStandardMaterial({roughness: 0.8});
    const m = new THREE.InstancedMesh(geo, mat, pts.length);
    const o = new THREE.Object3D();
    pts.forEach((p, i) => {
      o.position.set(p[0], 0, p[2]);
      const k = 0.8 + ((i * 37) % 10) / 25;
      o.scale.set(k, k, k);
      o.rotation.set(0, i, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, new THREE.Color(inPatch(p[0], p[2]) ? '#a8b84a' : i % 3 ? '#3f9a4a' : '#4cae52'));
    });
    m.castShadow = true;
    m.receiveShadow = true;
    return {m, pts};
  }, []);
  const sick = ramp(f, B.crops - 10, B.crops + 8);
  return (
    <>
      <SkyDome tex={tex.sky} radius={140} />
      <fog attach="fog" args={['#e8a88a', 14, 80]} />
      <hemisphereLight args={['#ffc8a8', '#3a3040', 0.8]} />
      <KeyLight focus={[0, 0, 0]} dir={[-5, 4, -9]} color="#ffb070" intensity={2.6} size={12} />
      <Glow pos={[-12, 4, -110]} size={40} color="#ffd08a" opacity={0.7} />
      <Glow pos={[-12, 4, -110]} size={12} color="#fff6dc" opacity={0.9} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial map={tex.earth} roughness={1} color="#a87a5a" />
      </mesh>
      <primitive object={crops.m} />
      {/* fence and a barn far off */}
      {Array.from({length: 14}, (_, i) => <Cyl key={i} p={[-8, 0.5, 4 - i * 2.6]} rt={0.06} h={1} c="#6b4a32" />)}
      <Box p={[-8, 0.8, -13]} s={[0.06, 0.08, 34]} c="#6b4a32" />
      <Box p={[-16, 2.5, -40]} s={[7, 5, 5]} c="#b8433a" />
      <mesh position={[-16, 5.9, -40]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[5.1, 5.1, 5.2]} />
        <meshStandardMaterial color="#6a4a3a" />
      </mesh>
      {/* the stressed patch glows */}
      {sick > 0.01 &&
        crops.pts.filter((p) => inPatch(p[0], p[2])).map((p, i) => <Glow key={i} pos={[p[0], 0.45, p[2]]} size={(0.9 + 0.1 * Math.sin(f * 0.2 + i)) * sick} color="#ffb030" opacity={0.7} />)}
      {sick > 0.01 && <pointLight position={[PATCH[0], 1.2, PATCH[2]]} intensity={8 * sick} distance={6} decay={1.5} color="#ffb030" />}
      <Particles
        count={40}
        seed={44}
        glow
        shape="dot"
        color="#fff2c8"
        at={(i, r) => ({pos: [(r() - 0.5) * 10 + Math.sin(f * 0.01 + i) * 0.5, 0.6 + r() * 2.5, -r() * 14 + 2], size: 0.05 * (0.5 + 0.5 * Math.sin(f * 0.1 + i))})}
      />
      <Flat s={person('farmer', 'hold', f >= B.crops ? 'awe' : 'happy')} pos={FARMER} h={1.75} />
      <Board p={[FARMER[0] + 0.01, 0.79, FARMER[2] + 0.04]} w={0.3} h={0.2} map={tex.map} />
    </>
  );
};
