// Japan, 2009: the lab building at dusk (x = -30), the sealed dark room with five volunteers (origin),
// and the inside of the photon camera, where single particles of light land on the sensor (x = 30).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, V3} from '../shared/flat';
import {clamp01, ramp} from '../shared/camera';
import {Glow, SkyDome} from '../shared/fx';
import {Ball, Board, Box, Cyl, KeyLight} from '../shared/kit';
import {boardTexture} from '../shared/people';
import {plasterTexture, rng} from '../shared/toon';
import {B} from './beats';
import {person, Who} from './cast';
import {chartTex, clockFace, pavingTex, photonImage, skyGrad, timerTex} from './textures';

export const EXT: V3 = [-30, 0, 0];
export const SENSOR: V3 = [30, 1.5, -3];
export const MEN: V3[] = [-2.4, -1.2, 0, 1.2, 2.4].map((x) => [x, 0, -1.15] as V3);
export const MEN_H = 1.7;
export const CAM: V3 = [0, 0, 2.6];
export const SCREEN: V3 = [1.7, 1.15, 3.3];
export const CLOCK: V3 = [-1.4, 2.65, -3.46];
export const CHART: V3 = [1.3, 2.55, -3.46];
export const DOOR: V3 = [4.95, 0, 0];
// heights on a seated volunteer (from the drawing): head centre, cheeks, forehead, neck
export const SEAT = {
  head: ((1024 - 400) / 1024) * MEN_H,
  cheek: ((1024 - 446) / 1024) * MEN_H,
  forehead: ((1024 - 330) / 1024) * MEN_H,
  neck: ((1024 - 540) / 1024) * MEN_H,
  cheekX: (92 / 512) * MEN_H * 0.5,
};

// The clock in the dark room runs from 10 am to 4 pm while the narration says so.
export const hourAt = (f: number) => 10 + 6 * ramp(f, B.dimmest + 20, B.brightest + 30);
// How much the volunteers glow (exaggerated so it shows).
export const menGlow = (f: number) => {
  if (f < B.glowing - 10) return 0;
  if (f < B.changed) return ramp(f, B.glowing - 10, B.glowing + 10);
  return 0.2 + 0.8 * clamp01((hourAt(f) - 10) / 6);
};

const HARU_FROM: V3 = [-34.5, 0, 1.6];
const HARU_TO: V3 = [-30.6, 0, -2.4];
export const haruAt = (f: number): V3 => {
  const u = ramp(f, B.japan + 6, B.sealed - 6);
  return [HARU_FROM[0] + (HARU_TO[0] - HARU_FROM[0]) * u, 0, HARU_FROM[2] + (HARU_TO[2] - HARU_FROM[2]) * u];
};

// Door: open at the start of the "sealed" line, shut by the end of it.
export const doorOpen = (f: number) => 1 - ramp(f, B.sealed + 10, B.closed);

export const JapanWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const tex = useMemo(
    () => ({
      wall: plasterTexture('#c9b8a6', 5),
      dark: plasterTexture('#1b2033', 6),
      paving: pavingTex('#7d7a86'),
      floor: pavingTex('#2a2f3e'),
      sky: skyGrad('dusk', [[0, '#1d2a66'], [0.45, '#6a4f9a'], [0.62, '#f08a6a'], [0.75, '#ffc98a'], [1, '#ffc98a']]),
      photo: photonImage(),
      chart: chartTex(),
      clock: clockFace(),
      sign: boardTexture('jp-sign', 1024, 220, '#f7f2e6', [{text: 'PHOTON IMAGING LAB', size: 96, y: 0.52}]),
      date: boardTexture('jp-date', 768, 384, '#20305e', [
        {text: 'Sendai, Japan', size: 84, y: 0.34, color: '#ffffff'},
        {text: '2009', size: 120, y: 0.7, color: '#ffcf3a'},
      ], {border: '#f7f2e6'}),
      darkSign: boardTexture('jp-dark', 768, 256, '#a8231c', [{text: 'DARK ROOM', size: 110, y: 0.42, color: '#ffffff'}, {text: 'keep closed', size: 50, y: 0.8, color: '#ffd9d0', weight: 500}], {border: '#ffd9d0'}),
    }),
    [],
  );
  const area = focus[0] < -15 ? 'ext' : focus[0] > 15 ? 'sensor' : 'room';
  const open = doorOpen(f);
  const leak = f < B.five ? Math.max(open, 1 - ramp(f, B.closed, B.closed + 14)) : 0;
  const glow = menGlow(f);
  const hour = hourAt(f);
  const minutes = Math.min(20, Math.floor(20 * ramp(f, B.twenty + 6, B.pictures - 8)));

  return (
    <>
      <color attach="background" args={['#05060c']} />
      {area === 'ext' && (
        <>
          <SkyDome tex={tex.sky} radius={120} center={[EXT[0], 0, 0]} />
          <fog attach="fog" args={['#8a6a9a', 18, 70]} />
          <hemisphereLight args={['#b8a6ff', '#4a3a40', 0.9]} />
          <KeyLight focus={[EXT[0], 0, -1]} dir={[-9, 5, 7]} color="#ffb070" intensity={2.4} size={9} />
        </>
      )}
      {area === 'room' && (
        <>
          <hemisphereLight args={['#4a5aa8', '#0a0a14', f < B.five ? 0.5 : 0.5]} />
          <KeyLight focus={[0, 0, 0]} dir={[1.5, 7, 5]} color="#6f86ff" intensity={f < B.five ? 0.5 : 0.6} size={7} />
          {leak > 0.01 && <pointLight position={[DOOR[0] - 0.4, 1.4, 0.6]} intensity={14 * leak} distance={9} decay={1.4} color="#ffd08a" />}
          {glow > 0.02 && <pointLight position={[0, 1.2, 0.4]} intensity={3 * glow} distance={6} decay={1.5} color="#ffb85a" />}
        </>
      )}
      {area === 'sensor' && (
        <>
          <hemisphereLight args={['#3a4a8a', '#05060c', 0.5]} />
          <pointLight position={[SENSOR[0], SENSOR[1] + 1.5, SENSOR[2] + 3]} intensity={4} distance={10} decay={1.4} color="#8fb7ff" />
        </>
      )}

      {/* ---------- Outside the lab, at dusk ---------- */}
      {area === 'ext' && (
        <group>
          <mesh position={[EXT[0], 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial map={tex.paving} roughness={0.9} />
          </mesh>
          <Box p={[EXT[0], 3, -4]} s={[13, 6, 1]} map={tex.wall} />
          <Box p={[EXT[0], 6.1, -3.9]} s={[13.4, 0.3, 1.3]} c="#8a7a6a" />
          {/* lit windows */}
          {[-5, -3.2, 3.2, 5].map((x) =>
            [1.6, 3.9].map((y) => <Box key={`${x}-${y}`} p={[EXT[0] + x, y, -3.48]} s={[1.2, 1.1, 0.06]} c="#ffd68a" emissive="#ffc060" ei={1.2} shadow={false} />),
          )}
          {/* glass door */}
          <Box p={[EXT[0], 1.15, -3.46]} s={[1.6, 2.3, 0.08]} c="#ffe2a8" emissive="#ffcf80" ei={1.5} shadow={false} />
          <Box p={[EXT[0], 1.15, -3.42]} s={[0.06, 2.3, 0.04]} c="#2b2a3a" />
          <Glow pos={[EXT[0], 1.2, -3.0]} size={4} color="#ffc070" opacity={0.35} />
          <Box p={[EXT[0], 0.08, -2.9]} s={[3.2, 0.16, 1.2]} c="#a39a8e" />
          {/* signs */}
          <Board p={[EXT[0], 4.9, -3.42]} w={5.2} h={1.12} map={tex.sign} />
          <Cyl p={[EXT[0] + 2.4, 0.7, -2.2]} rt={0.05} h={1.4} c="#2b2a3a" />
          <Board p={[EXT[0] + 2.4, 1.55, -2.17]} w={1.6} h={0.8} map={tex.date} />
          {/* street lamp */}
          <Cyl p={[EXT[0] - 4.5, 2, -1.6]} rt={0.07} h={4} c="#2b2a3a" metal={0.4} />
          <Ball p={[EXT[0] - 4.5, 4.05, -1.6]} rad={0.22} c="#fff2c8" basic shadow={false} />
          <Glow pos={[EXT[0] - 4.5, 4.05, -1.6]} size={2.2} color="#ffd08a" opacity={0.8} />
          <pointLight position={[EXT[0] - 4.5, 3.8, -1.2]} intensity={10} distance={8} decay={1.5} color="#ffc070" />
          {/* trees and a bench */}
          {[[-7.5, -2.2], [7.8, -1.6], [10, -3.4]].map(([x, z], i) => (
            <group key={i}>
              <Cyl p={[EXT[0] + x, 1.0, z]} rt={0.14} rb={0.2} h={2} c="#5a3a26" />
              <Ball p={[EXT[0] + x, 2.6, z]} rad={1.2} c={i ? '#3f8f4a' : '#4c9a52'} />
              <Ball p={[EXT[0] + x + 0.5, 2.2, z + 0.3]} rad={0.8} c="#367a40" />
            </group>
          ))}
          <Box p={[EXT[0] - 2.8, 0.45, -2.6]} s={[1.6, 0.08, 0.5]} c="#9a6a46" />
          <Box p={[EXT[0] - 3.5, 0.22, -2.6]} s={[0.08, 0.44, 0.45]} c="#2b2a3a" />
          <Box p={[EXT[0] - 2.1, 0.22, -2.6]} s={[0.08, 0.44, 0.45]} c="#2b2a3a" />
          <Flat s={person('haru', 'carry', 'focused', 'case')} pos={haruAt(f)} h={1.75} bob={Math.abs(Math.sin(f * 0.32)) * 0.04} tint="#ffe2c8" />
        </group>
      )}

      {/* ---------- The sealed dark room ---------- */}
      {area === 'room' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial map={tex.floor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 2.5, -3.5]} receiveShadow>
            <planeGeometry args={[12, 5]} />
            <meshStandardMaterial map={tex.dark} roughness={1} />
          </mesh>
          <mesh position={[-5, 2.5, 1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
            <planeGeometry args={[12, 5]} />
            <meshStandardMaterial map={tex.dark} roughness={1} />
          </mesh>
          {/* right wall with the door opening (z 0 to 1.2) */}
          <mesh position={[5, 2.5, -1.75]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
            <planeGeometry args={[3.5, 5]} />
            <meshStandardMaterial map={tex.dark} roughness={1} />
          </mesh>
          <mesh position={[5, 2.5, 4.1]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
            <planeGeometry args={[5.8, 5]} />
            <meshStandardMaterial map={tex.dark} roughness={1} />
          </mesh>
          <mesh position={[5, 3.6, 0.6]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.2, 2.8]} />
            <meshStandardMaterial map={tex.dark} roughness={1} />
          </mesh>
          {/* bright corridor behind the door */}
          <mesh position={[5.6, 1.1, 0.6]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.4, 2.4]} />
            <meshBasicMaterial color={new THREE.Color('#ffe6b0').multiplyScalar(Math.max(0.02, leak))} toneMapped={false} />
          </mesh>
          {/* the door, hinged at z = 0 */}
          <group position={[DOOR[0], 0, 0]} rotation={[0, -1.25 * open, 0]}>
            <Box p={[0, 1.1, 0.6]} s={[0.08, 2.2, 1.2]} c="#2b3048" />
            <Board p={[-0.05, 1.55, 0.6]} w={0.8} h={0.27} map={tex.darkSign} r={[0, -Math.PI / 2, 0]} lit />
            <Ball p={[-0.07, 1.05, 1.05]} rad={0.05} c="#c8ccd6" metal={0.6} rough={0.3} />
          </group>
          {/* the last thin line of light round the door */}
          {leak > 0.01 && f >= B.sealed && (
            <>
              <Box p={[4.97, 1.1, 1.2]} s={[0.02, 2.2, 0.03]} c="#ffe6b0" basic shadow={false} opacity={leak} />
              <Glow pos={[4.9, 1.1, 1.18]} size={1.2} color="#ffd08a" opacity={0.6 * leak} sx={0.3} />
            </>
          )}
          {f >= B.sealed && f < B.five && <Flat s={person('haru', 'reach', f < B.closed ? 'strain' : 'happy')} pos={[4.3, 0, 1.75]} h={1.75} tint="#c8d0ff" />}

          {/* stools and the five volunteers */}
          {MEN.map((m, i) => {
            const who = (['v1', 'v2', 'v3', 'v4', 'v5'] as Who[])[i];
            const expr = f >= B.glowing ? (i === 2 ? 'happy' : 'calm') : f >= B.darkness && i === 4 ? 'awe' : 'calm';
            const tint = new THREE.Color('#8a96d8').lerp(new THREE.Color('#ffe6c8'), Math.min(1, glow * 0.8));
            return (
              <group key={i}>
                <Cyl p={[m[0], 0.37, m[2]]} rt={0.24} h={0.06} c="#6a6e7c" />
                <Cyl p={[m[0], 0.18, m[2]]} rt={0.04} h={0.36} c="#3a3f4c" />
                <Cyl p={[m[0], 0.015, m[2]]} rt={0.2} h={0.03} c="#3a3f4c" />
                <Flat s={person(who, 'sit', expr)} pos={[m[0], 0, m[2] + 0.02]} h={MEN_H} tint={'#' + tint.getHexString()} />
                {glow > 0.01 && (
                  <>
                    <Glow pos={[m[0], SEAT.head, m[2] + 0.12]} size={1.0 + 0.3 * glow} color="#ffcf6a" opacity={(f >= B.face && f < B.where + 20 && i === 2 ? 0.16 : 0.45) * glow} />
                    <Glow pos={[m[0], SEAT.neck, m[2] + 0.12]} size={0.5} color="#ff9a3a" opacity={0.35 * glow} />
                    <Glow pos={[m[0], 0.55, m[2] + 0.12]} size={0.9} color="#e8503a" opacity={0.15 * glow} />
                  </>
                )}
              </group>
            );
          })}
          {/* the hot spots on one face, named one by one */}
          {f >= B.face && f < B.where + 20 && (
            <>
              {f >= B.cheeks && [-1, 1].map((k) => <Glow key={k} pos={[MEN[2][0] + k * SEAT.cheekX, SEAT.cheek, MEN[2][2] + 0.16]} size={0.22 * ramp(f, B.cheeks, B.cheeks + 5) * (1 + 0.08 * Math.sin(f * 0.4))} color="#fff2a0" opacity={0.95} />)}
              {f >= B.forehead && <Glow pos={[MEN[2][0], SEAT.forehead, MEN[2][2] + 0.16]} size={0.26 * ramp(f, B.forehead, B.forehead + 5)} color="#fff2a0" opacity={0.95} />}
              {f >= B.neck && <Glow pos={[MEN[2][0], SEAT.neck + 0.02, MEN[2][2] + 0.16]} size={0.22 * ramp(f, B.neck, B.neck + 5)} color="#fff2a0" opacity={0.95} />}
            </>
          )}

          {/* the photon camera on its tripod */}
          {[0, 1, 2].map((k) => {
            const a = (k / 3) * Math.PI * 2;
            return <Cyl key={k} p={[CAM[0] + Math.sin(a) * 0.25, 0.5, CAM[2] + Math.cos(a) * 0.25]} rt={0.02} h={1.05} r={[Math.cos(a) * 0.24, 0, -Math.sin(a) * 0.24]} c="#2b2a3a" metal={0.5} />;
          })}
          <Box p={[CAM[0], 1.12, CAM[2]]} s={[0.5, 0.38, 0.46]} c="#3a3f4c" metal={0.3} rough={0.4} />
          <Cyl p={[CAM[0], 1.12, CAM[2] - 0.38]} rt={0.14} h={0.34} r={[Math.PI / 2, 0, 0]} c="#1b1e26" metal={0.4} rough={0.3} />
          <Cyl p={[CAM[0], 1.12, CAM[2] - 0.56]} rt={0.11} h={0.02} r={[Math.PI / 2, 0, 0]} c="#2a4a9a" metal={0.6} rough={0.1} />
          {/* cooling unit, cables */}
          <Box p={[CAM[0], 1.38, CAM[2] + 0.05]} s={[0.3, 0.14, 0.3]} c="#c8ccd6" metal={0.4} />
          <Board p={[CAM[0], 1.13, CAM[2] + 0.235]} w={0.34} h={0.17} map={timerTex(minutes)} />
          <Glow pos={[CAM[0], 1.13, CAM[2] + 0.3]} size={0.5} color="#5ff0b8" opacity={0.25} />

          {/* the control desk and the monitor with the photon pictures */}
          <Box p={[SCREEN[0], 0.72, SCREEN[2] - 0.15]} s={[1.3, 0.06, 0.7]} c="#4a3a2e" />
          {[[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]].map(([dx, dz], i) => (
            <Box key={i} p={[SCREEN[0] + dx, 0.35, SCREEN[2] - 0.15 + dz * 0.9]} s={[0.05, 0.7, 0.05]} c="#2b2a3a" />
          ))}
          <Box p={[SCREEN[0], SCREEN[1], SCREEN[2] - 0.04]} s={[1.02, 0.66, 0.05]} c="#15171e" />
          <Board p={SCREEN} w={0.96} h={0.6} map={tex.photo} />
          <Glow pos={[SCREEN[0], SCREEN[1], SCREEN[2] + 0.2]} size={1.6} color="#ffb85a" opacity={0.18} />

          {/* clock and chart */}
          <group position={CLOCK}>
            <mesh>
              <circleGeometry args={[0.46, 48]} />
              <meshBasicMaterial map={tex.clock} toneMapped={false} color="#c8ccd8" />
            </mesh>
            <mesh position={[0, 0, 0.02]} rotation={[0, 0, -((hour % 12) / 12) * Math.PI * 2]}>
              <boxGeometry args={[0.035, 0.24, 0.01]} />
              <meshBasicMaterial color="#17121a" />
            </mesh>
            <mesh position={[0, 0, 0.025]} rotation={[0, 0, -((hour % 1) * Math.PI * 2)]}>
              <boxGeometry args={[0.022, 0.36, 0.01]} />
              <meshBasicMaterial color="#17121a" />
            </mesh>
          </group>
          {(() => {
            const u = clamp01((hour - 10) / 6) * 0.5 + (f >= B.inStep ? 0.5 * ramp(f, B.inStep, B.inStep + 40) : 0);
            const w = 1.7;
            const coverW = w * (1 - (0.06 + 0.88 * u));
            return (
              <>
                <Board p={CHART} w={w} h={1.275} map={tex.chart} />
                {coverW > 0.01 && (
                  <mesh position={[CHART[0] + w / 2 - 0.04 - coverW / 2, CHART[1] - 0.06, CHART[2] + 0.005]}>
                    <planeGeometry args={[coverW, 0.95]} />
                    <meshBasicMaterial color="#f7f2e6" toneMapped={false} />
                  </mesh>
                )}
              </>
            );
          })()}
        </group>
      )}

      {/* ---------- Inside the camera: photons landing on the sensor ---------- */}
      {area === 'sensor' && <SensorSet f={f} />}
    </>
  );
};

const GRID = 18;
const PITCH = 0.1;
const PHOTONS = 40;
const SensorSet: React.FC<{f: number}> = ({f}) => {
  const pixels = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(PITCH * 0.82, PITCH * 0.82, 0.03), new THREE.MeshBasicMaterial({toneMapped: false}), GRID * GRID);
    const o = new THREE.Object3D();
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++) {
        o.position.set(SENSOR[0] + (c - (GRID - 1) / 2) * PITCH, SENSOR[1] + ((GRID - 1) / 2 - r) * PITCH, SENSOR[2] + 0.03);
        o.updateMatrix();
        m.setMatrixAt(r * GRID + c, o.matrix);
        m.setColorAt(r * GRID + c, new THREE.Color('#10203a'));
      }
    m.frustumCulled = false;
    return m;
  }, []);
  const photons = useMemo(() => {
    const r = rng(77);
    return Array.from({length: PHOTONS}, (_, i) => ({
      cell: Math.floor(r() * GRID * GRID),
      land: B.sensitive + 20 + Math.floor((i / PHOTONS) * (B.twenty + 30 - B.sensitive - 20) + r() * 12),
      from: [(r() - 0.5) * 3, (r() - 0.5) * 2.4] as [number, number],
    }));
  }, []);
  const lit = new Map<number, number>();
  for (const p of photons) if (f >= p.land) lit.set(p.cell, Math.max(lit.get(p.cell) ?? 0, 1 - Math.min(0.6, (f - p.land) / 60)));
  const col = new THREE.Color();
  for (let i = 0; i < GRID * GRID; i++) {
    const v = lit.get(i) ?? 0;
    col.set('#10203a').lerp(new THREE.Color('#ffe08a'), v);
    pixels.setColorAt(i, col);
  }
  pixels.instanceColor!.needsUpdate = true;
  const cellPos = (cell: number): V3 => [SENSOR[0] + ((cell % GRID) - (GRID - 1) / 2) * PITCH, SENSOR[1] + ((GRID - 1) / 2 - Math.floor(cell / GRID)) * PITCH, SENSOR[2] + 0.06];
  return (
    <group>
      {/* the dark barrel of the camera, lens rings, the chip */}
      <mesh position={[SENSOR[0], SENSOR[1], 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.6, 2.6, 12, 48, 1, true]} />
        <meshStandardMaterial color="#1b1e2a" side={THREE.BackSide} roughness={0.7} />
      </mesh>
      {[1.5, 4.5].map((z) => (
        <mesh key={z} position={[SENSOR[0], SENSOR[1], z]}>
          <torusGeometry args={[2.3, 0.18, 12, 64]} />
          <meshStandardMaterial color="#3a3f4c" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[SENSOR[0], SENSOR[1], 4.5]}>
        <circleGeometry args={[2.25, 48]} />
        <meshStandardMaterial color="#6a8ad8" transparent opacity={0.12} roughness={0.05} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <Box p={[SENSOR[0], SENSOR[1], SENSOR[2] - 0.06]} s={[2.4, 2.4, 0.1]} c="#1a6a4a" />
      <Box p={[SENSOR[0], SENSOR[1], SENSOR[2] - 0.01]} s={[GRID * PITCH + 0.12, GRID * PITCH + 0.12, 0.04]} c="#1b1e26" metal={0.5} rough={0.3} />
      {[-1, 1].map((k) => [-0.9, -0.3, 0.3, 0.9].map((d) => <Box key={`${k}${d}`} p={[SENSOR[0] + k * 1.25, SENSOR[1] + d, SENSOR[2] - 0.02]} s={[0.12, 0.08, 0.04]} c="#d8b04a" metal={0.7} rough={0.3} />))}
      <primitive object={pixels} />
      {photons.map((p, i) => {
        const d = f - (p.land - 22);
        if (d < 0 || d > 30) return null;
        const u = Math.min(1, d / 22);
        const end = cellPos(p.cell);
        const pos: V3 = [end[0] + p.from[0] * (1 - u), end[1] + p.from[1] * (1 - u), end[2] + 7 * (1 - u)];
        return (
          <group key={i}>
            <Glow pos={pos} size={u < 1 ? 0.22 : 0.5 * (1 - (d - 22) / 8)} color="#fff2b0" opacity={0.95} />
            {u < 1 && <Glow pos={[pos[0], pos[1], pos[2] + 0.4]} size={0.12} color="#ffd06a" opacity={0.5} />}
          </group>
        );
      })}
    </group>
  );
};
