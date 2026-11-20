// The inflatable tank, modelled on the M4 Sherman shape (5.6 m long, 2.6 m wide), and the real one it copies.
// One model does every trick of the story:
//   inflate 0 -> 1 : a folded bundle unrolls into a flat sheet, the hull swells up, then the turret, then the barrel
//                    rises (each with a springy overshoot, which is what makes the time-lapse satisfying);
//   wobble         : a jelly jiggle that decays (poked, pushed, dropped);
//   deflate 0 -> 1 : the barrel droops from the turret, the turret sags, the hull slumps (the ending).
// Local axes: front of the tank is +x, the ground is y = 0, the tank is centred on the origin.
import React from 'react';
import * as THREE from 'three';
import {clamp01} from '../shared/camera';
import {cachedTexture} from '../shared/print';

const L = 5.6;
const W = 2.6;

// a springy ease that overshoots and settles: 0 -> 1
export const springOut = (u: number) => {
  const x = clamp01(u);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.exp(-6 * x) * Math.cos(x * Math.PI * 2.6);
};
const part = (u: number, a: number, b: number) => clamp01((u - a) / (b - a));

// the white Allied star in a ring, painted on the turret and hull
const starTexture = () =>
  cachedTexture('ga-star', () => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d')!;
    g.strokeStyle = '#f4f1e6';
    g.lineWidth = 16;
    g.beginPath();
    g.arc(128, 128, 108, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#f4f1e6';
    g.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 38 : 96;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r);
    }
    g.closePath();
    g.fill();
    return c;
  });

// rubber shows soft seams; the real tank shows rivets and dirt
const skinTexture = (real: boolean) =>
  cachedTexture(`ga-skin|${real}`, () => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 256, 256);
    if (real) {
      g.fillStyle = 'rgba(70,50,30,0.22)';
      for (let i = 0; i < 60; i++) g.fillRect((i * 97) % 256, (i * 53) % 256, 6 + (i % 5) * 4, 3 + (i % 3) * 3);
      g.fillStyle = 'rgba(0,0,0,0.35)';
      for (let x = 12; x < 256; x += 32) for (const y of [10, 246]) g.fillRect(x, y, 5, 5);
    } else {
      g.strokeStyle = 'rgba(0,0,0,0.16)';
      g.lineWidth = 3;
      for (let x = 0; x < 256; x += 64) {
        g.beginPath();
        g.moveTo(x, 0);
        g.bezierCurveTo(x + 8, 80, x - 8, 170, x + 4, 256);
        g.stroke();
      }
      g.fillStyle = 'rgba(255,255,255,0.12)';
      g.fillRect(0, 40, 256, 18);
    }
    return c;
  });

export type TankProps = {
  inflate?: number; // 0 = folded bundle, 1 = full (default)
  wobble?: number; // signed jiggle amount, about -0.2 to 0.2
  deflate?: number; // 0 = full, 1 = barrel hanging and hull slumped
  real?: boolean; // the real steel tank: darker, matt, rivets
  plugOut?: number; // 0 = plug in the valve, 1 = pulled out on its tether (the ending)
  turretYaw?: number; // turret turned (radians), so a barrel aimed at the camera does not read as a vertical stick
};

export const Tank: React.FC<TankProps> = ({inflate = 1, wobble = 0, deflate = 0, real = false, plugOut = 0, turretYaw = 0}) => {
  const mats = React.useMemo(() => {
    const skin = skinTexture(real);
    return {
      body: new THREE.MeshStandardMaterial({color: real ? '#4d5432' : '#5f6c38', map: skin, roughness: real ? 0.78 : 0.36, metalness: real ? 0.25 : 0}),
      dark: new THREE.MeshStandardMaterial({color: real ? '#26271f' : '#33372a', roughness: real ? 0.8 : 0.45}),
      wheel: new THREE.MeshStandardMaterial({color: real ? '#3b3d30' : '#454c30', roughness: 0.6}),
      star: new THREE.MeshBasicMaterial({map: starTexture(), transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2}),
      bag: new THREE.MeshStandardMaterial({color: '#5a6436', roughness: 0.5}),
      brass: new THREE.MeshStandardMaterial({color: '#c9a24a', roughness: 0.35, metalness: 0.6}),
    };
  }, [real]);

  // inflation phases
  const unroll = part(inflate, 0, 0.16); // the bundle spreads into a sheet
  const hullU = springOut(part(inflate, 0.14, 0.62));
  const turretU = springOut(part(inflate, 0.4, 0.8));
  const barrelU = springOut(part(inflate, 0.62, 1));
  const spread = 0.3 + 0.7 * unroll;
  const hy = Math.max(0.03, hullU) * (1 - 0.16 * deflate);
  const hxz = 1 + 0.12 * (1 - Math.min(1, hullU)) + 0.05 * deflate;
  const sy = hy * (1 + wobble);
  const sxz = hxz * (1 - wobble * 0.5);
  // the turret droops a little and the barrel hangs when it deflates
  const droop = springOut(deflate) * 0.8;
  const barrelLift = (1 - barrelU) * 1.25; // before it fills, the barrel hangs down
  const tSy = Math.max(0.05, turretU) * (1 - 0.25 * deflate);
  const showBundle = inflate < 0.16;
  const showBody = inflate > 0.02;

  const wheels = [];
  for (const side of [-1, 1])
    for (let i = 0; i < 5; i++)
      wheels.push(
        <mesh key={`${side}${i}`} position={[-1.9 + i * 0.95, 0.42, side * (W / 2 - 0.02)]} rotation={[Math.PI / 2, 0, 0]} material={mats.wheel} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.12, 20]} />
        </mesh>,
      );

  return (
    <group>
      {showBundle && (
        <group scale={[1 - unroll * 0.6, 1 - unroll * 0.8, 1 - unroll * 0.6]}>
          <mesh position={[-1.2, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.bag} castShadow receiveShadow>
            <cylinderGeometry args={[0.32, 0.32, 1.4, 20]} />
          </mesh>
          <mesh position={[-1.2, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.dark}>
            <torusGeometry args={[0.32, 0.04, 6, 20]} />
          </mesh>
        </group>
      )}
      {showBody && (
        <group scale={[sxz * spread, sy, sxz * spread]}>
          {/* tracks: long side blocks with rounded ends, wheels on the outside */}
          {[-1, 1].map((side) => (
            <group key={side} position={[0, 0, side * (W / 2 - 0.32)]}>
              <mesh position={[0, 0.47, 0]} material={mats.dark} castShadow receiveShadow>
                <boxGeometry args={[L - 0.95, 0.94, 0.62]} />
              </mesh>
              {[-1, 1].map((e) => (
                <mesh key={e} position={[e * (L / 2 - 0.47), 0.47, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.dark} castShadow>
                  <cylinderGeometry args={[0.47, 0.47, 0.62, 20]} />
                </mesh>
              ))}
            </group>
          ))}
          {wheels}
          {/* hull: the box between the tracks, a sloped front plate and the engine deck */}
          <mesh position={[-0.25, 1.22, 0]} material={mats.body} castShadow receiveShadow>
            <boxGeometry args={[4.5, 0.62, W - 0.1]} />
          </mesh>
          <mesh position={[2.08, 1.08, 0]} rotation={[0, 0, -0.95]} material={mats.body} castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.32, W - 0.16]} />
          </mesh>
          <mesh position={[-1.7, 1.58, 0]} material={mats.body} castShadow>
            <boxGeometry args={[1.4, 0.12, W - 0.4]} />
          </mesh>
          {/* stars on the hull sides */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0.5, 1.22, side * (W / 2 - 0.04)]} rotation={[0, side < 0 ? Math.PI : 0, 0]} material={mats.star}>
              <planeGeometry args={[0.56, 0.56]} />
            </mesh>
          ))}
          {/* the valve and its plug under the rear of the hull, where a man holding it overhead can reach (the ending) */}
          <group position={[2.2, 0.04, 0.9]}>
            <mesh material={mats.brass}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 14]} />
            </mesh>
            <mesh position={[plugOut * 0.1, -0.08 - plugOut * 0.45, plugOut * 0.12]} rotation={[plugOut * 0.5, 0, plugOut * 0.4]} material={mats.brass}>
              <cylinderGeometry args={[0.07, 0.05, 0.14, 12]} />
            </mesh>
          </group>

          {/* turret on its ring, with a hatch, the gun mantlet and the barrel */}
          <group position={[0.05, 1.53, 0]} rotation={[0, turretYaw, -0.12 * springOut(deflate)]}>
            <group scale={[1, tSy, 1]}>
              <mesh position={[0, 0.4, 0]} scale={[1.05, 1, 0.92]} material={mats.body} castShadow receiveShadow>
                <cylinderGeometry args={[0.86, 0.98, 0.8, 28]} />
              </mesh>
              <mesh position={[-0.25, 0.85, 0.25]} material={mats.body} castShadow>
                <sphereGeometry args={[0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
              <mesh position={[0.98, 0.42, 0]} material={mats.dark} castShadow>
                <boxGeometry args={[0.36, 0.46, 0.7]} />
              </mesh>
              {[-1, 1].map((side) => (
                <mesh key={side} position={[0, 0.42, side * 0.91]} rotation={[0, side < 0 ? Math.PI : 0, 0]} material={mats.star}>
                  <planeGeometry args={[0.5, 0.5]} />
                </mesh>
              ))}
            </group>
            {/* the barrel pivots at the mantlet: up when full, hanging when empty */}
            <group position={[1.12, 0.42 * tSy, 0]} rotation={[0, 0, -(barrelLift + droop)]}>
              <mesh position={[1.15 * Math.max(0.3, barrelU), 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, Math.max(0.3, barrelU), 1]} material={mats.body} castShadow>
                <cylinderGeometry args={[0.07, 0.09, 2.3, 16]} />
              </mesh>
              <mesh position={[2.28 * Math.max(0.3, barrelU), 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.dark} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.16, 16]} />
              </mesh>
            </group>
          </group>
        </group>
      )}
    </group>
  );
};

// A decaying jiggle that starts at frame `at` (0 before it): add several for repeated pokes.
export const jiggle = (f: number, at: number, amp = 0.18, len = 34) => {
  const d = f - at;
  if (d < 0 || d > len) return 0;
  return amp * Math.exp(-d / (len / 4)) * Math.sin(d * 0.85);
};
