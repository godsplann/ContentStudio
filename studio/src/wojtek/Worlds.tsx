// The three places of the Wojtek story. Each is its own fully lit 3D world with the ground at y = 0;
// figures are flat stickers that face the camera. All motion comes from the frame number.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, useCam, V3} from '../shared/flat';
import {ramp} from '../shared/camera';
import {DustBurst, Flame, Glow, SkyDome} from '../shared/fx';
import {Board, Box, Cyl, KeyLight} from '../shared/kit';
import {cloudTexture, earthTexture, rippleTexture, rockTexture, sandTexture, skyTexture} from '../shared/nature';
import {BEAR_ASPECT} from '../shared/bear';
import {B, s} from './beats';
import {bear, person} from './cast';
import {
  bearCarryAt, BEAR_SEAT, BOOK, BOY, CAMP_CRATE, CUB_HELD, DESK, DESK_TOP, DOOR, FIRE, FORM, OFFICER, QUAY_Z, RAMP_FOOT, rampWalk,
  SERGEANT, SHIP_Z, SIGN, STACK, stackCount, TRADER, TRUCK, WATCH_SEAT,
} from './story';
import {badgeTexture, canvasCloth, CORAL, crateTexture, formTexture, hullTexture, noPetsTexture, pavingTexture, paybookTexture} from './textures';

const H = 1.75; // a standing person
const BEAR_UP = 2.35; // Wojtek grown, standing
const BEAR_SIT = 1.95; // Wojtek grown, sitting
const CUB = 0.85;
const q = (u: number, n = 12) => Math.round(u * n) / n;

// A ridge tent: a triangular prism 2.2 m high, 3.4 m wide and 4 m long (along z).
const tentGeo = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(-1.7, 0);
  sh.lineTo(1.7, 0);
  sh.lineTo(0, 2.2);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, {depth: 4, bevelEnabled: false});
  g.translate(0, 0, -2);
  return g;
})();

// ---------- Shared pieces ----------

const Sky: React.FC<{stops: [number, string][]}> = ({stops}) => {
  const cam = useCam();
  const tex = useMemo(() => skyTexture(stops), [stops]);
  return <SkyDome tex={tex} center={[cam.x, cam.y, cam.z]} radius={600} />;
};

const Clouds: React.FC<{f: number; tint?: string}> = ({f, tint = '#ffffff'}) => {
  const tex = useMemo(() => cloudTexture(), []);
  return (
    <>
      {[
        [-200, 80, -380, 190],
        [120, 100, -420, 220],
        [320, 70, -260, 160],
        [-360, 90, 60, 200],
      ].map(([x, y, z, w], i) => (
        <sprite key={i} position={[x + f * 0.02 * (i + 1), y, z]} scale={[w, w * 0.4, 1]}>
          <spriteMaterial map={tex} color={tint} transparent opacity={0.8} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </>
  );
};

// A crate: wood on every side, a stencil on the front.
export const Crate: React.FC<{p: V3; s?: V3; stencil?: string; color?: string; seed?: number; ry?: number}> = ({p, s: size = [0.9, 0.55, 0.6], stencil = '', color, seed = 1, ry = 0}) => {
  const plain = crateTexture('', undefined, seed);
  const front = crateTexture(stencil, color, seed);
  const mats = useMemo(
    () => [plain, plain, plain, plain, front, plain].map((m) => new THREE.MeshStandardMaterial({map: m, roughness: 0.85})),
    [plain, front],
  );
  return (
    <mesh position={[p[0], p[1] + size[1] / 2, p[2]]} rotation={[0, ry, 0]} material={mats} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
};

// The sergeant's folding desk under a canvas awning, with the form and the paybook on it.
const Desk: React.FC<{f: number; form: THREE.Texture}> = ({f, form}) => {
  const cloth = canvasCloth('#b9aa7c');
  const book = paybookTexture();
  const [x, , z] = DESK;
  return (
    <group>
      {/* table */}
      <Box p={[x, DESK_TOP - 0.025, z]} s={[1.7, 0.05, 0.9]} c="#8a6a44" rough={0.7} />
      {[[-0.78, -0.38], [0.78, -0.38], [-0.78, 0.38], [0.78, 0.38]].map(([dx, dz], i) => (
        <Cyl key={i} p={[x + dx, DESK_TOP / 2 - 0.02, z + dz]} rt={0.025} h={DESK_TOP - 0.04} c="#5a4630" />
      ))}
      {/* the form, the paybook, an inkwell and a pen */}
      <Board p={FORM} w={0.42} h={0.56} map={form} r={[-Math.PI / 2, 0, 0.06]} lit />
      <Board p={BOOK} w={0.22} h={0.3} map={book} r={[-Math.PI / 2, 0, -0.2]} />
      <Cyl p={[x + 0.62, DESK_TOP + 0.04, z - 0.2]} rt={0.04} h={0.08} c="#20242c" rough={0.3} />
      <Box p={[x + 0.25, DESK_TOP + 0.01, z + 0.12]} s={[0.17, 0.012, 0.012]} r={[0, 0.5, 0]} c="#1e2a52" />
      {/* the sergeant's stool */}
      <Box p={[SERGEANT[0], 0.22, SERGEANT[2] - 0.12]} s={[0.45, 0.44, 0.4]} c="#6a4c2e" />
      {/* awning on four poles */}
      {[[-1.3, -1.0], [1.3, -1.0], [-1.3, 1.3], [1.3, 1.3]].map(([dx, dz], i) => (
        <Cyl key={i} p={[x + dx, dz < 0 ? 1.35 : 1.15, z + dz]} rt={0.03} h={dz < 0 ? 2.7 : 2.3} c="#5a4630" />
      ))}
      <mesh position={[x, 2.5, z + 0.15]} rotation={[-Math.PI / 2 + 0.17, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[2.8, 2.5]} />
        <meshStandardMaterial map={cloth} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* the flap moves a little in the breeze */}
      <mesh position={[x, 2.18 + 0.02 * Math.sin(f * 0.15), z + 1.42]} rotation={[0.08 * Math.sin(f * 0.12), 0, 0]} castShadow>
        <planeGeometry args={[2.8, 0.3]} />
        <meshStandardMaterial map={cloth} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    </group>
  );
};

// What the enlistment form shows at frame f.
export const formAt = (f: number) => {
  const opening = f < B.iran;
  const name = opening ? q(ramp(f, B.name - 4, B.name + 16)) : 1;
  const rank = opening ? q(ramp(f, B.rank - 4, B.rank + 16)) : 1;
  const num = opening ? q(ramp(f, B.number - 4, B.number + 16)) : 1;
  const strike = f >= B.crosses ? q(ramp(f, s(63.6), s(64.9)), 16) : 0;
  return formTexture(name, rank, num, strike);
};

// ---------- The dock (Egypt): the troopship, the gangway, the sign, the desk ----------

export const DockWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const tex = useMemo(() => ({ripple: rippleTexture([40, 40]), hull: hullTexture(), paving: pavingTexture()}), []);
  const tint = '#fff6ea';
  const ramped = f >= B.private;
  const wpos = rampWalk(f);
  const officerPose = f < B.officer ? 'stand' : f < B.lads ? 'shrug' : f < B.so ? 'point' : 'stand';
  const officerExpr = f < B.officer ? 'calm' : f < B.so ? 'happy' : f >= B.private ? 'awe' : 'calm';
  const atDesk = f < B.iran || (f >= B.so && f < B.private);
  const L = 6.97; // gangway length
  const ang = Math.atan2(DOOR[1] - RAMP_FOOT[1], RAMP_FOOT[2] - DOOR[2]);
  return (
    <>
      <fog attach="fog" args={['#e8dcc6', 60, 420]} />
      <Sky stops={[[0, '#5e9ad0'], [0.38, '#a6cbe6'], [0.49, '#f3e2c4'], [0.52, '#c9b48e'], [1, '#8a7a5a']]} />
      <Clouds f={f} />
      <hemisphereLight args={['#cfe2f5', '#8a7458', 1.0]} />
      <KeyLight focus={focus} dir={[18, 26, 22]} color="#ffeccc" intensity={2.6} size={12} />
      <Glow pos={[260, 160, 300]} size={120} color="#fff0c8" opacity={0.6} />

      {/* harbour water and the quay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -150]}>
        <planeGeometry args={[800, 292]} />
        <meshStandardMaterial color="#2f7d8f" roughness={0.25} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(f * 0.01) % 2, -1.19, -150]}>
        <planeGeometry args={[800, 292]} />
        <meshBasicMaterial map={tex.ripple} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.8, 13]} receiveShadow>
        <boxGeometry args={[160, 1.6, 34]} />
        <meshStandardMaterial map={tex.paving} roughness={0.9} />
      </mesh>
      <Box p={[0, -0.05, QUAY_Z + 0.2]} s={[160, 0.1, 0.4]} c="#a89878" />
      {[-14, -2, 14, 24].map((x, i) => (
        <group key={i}>
          <Cyl p={[x, 0.3, QUAY_Z + 0.5]} rt={0.18} rb={0.22} h={0.6} c="#2c2e30" rough={0.4} metal={0.4} />
          <Cyl p={[x, 0.62, QUAY_Z + 0.5]} rt={0.26} h={0.08} c="#2c2e30" rough={0.4} metal={0.4} />
        </group>
      ))}

      {/* the troopship */}
      <mesh position={[6, 2.5, SHIP_Z]} castShadow receiveShadow>
        <boxGeometry args={[70, 8, 6]} />
        <meshStandardMaterial map={tex.hull} roughness={0.7} />
      </mesh>
      <mesh position={[-29, 2.5, SHIP_Z]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[4.24, 8, 4.24]} />
        <meshStandardMaterial color="#5f686f" roughness={0.7} />
      </mesh>
      <Box p={[10, 8, SHIP_Z]} s={[26, 3, 5]} c="#eeebe2" rough={0.6} />
      <Box p={[10, 10.2, SHIP_Z]} s={[14, 1.4, 4]} c="#e6e2d6" rough={0.6} />
      {Array.from({length: 18}).map((_, i) => (
        <Box key={i} p={[-2.2 + i * 1.4, 8.2, SHIP_Z + 2.52]} s={[0.7, 0.5, 0.02]} c="#2b3238" rough={0.2} shadow={false} />
      ))}
      <Cyl p={[13, 13.5, SHIP_Z]} rt={1.5} h={5} c="#d9b45a" rough={0.6} />
      <Cyl p={[13, 16.3, SHIP_Z]} rt={1.52} h={0.8} c="#1d1d1f" rough={0.6} />
      {Array.from({length: 7}).map((_, i) => {
        const u = ((f / 30 + i * 0.9) % 6.3) / 6.3;
        return <Glow key={i} pos={[13 - u * 6, 17 + u * 8, SHIP_Z + u * 2]} size={2.5 + u * 6} color="#d6d0c6" opacity={0.45 * (1 - u)} />;
      })}
      {/* the door at the top of the gangway, lit inside */}
      <Box p={[DOOR[0], DOOR[1] + 1.1, SHIP_Z + 3.01]} s={[1.6, 2.2, 0.02]} c="#3a2a1c" emissive="#ffb55a" ei={0.25} shadow={false} />
      <Glow pos={[DOOR[0], DOOR[1] + 1.0, SHIP_Z + 3.2]} size={2.6} color="#ffcf8a" opacity={0.35} />

      {/* gangway */}
      <group position={RAMP_FOOT} rotation={[ang, 0, 0]}>
        <Box p={[0, 0.04, -L / 2]} s={[1.5, 0.08, L]} c="#7d6040" rough={0.8} />
        {Array.from({length: 14}).map((_, i) => (
          <Box key={i} p={[0, 0.09, -0.3 - i * 0.48]} s={[1.5, 0.03, 0.06]} c="#5e4630" shadow={false} />
        ))}
        {[-0.72, 0.72].map((dx, i) => (
          <group key={i}>
            <Box p={[dx, 1.0, -L / 2]} s={[0.05, 0.05, L]} c="#c9c4b6" metal={0.3} />
            {Array.from({length: 6}).map((_, k) => (
              <Box key={k} p={[dx, 0.5, -0.4 - k * 1.25]} s={[0.04, 1.0, 0.04]} c="#c9c4b6" metal={0.3} />
            ))}
          </group>
        ))}
      </group>

      {/* the "no pets" sign */}
      <Cyl p={[SIGN[0], 0.9, SIGN[2] - 0.04]} rt={0.05} h={1.8} c="#5a4630" />
      <Board p={[SIGN[0], 1.75, SIGN[2]]} w={1.2} h={0.8} map={noPetsTexture()} lit />

      {/* cargo on the quay */}
      <Crate p={[-9, 0, -1.6]} seed={2} stencil="22 COY" />
      <Crate p={[-9, 0.55, -1.6]} seed={3} />
      <Crate p={[-7.9, 0, -1.9]} seed={4} ry={0.3} />
      <Crate p={[1.2, 0, -2.4]} seed={5} stencil="22 COY" />
      <Crate p={[11, 0, -1.5]} seed={6} ry={-0.2} />
      <Crate p={[11, 0.55, -1.5]} seed={7} ry={-0.1} />
      {[[-11.5, 1.2], [14.5, -0.6]].map(([x, zz], i) => (
        <Cyl key={i} p={[x, 0.45, zz]} rt={0.4} h={0.9} c="#4a5a3a" rough={0.6} />
      ))}

      <Desk f={f} form={formAt(f)} />

      {/* the people */}
      {atDesk && <Flat s={person('sergeant', 'sit', 'focused')} pos={SERGEANT} h={H} tint={tint} maxTilt={0.2} />}
      {atDesk && <Flat s={bear('sit', f >= B.so ? 'proud' : 'happy')} pos={BEAR_SEAT} h={BEAR_SIT} aspect={BEAR_ASPECT} tint={tint} maxTilt={0.2} />}
      {f >= B.italy && <Flat s={person('officer', officerPose, officerExpr)} pos={OFFICER} h={H} tint={tint} flip={officerPose === 'point'} />}
      {f >= B.italy && f < B.so && (
        <>
          <Flat s={bear(f < B.lads ? 'stand' : 'stand', f >= B.lads ? 'curious' : 'happy')} pos={[2.2, 0, 1.3]} h={BEAR_UP} aspect={BEAR_ASPECT} tint={tint} />
          <Flat s={person('s1', 'stand', f >= B.lads ? 'strain' : 'calm', 'case')} pos={[1.0, 0, 1.0]} h={H} tint={tint} />
          <Flat s={person('s2', 'stand', 'calm')} pos={[3.2, 0, 0.0]} h={H} tint={tint} flip />
        </>
      )}
      {ramped && <Flat s={bear('walk', 'proud')} pos={wpos} h={BEAR_UP} aspect={BEAR_ASPECT} tint={tint} bob={Math.abs(Math.sin(f * 0.35)) * 0.05} flip={Math.floor(f / 8) % 2 === 0} />}
      {ramped && <Flat s={person('s1', 'stand', 'happy', 'case')} pos={[7.2, 0, 1.2]} h={H} tint={tint} flip />}
    </>
  );
};

// ---------- The camp in Iran, 1942 ----------

export const CampWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const sand = useMemo(() => sandTexture([40, 40]), []);
  const cloth = canvasCloth('#b5a274');
  const rock = useMemo(() => rockTexture('#9a8478', [3, 2], 7), []);
  const dusk = f >= B.grows;
  const tint = dusk ? '#ffd9b4' : '#fff1dc';
  const stage = f < B.named ? 'buy' : f < B.feed ? 'named' : f < B.grows ? 'feed' : f < B.beer ? 'grows' : f < B.cigs ? 'beer' : 'cigs';
  return (
    <>
      <fog attach="fog" args={[dusk ? '#e7b78f' : '#ecd8b8', 50, 360]} />
      <Sky
        stops={
          dusk
            ? [[0, '#5a5c8e'], [0.32, '#c98a7a'], [0.47, '#f5b46e'], [0.5, '#ffd08a'], [0.53, '#c69a6c'], [1, '#7a5a40']]
            : [[0, '#6aa2d4'], [0.36, '#b4d2e8'], [0.48, '#f4e3c2'], [0.51, '#e6cf9e'], [1, '#a88a5a']]
        }
      />
      <hemisphereLight args={[dusk ? '#e2b8a8' : '#d2e2f2', '#9a7a52', dusk ? 0.75 : 1.0]} />
      <KeyLight focus={focus} dir={dusk ? [-30, 9, 18] : [16, 24, 20]} color={dusk ? '#ffb070' : '#fff0d0'} intensity={dusk ? 2.4 : 2.6} size={10} />
      {dusk && <Glow pos={[-300, 40, 180]} size={160} color="#ffb060" opacity={0.7} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial map={sand} roughness={0.95} />
      </mesh>
      {/* mountains far off */}
      {[[-60, -150, 70, 50], [10, -170, 90, 64], [80, -140, 60, 44], [140, -160, 80, 52], [-130, -130, 60, 40]].map(([x, z, r, h], i) => (
        <mesh key={i} position={[x, h / 2 - 2, z]}>
          <coneGeometry args={[r, h, 7]} />
          <meshStandardMaterial map={rock} color="#c7b0a2" roughness={1} flatShading />
        </mesh>
      ))}
      {/* tents */}
      {[[-6, -6, 0.2], [4.5, -8, -0.3], [-11, -1.5, 1.3], [10, -4, 0.1], [-3, -13, 0.4], [-14, -9, 0.9]].map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, r, 0]}>
          <mesh geometry={tentGeo} castShadow receiveShadow>
            <meshStandardMaterial map={cloth} roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
          <Box p={[0, 0.8, 2.02]} s={[0.7, 1.5, 0.02]} c="#3a2f22" shadow={false} />
          <Cyl p={[0, 1.15, 2.2]} rt={0.03} h={2.3} c="#5a4630" />
          <Cyl p={[0, 1.15, -2.2]} rt={0.03} h={2.3} c="#5a4630" />
        </group>
      ))}
      {/* an army truck */}
      <group position={[7, 0, -1.5]} rotation={[0, -0.4, 0]}>
        <Box p={[0, 1.1, 0]} s={[3.2, 1.6, 1.9]} c="#6e6a44" />
        <Box p={[2.1, 0.95, 0]} s={[1.3, 1.3, 1.8]} c="#7a7650" />
        <Box p={[2.75, 1.25, 0]} s={[0.02, 0.5, 1.5]} c="#3a4450" rough={0.2} shadow={false} />
        {[[-1, 0.9], [-1, -0.9], [2.1, 0.9], [2.1, -0.9]].map(([dx, dz], i) => (
          <Cyl key={i} p={[dx, 0.42, dz]} rt={0.42} h={0.3} r={[Math.PI / 2, 0, 0]} c="#1e1e20" />
        ))}
      </group>
      {/* the stencilled crate: the place-and-year beat */}
      <Crate p={CAMP_CRATE} s={[1.0, 0.75, 0.75]} stencil={'IRAN\n1942'} color={CORAL} seed={9} />
      <Crate p={[3.7, 0, -0.9]} seed={10} ry={0.3} />
      <Crate p={[-2.6, 0, 0.2]} seed={11} ry={-0.2} />
      {/* the campfire */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={i} position={[FIRE[0] + Math.cos(i) * 0.5, 0.08, FIRE[2] + Math.sin(i) * 0.5]} castShadow>
          <sphereGeometry args={[0.13, 8, 6]} />
          <meshStandardMaterial color="#7a7068" roughness={1} />
        </mesh>
      ))}
      <Flame pos={[FIRE[0], 0.05, FIRE[2]]} size={dusk ? 0.8 : 0.5} f={f} />
      {dusk && <pointLight position={[FIRE[0], 0.8, FIRE[2]]} color="#ff9a4a" intensity={6} distance={7} decay={1.6} />}

      {/* the people and the bear, by stage */}
      {stage === 'buy' && (
        <>
          <Flat s={person('boy', 'hold', 'happy')} pos={BOY} h={1.45} tint={tint} />
          <Flat s={bear('sit', 'curious', true)} pos={CUB_HELD} h={0.7} aspect={BEAR_ASPECT} tint={tint} />
          <Flat s={person('s1', 'reach', 'happy', 'tins')} pos={TRADER} h={H} tint={tint} />
          <Flat s={person('s2', 'stand', 'happy')} pos={[1.8, 0, 0.3]} h={H} tint={tint} flip />
        </>
      )}
      {stage === 'named' && (
        <>
          <Flat s={bear('sit', 'happy', true)} pos={[0.2, 0, 1.6]} h={CUB} aspect={BEAR_ASPECT} tint={tint} />
          <Flat s={person('s1', 'point', 'happy')} pos={[-0.9, 0, 0.9]} h={H} tint={tint} />
          <Flat s={person('s2', 'stand', 'happy')} pos={[1.3, 0, 0.8]} h={H} tint={tint} flip />
        </>
      )}
      {stage === 'feed' && (
        <>
          <Flat s={bear('bottle', 'calm', true)} pos={[0.2, 0, 1.6]} h={CUB} aspect={BEAR_ASPECT} tint={tint} bob={Math.abs(Math.sin(f * 0.25)) * 0.015} />
          <Flat s={person('s3', 'sit', 'happy')} pos={[-0.7, 0, 0.9]} h={H} tint={tint} />
          <Crate p={[-0.7, 0, 0.75]} s={[0.6, 0.42, 0.45]} seed={12} />
        </>
      )}
      {stage === 'grows' && (
        <>
          <Flat s={person('s1', 'stand', 'happy')} pos={[-1.2, 0, 0.8]} h={H} tint={tint} />
          <Flat s={bear('stand', 'happy')} pos={[0, 0, 0.6]} h={BEAR_UP} aspect={BEAR_ASPECT} tint={tint} />
          <Flat s={person('s2', 'stand', 'awe')} pos={[1.2, 0, 0.8]} h={H} tint={tint} flip />
          <Flat s={person('s3', 'shrug', 'happy')} pos={[2.3, 0, 0.5]} h={H} tint={tint} flip />
        </>
      )}
      {stage === 'beer' && (
        <>
          <Flat s={bear('drink', 'happy')} pos={[0, 0, 0.6]} h={BEAR_SIT} aspect={BEAR_ASPECT} tint={tint} />
          <Flat s={person('s1', 'hold', 'happy', 'bottle')} pos={[-1.25, 0, 0.9]} h={H} tint={tint} />
          <Flat s={person('s3', 'hold', 'happy', 'bottle')} pos={[1.25, 0, 0.9]} h={H} tint={tint} flip />
        </>
      )}
      {stage === 'cigs' && (
        <>
          <Flat s={bear('munch', 'happy')} pos={[0, 0, 0.6]} h={BEAR_SIT} aspect={BEAR_ASPECT} tint={tint} bob={Math.abs(Math.sin(f * 0.5)) * 0.02} />
          <Flat s={person('s2', 'reach', f >= B.eats ? 'awe' : 'happy', 'cigs')} pos={[1.25, 0, 0.9]} h={H} tint={tint} flip />
          <Flat s={person('s1', 'shrug', 'happy')} pos={[-1.25, 0, 0.9]} h={H} tint={tint} />
        </>
      )}
    </>
  );
};

// ---------- The supply dump below Monte Cassino ----------

// A soldier ferrying crates between the truck and the stack, on a loop.
const ferry = (f: number, period: number, phase: number): {pos: V3; loaded: boolean; flip: boolean} => {
  const from: V3 = [TRUCK[0] - 1.4, 0, TRUCK[2] + 1.0];
  const to: V3 = [STACK[0] + 1.0, 0, STACK[2] + 0.6];
  const u = (((f - B.cassino + phase) % period) + period) % period / period;
  const out = u < 0.5;
  const v = out ? u * 2 : (u - 0.5) * 2;
  const a = out ? from : to;
  const b = out ? to : from;
  return {pos: [a[0] + (b[0] - a[0]) * v, 0, a[2] + (b[2] - a[2]) * v], loaded: out, flip: !out};
};

export const CassinoWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const earth = useMemo(() => earthTexture([30, 30]), []);
  const rock = useMemo(() => rockTexture('#8f877c', [4, 3], 3), []);
  const cloth = canvasCloth('#6f6a46');
  const tint = '#f6ead6';
  const n = stackCount(f);
  const badgeOn = ramp(f, B.badgeWord - 6, B.badgeWord + 8);
  const ending = f >= B.pulls;
  const bc = bearCarryAt(f);
  const bearWalkToTruck = f >= B.then && f < B.picked;
  const walkU = ramp(f, B.then, B.picked);
  const s1 = ferry(f, 150, 0);
  const s2 = ferry(f, 150, 75);
  return (
    <>
      <fog attach="fog" args={['#d9cbb4', 40, 320]} />
      <Sky stops={[[0, '#7a96b4'], [0.38, '#bccbd6'], [0.48, '#ecdcc0'], [0.52, '#c9b08a'], [1, '#7c6a52']]} />
      <Clouds f={f} tint="#f0ece4" />
      <hemisphereLight args={['#d6dde6', '#8a7458', 1.0]} />
      <KeyLight focus={focus} dir={[20, 22, 16]} color="#ffe2b8" intensity={2.5} size={12} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial map={earth} roughness={1} />
      </mesh>
      {/* the hills and the monastery on top */}
      <mesh position={[-10, -38, -150]}>
        <sphereGeometry args={[80, 24, 16]} />
        <meshStandardMaterial map={rock} color="#b4a890" roughness={1} flatShading />
      </mesh>
      {[[-90, -60, -170, 90], [80, -50, -190, 85], [140, -30, -110, 60]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 20, 14]} />
          <meshStandardMaterial map={rock} color="#a8a08c" roughness={1} flatShading />
        </mesh>
      ))}
      <group position={[-10, 40, -142]}>
        <Box p={[0, 3, 0]} s={[34, 6, 16]} c="#e8e2d2" rough={0.9} />
        <Box p={[-8, 7.5, 0]} s={[10, 3, 12]} c="#ddd6c4" rough={0.9} />
        <Box p={[9, 7, 2]} s={[6, 2, 8]} c="#d6cfbc" rough={0.9} />
        {Array.from({length: 9}).map((_, i) => (
          <Box key={i} p={[-14 + i * 3.5, 3.2, 8.02]} s={[1.0, 2.2, 0.05]} c="#3a3430" shadow={false} />
        ))}
      </group>
      {/* smoke drifting off the hill */}
      {Array.from({length: 10}).map((_, i) => {
        const u = ((f / 30 + i * 0.83) % 8) / 8;
        return <Glow key={i} pos={[-30 + i * 6 + u * 10, 30 + u * 40, -120]} size={14 + u * 30} color="#8c8580" opacity={0.35 * (1 - u)} />;
      })}

      {/* the ammunition truck, tailgate open, the badge on the cab door */}
      <group position={TRUCK}>
        <Box p={[0, 1.2, 0]} s={[3.6, 0.2, 2.2]} c="#5f5b3a" />
        <mesh position={[0, 2.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 1.7, 2.2]} />
          <meshStandardMaterial map={cloth} roughness={0.95} />
        </mesh>
        <Box p={[2.3, 1.25, 0]} s={[1.8, 1.9, 2.2]} c="#6c6844" />
        <Box p={[3.21, 1.6, 0]} s={[0.02, 0.6, 1.8]} c="#3a4450" rough={0.2} shadow={false} />
        {[[-1.1, 1.1], [-1.1, -1.1], [2.4, 1.1], [2.4, -1.1]].map(([dx, dz], i) => (
          <Cyl key={i} p={[dx, 0.5, dz]} rt={0.5} h={0.34} r={[Math.PI / 2, 0, 0]} c="#1e1e20" />
        ))}
        <Crate p={[-0.8, 1.3, 0.4]} seed={21} stencil="25 PDR" />
        <Crate p={[0.3, 1.3, 0.4]} seed={22} stencil="25 PDR" />
        <Crate p={[-0.8, 1.3, -0.4]} seed={23} />
        {badgeOn > 0 && (
          <>
            <group position={[2.3, 1.5, 1.112]} scale={[0.4 + 0.6 * badgeOn, 0.4 + 0.6 * badgeOn, 1]}>
              <Board p={[0, 0, 0]} w={1.0} h={1.0} map={badgeTexture()} lit opacity={badgeOn < 1 ? badgeOn : undefined} />
            </group>
            <Glow pos={[2.3, 1.5, 1.3]} size={2.2 + Math.sin(f * 0.2) * 0.15} color="#ffe6a0" opacity={0.45 * badgeOn * (1 - ramp(f, B.bearCarrying, B.pulls))} />
          </>
        )}
      </group>

      {/* the stack of crates the men build */}
      {Array.from({length: n}).map((_, i) => {
        const layer = Math.floor(i / 4);
        const k = i % 4;
        return <Crate key={i} p={[STACK[0] + (k % 2) * 0.95 - 0.45, layer * 0.55, STACK[2] + Math.floor(k / 2) * 0.62 - 0.3]} seed={30 + i} stencil={k === 0 ? '25 PDR' : ''} ry={(i % 3) * 0.04} />;
      })}
      <DustBurst f={f} from={B.picked + 66} pos={[STACK[0] + 0.9, 0.1, STACK[2] + 1.0]} size={0.8} />

      <Desk f={f} form={formAt(f)} />
      {/* sandbags */}
      {Array.from({length: 8}).map((_, i) => (
        <mesh key={i} position={[-7 + i * 0.7, 0.18 + (i % 2) * 0.02, -3.6]} scale={[1, 0.55, 0.7]} castShadow receiveShadow>
          <sphereGeometry args={[0.38, 12, 8]} />
          <meshStandardMaterial color="#b7a37a" roughness={1} />
        </mesh>
      ))}

      {/* the men */}
      <Flat s={person('s1', s1.loaded ? 'carry' : 'stand', s1.loaded ? 'strain' : 'calm', s1.loaded ? 'crate' : undefined)} pos={s1.pos} h={H} tint={tint} flip={s1.flip} bob={Math.abs(Math.sin(f * 0.4)) * 0.04} />
      <Flat s={person('s2', s2.loaded ? 'carry' : 'stand', s2.loaded ? 'strain' : 'calm', s2.loaded ? 'crate' : undefined)} pos={s2.pos} h={H} tint={tint} flip={s2.flip} bob={Math.abs(Math.sin(f * 0.4 + 1)) * 0.04} />
      <Flat s={person('s3', f >= B.picked ? 'armsUp' : 'hold', f >= B.picked ? 'awe' : 'happy', f >= B.picked ? undefined : 'crate')} pos={[TRUCK[0] - 2.2, 0, TRUCK[2] + 0.4]} h={H} tint={tint} />
      {ending && <Flat s={person('sergeant', 'sit', 'focused')} pos={SERGEANT} h={H} tint={tint} maxTilt={0.2} />}

      {/* Wojtek */}
      {f < B.then && <Flat s={bear('watch', 'curious')} pos={WATCH_SEAT} h={BEAR_SIT} aspect={BEAR_ASPECT} tint={tint} />}
      {bearWalkToTruck && (
        <Flat
          s={bear('walk', 'happy')}
          pos={[WATCH_SEAT[0] + (TRUCK[0] - 1.6 - WATCH_SEAT[0]) * walkU, 0, WATCH_SEAT[2] + (TRUCK[2] + 1.6 - WATCH_SEAT[2]) * walkU]}
          h={BEAR_UP}
          aspect={BEAR_ASPECT}
          tint={tint}
          bob={Math.abs(Math.sin(f * 0.35)) * 0.05}
        />
      )}
      {f >= B.picked && !ending && (
        <Flat s={bear(bc.loaded ? 'carry' : 'walk', bc.loaded ? 'proud' : 'happy')} pos={bc.pos} h={BEAR_UP} aspect={BEAR_ASPECT} tint={tint} flip={bc.flip} bob={Math.abs(Math.sin(f * 0.35)) * 0.05} />
      )}
      {ending && <Flat s={bear('sit', 'proud')} pos={BEAR_SEAT} h={BEAR_SIT} aspect={BEAR_ASPECT} tint={tint} />}
    </>
  );
};
