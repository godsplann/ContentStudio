// The cast of the Q-ship story: a new cast for this video, all unnamed archetypes.
// Every figure gets the Undercover sticker outline (themes.ts look.sticker) through themed().
import {canvasSprite} from '../shared/flat';
import {themed} from '../shared/finish';
import {drawPerson, drawProne, PersonLook, PersonPose} from '../shared/people';
import {dot, Expr, INK} from '../shared/toon';
import {THEMES} from '../themes';

const T = THEMES.undercover;

export const LOOKS = {
  // the captain: navy officer's coat, peaked cap, white beard
  captain: {top: 'coat', color: '#25365c', dark: '#18243f', head: 'peaked', headColor: '#25365c', headDark: '#121826', beard: '#eceae4'},
  // the new deckhand: young, light blue jumper, red watch cap
  newbie: {top: 'jumper', color: '#6fa8dc', dark: '#4f86b8', head: 'watch', headColor: '#d9483b', headDark: '#a8342a'},
  // the rest of the crew
  c1: {top: 'jumper', color: '#3b5a8a', dark: '#2a4268', head: 'watch', headColor: '#2b2f3c', headDark: '#1b1e28'},
  c2: {top: 'jumper', color: '#8a3b3b', dark: '#682a2a', head: 'watch', headColor: '#e2b04a', headDark: '#b88a2c', beard: '#6a4a32'},
  c3: {top: 'jumper', color: '#4f7a4a', dark: '#3a5c36', head: 'watch', headColor: '#3b5a8a', headDark: '#2a4268'},
  c4: {top: 'jumper', color: '#c9b48a', dark: '#a8946a', head: 'watch', headColor: '#8a3b3b', headDark: '#682a2a', beard: '#9a9a9a'},
  // the hidden gun crews
  g1: {top: 'jumper', color: '#2e4a6b', dark: '#21364f', head: 'watch', headColor: '#c9b48a', headDark: '#a8946a'},
  g2: {top: 'jumper', color: '#6b4a2e', dark: '#4f3621', head: 'watch', headColor: '#2b2f3c', headDark: '#1b1e28', beard: '#3a2a22'},
  g3: {top: 'jumper', color: '#4a6b5a', dark: '#364f42', head: 'watch', headColor: '#d9483b', headDark: '#a8342a'},
  // the U-boat commander: grey-green coat and dark cap, no insignia
  hunter: {top: 'coat', color: '#5a6660', dark: '#434d48', head: 'peaked', headColor: '#2a2f2c', headDark: '#151816'},
} satisfies Record<string, PersonLook>;

export type Who = keyof typeof LOOKS;

export const person = (who: Who, pose: PersonPose, expr: Expr, carry?: PersonLook['carry']) => {
  const look = {...LOOKS[who], ...(carry !== undefined ? {carry} : {})} as PersonLook;
  return canvasSprite(`qship|${who}|${pose}|${expr}|${look.carry ?? ''}`, themed(T, () => drawPerson(look, pose, expr)));
};

export const prone = (who: Who, expr: 'hold' | 'peek') =>
  canvasSprite(`qship|prone|${who}|${expr}`, themed(T, () => drawProne(LOOKS[who] as PersonLook, expr)));

// A hen, side-on, in the same inked style. 512 x 512 (aspect 1). 'sit' on the coop, 'flap' when it bursts open.
export const hen = (pose: 'sit' | 'flap', tone = 0) =>
  canvasSprite(`qship|hen|${pose}|${tone}`, themed(T, () => drawHen(pose, tone)));

const drawHen = (pose: 'sit' | 'flap', tone: number) => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const body = ['#f4efe4', '#c9844a', '#3a3230'][tone % 3];
  const shade = ['#ddd3c0', '#a8662e', '#241e1c'][tone % 3];
  g.lineWidth = 12;
  g.strokeStyle = INK;
  // legs
  if (pose === 'sit') {
    g.strokeStyle = '#e8a33a';
    g.lineWidth = 10;
  }
  g.beginPath();
  g.moveTo(230, 400);
  g.lineTo(220, 470);
  g.moveTo(290, 400);
  g.lineTo(300, 470);
  g.strokeStyle = '#e8a33a';
  g.lineWidth = 12;
  g.stroke();
  // tail
  g.fillStyle = shade;
  g.strokeStyle = INK;
  g.beginPath();
  g.moveTo(370, 300);
  g.quadraticCurveTo(450, 180, 470, 260);
  g.quadraticCurveTo(450, 340, 380, 360);
  g.closePath();
  g.fill();
  g.stroke();
  // body
  g.fillStyle = body;
  g.beginPath();
  g.ellipse(270, 330, 140, 100, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // head
  g.beginPath();
  g.arc(170, 220, 70, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // comb and wattle
  g.fillStyle = '#e2453a';
  g.beginPath();
  g.arc(150, 152, 22, 0, Math.PI * 2);
  g.arc(180, 146, 22, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = 8;
  g.stroke();
  g.beginPath();
  g.ellipse(118, 268, 14, 22, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // beak
  g.fillStyle = '#f2b23a';
  g.beginPath();
  g.moveTo(108, 214);
  g.lineTo(70, 230);
  g.lineTo(108, 246);
  g.closePath();
  g.fill();
  g.stroke();
  // eye
  if (pose === 'flap') {
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(160, 210, 20, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    dot(g, 156, 208, 8);
  } else dot(g, 158, 212, 10);
  // wing
  g.fillStyle = shade;
  g.lineWidth = 10;
  g.beginPath();
  if (pose === 'flap') {
    g.moveTo(250, 290);
    g.quadraticCurveTo(250, 120, 360, 60);
    g.quadraticCurveTo(350, 200, 330, 300);
  } else {
    g.moveTo(220, 320);
    g.quadraticCurveTo(300, 270, 360, 330);
    g.quadraticCurveTo(300, 380, 220, 320);
  }
  g.closePath();
  g.fill();
  g.stroke();
  return c;
};
