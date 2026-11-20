// The cast of "You are glowing right now": a new cast for this video (Mind Matter has no recurring characters).
import {canvasSprite} from '../shared/flat';
import {drawMouse, drawPerson, drawRadical, PersonLook, PersonPose} from '../shared/people';
import type {Expr} from '../shared/toon';

export const LOOKS = {
  // the viewer: a young person in a teal hoodie, at home at night
  you: {top: 'hoodie', color: '#2fb9a6', dark: '#1f8d7e', head: 'hair', headColor: '#3a2a22', headDark: '#2a1d17'},
  // the photographer in Japan (2009): lab coat, glasses, short black hair
  haru: {top: 'labcoat', color: '#2b4c8c', dark: '#1d3566', head: 'hair', headColor: '#1c1a24', headDark: '#0f0e15', glasses: true},
  // the five volunteers, bare-chested, in different shorts
  v1: {top: 'bare', color: '#3a6fd8', dark: '#2a54a8'},
  v2: {top: 'bare', color: '#f08a2e', dark: '#c66c1c'},
  v3: {top: 'bare', color: '#3cae5c', dark: '#2b8746'},
  v4: {top: 'bare', color: '#8e5cd8', dark: '#6c42ad'},
  v5: {top: 'bare', color: '#e2475b', dark: '#b33343'},
  // the scientist in Canada (2025)
  maya: {top: 'labcoat', color: '#c0392b', dark: '#962c21', head: 'bun', headColor: '#7a4a2a', headDark: '#5a341c'},
  // a doctor and a patient
  doc: {top: 'scrubs', color: '#3a7bd5', dark: '#2c5fa6', head: 'hair', headColor: '#8c8a96', headDark: '#6a6874', stethoscope: true, carry: 'tablet'},
  patient: {top: 'shirt', color: '#f4c542', dark: '#d2a32a', head: 'beanie', headColor: '#e8572f', headDark: '#c04424'},
  // a farmer with a tablet
  farmer: {top: 'check', color: '#c8463c', dark: '#9e3329', head: 'straw', headColor: '#e9c46a', headDark: '#c9a24a', carry: 'tablet'},
  // the molecules a free radical bumps into
  fat: {top: 'shirt', color: '#f2c230', dark: '#cf9f17', label: 'FAT'},
  protein: {top: 'shirt', color: '#43b97f', dark: '#2f9563', label: 'PROTEIN'},
} satisfies Record<string, PersonLook>;

export type Who = keyof typeof LOOKS;

export const person = (who: Who, pose: PersonPose, expr: Expr, carry?: PersonLook['carry']) => {
  const look = {...LOOKS[who], ...(carry !== undefined ? {carry} : {})} as PersonLook;
  return canvasSprite(`glow|${who}|${pose}|${expr}|${look.carry ?? ''}`, () => drawPerson(look, pose, expr));
};
export const radical = (pose: 'wild' | 'crash') => canvasSprite(`glow|radical|${pose}`, () => drawRadical(pose));
export const mouse = (pose: 'sniff' | 'curl') => canvasSprite(`glow|mouse|${pose}`, () => drawMouse(pose));
