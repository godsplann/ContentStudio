// Canvas textures for "You are glowing right now": windows, screens, the clock and chart, cell walls, the leaf.
import * as THREE from 'three';
import {FONT, INK, rng, toTexture} from '../shared/toon';
import {boardTexture} from '../shared/people';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return {c, g: c.getContext('2d')!};
};

const memo = new Map<string, THREE.Texture>();
const once = (key: string, make: () => THREE.Texture) => {
  let t = memo.get(key);
  if (!t) {
    t = make();
    memo.set(key, t);
  }
  return t;
};

// A night city through a window: deep blue sky, moon, lit windows.
export const nightWindow = () =>
  once('nightWindow', () => {
    const {c, g} = canvas(512, 640);
    const grd = g.createLinearGradient(0, 0, 0, 640);
    grd.addColorStop(0, '#0b1433');
    grd.addColorStop(0.7, '#1d2c5e');
    grd.addColorStop(1, '#3a3f78');
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 640);
    const r = rng(4);
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`;
      g.fillRect(r() * 512, r() * 300, 2, 2);
    }
    g.fillStyle = '#f6f1d8';
    g.beginPath();
    g.arc(370, 140, 46, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#1d2c5e';
    g.beginPath();
    g.arc(392, 126, 40, 0, Math.PI * 2);
    g.fill();
    for (let b = 0; b < 9; b++) {
      const x = b * 60 - 10;
      const h = 160 + r() * 220;
      g.fillStyle = b % 2 ? '#141a38' : '#1a2146';
      g.fillRect(x, 640 - h, 58, h);
      for (let wy = 640 - h + 14; wy < 630; wy += 26)
        for (let wx = x + 8; wx < x + 50; wx += 16) if (r() > 0.6) {
          g.fillStyle = r() > 0.5 ? '#ffd27a' : '#ffe9b0';
          g.fillRect(wx, wy, 8, 12);
        }
    }
    g.strokeStyle = '#d8d2c4';
    g.lineWidth = 24;
    g.strokeRect(0, 0, 512, 640);
    g.beginPath();
    g.moveTo(256, 0);
    g.lineTo(256, 640);
    g.moveTo(0, 300);
    g.lineTo(512, 300);
    g.stroke();
    return toTexture(c);
  });

// A sky dome gradient (top to bottom stops).
export const skyGrad = (key: string, stops: [number, string][]) =>
  once('sky|' + key, () => {
    const {c, g} = canvas(32, 512);
    const grd = g.createLinearGradient(0, 0, 0, 512);
    for (const [o, col] of stops) grd.addColorStop(o, col);
    g.fillStyle = grd;
    g.fillRect(0, 0, 32, 512);
    return toTexture(c);
  });

// The photon camera's pictures: five dim figures, faces and necks glowing in false colour.
export const photonImage = () =>
  once('photonImage', () => {
    const {c, g} = canvas(1024, 640);
    g.fillStyle = '#04050c';
    g.fillRect(0, 0, 1024, 640);
    for (let i = 0; i < 5; i++) {
      const x = 112 + i * 200;
      // faint body outline
      g.fillStyle = 'rgba(40,60,140,0.55)';
      g.beginPath();
      g.ellipse(x, 230, 62, 70, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.roundRect(x - 58, 300, 116, 230, 50);
      g.fill();
      const hot = (cx: number, cy: number, r: number, a: number) => {
        const grd = g.createRadialGradient(cx, cy, 0, cx, cy, r);
        grd.addColorStop(0, `rgba(255,250,200,${a})`);
        grd.addColorStop(0.35, `rgba(255,190,40,${a * 0.9})`);
        grd.addColorStop(0.7, `rgba(230,60,30,${a * 0.6})`);
        grd.addColorStop(1, 'rgba(120,0,60,0)');
        g.fillStyle = grd;
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.fill();
      };
      hot(x - 30, 248, 40, 0.9);
      hot(x + 30, 248, 40, 0.9);
      hot(x, 186, 46, 0.8);
      hot(x, 300, 34, 0.7);
      hot(x, 420, 70, 0.25);
    }
    // colour scale
    const sc = g.createLinearGradient(80, 0, 944, 0);
    sc.addColorStop(0, '#2a1060');
    sc.addColorStop(0.35, '#e63c1e');
    sc.addColorStop(0.7, '#ffbe28');
    sc.addColorStop(1, '#fffbe0');
    g.fillStyle = sc;
    g.fillRect(80, 584, 864, 18);
    g.fillStyle = '#c9d4ff';
    g.font = `700 30px "${FONT}"`;
    g.textAlign = 'left';
    g.fillText('PHOTONS', 80, 570);
    g.textAlign = 'right';
    g.fillText('20 MIN EXPOSURE', 944, 570);
    return toTexture(c);
  });

// The light-through-the-day chart: low at 10 am, high at 4 pm. Revealed left to right by a cover.
export const chartTex = () =>
  once('chart', () => {
    const {c, g} = canvas(1024, 768);
    g.fillStyle = '#f7f2e6';
    g.beginPath();
    g.roundRect(0, 0, 1024, 768, 36);
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 20;
    g.beginPath();
    g.roundRect(10, 10, 1004, 748, 30);
    g.stroke();
    g.fillStyle = INK;
    g.font = `700 64px "${FONT}"`;
    g.textAlign = 'center';
    g.fillText('Body glow through the day', 512, 96);
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(110, 150);
    g.lineTo(110, 620);
    g.lineTo(940, 620);
    g.stroke();
    g.font = `700 46px "${FONT}"`;
    const xs = ['10am', '1pm', '4pm', '7pm', '10pm'];
    xs.forEach((t, i) => g.fillText(t, 150 + i * 190, 690));
    // the curve
    const ys = [560, 400, 220, 330, 450];
    g.strokeStyle = '#ff8a1e';
    g.lineWidth = 16;
    g.beginPath();
    for (let i = 0; i <= 40; i++) {
      const u = (i / 40) * 4;
      const k = Math.min(3, Math.floor(u));
      const t = u - k;
      const tt = (1 - Math.cos(Math.PI * t)) / 2;
      const y = ys[k] + (ys[k + 1] - ys[k]) * tt;
      const x = 150 + u * 190;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    for (const [i, col] of [[0, '#3a6fd8'], [2, '#ff8a1e']] as [number, string][]) {
      g.fillStyle = col;
      g.beginPath();
      g.arc(150 + i * 190, ys[i], 22, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 8;
      g.strokeStyle = INK;
      g.stroke();
    }
    g.fillStyle = '#3a6fd8';
    g.fillText('dimmest', 220, 530);
    g.fillStyle = '#e06a00';
    g.fillText('brightest', 530, 190);
    return toTexture(c);
  });

export const clockFace = () =>
  once('clock', () => {
    const {c, g} = canvas(512, 512);
    g.fillStyle = '#fbf6ea';
    g.beginPath();
    g.arc(256, 256, 246, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 22;
    g.strokeStyle = INK;
    g.stroke();
    g.fillStyle = INK;
    g.font = `700 64px "${FONT}"`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      g.fillText(String(i), 256 + Math.cos(a) * 185, 256 + Math.sin(a) * 185);
    }
    return toTexture(c);
  });

// The camera's timer screen, one texture per minute.
export const timerTex = (min: number) =>
  boardTexture(`timer|${min}`, 512, 256, '#0d1a12', [
    {text: `${String(min).padStart(2, '0')}:00`, size: 140, y: 0.5, color: min >= 20 ? '#ffcf3a' : '#5ff0b8'},
    {text: 'EXPOSURE', size: 34, y: 0.86, color: '#5ff0b8', weight: 500},
  ], {border: '#2b3a30', radius: 20});

// Wall gauge: what eyes can see, and the body's glow far below it.
export const gaugeTex = () =>
  boardTexture('gauge', 640, 1024, '#f7f2e6', [
    {text: 'Light', size: 72, y: 0.08},
    {text: 'Eyes can see', size: 46, y: 0.2, color: '#1d6fe0'},
    {text: 'Your glow', size: 46, y: 0.83, color: '#e06a00'},
    {text: '1,000× fainter', size: 50, y: 0.92},
  ], {
    extra: (g) => {
      // a tall tube with a line near the top and a tiny sliver of fill at the bottom
      g.fillStyle = '#dfe6f2';
      g.strokeStyle = INK;
      g.lineWidth = 12;
      g.beginPath();
      g.roundRect(250, 250, 140, 560, 60);
      g.fill();
      g.stroke();
      g.strokeStyle = '#1d6fe0';
      g.lineWidth = 14;
      g.setLineDash([22, 14]);
      g.beginPath();
      g.moveTo(170, 290);
      g.lineTo(470, 290);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = '#ffb030';
      g.beginPath();
      g.roundRect(262, 790, 116, 12, 6);
      g.fill();
    },
  });

// The inside wall of a cell: soft pink-violet with blobs and dots.
export const membraneTex = () =>
  once('membrane', () => {
    const {c, g} = canvas(1024, 512);
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#5a2a6e');
    grd.addColorStop(0.6, '#a2477e');
    grd.addColorStop(1, '#e07a8f');
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 512);
    const r = rng(8);
    for (let i = 0; i < 220; i++) {
      const x = r() * 1024;
      const y = r() * 512;
      const rr = 8 + r() * 40;
      g.fillStyle = `rgba(255,${180 + r() * 60},${200 + r() * 50},${0.06 + r() * 0.12})`;
      g.beginPath();
      g.arc(x, y, rr, 0, Math.PI * 2);
      g.fill();
    }
    return toTexture(c, [3, 1]);
  });

export const cytoFloorTex = () =>
  once('cyto', () => {
    const {c, g} = canvas(512, 512);
    g.fillStyle = '#c45c86';
    g.fillRect(0, 0, 512, 512);
    const r = rng(12);
    for (let i = 0; i < 400; i++) {
      const x = r() * 512;
      const y = r() * 512;
      const rr = 6 + r() * 26;
      g.fillStyle = r() > 0.5 ? 'rgba(255,200,220,0.16)' : 'rgba(90,20,60,0.14)';
      g.beginPath();
      g.arc(x, y, rr, 0, Math.PI * 2);
      g.fill();
    }
    return toTexture(c, [12, 12]);
  });

// Stripes for the mitochondrion's folds.
export const mitoTex = () =>
  once('mito', () => {
    const {c, g} = canvas(1024, 256);
    g.fillStyle = '#f08a3c';
    g.fillRect(0, 0, 1024, 256);
    g.strokeStyle = '#c4561c';
    g.lineWidth = 18;
    for (let x = 40; x < 1024; x += 90) {
      g.beginPath();
      g.moveTo(x, 20);
      g.bezierCurveTo(x + 40, 90, x - 40, 160, x, 236);
      g.stroke();
    }
    g.strokeStyle = '#ffc07a';
    g.lineWidth = 6;
    for (let x = 60; x < 1024; x += 90) {
      g.beginPath();
      g.moveTo(x, 30);
      g.bezierCurveTo(x + 40, 100, x - 40, 160, x, 226);
      g.stroke();
    }
    return toTexture(c);
  });

// A big leaf with veins and a scratch across it.
export const leafTex = () =>
  once('leaf', () => {
    const {c, g} = canvas(1024, 512);
    g.clearRect(0, 0, 1024, 512);
    g.beginPath();
    g.moveTo(30, 256);
    g.bezierCurveTo(250, 20, 760, 0, 1000, 256);
    g.bezierCurveTo(760, 512, 250, 492, 30, 256);
    g.closePath();
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#5fbf4a');
    grd.addColorStop(1, '#2f8a3a');
    g.fillStyle = grd;
    g.fill();
    g.lineWidth = 12;
    g.strokeStyle = INK;
    g.stroke();
    g.save();
    g.clip();
    g.strokeStyle = 'rgba(220,255,190,0.6)';
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(30, 256);
    g.lineTo(1000, 256);
    g.stroke();
    g.lineWidth = 4;
    for (let x = 140; x < 940; x += 90) {
      g.beginPath();
      g.moveTo(x, 256);
      g.quadraticCurveTo(x + 60, 150, x + 130, 70);
      g.moveTo(x, 256);
      g.quadraticCurveTo(x + 60, 362, x + 130, 442);
      g.stroke();
    }
    // the scratch
    g.strokeStyle = '#3d2a1a';
    g.lineWidth = 14;
    g.beginPath();
    g.moveTo(560, 120);
    g.lineTo(640, 200);
    g.lineTo(610, 250);
    g.lineTo(720, 360);
    g.stroke();
    g.restore();
    return toTexture(c);
  });

// The clinic screen: an arm outline with a glow map.
export const scanTex = () =>
  once('scan', () => {
    const {c, g} = canvas(768, 512);
    g.fillStyle = '#071022';
    g.fillRect(0, 0, 768, 512);
    g.fillStyle = 'rgba(80,120,220,0.35)';
    g.beginPath();
    g.roundRect(80, 200, 600, 120, 60);
    g.fill();
    const hot = (x: number, y: number, r: number, a: number, col: string) => {
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(255,250,210,${a})`);
      grd.addColorStop(0.4, col);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    };
    hot(220, 260, 70, 0.5, 'rgba(60,200,140,0.5)');
    hot(380, 260, 70, 0.5, 'rgba(60,200,140,0.5)');
    hot(540, 255, 80, 0.9, 'rgba(255,150,40,0.8)');
    g.strokeStyle = '#ffcf3a';
    g.lineWidth = 6;
    g.setLineDash([12, 10]);
    g.strokeRect(470, 180, 140, 150);
    g.setLineDash([]);
    g.fillStyle = '#c9d4ff';
    g.font = `700 40px "${FONT}"`;
    g.textAlign = 'center';
    g.fillText('Tissue glow scan', 384, 90);
    g.fillStyle = '#ffcf3a';
    g.font = `700 34px "${FONT}"`;
    g.fillText('check here', 540, 380);
    return toTexture(c);
  });

// The farmer's field map: rows, one patch glowing.
export const fieldMapTex = () =>
  once('fieldMap', () => {
    const {c, g} = canvas(768, 512);
    g.fillStyle = '#0d1a12';
    g.fillRect(0, 0, 768, 512);
    for (let r = 0; r < 8; r++)
      for (let k = 0; k < 14; k++) {
        const hot = r >= 2 && r <= 4 && k >= 8 && k <= 11;
        g.fillStyle = hot ? '#ffb030' : '#2f8a5a';
        g.beginPath();
        g.arc(60 + k * 50, 70 + r * 52, hot ? 18 : 12, 0, Math.PI * 2);
        g.fill();
      }
    g.strokeStyle = '#ffcf3a';
    g.lineWidth = 6;
    g.strokeRect(440, 150, 200, 170);
    g.fillStyle = '#ffcf3a';
    g.font = `700 36px "${FONT}"`;
    g.textAlign = 'center';
    g.fillText('stressed plants', 540, 480);
    return toTexture(c);
  });

export const snowTex = () =>
  once('snow', () => {
    const {c, g} = canvas(512, 512);
    g.fillStyle = '#eef3fa';
    g.fillRect(0, 0, 512, 512);
    const r = rng(21);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = r() > 0.5 ? 'rgba(170,190,220,0.18)' : 'rgba(255,255,255,0.6)';
      g.beginPath();
      g.arc(r() * 512, r() * 512, 2 + r() * 8, 0, Math.PI * 2);
      g.fill();
    }
    return toTexture(c, [10, 10]);
  });

export const pavingTex = (base: string) =>
  once('paving|' + base, () => {
    const {c, g} = canvas(512, 512);
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = 'rgba(0,0,0,0.25)';
    g.lineWidth = 4;
    for (let i = 0; i <= 512; i += 128) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, 512);
      g.moveTo(0, i);
      g.lineTo(512, i);
      g.stroke();
    }
    const r = rng(3);
    for (let i = 0; i < 800; i++) {
      g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
      g.fillRect(r() * 512, r() * 512, 3, 3);
    }
    return toTexture(c, [8, 8]);
  });
