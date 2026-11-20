// Painted surfaces and printed things for the Wojtek story, drawn in code (Bebas Neue lettering, as the channel uses).
import * as THREE from 'three';
import {rng, toTexture, INK} from '../shared/toon';
import {drawBear} from '../shared/bear';
export {canvasCloth, CORAL, crateTexture} from '../shared/print';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  return {c, g};
};
const cache = new Map<string, THREE.Texture>();
const cached = (key: string, make: () => HTMLCanvasElement, repeat?: [number, number]) => {
  let t = cache.get(key);
  if (!t) {
    t = toTexture(make(), repeat);
    cache.set(key, t);
  }
  return t;
};
const BEBAS = (px: number) => `400 ${px}px "Bebas Neue"`;
const BLUE_INK = '#24396e';

// Old paper with a little foxing.
const paper = (g: CanvasRenderingContext2D, w: number, h: number, seed: number) => {
  g.fillStyle = '#f3ead3';
  g.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(150,110,60,${0.03 + r() * 0.06})`;
    g.beginPath();
    g.ellipse(r() * w, r() * h, 10 + r() * 40, 6 + r() * 24, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
};

// Handwriting: Bebas leaned over, in blue ink, revealed left to right by `p` (0 to 1).
const hand = (g: CanvasRenderingContext2D, text: string, x: number, y: number, px: number, p = 1) => {
  if (p <= 0) return;
  g.save();
  g.font = BEBAS(px);
  const w = g.measureText(text).width;
  g.beginPath();
  g.rect(x - 10, y - px, (w + 30) * p, px * 1.6);
  g.clip();
  g.translate(x, y);
  g.transform(1, 0, -0.22, 1, 0, 0);
  g.fillStyle = BLUE_INK;
  g.textBaseline = 'alphabetic';
  g.fillText(text, 0, 0);
  g.restore();
};

// The enlistment form. name/rank/num: how much of each handwritten entry shows (0 to 1, quantised by the caller);
// strike: how far the line through PRIVATE has been drawn (0 to 1).
export const formTexture = (name: number, rank: number, num: number, strike: number) =>
  cached(`form|${name}|${rank}|${num}|${strike}`, () => {
    const {c, g} = canvas(768, 1024);
    paper(g, 768, 1024, 7);
    g.fillStyle = INK;
    g.textAlign = 'center';
    g.font = BEBAS(64);
    g.fillText('POLISH II CORPS', 384, 110);
    g.font = BEBAS(44);
    g.fillStyle = '#5a5040';
    g.fillText('ENLISTMENT RECORD', 384, 168);
    g.fillRect(80, 200, 608, 6);
    g.textAlign = 'left';
    const rows: [string, number][] = [['NAME', 330], ['RANK', 500], ['NO.', 670], ['UNIT', 840]];
    for (const [label, y] of rows) {
      g.fillStyle = '#5a5040';
      g.font = BEBAS(56);
      g.fillText(label, 80, y);
      g.fillStyle = 'rgba(60,50,40,0.5)';
      g.fillRect(250, y + 14, 440, 4);
    }
    hand(g, 'WOJTEK', 262, 326, 108, name);
    hand(g, 'PRIVATE', 262, 496, 108, rank);
    hand(g, '253', 262, 666, 108, num);
    hand(g, '22 ART. SUPPLY COY', 262, 832, 64, 1);
    if (strike > 0) {
      // a firm double stroke through PRIVATE
      g.strokeStyle = '#1b2850';
      g.lineWidth = 12;
      g.beginPath();
      g.moveTo(250, 466);
      g.lineTo(250 + 400 * strike, 452);
      g.stroke();
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(256, 484);
      g.lineTo(256 + 394 * strike, 474);
      g.stroke();
    }
    return c;
  });

// The paybook: a brown card cover with the number stencilled on.
export const paybookTexture = () =>
  cached('paybook', () => {
    const {c, g} = canvas(512, 704);
    g.fillStyle = '#8a6a44';
    g.fillRect(0, 0, 512, 704);
    const r = rng(3);
    for (let i = 0; i < 200; i++) {
      g.fillStyle = `rgba(40,25,10,${r() * 0.12})`;
      g.fillRect(r() * 512, r() * 704, 2 + r() * 6, 2 + r() * 6);
    }
    g.strokeStyle = '#3e2a16';
    g.lineWidth = 10;
    g.strokeRect(30, 30, 452, 644);
    g.fillStyle = '#2a1c10';
    g.textAlign = 'center';
    g.font = BEBAS(92);
    g.fillText('SOLDIER\'S', 256, 190);
    g.fillText('PAY BOOK', 256, 290);
    g.font = BEBAS(150);
    g.fillStyle = '#f3ead3';
    g.fillText('253', 256, 520);
    return c;
  });

// "NO PETS" board at the foot of the gangway.
export const noPetsTexture = () =>
  cached('nopets', () => {
    const {c, g} = canvas(768, 512);
    g.fillStyle = '#f4efe4';
    g.fillRect(0, 0, 768, 512);
    g.strokeStyle = '#b8322a';
    g.lineWidth = 26;
    g.strokeRect(20, 20, 728, 472);
    g.textAlign = 'center';
    g.fillStyle = '#b8322a';
    g.font = BEBAS(230);
    g.fillText('NO PETS', 384, 270);
    g.fillStyle = INK;
    g.font = BEBAS(92);
    g.fillText('ALLOWED ON BOARD', 384, 410);
    return c;
  });

// The company badge: a round patch with a bear carrying a shell (the channel's own drawing of the idea).
export const badgeTexture = () =>
  cached('badge', () => {
    const {c, g} = canvas(768, 768);
    g.fillStyle = '#efe4c8';
    g.beginPath();
    g.arc(384, 384, 360, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 26;
    g.strokeStyle = '#2b2a22';
    g.stroke();
    g.lineWidth = 8;
    g.beginPath();
    g.arc(384, 384, 318, 0, Math.PI * 2);
    g.stroke();
    // the bear
    const b = drawBear('stand', 'proud');
    g.drawImage(b, 384 - 230, 110, 460, 614);
    // a shell held across the chest
    g.save();
    g.translate(384, 450);
    g.rotate(-0.5);
    g.fillStyle = '#d6a843';
    g.beginPath();
    g.roundRect(-150, -38, 220, 76, 10);
    g.fill();
    g.lineWidth = 12;
    g.strokeStyle = INK;
    g.stroke();
    g.fillStyle = '#7d8a6a';
    g.beginPath();
    g.moveTo(70, -38);
    g.quadraticCurveTo(200, -30, 230, 0);
    g.quadraticCurveTo(200, 30, 70, 38);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = '#b8862e';
    g.fillRect(-150, -38, 26, 76);
    g.restore();
    // paws over the shell
    for (const [x, y] of [[300, 520], [470, 410]]) {
      g.fillStyle = '#7c5130';
      g.beginPath();
      g.arc(x, y, 34, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 10;
      g.strokeStyle = INK;
      g.stroke();
    }
    return c;
  });

// The troopship's side: grey plates, a row of portholes, a white band, a black waterline.
export const hullTexture = () =>
  cached('hull', () => {
    const {c, g} = canvas(1024, 512);
    const r = rng(11);
    g.fillStyle = '#6c757c';
    g.fillRect(0, 0, 1024, 512);
    g.strokeStyle = 'rgba(0,0,0,0.25)';
    g.lineWidth = 3;
    for (let x = 0; x < 1024; x += 128) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 512);
      g.stroke();
    }
    g.fillStyle = '#e9e6dc';
    g.fillRect(0, 0, 1024, 46);
    for (let x = 40; x < 1024; x += 64) {
      g.fillStyle = '#2a3036';
      g.beginPath();
      g.arc(x, 120, 14, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#c8c4b8';
      g.lineWidth = 5;
      g.stroke();
    }
    for (let i = 0; i < 30; i++) {
      g.fillStyle = `rgba(140,80,40,${0.15 + r() * 0.25})`;
      g.fillRect(r() * 1024, 140 + r() * 200, 3 + r() * 5, 30 + r() * 90);
    }
    g.fillStyle = '#2a2a2c';
    g.fillRect(0, 400, 1024, 112);
    return c;
  }, [3, 1]);

// Stone paving for the quay.
export const pavingTexture = () =>
  cached('paving', () => {
    const {c, g} = canvas(512, 512);
    const r = rng(5);
    g.fillStyle = '#c9b892';
    g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 64)
      for (let x = (y / 64) % 2 ? -64 : 0; x < 512; x += 128) {
        const v = 180 + r() * 30;
        g.fillStyle = `rgb(${v},${v - 14},${v - 40})`;
        g.fillRect(x + 3, y + 3, 122, 58);
      }
    return c;
  }, [10, 10]);

