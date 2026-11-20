// The desk: a big monitor made of real pixels, a tiny worker, warm afternoon light.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, sprite, V3} from '../shared/flat';
import {
  glowTexture,
  keyboardTexture,
  Look,
  Picture,
  plasterTexture,
  samplePicture,
  signTexture,
  windowTexture,
  woodTexture,
} from '../shared/toon';
import {at} from './words';

export const deskWorker: Look = {suit: '#2f6fe0', suitDark: '#2456b0', hat: '#ffb21e', hatDark: '#e08e0a', paint: '#ffcf3a'};
const WORKER: V3 = [-0.45, 0, 2.3];

const COLS = 64;
const ROWS = 36;
const PITCH = 0.05;
const SCREEN_Y = 1.65;

const Glow: React.FC<{pos: V3; size: number; color: string; opacity?: number; tex: THREE.Texture}> = ({pos, size, color, opacity = 0.8, tex}) => (
  <sprite position={pos} scale={[size, size, 1]}>
    <spriteMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
  </sprite>
);

const pictureAt = (f: number): Picture => {
  if (f < at('games')) return 'landscape';
  if (f < at('video')) return 'game';
  if (f < at('AI')) return 'video';
  return 'ai';
};

export const DeskWorld: React.FC<{f: number}> = ({f}) => {
  const tex = useMemo(
    () => ({
      wood: woodTexture(),
      wall: plasterTexture('#d9b28a', 3),
      win: windowTexture(),
      keys: keyboardTexture(),
      sign: signTexture(),
      glow: glowTexture(),
      pics: {
        landscape: samplePicture('landscape', COLS, ROWS),
        game: samplePicture('game', COLS, ROWS),
        video: samplePicture('video', COLS, ROWS),
        ai: samplePicture('ai', COLS, ROWS),
        portrait: [] as THREE.Color[],
      },
    }),
    [],
  );

  // The screen: one small box per pixel, unlit so it reads as glowing.
  const screen = useMemo(() => {
    const geo = new THREE.BoxGeometry(PITCH * 0.86, PITCH * 0.86, 0.02);
    const mat = new THREE.MeshBasicMaterial({toneMapped: false});
    const m = new THREE.InstancedMesh(geo, mat, COLS * ROWS);
    const o = new THREE.Object3D();
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        o.position.set((c - (COLS - 1) / 2) * PITCH, SCREEN_Y + ((ROWS - 1) / 2 - r) * PITCH, 0.0);
        o.updateMatrix();
        m.setMatrixAt(r * COLS + c, o.matrix);
        m.setColorAt(r * COLS + c, new THREE.Color('#000000'));
      }
    m.frustumCulled = false;
    return m;
  }, []);

  // Colour the screen for this frame: the current picture plus a refresh band sweeping down.
  const pic = tex.pics[pictureAt(f)];
  const fast = f >= at('sixty') && f < 150;
  const period = fast ? 8 : 20;
  const band = ((f % period) / period) * (ROWS + 8) - 4;
  const switchFlash = [at('games'), at('video'), at('AI')].some((s) => f >= s && f < s + 3) ? 0.5 : 0;
  const col = new THREE.Color();
  for (let i = 0; i < COLS * ROWS; i++) {
    const r = Math.floor(i / COLS);
    const boost = Math.max(0, 1 - Math.abs(r - band) / 2.2) * 0.45 + switchFlash;
    col.copy(pic[i]).multiplyScalar(1.05);
    col.r += boost;
    col.g += boost;
    col.b += boost;
    screen.setColorAt(i, col);
  }
  screen.instanceColor!.needsUpdate = true;

  // The tiny worker: looks up in awe, then holds up the sign, then waves.
  const inSign = f >= 522 && f < 618;
  const inWave = f >= 618;
  const pose = inSign ? 'sign' : inWave ? 'wave' : 'lookUp';
  const expr = inSign || inWave ? 'happy' : f >= at('millions') ? 'awe' : 'calm';
  const s = sprite('desk', deskWorker, pose, expr);
  const bob = Math.abs(Math.sin(f * 0.25)) * 0.012;
  const signPop = inSign ? Math.min(1, Math.max(0, (f - 526) / 7)) : 0;
  const signScale = signPop < 1 ? signPop * 1.12 : 1 + Math.max(0, 0.06 - (f - 533) * 0.01);
  const signLift = Math.sin(f * 0.3) * 0.01;

  return (
    <>
      <color attach="background" args={['#2a1d17']} />
      <hemisphereLight args={['#bcd6ff', '#6b4a2c', 0.9]} />
      <directionalLight
        position={[-6, 7.5, 5]}
        intensity={2.8}
        color="#ffd6a6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight position={[-2.15, 2.05, 0.05]} intensity={9} distance={8} decay={1.5} color="#ffb060" />
      <pointLight position={[0, 1.6, 0.9]} intensity={3.2} distance={4} decay={1.5} color="#cfe2ff" />

      {/* Desk */}
      <mesh position={[0, -0.125, 4.0]} receiveShadow>
        <boxGeometry args={[11, 0.25, 12]} />
        <meshStandardMaterial map={tex.wood} roughness={0.55} />
      </mesh>
      {/* Wall, window and cork board */}
      <mesh position={[0, 3, -2.0]} receiveShadow>
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial map={tex.wall} roughness={0.95} />
      </mesh>
      <mesh position={[-3.4, 2.9, -1.98]}>
        <planeGeometry args={[1.7, 2.1]} />
        <meshBasicMaterial map={tex.win} toneMapped={false} />
      </mesh>
      <mesh position={[3.4, 3.0, -1.97]} receiveShadow>
        <boxGeometry args={[1.6, 1.1, 0.04]} />
        <meshStandardMaterial color="#b98a55" roughness={0.9} />
      </mesh>
      {[
        ['#ffe066', 3.0, 3.2, 0.1],
        ['#7ee0b8', 3.55, 3.25, -0.08],
        ['#ff9db5', 3.25, 2.75, 0.05],
        ['#9fc6ff', 3.85, 2.8, -0.12],
      ].map(([c, x, y, r], i) => (
        <mesh key={i} position={[x as number, y as number, -1.94]} rotation={[0, 0, r as number]} castShadow>
          <boxGeometry args={[0.36, 0.36, 0.01]} />
          <meshStandardMaterial color={c as string} roughness={0.8} />
        </mesh>
      ))}

      {/* Monitor */}
      <mesh position={[0, SCREEN_Y, -0.07]} castShadow receiveShadow>
        <boxGeometry args={[3.42, 2.02, 0.12]} />
        <meshStandardMaterial color="#1b1e26" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, SCREEN_Y, -0.004]}>
        <planeGeometry args={[3.24, 1.84]} />
        <meshBasicMaterial color="#05060a" />
      </mesh>
      <primitive object={screen} />
      <mesh position={[0, 0.38, -0.25]} castShadow>
        <boxGeometry args={[0.28, 0.76, 0.12]} />
        <meshStandardMaterial color="#2a2e38" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.03, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.06, 0.62]} />
        <meshStandardMaterial color="#2a2e38" roughness={0.4} metalness={0.3} />
      </mesh>
      <Glow pos={[0, SCREEN_Y, 0.3]} size={5.5} color="#9cc6ff" opacity={0.18} tex={tex.glow} />

      {/* Keyboard */}
      <mesh position={[0.25, 0.04, 1.55]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 0.8]} />
        <meshStandardMaterial color="#2b2f3a" roughness={0.6} />
      </mesh>
      <mesh position={[0.25, 0.082, 1.55]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.36, 0.76]} />
        <meshStandardMaterial map={tex.keys} roughness={0.6} />
      </mesh>

      {/* Mug */}
      <mesh position={[2.0, 0.32, 1.0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.26, 0.64, 32]} />
        <meshStandardMaterial color="#e8572f" roughness={0.45} />
      </mesh>
      <mesh position={[2.0, 0.645, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 32]} />
        <meshStandardMaterial color="#4a2a17" roughness={0.2} />
      </mesh>
      <mesh position={[2.3, 0.34, 1.0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.13, 0.04, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#e8572f" roughness={0.45} />
      </mesh>

      {/* Desk lamp */}
      <mesh position={[-2.6, 0.04, -0.7]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.08, 32]} />
        <meshStandardMaterial color="#1f2a44" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[-2.6, 1.05, -0.62]} rotation={[0.12, 0, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 2.0, 12]} />
        <meshStandardMaterial color="#1f2a44" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[-2.35, 2.12, -0.25]} rotation={[0.2, 0, -0.95]} castShadow>
        <coneGeometry args={[0.32, 0.45, 32, 1, true]} />
        <meshStandardMaterial color="#1f2a44" roughness={0.4} metalness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-2.2, 2.03, -0.18]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshBasicMaterial color="#fff1c8" toneMapped={false} />
      </mesh>
      <Glow pos={[-2.2, 2.03, -0.16]} size={1.6} color="#ffbe6b" opacity={0.85} tex={tex.glow} />

      {/* PC tower with an LED strip */}
      <mesh position={[3.35, 1.15, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 2.3, 2.2]} />
        <meshStandardMaterial color="#23262f" roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[3.35, 1.15, 0.51]}>
        <boxGeometry args={[0.06, 2.0, 0.02]} />
        <meshBasicMaterial color="#5ff0b8" toneMapped={false} />
      </mesh>
      <Glow pos={[3.35, 1.15, 0.56]} size={1.2} color="#3ddc97" opacity={0.6} tex={tex.glow} />

      {/* Tiny worker, and the sign in the "stands for" shot */}
      <Flat s={s} pos={[WORKER[0], WORKER[1], WORKER[2]]} h={0.56} bob={bob} tint="#fff4e8" />
      {inSign && (
        <group position={[WORKER[0], 0.55 + signLift, WORKER[2] + 0.03]} scale={[signScale, signScale, signScale]}>
          <mesh position={[0, 0.27, 0]} rotation={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.86, 0.54, 0.02]} />
            <meshBasicMaterial attach="material-4" map={tex.sign} toneMapped={false} />
            <meshStandardMaterial attach="material-0" color="#e9dcc0" />
            <meshStandardMaterial attach="material-1" color="#e9dcc0" />
            <meshStandardMaterial attach="material-2" color="#e9dcc0" />
            <meshStandardMaterial attach="material-3" color="#e9dcc0" />
            <meshStandardMaterial attach="material-5" color="#c9b48f" />
          </mesh>
        </group>
      )}
    </>
  );
};
