// Channel finishes: what makes one channel's videos recognisable next to another's, on top of the
// shared toon-3D look. Driven by `theme.look` (themes.ts). The 3D world itself is never flattened.
//  - sticker(): a coloured border cut around a flat figure's drawing, like a sticker.
//  - <Graded>: wraps the 3D picture in the theme's colour grade.
//  - <Finish>: grain, wash and vignette laid over the picture, under the captions.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Theme} from '../themes';
import {rng} from './toon';

// Draw the figure's silhouette grown by `width` px in `color`, then the figure on top.
export const sticker = (src: HTMLCanvasElement, width: number, color: string): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d')!;
  // the silhouette in the sticker colour
  const sil = document.createElement('canvas');
  sil.width = src.width;
  sil.height = src.height;
  const sg = sil.getContext('2d')!;
  sg.drawImage(src, 0, 0);
  sg.globalCompositeOperation = 'source-in';
  sg.fillStyle = color;
  sg.fillRect(0, 0, sil.width, sil.height);
  // stamp it around a ring to grow it
  const steps = 24;
  for (let r = width; r > 0; r -= Math.max(2, width / 3))
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      g.drawImage(sil, Math.cos(a) * r, Math.sin(a) * r);
    }
  g.drawImage(src, 0, 0);
  return c;
};

// Apply the theme's sticker to any drawing function's result (no-op for themes without one).
export const themed = (theme: Theme, draw: () => HTMLCanvasElement) => () => {
  const c = draw();
  return theme.look.sticker ? sticker(c, theme.look.sticker.width, theme.look.sticker.color) : c;
};

let grainUrl: string | null = null;
const grainTile = () => {
  if (grainUrl) return grainUrl;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  const img = g.createImageData(256, 256);
  const r = rng(91);
  for (let i = 0; i < 256 * 256; i++) {
    const v = 128 + (r() - 0.5) * 120;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // a few paper fibres
  g.strokeStyle = 'rgba(255,255,255,0.25)';
  g.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const x = r() * 256;
    const y = r() * 256;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + r() * 20 - 10, y + r() * 20 - 10, x + r() * 30 - 15, y + r() * 30 - 15);
    g.stroke();
  }
  grainUrl = c.toDataURL();
  return grainUrl;
};

export const Graded: React.FC<{theme: Theme; blur?: number; children: React.ReactNode}> = ({theme, blur = 0, children}) => {
  const filters = [theme.look.grade, blur ? `blur(${blur.toFixed(1)}px)` : undefined].filter(Boolean).join(' ');
  return <AbsoluteFill style={{filter: filters || undefined}}>{children}</AbsoluteFill>;
};

export const Finish: React.FC<{theme: Theme; f: number}> = ({theme, f}) => {
  const L = theme.look;
  // the grain shifts every two frames, like film
  const step = Math.floor(f / 2);
  const ox = (step * 73) % 256;
  const oy = (step * 151) % 256;
  return (
    <>
      {L.wash && <AbsoluteFill style={{backgroundColor: L.wash, mixBlendMode: 'multiply'}} />}
      {L.grain ? (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${grainTile()})`,
            backgroundSize: '384px 384px',
            backgroundPosition: `${ox}px ${oy}px`,
            mixBlendMode: 'overlay',
            opacity: L.grain * 0.5,
          }}
        />
      ) : null}
      {L.vignette && <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 62% at 50% 46%, rgba(0,0,0,0) 58%, ${L.vignette} 100%)`}} />}
    </>
  );
};
