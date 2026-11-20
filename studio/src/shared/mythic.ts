// Costume kit for the Indian mythology theme: the same flat inked toon figure as toon.ts
// (large round head, ink outline, stick limbs, simple face) in mythological dress.
// Original designs drawn in code. They follow traditional iconography (a bow, a flute, a trident)
// so viewers recognise each figure, but copy no film, serial, comic or other channel.
// Same 512 x 1024 canvas and proportions as drawCharacter, so flat.tsx can use either.
import {INK} from './toon';

const GOLD = '#f4b93a';
const GOLD_DARK = '#c8891a';
const SHADE = 'rgba(30,14,70,0.17)';

export type MythicExpr = 'calm' | 'happy' | 'stern' | 'sad' | 'awe' | 'roar' | 'strain' | 'sleep'; // sleep: eyes closed, at rest. strain: eyes squeezed shut, teeth gritted, sweat
// fly: both arms raised in a V (rotate the figure to make it fly; also a cheer). offer: right hand held out with a ring.
// raise: right hand up over the head (a sword or weapon about to strike). grab: left arm reaching out to the left.
// lift: both hands low in front, gripping something heavy (Bhima and the tail).
// shoot: drawing a bow, bow held out to the picture's left, string pulled back to the chin (flip the figure to aim right).
export type MythicPose = 'stand' | 'namaste' | 'bless' | 'hold' | 'flute' | 'fly' | 'offer' | 'raise' | 'grab' | 'shoot' | 'lift';

export type MythicLook = {
  skin: string;
  hair: string;
  hairBack: 'none' | 'short' | 'long' | 'wild'; // wild: a spiky mane (rakshasas)
  hairFront: 'none' | 'curls' | 'parted' | 'cap';
  headgear: 'none' | 'mukut' | 'tiara' | 'peacock' | 'jata' | 'spiked';
  tilak: 'none' | 'urdhva' | 'tripundra' | 'bindi' | 'sindoor';
  lower: 'dhoti' | 'short' | 'sari' | 'robe' | 'tiger';
  cloth: string;
  border: string;
  blouse?: string; // covered torso (sari); bare torso when absent
  sash?: string; // cloth worn across the chest
  necklace?: 'gold' | 'beads' | 'garland';
  earrings?: boolean;
  held?: 'bow' | 'mace' | 'trident' | 'flute' | 'pot' | 'staff' | 'sword' | 'lotus'; // lotus: a pink saugandhika lotus on a stem
  mustache?: string; // curled moustache in this colour
  armour?: string; // breastplate and shoulder guards in this metal colour
  halo?: boolean;
  monkey?: boolean; // muzzle, ears and tail
  noTail?: boolean; // monkey without the drawn tail (when the tail is built in 3D)
  bear?: boolean; // round ears on top, muzzle and a big nose (Jambavan)
  muzzle?: string; // muzzle colour for monkey and bear figures
  brows?: string; // thick bushy brows in this colour (elders)
  beard?: string;
  thirdEye?: boolean;
  crescent?: boolean;
  snake?: boolean;
  fangs?: boolean; // two white fangs at the mouth (rakshasas)
  horns?: string; // two curved horns in this colour
};

type G = CanvasRenderingContext2D;

const stick = (g: G, pts: number[][], w: number, color = INK) => {
  g.strokeStyle = color;
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  if (pts.length === 3) g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
  else g.lineTo(pts[1][0], pts[1][1]);
  g.stroke();
};

const dot = (g: G, x: number, y: number, r: number, fill = INK, outline = 0) => {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  if (outline) {
    g.strokeStyle = INK;
    g.lineWidth = outline;
    g.stroke();
  }
};

// An inked coloured line: ink underneath, colour on top.
const rod = (g: G, pts: number[][], w: number, color: string) => {
  stick(g, pts, w + 10, INK);
  stick(g, pts, w, color);
};

// Fill the current path, shade its right side, then ink it.
const inked = (g: G, fill: string, lw = 12, shadeFrom = 286) => {
  g.fillStyle = fill;
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = SHADE;
  g.fillRect(shadeFrom, 0, 512, 1024);
  g.restore();
  g.strokeStyle = INK;
  g.lineWidth = lw;
  g.stroke();
};

export const drawMythic = (look: MythicLook, pose: MythicPose, expr: MythicExpr): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 1024;
  const g = c.getContext('2d')!;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const hx = 256;
  const hy = 300;

  // ----- Behind everything: halo, tail, hair, quiver -----
  if (look.halo) {
    const grad = g.createRadialGradient(hx, hy - 10, 140, hx, hy - 10, 246);
    grad.addColorStop(0, 'rgba(255,214,102,0)');
    grad.addColorStop(0.35, 'rgba(255,214,102,0.6)');
    grad.addColorStop(1, 'rgba(255,214,102,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(hx, hy - 10, 246, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(255,226,140,0.95)';
    g.lineWidth = 6;
    g.beginPath();
    g.arc(hx, hy - 10, 200, 0, Math.PI * 2);
    g.stroke();
  }
  if (look.monkey && !look.noTail) {
    const tail = () => {
      g.beginPath();
      g.moveTo(214, 716);
      g.bezierCurveTo(30, 780, 10, 560, 78, 474);
      g.quadraticCurveTo(116, 426, 78, 404);
      g.stroke();
    };
    g.strokeStyle = INK;
    g.lineWidth = 32;
    tail();
    g.strokeStyle = look.skin;
    g.lineWidth = 20;
    tail();
  }
  if (look.hairBack === 'wild') {
    g.beginPath();
    const n = 15;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI * 0.82 + (i / n) * Math.PI * 1.36;
      const r = i % 2 ? 170 : 222;
      const x = hx + Math.cos(a) * r * 1.05;
      const y = hy - 10 + Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.lineTo(hx + 150, hy + 150);
    g.lineTo(hx - 150, hy + 150);
    g.closePath();
    g.fillStyle = look.hair;
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 10;
    g.stroke();
  } else if (look.hairBack !== 'none') {
    g.beginPath();
    g.ellipse(hx, hy - 8, 166, 150, 0, 0, Math.PI * 2);
    if (look.hairBack === 'long') g.roundRect(hx - 152, hy, 304, 300, 70);
    g.fillStyle = look.hair;
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 10;
    g.stroke();
  }
  if (look.held === 'bow') {
    // quiver behind the left shoulder
    for (const [x, y] of [[132, 372], [158, 356], [186, 350]]) {
      stick(g, [[206, 500], [x, y]], 8);
      g.fillStyle = '#e4572e';
      g.beginPath();
      g.ellipse(x, y, 9, 20, -0.5, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = 5;
      g.stroke();
    }
  }
  if (look.lower === 'sari') {
    // end of the sari hanging behind the left shoulder
    g.beginPath();
    g.roundRect(150, 462, 54, 250, 16);
    inked(g, look.cloth, 10, 512);
    g.fillStyle = look.border;
    g.fillRect(156, 684, 42, 16);
  }

  // ----- Legs and feet -----
  const long = look.lower === 'sari' || look.lower === 'robe';
  stick(g, [[228, 660], [222, 820], [214, 985]], 14);
  stick(g, [[284, 660], [290, 820], [298, 985]], 14);
  stick(g, [[214, 985], [178, 992]], 14);
  stick(g, [[298, 985], [334, 992]], 14);

  // ----- Arms -----
  const L = [198, 492];
  const R = [314, 492];
  const arm = (s: number[], h: number[], bend: number) => {
    stick(g, [s, [(s[0] + h[0]) / 2 + bend, (s[1] + h[1]) / 2], h], 12);
    dot(g, h[0], h[1], 16);
  };
  // A curved sword (khadga): grip at (x, y), blade sweeping up and away, turned by `a` radians.
  const sword = (x: number, y: number, a: number) => {
    g.save();
    g.translate(x, y);
    g.rotate(a);
    g.beginPath();
    g.moveTo(-10, -26);
    g.quadraticCurveTo(-30, -190, 24, -330);
    g.quadraticCurveTo(28, -200, 18, -26);
    g.closePath();
    g.fillStyle = '#dfe4ee';
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 9;
    g.stroke();
    stick(g, [[-2, -60], [6, -280]], 4, 'rgba(255,255,255,0.9)');
    g.beginPath();
    g.roundRect(-38, -38, 76, 18, 8);
    inked(g, GOLD, 7, 512);
    rod(g, [[0, -22], [0, 28]], 10, '#5a2a1c');
    g.restore();
  };
  const front = pose === 'namaste' || pose === 'flute' || pose === 'lift';
  const holdX = look.held === 'bow' ? 440 : look.held === 'trident' ? 432 : look.held === 'staff' ? 396 : 404;
  if (pose === 'shoot') {
    arm(L, [70, 468], -6);
  } else if (pose === 'fly') {
    arm(L, [58, 196], -30);
    arm(R, [454, 196], 30);
  } else if (!front) {
    if (look.held === 'pot') arm(L, [160, 640], -18);
    else if (pose === 'grab') arm(L, [52, 520], -26);
    else arm(L, [168, 650], -18);
    if (pose === 'stand') arm(R, [344, 650], 18);
    else if (pose === 'bless') arm(R, [402, 404], 34);
    else if (pose === 'hold') arm(R, [holdX, 570], -14);
    else if (pose === 'offer') arm(R, [446, 452], 30);
    else if (pose === 'raise') arm(R, [420, 250], 46);
    else if (pose === 'grab') arm(R, [344, 650], 18);
  }


  // ----- Torso -----
  g.beginPath();
  g.roundRect(184, 440, 144, 250, 66);
  inked(g, look.blouse ?? look.skin);
  if (look.armour) {
    g.beginPath();
    g.roundRect(188, 470, 136, 120, 40);
    inked(g, look.armour, 10, 300);
    g.save();
    g.clip();
    g.strokeStyle = 'rgba(23,18,26,0.45)';
    g.lineWidth = 5;
    for (let y = 500; y < 600; y += 26)
      for (let x = 196 + ((y / 26) % 2) * 13; x < 330; x += 26) {
        g.beginPath();
        g.arc(x, y, 13, 0, Math.PI);
        g.stroke();
      }
    g.restore();
    dot(g, 256, 520, 16, '#d7263d', 7);
  }

  // ----- Lower garment -----
  const hem = look.lower === 'short' ? 716 : look.lower === 'tiger' ? 764 : long ? 948 : 806;
  const flare = long ? 38 : 18;
  g.beginPath();
  g.moveTo(180, 584);
  g.lineTo(332, 584);
  g.quadraticCurveTo(346 + flare, (584 + hem) / 2, 338 + flare, hem);
  g.lineTo(174 - flare, hem);
  g.quadraticCurveTo(166 - flare, (584 + hem) / 2, 180, 584);
  g.closePath();
  inked(g, look.cloth);
  g.save();
  g.clip();
  if (look.lower === 'tiger') {
    g.strokeStyle = '#3a2413';
    g.lineWidth = 10;
    for (let i = 0; i < 6; i++) {
      const y = 606 + i * 28;
      g.beginPath();
      g.moveTo(150 + (i % 2) * 40, y);
      g.quadraticCurveTo(200 + (i % 2) * 40, y + 16, 236 + (i % 2) * 50, y - 4);
      g.moveTo(300 + (i % 2) * 20, y + 10);
      g.quadraticCurveTo(340, y + 22, 380, y + 6);
      g.stroke();
    }
  } else {
    // border along the hem
    g.fillStyle = look.border;
    g.fillRect(100, hem - 34, 320, 40);
    g.fillStyle = SHADE;
    g.fillRect(286, hem - 34, 200, 40);
  }
  g.restore();
  // pleats
  g.strokeStyle = INK;
  g.lineWidth = 6;
  g.beginPath();
  for (const dx of [-22, 0, 22]) {
    g.moveTo(256 + dx * 0.3, 620);
    g.lineTo(256 + dx * (long ? 2.2 : 1.4), hem - (look.lower === 'tiger' ? 8 : 38));
  }
  if (look.lower !== 'tiger') g.stroke();
  // waistband
  g.beginPath();
  g.roundRect(174, 566, 164, 32, 14);
  inked(g, look.lower === 'tiger' ? '#3a2413' : look.border, 10);

  // ----- Cloth across the chest -----
  if (look.sash) {
    g.beginPath();
    g.moveTo(292, 572);
    g.lineTo(334, 560);
    g.lineTo(222, 440);
    g.lineTo(186, 470);
    g.closePath();
    inked(g, look.sash, 10);
    if (look.lower === 'sari') {
      stick(g, [[322, 566], [212, 448]], 8, look.border);
    }
  }

  if (look.armour) {
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(256 + s * 66, 474, 44, 30, s * 0.35, 0, Math.PI * 2);
      inked(g, look.armour, 9, 512);
      dot(g, 256 + s * 66, 474, 8, '#d7263d', 4);
    }
  }

  // ----- Necklaces -----
  if (look.necklace === 'gold') {
    g.lineWidth = 20;
    g.strokeStyle = INK;
    g.beginPath();
    g.arc(256, 446, 50, 0.16 * Math.PI, 0.84 * Math.PI);
    g.stroke();
    g.lineWidth = 11;
    g.strokeStyle = GOLD;
    g.stroke();
    dot(g, 256, 502, 12, '#d7263d', 6);
  } else if (look.necklace === 'beads' || look.necklace === 'garland') {
    const garland = look.necklace === 'garland';
    const n = garland ? 13 : 11;
    const colors = garland ? ['#ffffff', '#ff7a59', '#ffd23f'] : ['#7a4a2b'];
    for (let i = 0; i < n; i++) {
      const a = (0.1 + (0.8 * i) / (n - 1)) * Math.PI;
      const x = 256 + Math.cos(a) * (garland ? 66 : 50);
      const y = 452 + Math.sin(a) * (garland ? 120 : 66);
      dot(g, x, y, garland ? 13 : 10, colors[i % colors.length], 5);
    }
  }
  if (look.snake) {
    const body = () => {
      g.beginPath();
      g.moveTo(204, 462);
      g.quadraticCurveTo(256, 520, 310, 470);
      g.quadraticCurveTo(346, 440, 332, 404);
      g.stroke();
    };
    g.strokeStyle = INK;
    g.lineWidth = 26;
    body();
    g.strokeStyle = '#5f8f5a';
    g.lineWidth = 15;
    body();
    dot(g, 332, 400, 15, '#5f8f5a', 6);
    dot(g, 327, 396, 3);
    dot(g, 338, 396, 3);
  }

  // ----- Ears (behind the head) -----
  if (look.monkey) {
    for (const s of [-1, 1]) {
      dot(g, hx + s * 150, hy + 6, 40, look.skin, 10);
      dot(g, hx + s * 150, hy + 6, 20, look.muzzle ?? '#f6d9b4');
    }
  }

  if (look.bear) {
    for (const s of [-1, 1]) {
      dot(g, hx + s * 112, hy - 108, 46, look.skin, 10);
      dot(g, hx + s * 112, hy - 108, 22, look.muzzle ?? '#c9a27e');
    }
  }

  // ----- Head -----
  g.save();
  g.beginPath();
  g.ellipse(hx, hy, 150, 136, 0, 0, Math.PI * 2);
  g.fillStyle = look.skin;
  g.fill();
  g.clip();
  if (look.monkey || look.bear) {
    g.fillStyle = look.muzzle ?? '#f6d9b4';
    g.beginPath();
    g.ellipse(hx, hy + 28, 108, 100, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = SHADE;
  g.beginPath();
  g.ellipse(hx + 76, hy + 64, 150, 130, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)';
  g.beginPath();
  g.ellipse(hx - 62, hy - 60, 54, 18, -0.35, 0, Math.PI * 2);
  g.fill();
  // hair on the head itself
  g.fillStyle = look.hair;
  if (look.hairFront === 'curls') {
    g.fillRect(hx - 160, hy - 150, 320, 52);
    for (let x = hx - 132; x <= hx + 132; x += 44) {
      g.beginPath();
      g.arc(x, hy - 98, 30, 0, Math.PI * 2);
      g.fill();
    }
  } else if (look.hairFront === 'parted') {
    g.beginPath();
    g.moveTo(hx - 160, hy - 10);
    g.quadraticCurveTo(hx - 120, hy - 104, hx, hy - 110);
    g.quadraticCurveTo(hx + 120, hy - 104, hx + 160, hy - 10);
    g.lineTo(hx + 160, hy - 150);
    g.lineTo(hx - 160, hy - 150);
    g.closePath();
    g.fill();
  } else if (look.hairFront === 'cap') {
    g.beginPath();
    g.ellipse(hx, hy - 150, 170, 76, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  g.lineWidth = 12;
  g.strokeStyle = INK;
  g.beginPath();
  g.ellipse(hx, hy, 150, 136, 0, 0, Math.PI * 2);
  g.stroke();
  if (look.hairFront === 'parted') stick(g, [[hx, hy - 134], [hx, hy - 110]], 5, '#d7263d');

  // ----- Face -----
  const ey = hy + (look.monkey ? 2 : 6);
  const ex = 50;
  g.strokeStyle = INK;
  g.lineWidth = 10;
  if (expr === 'happy') {
    g.beginPath();
    g.arc(hx - ex, ey + 6, 18, Math.PI * 1.1, Math.PI * 1.9);
    g.moveTo(hx + ex - 18, ey);
    g.arc(hx + ex, ey + 6, 18, Math.PI * 1.1, Math.PI * 1.9);
    g.stroke();
    g.fillStyle = INK;
    g.beginPath();
    g.moveTo(hx - 36, ey + 36);
    g.quadraticCurveTo(hx, ey + 92, hx + 36, ey + 36);
    g.closePath();
    g.fill();
    g.fillStyle = '#ff8fa3';
    g.beginPath();
    g.ellipse(hx, ey + 62, 15, 8, 0, 0, Math.PI * 2);
    g.fill();
  } else if (expr === 'awe') {
    for (const s of [-1, 1]) {
      dot(g, hx + s * ex, ey - 2, 22, '#ffffff', 8);
      dot(g, hx + s * ex, ey + 2, 9);
    }
    g.strokeStyle = INK;
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(hx - ex - 22, ey - 50);
    g.quadraticCurveTo(hx - ex, ey - 64, hx - ex + 22, ey - 52);
    g.moveTo(hx + ex - 22, ey - 52);
    g.quadraticCurveTo(hx + ex, ey - 64, hx + ex + 22, ey - 50);
    g.stroke();
    g.fillStyle = INK;
    g.beginPath();
    g.ellipse(hx, ey + 56, 15, 21, 0, 0, Math.PI * 2);
    g.fill();
  } else if (expr === 'sad') {
    // eyes looking down, brows lifted in the middle, a small frown
    dot(g, hx - ex, ey + 12, 13);
    dot(g, hx + ex, ey + 12, 13);
    g.strokeStyle = INK;
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(hx - ex - 22, ey - 28);
    g.lineTo(hx - ex + 16, ey - 44);
    g.moveTo(hx + ex - 16, ey - 44);
    g.lineTo(hx + ex + 22, ey - 28);
    g.stroke();
    g.beginPath();
    g.arc(hx, ey + 78, 20, 1.18 * Math.PI, 1.82 * Math.PI);
    g.stroke();
  } else if (expr === 'roar') {
    dot(g, hx - ex, ey, 14);
    dot(g, hx + ex, ey, 14);
    g.strokeStyle = INK;
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(hx - ex - 24, ey - 50);
    g.lineTo(hx - ex + 18, ey - 26);
    g.moveTo(hx + ex - 18, ey - 26);
    g.lineTo(hx + ex + 24, ey - 50);
    g.stroke();
    g.fillStyle = INK;
    g.beginPath();
    g.ellipse(hx, ey + 62, 40, 30, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#c0283c';
    g.beginPath();
    g.ellipse(hx, ey + 76, 22, 11, 0, 0, Math.PI * 2);
    g.fill();
  } else if (expr === 'sleep') {
    // eyes closed (two downward arcs), a small resting mouth
    g.strokeStyle = INK;
    g.lineWidth = 10;
    g.beginPath();
    g.arc(hx - ex, ey - 4, 16, 0.15 * Math.PI, 0.85 * Math.PI);
    g.moveTo(hx + ex + 16 * Math.cos(0.15 * Math.PI), ey - 4 + 16 * Math.sin(0.15 * Math.PI));
    g.arc(hx + ex, ey - 4, 16, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
    g.beginPath();
    g.moveTo(hx - 14, ey + 50);
    g.lineTo(hx + 14, ey + 50);
    g.stroke();
  } else if (expr === 'strain') {
    // eyes squeezed shut, brows pulled down, gritted teeth, sweat drops
    g.strokeStyle = INK;
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(hx - ex - 20, ey - 12); g.lineTo(hx - ex + 14, ey); g.lineTo(hx - ex - 20, ey + 12);
    g.moveTo(hx + ex + 20, ey - 12); g.lineTo(hx + ex - 14, ey); g.lineTo(hx + ex + 20, ey + 12);
    g.moveTo(hx - ex - 24, ey - 46); g.lineTo(hx - ex + 18, ey - 26);
    g.moveTo(hx + ex - 18, ey - 26); g.lineTo(hx + ex + 24, ey - 46);
    g.stroke();
    g.beginPath();
    g.roundRect(hx - 40, ey + 42, 80, 30, 10);
    g.fillStyle = '#ffffff';
    g.fill();
    g.lineWidth = 8;
    g.stroke();
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(hx - 40, ey + 57); g.lineTo(hx + 40, ey + 57);
    for (const x of [-20, 0, 20]) { g.moveTo(hx + x, ey + 42); g.lineTo(hx + x, ey + 72); }
    g.stroke();
    for (const [x, y, r] of [[hx + 150, hy - 70, 16], [hx + 168, hy - 10, 12], [hx - 160, hy - 50, 13]]) {
      g.beginPath();
      g.moveTo(x, y - r * 2);
      g.quadraticCurveTo(x + r, y - r * 0.2, x, y + r);
      g.quadraticCurveTo(x - r, y - r * 0.2, x, y - r * 2);
      g.fillStyle = '#9fd8ff';
      g.fill();
      g.lineWidth = 5;
      g.stroke();
    }
  } else {
    dot(g, hx - ex, ey, 14);
    dot(g, hx + ex, ey, 14);
    g.strokeStyle = INK;
    g.lineWidth = 10;
    g.beginPath();
    const tilt = expr === 'stern' ? 12 : -6;
    g.moveTo(hx - ex - 20, ey - 40);
    g.lineTo(hx - ex + 18, ey - 40 + tilt);
    g.moveTo(hx + ex - 18, ey - 40 + tilt);
    g.lineTo(hx + ex + 20, ey - 40);
    g.stroke();
    g.beginPath();
    if (expr === 'calm') g.arc(hx, ey + 40, 22, 0.18 * Math.PI, 0.82 * Math.PI);
    else {
      g.moveTo(hx - 18, ey + 54);
      g.lineTo(hx + 18, ey + 54);
    }
    g.stroke();
  }
  if (look.lower === 'sari') {
    // lashes
    stick(g, [[hx - ex - 14, ey - 4], [hx - ex - 30, ey - 14]], 6);
    stick(g, [[hx + ex + 14, ey - 4], [hx + ex + 30, ey - 14]], 6);
  }
  if (look.monkey) {
    dot(g, hx - 9, ey + 24, 4);
    dot(g, hx + 9, ey + 24, 4);
  }
  if (look.bear) {
    g.fillStyle = INK;
    g.beginPath();
    g.ellipse(hx, ey + 22, 24, 15, 0, 0, Math.PI * 2);
    g.fill();
    dot(g, hx - 7, ey + 17, 5, 'rgba(255,255,255,0.6)');
  }
  if (look.brows) {
    g.strokeStyle = INK;
    g.lineWidth = 26;
    const browLine = () => {
      g.beginPath();
      g.moveTo(hx - ex - 34, ey - 34);
      g.quadraticCurveTo(hx - ex, ey - 62, hx - ex + 28, ey - 44);
      g.moveTo(hx + ex - 28, ey - 44);
      g.quadraticCurveTo(hx + ex, ey - 62, hx + ex + 34, ey - 34);
      g.stroke();
    };
    browLine();
    g.strokeStyle = look.brows;
    g.lineWidth = 15;
    browLine();
  }

  if (look.fangs) {
    const my = expr === 'roar' ? ey + 36 : ey + 50;
    for (const sgn of [-1, 1]) {
      g.beginPath();
      g.moveTo(hx + sgn * 30, my);
      g.lineTo(hx + sgn * 16, my);
      g.lineTo(hx + sgn * 23, my + 26);
      g.closePath();
      g.fillStyle = '#ffffff';
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = 5;
      g.stroke();
    }
  }

  // ----- Forehead marks -----
  if (look.tilak === 'urdhva') {
    g.strokeStyle = '#fff1bf';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(hx - 15, hy - 92);
    g.lineTo(hx - 15, hy - 58);
    g.quadraticCurveTo(hx, hy - 38, hx + 15, hy - 58);
    g.lineTo(hx + 15, hy - 92);
    g.stroke();
    stick(g, [[hx, hy - 90], [hx, hy - 58]], 7, '#d7263d');
  } else if (look.tilak === 'tripundra') {
    for (const y of [hy - 94, hy - 78, hy - 62]) stick(g, [[hx - 62, y], [hx + 62, y]], 7, '#f6f2e4');
  } else if (look.tilak === 'bindi') {
    dot(g, hx, hy - 56, 11, '#d7263d');
  } else if (look.tilak === 'sindoor') {
    stick(g, [[hx, hy - 96], [hx, hy - 58]], 12, '#e4572e');
  }
  if (look.thirdEye) {
    g.beginPath();
    g.ellipse(hx, hy - 78, 11, 20, 0, 0, Math.PI * 2);
    g.fillStyle = '#ffffff';
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 6;
    g.stroke();
    dot(g, hx, hy - 78, 6);
  }

  // ----- Moustache -----
  if (look.mustache) {
    const m = () => {
      g.beginPath();
      g.moveTo(hx, ey + 34);
      g.quadraticCurveTo(hx - 50, ey + 22, hx - 78, ey + 44);
      g.quadraticCurveTo(hx - 96, ey + 58, hx - 84, ey + 22);
      g.moveTo(hx, ey + 34);
      g.quadraticCurveTo(hx + 50, ey + 22, hx + 78, ey + 44);
      g.quadraticCurveTo(hx + 96, ey + 58, hx + 84, ey + 22);
      g.stroke();
    };
    g.strokeStyle = INK;
    g.lineWidth = 24;
    m();
    g.strokeStyle = look.mustache;
    g.lineWidth = 12;
    m();
  }

  // ----- Beard -----
  if (look.beard) {
    g.beginPath();
    g.moveTo(hx - 126, hy + 58);
    g.quadraticCurveTo(hx - 104, hy + 236, hx, hy + 274);
    g.quadraticCurveTo(hx + 104, hy + 236, hx + 126, hy + 58);
    g.quadraticCurveTo(hx, hy + 122, hx - 126, hy + 58);
    g.closePath();
    inked(g, look.beard, 10, 300);
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(hx - 40, hy + 150);
    g.lineTo(hx - 30, hy + 220);
    g.moveTo(hx + 10, hy + 150);
    g.lineTo(hx + 8, hy + 236);
    g.stroke();
  }

  // ----- Earrings -----
  if (look.earrings) {
    for (const s of [-1, 1]) dot(g, hx + s * 150, hy + 50, 15, GOLD, 6);
  }

  // ----- Headgear -----
  const band = (h: number) => {
    g.beginPath();
    g.roundRect(hx - 116, hy - 130, 232, h, 12);
    inked(g, GOLD, 10, 300);
    for (let x = hx - 90; x <= hx + 90; x += 36) dot(g, x, hy - 130 + h / 2, 6, '#fff6dc');
  };
  if (look.headgear === 'mukut') {
    g.beginPath();
    g.moveTo(hx - 104, hy - 116);
    g.quadraticCurveTo(hx - 100, hy - 226, hx - 40, hy - 252);
    g.lineTo(hx, hy - 284);
    g.lineTo(hx + 40, hy - 252);
    g.quadraticCurveTo(hx + 100, hy - 226, hx + 104, hy - 116);
    g.closePath();
    inked(g, GOLD, 12, 300);
    g.strokeStyle = GOLD_DARK;
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(hx - 70, hy - 226);
    g.lineTo(hx + 70, hy - 226);
    g.stroke();
    band(40);
    dot(g, hx, hy - 174, 18, '#d7263d', 7);
  } else if (look.headgear === 'spiked') {
    // a tall crown of sharp points, darker gold, with black and red stones
    g.beginPath();
    g.moveTo(hx - 112, hy - 116);
    const tips = [[-110, -230], [-66, -196], [-40, -270], [0, -228], [0, -300], [0, -228], [40, -270], [66, -196], [110, -230]];
    g.lineTo(hx - 120, hy - 236);
    g.lineTo(hx - 70, hy - 186);
    g.lineTo(hx - 44, hy - 268);
    g.lineTo(hx - 14, hy - 200);
    g.lineTo(hx, hy - 302);
    g.lineTo(hx + 14, hy - 200);
    g.lineTo(hx + 44, hy - 268);
    g.lineTo(hx + 70, hy - 186);
    g.lineTo(hx + 120, hy - 236);
    g.lineTo(hx + 112, hy - 116);
    g.closePath();
    void tips;
    inked(g, GOLD_DARK, 12, 300);
    band(40);
    dot(g, hx, hy - 170, 17, '#1d1420', 7);
    dot(g, hx, hy - 170, 7, '#d7263d');
    for (const s of [-1, 1]) dot(g, hx + s * 62, hy - 160, 10, '#d7263d', 5);
  } else if (look.headgear === 'tiara') {
    g.beginPath();
    g.moveTo(hx - 84, hy - 116);
    g.lineTo(hx - 84, hy - 184);
    g.lineTo(hx - 42, hy - 150);
    g.lineTo(hx, hy - 212);
    g.lineTo(hx + 42, hy - 150);
    g.lineTo(hx + 84, hy - 184);
    g.lineTo(hx + 84, hy - 116);
    g.closePath();
    inked(g, GOLD, 10, 300);
    band(34);
    dot(g, hx, hy - 160, 11, '#d7263d', 5);
  } else if (look.headgear === 'peacock') {
    band(32);
    stick(g, [[hx + 26, hy - 122], [hx + 34, hy - 200], [hx + 74, hy - 250]], 8);
    g.save();
    g.translate(hx + 76, hy - 226);
    g.rotate(0.3);
    g.beginPath();
    g.ellipse(0, 0, 36, 56, 0, 0, Math.PI * 2);
    g.fillStyle = '#2fa56b';
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 8;
    g.stroke();
    g.beginPath();
    g.ellipse(0, -6, 22, 32, 0, 0, Math.PI * 2);
    g.fillStyle = '#2b78d6';
    g.fill();
    g.beginPath();
    g.ellipse(0, -8, 11, 16, 0, 0, Math.PI * 2);
    g.fillStyle = '#1b2a6b';
    g.fill();
    g.strokeStyle = GOLD;
    g.lineWidth = 4;
    g.stroke();
    g.restore();
  } else if (look.headgear === 'jata') {
    g.beginPath();
    g.ellipse(hx, hy - 176, 72, 60, 0, 0, Math.PI * 2);
    inked(g, look.hair, 10, 300);
    g.strokeStyle = 'rgba(255,255,255,0.28)';
    g.lineWidth = 6;
    g.beginPath();
    g.arc(hx, hy - 176, 44, 1.1 * Math.PI, 1.9 * Math.PI);
    g.stroke();
    rod(g, [[hx - 58, hy - 132], [hx + 58, hy - 132]], 8, '#7a4a2b');
  }
  if (look.horns) {
    for (const sgn of [-1, 1]) {
      g.beginPath();
      g.moveTo(hx + sgn * 70, hy - 116);
      g.quadraticCurveTo(hx + sgn * 150, hy - 170, hx + sgn * 128, hy - 262);
      g.quadraticCurveTo(hx + sgn * 118, hy - 186, hx + sgn * 104, hy - 126);
      g.closePath();
      inked(g, look.horns, 9, 512);
    }
  }
  if (look.crescent) {
    const cx = hx + 66;
    const cy = hy - 208;
    g.beginPath();
    g.arc(cx, cy, 30, -0.5 * Math.PI, 0.5 * Math.PI);
    g.quadraticCurveTo(cx + 24, cy, cx, cy - 30);
    g.closePath();
    g.fillStyle = '#fdf3c4';
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 6;
    g.stroke();
  }

  // ----- Things held, and arms that cross the body -----
  if (pose === 'namaste') {
    arm(L, [246, 560], -44);
    arm(R, [266, 560], 44);
  }
  if (pose === 'lift') {
    arm(L, [222, 612], -46);
    arm(R, [290, 612], 46);
  }
  if (pose === 'flute') {
    arm(L, [316, 362], -50);
    rod(g, [[262, 356], [456, 340]], 12, '#c98b4b');
    for (const x of [352, 384, 416]) dot(g, x, 350 - (x - 262) * 0.082, 4);
    arm(R, [404, 350], 46);
  }
  if (pose === 'hold') {
    if (look.held === 'bow') {
      stick(g, [[384, 236], [384, 884]], 4);
      g.strokeStyle = INK;
      g.lineWidth = 22;
      g.beginPath();
      g.moveTo(384, 236);
      g.quadraticCurveTo(496, 560, 384, 884);
      g.stroke();
      g.strokeStyle = '#b8743a';
      g.lineWidth = 11;
      g.stroke();
      dot(g, 384, 236, 9, GOLD, 5);
      dot(g, 384, 884, 9, GOLD, 5);
    } else if (look.held === 'mace') {
      rod(g, [[400, 760], [416, 336]], 14, GOLD_DARK);
      g.beginPath();
      g.arc(420, 282, 54, 0, Math.PI * 2);
      inked(g, GOLD, 10, 430);
      g.strokeStyle = GOLD_DARK;
      g.lineWidth = 6;
      g.beginPath();
      g.ellipse(420, 282, 22, 54, 0, 0, Math.PI * 2);
      g.stroke();
      dot(g, 420, 222, 10, GOLD, 6);
    } else if (look.held === 'trident') {
      rod(g, [[432, 990], [432, 236]], 12, '#c9ccd6');
      g.strokeStyle = INK;
      g.lineWidth = 22;
      const prongs = () => {
        g.beginPath();
        g.moveTo(388, 132);
        g.quadraticCurveTo(388, 236, 432, 236);
        g.quadraticCurveTo(476, 236, 476, 132);
        g.moveTo(432, 236);
        g.lineTo(432, 96);
        g.stroke();
      };
      prongs();
      g.strokeStyle = '#c9ccd6';
      g.lineWidth = 11;
      prongs();
    }
    else if (look.held === 'sword') sword(404, 570, -0.15);
    else if (look.held === 'staff') {
      rod(g, [[396, 990], [404, 300]], 14, '#8a5a32');
      dot(g, 404, 292, 22, '#8a5a32', 8);
    }
    dot(g, holdX, 570, 16);
  }
  if (pose === 'shoot') {
    // the bow held out at the left hand, string drawn back to the right hand at the chin, arrow nocked
    const bx = 70;
    const by = 468;
    const hand: number[] = [296, 432];
    stick(g, [[bx + 8, 200], hand], 4);
    stick(g, [hand, [bx + 8, 736]], 4);
    g.strokeStyle = INK;
    g.lineWidth = 22;
    g.beginPath();
    g.moveTo(bx + 8, 200);
    g.quadraticCurveTo(bx - 70, by, bx + 8, 736);
    g.stroke();
    g.strokeStyle = '#b8743a';
    g.lineWidth = 11;
    g.stroke();
    dot(g, bx + 8, 200, 9, GOLD, 5);
    dot(g, bx + 8, 736, 9, GOLD, 5);
    rod(g, [hand, [6, by - 12]], 6, '#e9d6a8');
    g.beginPath();
    g.moveTo(4, by - 12);
    g.lineTo(26, by - 28);
    g.lineTo(26, by + 2);
    g.closePath();
    g.fillStyle = '#dfe4ee';
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 5;
    g.stroke();
    arm(R, hand, 40);
    dot(g, bx, by, 16);
  }
  if (pose === 'raise' && look.held === 'sword') {
    sword(420, 250, 0.5);
    dot(g, 420, 250, 16);
  }
  if (pose === 'offer') {
    // Shri Ram's ring, held up in the right hand
    g.strokeStyle = INK;
    g.lineWidth = 16;
    g.beginPath();
    g.arc(452, 410, 22, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = GOLD;
    g.lineWidth = 8;
    g.stroke();
    dot(g, 452, 384, 11, '#d7263d', 5);
    dot(g, 446, 452, 16);
  }
  if (look.held === 'lotus' && pose === 'hold') {
    // the saugandhika lotus: a stem from the right hand up to a pink thousand-petal flower
    rod(g, [[404, 570], [414, 500], [420, 430]], 6, '#3f8a4a');
    const fx = 420, fy = 404;
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.95 + (i / 8) * 1.1);
      g.save();
      g.translate(fx, fy + 10);
      g.rotate(a + Math.PI / 2);
      g.beginPath();
      g.ellipse(0, -30, 14, 32, 0, 0, Math.PI * 2);
      g.fillStyle = i % 2 ? '#f7a8c4' : '#ef7fa8';
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = 6;
      g.stroke();
      g.restore();
    }
    dot(g, fx, fy + 8, 12, '#ffd34d', 5);
    dot(g, 404, 570, 16);
  }
  if (look.held === 'pot') {
    stick(g, [[160, 640], [160, 668]], 6);
    g.beginPath();
    g.ellipse(160, 708, 38, 40, 0, 0, Math.PI * 2);
    inked(g, '#b8743a', 9, 164);
    g.beginPath();
    g.roundRect(142, 662, 36, 14, 5);
    inked(g, '#b8743a', 7, 164);
  }

  return c;
};

// ----- The cast: recurring figures keep one design in every video -----
// Working names; see themes/indian-mythology-cast.md.
export type CastMember = {name: string; look: MythicLook; pose: MythicPose; expr: MythicExpr};

export const CAST: Record<string, CastMember> = {
  ram: {
    name: 'Ram',
    pose: 'hold',
    expr: 'calm',
    look: {
      skin: '#86b8ea', hair: '#1c1a22', hairBack: 'short', hairFront: 'none', headgear: 'mukut', tilak: 'urdhva',
      lower: 'dhoti', cloth: '#f6c63c', border: '#d7263d', sash: '#f08a24', necklace: 'gold', earrings: true,
      held: 'bow', halo: true,
    },
  },
  sita: {
    name: 'Sita',
    pose: 'namaste',
    expr: 'calm',
    look: {
      skin: '#f3c9a0', hair: '#1c1a22', hairBack: 'long', hairFront: 'parted', headgear: 'tiara', tilak: 'bindi',
      lower: 'sari', cloth: '#e23d5b', border: GOLD, blouse: '#b8243f', sash: '#e23d5b', necklace: 'gold',
      earrings: true, halo: true,
    },
  },
  hanuman: {
    name: 'Hanuman',
    pose: 'hold',
    expr: 'happy',
    look: {
      skin: '#e8924a', hair: '#e8924a', hairBack: 'none', hairFront: 'none', headgear: 'tiara', tilak: 'sindoor',
      lower: 'short', cloth: '#d7263d', border: GOLD, necklace: 'gold', held: 'mace', monkey: true,
    },
  },
  krishna: {
    name: 'Krishna',
    pose: 'flute',
    expr: 'calm',
    look: {
      skin: '#4f8fe0', hair: '#1c1a22', hairBack: 'short', hairFront: 'curls', headgear: 'peacock', tilak: 'urdhva',
      lower: 'dhoti', cloth: '#f9d23c', border: '#2fa56b', necklace: 'garland', earrings: true, held: 'flute',
      halo: true,
    },
  },
  shiv: {
    name: 'Shiv',
    pose: 'hold',
    expr: 'calm',
    look: {
      skin: '#c3cdea', hair: '#3a2a26', hairBack: 'long', hairFront: 'cap', headgear: 'jata', tilak: 'tripundra',
      lower: 'tiger', cloth: '#eaa23a', border: '#3a2413', necklace: 'beads', held: 'trident', thirdEye: true,
      crescent: true, snake: true, halo: true,
    },
  },
  // ----- Added for "Hanuman's leap" (16 November 2026): approved by the owner on 17 November 2026 -----
  jambavan: {
    name: 'Jambavan',
    pose: 'hold',
    expr: 'calm',
    look: {
      skin: '#5b3b2a', hair: '#5b3b2a', hairBack: 'none', hairFront: 'none', headgear: 'tiara', tilak: 'none',
      lower: 'short', cloth: '#3f7a5a', border: GOLD, sash: '#2f5f45', necklace: 'beads', held: 'staff', bear: true,
      muzzle: '#c9a27e', brows: '#efe9de', beard: '#efe9de',
    },
  },
  baalHanuman: {
    // young Hanuman for flashbacks: the cast Hanuman without crown or mace; draw him smaller
    name: 'Baal Hanuman',
    pose: 'fly',
    expr: 'happy',
    look: {
      skin: '#eda05c', hair: '#eda05c', hairBack: 'none', hairFront: 'none', headgear: 'none', tilak: 'sindoor',
      lower: 'short', cloth: '#d7263d', border: GOLD, monkey: true,
    },
  },
  vanaraA: {
    name: 'Vanara (brown)',
    pose: 'stand',
    expr: 'calm',
    look: {skin: '#a8703f', hair: '#a8703f', hairBack: 'none', hairFront: 'none', headgear: 'none', tilak: 'none', lower: 'short', cloth: '#6b8e4e', border: '#4a6b34', monkey: true, muzzle: '#e9cba6'},
  },
  vanaraB: {
    name: 'Vanara (golden)',
    pose: 'stand',
    expr: 'calm',
    look: {skin: '#d6a454', hair: '#d6a454', hairBack: 'none', hairFront: 'none', headgear: 'none', tilak: 'none', lower: 'short', cloth: '#3f6fb0', border: '#2b4f84', monkey: true, muzzle: '#f6e2bf', necklace: 'beads'},
  },
  vanaraC: {
    name: 'Vanara (grey)',
    pose: 'stand',
    expr: 'calm',
    look: {skin: '#8d8478', hair: '#8d8478', hairBack: 'none', hairFront: 'none', headgear: 'none', tilak: 'none', lower: 'short', cloth: '#b5523b', border: '#7e3424', monkey: true, muzzle: '#e6ddd0'},
  },
  // ----- Added for "Jatayu" (17 November 2026): approved by the owner -----
  lakshman: {
    name: 'Lakshman',
    pose: 'hold',
    expr: 'calm',
    look: {
      skin: '#f0c08f', hair: '#1c1a22', hairBack: 'short', hairFront: 'none', headgear: 'mukut', tilak: 'urdhva',
      lower: 'dhoti', cloth: '#3f9a6b', border: GOLD, sash: '#f6c63c', necklace: 'gold', earrings: true, held: 'bow',
      halo: true,
    },
  },
  ravana: {
    // the main head and body; drawRavana in epic.ts adds the other nine heads
    name: 'Ravana',
    pose: 'hold',
    expr: 'stern',
    look: {
      skin: '#8c5a3c', hair: '#17121a', hairBack: 'long', hairFront: 'cap', headgear: 'spiked', tilak: 'tripundra',
      lower: 'dhoti', cloth: '#5b1f4a', border: GOLD, necklace: 'gold', earrings: true, held: 'sword',
      mustache: '#17121a', armour: '#c8891a',
    },
  },
  // ----- Added for "Khar-Dushan" (17 November 2026): approved by the owner -----
  shurpanakha: {
    name: 'Shurpanakha',
    pose: 'grab',
    expr: 'stern',
    look: {
      skin: '#7f8f6a', hair: '#3a1418', hairBack: 'wild', hairFront: 'parted', headgear: 'none', tilak: 'none',
      lower: 'sari', cloth: '#2f5f45', border: '#c0283c', blouse: '#24493a', sash: '#2f5f45', necklace: 'gold',
      earrings: true, fangs: true,
    },
  },
  khara: {
    name: 'Khara',
    pose: 'hold',
    expr: 'stern',
    look: {
      skin: '#8a3a2c', hair: '#17121a', hairBack: 'wild', hairFront: 'cap', headgear: 'spiked', tilak: 'tripundra',
      lower: 'dhoti', cloth: '#4a1020', border: GOLD, necklace: 'gold', earrings: true, held: 'mace',
      mustache: '#17121a', armour: '#9a6a3a', fangs: true,
    },
  },
  dushana: {
    name: 'Dushana',
    pose: 'hold',
    expr: 'stern',
    look: {
      skin: '#4f5f80', hair: '#17121a', hairBack: 'wild', hairFront: 'cap', headgear: 'none', tilak: 'none',
      lower: 'dhoti', cloth: '#26402e', border: '#b8b0a0', necklace: 'beads', earrings: true, held: 'sword',
      mustache: '#17121a', armour: '#7c8494', fangs: true, horns: '#e8dcc0',
    },
  },
  trishira: {
    // the main head and body; drawTrishira in epic.ts adds the other two heads
    name: 'Trishira',
    pose: 'hold',
    expr: 'stern',
    look: {
      skin: '#6a7a3e', hair: '#17121a', hairBack: 'short', hairFront: 'cap', headgear: 'tiara', tilak: 'none',
      lower: 'dhoti', cloth: '#5a3a1a', border: GOLD, necklace: 'gold', held: 'trident', armour: '#8a7a5a', fangs: true,
    },
  },
  rakshasaA: {
    name: 'Rakshasa (purple)',
    pose: 'hold',
    expr: 'roar',
    look: {skin: '#6e4a78', hair: '#1c1420', hairBack: 'wild', hairFront: 'none', headgear: 'none', tilak: 'none', lower: 'short', cloth: '#3a2a2a', border: '#8a2a2a', held: 'sword', fangs: true, horns: '#e8dcc0'},
  },
  rakshasaB: {
    name: 'Rakshasa (olive)',
    pose: 'hold',
    expr: 'roar',
    look: {skin: '#5e6e42', hair: '#2a1a14', hairBack: 'wild', hairFront: 'none', headgear: 'none', tilak: 'none', lower: 'short', cloth: '#5a2a1a', border: '#2a1a14', held: 'mace', fangs: true},
  },
  rakshasaC: {
    name: 'Rakshasa (rust)',
    pose: 'hold',
    expr: 'roar',
    look: {skin: '#9a4e34', hair: '#17121a', hairBack: 'wild', hairFront: 'none', headgear: 'none', tilak: 'none', lower: 'short', cloth: '#2a3440', border: '#6a6a6a', held: 'trident', fangs: true, horns: '#d8c8a0', armour: '#5a5a62'},
  },
  // ----- Proposed for "Bhima and the old monkey" (18 November 2026): awaiting the owner's approval -----
  bhima: {
    name: 'Bhima',
    pose: 'hold',
    expr: 'stern',
    look: {
      skin: '#b8794c', hair: '#17121a', hairBack: 'short', hairFront: 'none', headgear: 'tiara', tilak: 'urdhva',
      lower: 'dhoti', cloth: '#8a2335', border: GOLD, sash: '#e8612f', necklace: 'gold', earrings: true, held: 'mace',
      mustache: '#17121a',
    },
  },
  draupadi: {
    name: 'Draupadi',
    pose: 'hold',
    expr: 'happy',
    look: {
      skin: '#b98258', hair: '#1c1a22', hairBack: 'long', hairFront: 'parted', headgear: 'none', tilak: 'bindi',
      lower: 'sari', cloth: '#2e6db4', border: GOLD, blouse: '#1f4f8a', sash: '#2e6db4', necklace: 'gold',
      earrings: true, held: 'lotus',
    },
  },
  oldHanuman: {
    // Hanuman disguised as a frail old monkey; the tail is built in 3D so Bhima can lift it
    name: 'Old monkey (Hanuman)',
    pose: 'stand',
    expr: 'calm',
    look: {
      skin: '#a39a8c', hair: '#a39a8c', hairBack: 'none', hairFront: 'none', headgear: 'none', tilak: 'none',
      lower: 'short', cloth: '#7a6248', border: '#4e3e2c', necklace: 'beads', monkey: true, noTail: true,
      muzzle: '#eee6d8', brows: '#f4f0e8',
    },
  },
  hanumanDivine: {
    // the cast Hanuman revealed, with a halo; drawn huge for the giant form
    name: 'Hanuman (revealed)',
    pose: 'bless',
    expr: 'happy',
    look: {
      skin: '#e8924a', hair: '#e8924a', hairBack: 'none', hairFront: 'none', headgear: 'tiara', tilak: 'sindoor',
      lower: 'short', cloth: '#d7263d', border: GOLD, necklace: 'gold', held: 'mace', monkey: true, halo: true,
    },
  },
  rishi: {
    name: 'Rishi',
    pose: 'bless',
    expr: 'calm',
    look: {
      skin: '#e2b184', hair: '#f1eee6', hairBack: 'short', hairFront: 'none', headgear: 'jata', tilak: 'tripundra',
      lower: 'robe', cloth: '#f08a24', border: '#c9621a', sash: '#f08a24', necklace: 'beads', held: 'pot',
      beard: '#f1eee6',
    },
  },
};
