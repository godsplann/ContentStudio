// Printed and painted surfaces shared by the Undercover stories: stencilled wooden crates (the place-and-year beat)
// and khaki canvas. Lettering in Bebas Neue, as the channel uses. Moved here from wojtek/textures.ts.
import * as THREE from 'three';
import {rng, toTexture} from './toon';

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
export const cachedTexture = (key: string, make: () => HTMLCanvasElement, repeat?: [number, number]) => {
  let t = cache.get(key);
  if (!t) {
    t = toTexture(make(), repeat);
    cache.set(key, t);
  }
  return t;
};
const cached = cachedTexture;
export const BEBAS = (px: number) => `400 ${px}px "Bebas Neue"`;
export const CORAL = '#de5f45';

// Wooden crate side, with an optional stencil in the brand coral (the place-and-year beat) or ink.
export const crateTexture = (stencil = '', color = 'rgba(40,30,20,0.8)', seed = 1) =>
  cached(`crate|${stencil}|${seed}`, () => {
    const {c, g} = canvas(512, 384);
    const r = rng(seed);
    g.fillStyle = '#a37a46';
    g.fillRect(0, 0, 512, 384);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = `rgba(${90 + r() * 30},${60 + r() * 20},30,0.25)`;
      g.fillRect(0, i * 96, 512, 96);
      g.fillStyle = 'rgba(50,30,15,0.5)';
      g.fillRect(0, i * 96, 512, 4);
      for (let k = 0; k < 14; k++) {
        g.fillStyle = `rgba(70,45,20,${0.1 + r() * 0.15})`;
        g.fillRect(r() * 512, i * 96 + 10 + r() * 76, 40 + r() * 120, 2);
      }
    }
    g.fillStyle = '#7d5a30';
    g.fillRect(0, 0, 38, 384);
    g.fillRect(474, 0, 38, 384);
    g.fillStyle = 'rgba(30,20,10,0.6)';
    for (const x of [19, 493]) for (const y of [30, 190, 350]) g.fillRect(x - 4, y - 4, 8, 8);
    if (stencil) {
      g.fillStyle = color;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const lines = stencil.split('\n');
      const px = lines.length > 1 ? 130 : 150;
      lines.forEach((l, i) => {
        g.font = BEBAS(px);
        g.fillText(l, 256, 192 + (i - (lines.length - 1) / 2) * px * 0.95);
      });
      // stencil bridges
      g.fillStyle = '#a37a46';
      for (let i = 0; i < 10; i++) g.fillRect(70 + i * 40, 0, 4, 384);
    }
    return c;
  });

// Khaki canvas for tents and the awning.
export const canvasCloth = (base = '#b5a678') =>
  cached(`cloth|${base}`, () => {
    const {c, g} = canvas(256, 256);
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    const r = rng(9);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = `rgba(60,50,30,${r() * 0.12})`;
      g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1);
    }
    g.fillStyle = 'rgba(80,60,30,0.18)';
    for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 3, 256);
    return c;
  }, [3, 3]);
