// Flat inked characters in a 3D world: camera-facing planes that cast silhouette shadows.
import React, {createContext, useContext} from 'react';
import * as THREE from 'three';
import {drawCharacter, Expr, Look, Pose, toTexture} from './toon';
import {drawMythic, MythicExpr, MythicLook, MythicPose} from './mythic';

export type V3 = [number, number, number];

// The camera position for the current frame, so flat things can turn to face it.
export const CamCtx = createContext<THREE.Vector3>(new THREE.Vector3());
export const useCam = () => useContext(CamCtx);

export type Sprite = {tex: THREE.Texture; mat: THREE.MeshBasicMaterial; depth: THREE.MeshDepthMaterial};
const cache = new Map<string, Sprite>();

// One texture, material and shadow material per look, pose and expression; built once and reused.
export const sprite = (name: string, look: Look, pose: Pose, expr: Expr): Sprite =>
  canvasSprite(`${name}|${pose}|${expr}`, () => drawCharacter(look, pose, expr));

// The same for the mythology costume kit (mythic.ts): same canvas size, so Flat and crowds work unchanged.
export const mythicSprite = (name: string, look: MythicLook, pose: MythicPose, expr: MythicExpr): Sprite =>
  canvasSprite(`myth|${name}|${pose}|${expr}`, () => drawMythic(look, pose, expr));

// Any drawing, cached under a key. Drawings that are not 512 x 1024 (epic.ts) pass their `aspect` to Flat.
export const canvasSprite = (key: string, draw: () => HTMLCanvasElement): Sprite => {
  let s = cache.get(key);
  if (!s) {
    const tex = toTexture(draw());
    const mat = new THREE.MeshBasicMaterial({map: tex, alphaTest: 0.5, side: THREE.DoubleSide, toneMapped: false});
    const depth = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5});
    s = {tex, mat, depth};
    cache.set(key, s);
  }
  return s;
};

// Yaw to face the camera around the vertical axis, plus a lean back (up to maxTilt) when the camera is above.
// With `full`, the figure also tilts forward when seen from below (for figures in the air), so it never turns edge-on.
export const facing = (cam: THREE.Vector3, x: number, y: number, z: number, maxTilt = 0.6, full = false) => {
  const dx = cam.x - x;
  const dz = cam.z - z;
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.atan2(cam.y - y, Math.hypot(dx, dz));
  const tilt = full ? Math.max(-maxTilt, Math.min(maxTilt, pitch)) : Math.min(maxTilt, Math.max(0, pitch - 0.12));
  return {yaw, tilt};
};

const planes = new Map<string, THREE.PlaneGeometry>();
// A plane (1:2 unless `aspect`, width / height, says otherwise) with its bottom edge at y = 0, so characters stand on the ground.
export const standingPlane = (h: number, aspect = 0.5) => {
  const key = `${h}|${aspect}`;
  let g = planes.get(key);
  if (!g) {
    g = new THREE.PlaneGeometry(h * aspect, h);
    g.translate(0, h / 2, 0);
    planes.set(key, g);
  }
  return g;
};

type FlatProps = {
  s: Sprite;
  pos: V3;
  h: number;
  tint?: string;
  flip?: boolean;
  squash?: number; // 1 = normal; below 1 squashes down, above 1 stretches up
  bob?: number;
  maxTilt?: number;
  scale?: number; // uniform size change from the feet (growing, shrinking) without a new geometry
  roll?: number; // turn in the picture plane around the figure's middle, in radians (flying, falling)
  opacity?: number;
  airborne?: boolean; // face the camera from below too (see facing)
  aspect?: number; // width / height of the drawing; 0.5 for the standard figure
};

export const Flat: React.FC<FlatProps> = ({
  s, pos, h, tint = '#ffffff', flip = false, squash = 1, bob = 0, maxTilt = 0.6, scale = 1, roll = 0, opacity = 1, airborne = false, aspect = 0.5,
}) => {
  const cam = useCam();
  const mid = airborne ? h * scale * 0.5 : 0;
  const {yaw, tilt} = facing(cam, pos[0], pos[1] + mid, pos[2], maxTilt, airborne);
  const mat = React.useMemo(() => {
    const m = s.mat.clone();
    m.color.set(tint);
    if (opacity < 1) {
      m.transparent = true;
      m.opacity = opacity;
      m.alphaTest = 0.02;
      m.depthWrite = false;
    }
    return m;
  }, [s, tint, opacity]);
  const hs = h * scale;
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} rotation={[-tilt, yaw, 0, 'YXZ']}>
      <group position={[0, hs / 2, 0]} rotation={[0, 0, roll]}>
        <mesh
          position={[0, -hs / 2, 0]}
          geometry={standingPlane(h, aspect)}
          material={mat}
          scale={[(flip ? -1 : 1) * (1 / Math.sqrt(squash)) * scale, squash * scale, scale]}
          castShadow={opacity > 0.5}
          customDepthMaterial={s.depth}
        />
      </group>
    </group>
  );
};

// Many copies of the same flat character, drawn as one instanced mesh.
export const makeCrowdMesh = (s: Sprite, h: number, count: number, tint: string) => {
  const mat = s.mat.clone();
  mat.color.set(tint);
  const m = new THREE.InstancedMesh(standingPlane(h), mat, count);
  m.castShadow = true;
  m.customDepthMaterial = s.depth;
  m.frustumCulled = false;
  return m;
};

const tmpObj = new THREE.Object3D();
export const placeFlat = (
  m: THREE.InstancedMesh,
  i: number,
  cam: THREE.Vector3,
  x: number,
  y: number,
  z: number,
  visible: boolean,
  maxTilt = 1.15,
  sy = 1,
) => {
  const {yaw, tilt} = facing(cam, x, y, z, maxTilt);
  tmpObj.position.set(x, y, z);
  tmpObj.rotation.set(-tilt, yaw, 0, 'YXZ');
  const k = visible ? 1 : 0;
  tmpObj.scale.set(k, k * sy, k);
  tmpObj.updateMatrix();
  m.setMatrixAt(i, tmpObj.matrix);
};
