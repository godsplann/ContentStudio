// A brown bear in the shared inked toon style, for any video that needs one (first used for Wojtek, Undercover, 19 November 2026).
// Same thick ink outline and flat fills as the people. 768 x 1024 (BEAR_ASPECT); a cub is the same drawing
// with a bigger head and a rounder body, placed smaller in the world.
//   poses: stand, walk, carry (an ammunition crate held in front), sit, watch (sitting, curious), drink (bottle to the mouth),
//          munch (chewing a cigarette), bottle (cub with a milk bottle held up in both paws)
import {dot, INK} from './toon';

export const BEAR_ASPECT = 768 / 1024;
export type BearPose = 'stand' | 'walk' | 'carry' | 'sit' | 'watch' | 'drink' | 'munch' | 'bottle';
export type BearExpr = 'happy' | 'calm' | 'curious' | 'proud';

const FUR = '#7c5130';
const FUR_DARK = '#5e3b21';
const BELLY = '#c99c6b';
const MUZZLE = '#e6c596';

// A limb: a thick ink stroke with fur inside, so it reads as an outlined rounded shape.
const limb = (g: CanvasRenderingContext2D, pts: number[][], w: number, fill = FUR) => {
  for (const [lw, col] of [[w + 24, INK], [w, fill]] as [number, string][]) {
    g.lineWidth = lw;
    g.strokeStyle = col;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  }
};
const blob = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, w = 12, rot = 0) => {
  g.fillStyle = fill;
  g.beginPath();
  g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  g.fill();
  if (w) {
    g.lineWidth = w;
    g.strokeStyle = INK;
    g.stroke();
  }
};
const paw = (g: CanvasRenderingContext2D, x: number, y: number, r = 34) => {
  blob(g, x, y, r, r * 0.9, FUR);
  dot(g, x - r * 0.35, y + r * 0.1, r * 0.16, '#3a2414');
  dot(g, x + r * 0.35, y + r * 0.1, r * 0.16, '#3a2414');
  dot(g, x, y - r * 0.22, r * 0.16, '#3a2414');
};

const crate = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#9a7240';
  g.beginPath();
  g.rect(x - w / 2, y - h / 2, w, h);
  g.fill();
  g.strokeStyle = 'rgba(60,36,16,0.55)';
  g.lineWidth = 5;
  for (let i = 1; i < 3; i++) {
    g.beginPath();
    g.moveTo(x - w / 2, y - h / 2 + (h * i) / 3);
    g.lineTo(x + w / 2, y - h / 2 + (h * i) / 3);
    g.stroke();
  }
  // corner battens and a stencil
  g.fillStyle = '#7a5630';
  g.fillRect(x - w / 2, y - h / 2, 22, h);
  g.fillRect(x + w / 2 - 22, y - h / 2, 22, h);
  g.fillStyle = 'rgba(40,30,20,0.75)';
  g.font = `400 ${Math.round(h * 0.3)}px "Bebas Neue"`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('25 PDR', x, y + 4);
  g.lineWidth = 12;
  g.strokeStyle = INK;
  g.strokeRect(x - w / 2, y - h / 2, w, h);
};

const bottleAt = (g: CanvasRenderingContext2D, x: number, y: number, ang: number, glass: string, label: string, len = 150) => {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  g.fillStyle = glass;
  g.beginPath();
  g.roundRect(-26, -len, 52, len * 0.7, 14);
  g.roundRect(-11, -len * 1.32, 22, len * 0.4, 6);
  g.fill();
  g.lineWidth = 9;
  g.strokeStyle = INK;
  g.beginPath();
  g.roundRect(-26, -len, 52, len * 0.7, 14);
  g.stroke();
  g.beginPath();
  g.roundRect(-11, -len * 1.32, 22, len * 0.4, 6);
  g.stroke();
  g.fillStyle = label;
  g.fillRect(-24, -len * 0.75, 48, len * 0.28);
  g.fillStyle = 'rgba(255,255,255,0.45)';
  g.fillRect(-16, -len * 0.95, 8, len * 0.55);
  g.restore();
};

const face = (g: CanvasRenderingContext2D, hx: number, hy: number, s: number, expr: BearExpr, chewing = false) => {
  // muzzle and nose
  blob(g, hx, hy + 62 * s, 74 * s, 54 * s, MUZZLE, 10);
  blob(g, hx, hy + 38 * s, 28 * s, 19 * s, INK, 0);
  dot(g, hx - 8 * s, hy + 32 * s, 6 * s, 'rgba(255,255,255,0.7)');
  g.lineWidth = 9;
  g.strokeStyle = INK;
  g.beginPath();
  g.moveTo(hx, hy + 56 * s);
  g.lineTo(hx, hy + 74 * s);
  g.stroke();
  const ey = hy - 12 * s;
  const ex = 58 * s;
  if (expr === 'proud') {
    for (const sx of [-1, 1]) {
      g.beginPath();
      g.arc(hx + sx * ex, ey + 6 * s, 16 * s, 1.15 * Math.PI, 1.85 * Math.PI);
      g.stroke();
    }
  } else if (expr === 'curious') {
    for (const sx of [-1, 1]) {
      blob(g, hx + sx * ex, ey, 19 * s, 21 * s, '#ffffff', 8);
      dot(g, hx + sx * ex + 4 * s, ey + 4 * s, 9 * s);
      g.beginPath();
      g.moveTo(hx + sx * ex - 20 * s, ey - 40 * s);
      g.quadraticCurveTo(hx + sx * ex, ey - 52 * s, hx + sx * ex + 20 * s, ey - 40 * s);
      g.stroke();
    }
  } else {
    dot(g, hx - ex, ey, 15 * s);
    dot(g, hx + ex, ey, 15 * s);
    dot(g, hx - ex + 5 * s, ey - 5 * s, 5 * s, '#ffffff');
    dot(g, hx + ex + 5 * s, ey - 5 * s, 5 * s, '#ffffff');
  }
  // mouth
  if (chewing) {
    g.fillStyle = '#7a2e2a';
    g.beginPath();
    g.ellipse(hx, hy + 86 * s, 22 * s, 14 * s, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  } else if (expr === 'happy' || expr === 'proud') {
    g.fillStyle = '#7a2e2a';
    g.beginPath();
    g.moveTo(hx - 34 * s, hy + 74 * s);
    g.quadraticCurveTo(hx, hy + 120 * s, hx + 34 * s, hy + 74 * s);
    g.closePath();
    g.fill();
    g.stroke();
    blob(g, hx, hy + 96 * s, 12 * s, 7 * s, '#e0736a', 0);
  } else if (expr === 'curious') {
    blob(g, hx, hy + 88 * s, 11 * s, 13 * s, '#7a2e2a', 8);
  } else {
    g.beginPath();
    g.moveTo(hx - 22 * s, hy + 78 * s);
    g.quadraticCurveTo(hx, hy + 90 * s, hx + 22 * s, hy + 78 * s);
    g.stroke();
  }
};

const head = (g: CanvasRenderingContext2D, hx: number, hy: number, s: number, expr: BearExpr, chewing = false) => {
  // ears
  for (const sx of [-1, 1]) {
    blob(g, hx + sx * 112 * s, hy - 100 * s, 50 * s, 48 * s, FUR);
    blob(g, hx + sx * 112 * s, hy - 96 * s, 26 * s, 24 * s, BELLY, 0);
  }
  blob(g, hx, hy, 158 * s, 140 * s, FUR);
  // a soft shade on the right and a highlight on the left
  g.save();
  g.beginPath();
  g.ellipse(hx, hy, 152 * s, 134 * s, 0, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = 'rgba(40,20,10,0.22)';
  g.beginPath();
  g.ellipse(hx + 90 * s, hy + 50 * s, 120 * s, 140 * s, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,230,200,0.22)';
  g.beginPath();
  g.ellipse(hx - 70 * s, hy - 70 * s, 60 * s, 24 * s, -0.4, 0, Math.PI * 2);
  g.fill();
  g.restore();
  face(g, hx, hy, s, expr, chewing);
};

export const drawBear = (pose: BearPose, expr: BearExpr = 'happy', cub = false): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 1024;
  const g = c.getContext('2d')!;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const sitting = pose === 'sit' || pose === 'watch' || pose === 'drink' || pose === 'munch' || pose === 'bottle';
  const cx = 384;
  // a cub: bigger head, shorter rounder body
  const hs = cub ? 1.22 : 1;

  if (sitting) {
    const by = cub ? 760 : 700;
    // feet out in front
    for (const sx of [-1, 1]) {
      blob(g, cx + sx * 120, 950, 84, 56, FUR_DARK);
      blob(g, cx + sx * 120, 956, 46, 30, BELLY, 0);
      for (const t of [-28, 0, 28]) dot(g, cx + sx * 120 + t, 922, 9, '#3a2414');
    }
    blob(g, cx, by, cub ? 200 : 214, cub ? 200 : 236, FUR);
    blob(g, cx, by + 40, cub ? 120 : 126, cub ? 140 : 168, BELLY, 0);
    const hy = cub ? 400 : 330;
    // arms
    if (pose === 'sit') {
      limb(g, [[cx - 170, by - 150], [cx - 190, by + 60], [cx - 150, by + 150]], 70);
      limb(g, [[cx + 170, by - 150], [cx + 190, by + 60], [cx + 150, by + 150]], 70);
      paw(g, cx - 150, by + 150);
      paw(g, cx + 150, by + 150);
      head(g, cx, hy, hs, expr);
    } else if (pose === 'watch') {
      limb(g, [[cx - 170, by - 150], [cx - 180, by + 40], [cx - 120, by + 150]], 70);
      limb(g, [[cx + 170, by - 150], [cx + 180, by + 40], [cx + 120, by + 150]], 70);
      paw(g, cx - 120, by + 150);
      paw(g, cx + 120, by + 150);
      head(g, cx + 20, hy - 10, hs, expr);
    } else if (pose === 'drink') {
      limb(g, [[cx - 170, by - 150], [cx - 190, by + 60], [cx - 150, by + 150]], 70);
      paw(g, cx - 150, by + 150);
      head(g, cx, hy, hs, expr, true);
      // a beer bottle tipped up to the mouth, held in the right paw
      // base up at the right, neck down into the mouth
      bottleAt(g, cx + 190, hy - 60, -2.24, '#6b3e18', '#e9dcb8', 170);
      limb(g, [[cx + 170, by - 150], [cx + 250, hy + 120], [cx + 160, hy - 10]], 70);
      paw(g, cx + 160, hy - 10);
    } else if (pose === 'munch') {
      limb(g, [[cx - 170, by - 150], [cx - 190, by + 60], [cx - 150, by + 150]], 70);
      paw(g, cx - 150, by + 150);
      head(g, cx, hy, hs, expr, true);
      // a cigarette sticking out of the mouth, a crumb of tobacco
      g.save();
      g.translate(cx + 14, hy + 86);
      g.rotate(-0.25);
      g.fillStyle = '#f7f3ea';
      g.fillRect(0, -9, 92, 18);
      g.fillStyle = '#d98a3a';
      g.fillRect(70, -9, 22, 18);
      g.lineWidth = 7;
      g.strokeStyle = INK;
      g.strokeRect(0, -9, 92, 18);
      g.restore();
      dot(g, cx + 120, hy + 140, 6, '#7a5630');
      dot(g, cx + 96, hy + 170, 5, '#7a5630');
      // the right paw holds the open packet
      limb(g, [[cx + 170, by - 150], [cx + 210, by - 30], [cx + 190, by + 40]], 70);
      g.fillStyle = '#f2ece0';
      g.fillRect(cx + 150, by - 20, 90, 120);
      g.fillStyle = '#c0392b';
      g.fillRect(cx + 150, by + 20, 90, 34);
      g.lineWidth = 9;
      g.strokeStyle = INK;
      g.strokeRect(cx + 150, by - 20, 90, 120);
      paw(g, cx + 190, by + 40);
    } else {
      // bottle: a cub holding a milk bottle up to its mouth with both paws
      head(g, cx, hy, hs, 'calm', true);
      bottleAt(g, cx, hy + 100, Math.PI * 0.82, '#eef2f4', '#8fb3c8', 200);
      limb(g, [[cx - 160, by - 120], [cx - 120, hy + 230], [cx - 50, hy + 210]], 64);
      limb(g, [[cx + 160, by - 120], [cx + 120, hy + 230], [cx + 50, hy + 210]], 64);
      paw(g, cx - 50, hy + 210, 30);
      paw(g, cx + 50, hy + 210, 30);
    }
    return c;
  }

  // standing upright: stand, walk, carry
  const step = pose === 'walk' ? 1 : 0;
  // legs
  limb(g, [[cx - 80, 760], [cx - 90 - step * 30, 900], [cx - 90 - step * 40, 960 - step * 20]], 96, FUR_DARK);
  limb(g, [[cx + 80, 760], [cx + 90 + step * 20, 900], [cx + 90 + step * 30, 975]], 96, FUR_DARK);
  blob(g, cx - 96 - step * 40, 990 - step * 20, 70, 30, FUR_DARK);
  blob(g, cx + 96 + step * 30, 995, 70, 30, FUR_DARK);
  // body
  blob(g, cx, 600, 200, 250, FUR);
  blob(g, cx, 640, 120, 170, BELLY, 0);
  g.save();
  g.beginPath();
  g.ellipse(cx, 600, 194, 244, 0, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = 'rgba(40,20,10,0.2)';
  g.fillRect(cx + 110, 340, 120, 540);
  g.restore();
  if (pose === 'carry') {
    head(g, cx, 250, hs, expr);
    crate(g, cx, 600, 330, 190);
    limb(g, [[cx - 170, 430], [cx - 200, 540], [cx - 170, 600]], 70);
    limb(g, [[cx + 170, 430], [cx + 200, 540], [cx + 170, 600]], 70);
    paw(g, cx - 168, 604);
    paw(g, cx + 168, 604);
  } else {
    const swing = step * 40;
    limb(g, [[cx - 170, 430], [cx - 220, 560 - swing], [cx - 200, 700 - swing]], 70);
    limb(g, [[cx + 170, 430], [cx + 220, 560 + swing / 2], [cx + 200, 700 + swing / 2]], 70);
    paw(g, cx - 200, 700 - swing);
    paw(g, cx + 200, 700 + swing / 2);
    head(g, cx, 250, hs, expr);
  }
  return c;
};
