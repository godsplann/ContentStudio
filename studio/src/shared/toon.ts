// Canvas-drawn textures for the toon-3D look: flat inked characters, painted surfaces, signs and screen pictures.
// Everything is drawn in code so renders are repeatable and need no downloaded assets.
import * as THREE from 'three';

export const INK = '#17121a';
export const FONT = 'Space Grotesk';

export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  return {c, g};
};

export const toTexture = (c: HTMLCanvasElement, repeat?: [number, number]) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.needsUpdate = true;
  return t;
};

// ---------- Characters ----------

export type Expr = 'calm' | 'focused' | 'strain' | 'happy' | 'awe';
export type Pose = 'idle' | 'brushUp' | 'brushDown' | 'sign' | 'wave' | 'lookUp';
export type Look = {
  suit: string;
  suitDark: string;
  hat: string;
  hatDark: string;
  label?: string;
  paint?: string;
};

export const stick = (g: CanvasRenderingContext2D, pts: number[][], w: number) => {
  g.strokeStyle = INK;
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  if (pts.length === 3) g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
  else g.lineTo(pts[1][0], pts[1][1]);
  g.stroke();
};

export const dot = (g: CanvasRenderingContext2D, x: number, y: number, r: number, fill = INK) => {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
};

const brush = (g: CanvasRenderingContext2D, hx: number, hy: number, tx: number, ty: number, paint: string) => {
  // handle from hand (hx,hy) to tip (tx,ty), bristles beyond the tip
  stick(g, [[hx, hy], [tx, ty]], 12);
  g.strokeStyle = '#c98b4b';
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(hx, hy);
  g.lineTo(tx, ty);
  g.stroke();
  const a = Math.atan2(ty - hy, tx - hx);
  g.save();
  g.translate(tx, ty);
  g.rotate(a);
  g.fillStyle = '#8a8f99';
  g.strokeStyle = INK;
  g.lineWidth = 8;
  g.beginPath();
  g.roundRect(-4, -16, 22, 32, 4);
  g.fill();
  g.stroke();
  g.fillStyle = paint;
  g.beginPath();
  g.roundRect(16, -20, 44, 40, 12);
  g.fill();
  g.stroke();
  g.restore();
};

// The shared head: white egg, shade, highlight, ink outline and the face for an expression.
// Used by drawCharacter and by the outfits in people.ts, so every figure has the same face.
export const drawHead = (g: CanvasRenderingContext2D, hx: number, hy: number, expr: Expr, lookUp = false) => {
  // Head: a white egg with lilac shade, highlight and ink outline
  g.save();
  g.beginPath();
  g.ellipse(hx, hy, 150, 136, 0, 0, Math.PI * 2);
  g.fillStyle = '#fbf8f2';
  g.fill();
  g.clip();
  g.fillStyle = 'rgba(176,160,214,0.38)';
  g.beginPath();
  g.ellipse(hx + 70, hy + 60, 150, 130, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.beginPath();
  g.ellipse(hx - 60, hy - 70, 60, 22, -0.35, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.lineWidth = 12;
  g.strokeStyle = INK;
  g.beginPath();
  g.ellipse(hx, hy, 150, 136, 0, 0, Math.PI * 2);
  g.stroke();

  // Face
  const ey = hy + (lookUp ? -18 : 6);
  const ex = 50;
  g.lineWidth = 10;
  if (expr === 'calm' || expr === 'focused') {
    dot(g, hx - ex, ey, 14);
    dot(g, hx + ex, ey, 14);
    if (expr === 'focused') {
      g.beginPath();
      g.moveTo(hx - ex - 22, ey - 8);
      g.lineTo(hx - ex + 22, ey - 8);
      g.moveTo(hx + ex - 22, ey - 8);
      g.lineTo(hx + ex + 22, ey - 8);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(hx - ex - 20, ey - 40);
    g.lineTo(hx - ex + 16, ey - 34);
    g.moveTo(hx + ex - 16, ey - 34);
    g.lineTo(hx + ex + 20, ey - 40);
    g.stroke();
    g.beginPath();
    if (expr === 'calm') g.arc(hx, ey + 44, 20, 0.2 * Math.PI, 0.8 * Math.PI);
    else {
      g.moveTo(hx - 16, ey + 54);
      g.lineTo(hx + 16, ey + 54);
    }
    g.stroke();
  } else if (expr === 'strain') {
    g.beginPath();
    g.moveTo(hx - ex - 18, ey - 14);
    g.lineTo(hx - ex + 12, ey);
    g.lineTo(hx - ex - 18, ey + 14);
    g.moveTo(hx + ex + 18, ey - 14);
    g.lineTo(hx + ex - 12, ey);
    g.lineTo(hx + ex + 18, ey + 14);
    g.moveTo(hx - ex - 18, ey - 40);
    g.lineTo(hx - ex + 18, ey - 52);
    g.moveTo(hx + ex - 18, ey - 52);
    g.lineTo(hx + ex + 18, ey - 40);
    g.stroke();
    g.beginPath();
    g.moveTo(hx - 30, ey + 56);
    for (let i = 0; i < 6; i++) g.lineTo(hx - 30 + (i + 1) * 10, ey + 56 + (i % 2 ? -8 : 8));
    g.stroke();
    // sweat drops
    for (const [sx, sy, s] of [
      [hx + 150, hy - 40, 1],
      [hx + 168, hy + 30, 0.7],
      [hx - 160, hy - 10, 0.8],
    ]) {
      g.fillStyle = '#8fd3ff';
      g.strokeStyle = INK;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(sx, sy - 26 * s);
      g.quadraticCurveTo(sx + 16 * s, sy, sx, sy + 12 * s);
      g.quadraticCurveTo(sx - 16 * s, sy, sx, sy - 26 * s);
      g.fill();
      g.stroke();
    }
  } else if (expr === 'happy') {
    g.beginPath();
    g.arc(hx - ex, ey + 6, 18, Math.PI * 1.1, Math.PI * 1.9);
    g.moveTo(hx + ex - 18, ey);
    g.arc(hx + ex, ey + 6, 18, Math.PI * 1.1, Math.PI * 1.9);
    g.stroke();
    g.fillStyle = INK;
    g.beginPath();
    g.moveTo(hx - 42, ey + 34);
    g.quadraticCurveTo(hx, ey + 104, hx + 42, ey + 34);
    g.closePath();
    g.fill();
    g.fillStyle = '#ff8fa3';
    g.beginPath();
    g.ellipse(hx, ey + 66, 18, 10, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,128,150,0.35)';
    g.beginPath();
    g.ellipse(hx - 92, ey + 40, 24, 14, 0, 0, Math.PI * 2);
    g.ellipse(hx + 92, ey + 40, 24, 14, 0, 0, Math.PI * 2);
    g.fill();
  } else if (expr === 'awe') {
    for (const sx of [hx - ex, hx + ex]) {
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(sx, ey, 28, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 8;
      g.stroke();
      dot(g, sx, ey - 6, 11);
    }
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(hx - ex - 20, ey - 50);
    g.lineTo(hx - ex + 18, ey - 58);
    g.moveTo(hx + ex - 18, ey - 58);
    g.lineTo(hx + ex + 20, ey - 50);
    g.stroke();
    g.fillStyle = INK;
    g.beginPath();
    g.ellipse(hx, ey + 62, 16, 22, 0, 0, Math.PI * 2);
    g.fill();
  }
};

export const drawCharacter = (look: Look, pose: Pose, expr: Expr): HTMLCanvasElement => {
  const {c, g} = canvas(512, 1024);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const paint = look.paint ?? '#ffcf3a';

  // Legs and feet
  stick(g, [[228, 660], [222, 820], [214, 985]], 14);
  stick(g, [[284, 660], [290, 820], [298, 985]], 14);
  stick(g, [[214, 985], [178, 992]], 14);
  stick(g, [[298, 985], [334, 992]], 14);

  // Arms (drawn before the body so the shoulders tuck in)
  const L: number[] = [198, 492];
  const R: number[] = [314, 492];
  const arm = (s: number[], h: number[], bend: number) => {
    const mx = (s[0] + h[0]) / 2 + bend;
    const my = (s[1] + h[1]) / 2;
    stick(g, [s, [mx, my], h], 12);
    dot(g, h[0], h[1], 16);
  };
  if (pose === 'idle' || pose === 'lookUp') {
    arm(L, [168, 650], -18);
    arm(R, [344, 650], 18);
  } else if (pose === 'brushUp') {
    arm(L, [168, 650], -18);
    arm(R, [404, 360], 30);
    brush(g, 404, 360, 448, 262, paint);
  } else if (pose === 'brushDown') {
    arm(L, [168, 650], -18);
    arm(R, [420, 590], -10);
    brush(g, 420, 590, 452, 690, paint);
  } else if (pose === 'sign') {
    arm(L, [150, 70], -30);
    arm(R, [362, 70], 30);
  } else if (pose === 'wave') {
    arm(L, [168, 650], -18);
    arm(R, [420, 250], 40);
  }

  // Body: a capsule of overalls
  g.lineWidth = 12;
  g.strokeStyle = INK;
  g.fillStyle = look.suit;
  g.beginPath();
  g.roundRect(184, 440, 144, 250, 66);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = look.suitDark;
  g.fillRect(286, 430, 60, 270);
  g.fillStyle = 'rgba(255,255,255,0.18)';
  g.fillRect(200, 450, 18, 200);
  g.restore();
  g.stroke();
  // straps and buttons
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(214, 448);
  g.lineTo(226, 540);
  g.moveTo(298, 448);
  g.lineTo(286, 540);
  g.stroke();
  dot(g, 226, 548, 8, '#f1d27a');
  dot(g, 286, 548, 8, '#f1d27a');
  if (look.label) {
    g.font = `700 34px "${FONT}"`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineWidth = 7;
    g.strokeStyle = INK;
    g.strokeText(look.label, 256, 612);
    g.fillStyle = '#ffffff';
    g.fillText(look.label, 256, 612);
  }

  const hx = 256;
  const hy = pose === 'lookUp' ? 288 : 300;
  drawHead(g, hx, hy, expr, pose === 'lookUp');

  // Hard hat
  g.lineWidth = 12;
  g.strokeStyle = INK;
  g.save();
  g.beginPath();
  g.rect(60, 60, 400, hy - 82 - 60);
  g.clip();
  g.fillStyle = look.hat;
  g.beginPath();
  g.ellipse(hx, hy - 82, 150, 112, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = look.hatDark;
  g.beginPath();
  g.ellipse(hx + 90, hy - 82, 80, 112, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)';
  g.beginPath();
  g.ellipse(hx - 60, hy - 150, 46, 16, -0.4, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.beginPath();
  g.ellipse(hx, hy - 82, 150, 112, 0, Math.PI, Math.PI * 2);
  g.stroke();
  g.fillStyle = look.hat;
  g.beginPath();
  g.roundRect(hx - 176, hy - 96, 352, 30, 14);
  g.fill();
  g.stroke();
  g.lineWidth = 8;
  g.beginPath();
  g.moveTo(hx - 20, hy - 192);
  g.lineTo(hx - 20, hy - 100);
  g.moveTo(hx + 20, hy - 192);
  g.lineTo(hx + 20, hy - 100);
  g.stroke();

  return c;
};

// ---------- Surfaces ----------

export const woodTexture = () => {
  const {c, g} = canvas(1024, 1024);
  const r = rng(7);
  const rows = 8;
  for (let i = 0; i < rows; i++) {
    const y = (i * 1024) / rows;
    const base = 26 + r() * 8;
    g.fillStyle = `hsl(${base}, 52%, ${38 + r() * 8}%)`;
    g.fillRect(0, y, 1024, 1024 / rows);
    for (let k = 0; k < 14; k++) {
      g.strokeStyle = `rgba(60,30,12,${0.12 + r() * 0.15})`;
      g.lineWidth = 1 + r() * 2.5;
      g.beginPath();
      const yy = y + 6 + r() * (1024 / rows - 12);
      g.moveTo(0, yy);
      for (let x = 0; x <= 1024; x += 64) g.lineTo(x, yy + Math.sin(x * 0.01 + k) * 3);
      g.stroke();
    }
    g.fillStyle = 'rgba(40,20,8,0.75)';
    g.fillRect(0, y, 1024, 5);
    const seam = r() * 1024;
    g.fillRect(seam, y, 5, 1024 / rows);
  }
  return toTexture(c, [3, 1.5]);
};

export const plasterTexture = (color: string, seed = 3) => {
  const {c, g} = canvas(512, 512);
  g.fillStyle = color;
  g.fillRect(0, 0, 512, 512);
  const r = rng(seed);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    g.fillRect(r() * 512, r() * 512, 2 + r() * 6, 2 + r() * 6);
  }
  return toTexture(c, [4, 3]);
};

export const pcbTexture = () => {
  const {c, g} = canvas(1024, 1024);
  g.fillStyle = '#145a3b';
  g.fillRect(0, 0, 1024, 1024);
  const r = rng(11);
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = 'rgba(0,0,0,0.05)';
    g.fillRect(r() * 1024, r() * 1024, 3, 3);
  }
  // copper traces: Manhattan runs with 45-degree turns
  for (let i = 0; i < 70; i++) {
    let x = Math.round(r() * 32) * 32;
    let y = Math.round(r() * 32) * 32;
    g.strokeStyle = r() > 0.25 ? 'rgba(214,170,74,0.85)' : 'rgba(120,220,170,0.35)';
    g.lineWidth = r() > 0.7 ? 7 : 4;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      const len = 64 + Math.round(r() * 6) * 32;
      const dir = Math.floor(r() * 4);
      if (dir === 0) x += len;
      else if (dir === 1) y += len;
      else if (dir === 2) {
        x += len / 2;
        y += len / 2;
      } else {
        x -= len / 2;
        y += len / 2;
      }
      g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = '#e6c06a';
    g.beginPath();
    g.arc(x, y, 9, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#0d2e20';
    g.beginPath();
    g.arc(x, y, 4, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = 'rgba(240,250,240,0.55)';
  g.font = `700 26px "${FONT}"`;
  for (let i = 0; i < 14; i++) g.fillText(['C12', 'R7', 'U3', 'L2', 'Q9', 'C40', 'R18'][i % 7], r() * 980, r() * 1000 + 20);
  return toTexture(c, [10, 10]);
};

export const chipTopTexture = (title: string, small: string) => {
  const {c, g} = canvas(1024, 1024);
  const grd = g.createLinearGradient(0, 0, 1024, 1024);
  grd.addColorStop(0, '#d9dde4');
  grd.addColorStop(0.5, '#b7bdc8');
  grd.addColorStop(1, '#9aa1ae');
  g.fillStyle = grd;
  g.fillRect(0, 0, 1024, 1024);
  const r = rng(5);
  for (let i = 0; i < 900; i++) {
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 1;
    const y = r() * 1024;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y + r() * 6);
    g.stroke();
  }
  g.strokeStyle = 'rgba(40,44,56,0.6)';
  g.lineWidth = 10;
  g.strokeRect(24, 24, 976, 976);
  g.fillStyle = 'rgba(40,44,56,0.85)';
  g.textAlign = 'left';
  g.font = `700 120px "${FONT}"`;
  g.fillText(title, 70, 940);
  g.font = `500 40px "${FONT}"`;
  g.fillText(small, 74, 990 - 170);
  g.beginPath();
  g.moveTo(70, 70);
  g.lineTo(130, 70);
  g.lineTo(70, 130);
  g.closePath();
  g.fill();
  return toTexture(c);
};

export const paperTexture = (seed: number) => {
  const {c, g} = canvas(256, 320);
  g.fillStyle = '#fbfaf4';
  g.fillRect(0, 0, 256, 320);
  g.strokeStyle = 'rgba(90,140,220,0.35)';
  g.lineWidth = 2;
  for (let y = 40; y < 320; y += 24) {
    g.beginPath();
    g.moveTo(10, y);
    g.lineTo(246, y);
    g.stroke();
  }
  const r = rng(seed);
  const bits = ['3×7=21', 'x²+y²', '∑ n', '√144', '2+2=4', 'a·b', '17×9', 'π r²', '÷ 8', 'f(x)'];
  g.fillStyle = '#2b2a3a';
  g.font = `700 30px "${FONT}"`;
  for (let i = 0; i < 6; i++) g.fillText(bits[Math.floor(r() * bits.length)], 18 + r() * 60, 66 + i * 46);
  return toTexture(c);
};

export const signTexture = () => {
  const {c, g} = canvas(1024, 640);
  g.fillStyle = '#fff6e0';
  g.beginPath();
  g.roundRect(0, 0, 1024, 640, 40);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 22;
  g.beginPath();
  g.roundRect(14, 14, 996, 612, 34);
  g.stroke();
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#1d6fe0';
  g.font = `700 300px "${FONT}"`;
  g.fillText('GPU', 512, 250);
  g.fillStyle = INK;
  g.font = `700 74px "${FONT}"`;
  g.fillText('Graphics Processing Unit', 512, 500);
  return toTexture(c);
};

export const keyboardTexture = () => {
  const {c, g} = canvas(1024, 340);
  g.fillStyle = '#2b2f3a';
  g.fillRect(0, 0, 1024, 340);
  for (let row = 0; row < 5; row++) {
    for (let k = 0; k < 15; k++) {
      const w = row === 4 && k > 4 && k < 10 ? 0 : 60;
      if (!w) continue;
      g.fillStyle = '#e9e4da';
      g.beginPath();
      g.roundRect(20 + k * 66, 18 + row * 64, 58, 56, 8);
      g.fill();
      g.fillStyle = 'rgba(0,0,0,0.12)';
      g.fillRect(20 + k * 66, 64 + row * 64, 58, 10);
    }
  }
  g.fillStyle = '#e9e4da';
  g.beginPath();
  g.roundRect(20 + 5 * 66, 18 + 4 * 64, 5 * 66 - 8, 56, 8);
  g.fill();
  return toTexture(c);
};

export const windowTexture = () => {
  const {c, g} = canvas(512, 640);
  const grd = g.createLinearGradient(0, 0, 0, 640);
  grd.addColorStop(0, '#7fb2ff');
  grd.addColorStop(0.55, '#ffc58a');
  grd.addColorStop(1, '#ff9a6b');
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 640);
  g.fillStyle = 'rgba(255,240,210,0.9)';
  g.beginPath();
  g.arc(360, 420, 60, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#5d6e9a';
  g.beginPath();
  g.moveTo(0, 560);
  g.lineTo(140, 470);
  g.lineTo(260, 540);
  g.lineTo(400, 460);
  g.lineTo(512, 520);
  g.lineTo(512, 640);
  g.lineTo(0, 640);
  g.fill();
  g.strokeStyle = '#f3e7d3';
  g.lineWidth = 26;
  g.strokeRect(0, 0, 512, 640);
  g.beginPath();
  g.moveTo(256, 0);
  g.lineTo(256, 640);
  g.moveTo(0, 320);
  g.lineTo(512, 320);
  g.stroke();
  return toTexture(c);
};

export const glowTexture = () => {
  const {c, g} = canvas(256, 256);
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return toTexture(c);
};

// ---------- Pictures (sampled into pixel grids) ----------

export type Picture = 'landscape' | 'portrait' | 'game' | 'video' | 'ai';

const drawLandscape = (g: CanvasRenderingContext2D, w: number, h: number) => {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#2f7bf0');
  sky.addColorStop(0.6, '#9fd0ff');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffd23a';
  g.beginPath();
  g.arc(w * 0.74, h * 0.28, h * 0.14, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.ellipse(w * 0.25, h * 0.22, w * 0.1, h * 0.06, 0, 0, Math.PI * 2);
  g.ellipse(w * 0.33, h * 0.2, w * 0.08, h * 0.07, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#4b5fb5';
  g.beginPath();
  g.moveTo(0, h * 0.62);
  g.lineTo(w * 0.3, h * 0.38);
  g.lineTo(w * 0.55, h * 0.6);
  g.lineTo(w * 0.8, h * 0.42);
  g.lineTo(w, h * 0.6);
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.fill();
  g.fillStyle = '#3fb24f';
  g.fillRect(0, h * 0.66, w, h);
  g.fillStyle = '#2a8d3c';
  g.beginPath();
  g.ellipse(w * 0.2, h * 0.7, w * 0.35, h * 0.08, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#3aa0ff';
  g.beginPath();
  g.moveTo(w * 0.55, h * 0.66);
  g.lineTo(w * 0.62, h * 0.66);
  g.lineTo(w * 0.8, h);
  g.lineTo(w * 0.5, h);
  g.fill();
};

const drawPortrait = (g: CanvasRenderingContext2D, w: number, h: number) => {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#ff7a59');
  sky.addColorStop(0.45, '#ffd36b');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff2a8';
  g.beginPath();
  g.arc(w * 0.5, h * 0.36, w * 0.2, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#7a3d8f';
  g.beginPath();
  g.moveTo(0, h * 0.5);
  g.lineTo(w * 0.3, h * 0.36);
  g.lineTo(w * 0.62, h * 0.52);
  g.lineTo(w, h * 0.4);
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.fill();
  g.fillStyle = '#2f8f6a';
  g.fillRect(0, h * 0.6, w, h);
  g.fillStyle = '#2b78e4';
  g.beginPath();
  g.moveTo(w * 0.42, h * 0.6);
  g.lineTo(w * 0.58, h * 0.6);
  g.lineTo(w * 0.9, h);
  g.lineTo(w * 0.1, h);
  g.fill();
  g.fillStyle = '#ffffff';
  g.fillRect(w * 0.12, h * 0.52, w * 0.16, h * 0.08);
  g.fillStyle = '#d0453a';
  g.beginPath();
  g.moveTo(w * 0.1, h * 0.52);
  g.lineTo(w * 0.2, h * 0.46);
  g.lineTo(w * 0.3, h * 0.52);
  g.fill();
};

const drawGame = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = '#5c94fc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.fillRect(w * 0.1, h * 0.15, w * 0.14, h * 0.08);
  g.fillRect(w * 0.6, h * 0.1, w * 0.12, h * 0.07);
  g.fillStyle = '#c84c0c';
  g.fillRect(0, h * 0.8, w, h * 0.2);
  g.fillStyle = '#58d854';
  g.fillRect(0, h * 0.76, w, h * 0.06);
  g.fillStyle = '#c84c0c';
  g.fillRect(w * 0.45, h * 0.45, w * 0.25, h * 0.08);
  g.fillStyle = '#ffd23a';
  for (let i = 0; i < 4; i++) g.fillRect(w * (0.47 + i * 0.06), h * 0.36, w * 0.025, h * 0.06);
  g.fillStyle = '#e8402a';
  g.fillRect(w * 0.18, h * 0.6, w * 0.06, h * 0.16);
  g.fillStyle = '#f7c9a0';
  g.fillRect(w * 0.18, h * 0.55, w * 0.06, h * 0.06);
  g.fillStyle = '#2e9e3a';
  g.fillRect(w * 0.82, h * 0.58, w * 0.08, h * 0.2);
};

const drawVideo = (g: CanvasRenderingContext2D, w: number, h: number) => {
  drawLandscape(g, w, h);
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(w / 2, h / 2, h * 0.24, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#e8402a';
  g.beginPath();
  g.moveTo(w / 2 - h * 0.08, h / 2 - h * 0.13);
  g.lineTo(w / 2 + h * 0.14, h / 2);
  g.lineTo(w / 2 - h * 0.08, h / 2 + h * 0.13);
  g.fill();
  g.fillStyle = '#666666';
  g.fillRect(w * 0.05, h * 0.9, w * 0.9, h * 0.04);
  g.fillStyle = '#e8402a';
  g.fillRect(w * 0.05, h * 0.9, w * 0.4, h * 0.04);
};

const drawAI = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = '#121a3a';
  g.fillRect(0, 0, w, h);
  const layers = [3, 5, 5, 2];
  const pos = layers.map((n, li) =>
    Array.from({length: n}, (_, i) => [w * (0.15 + li * 0.23), h * ((i + 1) / (n + 1))]),
  );
  g.strokeStyle = 'rgba(80,220,200,0.9)';
  g.lineWidth = Math.max(1, h / 40);
  for (let li = 0; li < layers.length - 1; li++)
    for (const a of pos[li])
      for (const b of pos[li + 1]) {
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.stroke();
      }
  for (const layer of pos)
    for (const p of layer) {
      g.fillStyle = '#ffd23a';
      g.beginPath();
      g.arc(p[0], p[1], h * 0.06, 0, Math.PI * 2);
      g.fill();
    }
};

// Returns cols*rows colours (row 0 = top) as THREE.Color.
export const samplePicture = (pic: Picture, cols: number, rows: number): THREE.Color[] => {
  const {g} = canvas(cols, rows);
  if (pic === 'landscape') drawLandscape(g, cols, rows);
  if (pic === 'portrait') drawPortrait(g, cols, rows);
  if (pic === 'game') drawGame(g, cols, rows);
  if (pic === 'video') drawVideo(g, cols, rows);
  if (pic === 'ai') drawAI(g, cols, rows);
  const d = g.getImageData(0, 0, cols, rows).data;
  const out: THREE.Color[] = [];
  for (let i = 0; i < cols * rows; i++) {
    out.push(new THREE.Color().setRGB(d[i * 4] / 255, d[i * 4 + 1] / 255, d[i * 4 + 2] / 255, THREE.SRGBColorSpace));
  }
  return out;
};
