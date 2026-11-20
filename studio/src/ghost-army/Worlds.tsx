// The two places of the Ghost Army story, each a fully lit 3D world with the ground at y = 0. Figures are flat
// stickers that face the camera. The field changes from day to night to morning to dusk with lightAt(f).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, makeCrowdMesh, placeFlat, useCam, V3} from '../shared/flat';
import {clamp01, ramp} from '../shared/camera';
import {DustBurst, Glow, Particles, SkyDome} from '../shared/fx';
import {Board, Box, Cyl, KeyLight} from '../shared/kit';
import {cloudTexture, earthTexture, foliageTexture, grassTexture, barkTexture, skyTexture} from '../shared/nature';
import {cachedTexture, canvasCloth, CORAL, crateTexture, BEBAS} from '../shared/print';
import {rng, INK} from '../shared/toon';
import {B, s} from './beats';
import {person} from './cast';
import {jiggle, springOut, Tank} from './tank';
import {
  BAG, CC, COMPRESSOR, CR, CRATE, CRATE_RY, DIV, LIFT_RY, VALVE, dozerAngle, GENERAL, GI_H, HANDS, HOLDERS, inflateAt, LANE_Z, LIFT, lightAt, OAK,
  planeAt, realTankX, RING_TANKS, ringTankPos, riderAt, ROAD_Z, TABLE, TABLE_TOP, TOWN_LIGHT, tracksDone, TRUCKS, CAFE_Z,
} from './story';

const H = 1.75;
const ryFor = (dx: number, dz: number) => Math.atan2(-dz, dx); // turn a +x-facing model to face (dx, dz)

// ---------- Shared pieces ----------

const skyCache = new Map<string, THREE.Texture>();
const Sky: React.FC<{stops: [number, string][]}> = ({stops}) => {
  const cam = useCam();
  const key = stops.map((x) => x[1]).join('');
  let tex = skyCache.get(key);
  if (!tex) {
    tex = skyTexture(stops);
    skyCache.set(key, tex);
  }
  return <SkyDome tex={tex} center={[cam.x, cam.y, cam.z]} radius={600} />;
};

const Clouds: React.FC<{f: number; tint: string; speed?: number; opacity?: number}> = ({f, tint, speed = 0.03, opacity = 0.85}) => {
  const tex = useMemo(() => cloudTexture(), []);
  return (
    <>
      {[
        [-200, 90, -380, 200],
        [130, 110, -420, 230],
        [320, 80, -260, 170],
        [-360, 95, 60, 210],
        [40, 120, 300, 220],
      ].map(([x, y, z, w], i) => (
        <sprite key={i} position={[((x + f * speed * (i + 1) + 500) % 1000) - 500, y, z]} scale={[w, w * 0.4, 1]}>
          <spriteMaterial map={tex} color={tint} transparent opacity={opacity} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </>
  );
};

// Stars on a dome and a moon that rises across the night; both fade in with `night`.
const NightSky: React.FC<{f: number; night: number}> = ({f, night}) => {
  const cam = useCam();
  if (night < 0.05) return null;
  const spin = (f - s(14)) * 0.0009;
  const moonU = clamp01((f - s(14.6)) / (s(25.2) - s(14.6)));
  const ma = -0.4 + moonU * 2.2;
  const moon: V3 = [cam.x + Math.cos(ma) * 300, cam.y + 40 + Math.sin(moonU * Math.PI) * 160, cam.z - 280 + Math.sin(ma) * 80];
  return (
    <>
      <Particles
        count={260}
        seed={41}
        glow
        shape="dot"
        color="#dfe8ff"
        at={(i, r) => {
          const a = r() * Math.PI * 2 + spin;
          const e = 0.08 + r() * 1.3;
          const tw = 0.7 + 0.3 * Math.sin(f * 0.2 + i);
          return {pos: [cam.x + Math.cos(a) * Math.cos(e) * 400, cam.y + Math.sin(e) * 400, cam.z + Math.sin(a) * Math.cos(e) * 400], size: (1.6 + r() * 3.2) * night * tw};
        }}
      />
      <mesh position={moon}>
        <sphereGeometry args={[9, 24, 16]} />
        <meshBasicMaterial color="#fff6dc" toneMapped={false} fog={false} transparent opacity={night} />
      </mesh>
      <Glow pos={moon} size={70} color="#cfdcff" opacity={0.5 * night} />
    </>
  );
};

// A crate: wood on every side, a stencil on the front.
export const Crate: React.FC<{p: V3; s?: V3; stencil?: string; color?: string; seed?: number; ry?: number}> = ({p, s: size = [0.9, 0.55, 0.6], stencil = '', color, seed = 1, ry = 0}) => {
  const plain = crateTexture('', undefined, seed);
  const front = crateTexture(stencil, color, seed);
  const mats = useMemo(() => [plain, plain, plain, plain, front, plain].map((m) => new THREE.MeshStandardMaterial({map: m, roughness: 0.85})), [plain, front]);
  return (
    <mesh position={[p[0], p[1] + size[1] / 2, p[2]]} rotation={[0, ry, 0]} material={mats} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
};

// A bush of the hedgerow, or the crown of a tree: a lumpy cluster of textured balls.
const Bush: React.FC<{p: V3; r: number; tex: THREE.Texture; seed: number; sway?: number}> = ({p, r, tex, seed, sway = 0}) => {
  const rr = rng(seed);
  const balls = Array.from({length: 4}).map(() => [(rr() - 0.5) * r * 1.4, r * (0.6 + rr() * 0.5), (rr() - 0.5) * r * 1.0, r * (0.6 + rr() * 0.45)]);
  return (
    <group position={[p[0] + sway, p[1], p[2]]}>
      {balls.map(([x, y, z, rad], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <sphereGeometry args={[rad, 14, 10]} />
          <meshStandardMaterial map={tex} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
};

const Oak: React.FC<{p: V3; tex: THREE.Texture; bark: THREE.Texture; f: number; scale?: number}> = ({p, tex, bark, f, scale = 1}) => (
  <group position={p} scale={scale}>
    <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.28, 0.42, 3.6, 12]} />
      <meshStandardMaterial map={bark} roughness={1} />
    </mesh>
    <Bush p={[0, 2.6, 0]} r={2.3} tex={tex} seed={7} sway={Math.sin(f * 0.04) * 0.05} />
    <Bush p={[1.2, 3.4, 0.4]} r={1.6} tex={tex} seed={8} sway={Math.sin(f * 0.05 + 1) * 0.06} />
  </group>
);

// Hedgerows around the field (the Normandy bocage), with a gap where the lane runs through.
const Hedges: React.FC<{tex: THREE.Texture}> = ({tex}) => {
  const items = useMemo(() => {
    const out: [number, number, number, number][] = [];
    const r = rng(5);
    for (let x = -34; x <= 34; x += 2.6) {
      out.push([x, -30 + r() * 0.6, 1.5 + r() * 0.7, 100 + out.length]);
      if (Math.abs(x) > 4) out.push([x, 24 + r() * 0.6, 1.4 + r() * 0.6, 100 + out.length]);
    }
    for (let z = -28; z <= 23; z += 2.6) {
      if (Math.abs(z - LANE_Z) > 2.5) {
        out.push([-35 + r() * 0.6, z, 1.5 + r() * 0.7, 100 + out.length]);
        out.push([35 + r() * 0.6, z, 1.5 + r() * 0.7, 100 + out.length]);
      }
    }
    return out;
  }, []);
  return (
    <>
      {items.map(([x, z, rad, seed]) => (
        <Bush key={seed} p={[x, 0, z]} r={rad} tex={tex} seed={seed} />
      ))}
    </>
  );
};

// A bicycle seen from the side, along x: two wheels, the frame, the saddle and the bars.
const Bicycle: React.FC<{p: V3; spin: number}> = ({p, spin}) => (
  <group position={p}>
    {[-0.55, 0.55].map((x, i) => (
      <group key={i} position={[x, 0.36, 0]} rotation={[0, 0, spin]}>
        <mesh castShadow>
          <torusGeometry args={[0.34, 0.03, 8, 28]} />
          <meshStandardMaterial color="#1e1e22" roughness={0.5} />
        </mesh>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} rotation={[0, 0, (k * Math.PI) / 4]}>
            <boxGeometry args={[0.66, 0.01, 0.01]} />
            <meshStandardMaterial color="#c8ccd2" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
    ))}
    <Box p={[0, 0.58, 0]} s={[0.95, 0.04, 0.04]} r={[0, 0, 0.12]} c="#b8322a" metal={0.3} rough={0.4} />
    <Box p={[-0.32, 0.5, 0]} s={[0.04, 0.42, 0.04]} r={[0, 0, -0.25]} c="#b8322a" metal={0.3} rough={0.4} />
    <Box p={[0.42, 0.6, 0]} s={[0.04, 0.5, 0.04]} r={[0, 0, 0.3]} c="#b8322a" metal={0.3} rough={0.4} />
    <Box p={[-0.26, 0.78, 0]} s={[0.22, 0.05, 0.1]} c="#2a2018" />
    <Box p={[0.5, 0.88, 0]} s={[0.04, 0.04, 0.5]} c="#c8ccd2" metal={0.6} />
    {/* a basket with a baguette */}
    <Box p={[0.66, 0.68, 0]} s={[0.24, 0.16, 0.3]} c="#b88a4a" />
    <Cyl p={[0.66, 0.82, 0.02]} rt={0.045} h={0.5} r={[0.5, 0, 0.9]} c="#d9a35a" />
  </group>
);

// The army bulldozer that drives the circle at night: tracks, cab, raised blade, a smoking exhaust and headlights.
const Dozer: React.FC<{f: number; night: number}> = ({f, night}) => {
  const a = dozerAngle(f);
  const p: V3 = [CC[0] + Math.cos(a) * CR, 0, CC[2] + Math.sin(a) * CR];
  const ry = ryFor(-Math.sin(a), Math.cos(a));
  const bump = Math.abs(Math.sin(f * 0.6)) * 0.04;
  return (
    <group position={[p[0], bump, p[2]]} rotation={[0, ry, 0]}>
      {[-0.85, 0.85].map((z, i) => (
        <Box key={i} p={[0, 0.4, z]} s={[2.8, 0.8, 0.5]} c="#24241e" rough={0.7} />
      ))}
      <Box p={[-0.2, 1.05, 0]} s={[2.2, 0.7, 1.4]} c="#8a7a2e" rough={0.6} />
      <Box p={[-0.6, 1.8, 0]} s={[1.1, 0.9, 1.3]} c="#7a6c28" rough={0.6} />
      <Box p={[-0.6, 2.3, 0]} s={[1.3, 0.08, 1.5]} c="#5a5020" />
      <Box p={[1.85, 0.6, 0]} s={[0.18, 1.0, 2.6]} r={[0, 0, -0.18]} c="#6a6a62" metal={0.4} rough={0.5} />
      <Cyl p={[0.5, 1.75, 0.4]} rt={0.08} h={0.8} c="#2a2a2a" />
      {Array.from({length: 6}).map((_, i) => {
        const u = ((f * 0.06 + i / 6) % 1 + 1) % 1;
        return <Glow key={i} pos={[0.5 - u * 2.2, 2.2 + u * 2.4, 0.4]} size={0.5 + u * 1.6} color={night > 0.5 ? '#6a7090' : '#9a948c'} opacity={0.5 * (1 - u)} />;
      })}
      {night > 0.3 && (
        <>
          {[-0.45, 0.45].map((z, i) => (
            <Glow key={i} pos={[1.0, 1.5, z]} size={1.4} color="#ffe2a0" opacity={0.9} />
          ))}
          <pointLight position={[3, 1.4, 0]} color="#ffd890" intensity={14} distance={12} decay={1.5} />
        </>
      )}
    </group>
  );
};

// The bulldozer's tracks, drawn in as it goes round: two dark ribbons on the grass.
const Tracks: React.FC<{f: number}> = ({f}) => {
  const done = tracksDone(f);
  if (done <= 0) return null;
  const len = done * Math.PI * 2;
  const start = Math.PI / 2 - len;
  return (
    <group position={[CC[0], 0.012, CC[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      {[CR - 0.85, CR + 0.85].map((r, i) => (
        <mesh key={i} receiveShadow>
          <ringGeometry args={[r - 0.26, r + 0.26, 160, 1, start, len]} />
          <meshStandardMaterial color="#4a3a26" roughness={1} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      ))}
    </group>
  );
};

// A sound truck: olive truck with two big loudspeaker horns on the roof. Sound rings pulse out of the horns.
const SoundTruck: React.FC<{p: V3; ry: number; f: number; on: boolean; night: number; seed: number}> = ({p, ry, f, on, night, seed}) => {
  const cloth = canvasCloth('#6c6844');
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <Box p={[-0.4, 1.0, 0]} s={[3.6, 0.2, 2.2]} c="#55583a" />
      <mesh position={[-0.4, 1.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 1.5, 2.2]} />
        <meshStandardMaterial map={cloth} roughness={0.95} />
      </mesh>
      <Box p={[2.1, 1.15, 0]} s={[1.6, 1.7, 2.2]} c="#62663e" />
      <Box p={[2.91, 1.45, 0]} s={[0.02, 0.6, 1.8]} c="#3a4450" rough={0.2} shadow={false} />
      {[[-1.5, 1.1], [-1.5, -1.1], [2.2, 1.1], [2.2, -1.1]].map(([dx, dz], i) => (
        <Cyl key={i} p={[dx, 0.48, dz]} rt={0.48} h={0.32} r={[Math.PI / 2, 0, 0]} c="#1e1e20" />
      ))}
      {/* horns pointing out of the side, towards +z */}
      {[-1.3, 0.5].map((x, i) => {
        const beat = on ? Math.max(0, Math.sin(f * 0.7 + i * 1.3)) : 0;
        return (
          <group key={i} position={[x, 2.95, 0.2]}>
            <Cyl p={[0, -0.25, 0]} rt={0.06} h={0.5} c="#3a3a36" />
            <group rotation={[Math.PI / 2 - 0.25, 0, 0]} scale={[1 + beat * 0.06, 1, 1 + beat * 0.06]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.62, 0.14, 1.2, 24, 1, true]} />
                <meshStandardMaterial color="#8c9088" metalness={0.5} roughness={0.35} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, -0.62, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
                <meshStandardMaterial color="#3a3a36" />
              </mesh>
            </group>
            {on &&
              Array.from({length: 5}).map((_, k) => {
                const u = ((f / 28 + k / 5 + i * 0.1 + seed * 0.37) % 1 + 1) % 1;
                const col = k % 2 ? '#7fe3ff' : '#ffcf6a';
                return (
                  <mesh key={k} position={[0, 0.5 + u * 1.9, 0.7 + u * 7.5]} rotation={[-0.25, 0, 0]} scale={0.7 + u * 3.4}>
                    <torusGeometry args={[0.62, 0.05, 8, 40]} />
                    <meshBasicMaterial color={col} transparent opacity={(1 - u) * (0.55 + 0.4 * night)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
                  </mesh>
                );
              })}
          </group>
        );
      })}
      {night > 0.3 && (
        <>
          <Glow pos={[2.95, 1.0, 0.7]} size={0.9} color="#ffe6a8" opacity={0.8} />
          <pointLight position={[0, 3.6, 2.6]} color="#ffc27a" intensity={10 * night} distance={9} decay={1.4} />
        </>
      )}
    </group>
  );
};

// A lantern on a post: warm light pools at night.
const Lantern: React.FC<{p: V3; night: number; f: number}> = ({p, night, f}) => (
  <group position={p}>
    <Cyl p={[0, 0.9, 0]} rt={0.04} h={1.8} c="#4a3a28" />
    <Box p={[0, 1.88, 0]} s={[0.18, 0.24, 0.18]} c="#2a2620" emissive="#ffb85a" ei={night * 1.6} />
    {night > 0.2 && (
      <>
        <Glow pos={[0, 1.88, 0]} size={1.4 + Math.sin(f * 0.5) * 0.08} color="#ffbe6a" opacity={0.85 * night} />
        <pointLight position={[0, 1.9, 0]} color="#ffae5a" intensity={5 * night} distance={8} decay={1.6} />
      </>
    )}
  </group>
);

// The division patch the artist paints: an invented design (a gold ghost-free star on a blue shield, red edge).
export const patchTexture = (p: number) =>
  cachedTexture(`ga-patch|${p}`, () => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const g = c.getContext('2d')!;
    g.fillStyle = '#f1e8d2';
    g.fillRect(0, 0, 512, 512);
    const shield = () => {
      g.beginPath();
      g.moveTo(256, 470);
      g.quadraticCurveTo(70, 380, 80, 70);
      g.lineTo(432, 70);
      g.quadraticCurveTo(442, 380, 256, 470);
      g.closePath();
    };
    g.save();
    // paint goes on top to bottom, as the brush moves
    g.beginPath();
    g.rect(0, 0, 512, 60 + p * 430);
    g.clip();
    shield();
    g.fillStyle = '#c8392b';
    g.fill();
    g.save();
    g.translate(256, 262);
    g.scale(0.84, 0.84);
    g.translate(-256, -262);
    shield();
    g.fillStyle = '#2d5bb0';
    g.fill();
    g.restore();
    g.fillStyle = '#ffd25e';
    g.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 50 : 118;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      g.lineTo(256 + Math.cos(a) * r, 250 + Math.sin(a) * r);
    }
    g.closePath();
    g.fill();
    g.restore();
    g.lineWidth = 10;
    g.strokeStyle = 'rgba(30,20,10,0.35)';
    shield();
    g.stroke();
    return c;
  });

// A stencil card for the place and year on the plate of the compressor and on the crate lid.
const stencilTexture = (text: string, color: string) =>
  cachedTexture(`ga-sten|${text}|${color}`, () => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = BEBAS(200);
    g.fillText(text, 256, 132);
    g.fillStyle = 'rgba(0,0,0,0)';
    return c;
  });

// The German reconnaissance plane: grey-green, high wing, with a camera flash under its belly.
const Plane: React.FC<{f: number; p: V3; flash: number}> = ({f, p, flash}) => (
  <group position={p} rotation={[0, 0, Math.sin(f * 0.05) * 0.03]}>
    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.55, 0.3, 8.5, 16]} />
      <meshStandardMaterial color="#7d8878" roughness={0.6} />
    </mesh>
    <mesh position={[3.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.55, 1.0, 16]} />
      <meshStandardMaterial color="#e8c84a" roughness={0.5} />
    </mesh>
    <Box p={[0.9, 0.62, 0]} s={[1.9, 0.12, 13]} c="#76826f" rough={0.6} />
    <Box p={[-3.8, 0.2, 0]} s={[1.0, 0.1, 3.6]} c="#76826f" rough={0.6} />
    <Box p={[-3.9, 0.9, 0]} s={[0.9, 1.3, 0.1]} c="#76826f" rough={0.6} />
    <Box p={[1.4, 0.35, 0]} s={[1.3, 0.5, 1.0]} c="#6a8aa6" rough={0.15} metal={0.3} />
    <mesh position={[4.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <circleGeometry args={[1.5, 24]} />
      <meshBasicMaterial color="#e8e8e8" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    {flash > 0 && (
      <>
        <Glow pos={[0.5, -0.8, 0]} size={4 + flash * 8} color="#ffffff" opacity={flash} />
        <pointLight position={[0.5, -1.5, 0]} color="#ffffff" intensity={flash * 80} distance={60} decay={1.2} />
      </>
    )}
  </group>
);
export const FLASHES = [s(37.62), s(37.95), s(38.32), s(49.81), s(50.1)];
export const flashAt = (f: number) => {
  let v = 0;
  for (const x of FLASHES) if (f >= x && f < x + 6) v = Math.max(v, 1 - (f - x) / 6);
  return v;
};

// Many GIs standing in rows: one instanced mesh per drawing.
const Crowd: React.FC<{origin: V3; cols: number; rows: number; gap: number; tint: string; f: number}> = ({origin, cols, rows, gap, tint, f}) => {
  const cam = useCam();
  const meshes = useMemo(() => {
    const looks = [person('gi1', 'stand', 'happy'), person('gi3', 'stand', 'calm'), person('gi2', 'stand', 'happy')];
    return looks.map((sp) => makeCrowdMesh(sp, GI_H, Math.ceil((cols * rows) / looks.length), tint));
  }, [cols, rows, tint]);
  const counts = [0, 0, 0];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const m = i % 3;
      const x = origin[0] + (c - (cols - 1) / 2) * gap + (r % 2) * gap * 0.5;
      const z = origin[2] + r * gap * 0.9;
      placeFlat(meshes[m], counts[m]++, cam, x, Math.abs(Math.sin(f * 0.2 + i)) * 0.03, z, true, 0.6);
    }
  meshes.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  return (
    <>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
};

// ---------- The field ----------

export const FieldWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const tex = useMemo(
    () => ({
      grass: grassTexture('#6aa04a', [60, 60]),
      dirt: earthTexture([30, 2]),
      road: earthTexture([60, 2]),
      hedge: foliageTexture('#4f8a3a', '#7ab452', '#2f5a26', 3),
      oak: foliageTexture('#5a9440', '#8cc25a', '#356a2c', 9),
      bark: barkTexture('#5e4630'),
    }),
    [],
  );
  const L = lightAt(f);
  const night = L.night;
  const tint = L.tint;

  // what is on show when
  const hookPhase = f < B.night; // day one: the tank in the air, the cyclists
  const ending = f >= B.back;
  const nightPhase = f >= B.night && f < B.morning;
  const tanksParked = f >= s(25.4); // by morning the rubber tanks stand on the circle
  const ghostDusk = f >= B.became && f < B.secret;
  const yearsPass = f >= B.secret && f < B.back;

  // the lifted tank: overhead with a bounce on "lift"; on the ground in the day scenes
  const bounce = f < B.night ? 0.25 * springOut(clamp01((f - B.lift) / 20)) - 0.25 * clamp01((f - B.lift) / 6) + 0.25 * ramp(f, B.lift, B.lift + 4) : 0;
  const lean = f >= B.shrugs && f < B.americans ? 0.08 * Math.sin(Math.min(1, (f - B.shrugs) / 8) * Math.PI * 0.5) : 0;
  const held = hookPhase || ending;
  const liftY = held ? HANDS + bounce + Math.sin(f * 0.09) * 0.02 : 0;
  const pokeJ = jiggle(f, B.noReal, 0.12) + jiggle(f, B.rubberWord, 0.24, 40) + jiggle(f, B.because + 10, 0.06);
  const endJ = ending ? jiggle(f, B.plug, 0.05, 20) : 0;
  const deflate = ending ? ramp(f, B.plug + 2, B.plug + 38) : 0;
  const plugOut = ending ? ramp(f, B.plug - 6, B.plug + 2) : 0;

  const inf = inflateAt(f);
  const compressorOn = f >= B.blown - 4 && f < B.eleven;

  // the riders
  const riding = f >= B.frenchmen - 30 && f < B.night;
  const spin = -ramp(f, B.frenchmen - 30, B.freeze + 2) * 14 / 0.36;

  return (
    <>
      <fog attach="fog" args={[L.fog, 45, 360]} />
      <Sky stops={L.stops} />
      {night < 0.6 && <Clouds f={yearsPass ? f * 12 : f} tint={tint} opacity={0.85 * (1 - night)} />}
      <NightSky f={f} night={night} />
      <hemisphereLight args={[L.hs, L.hg, L.hi]} />
      <KeyLight focus={focus} dir={L.kd} color={L.kc} intensity={L.ki} size={14} />
      {night < 0.5 && <Glow pos={[L.kd[0] * 14, L.kd[1] * 9, L.kd[2] * 14]} size={110} color={L.kc} opacity={0.5 * (1 - night)} />}

      {/* grass, the lane, hedgerows, oaks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[420, 420]} />
        <meshStandardMaterial map={tex.grass} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, LANE_Z]} receiveShadow>
        <planeGeometry args={[200, 3.2]} />
        <meshStandardMaterial map={tex.dirt} roughness={1} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[100, 0.006, ROAD_Z]} receiveShadow>
        <planeGeometry args={[240, 6]} />
        <meshStandardMaterial map={tex.road} roughness={1} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <Hedges tex={tex.hedge} />
      <Oak p={OAK} tex={tex.oak} bark={tex.bark} f={f} />
      <Oak p={[-20, 0, -24]} tex={tex.oak} bark={tex.bark} f={f} scale={1.3} />
      <Oak p={[24, 0, 18]} tex={tex.oak} bark={tex.bark} f={f} scale={1.1} />
      <Oak p={[26, 0, -22]} tex={tex.oak} bark={tex.bark} f={f} scale={1.4} />
      {[[-80, -70], [-30, -90], [60, -95], [150, -85], [140, -30], [-120, -20]].map(([x, z], i) => (
        <Oak key={i} p={[x, 0, z]} tex={tex.oak} bark={tex.bark} f={f} scale={2.2 + (i % 3) * 0.4} />
      ))}
      {/* something small always moves: seeds and midges by day, fireflies at night */}
      <Particles
        count={70}
        seed={12}
        glow
        shape="dot"
        color={night > 0.5 ? '#d8ff7a' : '#fff6d0'}
        at={(i, r) => {
          const bx = focus[0] + (r() - 0.5) * 18;
          const bz = focus[2] + (r() - 0.5) * 14;
          return {pos: [bx + Math.sin(f * 0.03 + i) * 1.2, 0.4 + r() * 3 + Math.sin(f * 0.05 + i * 2) * 0.3, bz + Math.cos(f * 0.025 + i) * 1.2], size: night > 0.5 ? 0.14 + 0.1 * Math.sin(f * 0.3 + i) : 0.07};
        }}
      />

      {/* the stencilled crate: FRANCE 1944; at the end its lid keeps the secret */}
      <SecretCrate f={f} />
      <Crate p={[9.0, 0, 8.6]} seed={4} ry={0.2} />
      <Crate p={[9.0, 0.55, 8.6]} seed={5} ry={0.15} />
      <Crate p={[-4.2, 0, 7.6]} seed={6} ry={-0.3} stencil="23 HQ" />

      {/* the tank the GIs lift, and its holders */}
      {f < B.night || (f >= B.because && f < B.became) || ending ? (
        <group position={[LIFT[0], liftY, LIFT[2]]} rotation={[lean * 0.5, LIFT_RY, lean]}>
          <Tank wobble={pokeJ + endJ} deflate={deflate} plugOut={plugOut} turretYaw={1.15} />
          {/* a stencilled crate strapped across the front, between the tracks: the place-and-year beat */}
          <Crate p={[2.95, 0.42 - 0.15 * deflate, 0]} s={[1.5, 0.82, 0.5]} stencil={'FRANCE\n1944'} color={CORAL} seed={31} ry={Math.PI / 2} />
        </group>
      ) : null}
      {held && (
        <>
          {HOLDERS.map((p, i) => {
            const shrug = !ending && i === 0 && f >= B.shrugs && f < B.night;
            const expr = ending ? (f >= B.plug ? 'awe' : i === 1 && f >= B.pulls ? 'focused' : 'happy') : f >= B.frenchmen && i === 0 && f < B.shrugs ? 'focused' : 'happy';
            return <Flat key={i} s={person(i === 0 ? 'gi1' : i === 1 ? 'gi2' : i === 2 ? 'gi3' : 'gi4', shrug ? 'shrug' : 'armsUp', expr)} pos={p} h={GI_H} tint={tint} bob={Math.abs(Math.sin(f * 0.18 + i)) * 0.02} />;
          })}
        </>
      )}
      {f >= B.because && f < B.blown && (
        <Flat s={person('gi3', 'reach', f >= B.rubberWord ? 'awe' : 'happy')} pos={[2.35, 0, 4.0]} h={GI_H} tint={tint} flip bob={f >= B.rubberWord ? Math.max(0, jiggle(f, B.rubberWord, 0.12, 30)) : 0} />
      )}
      {/* air hissing out of the valve at the very end */}
      {ending && f >= B.plug &&
        Array.from({length: 12}).map((_, i) => {
          const u = (((f - B.plug) / 14 + i / 12) % 1 + 1) % 1;
          return <Glow key={i} pos={[VALVE[0] - u * 1.4 + Math.sin(i * 2) * 0.3, liftY - u * 0.5 + Math.sin(i) * 0.15, VALVE[1] + u * 1.2]} size={0.3 + u * 1.1} color="#f2f4f6" opacity={0.6 * (1 - u)} />;
        })}

      {/* the cyclists */}
      {riding &&
        [0, 1].map((i) => {
          const p = riderAt(f, i);
          const stopped = f >= B.freeze;
          const expr = f >= B.freeze ? 'awe' : 'happy';
          const pose = i === 0 && f >= B.how ? 'shrug' : 'stand';
          return (
            <group key={i}>
              <Bicycle p={[p[0], 0, p[2] - 0.15]} spin={spin} />
              <Flat s={person(i === 0 ? 'fr1' : 'fr2', pose, expr)} pos={[p[0] - 0.1, 0, p[2]]} h={H} tint={tint} bob={stopped ? 0 : Math.abs(Math.sin(f * 0.5 + i)) * 0.04} />
            </group>
          );
        })}

      {/* the night: the bulldozer and its tracks, the sound trucks, lanterns */}
      <Tracks f={f} />
      {nightPhase && <Dozer f={f} night={night} />}
      {TRUCKS.map((t, i) => (
        <SoundTruck key={i} p={t.p} ry={t.ry} f={f} on={f >= B.trucks - 10 && f < B.morning} night={night} seed={i} />
      ))}
      <Lantern p={[-15.5, 0, 2.5]} night={night} f={f} />
      <Lantern p={[15.5, 0, 1.0]} night={night} f={f} />
      <Lantern p={[-1.5, 0, -2.5]} night={night} f={f} />

      {/* the rubber tanks on the circle, by morning */}
      {tanksParked &&
        RING_TANKS.map((a, i) => {
          const p = ringTankPos(a);
          return (
            <group key={i} position={p} rotation={[0, ryFor(-Math.sin(a), Math.cos(a)), 0]}>
              <Tank wobble={jiggle(f, B.look + i * 3, 0.03)} />
            </group>
          );
        })}

      {/* the artist's table under the oak */}
      <ArtistTable f={f} tint={tint} />

      {/* the reveal: the bag blown up by the compressor */}
      {f >= B.morning && (
        <group position={BAG}>
          <Tank inflate={f < B.blown ? 0 : inf} wobble={jiggle(f, B.eleven - 14, 0.06)} />
        </group>
      )}
      <Compressor f={f} on={compressorOn} />
      {compressorOn && <DustBurst f={f} from={B.eleven - 16} pos={[BAG[0], 0, BAG[2]]} size={2.2} color="#e8f0d8" n={12} />}

      {/* the "division": rows of rubber tanks and the 1,100 men, west of the field */}
      {f >= B.eleven && f < B.whileW && <Division f={f} tint={tint} />}

      {/* the real attack: steel tanks rolling fast along the far road, dust behind them */}
      {f >= B.so && f < B.became && <RealColumn f={f} />}

      {/* the Ghost Army at dusk: a line of men before the rubber tanks, mist on the grass */}
      {ghostDusk && (
        <>
          {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((x, i) => (
            <Flat key={i} s={person(i % 2 ? 'gi2' : 'gi1', 'stand', 'happy')} pos={[CC[0] + x, 0, CC[2] + CR + 3.2 + (i % 2) * 0.3]} h={GI_H} tint={tint} />
          ))}
          {Array.from({length: 16}).map((_, i) => {
            const u = ((f * 0.004 + i / 16) % 1 + 1) % 1;
            return <Glow key={i} pos={[CC[0] - 14 + u * 28, 0.5, CC[2] + 2 + (i % 5) * 2.2]} size={5} color="#ffe6cc" opacity={0.25 * Math.sin(u * Math.PI)} />;
          })}
        </>
      )}

      {/* the plane overhead */}
      {planeAt(f).on && <Plane f={f} p={planeAt(f).p} flash={flashAt(f)} />}
    </>
  );
};

// The FRANCE 1944 crate, which at the end holds the folded tank under a stencilled SECRET lid. The lid lifts on
// "1996" with a warm glow from inside (the channel's reveal touch).
const SecretCrate: React.FC<{f: number}> = ({f}) => {
  const size: V3 = [1.3, 0.85, 0.9];
  const open = ramp(f, B.y1996 - 4, B.y1996 + 14);
  const lidOn = f >= B.secret && f < B.back;
  const glow = lidOn ? open : 0;
  return (
    <group>
      <Crate p={[CRATE[0], 0, CRATE[2]]} s={[1.2, 0.55, 0.85]} seed={3} ry={CRATE_RY + 0.08} />
      <Crate p={CRATE} s={size} stencil={'FRANCE\n1944'} color={CORAL} seed={9} ry={CRATE_RY} />
      {lidOn && (
        <group position={[CRATE[0], CRATE[1] + size[1], CRATE[2]]} rotation={[0, CRATE_RY, 0]}>
          {/* hinged at the back edge */}
          <group position={[0, 0, -size[2] / 2]} rotation={[-springOut(open) * 1.25, 0, 0]}>
            <Box p={[0, 0.04, size[2] / 2]} s={[size[0] + 0.06, 0.08, size[2] + 0.06]} c="#9a7242" rough={0.85} />
            <Board p={[0, 0.082, size[2] / 2]} w={1.1} h={0.55} map={stencilTexture(open > 0.2 ? '1996' : 'SECRET', open > 0.2 ? CORAL : '#2a1e12')} r={[-Math.PI / 2, 0, 0]} />
          </group>
          {glow > 0 && (
            <>
              <Glow pos={[0, 0.35, 0]} size={2.6 * glow} color="#ffd88a" opacity={0.85 * glow} />
              <pointLight position={[0, 0.6, 0]} color="#ffcf7a" intensity={8 * glow} distance={6} decay={1.5} />
            </>
          )}
        </group>
      )}
      {/* leaves fall on the lid as the years go by */}
      {lidOn && (
        <Particles
          count={26}
          seed={77}
          color="#c98a3a"
          at={(i, r) => {
            const t = ((f - B.secret) / 70 + r()) % 1;
            return {pos: [CRATE[0] + (r() - 0.5) * 3, 3.6 - t * 3.6, CRATE[2] + (r() - 0.5) * 2.4], size: 0.16, spin: f * 0.1 + i};
          }}
        />
      )}
    </group>
  );
};

// The artist's folding table under the oak: patches drying in a row, one being painted.
const ArtistTable: React.FC<{f: number; tint: string}> = ({f, tint}) => {
  const [x, , z] = TABLE;
  const p = ramp(f, B.paints - 4, B.isntThere + 10);
  const done = Math.min(5, Math.floor(ramp(f, B.artist, B.isntThere + 20) * 5));
  const on = f >= B.morning && f < B.because;
  return (
    <group>
      <Box p={[x, TABLE_TOP - 0.025, z]} s={[1.6, 0.05, 0.8]} c="#8a6a44" rough={0.7} />
      {[[-0.72, -0.34], [0.72, -0.34], [-0.72, 0.34], [0.72, 0.34]].map(([dx, dz], i) => (
        <Cyl key={i} p={[x + dx, TABLE_TOP / 2 - 0.02, z + dz]} rt={0.025} h={TABLE_TOP - 0.04} c="#5a4630" />
      ))}
      {on && (
        <>
          {/* the patch being painted, in the middle */}
          <Board p={[x, TABLE_TOP + 0.004, z + 0.08]} w={0.36} h={0.36} map={patchTexture(Math.round(p * 16) / 16)} r={[-Math.PI / 2, 0, 0.05]} lit />
          {/* finished ones, in a row */}
          {Array.from({length: done}).map((_, i) => (
            <Board key={i} p={[x - 0.62 + (i % 3) * 0.2, TABLE_TOP + 0.004 + i * 0.001, z - 0.22 + Math.floor(i / 3) * 0.2]} w={0.17} h={0.17} map={patchTexture(1)} r={[-Math.PI / 2, 0, (i - 2) * 0.15]} lit />
          ))}
          {/* paint pots */}
          {[['#c8392b', 0.5], ['#2d5bb0', 0.62], ['#ffd25e', 0.74]].map(([c, dx], i) => (
            <Cyl key={i} p={[x + (dx as number), TABLE_TOP + 0.05, z - 0.18]} rt={0.05} h={0.1} c={c as string} rough={0.3} />
          ))}
          {/* the brush, dabbing */}
          <group position={[x + 0.05 + Math.sin(f * 0.45) * 0.08, TABLE_TOP + 0.09 + Math.abs(Math.sin(f * 0.45)) * 0.05, z + 0.08 + Math.cos(f * 0.3) * 0.06]} rotation={[0.5, 0, -0.7]}>
            <Cyl p={[0, 0.12, 0]} rt={0.012} h={0.24} c="#c9915a" />
            <Cyl p={[0, -0.02, 0]} rt={0.016} rb={0.004} h={0.06} c="#c8392b" />
          </group>
          <Flat s={person('artist', 'sit', 'focused', 'brush')} pos={[x - 0.2, 0, z - 0.62]} h={GI_H} tint={tint} maxTilt={0.25} />
        </>
      )}
    </group>
  );
};

// The air compressor that blows the bag up: a chugging engine on a skid, a hose to the tank, a 20 MIN stencil.
const Compressor: React.FC<{f: number; on: boolean}> = ({f, on}) => {
  const chug = on ? Math.abs(Math.sin(f * 1.1)) * 0.03 : 0;
  const [x, , z] = COMPRESSOR;
  const a = new THREE.Vector3(x + 0.6, 0.5, z);
  const b = new THREE.Vector3(BAG[0] - 2.6, 0.45, BAG[2] + 0.6);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <group>
      <group position={[x, chug, z]}>
        <Box p={[0, 0.08, 0]} s={[1.3, 0.16, 0.8]} c="#3e3a30" />
        <Cyl p={[0, 0.5, 0]} rt={0.32} h={1.1} r={[0, 0, Math.PI / 2]} c="#b8422e" rough={0.4} metal={0.3} />
        <Box p={[-0.35, 0.95, 0]} s={[0.5, 0.3, 0.5]} c="#2e2e2c" />
        <Board p={[0, 0.5, 0.33]} w={0.7} h={0.35} map={stencilTexture('20 MIN', '#fff3d6')} />
        {on &&
          Array.from({length: 5}).map((_, i) => {
            const u = ((f * 0.07 + i / 5) % 1 + 1) % 1;
            return <Glow key={i} pos={[-0.35 - u * 0.4, 1.15 + u * 1.6, 0]} size={0.3 + u * 0.9} color="#a9a49c" opacity={0.45 * (1 - u)} />;
          })}
      </group>
      <mesh position={mid} quaternion={quat} castShadow>
        <cylinderGeometry args={[0.05, 0.05, len, 10]} />
        <meshStandardMaterial color="#1e1e1c" roughness={0.6} />
      </mesh>
    </group>
  );
};

// The make-believe division: rows of rubber tanks, with the 1,100 men drawn up in front.
const Division: React.FC<{f: number; tint: string}> = ({f, tint}) => {
  const rows = [];
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 6; c++) {
      rows.push(
        <group key={`${r}${c}`} position={[DIV[0] + (c - 2.5) * 7.5, 0, DIV[2] - 6 - r * 7]} rotation={[0, 0.0, 0]}>
          <Tank wobble={jiggle(f, B.pretending + (r * 6 + c) * 2, 0.04)} />
        </group>,
      );
    }
  return (
    <>
      {rows}
      <Crowd origin={[DIV[0], 0, DIV[2] + 2]} cols={30} rows={8} gap={1.15} tint={tint} f={f} />
    </>
  );
};

// The real attack: a column of steel tanks with dust trailing behind.
const RealColumn: React.FC<{f: number}> = ({f}) => (
  <>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = realTankX(f, i);
      return (
        <group key={i}>
          <group position={[x, Math.abs(Math.sin(f * 0.5 + i)) * 0.03, ROAD_Z]}>
            <Tank real />
          </group>
          {Array.from({length: 6}).map((_, k) => {
            const u = ((f * 0.05 + k / 6 + i * 0.13) % 1 + 1) % 1;
            return <Glow key={k} pos={[x - 3 - u * 6, 0.5 + u * 2, ROAD_Z + Math.sin(k + i) * 1.2]} size={1.5 + u * 4} color="#cbb08a" opacity={0.5 * (1 - u)} />;
          })}
        </group>
      );
    })}
  </>
);

// ---------- The town ----------

const cafeSign = () =>
  cachedTexture('ga-cafe', () => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = '#1f4a3a';
    g.fillRect(0, 0, 1024, 256);
    g.strokeStyle = '#e8c36a';
    g.lineWidth = 14;
    g.strokeRect(14, 14, 996, 228);
    g.fillStyle = '#f4e6c2';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = BEBAS(170);
    g.fillText('CAFÉ DU MARCHÉ', 512, 136);
    return c;
  });
const stoneWall = () =>
  cachedTexture(
    'ga-stone',
    () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const g = c.getContext('2d')!;
      const r = rng(13);
      g.fillStyle = '#d8c8a8';
      g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 48)
        for (let x = (y / 48) % 2 ? -40 : 0; x < 512; x += 96) {
          const v = 200 + r() * 30;
          g.fillStyle = `rgb(${v},${v - 14},${v - 40})`;
          g.fillRect(x + 3, y + 3, 90, 42);
        }
      return c;
    },
    [3, 2],
  );
const cobbles = () =>
  cachedTexture(
    'ga-cobble',
    () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const g = c.getContext('2d')!;
      const r = rng(17);
      g.fillStyle = '#7a7064';
      g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 32)
        for (let x = (y / 32) % 2 ? -16 : 0; x < 512; x += 32) {
          const v = 150 + r() * 40;
          g.fillStyle = `rgb(${v},${v - 8},${v - 20})`;
          g.beginPath();
          g.roundRect(x + 2, y + 2, 28, 28, 8);
          g.fill();
        }
      return c;
    },
    [20, 20],
  );
const awning = () =>
  cachedTexture('ga-awning', () => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const g = c.getContext('2d')!;
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#f4efe4' : '#c8392b';
      g.fillRect(i * 64, 0, 64, 128);
    }
    return c;
  });

// A paper star that comes loose from the "general's" cap and flutters down on "He isn't a general".
const FallingStar: React.FC<{f: number}> = ({f}) => {
  const d = f - (B.isnt + 6);
  const u = Math.min(1, Math.max(0, d) / 40);
  const tex = useMemo(
    () =>
      cachedTexture('ga-paperstar', () => {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 128;
        const g = c.getContext('2d')!;
        g.fillStyle = '#eef0f4';
        g.strokeStyle = INK;
        g.lineWidth = 6;
        g.beginPath();
        for (let k = 0; k < 10; k++) {
          const r = k % 2 ? 22 : 56;
          const a = -Math.PI / 2 + (k * Math.PI) / 5;
          g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r);
        }
        g.closePath();
        g.fill();
        g.stroke();
        return c;
      }),
    [],
  );
  if (d < 0) return null;
  return (
    <mesh position={[GENERAL[0] + 0.12 + Math.sin(d * 0.25) * 0.25, 1.5 - u * 1.48, GENERAL[2] + 0.25]} rotation={[0.4 * Math.sin(d * 0.3), 0, d * 0.15]}>
      <planeGeometry args={[0.16, 0.16]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.4} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
};

export const TownWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const L = TOWN_LIGHT;
  const stops = useMemo(() => L.sky.map((x, i) => [[0, 0.36, 0.48, 0.52, 1][i], x] as [number, string]), [L]);
  const tint = L.tint;
  const loud = f >= B.shows;
  const isnt = f >= B.isnt;
  const flag = (i: number) => Math.sin(f * 0.25 + i) * 0.25;
  return (
    <>
      <fog attach="fog" args={[L.fog, 40, 260]} />
      <Sky stops={stops} />
      <Clouds f={f} tint="#ffffff" />
      <hemisphereLight args={[L.hs, L.hg, L.hi]} />
      <KeyLight focus={focus} dir={L.kd} color={L.kc} intensity={L.ki} size={10} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial map={cobbles()} roughness={0.95} />
      </mesh>
      {/* the cafe front and its neighbours */}
      {[-9, 0, 9].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 4, CAFE_Z - 1]} castShadow receiveShadow>
            <boxGeometry args={[9, 8, 2]} />
            <meshStandardMaterial map={stoneWall()} color={['#f0e0c8', '#ffffff', '#e8d8c0'][i]} roughness={0.95} />
          </mesh>
          <Box p={[x, 8.3, CAFE_Z - 1]} s={[9.4, 0.6, 2.6]} c="#7a4a3a" />
          {[-2.6, 0, 2.6].map((dx, k) => (
            <group key={k}>
              <Box p={[x + dx, 5.8, CAFE_Z + 0.02]} s={[1.2, 1.6, 0.06]} c="#2e3c48" rough={0.2} shadow={false} />
              <Box p={[x + dx - 0.78, 5.8, CAFE_Z + 0.06]} s={[0.36, 1.7, 0.05]} c={['#3c6a5a', '#5a7a9a', '#8a5a3a'][i]} />
              <Box p={[x + dx + 0.78, 5.8, CAFE_Z + 0.06]} s={[0.36, 1.7, 0.05]} c={['#3c6a5a', '#5a7a9a', '#8a5a3a'][i]} />
            </group>
          ))}
        </group>
      ))}
      {/* the cafe: big window, door, sign, striped awning, tables */}
      <Box p={[-1.6, 1.5, CAFE_Z + 0.02]} s={[3.2, 2.0, 0.06]} c="#3a4a52" rough={0.15} emissive="#ffcf8a" ei={0.15} shadow={false} />
      <Box p={[2.2, 1.25, CAFE_Z + 0.02]} s={[1.2, 2.5, 0.06]} c="#4a2e20" shadow={false} />
      <Board p={[0, 3.35, CAFE_Z + 0.08]} w={4.4} h={1.1} map={cafeSign()} lit />
      <mesh position={[0, 2.75, CAFE_Z + 0.9]} rotation={[0.55, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[6.6, 1.9]} />
        <meshStandardMaterial map={awning()} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {[-2.2, 2.6].map((x, i) => (
        <group key={i}>
          <Cyl p={[x, 0.74, CAFE_Z + 2.4]} rt={0.4} h={0.04} c="#e8e4d8" />
          <Cyl p={[x, 0.37, CAFE_Z + 2.4]} rt={0.04} h={0.74} c="#2e2e2e" />
          <Cyl p={[x + 0.1, 0.82, CAFE_Z + 2.3]} rt={0.05} rb={0.04} h={0.12} c="#f6f2ea" />
        </group>
      ))}
      {/* bunting across the square */}
      {Array.from({length: 14}).map((_, i) => (
        <mesh key={i} position={[-6.5 + i, 4.6 - Math.sin((i / 13) * Math.PI) * 0.6, CAFE_Z + 3]} rotation={[flag(i), 0, Math.PI]}>
          <coneGeometry args={[0.2, 0.42, 3]} />
          <meshStandardMaterial color={['#2d5bb0', '#f4efe4', '#c8392b'][i % 3]} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* the people */}
      <Flat s={person('general', loud ? 'point' : 'stand', isnt ? 'happy' : loud ? 'happy' : 'calm')} pos={GENERAL} h={1.85} tint={tint} bob={loud ? Math.abs(Math.sin(f * 0.35)) * 0.05 : 0} flip={loud && f % 40 < 20} />
      <Flat s={person('gi4', 'stand', 'calm')} pos={[-1.3, 0, 0.0]} h={GI_H} tint={tint} />
      <Flat s={person('villager', 'stand', f >= B.general ? 'awe' : 'calm')} pos={[1.6, 0, -0.2]} h={H} tint={tint} flip />
      <Flat s={person('waiter', 'hold', f >= B.shows ? 'awe' : 'happy', 'teacup')} pos={[3.1, 0, -0.9]} h={H} tint={tint} flip />
      <Flat s={person('fr2', 'stand', 'awe')} pos={[-2.9, 0, -1.0]} h={H} tint={tint} />
      <FallingStar f={f} />
      <DustBurst f={f} from={B.shows} pos={[GENERAL[0], 0, GENERAL[2]]} size={0.6} color="#e0d4bc" n={8} />
    </>
  );
};
