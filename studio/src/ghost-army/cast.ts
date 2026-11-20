// The cast of the Ghost Army story: a new cast for this video, drawn as generic figures with one identifying feature.
// GIs in olive battledress and round steel helmets; two French cyclists in berets; the fake general (peaked cap with
// stars); the artist with his brush; a villager and a waiter in town. Every figure gets the Undercover sticker outline.
import {canvasSprite} from '../shared/flat';
import {themed} from '../shared/finish';
import {drawPerson, PersonLook, PersonPose} from '../shared/people';
import type {Expr} from '../shared/toon';
import {THEMES} from '../themes';

const T = THEMES.undercover;
const GI = {top: 'jumper', color: '#727a46', dark: '#555c32', head: 'helmet', headColor: '#5f6739', headDark: '#454b28'} as const;

export const LOOKS = {
  gi1: {...GI},
  gi2: {...GI, color: '#7b7f4c', moustache: '#4a3020'},
  gi3: {...GI, color: '#6c7444'},
  gi4: {...GI, color: '#767a48', head: 'cap', headColor: '#5f6739', headDark: '#454b28'},
  // the French cyclists: one in a blue jumper and black beret, one older in a striped shirt and red beret
  fr1: {top: 'jumper', color: '#3f6aa8', dark: '#2c4e80', head: 'beret', headColor: '#25252e', headDark: '#15151c'},
  fr2: {top: 'check', color: '#e9e2cf', dark: '#c8bea4', head: 'beret', headColor: '#a8352c', headDark: '#7a221c', moustache: '#d8d2c4'},
  // the man playing a general: a long officer's coat and a peaked cap with two stars
  general: {top: 'coat', color: '#80744a', dark: '#5f5534', head: 'peaked', crown: '#6f6a44', headColor: '#4c4a2c', headDark: '#2a2918', stars: 2, moustache: '#3a2618'},
  artist: {top: 'jumper', color: '#727a46', dark: '#555c32', head: 'cap', headColor: '#5f6739', headDark: '#454b28', glasses: true},
  villager: {top: 'shirt', color: '#e6d2a8', dark: '#c4ae84', head: 'beret', headColor: '#2e3a55', headDark: '#1c2438'},
  waiter: {top: 'shirt', color: '#f4f2ec', dark: '#d4d0c6', head: 'hair', headColor: '#2a1d14', headDark: '#170f0a', moustache: '#2a1d14'},
} satisfies Record<string, PersonLook>;

export type Who = keyof typeof LOOKS;

export const person = (who: Who, pose: PersonPose, expr: Expr, carry?: PersonLook['carry']) => {
  const look = {...LOOKS[who], ...(carry !== undefined ? {carry} : {})} as PersonLook;
  return canvasSprite(`ghost|${who}|${pose}|${expr}|${look.carry ?? ''}`, themed(T, () => drawPerson(look, pose, expr)));
};
