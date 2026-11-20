// Painted surfaces for the Q-ship story, drawn in code.
import * as THREE from 'three';
import {rng, toTexture} from '../shared/toon';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return {c, g: c.getContext('2d')!};
};

// The steamer's side: dark grey paint with rust streaks running down from rivet lines, a red band at the waterline.
// u runs along the ship (one tile per 10 m), v from the deck edge (0) down to the keel (1).
export const hullTexture = () => {
  const {c, g} = canvas(1024, 512);
  const r = rng(17);
  g.fillStyle = '#3c4146';
  g.fillRect(0, 0, 1024, 512);
  // plate seams and rivets
  g.strokeStyle = 'rgba(0,0,0,0.35)';
  g.lineWidth = 3;
  for (let x = 0; x < 1024; x += 128) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 512);
    g.stroke();
  }
  for (const y of [90, 170]) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
    g.fillStyle = 'rgba(200,200,200,0.25)';
    for (let x = 6; x < 1024; x += 16) g.fillRect(x, y - 8, 4, 4);
  }
  // rust streaks
  for (let i = 0; i < 60; i++) {
    const x = r() * 1024;
    const y0 = [0, 90, 170][Math.floor(r() * 3)] + r() * 10;
    const len = 40 + r() * 180;
    const grd = g.createLinearGradient(0, y0, 0, y0 + len);
    grd.addColorStop(0, `rgba(${170 + r() * 40},${80 + r() * 30},40,0.85)`);
    grd.addColorStop(1, 'rgba(150,70,30,0)');
    g.fillStyle = grd;
    g.fillRect(x, y0, 3 + r() * 9, len);
  }
  // rust patches
  for (let i = 0; i < 26; i++) {
    g.fillStyle = `rgba(${150 + r() * 50},${70 + r() * 30},35,${0.35 + r() * 0.4})`;
    g.beginPath();
    g.ellipse(r() * 1024, r() * 200, 10 + r() * 34, 6 + r() * 18, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  // waterline band
  g.fillStyle = '#8e2f26';
  g.fillRect(0, 222, 1024, 290);
  g.fillStyle = 'rgba(240,235,220,0.7)';
  g.fillRect(0, 216, 1024, 8);
  for (let i = 0; i < 30; i++) {
    g.fillStyle = `rgba(60,40,30,${0.2 + r() * 0.3})`;
    g.fillRect(r() * 1024, 226 + r() * 60, 20 + r() * 80, 4 + r() * 8);
  }
  const t = toTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
};

// Worn cream paint for the bridge house, with portholes and a few rust drips.
export const housePaint = (portholes: boolean) => {
  const {c, g} = canvas(512, 256);
  const r = rng(29);
  g.fillStyle = '#e9e1cc';
  g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 18; i++) {
    const x = r() * 512;
    const y = r() * 120;
    const grd = g.createLinearGradient(0, y, 0, y + 90);
    grd.addColorStop(0, 'rgba(170,90,40,0.7)');
    grd.addColorStop(1, 'rgba(170,90,40,0)');
    g.fillStyle = grd;
    g.fillRect(x, y, 4 + r() * 5, 90);
  }
  if (portholes)
    for (let x = 64; x < 512; x += 128) {
      g.fillStyle = '#c9a24a';
      g.beginPath();
      g.arc(x, 110, 34, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#2b3a4a';
      g.beginPath();
      g.arc(x, 110, 24, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.beginPath();
      g.arc(x - 8, 102, 7, 0, Math.PI * 2);
      g.fill();
    }
  g.fillStyle = 'rgba(80,60,40,0.25)';
  g.fillRect(0, 236, 512, 20);
  return toTexture(c);
};

// The coral cargo crate with the place and year stencilled on it: the channel's signature beat.
export const crateTexture = () => {
  const {c, g} = canvas(512, 384);
  const r = rng(5);
  g.fillStyle = '#f4805c';
  g.fillRect(0, 0, 512, 384);
  // planks
  for (let y = 0; y < 384; y += 64) {
    g.fillStyle = `rgba(120,40,20,${0.12 + r() * 0.1})`;
    g.fillRect(0, y, 512, 4);
    for (let i = 0; i < 12; i++) {
      g.fillStyle = 'rgba(255,220,190,0.12)';
      g.fillRect(r() * 512, y + 8 + r() * 50, 30 + r() * 90, 2);
    }
  }
  // frame
  g.strokeStyle = '#de5f45';
  g.lineWidth = 28;
  g.strokeRect(14, 14, 484, 356);
  // stencil
  g.fillStyle = '#fff8ea';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '400 92px "Bebas Neue"';
  g.fillText('NORTH ATLANTIC', 256, 150);
  g.font = '400 132px "Bebas Neue"';
  g.fillText('1916', 256, 262);
  // stencil bridges and wear
  g.fillStyle = '#f4805c';
  for (let i = 0; i < 70; i++) g.fillRect(r() * 512, 100 + r() * 220, 2 + r() * 6, 2 + r() * 4);
  return toTexture(c);
};

// Slatted coop wall: wooden slats with dark gaps and straw at the bottom.
export const coopTexture = () => {
  const {c, g} = canvas(256, 256);
  const r = rng(8);
  g.fillStyle = '#2a1e16';
  g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 32) {
    g.fillStyle = ['#b98a55', '#a87a48', '#c49660'][(x / 32) % 3];
    g.fillRect(x + 3, 0, 22, 256);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = 'rgba(80,50,30,0.35)';
      g.fillRect(x + 5 + r() * 16, r() * 256, 2, 20 + r() * 40);
    }
  }
  g.fillStyle = '#e7c46a';
  for (let i = 0; i < 60; i++) g.fillRect(r() * 256, 230 + r() * 26, 10 + r() * 14, 2);
  return toTexture(c);
};

// A chalk tally on the torpedo room wall: how many are left.
export const tallyTexture = () => {
  const {c, g} = canvas(512, 256);
  g.fillStyle = '#2c3330';
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = '#8a6a44';
  g.lineWidth = 16;
  g.strokeRect(8, 8, 496, 240);
  g.strokeStyle = '#f2efe6';
  g.lineWidth = 9;
  g.lineCap = 'round';
  // a full load of ten, six already used and crossed out: four left
  for (let i = 0; i < 10; i++) {
    const x = 60 + i * 42;
    g.globalAlpha = i < 4 ? 1 : 0.35;
    g.beginPath();
    g.moveTo(x, 70);
    g.lineTo(x - 6, 186);
    g.stroke();
    if (i >= 4) {
      g.beginPath();
      g.moveTo(x - 20, 150);
      g.lineTo(x + 14, 100);
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  return toTexture(c);
};

// Riveted grey steel for the U-boat and the torpedo room.
export const steelTexture = (base = '#5b6670', repeat: [number, number] = [6, 2]) => {
  const {c, g} = canvas(256, 256);
  const r = rng(61);
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(0,0,0,0.3)';
  g.lineWidth = 3;
  for (let x = 0; x <= 256; x += 128) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 256);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(0, 128);
  g.lineTo(256, 128);
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.18)';
  for (let x = 6; x < 256; x += 14) {
    g.fillRect(x, 122, 3, 3);
    g.fillRect(x, 250, 3, 3);
  }
  for (let i = 0; i < 30; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? '140,80,50' : '20,25,30'},${0.12 + r() * 0.15})`;
    g.fillRect(r() * 256, r() * 256, 4 + r() * 30, 2 + r() * 8);
  }
  return toTexture(c, repeat);
};
