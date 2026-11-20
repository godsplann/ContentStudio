// Small building blocks for sets: boxes, cylinders, picture boards and a key light that follows the action.
// They keep world files short; every piece casts and receives shadows unless told not to.
import React from 'react';
import * as THREE from 'three';
import type {V3} from './flat';

type Mat = {c?: string; map?: THREE.Texture; rough?: number; metal?: number; emissive?: string; ei?: number; basic?: boolean; opacity?: number};

const Material: React.FC<Mat> = ({c = '#ffffff', map, rough = 0.8, metal = 0, emissive, ei = 1, basic, opacity}) =>
  basic ? (
    <meshBasicMaterial color={c} map={map ?? null} toneMapped={false} transparent={opacity !== undefined} opacity={opacity ?? 1} />
  ) : (
    <meshStandardMaterial
      color={c}
      map={map ?? null}
      roughness={rough}
      metalness={metal}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissive ? ei : 0}
      transparent={opacity !== undefined}
      opacity={opacity ?? 1}
    />
  );

export const Box: React.FC<{p: V3; s: V3; r?: V3; shadow?: boolean} & Mat> = ({p, s, r = [0, 0, 0], shadow = true, ...m}) => (
  <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
    <Material {...m} />
  </mesh>
);

export const Cyl: React.FC<{p: V3; rt: number; rb?: number; h: number; r?: V3; seg?: number; shadow?: boolean} & Mat> = ({p, rt, rb, h, r = [0, 0, 0], seg = 32, shadow = true, ...m}) => (
  <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
    <cylinderGeometry args={[rt, rb ?? rt, h, seg]} />
    <Material {...m} />
  </mesh>
);

export const Ball: React.FC<{p: V3; rad: number; sc?: V3; shadow?: boolean} & Mat> = ({p, rad, sc = [1, 1, 1], shadow = true, ...m}) => (
  <mesh position={p} scale={sc} castShadow={shadow} receiveShadow>
    <sphereGeometry args={[rad, 32, 20]} />
    <Material {...m} />
  </mesh>
);

// A flat picture: signs, screens, posters. Unlit by default so lettering stays readable.
export const Board: React.FC<{p: V3; w: number; h: number; map: THREE.Texture; r?: V3; lit?: boolean; opacity?: number}> = ({p, w, h, map, r = [0, 0, 0], lit = false, opacity}) => (
  <mesh position={p} rotation={r} receiveShadow={lit}>
    <planeGeometry args={[w, h]} />
    {lit ? (
      <meshStandardMaterial map={map} roughness={0.85} transparent={opacity !== undefined} opacity={opacity ?? 1} />
    ) : (
      <meshBasicMaterial map={map} toneMapped={false} transparent={opacity !== undefined} opacity={opacity ?? 1} />
    )}
  </mesh>
);

// The one shadow-casting key light, placed relative to the area being filmed so big worlds keep sharp shadows.
export const KeyLight: React.FC<{focus: V3; dir: V3; color: string; intensity: number; size?: number}> = ({focus, dir, color, intensity, size = 9}) => {
  const target = React.useMemo(() => new THREE.Object3D(), []);
  target.position.set(focus[0], 0, focus[2]);
  target.updateMatrixWorld();
  return (
    <>
      <primitive object={target} />
      <directionalLight
        position={[focus[0] + dir[0], dir[1], focus[2] + dir[2]]}
        target={target}
        intensity={intensity}
        color={color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-size}
        shadow-camera-right={size}
        shadow-camera-top={size}
        shadow-camera-bottom={-size}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </>
  );
};
