// Figures for the Indian mythology theme that do not fit the standing 512 x 1024 costume figure:
// Ravana with ten heads, Jatayu the old vulture king, and the donkeys that pull Ravana's chariot.
// Same flat inked look as mythic.ts. Each drawing has its own canvas size; pass `aspect` (width / height)
// to Flat so the plane matches. All are original drawings made in code.
import {INK} from './toon';
import {CAST, drawMythic, MythicExpr, MythicPose} from './mythic';

const GOLD = '#f4b93a';
const GOLD_DARK = '#c8891a';
const SHADE = 'rgba(30,14,70,0.17)';

type G = CanvasRenderingContext2D;

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  return {c, g};
};

const stroke = (g: G, w: number, color = INK) => {
  g.strokeStyle = color;
  g.lineWidth = w;
  g.stroke();
};

const inked = (g: G, fill: string, lw = 12, shadeFrom = 1e9) => {
  g.fillStyle = fill;
  g.fill();
  if (shadeFrom < 1e8) {
    g.save();
    g.clip();
    g.fillStyle = SHADE;
    g.fillRect(shadeFrom, 0, 4000, 4000);
    g.restore();
  }
  stroke(g, lw);
};

const dot = (g: G, x: number, y: number, r: number, fill = INK, outline = 0) => {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  if (outline) stroke(g, outline);
};

const line = (g: G, pts: number[][], w: number, color: string, ink = true) => {
  const path = () => {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    if (pts.length === 3) g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
    else for (const p of pts.slice(1)) g.lineTo(p[0], p[1]);
  };
  if (ink) {
    path();
    stroke(g, w + 10);
  }
  path();
  stroke(g, w, color);
};

// ---------------------------------------------------------------------------------------------
// Ravana: the costume figure (CAST.ravana) with nine more heads fanned out behind the main one.
// Canvas 1280 x 1200 (aspect 16 / 15); feet at the bottom centre like every standing figure.
export const RAVANA_ASPECT = 1280 / 1200;

// held: what the main figure carries ('sword' by default, 'bow', or 'none').
export const drawRavana = (pose: MythicPose = 'hold', expr: MythicExpr = 'stern', held: 'sword' | 'bow' | 'none' = 'sword'): HTMLCanvasElement => {
  const {c, g} = canvas(1280, 1200);
  const body = drawMythic({...CAST.ravana.look, held: held === 'none' ? undefined : held}, pose, expr);
  const ox = 384;
  const oy = 176;
  const hx = ox + 256;
  const hy = oy + 300;

  // one extra head, cut from the main drawing (crown, face, moustache, earrings), darkened a little for depth
  const head = document.createElement('canvas');
  head.width = 360;
  head.height = 470;
  const hg = head.getContext('2d')!;
  // cut from an empty-handed drawing, so no sword or bow shows up in the extra heads
  const bare = drawMythic({...CAST.ravana.look, held: undefined}, 'stand', expr);
  hg.drawImage(bare, 76, 0, 360, 470, 0, 0, 360, 470);
  // keep only the head: clear the neck and shoulders under the chin
  hg.globalCompositeOperation = 'destination-out';
  hg.beginPath();
  hg.rect(0, 438, 360, 40);
  hg.ellipse(180, 470, 140, 30, 0, 0, Math.PI * 2);
  hg.fill();
  hg.globalCompositeOperation = 'source-atop';
  hg.fillStyle = 'rgba(40,10,40,0.16)';
  hg.fillRect(0, 0, 360, 470);

  const R = 300;
  const k = 0.52;
  const order = [-4, 4, -3, 3, -2, 2, -1, 1, 0]; // outer heads first, so the inner ones overlap them
  for (const i of order) {
    const a = (i * 20 * Math.PI) / 180;
    const x = hx + Math.sin(a) * R * 1.12;
    const y = hy - Math.cos(a) * R + 40;
    const w = 360 * k;
    const h = 470 * k;
    g.drawImage(head, x - w / 2, y - h * 0.64, w, h);
  }
  g.drawImage(body, ox, oy);
  return c;
};

// ---------------------------------------------------------------------------------------------
// Jatayu: an old vulture king. Bare pinkish head with white wisps and bushy white brows, a small gold
// crown, a white ruff, brown body and wings, a big hooked yellow beak.
// Canvas 1024 x 1024 (aspect 1); feet at the bottom centre.
export type JatayuPose = 'perch' | 'fly' | 'attack' | 'wounded';
export type JatayuExpr = 'calm' | 'stern' | 'weak';
export const JATAYU_ASPECT = 1;

const J = {
  body: '#8a735c',
  wing: '#5e4a3a',
  wingLight: '#7d6650',
  tip: '#3b2e26',
  belly: '#d8c8ae',
  ruff: '#f1ece2',
  skin: '#e6b39b',
  beak: '#f2c14e',
  leg: '#e3a944',
};

const feathersRow = (g: G, x0: number, x1: number, y: number, r: number, fill: string) => {
  for (let x = x0; x <= x1; x += r * 1.5) {
    g.beginPath();
    g.ellipse(x, y, r, r * 1.4, 0, 0, Math.PI * 2);
    inked(g, fill, 7);
  }
};

// A wing, drawn for the right side (s = 1) or mirrored (s = -1). open: spread out; cut: short ragged stump.
const wing = (g: G, s: number, mode: 'folded' | 'open' | 'cut') => {
  g.save();
  g.translate(512, 0);
  g.scale(s, 1);
  if (mode === 'open') {
    // primaries: long finger feathers fanning out from the wing's end
    const fingers = [[480, 150], [496, 236], [492, 320], [470, 398], [432, 462], [384, 510]];
    for (const [fx, fy] of fingers) {
      g.beginPath();
      g.moveTo(240, 360);
      g.quadraticCurveTo((240 + fx) / 2 + 20, (360 + fy) / 2 - 30, fx, fy);
      g.lineTo(fx - 26, fy + 30);
      g.quadraticCurveTo((240 + fx) / 2 - 10, (360 + fy) / 2 + 20, 220, 420);
      g.closePath();
      inked(g, J.tip, 8);
    }
    // the wing itself
    g.beginPath();
    g.moveTo(80, 470);
    g.quadraticCurveTo(170, 260, 400, 190);
    g.quadraticCurveTo(430, 300, 360, 470);
    g.quadraticCurveTo(250, 560, 110, 600);
    g.closePath();
    inked(g, J.wing, 12);
    // coverts: a lighter band of scalloped feathers along the leading edge
    g.save();
    g.beginPath();
    g.moveTo(80, 470);
    g.quadraticCurveTo(170, 260, 400, 190);
    g.quadraticCurveTo(410, 250, 380, 300);
    g.quadraticCurveTo(230, 330, 110, 520);
    g.closePath();
    g.fillStyle = J.wingLight;
    g.fill();
    g.clip();
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      g.beginPath();
      g.arc(110 + t * 270, 470 - t * 200, 26, 0, Math.PI);
      stroke(g, 5, 'rgba(23,18,26,0.4)');
    }
    g.restore();
  } else {
    const len = mode === 'cut' ? 170 : 420;
    g.beginPath();
    g.moveTo(110, 470);
    g.quadraticCurveTo(230, 470, 230, 600);
    if (mode === 'cut') {
      // ragged end
      g.lineTo(230, 470 + len);
      g.lineTo(200, 470 + len - 30);
      g.lineTo(180, 470 + len + 10);
      g.lineTo(150, 470 + len - 24);
      g.lineTo(122, 470 + len + 4);
      g.lineTo(104, 470 + len - 40);
    } else {
      g.quadraticCurveTo(232, 760, 196, 470 + len);
      g.lineTo(170, 470 + len - 36);
      g.lineTo(150, 470 + len - 4);
      g.lineTo(128, 470 + len - 50);
      g.quadraticCurveTo(90, 700, 96, 560);
    }
    g.closePath();
    inked(g, J.wing, 12);
    g.save();
    g.clip();
    for (let y = 520; y < 470 + len; y += 40) {
      g.beginPath();
      g.arc(160, y, 40, 0.15 * Math.PI, 0.85 * Math.PI);
      stroke(g, 5, 'rgba(23,18,26,0.4)');
    }
    g.restore();
  }
  g.restore();
};

const talons = (g: G, x: number, y: number, open: boolean) => {
  const toes = open ? [[-48, 30], [0, 52], [48, 30]] : [[-34, 14], [0, 20], [34, 14]];
  for (const [dx, dy] of toes) {
    line(g, [[x, y], [x + dx, y + dy]], 12, J.leg);
    g.beginPath();
    g.moveTo(x + dx - 6, y + dy);
    g.quadraticCurveTo(x + dx * 1.25, y + dy + 22, x + dx * 1.1 + (dx < 0 ? -10 : 10), y + dy + 30);
    stroke(g, 9);
  }
};

export const drawJatayu = (pose: JatayuPose = 'perch', expr: JatayuExpr = 'calm'): HTMLCanvasElement => {
  const {c, g} = canvas(1024, 1024);
  const hx = 512;
  const hy = pose === 'fly' || pose === 'attack' ? 250 : 300;
  const lift = hy - 300; // flying poses sit a little higher in the frame

  // tail fan behind the body
  for (let i = -3; i <= 3; i++) {
    g.save();
    g.translate(512, 760 + lift);
    g.rotate(i * 0.16);
    g.beginPath();
    g.roundRect(-26, 0, 52, pose === 'wounded' ? 170 : 210, 24);
    inked(g, i % 2 ? J.wing : J.tip, 8);
    g.restore();
  }

  // wings
  const wmode = pose === 'wounded' ? 'cut' : pose === 'perch' ? 'folded' : 'open';
  g.save();
  g.translate(0, lift);
  wing(g, -1, wmode);
  wing(g, 1, wmode);
  g.restore();

  // legs and feet
  if (pose === 'attack') {
    line(g, [[450, 820 + lift], [400, 900], [380, 960]], 16, J.leg);
    line(g, [[574, 820 + lift], [624, 900], [644, 960]], 16, J.leg);
    talons(g, 380, 960, true);
    talons(g, 644, 960, true);
  } else if (pose === 'fly') {
    line(g, [[460, 820 + lift], [452, 880]], 16, J.leg);
    line(g, [[564, 820 + lift], [572, 880]], 16, J.leg);
    talons(g, 452, 880, false);
    talons(g, 572, 880, false);
  } else {
    line(g, [[452, 840], [440, 960]], 16, J.leg);
    line(g, [[572, 840], [584, 960]], 16, J.leg);
    talons(g, 440, 962, false);
    talons(g, 584, 962, false);
  }

  // body and belly
  g.beginPath();
  g.ellipse(512, 640 + lift, 168, 232, 0, 0, Math.PI * 2);
  inked(g, J.body, 12, 560);
  g.save();
  g.beginPath();
  g.ellipse(512, 690 + lift, 106, 168, 0, 0, Math.PI * 2);
  g.fillStyle = J.belly;
  g.fill();
  g.clip();
  g.strokeStyle = 'rgba(94,74,58,0.55)';
  g.lineWidth = 6;
  for (let y = 580 + lift; y < 860 + lift; y += 34)
    for (let x = 430 + ((y / 34) % 2) * 17; x < 600; x += 34) {
      g.beginPath();
      g.moveTo(x - 10, y);
      g.lineTo(x, y + 10);
      g.lineTo(x + 10, y);
      g.stroke();
    }
  g.restore();

  // white ruff around the neck
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    dot(g, hx + Math.cos(a) * 150, hy + 150 + Math.sin(a) * 58, 44, J.ruff, 8);
  }
  g.beginPath();
  g.ellipse(hx, hy + 150, 150, 58, 0, 0, Math.PI * 2);
  g.fillStyle = J.ruff;
  g.fill();

  // loose feathers drifting off a wounded bird
  if (pose === 'wounded') {
    for (const [x, y, a] of [[226, 560, 0.6], [810, 520, -0.4], [300, 300, 1.2], [760, 760, -1]]) {
      g.save();
      g.translate(x, y);
      g.rotate(a);
      g.beginPath();
      g.ellipse(0, 0, 14, 44, 0, 0, Math.PI * 2);
      inked(g, J.wing, 6);
      line(g, [[0, -40], [0, 44]], 3, 'rgba(255,255,255,0.5)', false);
      g.restore();
    }
  }

  // head: bare, pinkish, with white wisps on top
  g.save();
  g.beginPath();
  g.ellipse(hx, hy, 140, 128, 0, 0, Math.PI * 2);
  g.fillStyle = J.skin;
  g.fill();
  g.clip();
  g.fillStyle = SHADE;
  g.beginPath();
  g.ellipse(hx + 70, hy + 60, 140, 122, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)';
  g.beginPath();
  g.ellipse(hx - 58, hy - 56, 50, 16, -0.35, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.beginPath();
  g.ellipse(hx, hy, 140, 128, 0, 0, Math.PI * 2);
  stroke(g, 12);
  for (const [dx, a] of [[-60, -0.5], [-20, -0.15], [24, 0.2], [64, 0.55]]) {
    g.save();
    g.translate(hx + dx, hy - 118);
    g.rotate(a);
    g.beginPath();
    g.moveTo(0, 10);
    g.quadraticCurveTo(-18, -30, 6, -56);
    g.quadraticCurveTo(14, -24, 14, 10);
    g.closePath();
    inked(g, J.ruff, 7);
    g.restore();
  }

  // small gold crown: king of the vultures
  g.beginPath();
  g.moveTo(hx - 62, hy - 108);
  g.lineTo(hx - 62, hy - 156);
  g.lineTo(hx - 30, hy - 128);
  g.lineTo(hx, hy - 176);
  g.lineTo(hx + 30, hy - 128);
  g.lineTo(hx + 62, hy - 156);
  g.lineTo(hx + 62, hy - 108);
  g.closePath();
  inked(g, GOLD, 9);
  dot(g, hx, hy - 136, 9, '#d7263d', 5);

  // eyes and brows
  const ey = hy - 14;
  const ex = 56;
  if (expr === 'weak') {
    for (const s of [-1, 1]) {
      g.beginPath();
      g.arc(hx + s * ex, ey + 4, 18, 0.1 * Math.PI, 0.9 * Math.PI);
      stroke(g, 10);
    }
  } else {
    for (const s of [-1, 1]) {
      dot(g, hx + s * ex, ey, 24, '#fff7dd', 8);
      dot(g, hx + s * ex, ey + 3, 11);
    }
  }
  const brow = () => {
    g.beginPath();
    const t = expr === 'stern' ? 22 : expr === 'weak' ? -14 : 0;
    g.moveTo(hx - ex - 40, ey - 40 - (expr === 'weak' ? 0 : 0));
    g.quadraticCurveTo(hx - ex, ey - 66, hx - ex + 34, ey - 44 + t);
    g.moveTo(hx + ex - 34, ey - 44 + t);
    g.quadraticCurveTo(hx + ex, ey - 66, hx + ex + 40, ey - 40);
  };
  brow();
  stroke(g, 28);
  brow();
  stroke(g, 16, '#f6f2e8');

  // hooked beak, pointing down at the viewer
  g.beginPath();
  g.moveTo(hx - 44, ey + 30);
  g.quadraticCurveTo(hx, ey + 12, hx + 44, ey + 30);
  g.quadraticCurveTo(hx + 52, ey + 96, hx + 18, ey + 150);
  g.quadraticCurveTo(hx, ey + 176, hx - 10, ey + 150);
  g.quadraticCurveTo(hx - 50, ey + 100, hx - 44, ey + 30);
  g.closePath();
  inked(g, J.beak, 10, hx + 6);
  g.save();
  g.clip();
  g.fillStyle = '#3a2f2a';
  g.beginPath();
  g.ellipse(hx + 6, ey + 160, 30, 28, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.beginPath();
  g.moveTo(hx - 44, ey + 30);
  g.quadraticCurveTo(hx - 50, ey + 100, hx - 10, ey + 150);
  g.quadraticCurveTo(hx, ey + 176, hx + 18, ey + 150);
  g.quadraticCurveTo(hx + 52, ey + 96, hx + 44, ey + 30);
  stroke(g, 10);
  dot(g, hx - 16, ey + 48, 5);
  dot(g, hx + 16, ey + 48, 5);
  if (expr === 'stern') {
    // open beak: a dark gap and a short lower bill
    g.beginPath();
    g.ellipse(hx, ey + 118, 20, 10, 0, 0, Math.PI * 2);
    g.fillStyle = INK;
    g.fill();
  }
  return c;
};

// ---------------------------------------------------------------------------------------------
// A donkey from Ravana's chariot team, seen from the side and facing right: dark grey, glowing red eyes,
// two small horns and a gold harness (the text calls them donkeys with the faces of goblins).
// Canvas 1024 x 768 (aspect 4 / 3). step 0 and 1 are two gallop frames.
export const DONKEY_ASPECT = 1024 / 768;

export const drawDonkey = (step: 0 | 1 = 0): HTMLCanvasElement => {
  const {c, g} = canvas(1024, 768);
  const coat = '#5b5662';
  const coatDark = '#433f4a';
  const pale = '#b9b2bd';
  const legs = step === 0
    ? [[300, [230, 640], [190, 720]], [380, [400, 650], [470, 720]], [610, [560, 650], [520, 720]], [690, [760, 640], [820, 700]]]
    : [[300, [280, 650], [300, 730]], [380, [340, 640], [300, 718]], [610, [650, 650], [690, 730]], [690, [700, 640], [660, 720]]];
  const leg = (x: number, k: number[], f: number[], back: boolean) => {
    line(g, [[x, 520], k, f], 26, back ? coatDark : coat);
    g.beginPath();
    g.roundRect(f[0] - 22, f[1] - 8, 44, 26, 8);
    inked(g, INK, 4);
  };
  leg(legs[1][0] as number, legs[1][1] as number[], legs[1][2] as number[], true);
  leg(legs[3][0] as number, legs[3][1] as number[], legs[3][2] as number[], true);

  // tail with a tuft
  line(g, [[250, 440], [180, 470], [170, 560]], 12, coat);
  g.beginPath();
  g.ellipse(168, 580, 24, 40, 0.2, 0, Math.PI * 2);
  inked(g, INK, 4);

  // body
  g.beginPath();
  g.ellipse(490, 470, 260, 130, 0, 0, Math.PI * 2);
  inked(g, coat, 12);
  g.save();
  g.clip();
  g.fillStyle = pale;
  g.beginPath();
  g.ellipse(490, 600, 240, 70, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.beginPath();
  g.ellipse(490, 470, 260, 130, 0, 0, Math.PI * 2);
  stroke(g, 12);
  // saddle cloth and harness
  g.beginPath();
  g.roundRect(390, 350, 180, 150, 30);
  inked(g, '#7a1f3d', 10);
  g.fillStyle = GOLD;
  g.fillRect(396, 470, 168, 22);
  line(g, [[570, 420], [720, 330]], 12, GOLD_DARK);
  line(g, [[430, 360], [460, 590]], 12, GOLD);
  dot(g, 446, 470, 13, '#d7263d', 5);

  leg(legs[0][0] as number, legs[0][1] as number[], legs[0][2] as number[], false);
  leg(legs[2][0] as number, legs[2][1] as number[], legs[2][2] as number[], false);

  // neck and head
  g.beginPath();
  g.moveTo(640, 400);
  g.quadraticCurveTo(700, 260, 780, 230);
  g.lineTo(840, 300);
  g.quadraticCurveTo(760, 380, 740, 500);
  g.closePath();
  inked(g, coat, 12);
  // mane
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.ellipse(668 + i * 24, 360 - i * 30, 16, 26, -0.6, 0, Math.PI * 2);
    inked(g, INK, 4);
  }
  // ears
  for (const [x, a] of [[770, -0.5], [806, -0.2]]) {
    g.save();
    g.translate(x, 230);
    g.rotate(a);
    g.beginPath();
    g.ellipse(0, -70, 24, 74, 0, 0, Math.PI * 2);
    inked(g, coat, 10);
    g.beginPath();
    g.ellipse(0, -66, 10, 50, 0, 0, Math.PI * 2);
    g.fillStyle = '#c98a95';
    g.fill();
    g.restore();
  }
  // small horns
  for (const x of [748, 790]) {
    g.beginPath();
    g.moveTo(x - 10, 214);
    g.quadraticCurveTo(x - 4, 170, x + 16, 152);
    g.quadraticCurveTo(x + 8, 184, x + 12, 214);
    g.closePath();
    inked(g, '#e8dcc0', 7);
  }
  // head
  g.beginPath();
  g.ellipse(840, 270, 92, 70, 0.5, 0, Math.PI * 2);
  inked(g, coat, 12);
  g.beginPath();
  g.ellipse(900, 330, 62, 52, 0.5, 0, Math.PI * 2);
  inked(g, pale, 10);
  dot(g, 916, 318, 7);
  // fangs
  for (const x of [884, 912]) {
    g.beginPath();
    g.moveTo(x - 7, 372);
    g.lineTo(x + 7, 370);
    g.lineTo(x + 2, 394);
    g.closePath();
    inked(g, '#fff7e6', 4);
  }
  // glowing red eye under a heavy brow
  dot(g, 836, 244, 26, 'rgba(255,60,40,0.35)');
  dot(g, 836, 244, 14, '#ff3b2f', 6);
  dot(g, 840, 240, 4, '#fff1b0');
  line(g, [[804, 214], [862, 230]], 10, coatDark);
  // bridle
  line(g, [[790, 230], [880, 360]], 9, GOLD);
  line(g, [[846, 200], [800, 330]], 9, GOLD);
  dot(g, 812, 300, 10, GOLD, 5);
  return c;
};

// Jatayu fallen on his side, wings cut: the wounded drawing laid down in a 2048 x 1024 canvas (aspect 2), body on the
// bottom edge, head to the left. Same scale as drawJatayu when drawn at the same height.
export const JATAYU_LYING_ASPECT = 2;
export const drawJatayuLying = (expr: JatayuExpr = 'weak'): HTMLCanvasElement => {
  const {c, g} = canvas(2048, 1024);
  const bird = drawJatayu('wounded', expr);
  g.translate(1024, 784);
  g.rotate(-1.35);
  g.drawImage(bird, -512, -512);
  return c;
};

// ---------------------------------------------------------------------------------------------
// Trishira, Khara's general with three heads: the costume figure (CAST.trishira) with a head on each side.
// Canvas 1024 x 1100 (aspect 1024 / 1100); feet at the bottom centre.
export const TRISHIRA_ASPECT = 1024 / 1100;
export const drawTrishira = (pose: MythicPose = 'hold', expr: MythicExpr = 'stern'): HTMLCanvasElement => {
  const {c, g} = canvas(1024, 1100);
  const body = drawMythic(CAST.trishira.look, pose, expr);
  const ox = 256;
  const oy = 76;
  const head = document.createElement('canvas');
  head.width = 360;
  head.height = 470;
  const hg = head.getContext('2d')!;
  const bare = drawMythic({...CAST.trishira.look, held: undefined}, 'stand', expr);
  hg.drawImage(bare, 76, 0, 360, 470, 0, 0, 360, 470);
  hg.globalCompositeOperation = 'destination-out';
  hg.beginPath();
  hg.rect(0, 438, 360, 40);
  hg.ellipse(180, 470, 140, 30, 0, 0, Math.PI * 2);
  hg.fill();
  hg.globalCompositeOperation = 'source-atop';
  hg.fillStyle = 'rgba(40,10,40,0.14)';
  hg.fillRect(0, 0, 360, 470);
  const k = 0.82;
  for (const sgn of [-1, 1]) {
    const x = ox + 256 + sgn * 232;
    const y = oy + 300 + 40;
    g.drawImage(head, x - (360 * k) / 2, y - 470 * k * 0.64, 360 * k, 470 * k);
  }
  g.drawImage(body, ox, oy);
  return c;
};

// ---------------------------------------------------------------------------------------------
// A standing costume figure laid on its side, for fallen warriors. Canvas 1024 x 512 (aspect 2):
// the figure lies along the bottom, head to the left (flip the plane for head to the right).
export const FALLEN_ASPECT = 2;
export const drawFallen = (draw: () => HTMLCanvasElement): HTMLCanvasElement => {
  const {c, g} = canvas(1024, 512);
  const fig = draw();
  g.save();
  // rotated a quarter turn: the figure's left edge goes to the bottom; shifted down so the head and body touch it
  g.translate(1024 - 10, 560);
  g.rotate(-Math.PI / 2);
  g.drawImage(fig, 0, -1024 + 10, 512, 1024);
  g.restore();
  return c;
};

// ---------------------------------------------------------------------------------------------
// Hanuman as the frail old monkey lying across the path (Bhima's story). Canvas 1024 x 512 (aspect 2):
// head upright at the left so the face reads, body stretched out to the right along the bottom.
// The tail is left out by default: the video builds it in 3D so Bhima can try to lift it.
export const OLD_MONKEY_ASPECT = 2;
export const drawOldMonkeyLying = (expr: MythicExpr = 'calm', withTail = false): HTMLCanvasElement => {
  const {c, g} = canvas(1024, 512);
  const look = CAST.oldHanuman.look;
  const fig = drawMythic(look, 'stand', expr);
  // legs stretched out, then the body, the dhoti and an arm resting along the side
  for (const pts of [[[730, 400], [860, 410], [970, 430]], [[730, 456], [870, 474], [984, 486]]]) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
    stroke(g, 14);
    g.beginPath();
    g.moveTo(pts[2][0], pts[2][1]);
    g.lineTo(pts[2][0] + 8, pts[2][1] - 34);
    stroke(g, 14);
  }
  g.beginPath();
  g.roundRect(280, 330, 380, 150, 70);
  inked(g, look.skin, 12, 1e9);
  g.beginPath();
  g.roundRect(310, 420, 300, 40, 20);
  g.fillStyle = look.muzzle!;
  g.fill();
  g.beginPath();
  g.roundRect(600, 336, 160, 140, 40);
  inked(g, look.cloth, 12, 1e9);
  g.fillStyle = look.border;
  g.fillRect(606, 446, 148, 16);
  g.beginPath();
  g.moveTo(380, 372);
  g.quadraticCurveTo(480, 440, 580, 420);
  stroke(g, 12);
  g.beginPath();
  g.arc(580, 420, 16, 0, Math.PI * 2);
  g.fillStyle = INK;
  g.fill();
  if (withTail) {
    // for the cast sheet only: the long tail trailing out across the path
    g.beginPath();
    g.moveTo(720, 470);
    g.bezierCurveTo(800, 510, 900, 500, 1010, 498);
    stroke(g, 30);
    stroke(g, 18, look.skin);
  }
  // the head from the standing figure (cropped above the shoulders), upright at the left end of the body
  g.drawImage(fig, 60, 110, 392, 330, 20, 150, 353, 297);
  return c;
};
