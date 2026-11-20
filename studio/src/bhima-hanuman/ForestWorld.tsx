// The forests of the Himalaya for "Bhima and the old monkey": three places in one world, far apart.
//  - the banana grove at the origin: a narrow earth path through tall banana plants, the old monkey lying beside it
//    with his tail across it, and beyond, the shining peak at the end of the gods' path;
//  - the Pandavas' forest camp (a hut, trees, a fire at night for the Ram-katha);
//  - the slope of Gandhamadana, where Bhima climbs and tears up trees.
// Lights: morning (camp), golden afternoon (climb, grove), divine (Hanuman's true form), night (camp fire), sunset (ending).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Flat, canvasSprite, mythicSprite, useCam, V3} from '../shared/flat';
import {CAST, drawMythic} from '../shared/mythic';
import {drawOldMonkeyLying, OLD_MONKEY_ASPECT} from '../shared/epic';
import {DustBurst, Flame, Glow, Particles, SkyDome} from '../shared/fx';
import {barkTexture, cloudTexture, earthTexture, foliageTexture, grassTexture, rockTexture, skyTexture, thatchTexture} from '../shared/nature';
import {INK, rng, toTexture} from '../shared/toon';
import {KeyLight} from '../shared/kit';
import {ramp} from '../shared/camera';
import {
  add, B, bhimaAt, BHIMA_H, CAMP, draupadiAt, DRAUPADI_H, FIRE, hanumanAt, HANUMAN_H, HUT, lotusAt, MAN_H, Mode, modeAt,
  MONKEY, MONKEY_H, monkeyExpr, revealAt, SLOPE, SLOPE_A, slopeY, TAIL_TIP,
} from './beats';

const LIGHT: Record<Mode, {sky: [number, string][]; fog: string; near: number; far: number; sun: string; sunI: number; hemiTop: string; hemiBottom: string; hemiI: number; tint: string; sunDir: V3; glow: string; leaf: string}> = {
  day: {
    sky: [[0, '#4a86d4'], [0.36, '#a6cdf0'], [0.48, '#fff0cf'], [0.5, '#e8e0b8'], [0.52, '#6f9a5a'], [1, '#2f4a24']],
    fog: '#cfe0d8', near: 40, far: 240, sun: '#fff0d0', sunI: 2.7, hemiTop: '#dbe9ff', hemiBottom: '#4f6a34', hemiI: 1.05, tint: '#ffffff',
    sunDir: [0.55, 0.62, 0.55], glow: '#fff2c0', leaf: '#f0ffe6',
  },
  gold: {
    sky: [[0, '#3f6fbf'], [0.34, '#9cc3e6'], [0.46, '#ffd9a8'], [0.5, '#f2b47a'], [0.52, '#6f8a52'], [1, '#2a3a1e']],
    fog: '#e3cfa6', near: 30, far: 210, sun: '#ffcf8a', sunI: 3.0, hemiTop: '#cfe0ff', hemiBottom: '#5a5a2e', hemiI: 0.95, tint: '#fff2e0',
    sunDir: [0.75, 0.38, -0.55], glow: '#ffc878', leaf: '#fff4dc',
  },
  divine: {
    sky: [[0, '#5a4aa0'], [0.32, '#e08a8a'], [0.45, '#ffd27a'], [0.5, '#fff0b0'], [0.52, '#8a7a4a'], [1, '#3a2a18']],
    fog: '#f2c88a', near: 40, far: 320, sun: '#ffd890', sunI: 3.1, hemiTop: '#ffe0b0', hemiBottom: '#5a4a2a', hemiI: 1.15, tint: '#fff0d8',
    sunDir: [0.6, 0.45, -0.6], glow: '#ffd070', leaf: '#ffeccc',
  },
  night: {
    sky: [[0, '#070b20'], [0.35, '#16224a'], [0.48, '#2c3a6a'], [0.5, '#1e2440'], [0.52, '#0f1410'], [1, '#05070a']],
    fog: '#141a30', near: 14, far: 90, sun: '#8aa0e0', sunI: 0.45, hemiTop: '#3a4a8a', hemiBottom: '#0a0a10', hemiI: 0.35, tint: '#ffd8b0',
    sunDir: [-0.4, 0.8, 0.3], glow: '#c8d4ff', leaf: '#506080',
  },
  sunset: {
    sky: [[0, '#4a2f7a'], [0.3, '#c45c72'], [0.44, '#ff9a4a'], [0.49, '#ffd27a'], [0.51, '#6a4a2a'], [1, '#2a1c12']],
    fog: '#e09a6a', near: 30, far: 220, sun: '#ffb06a', sunI: 2.6, hemiTop: '#ffc8a0', hemiBottom: '#4a3020', hemiI: 0.9, tint: '#ffe2c4',
    sunDir: [0.85, 0.16, -0.5], glow: '#ffb050', leaf: '#ffd8b4',
  },
};

// ----- Drawn textures -----
const bananaLeafTexture = (seed: number) => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 512;
  const g = c.getContext('2d')!;
  const r = rng(seed);
  const leaf = () => {
    g.beginPath();
    g.moveTo(64, 506);
    g.bezierCurveTo(4, 430, 6, 120, 64, 6);
    g.bezierCurveTo(122, 120, 124, 430, 64, 506);
    g.closePath();
  };
  leaf();
  g.fillStyle = INK;
  g.fill();
  g.save();
  g.translate(64, 256);
  g.scale(0.9, 0.975);
  g.translate(-64, -256);
  leaf();
  const grad = g.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, '#4f9a3a');
  grad.addColorStop(0.5, '#7cc455');
  grad.addColorStop(1, '#3f8030');
  g.fillStyle = grad;
  g.fill();
  g.restore();
  // veins and a few tears at the edge, as banana leaves have
  g.strokeStyle = 'rgba(30,60,20,0.35)';
  g.lineWidth = 2;
  for (let y = 40; y < 490; y += 14) {
    g.beginPath();
    g.moveTo(64, y);
    g.lineTo(10, y - 18);
    g.moveTo(64, y);
    g.lineTo(118, y - 18);
    g.stroke();
  }
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 5; i++) {
    const y = 80 + r() * 380;
    const left = r() < 0.5;
    g.beginPath();
    g.moveTo(left ? 0 : 128, y);
    g.lineTo(64 + (left ? -6 : 6), y - 10);
    g.lineTo(left ? 0 : 128, y - 5);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = '#c8e8a0';
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(64, 500);
  g.lineTo(64, 14);
  g.stroke();
  return toTexture(c);
};

const lotusCanvas = () => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 11; i++) {
    const a = Math.PI * (0.92 + (i / 10) * 1.16);
    g.save();
    g.translate(128, 170);
    g.rotate(a + Math.PI / 2);
    g.beginPath();
    g.ellipse(0, -58, 24, 60, 0, 0, Math.PI * 2);
    g.fillStyle = i % 2 ? '#f7a8c4' : '#ef7fa8';
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 8;
    g.stroke();
    g.restore();
  }
  g.beginPath();
  g.arc(128, 168, 20, 0, Math.PI * 2);
  g.fillStyle = '#ffd34d';
  g.fill();
  g.lineWidth = 7;
  g.strokeStyle = INK;
  g.stroke();
  return c;
};

// ----- The tail: a 3D tube with an ink outline, lying across the path and curling up at the tip -----
const tailCurve = () =>
  new THREE.CatmullRomCurve3(
    [
      add(MONKEY, [0.55, 0.16, 0.02]),
      [-0.45, 0.1, 0.1],
      [0.3, 0.09, 0.0],
      [TAIL_TIP[0] - 0.05, 0.12, TAIL_TIP[2]],
      [TAIL_TIP[0] + 0.2, 0.42, TAIL_TIP[2]],
      [TAIL_TIP[0] + 0.12, 0.78, TAIL_TIP[2]],
      [TAIL_TIP[0] - 0.12, 0.86, TAIL_TIP[2]],
      [TAIL_TIP[0] - 0.22, 0.72, TAIL_TIP[2]],
    ].map((p) => new THREE.Vector3(...(p as V3))),
  );
const Tail: React.FC<{f: number; color: string; opacity: number}> = ({f, color, opacity}) => {
  const {inner, outer} = useMemo(() => {
    const curve = tailCurve();
    return {inner: new THREE.TubeGeometry(curve, 80, 0.075, 12, false), outer: new THREE.TubeGeometry(curve, 80, 0.098, 12, false)};
  }, []);
  // the tip twitches a little; the tail itself never moves
  const twitch = f >= B.moveTail && f < B.laughed ? Math.sin(f * 0.5) * 0.04 : 0;
  if (opacity <= 0.01) return null;
  return (
    <group rotation={[0, 0, twitch]}>
      <mesh geometry={inner} castShadow receiveShadow>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.95} transparent={opacity < 1} opacity={opacity} />
      </mesh>
      <mesh geometry={outer}>
        <meshBasicMaterial color={INK} side={THREE.BackSide} transparent={opacity < 1} opacity={opacity} />
      </mesh>
    </group>
  );
};

// ----- Banana plants, drawn as instanced trunks and leaves -----
type Plant = {pos: V3; h: number; r: number; leaves: {az: number; tilt: number; len: number}[]; bunch: boolean};
const plantsIn = (seed: number, n: number, place: (r: () => number) => V3 | null): Plant[] => {
  const r = rng(seed);
  const list: Plant[] = [];
  let tries = 0;
  while (list.length < n && tries < n * 30) {
    tries++;
    const pos = place(r);
    if (!pos) continue;
    const k = 5 + Math.floor(r() * 4);
    const a0 = r() * Math.PI * 2;
    list.push({
      pos,
      h: 2.0 + r() * 1.6,
      r: 0.11 + r() * 0.06,
      leaves: Array.from({length: k}, (_, i) => ({az: a0 + (i / k) * Math.PI * 2 + (r() - 0.5) * 0.5, tilt: 0.55 + r() * 0.75, len: 1.8 + r() * 1.0})),
      bunch: r() < 0.3,
    });
  }
  return list;
};

const Bananas: React.FC<{plants: Plant[]; leafTex: THREE.Texture[]; barkTex: THREE.Texture; tint: string}> = ({plants, leafTex, barkTex, tint}) => {
  const meshes = useMemo(() => {
    const o = new THREE.Object3D();
    const trunkGeo = new THREE.CylinderGeometry(0.75, 1, 1, 9);
    trunkGeo.translate(0, 0.5, 0);
    const trunk = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({map: barkTex, color: '#b8c890', roughness: 1}), plants.length);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    plants.forEach((p, i) => {
      o.position.set(...p.pos);
      o.rotation.set(0, 0, 0);
      o.scale.set(p.r, p.h, p.r);
      o.updateMatrix();
      trunk.setMatrixAt(i, o.matrix);
    });
    const leafGeo = new THREE.PlaneGeometry(0.55, 1);
    leafGeo.translate(0, 0.5, 0);
    const leaves = leafTex.map((t) => {
      const list: {p: Plant; l: Plant['leaves'][number]}[] = [];
      plants.forEach((p, pi) => p.leaves.forEach((l, li) => {
        if ((pi + li) % leafTex.length === leafTex.indexOf(t)) list.push({p, l});
      }));
      const mat = new THREE.MeshStandardMaterial({map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8});
      const m = new THREE.InstancedMesh(leafGeo, mat, list.length);
      m.castShadow = true;
      m.receiveShadow = true;
      const depth = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5});
      m.customDepthMaterial = depth;
      list.forEach(({p, l}, i) => {
        o.position.set(p.pos[0], p.pos[1] + p.h - 0.05, p.pos[2]);
        o.rotation.set(l.tilt, l.az, 0, 'YXZ');
        o.scale.set(1, l.len, 1);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      });
      return {m, mat};
    });
    return {trunk, leaves};
  }, [plants, leafTex, barkTex]);
  meshes.leaves.forEach((l) => l.mat.color.set(tint));
  return (
    <>
      <primitive object={meshes.trunk} />
      {meshes.leaves.map((l, i) => (
        <primitive key={i} object={l.m} />
      ))}
      {plants
        .filter((p) => p.bunch)
        .map((p, i) => (
          <group key={i} position={[p.pos[0] + 0.18, p.pos[1] + p.h - 0.45, p.pos[2]]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.13, 0.35, 4, 10]} />
              <meshStandardMaterial color="#9ab83a" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.42, 0]} castShadow>
              <coneGeometry args={[0.09, 0.3, 10]} />
              <meshStandardMaterial color="#7a2a4a" roughness={0.6} />
            </mesh>
          </group>
        ))}
    </>
  );
};

// A broad forest tree: a trunk and a camera-facing cluster of leaves. Used at the camp and on the slope.
const Tree: React.FC<{pos: V3; h: number; sz: number; leaf: THREE.Texture; bark: THREE.Texture; tint: string; tilt?: number; lift?: number; spin?: number}> = ({pos, h, sz, leaf, bark, tint, tilt = 0, lift = 0, spin = 0}) => (
  <group position={[pos[0], pos[1] + lift, pos[2]]} rotation={[tilt, spin, tilt * 0.6]}>
    <mesh position={[0, h / 2, 0]} castShadow>
      <cylinderGeometry args={[0.16, 0.28, h, 7]} />
      <meshStandardMaterial map={bark} roughness={1} />
    </mesh>
    {tilt > 0.05 && (
      <mesh position={[0, -0.15, 0]} castShadow>
        <sphereGeometry args={[0.55, 8, 6]} />
        <meshStandardMaterial color="#6a4a2e" roughness={1} />
      </mesh>
    )}
    <sprite position={[0, h + sz * 0.22, 0]} scale={[sz, sz, 1]}>
      <spriteMaterial map={leaf} alphaTest={0.5} color={tint} />
    </sprite>
  </group>
);

// the trees on the slope that Bhima tears up as he climbs: when he passes, they fly up and away
const SLOPE_TREES = (() => {
  const r = rng(77);
  const list: {pos: V3; h: number; sz: number; t: number; side: number; torn: boolean}[] = [];
  for (let i = 0; i < 90; i++) {
    const z = SLOPE[2] + 16 - r() * 52;
    const side = r() < 0.5 ? -1 : 1;
    const x = SLOPE[0] + side * (1.8 + r() * 22);
    const near = Math.abs(x - SLOPE[0]) < 4.5 && z < SLOPE[2] + 2 && z > SLOPE[2] - 10;
    list.push({pos: [x, slopeY(z), z], h: 2.4 + r() * 2.2, sz: 3 + r() * 2.5, t: Math.floor(r() * 3), side, torn: near});
  }
  return list;
})();

export const ForestWorld: React.FC<{f: number; focus: V3}> = ({f, focus}) => {
  const cam = useCam();
  const mode = modeAt(f);
  const L = LIGHT[mode];
  const tex = useMemo(
    () => ({
      grass: grassTexture('#5a8a3c', [70, 70]),
      path: earthTexture([1, 24]),
      earth: earthTexture([5, 5]),
      rock: rockTexture('#8a8174', [2, 2], 7),
      slope: grassTexture('#6a8a40', [30, 30]),
      bark: barkTexture('#6b5a3a'),
      thatch: thatchTexture(),
      cloud: cloudTexture(),
      banana: [bananaLeafTexture(3), bananaLeafTexture(9), bananaLeafTexture(15)],
      leaves: [
        foliageTexture('#3f7a33', '#7cb050', '#24501f', 4),
        foliageTexture('#4f8a3a', '#9ac868', '#2c5a24', 8),
        foliageTexture('#5a8a3a', '#b0c870', '#33502a', 12, '#f0d040'),
      ],
    }),
    [],
  );
  const skies = useMemo(() => Object.fromEntries((Object.keys(LIGHT) as Mode[]).map((m) => [m, skyTexture(LIGHT[m].sky)])) as unknown as Record<Mode, THREE.Texture>, []);
  const grove = useMemo(
    () =>
      plantsIn(31, 230, (r) => {
        const x = (r() - 0.5) * 60;
        const z = (r() - 0.5) * 70;
        if (Math.abs(x) < 1.5) return null; // the narrow path
        if (x > -4.2 && x < 2.6 && z > -2.6 && z < 2.8) return null; // the old monkey and the tail
        if (x > -14 && x < -2 && z > -24 && z < -8) return null; // room for the giant to stand
        return [x, 0, z];
      }),
    [],
  );
  const campTrees = useMemo(() => {
    const r = rng(52);
    return Array.from({length: 40}, () => {
      // in a ring behind the camp and to its sides, leaving the view in from the front (+z) open
      const a = Math.PI * (0.95 + r() * 1.1);
      const d = 8 + r() * 26;
      return {pos: [CAMP[0] + Math.cos(a) * d, 0, CAMP[2] + Math.sin(a) * d] as V3, h: 3 + r() * 3, sz: 4.5 + r() * 3, t: Math.floor(r() * 3)};
    });
  }, []);
  const far = useMemo(() => {
    const r = rng(8);
    return Array.from({length: 26}, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + r() * 0.2;
      const d = 205 + r() * 50;
      return {pos: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, r: 40 + r() * 40, h: 30 + r() * 40};
    });
  }, []);
  const clouds = useMemo(() => {
    const r = rng(41);
    return Array.from({length: 22}, () => ({pos: [(r() - 0.5) * 320, 34 + r() * 30, (r() - 0.5) * 320] as V3, s: 18 + r() * 26}));
  }, []);

  const sun: V3 = [focus[0] + L.sunDir[0] * 500, focus[1] + L.sunDir[1] * 500, focus[2] + L.sunDir[2] * 500];
  const bh = bhimaAt(f);
  const dr = draupadiAt(f);
  const ha = hanumanAt(f);
  const rev = revealAt(f);
  const lotus = lotusAt(f);
  const atNight = mode === 'night';
  // the old monkey fades into light as Hanuman appears; at the ending Hanuman stands in his true form
  const oldOpacity = f < B.reveal ? 1 : 1 - ramp(f, B.reveal, B.reveal + 12);
  const hanOpacity = f >= B.reveal && f < B.promise ? ramp(f, B.reveal + 4, B.reveal + 16) : f >= B.ending ? 1 : 0;
  // the "Supreme in every body" moment: a soft light inside the old monkey
  const inner = f >= B.soul && f < B.leap ? Math.sin(Math.PI * Math.min(1, (f - B.soul) / (B.leap - B.soul))) : 0;
  const unaware = f >= B.unaware && f < B.moveTail ? 0.35 * Math.sin(Math.PI * (f - B.unaware) / (B.moveTail - B.unaware)) : 0;
  // Shri Ram, remembered, in the sky behind Hanuman
  const ramMem = Math.max(
    f >= B.glory - 10 && f < B.embrace ? ramp(f, B.glory - 10, B.glory + 15) * (1 - ramp(f, B.embrace - 15, B.embrace)) : 0,
    f >= B.remember && f < B.promise ? ramp(f, B.remember, B.remember + 20) * (1 - ramp(f, B.promise - 15, B.promise)) : 0,
  );
  const katha = f >= B.boon && f < B.ending;

  return (
    <>
      <fog attach="fog" args={[L.fog, L.near, ha.scale && ha.scale > 3 ? L.far * 1.6 : L.far]} />
      <SkyDome tex={skies[mode]} radius={600} center={[cam.x, 0, cam.z]} />
      {!atNight && <Glow pos={sun} size={mode === 'sunset' ? 90 : 70} color={L.glow} opacity={0.85} />}
      {!atNight && <Glow pos={sun} size={20} color="#fff6dc" opacity={0.9} />}
      {atNight && <Glow pos={[focus[0] - 120, 140, focus[2] - 300]} size={26} color="#e8eeff" opacity={0.9} />}
      <hemisphereLight args={[L.hemiTop, L.hemiBottom, L.hemiI]} />
      <KeyLight focus={focus} dir={[L.sunDir[0] * 40, Math.max(8, L.sunDir[1] * 40), L.sunDir[2] * 40]} color={L.sun} intensity={L.sunI} size={ha.scale && ha.scale > 3 ? 40 : 12} />

      {/* ground, the grove path, the camp clearing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial map={tex.grass} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -20]} receiveShadow>
        <planeGeometry args={[1.7, 120]} />
        <meshStandardMaterial map={tex.path} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CAMP[0], 0.012, CAMP[2]]} receiveShadow>
        <circleGeometry args={[8, 40]} />
        <meshStandardMaterial map={tex.earth} roughness={1} />
      </mesh>

      {/* far mountains, and the shining peak at the end of the gods' path */}
      {far.map((h, i) => (
        <mesh key={i} position={[h.pos[0], h.h * 0.3, h.pos[2]]} scale={[h.r, h.h, h.r]}>
          <sphereGeometry args={[1, 16, 10]} />
          <meshStandardMaterial color={atNight ? '#1a2030' : '#5a6f4a'} roughness={1} />
        </mesh>
      ))}
      <group position={[8, 0, -170]}>
        <mesh position={[0, 45, 0]}>
          <coneGeometry args={[46, 95, 7]} />
          <meshStandardMaterial color="#c8c0d8" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 74, 0]}>
          <coneGeometry args={[18.5, 37, 7]} />
          <meshStandardMaterial color="#fff8ec" emissive="#ffe0a0" emissiveIntensity={mode === 'divine' || (f >= B.godsPath && f < B.pleads) ? 0.9 : 0.25} flatShading />
        </mesh>
        <Glow pos={[0, 92, 0]} size={60} color="#ffe6a0" opacity={f >= B.godsPath && f < B.pleads ? 0.8 : 0.3} />
      </group>

      {/* clouds */}
      {!atNight &&
        clouds.map((c, i) => (
          <sprite key={i} position={[c.pos[0] + ((f * 0.03 + i * 13) % 60), c.pos[1], c.pos[2]]} scale={[c.s * 2, c.s, 1]}>
            <spriteMaterial map={tex.cloud} transparent depthWrite={false} opacity={0.75} color={mode === 'sunset' || mode === 'divine' ? '#ffd0a0' : '#ffffff'} />
          </sprite>
        ))}

      {/* the banana grove */}
      <Bananas plants={grove} leafTex={tex.banana} barkTex={tex.bark} tint={L.leaf} />
      {/* the gods' path beyond: motes of light drifting up */}
      {(f >= B.godsPath && f < B.pleads) || mode === 'divine' ? (
        <Particles
          count={60}
          color="#ffe9a8"
          glow
          shape="dot"
          seed={61}
          at={(i, r) => {
            const life = 120;
            const age = (f + r() * life) % life;
            return {pos: [(r() - 0.5) * 3, 0.2 + age * 0.03 + r() * 2, -3 - r() * 30], size: 0.25 * Math.sin(Math.PI * (age / life))};
          }}
        />
      ) : null}

      {/* the old monkey, lying beside the path, and his tail across it */}
      {oldOpacity > 0.01 && f < B.boon && (
        <>
          <Flat
            s={canvasSprite(`oldmonkey|${monkeyExpr(f)}`, () => drawOldMonkeyLying(monkeyExpr(f)))}
            pos={MONKEY}
            h={MONKEY_H}
            aspect={OLD_MONKEY_ASPECT}
            tint={L.tint}
            maxTilt={0.5}
            squash={1 + Math.sin(f * 0.1) * 0.012}
            opacity={oldOpacity}
          />
          <Tail f={f} color={new THREE.Color('#a39a8c').multiply(new THREE.Color(L.tint)).getStyle()} opacity={oldOpacity} />
        </>
      )}
      {inner > 0 && <Glow pos={add(MONKEY, [0, 0.5, 0.2])} size={3.2} color="#ffe6a0" opacity={0.55 * inner} />}
      {unaware > 0 && <Glow pos={add(MONKEY, [0, 0.5, 0.2])} size={2.6} color="#ffcf70" opacity={unaware} />}
      {f >= B.reveal - 4 && f < B.reveal + 30 && (
        <>
          <Glow pos={add(MONKEY, [0.3, 0.8, 0.3])} size={7 * Math.sin(Math.PI * Math.min(1, (f - B.reveal + 4) / 34))} color="#fff0b8" opacity={0.9} />
          <DustBurst f={f} from={B.reveal} pos={MONKEY} size={2.2} color="#ffe2a0" n={12} />
        </>
      )}

      {/* Hanuman in his own form (and as the giant) */}
      {hanOpacity > 0.01 && (
        <>
          <Flat
            s={mythicSprite('hanumanDivine', CAST.hanumanDivine.look, ha.pose, ha.expr)}
            pos={f >= B.ending ? [-1.0, 0, -0.35] : ha.pos}
            h={HANUMAN_H}
            scale={f >= B.ending ? 1 : ha.scale}
            tint={L.tint}
            maxTilt={ha.scale && ha.scale > 3 ? 0.15 : 0.5}
            opacity={hanOpacity}
          />
          <Glow pos={add(f >= B.ending ? [-1, 0, -0.35] : ha.pos, [0, HANUMAN_H * (ha.scale ?? 1) * 0.55, 0])} size={HANUMAN_H * (ha.scale ?? 1) * 2.4} color="#ffd98a" opacity={0.35 * hanOpacity * Math.max(0.4, ha.glow)} />
        </>
      )}
      {f >= B.grow && f < B.ravana && (
        <Particles
          count={50}
          color="#ffe6a0"
          glow
          shape="dot"
          seed={71}
          at={(i, r) => {
            const sc = ha.scale ?? 1;
            const life = 80;
            const age = (f + r() * life) % life;
            return {pos: [ha.pos[0] + (r() - 0.5) * sc * 0.9, age * 0.02 * sc + r() * sc * 0.4, ha.pos[2] + (r() - 0.5) * sc * 0.4], size: 0.02 * sc * Math.sin(Math.PI * (age / life)) + 0.1};
          }}
        />
      )}
      {ramMem > 0.01 && (
        <Flat s={mythicSprite('ram', CAST.ram.look, 'bless', 'calm')} pos={[-4, 2.5, -14]} h={9} tint="#ffe8c0" opacity={0.42 * ramMem} maxTilt={0.3} />
      )}
      {f >= B.embrace && f < B.promise && <Glow pos={[0, 1.2, 1.0]} size={4.5} color="#ffdc90" opacity={0.45 * ramp(f, B.embrace + 10, B.embrace + 40)} />}

      {/* Bhima */}
      {bh.visible && !(f >= B.climb && f < B.grove) && (
        <Flat s={mythicSprite('bhima', CAST.bhima.look, bh.pose, bh.expr)} pos={bh.pos} h={BHIMA_H} bob={bh.bob} roll={bh.roll ?? 0} tint={L.tint} maxTilt={0.5} />
      )}
      {f >= B.dazzled && f < B.ravana && <Glow pos={add(bh.pos, [0, 1.6, 0.4])} size={3} color="#fff4c8" opacity={0.6} />}

      {/* ----- The forest camp ----- */}
      <group position={HUT}>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 2.0, 3.0]} />
          <meshStandardMaterial map={tex.earth} color="#d8b890" roughness={1} />
        </mesh>
        <mesh position={[0, 2.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.1, 1.6, 4]} />
          <meshStandardMaterial map={tex.thatch} roughness={1} />
        </mesh>
        <mesh position={[0, 0.8, 1.51]}>
          <planeGeometry args={[0.9, 1.6]} />
          <meshStandardMaterial color="#2a1a10" />
        </mesh>
      </group>
      {campTrees.map((t, i) => (
        <Tree key={i} pos={t.pos} h={t.h} sz={t.sz} leaf={tex.leaves[t.t]} bark={tex.bark} tint={L.leaf} />
      ))}
      {dr.visible && f < B.climb && (
        <Flat s={mythicSprite('draupadi', CAST.draupadi.look, dr.pose, dr.expr)} pos={dr.pos} h={DRAUPADI_H} tint={L.tint} maxTilt={0.5} />
      )}
      {lotus && (
        <>
          <Flat s={canvasSprite('lotus', lotusCanvas)} pos={lotus} h={0.5} aspect={1} airborne tint="#ffffff" roll={Math.sin(f * 0.2) * 0.4} />
          <Glow pos={add(lotus, [0, 0.25, 0])} size={1.6} color="#ffd0e0" opacity={0.6} />
        </>
      )}
      {f >= B.wind && f < B.climb && (
        <Particles
          count={40}
          color="#f3b0c8"
          seed={12}
          at={(i, r) => {
            const life = 140;
            const age = (f + r() * life) % life;
            return {pos: [CAMP[0] + 12 - age * 0.12 + (r() - 0.5) * 6, 1 + r() * 5 - age * 0.01, CAMP[2] - 10 + age * 0.08 + (r() - 0.5) * 8], size: 0.12, spin: age * 0.2 + i};
          }}
        />
      )}
      {/* the night of the Ram-katha: a fire, a sage telling the story, listeners, and an old monkey at the edge of the light */}
      {katha && (
        <>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[FIRE[0], 0.1, FIRE[2]]} rotation={[0, (k * Math.PI) / 3, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 1.1, 6]} />
              <meshStandardMaterial map={tex.bark} />
            </mesh>
          ))}
          <Flame pos={[FIRE[0], 0.1, FIRE[2]]} size={1.1} f={f} />
          <pointLight position={[FIRE[0], 1.2, FIRE[2]]} color="#ffa04a" intensity={16 + 3 * Math.sin(f * 0.7)} distance={14} decay={2} castShadow />
          <Flat s={mythicSprite('rishi', CAST.rishi.look, 'bless', 'happy')} pos={add(FIRE, [-1.6, 0, -1.0])} h={MAN_H} tint={L.tint} />
          <Flat s={mythicSprite('draupadi', CAST.draupadi.look, 'namaste', 'calm')} pos={add(FIRE, [0.2, 0, 1.9])} h={DRAUPADI_H} tint={L.tint} />
          <Flat s={mythicSprite('oldHanumanStand', CAST.oldHanuman.look, 'namaste', 'happy')} pos={add(FIRE, [-3.3, 0, 1.2])} h={1.25} tint={L.tint} />
          <Glow pos={add(FIRE, [-3.3, 0.7, 1.2])} size={2.2} color="#ffd98a" opacity={0.35 + 0.1 * Math.sin(f * 0.1)} />
          <Particles
            count={26}
            color="#ffb347"
            glow
            shape="dot"
            seed={44}
            at={(i, r) => {
              const life = 60;
              const age = (f + r() * life) % life;
              return {pos: [FIRE[0] + (r() - 0.5) * 0.8, 0.6 + age * 0.05, FIRE[2] + (r() - 0.5) * 0.6], size: 0.1 * (1 - age / life)};
            }}
          />
        </>
      )}

      {/* ----- The slope of Gandhamadana ----- */}
      <mesh position={[SLOPE[0], 0, SLOPE[2]]} rotation={[-Math.PI / 2 + SLOPE_A, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 120]} />
        <meshStandardMaterial map={tex.slope} roughness={1} />
      </mesh>
      {[...Array(18)].map((_, i) => {
        const r = rng(300 + i);
        const z = SLOPE[2] + 14 - r() * 50;
        const x = SLOPE[0] + (r() - 0.5) * 30;
        if (Math.abs(x - SLOPE[0]) < 1.6) return null;
        const sz = 0.6 + r() * 1.4;
        return (
          <mesh key={i} position={[x, slopeY(z) + sz * 0.3, z]} rotation={[r(), r() * 3, r()]} castShadow receiveShadow>
            <dodecahedronGeometry args={[sz, 0]} />
            <meshStandardMaterial map={tex.rock} roughness={1} flatShading />
          </mesh>
        );
      })}
      {SLOPE_TREES.map((t, i) => {
        // a tree near the path is torn up a moment after Bhima reaches it, and flies off to the side
        const bz = bhimaAt(Math.min(f, B.grove - 1)).pos[2];
        const reach = t.torn && f >= B.uproot ? Math.max(0, (t.pos[2] + 1.5 - bz) * 12) : 0;
        const d = t.torn && f >= B.uproot && f < B.grove ? Math.max(0, f - B.uproot - (i % 5) * 6) : 0;
        const fly = Math.min(1, d / 30) * (reach > 0 ? 1 : 0);
        const lift = fly * (3 + (i % 3)) - (fly > 0.7 ? (fly - 0.7) * 6 : 0);
        return (
          <Tree
            key={i}
            pos={[t.pos[0] + t.side * fly * 5, t.pos[1], t.pos[2]]}
            h={t.h}
            sz={t.sz}
            leaf={tex.leaves[t.t]}
            bark={tex.bark}
            tint={L.leaf}
            tilt={fly * 1.3 * t.side}
            lift={Math.max(0, lift)}
            spin={fly * 2}
          />
        );
      })}
      {f >= B.climb && f < B.grove && (
        <>
          <Flat s={mythicSprite('bhima', CAST.bhima.look, bh.pose, bh.expr)} pos={bh.pos} h={BHIMA_H} bob={bh.bob} tint={L.tint} maxTilt={0.5} />
          {[0, 1, 2].map((k) => (
            <DustBurst key={k} f={f} from={B.uproot + k * 18} pos={add(bhimaAt(B.uproot + k * 18).pos, [k % 2 ? 2.5 : -2.5, 0, -1])} size={2} color="#c9a87a" />
          ))}
        </>
      )}

      {/* leaves drifting through the light */}
      <Particles
        count={36}
        color={atNight ? '#3a4a3a' : '#c9b04a'}
        seed={9}
        at={(i, r) => {
          const life = 220;
          const age = (f + r() * life) % life;
          const base: V3 = [focus[0] + (r() - 0.5) * 12, focus[1] + (r() - 0.2) * 5, focus[2] + (r() - 0.5) * 12];
          return {pos: [base[0] + age * 0.03, base[1] - age * 0.012 + Math.sin(age * 0.1 + i) * 0.3, base[2] + Math.sin(age * 0.05 + i) * 0.5], size: 0.12, spin: age * 0.15 + i};
        }}
      />
    </>
  );
};

void drawMythic;
