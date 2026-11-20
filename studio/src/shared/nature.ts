// Painted outdoor surfaces for story worlds: sand, rock, grass, earth, bark, leaves, water, thatch, sky.
// Drawn in code like toon.ts, so renders are repeatable and need no downloads. First used in "Hanuman's leap".
import * as THREE from 'three';
import {INK, rng, toTexture} from './toon';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return {c, g: c.getContext('2d')!};
};

// Speckled ground: a base colour with many small dabs of lighter and darker tones.
const speckle = (base: string, dabs: string[], n: number, size: [number, number], seed: number, repeat: [number, number]) => {
  const {c, g} = canvas(512, 512);
  const r = rng(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < n; i++) {
    g.fillStyle = dabs[i % dabs.length];
    g.globalAlpha = 0.25 + r() * 0.5;
    const x = r() * 512;
    const y = r() * 512;
    const s = size[0] + r() * (size[1] - size[0]);
    g.beginPath();
    g.ellipse(x, y, s, s * (0.5 + r() * 0.5), r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  return toTexture(c, repeat);
};

export const sandTexture = (repeat: [number, number] = [24, 16]) =>
  speckle('#e7c98f', ['#f6e0b0', '#c9a467', '#d9b77a', '#fff0cc'], 2600, [1, 4], 11, repeat);

export const earthTexture = (repeat: [number, number] = [10, 10]) =>
  speckle('#a87a4f', ['#c49566', '#86603c', '#8f9a4f', '#d2ad7c'], 2200, [2, 7], 17, repeat);

export const grassTexture = (base = '#5f9a45', repeat: [number, number] = [14, 14]) => {
  const {c, g} = canvas(512, 512);
  const r = rng(23);
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  const shades = ['#7dbb57', '#4b7f36', '#8fcf63', '#3f6d2d', '#a6d36e'];
  g.lineCap = 'round';
  for (let i = 0; i < 3800; i++) {
    const x = r() * 512;
    const y = r() * 512;
    g.strokeStyle = shades[i % shades.length];
    g.globalAlpha = 0.5 + r() * 0.5;
    g.lineWidth = 2 + r() * 2;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 8, y - 6 - r() * 10);
    g.stroke();
  }
  g.globalAlpha = 1;
  return toTexture(c, repeat);
};

// Rock: blotches plus inked cracks.
export const rockTexture = (base = '#8c8378', repeat: [number, number] = [2, 2], seed = 5) => {
  const {c, g} = canvas(512, 512);
  const r = rng(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  const tones = ['#a39a8e', '#6f675e', '#b8ae9f', '#7d7468'];
  for (let i = 0; i < 160; i++) {
    g.fillStyle = tones[i % tones.length];
    g.globalAlpha = 0.35;
    g.beginPath();
    g.ellipse(r() * 512, r() * 512, 10 + r() * 50, 6 + r() * 26, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 0.55;
  g.strokeStyle = '#3b352f';
  g.lineWidth = 3;
  for (let i = 0; i < 18; i++) {
    let x = r() * 512;
    let y = r() * 512;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      x += (r() - 0.5) * 70;
      y += r() * 40;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
  return toTexture(c, repeat);
};

export const barkTexture = (base = '#6b4a32') => {
  const {c, g} = canvas(256, 512);
  const r = rng(31);
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 512);
  g.strokeStyle = '#3e2a1c';
  g.lineCap = 'round';
  for (let i = 0; i < 40; i++) {
    const x = r() * 256;
    g.lineWidth = 3 + r() * 5;
    g.globalAlpha = 0.6;
    g.beginPath();
    g.moveTo(x, 0);
    g.bezierCurveTo(x + (r() - 0.5) * 30, 170, x + (r() - 0.5) * 30, 340, x + (r() - 0.5) * 20, 512);
    g.stroke();
  }
  g.globalAlpha = 1;
  return toTexture(c, [2, 3]);
};

// A cluster of leaves (or blossoms) with an ink outline, for camera-facing foliage cards.
export const foliageTexture = (fill: string, light: string, dark: string, seed = 3, blossom?: string) => {
  const {c, g} = canvas(512, 512);
  const r = rng(seed);
  const blobs: [number, number, number][] = [];
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 150;
    blobs.push([256 + Math.cos(a) * d, 270 + Math.sin(a) * d * 0.8, 52 + r() * 40]);
  }
  // ink outline: every blob drawn larger in ink first
  g.fillStyle = INK;
  for (const [x, y, s] of blobs) {
    g.beginPath();
    g.arc(x, y, s + 9, 0, Math.PI * 2);
    g.fill();
  }
  for (const [x, y, s] of blobs) {
    g.fillStyle = fill;
    g.beginPath();
    g.arc(x, y, s, 0, Math.PI * 2);
    g.fill();
  }
  for (const [x, y, s] of blobs) {
    g.fillStyle = y > 290 ? dark : light;
    g.globalAlpha = 0.55;
    g.beginPath();
    g.arc(x - s * 0.25, y - s * 0.25, s * 0.45, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  if (blossom) {
    for (let i = 0; i < 60; i++) {
      const [x, y, s] = blobs[i % blobs.length];
      const bx = x + (r() - 0.5) * s * 1.4;
      const by = y + (r() - 0.5) * s * 1.4;
      g.fillStyle = INK;
      g.beginPath();
      g.arc(bx, by, 13, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = blossom;
      g.beginPath();
      g.arc(bx, by, 9, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff2a8';
      g.beginPath();
      g.arc(bx, by, 3, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = toTexture(c);
  return t;
};

// Palm frond: a long leaf with fingers, ink outlined, on a transparent canvas (pointing right).
export const frondTexture = () => {
  const {c, g} = canvas(512, 128);
  g.lineCap = 'round';
  const draw = (color: string, w: number) => {
    g.strokeStyle = color;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(8, 64);
    g.quadraticCurveTo(256, 40, 500, 70);
    g.stroke();
    for (let x = 40; x < 490; x += 22) {
      const len = 50 * Math.sin((Math.PI * x) / 512) + 6;
      g.beginPath();
      g.moveTo(x, 58);
      g.lineTo(x + 24, 58 - len);
      g.moveTo(x, 62);
      g.lineTo(x + 24, 62 + len);
      g.stroke();
    }
  };
  draw(INK, 16);
  draw('#4f9a3c', 8);
  return toTexture(c);
};

// Ripples for water surfaces: soft light streaks on a transparent background, tiled.
export const rippleTexture = (repeat: [number, number] = [40, 40]) => {
  const {c, g} = canvas(256, 256);
  const r = rng(41);
  g.clearRect(0, 0, 256, 256);
  g.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = r() * 256;
    const y = r() * 256;
    const w = 10 + r() * 34;
    g.strokeStyle = i % 3 ? 'rgba(255,255,255,0.55)' : 'rgba(10,30,60,0.35)';
    g.lineWidth = 2 + r() * 2;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + w / 2, y - 3, x + w, y);
    g.stroke();
  }
  return toTexture(c, repeat);
};

export const thatchTexture = () => {
  const {c, g} = canvas(512, 256);
  const r = rng(51);
  g.fillStyle = '#c9a25a';
  g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 1400; i++) {
    const x = r() * 512;
    const y = r() * 256;
    g.strokeStyle = ['#e2c27a', '#a8823f', '#8f6a2e', '#f0d690'][i % 4];
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 4, y + 18 + r() * 16);
    g.stroke();
  }
  return toTexture(c, [6, 2]);
};

// Brick for a havan kund or a wall.
export const brickTexture = (repeat: [number, number] = [2, 1]) => {
  const {c, g} = canvas(256, 128);
  g.fillStyle = '#7a3b26';
  g.fillRect(0, 0, 256, 128);
  for (let row = 0; row < 4; row++)
    for (let col = -1; col < 5; col++) {
      const x = col * 64 + (row % 2) * 32;
      g.fillStyle = ['#b5583a', '#a44c31', '#c26a47'][(row + col + 3) % 3];
      g.fillRect(x + 3, row * 32 + 3, 58, 26);
    }
  return toTexture(c, repeat);
};

// Vertical sky gradient for a dome (stops from the top of the sky down to the horizon and below).
export const skyTexture = (stops: [number, string][]) => {
  const {c, g} = canvas(16, 512);
  const grd = g.createLinearGradient(0, 0, 0, 512);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// A painted flame: teardrop, yellow core, orange edge, ink-free (it glows).
export const flameTexture = () => {
  const {c, g} = canvas(128, 256);
  const shape = (s: number, col: string) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(64, 256 - 236 * s);
    g.bezierCurveTo(64 + 70 * s, 256 - 120 * s, 64 + 56 * s, 250, 64, 250);
    g.bezierCurveTo(64 - 56 * s, 250, 64 - 70 * s, 256 - 120 * s, 64, 256 - 236 * s);
    g.fill();
  };
  shape(1, '#ff6a1f');
  shape(0.75, '#ffa628');
  shape(0.45, '#fff0a0');
  return toTexture(c);
};

// A soft cloud puff (white, alpha-edged).
export const cloudTexture = () => {
  const {c, g} = canvas(512, 256);
  const r = rng(61);
  for (let i = 0; i < 14; i++) {
    const x = 90 + r() * 330;
    const y = 120 + (r() - 0.5) * 60;
    const s = 40 + r() * 60;
    const grd = g.createRadialGradient(x, y, 0, x, y, s);
    grd.addColorStop(0, 'rgba(255,255,255,0.9)');
    grd.addColorStop(0.6, 'rgba(255,255,255,0.6)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 256);
  }
  return toTexture(c);
};
