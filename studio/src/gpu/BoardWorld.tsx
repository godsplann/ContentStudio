// Inside the computer: a motherboard city with the CPU (four big workers) and the GPU (a crowd of tiny ones).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {makeCrowdMesh, placeFlat, sprite, Flat, useCam, V3} from '../shared/flat';
import {chipTopTexture, FONT, glowTexture, INK, Look, paperTexture, pcbTexture, rng, samplePicture, toTexture} from '../shared/toon';
import {at} from './words';

// ---------- Layout ----------
const CPU_TOP = 0.86;
const C_COLS = 8;
const C_ROWS = 12;
const C_PITCH = 0.4;
const C_Z0 = -2.4; // back row centre

export const GPU_X = 30;
const GPU_TOP = 0.62;
const G_COLS = 28;
const G_ROWS = 40;
const G_PITCH = 0.3;

const coreLooks: Look[] = [
  {suit: '#e8572f', suitDark: '#b8401f', hat: '#ffd23a', hatDark: '#e0a90a', label: 'CORE 1'},
  {suit: '#2f9e6b', suitDark: '#217a51', hat: '#ffd23a', hatDark: '#e0a90a', label: 'CORE 2'},
  {suit: '#7a4fd6', suitDark: '#5c38ad', hat: '#ffd23a', hatDark: '#e0a90a', label: 'CORE 3'},
  {suit: '#d63d7a', suitDark: '#a82c5e', hat: '#ffd23a', hatDark: '#e0a90a', label: 'CORE 4'},
];
const tinyLook: Look = {suit: '#1d6fe0', suitDark: '#1655b5', hat: '#ffd23a', hatDark: '#e0a90a'};

const labelTexture = (text: string, color: string) => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 300;
  const g = c.getContext('2d')!;
  g.font = `700 240px "${FONT}"`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = 18;
  g.strokeStyle = INK;
  g.strokeText(text, 512, 160);
  g.fillStyle = color;
  g.fillText(text, 512, 160);
  return toTexture(c);
};

// The far wall of the computer case: dark blue above, a teal and violet glow low down, with vent slots.
const backdropTexture = () => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d')!;
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, '#0e1a38');
  grd.addColorStop(0.55, '#1b3570');
  grd.addColorStop(0.8, '#2f6d8f');
  grd.addColorStop(1, '#4a3d7a');
  g.fillStyle = grd;
  g.fillRect(0, 0, 1024, 512);
  g.fillStyle = 'rgba(5,10,25,0.35)';
  for (let x = 40; x < 1024; x += 36) g.fillRect(x, 60, 16, 180);
  return toTexture(c);
};

const Glow: React.FC<{pos: V3; size: number; color: string; opacity?: number; tex: THREE.Texture}> = ({pos, size, color, opacity = 0.8, tex}) => (
  <sprite position={pos} scale={[size, size, 1]}>
    <spriteMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
  </sprite>
);

// ---------- The CPU's work plan: each core paints its own 3 columns, one tile after another ----------
const STEP = 9; // frames per tile
const paintStart = () => at('A', 7) + 8; // a beat after "A CPU"
const coreOrder = (k: number) => {
  const tiles: [number, number][] = [];
  for (let r = C_ROWS - 1; r >= 0; r--) {
    const cols = [2 * k, 2 * k + 1];
    if ((C_ROWS - 1 - r) % 2 === 1) cols.reverse();
    for (const c of cols) tiles.push([c, r]);
  }
  return tiles;
};
const tileCentre = (c: number, r: number): V3 => [(c - (C_COLS - 1) / 2) * C_PITCH, CPU_TOP, C_Z0 + r * C_PITCH];

const coreState = (k: number, f: number) => {
  const lineUp: V3 = [-1.55 + k * 0.85, CPU_TOP, 2.55];
  const order = coreOrder(k);
  const start = paintStart();
  const standAt = (t: [number, number]): V3 => {
    const p = tileCentre(t[0], t[1]);
    return [p[0] + 0.05, CPU_TOP, p[2] + 0.26];
  };
  if (f < start - 14) return {pos: lineUp, pose: 'lookUp' as const, done: 0, walking: false};
  if (f < start) {
    const u = (f - (start - 14)) / 14;
    const e = u * u * (3 - 2 * u);
    const a = lineUp;
    const b = standAt(order[0]);
    return {pos: [a[0] + (b[0] - a[0]) * e, CPU_TOP, a[2] + (b[2] - a[2]) * e] as V3, pose: 'brushUp' as const, done: 0, walking: true};
  }
  const n = Math.floor((f - start) / STEP);
  const u = ((f - start) % STEP) / STEP;
  const cur = order[Math.min(n, order.length - 1)];
  const prev = order[Math.max(0, Math.min(n - 1, order.length - 1))];
  let pos = standAt(cur);
  let walking = false;
  if (n > 0 && u < 0.35) {
    const e = u / 0.35;
    const a = standAt(prev);
    pos = [a[0] + (pos[0] - a[0]) * e, CPU_TOP, a[2] + (pos[2] - a[2]) * e];
    walking = true;
  }
  const painting = u >= 0.35 && u < 0.85;
  const done = Math.min(order.length, n + (u >= 0.7 ? 1 : 0));
  return {pos, pose: painting ? ('brushDown' as const) : ('brushUp' as const), done, walking};
};

// ---------- Paper tower: "too much math" ----------
const SHEETS = 64;
const TOWER: V3 = [1.78, CPU_TOP, 2.42];
const sheetPlan = (() => {
  const r = rng(21);
  return Array.from({length: SHEETS}, (_, i) => ({
    jx: (r() - 0.5) * 0.12,
    jz: (r() - 0.5) * 0.12,
    ry: (r() - 0.5) * 0.5,
    vx: 0.5 + r() * 2.2,
    vy: 1.0 + r() * 2.5,
    vz: 0.2 + r() * 2.0,
    spin: (r() - 0.5) * 9,
    flip: (r() - 0.5) * 6,
    y0: CPU_TOP + 0.03 + i * 0.05,
  }));
})();

export const BoardWorld: React.FC<{f: number}> = ({f}) => {
  const cam = useCam();
  const tex = useMemo(
    () => ({
      pcb: pcbTexture(),
      cpuTop: chipTopTexture('', ''),
      gpuTop: chipTopTexture('', ''),
      paper: paperTexture(4),
      glow: glowTexture(),
      cpuLabel: labelTexture('CPU', '#ffd23a'),
      backdrop: backdropTexture(),
      gpuLabel: labelTexture('GPU', '#5fd0ff'),
    }),
    [],
  );

  // CPU floor tiles: dark until a core paints them.
  const cpuPic = useMemo(() => samplePicture('portrait', C_COLS, C_ROWS), []);
  const cpuTiles = useMemo(() => {
    const geo = new THREE.BoxGeometry(C_PITCH * 0.88, 0.03, C_PITCH * 0.88);
    const dark = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({color: '#2a3140', roughness: 0.5}), C_COLS * C_ROWS);
    const lit = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({toneMapped: false}), C_COLS * C_ROWS);
    dark.receiveShadow = true;
    for (let i = 0; i < C_COLS * C_ROWS; i++) lit.setColorAt(i, cpuPic[i]);
    dark.frustumCulled = lit.frustumCulled = false;
    return {dark, lit};
  }, [cpuPic]);
  const cores = [0, 1, 2, 3].map((k) => coreState(k, f));
  const paintedCpu = new Set<number>();
  cores.forEach((s, k) => coreOrder(k).slice(0, s.done).forEach(([c, r]) => paintedCpu.add(r * C_COLS + c)));
  {
    const o = new THREE.Object3D();
    for (let r = 0; r < C_ROWS; r++)
      for (let c = 0; c < C_COLS; c++) {
        const i = r * C_COLS + c;
        const p = tileCentre(c, r);
        const on = paintedCpu.has(i);
        o.position.set(p[0], p[1] + 0.015, p[2]);
        o.scale.setScalar(on ? 0 : 1);
        o.updateMatrix();
        cpuTiles.dark.setMatrixAt(i, o.matrix);
        o.scale.setScalar(on ? 1 : 0);
        o.updateMatrix();
        cpuTiles.lit.setMatrixAt(i, o.matrix);
      }
    cpuTiles.dark.instanceMatrix.needsUpdate = true;
    cpuTiles.lit.instanceMatrix.needsUpdate = true;
  }

  // Paper tower: sways, then topples on "alone".
  const papers = useMemo(() => {
    const m = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.72, 0.035, 0.92),
      [
        new THREE.MeshStandardMaterial({color: '#f3f0e6', emissive: '#4a4a55'}),
        new THREE.MeshStandardMaterial({color: '#f3f0e6', emissive: '#4a4a55'}),
        new THREE.MeshStandardMaterial({map: tex.paper, emissive: '#3a3a44'}),
        new THREE.MeshStandardMaterial({color: '#e9e5d8', emissive: '#4a4a55'}),
        new THREE.MeshStandardMaterial({color: '#f3f0e6', emissive: '#4a4a55'}),
        new THREE.MeshStandardMaterial({color: '#f3f0e6', emissive: '#4a4a55'}),
      ],
      SHEETS,
    );
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, [tex.paper]);
  {
    const fall = at('alone');
    const o = new THREE.Object3D();
    const sway = f < fall ? Math.sin(f * 0.22) * 0.025 * Math.min(1, (f - 150) / 30 + 0.3) : 0;
    sheetPlan.forEach((s, i) => {
      const hgt = s.y0 - TOWER[1];
      if (f < fall) {
        o.position.set(TOWER[0] + s.jx + Math.sin(sway) * hgt, s.y0, TOWER[2] + s.jz);
        o.rotation.set(0, s.ry, -sway);
      } else {
        const t = (f - fall) / 30;
        const k = 0.35 + (i / SHEETS) * 0.9;
        let x = TOWER[0] + s.jx + s.vx * k * t;
        let z = TOWER[2] + s.jz + s.vz * k * t;
        let y = s.y0 + s.vy * k * t - 4.9 * t * t;
        const onChip = Math.abs(x) < 3.0 && Math.abs(z) < 3.0;
        const floor = (onChip ? CPU_TOP : 0) + 0.02 + (i % 6) * 0.012;
        const landed = y <= floor;
        if (landed) y = floor;
        o.position.set(x, y, z);
        if (landed) o.rotation.set(0, s.ry + s.spin * 0.3, 0);
        else o.rotation.set(s.flip * t, s.ry + s.spin * t, s.flip * 0.5 * t);
      }
      o.updateMatrix();
      papers.setMatrixAt(i, o.matrix);
    });
    papers.instanceMatrix.needsUpdate = true;
  }

  // GPU floor tiles and its crowd of tiny cores, one per tile.
  const gpuPic = useMemo(() => samplePicture('portrait', G_COLS, G_ROWS), []);
  const gpu = useMemo(() => {
    const n = G_COLS * G_ROWS;
    const geo = new THREE.BoxGeometry(G_PITCH * 0.86, 0.03, G_PITCH * 0.86);
    const dark = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({color: '#2a3140', roughness: 0.5}), n);
    const lit = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({toneMapped: false}), n);
    dark.receiveShadow = true;
    for (let i = 0; i < n; i++) lit.setColorAt(i, gpuPic[i]);
    dark.frustumCulled = lit.frustumCulled = false;
    const r = rng(9);
    const jitter = Array.from({length: n}, () => Math.floor(r() * 4));
    const phase = Array.from({length: n}, () => r() * Math.PI * 2);
    const h = 0.3;
    const up = makeCrowdMesh(sprite('tiny', tinyLook, 'brushUp', 'focused'), h, n, '#e8eeff');
    const down = makeCrowdMesh(sprite('tiny', tinyLook, 'brushDown', 'focused'), h, n, '#e8eeff');
    const happy = makeCrowdMesh(sprite('tiny', tinyLook, 'idle', 'happy'), h, n, '#e8eeff');
    return {dark, lit, jitter, phase, up, down, happy};
  }, [gpuPic]);
  {
    const go = at('all', 15);
    const o = new THREE.Object3D();
    const showCrowd = f >= 360;
    for (let r = 0; r < G_ROWS; r++)
      for (let c = 0; c < G_COLS; c++) {
        const i = r * G_COLS + c;
        const x = GPU_X + (c - (G_COLS - 1) / 2) * G_PITCH;
        const z = (r - (G_ROWS - 1) / 2) * G_PITCH;
        const start = go + gpu.jitter[i];
        const on = f >= start + 4;
        o.position.set(x, GPU_TOP + 0.015, z);
        o.scale.setScalar(on ? 0 : 1);
        o.updateMatrix();
        gpu.dark.setMatrixAt(i, o.matrix);
        o.scale.setScalar(on ? 1 : 0);
        o.updateMatrix();
        gpu.lit.setMatrixAt(i, o.matrix);
        const painting = f >= start && f < start + 8;
        const finished = f >= start + 8;
        const bob = finished ? Math.abs(Math.sin(f * 0.35 + gpu.phase[i])) * 0.03 : Math.sin(f * 0.18 + gpu.phase[i]) * 0.008;
        const wx = x + 0.04;
        const wz = z + 0.13;
        placeFlat(gpu.up, i, cam, wx, GPU_TOP + bob, wz, showCrowd && !painting && !finished);
        placeFlat(gpu.down, i, cam, wx, GPU_TOP + bob, wz, showCrowd && painting);
        placeFlat(gpu.happy, i, cam, wx, GPU_TOP + bob, wz, showCrowd && finished);
      }
    for (const m of [gpu.dark, gpu.lit, gpu.up, gpu.down, gpu.happy]) m.instanceMatrix.needsUpdate = true;
  }

  // Props scattered on the board: capacitors, small chips, RAM sticks.
  const props = useMemo(() => {
    const r = rng(33);
    const caps: V3[] = [];
    while (caps.length < 26) {
      const x = -14 + r() * 58;
      const z = -14 + r() * 26;
      const nearCpu = Math.abs(x) < 5.5 && Math.abs(z) < 5.5;
      const nearGpu = Math.abs(x - GPU_X) < 7.5 && Math.abs(z) < 9;
      const ram = x < -4 && x > -9 && Math.abs(z) < 5;
      const path = z > 3 && z < 14 && x > -2 && x < 34; // keep the camera paths clear
      if (!nearCpu && !nearGpu && !ram && !path) caps.push([x, 0, z]);
    }
    const chips: V3[] = [];
    while (chips.length < 14) {
      const x = -12 + r() * 52;
      const z = -12 + r() * 22;
      if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;
      if (Math.abs(x - GPU_X) < 8 && Math.abs(z) < 9.5) continue;
      if (z > 3 && x > -2 && x < 34) continue;
      chips.push([x, 0, z]);
    }
    return {caps, chips};
  }, []);

  const focusX = f >= at('A', 12) + 4 ? GPU_X : 0;
  const motes = useMemo(() => {
    const r = rng(77);
    const n = 260;
    const base = Array.from({length: n}, () => [r() * 16 - 8, r() * 6 + 0.5, r() * 16 - 8, r() * 6.28]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({size: 0.05, color: '#ffe2b0', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false}),
    );
    pts.frustumCulled = false;
    return {pts, base};
  }, []);
  {
    const arr = motes.pts.geometry.getAttribute('position') as THREE.BufferAttribute;
    motes.base.forEach((b, i) => {
      arr.setXYZ(i, focusX + b[0] + Math.sin(f * 0.02 + b[3]) * 0.4, b[1] + ((f * 0.006 + b[3]) % 1.5), b[2] + Math.cos(f * 0.017 + b[3]) * 0.4);
    });
    arr.needsUpdate = true;
  }

  const coreExpr = f < at('A', 7) ? 'strain' : 'focused';

  return (
    <>
      <color attach="background" args={['#13244a']} />
      <fog attach="fog" args={['#13244a', 26, 70]} />
      <mesh position={[12, 14, -30]}>
        <planeGeometry args={[140, 40]} />
        <meshBasicMaterial map={tex.backdrop} fog={false} toneMapped={false} />
      </mesh>
      <hemisphereLight args={['#9fbcff', '#1d4a33', 1.15]} />
      <directionalLight
        position={[focusX - 7, 11, 8]}
        intensity={2.6}
        color="#ffd7a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      >
        <object3D attach="target" position={[focusX, 0, 0]} />
      </directionalLight>
      <pointLight position={[-6.5, 3.2, 0]} intensity={14} distance={10} decay={1.5} color="#ff4fd8" />
      <pointLight position={[GPU_X + 6, 3, -4]} intensity={14} distance={12} decay={1.5} color="#38e8ff" />

      {/* Motherboard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 130]} />
        <meshStandardMaterial map={tex.pcb} roughness={0.65} />
      </mesh>

      {/* CPU: socket, package, metal lid, label */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.4, 0.3, 7.4]} />
        <meshStandardMaterial color="#3a3f4b" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.6, 0.4, 6.6]} />
        <meshStandardMaterial color="#1f6b3f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.0, 0.16, 6.0]} />
        <meshStandardMaterial attach="material-2" map={tex.cpuTop} roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-0" color="#a7aebb" roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-1" color="#a7aebb" roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-3" color="#a7aebb" roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-4" color="#a7aebb" roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-5" color="#a7aebb" roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, CPU_TOP + 0.005, -2.78]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 0.5]} />
        <meshBasicMaterial map={tex.cpuLabel} transparent toneMapped={false} />
      </mesh>
      <primitive object={cpuTiles.dark} />
      <primitive object={cpuTiles.lit} />
      <primitive object={papers} />
      {cores.map((s, k) => (
        <Flat
          key={k}
          s={sprite(`core${k}`, coreLooks[k], s.pose, coreExpr)}
          pos={s.pos}
          h={0.95}
          tint="#eef0ff"
          bob={s.walking ? Math.abs(Math.sin(f * 0.9 + k)) * 0.05 : Math.sin(f * 0.15 + k) * 0.008}
          maxTilt={0.95}
        />
      ))}

      {/* RAM sticks with LED tops */}
      {[-8.2, -7.2, -6.2, -5.2].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 1.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.32, 2.6, 7.2]} />
            <meshStandardMaterial color={i % 2 ? '#262b3a' : '#1e2433'} roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[x, 2.64, 0]}>
            <boxGeometry args={[0.2, 0.08, 7.0]} />
            <meshBasicMaterial color={i % 2 ? '#ff6fe0' : '#7ff0ff'} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <Glow pos={[-6.7, 2.9, 0]} size={4} color="#ff6fe0" opacity={0.35} tex={tex.glow} />

      {/* Capacitors and small chips */}
      {props.caps.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.38, 1.2, 24]} />
            <meshStandardMaterial color={i % 3 ? '#2b2f3a' : '#3a2b52'} roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[0, 1.205, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.36, 24]} />
            <meshStandardMaterial color="#c9ced8" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0.18, 0.6, 0.3]} castShadow>
            <boxGeometry args={[0.08, 1.15, 0.08]} />
            <meshStandardMaterial color="#d8dce4" />
          </mesh>
        </group>
      ))}
      {props.chips.map((p, i) => (
        <mesh key={i} position={[p[0], 0.18, p[2]]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.36, 1.0]} />
          <meshStandardMaterial color="#14161c" roughness={0.5} />
        </mesh>
      ))}

      {/* GPU: package, lid, memory chips, label */}
      <mesh position={[GPU_X, 0.2, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[11, 0.4, 15.5]} />
        <meshStandardMaterial color="#1f6b3f" roughness={0.6} />
      </mesh>
      <mesh position={[GPU_X, 0.5, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[9.2, 0.24, 14]} />
        <meshStandardMaterial attach="material-2" map={tex.gpuTop} roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-0" color="#a7aebb" roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-1" color="#a7aebb" roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-3" color="#a7aebb" roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-4" color="#a7aebb" roughness={0.35} metalness={0.55} />
        <meshStandardMaterial attach="material-5" color="#a7aebb" roughness={0.35} metalness={0.55} />
      </mesh>
      {[-5, 5].flatMap((dx) =>
        [-5, -1.6, 1.8, 5.2].map((z) => (
          <mesh key={`${dx}${z}`} position={[GPU_X + dx * 1.04, 0.55, z]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.3, 1.4]} />
            <meshStandardMaterial color="#14161c" roughness={0.5} />
          </mesh>
        )),
      )}
      <mesh position={[GPU_X, GPU_TOP + 0.005, 6.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 0.88]} />
        <meshBasicMaterial map={tex.gpuLabel} transparent toneMapped={false} />
      </mesh>
      <primitive object={gpu.dark} />
      <primitive object={gpu.lit} />
      <primitive object={gpu.up} />
      <primitive object={gpu.down} />
      <primitive object={gpu.happy} />

      <primitive object={motes.pts} />
    </>
  );
};
