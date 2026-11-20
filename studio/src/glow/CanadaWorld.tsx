// Canada, 2025: the lab in the snow (x = -30), a clinic corner (x = -12), the dark lab bench with the mice
// and a plant (origin), and a big leaf with a scratch for the macro shot (x = 20).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, V3} from '../shared/flat';
import {ramp} from '../shared/camera';
import {DustBurst, Glow, Particles, SkyDome} from '../shared/fx';
import {Ball, Board, Box, Cyl, KeyLight} from '../shared/kit';
import {boardTexture} from '../shared/people';
import {plasterTexture, woodTexture} from '../shared/toon';
import {B} from './beats';
import {mouse, person, radical} from './cast';
import {leafTex, pavingTex, scanTex, skyGrad, snowTex} from './textures';
import {MOUSE_ASPECT} from '../shared/people';

export const CEXT: V3 = [-30, 0, 0];
export const CLINIC: V3 = [-12, 0, 0];
export const LEAF: V3 = [20, 1.6, 0];
export const BOX: V3 = [0, 0.9, 0];
export const PLANT: V3 = [1.25, 0.9, 0.1];
export const MAYA_IN: V3 = [-1.15, 0, -0.75];
export const MICE: V3[] = [
  [-0.22, 0.905, 0.06],
  [0.24, 0.905, -0.06],
];
const LEAF_W = 3.4;
const LEAF_H = 1.7;
// the scratch on the leaf texture (pixels of 1024 x 512) in world space
const SCRATCH = [[560, 120], [640, 200], [610, 250], [720, 360]].map(([u, v]) => [LEAF[0] + (u / 1024 - 0.5) * LEAF_W, LEAF[1] + (0.5 - v / 512) * LEAF_H, LEAF[2] + 0.04] as V3);

export const miceGlow = (f: number) => (f < B.died ? 0.35 + 0.65 * ramp(f, B.miceGlow - 30, B.miceGlow + 6) : 1 - 0.92 * ramp(f, B.died + 30, B.vanished + 10));
export const mayaAt = (f: number): V3 => {
  const u = ramp(f, B.canada + 4, B.mice - 10);
  return [CEXT[0] - 4 + 3.4 * u, 0, 1.6 - 3.6 * u];
};

export const CanadaWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const tex = useMemo(
    () => ({
      snow: snowTex(),
      wall: plasterTexture('#8fa0b8', 12),
      warm: plasterTexture('#e8d6c0', 13),
      dark: plasterTexture('#1b2033', 14),
      wood: woodTexture(),
      floor: pavingTex('#b8c0cc'),
      sky: skyGrad('winter', [[0, '#7fa6d8'], [0.6, '#cfe0f2'], [1, '#eef3fa']]),
      leaf: leafTex(),
      scan: scanTex(),
      sign: boardTexture('ca-sign', 1024, 220, '#f7f2e6', [{text: 'LIGHT BIOLOGY LAB', size: 96, y: 0.52}]),
      date: boardTexture('ca-date', 768, 384, '#7a1c2a', [
        {text: 'Calgary, Canada', size: 80, y: 0.34, color: '#ffffff'},
        {text: '2025', size: 120, y: 0.7, color: '#ffcf3a'},
      ], {border: '#f7f2e6'}),
    }),
    [],
  );
  const x = focus[0];
  const area = x < -20 ? 'ext' : x < -6 ? 'clinic' : x < 10 ? 'lab' : 'leaf';
  const mg = Math.max(0, miceGlow(f));
  const dead = f >= B.died + 6;
  const leafBright = ramp(f, B.brighter - 4, B.brighter + 10);

  return (
    <>
      {area === 'ext' && (
        <>
          <SkyDome tex={tex.sky} radius={120} center={[CEXT[0], 0, 0]} />
          <fog attach="fog" args={['#dfe8f2', 16, 70]} />
          <hemisphereLight args={['#dfeaff', '#8a96a8', 1.3]} />
          <KeyLight focus={[CEXT[0], 0, -1]} dir={[6, 9, 8]} color="#fff6e8" intensity={2.0} size={9} />
        </>
      )}
      {area === 'clinic' && (
        <>
          <color attach="background" args={['#2a2420']} />
          <hemisphereLight args={['#fff0dc', '#5a4a3a', 1.0]} />
          <KeyLight focus={CLINIC} dir={[3, 7, 6]} color="#ffe2b8" intensity={2.2} size={6} />
        </>
      )}
      {area === 'lab' && (
        <>
          <color attach="background" args={['#070912']} />
          <hemisphereLight args={['#4a5aa8', '#0a0a14', 0.55]} />
          <KeyLight focus={[0, 0, 0]} dir={[-2, 7, 5]} color="#8fa6ff" intensity={0.8} size={5} />
          {mg > 0.03 && f < B.plants && <pointLight position={[BOX[0], BOX[1] + 0.25, BOX[2] + 0.3]} intensity={3.5 * mg} distance={2.5} decay={1.5} color="#ffd88a" />}
        </>
      )}
      {area === 'leaf' && (
        <>
          <color attach="background" args={['#05070a']} />
          <hemisphereLight args={['#4a6a5a', '#05070a', 0.7]} />
          <pointLight position={[LEAF[0] - 2, LEAF[1] + 2, 3]} intensity={6} distance={10} decay={1.4} color="#bfe8c8" />
          {leafBright > 0.02 && <pointLight position={[SCRATCH[1][0], SCRATCH[1][1], 0.8]} intensity={5 * leafBright} distance={3} decay={1.5} color="#ffd06a" />}
        </>
      )}

      {/* ---------- Outside, in the snow ---------- */}
      {area === 'ext' && (
        <group>
          <mesh position={[CEXT[0], 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[70, 70]} />
            <meshStandardMaterial map={tex.snow} roughness={0.95} />
          </mesh>
          <Box p={[CEXT[0], 3, -4]} s={[13, 6, 1]} map={tex.wall} />
          <Box p={[CEXT[0], 6.15, -3.8]} s={[13.4, 0.3, 1.5]} c="#eef3fa" />
          {[-5, -3.2, 3.2, 5].map((dx) => [1.6, 3.9].map((y) => <Box key={`${dx}-${y}`} p={[CEXT[0] + dx, y, -3.48]} s={[1.2, 1.1, 0.06]} c="#ffe6b0" emissive="#ffd88a" ei={0.8} shadow={false} />))}
          <Box p={[CEXT[0], 1.15, -3.46]} s={[1.6, 2.3, 0.08]} c="#cfe6ff" emissive="#a8ccff" ei={0.6} shadow={false} />
          <Board p={[CEXT[0], 4.9, -3.42]} w={5.2} h={1.12} map={tex.sign} />
          <Cyl p={[CEXT[0] + 2.4, 0.7, -2.2]} rt={0.05} h={1.4} c="#2b2a3a" />
          <Board p={[CEXT[0] + 2.4, 1.55, -2.17]} w={1.6} h={0.8} map={tex.date} />
          {[[-7, -2], [-9, 0.5], [7.5, -1.5], [9.5, 1], [-6, 4]].map(([dx, dz], i) => (
            <group key={i}>
              <Cyl p={[CEXT[0] + dx, 0.5, dz]} rt={0.12} h={1} c="#5a3a26" />
              <mesh position={[CEXT[0] + dx, 1.9, dz]} castShadow receiveShadow>
                <coneGeometry args={[1.0, 2.6, 10]} />
                <meshStandardMaterial color="#2f6a4a" roughness={0.9} />
              </mesh>
              <mesh position={[CEXT[0] + dx, 2.6, dz]} castShadow>
                <coneGeometry args={[0.62, 1.2, 10]} />
                <meshStandardMaterial color="#f2f6fb" roughness={0.9} />
              </mesh>
            </group>
          ))}
          <Particles
            count={160}
            seed={13}
            shape="dot"
            color="#ffffff"
            at={(i, r) => {
              const px = CEXT[0] + (r() - 0.5) * 18;
              const pz = (r() - 0.5) * 12;
              const fall = ((f * (0.012 + r() * 0.01) + r()) % 1);
              return {pos: [px + Math.sin(f * 0.03 + i) * 0.3, 6 - fall * 6, pz], size: 0.04 + r() * 0.04};
            }}
          />
          <Flat s={person('maya', 'carry', 'happy', 'clipboard')} pos={mayaAt(f)} h={1.72} bob={Math.abs(Math.sin(f * 0.32)) * 0.04} />
        </group>
      )}

      {/* ---------- Clinic corner ---------- */}
      {area === 'clinic' && (
        <group>
          <mesh position={[CLINIC[0], 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[14, 14]} />
            <meshStandardMaterial map={tex.floor} roughness={0.8} color="#c8d8e0" />
          </mesh>
          <mesh position={[CLINIC[0], 2.5, -1.8]} receiveShadow>
            <planeGeometry args={[14, 5]} />
            <meshStandardMaterial map={tex.warm} roughness={0.95} />
          </mesh>
          <Box p={[CLINIC[0], 0.5, -1.78]} s={[14, 1.0, 0.04]} c="#8fc9c0" shadow={false} />
          <Box p={[CLINIC[0] + 0.2, 1.95, -1.76]} s={[1.72, 1.12, 0.06]} c="#20242e" />
          <Board p={[CLINIC[0] + 0.2, 1.95, -1.72]} w={1.6} h={1.04} map={tex.scan} />
          <Glow pos={[CLINIC[0] + 0.2, 1.95, -1.5]} size={2} color="#7fb2ff" opacity={0.15} />
          {/* exam stool, the patient, the scanner hovering without touching */}
          <Cyl p={[CLINIC[0] - 0.6, 0.37, 0]} rt={0.26} h={0.06} c="#f2f4f7" />
          <Cyl p={[CLINIC[0] - 0.6, 0.18, 0]} rt={0.04} h={0.36} c="#9aa1ae" metal={0.5} />
          <Flat s={person('patient', 'sit', 'calm')} pos={[CLINIC[0] - 0.6, 0, 0.02]} h={1.72} />
          <Cyl p={[CLINIC[0] - 1.6, 1.1, -0.4]} rt={0.05} h={2.2} c="#c8ccd6" metal={0.4} />
          <Box p={[CLINIC[0] - 1.25, 2.15, -0.25]} s={[0.8, 0.07, 0.07]} r={[0, -0.4, -0.25]} c="#c8ccd6" metal={0.4} />
          <Cyl p={[CLINIC[0] - 0.92, 1.28, 0.05]} rt={0.12} rb={0.18} h={0.22} r={[0, 0, -0.6]} c="#f2f4f7" />
          <Cyl p={[CLINIC[0] - 0.85, 1.18, 0.06]} rt={0.1} h={0.02} r={[0, 0, -0.6]} c="#7fe8ff" basic />
          <Glow pos={[CLINIC[0] - 0.8, 1.1, 0.1]} size={0.6 + 0.05 * Math.sin(f * 0.3)} color="#7fe8ff" opacity={0.6} />
          <Flat s={person('doc', 'hold', f >= B.tissue ? 'happy' : 'focused')} pos={[CLINIC[0] + 0.55, 0, 0.35]} h={1.78} />
          <Box p={[CLINIC[0] + 2.2, 0.45, -1.2]} s={[1.2, 0.9, 0.6]} c="#f2f4f7" />
          <Ball p={[CLINIC[0] + 2.0, 1.1, -1.2]} rad={0.18} c="#3cae5c" />
          <Cyl p={[CLINIC[0] + 2.0, 0.95, -1.2]} rt={0.1} rb={0.08} h={0.16} c="#c0566e" />
        </group>
      )}

      {/* ---------- The dark lab bench: mice, a plant ---------- */}
      {area === 'lab' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[14, 14]} />
            <meshStandardMaterial map={tex.floor} roughness={0.9} color="#3a4258" />
          </mesh>
          <mesh position={[0, 2.5, -2.2]} receiveShadow>
            <planeGeometry args={[14, 5]} />
            <meshStandardMaterial map={tex.dark} roughness={1} />
          </mesh>
          <Box p={[0, 0.44, 0]} s={[3.6, 0.88, 1.1]} map={tex.wood} c="#8a7a8e" />
          <Box p={[0, 0.885, 0]} s={[3.7, 0.04, 1.2]} c="#2a2f3e" />
          {/* imaging box: open at the front */}
          <Box p={[0, 1.25, -0.36]} s={[1.3, 0.7, 0.04]} c="#15171e" />
          <Box p={[-0.64, 1.25, 0]} s={[0.04, 0.7, 0.76]} c="#15171e" />
          <Box p={[0.64, 1.25, 0]} s={[0.04, 0.7, 0.76]} c="#15171e" />
          <Box p={[0, 1.61, 0]} s={[1.32, 0.04, 0.78]} c="#15171e" />
          <Box p={[0, 1.78, 0]} s={[0.36, 0.3, 0.3]} c="#3a3f4c" metal={0.3} />
          <Cyl p={[0, 1.6, 0]} rt={0.09} h={0.08} c="#1b1e26" />
          <Box p={[0, 0.91, 0]} s={[1.2, 0.02, 0.7]} c="#20242e" />
          {MICE.map((m, i) => {
            const walk = dead ? 0 : Math.sin(f * 0.05 + i * 2) * 0.12;
            const p: V3 = [m[0] + walk, m[1], m[2]];
            return (
              <group key={i}>
                <Flat s={mouse(dead ? 'curl' : 'sniff')} pos={p} h={0.2} aspect={MOUSE_ASPECT} flip={i === 1} tint={'#' + new THREE.Color('#8a96d8').lerp(new THREE.Color('#fff6dc'), mg).getHexString()} />
                {mg > 0.02 && <Glow pos={[p[0], p[1] + 0.1, p[2] + 0.06]} size={0.55 + 0.03 * Math.sin(f * 0.2 + i)} color="#ffd06a" opacity={0.6 * mg} sx={1.4} />}
              </group>
            );
          })}
          {/* the plant */}
          <Cyl p={[PLANT[0], PLANT[1] + 0.13, PLANT[2]]} rt={0.16} rb={0.12} h={0.26} c="#c0566e" />
          <Cyl p={[PLANT[0], PLANT[1] + 0.42, PLANT[2]]} rt={0.015} h={0.4} c="#3f8f4a" />
          {[0, 1, 2, 3, 4].map((k) => {
            const a = k * 1.3;
            return (
              <mesh key={k} position={[PLANT[0] + Math.cos(a) * 0.13, PLANT[1] + 0.4 + k * 0.06, PLANT[2] + Math.sin(a) * 0.13]} rotation={[0.6 * Math.sin(a), a, 0.7]} scale={[0.17, 0.05, 0.08]} castShadow>
                <sphereGeometry args={[1, 16, 10]} />
                <meshStandardMaterial color="#4cae52" roughness={0.7} />
              </mesh>
            );
          })}
          {f >= B.plants && <Glow pos={[PLANT[0], PLANT[1] + 0.5, PLANT[2] + 0.1]} size={0.7} color="#bfffb0" opacity={0.25} />}
          {f >= B.plants && <pointLight position={[PLANT[0] + 0.4, PLANT[1] + 1.2, PLANT[2] + 0.8]} intensity={4} distance={3} decay={1.5} color="#dfe8ff" />}
          {/* monitor beside the box */}
          <Box p={[-1.35, 1.25, -0.25]} s={[0.6, 0.4, 0.04]} r={[0, 0.35, 0]} c="#15171e" />
          <Flat s={person('maya', f >= B.mice && f < B.died ? 'point' : 'stand', f >= B.died ? 'calm' : 'happy')} pos={MAYA_IN} h={1.72} tint="#b8c4ff" />
        </group>
      )}

      {/* ---------- The leaf, close up ---------- */}
      {area === 'leaf' && (
        <group>
          <mesh position={[LEAF[0], LEAF[1], -0.6]}>
            <planeGeometry args={[14, 10]} />
            <meshStandardMaterial color="#0b1410" roughness={1} />
          </mesh>
          <mesh position={LEAF} rotation={[0, 0, 0.08]}>
            <planeGeometry args={[LEAF_W, LEAF_H]} />
            <meshStandardMaterial map={tex.leaf} transparent alphaTest={0.4} roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
          <Cyl p={[LEAF[0] - LEAF_W / 2 - 0.4, LEAF[1] - 0.05, LEAF[2]]} rt={0.04} h={0.9} r={[0, 0, Math.PI / 2]} c="#3f8f4a" />
          {/* a faint glow over the whole leaf, a brighter one along the scratch */}
          <Glow pos={[LEAF[0], LEAF[1], LEAF[2] + 0.05]} size={3.4} color="#7fe8b0" opacity={0.12} sx={1.9} />
          {leafBright > 0.01 &&
            SCRATCH.map((p, i) => <Glow key={i} pos={p} size={(0.5 + 0.1 * Math.sin(f * 0.3 + i)) * leafBright} color="#ffd06a" opacity={0.9} />)}
          {leafBright > 0.01 && <Glow pos={SCRATCH[1]} size={1.6 * leafBright} color="#ffb030" opacity={0.35} />}
          <DustBurst f={f} from={B.damaged} pos={SCRATCH[1]} size={0.25} color="#cfeab0" n={8} />
          {f >= B.because &&
            [0, 1, 2, 3, 4, 5].map((k) => {
              const at = B.because + k * 7;
              if (f < at) return null;
              const base = SCRATCH[k % 4];
              const u = Math.min(1, (f - at) / 8);
              return <Flat key={k} s={radical('wild')} pos={[base[0] + Math.cos(k * 2.1) * 0.35, base[1] - 0.2 + Math.sin(k * 1.7) * 0.25, base[2] + 0.1]} h={0.28 * u} aspect={1} airborne />;
            })}
        </group>
      )}
    </>
  );
};
