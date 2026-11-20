// The cast of the Wojtek story: a new cast for this video. Real people are drawn as generic figures:
// the sergeant (moustache, peaked cap), Polish soldiers in khaki battledress, the boy, and the British officer.
// Wojtek himself is the shared bear drawing (shared/bear.ts). Every figure gets the Undercover sticker outline.
import {canvasSprite} from '../shared/flat';
import {themed} from '../shared/finish';
import {drawPerson, PersonLook, PersonPose} from '../shared/people';
import {BearExpr, BearPose, drawBear} from '../shared/bear';
import type {Expr} from '../shared/toon';
import {THEMES} from '../themes';

const T = THEMES.undercover;

export const LOOKS = {
  // the sergeant: khaki tunic, dark peaked cap, big moustache
  sergeant: {top: 'coat', color: '#8c8158', dark: '#6c633f', head: 'peaked', headColor: '#5b5436', headDark: '#3c3722', beard: '#4a3020'},
  // Polish soldiers in battledress
  s1: {top: 'jumper', color: '#8f8459', dark: '#6f6640', head: 'cap', headColor: '#6f6640', headDark: '#4f4828'},
  s2: {top: 'jumper', color: '#7d7a52', dark: '#5e5b38', head: 'hair', headColor: '#3a2a1e', headDark: '#24180f'},
  s3: {top: 'jumper', color: '#968a60', dark: '#766c44', head: 'cap', headColor: '#5e5b38', headDark: '#3e3c22', beard: '#7a5a3a'},
  // the boy in Iran: a plain shirt, dark hair
  boy: {top: 'shirt', color: '#e8dcc0', dark: '#c4b694', head: 'hair', headColor: '#2a1d14', headDark: '#170f0a'},
  // the British officer: light khaki, a red-banded peaked cap
  officer: {top: 'coat', color: '#c2ad7a', dark: '#9d8a58', head: 'peaked', headColor: '#a33a2e', headDark: '#6e231b'},
} satisfies Record<string, PersonLook>;

export type Who = keyof typeof LOOKS;

export const person = (who: Who, pose: PersonPose, expr: Expr, carry?: PersonLook['carry']) => {
  const look = {...LOOKS[who], ...(carry !== undefined ? {carry} : {})} as PersonLook;
  return canvasSprite(`wojtek|${who}|${pose}|${expr}|${look.carry ?? ''}`, themed(T, () => drawPerson(look, pose, expr)));
};

export const bear = (pose: BearPose, expr: BearExpr = 'happy', cub = false) =>
  canvasSprite(`wojtek|bear|${pose}|${expr}|${cub}`, themed(T, () => drawBear(pose, expr, cub)));
