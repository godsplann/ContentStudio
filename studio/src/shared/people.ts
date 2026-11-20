// More outfits for the toon figure, plus non-human cast drawn in the same inked style.
// drawPerson keeps the standard 512 x 1024 figure (same head and face as toon.ts) and swaps the clothes,
// headwear and arms, so any video can dress a new cast without new code. Also: a free-radical spark
// creature, a lab mouse, and a sign board drawer for readable signs inside the 3D world.
import * as THREE from 'three';
import {dot, drawHead, Expr, FONT, INK, stick, toTexture} from './toon';

export type Top = 'hoodie' | 'labcoat' | 'bare' | 'scrubs' | 'shirt' | 'check' | 'coat' | 'jumper';
export type Headwear = 'none' | 'hair' | 'bun' | 'beanie' | 'straw' | 'cap' | 'peaked' | 'watch' | 'helmet' | 'beret';
export type Carry = 'none' | 'case' | 'tablet' | 'clipboard' | 'glowstick' | 'teacup' | 'oar' | 'binoculars' | 'crate' | 'bottle' | 'cigs' | 'tins' | 'papers' | 'brush';
export type PersonPose = 'stand' | 'sit' | 'point' | 'hold' | 'carry' | 'lookUp' | 'armsUp' | 'shrug' | 'reach';

export type PersonLook = {
  top: Top;
  color: string; // main clothing colour (shirt, hoodie, shorts for 'bare', the shirt under a lab coat)
  dark: string; // its shade
  head?: Headwear;
  headColor?: string;
  headDark?: string;
  glasses?: boolean;
  stethoscope?: boolean;
  label?: string;
  carry?: Carry;
  beard?: string; // beard and moustache colour (sea captains, old sailors)
  moustache?: string; // a moustache alone, in this colour
  crown?: string; // crown colour of a 'peaked' cap (white by default, as for ship's officers)
  stars?: number; // a general's stars on the headwear (1 to 3)
};

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  return {c, g};
};

const outline = (g: CanvasRenderingContext2D, w = 12) => {
  g.lineWidth = w;
  g.strokeStyle = INK;
  g.stroke();
};

// A rounded body block with a darker right side and a soft highlight, like the overalls in toon.ts.
const bodyBlock = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, dark: string) => {
  g.fillStyle = fill;
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = dark;
  g.fillRect(x + w * 0.7, y - 10, w * 0.4, h + 20);
  g.fillStyle = 'rgba(255,255,255,0.18)';
  g.fillRect(x + 16, y + 10, 16, h * 0.75);
  g.restore();
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  outline(g);
};

const carried = (g: CanvasRenderingContext2D, what: Carry, x: number, y: number) => {
  g.lineWidth = 10;
  g.strokeStyle = INK;
  if (what === 'case') {
    // a camera case with a lens window
    g.fillStyle = '#3a3f4c';
    g.beginPath();
    g.roundRect(x - 92, y - 40, 184, 110, 16);
    g.fill();
    g.stroke();
    g.fillStyle = '#1b1e26';
    g.beginPath();
    g.arc(x + 30, y + 15, 30, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    dot(g, x + 22, y + 6, 8, '#8fb7ff');
    g.fillStyle = '#c8ccd6';
    g.fillRect(x - 70, y - 26, 50, 14);
  } else if (what === 'tablet') {
    g.fillStyle = '#20242e';
    g.beginPath();
    g.roundRect(x - 70, y - 54, 140, 100, 12);
    g.fill();
    g.stroke();
    const grd = g.createLinearGradient(x - 60, y, x + 60, y);
    grd.addColorStop(0, '#3ddc97');
    grd.addColorStop(0.6, '#ffe066');
    grd.addColorStop(1, '#ff7a45');
    g.fillStyle = grd;
    g.fillRect(x - 58, y - 42, 116, 76);
  } else if (what === 'clipboard') {
    g.fillStyle = '#c98b4b';
    g.beginPath();
    g.roundRect(x - 58, y - 70, 116, 150, 10);
    g.fill();
    g.stroke();
    g.fillStyle = '#fbfaf4';
    g.fillRect(x - 44, y - 50, 88, 116);
    g.strokeStyle = 'rgba(40,40,60,0.5)';
    g.lineWidth = 5;
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.moveTo(x - 34, y - 30 + i * 20);
      g.lineTo(x + 30, y - 30 + i * 20);
      g.stroke();
    }
  } else if (what === 'teacup') {
    // a cup and saucer with steam
    g.fillStyle = '#f7f3ea';
    g.beginPath();
    g.ellipse(x, y + 24, 54, 12, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(x - 36, y - 26);
    g.lineTo(x + 36, y - 26);
    g.quadraticCurveTo(x + 32, y + 22, x, y + 22);
    g.quadraticCurveTo(x - 32, y + 22, x - 36, y - 26);
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(x + 42, y - 6, 14, -1.2, 1.4);
    g.stroke();
    g.fillStyle = '#2f6fb0';
    g.fillRect(x - 30, y - 10, 60, 8);
    g.strokeStyle = 'rgba(255,255,255,0.8)';
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(x - 10, y - 40);
    g.quadraticCurveTo(x - 24, y - 60, x - 8, y - 80);
    g.moveTo(x + 12, y - 44);
    g.quadraticCurveTo(x - 2, y - 66, x + 14, y - 88);
    g.stroke();
  } else if (what === 'oar') {
    g.save();
    g.translate(x, y);
    g.rotate(0.35);
    g.fillStyle = '#c9915a';
    g.beginPath();
    g.roundRect(-9, -330, 18, 520, 9);
    g.fill();
    g.stroke();
    g.beginPath();
    g.roundRect(-30, 150, 60, 170, 26);
    g.fill();
    g.stroke();
    g.restore();
  } else if (what === 'crate') {
    // a wooden ammunition crate with corner battens and a stencil (Wojtek, 19 November 2026)
    g.fillStyle = '#9a7240';
    g.beginPath();
    g.rect(x - 120, y - 70, 240, 140);
    g.fill();
    g.fillStyle = '#7a5630';
    g.fillRect(x - 120, y - 70, 18, 140);
    g.fillRect(x + 102, y - 70, 18, 140);
    g.strokeStyle = 'rgba(60,36,16,0.55)';
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(x - 120, y - 23);
    g.lineTo(x + 120, y - 23);
    g.moveTo(x - 120, y + 23);
    g.lineTo(x + 120, y + 23);
    g.stroke();
    g.lineWidth = 10;
    g.strokeStyle = INK;
    g.strokeRect(x - 120, y - 70, 240, 140);
  } else if (what === 'bottle') {
    // a brown beer bottle
    g.fillStyle = '#6b3e18';
    g.beginPath();
    g.roundRect(x - 20, y - 70, 40, 100, 10);
    g.roundRect(x - 8, y - 110, 16, 44, 5);
    g.fill();
    g.stroke();
    g.fillStyle = '#e9dcb8';
    g.fillRect(x - 18, y - 40, 36, 30);
  } else if (what === 'cigs') {
    // an open cigarette packet held out
    g.fillStyle = '#f2ece0';
    g.fillRect(x - 34, y - 50, 68, 90);
    g.fillStyle = '#c0392b';
    g.fillRect(x - 34, y - 20, 68, 26);
    g.strokeRect(x - 34, y - 50, 68, 90);
    for (const dx of [-16, 0, 16]) {
      g.fillStyle = '#f7f3ea';
      g.fillRect(x + dx - 5, y - 74, 10, 26);
      g.strokeRect(x + dx - 5, y - 74, 10, 26);
    }
  } else if (what === 'tins') {
    // two food tins
    for (const dx of [-36, 36]) {
      g.fillStyle = '#b8bec4';
      g.beginPath();
      g.roundRect(x + dx - 32, y - 40, 64, 80, 8);
      g.fill();
      g.stroke();
      g.fillStyle = '#c94a2a';
      g.fillRect(x + dx - 30, y - 18, 60, 30);
    }
  } else if (what === 'papers') {
    // a sheet of paper held up
    g.fillStyle = '#f6f0de';
    g.beginPath();
    g.rect(x - 60, y - 90, 120, 160);
    g.fill();
    g.stroke();
    g.strokeStyle = 'rgba(40,40,60,0.5)';
    g.lineWidth = 5;
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.moveTo(x - 40, y - 60 + i * 26);
      g.lineTo(x + 40, y - 60 + i * 26);
      g.stroke();
    }
  } else if (what === 'brush') {
    // a paintbrush with a wet red tip, held up
    g.save();
    g.translate(x, y);
    g.rotate(-0.6);
    g.fillStyle = '#c9915a';
    g.beginPath();
    g.roundRect(-9, -20, 18, 150, 8);
    g.fill();
    g.stroke();
    g.fillStyle = '#b8bcc4';
    g.fillRect(-11, -46, 22, 30);
    g.strokeRect(-11, -46, 22, 30);
    g.fillStyle = '#d8402c';
    g.beginPath();
    g.moveTo(-11, -46);
    g.quadraticCurveTo(-12, -86, 0, -100);
    g.quadraticCurveTo(12, -86, 11, -46);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  } else if (what === 'binoculars') {
    g.fillStyle = '#2a2d36';
    for (const sx of [-30, 30]) {
      g.beginPath();
      g.roundRect(x + sx - 24, y - 40, 48, 80, 14);
      g.fill();
      g.stroke();
    }
    g.fillRect(x - 10, y - 16, 20, 24);
  } else if (what === 'glowstick') {
    g.save();
    g.translate(x, y);
    g.rotate(-0.5);
    g.fillStyle = '#b6ff7a';
    g.beginPath();
    g.roundRect(-14, -110, 28, 220, 14);
    g.fill();
    g.lineWidth = 8;
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fillRect(-6, -96, 6, 190);
    g.restore();
  }
};

export const drawPerson = (look: PersonLook, pose: PersonPose, expr: Expr): HTMLCanvasElement => {
  const {c, g} = canvas(512, 1024);
  const sit = pose === 'sit';
  if (sit) g.translate(0, 100);

  // Legs and feet
  if (sit) {
    stick(g, [[228, 660], [186, 728], [194, 885]], 14);
    stick(g, [[284, 660], [326, 728], [318, 885]], 14);
    stick(g, [[194, 885], [158, 892]], 14);
    stick(g, [[318, 885], [354, 892]], 14);
  } else {
    stick(g, [[228, 660], [222, 820], [214, 985]], 14);
    stick(g, [[284, 660], [290, 820], [298, 985]], 14);
    stick(g, [[214, 985], [178, 992]], 14);
    stick(g, [[298, 985], [334, 992]], 14);
  }

  // Hood behind the head
  if (look.top === 'hoodie') {
    g.fillStyle = look.dark;
    g.beginPath();
    g.ellipse(256, 420, 150, 64, 0, 0, Math.PI * 2);
    g.fill();
    outline(g, 10);
  }

  // Arms
  const L = [198, 492];
  const R = [314, 492];
  const arm = (s: number[], h: number[], bend: number) => {
    stick(g, [s, [(s[0] + h[0]) / 2 + bend, (s[1] + h[1]) / 2], h], 12);
    dot(g, h[0], h[1], 16);
  };
  let hands: number[][] = [];
  if (pose === 'stand' || pose === 'lookUp' || pose === 'sit') hands = [[168, sit ? 640 : 650], [344, sit ? 640 : 650]];
  else if (pose === 'point') hands = [[168, 650], [436, 352]];
  else if (pose === 'hold') hands = [[236, 572], [278, 560]];
  else if (pose === 'carry') hands = [[196, 600], [316, 600]];
  else if (pose === 'armsUp') hands = [[132, 196], [380, 196]];
  else if (pose === 'shrug') hands = [[118, 500], [394, 500]];
  else if (pose === 'reach') hands = [[168, 650], [450, 520]];
  const bends = pose === 'hold' ? [-40, 40] : pose === 'armsUp' ? [-36, 36] : pose === 'shrug' ? [24, -24] : [-18, 18];
  // arms that cross in front of the body are drawn after the clothes
  const front = pose === 'hold' || pose === 'carry';
  const drawArms = () => {
    arm(L, hands[0], bends[0]);
    arm(R, hands[1], bends[1]);
    if (pose === 'point') stick(g, [[436, 352], [462, 322]], 10);
  };
  if (!front) drawArms();

  // Clothes
  const top = look.top;
  if (top === 'labcoat') {
    bodyBlock(g, 176, 440, 160, 360, 62, '#f2f4f7', '#d6dce6');
    // shirt in the V and lapels
    g.fillStyle = look.color;
    g.beginPath();
    g.moveTo(222, 446);
    g.lineTo(256, 540);
    g.lineTo(290, 446);
    g.closePath();
    g.fill();
    g.lineWidth = 8;
    g.strokeStyle = INK;
    g.beginPath();
    g.moveTo(214, 448);
    g.lineTo(256, 560);
    g.lineTo(298, 448);
    g.moveTo(256, 560);
    g.lineTo(256, 796);
    g.stroke();
    // pocket and pen
    g.lineWidth = 6;
    g.strokeRect(272, 596, 42, 40);
    g.fillStyle = '#1d6fe0';
    g.fillRect(286, 576, 8, 30);
    dot(g, 238, 620, 7);
    dot(g, 238, 680, 7);
  } else if (top === 'coat') {
    // a long double-breasted officer's coat with brass buttons
    bodyBlock(g, 176, 440, 160, 340, 58, look.color, look.dark);
    g.lineWidth = 8;
    g.strokeStyle = INK;
    g.beginPath();
    g.moveTo(214, 448);
    g.lineTo(256, 520);
    g.lineTo(298, 448);
    g.moveTo(256, 520);
    g.lineTo(256, 776);
    g.stroke();
    g.fillStyle = '#f2f4f7';
    g.beginPath();
    g.moveTo(228, 450);
    g.lineTo(256, 506);
    g.lineTo(284, 450);
    g.closePath();
    g.fill();
    for (const yy of [560, 620, 680]) {
      dot(g, 226, yy, 10, '#f2c14e');
      dot(g, 286, yy, 10, '#f2c14e');
    }
    g.lineWidth = 6;
    g.strokeStyle = '#f2c14e';
    g.beginPath();
    g.moveTo(184, 740);
    g.lineTo(220, 740);
    g.moveTo(292, 740);
    g.lineTo(328, 740);
    g.stroke();
  } else if (top === 'jumper') {
    // a sailor's knitted jumper with a roll neck and rib stripes, dark trousers
    bodyBlock(g, 184, 440, 144, 250, 66, look.color, look.dark);
    g.save();
    g.beginPath();
    g.roundRect(184, 440, 144, 250, 66);
    g.clip();
    g.fillStyle = 'rgba(255,255,255,0.22)';
    for (let y = 520; y < 700; y += 34) g.fillRect(170, y, 180, 10);
    g.fillStyle = '#2b2f3c';
    g.fillRect(170, 640, 180, 70);
    g.restore();
    g.fillStyle = look.dark;
    g.beginPath();
    g.roundRect(208, 430, 96, 36, 16);
    g.fill();
    g.lineWidth = 8;
    g.strokeStyle = INK;
    g.stroke();
    g.beginPath();
    g.roundRect(184, 440, 144, 250, 66);
    outline(g);
  } else if (top === 'bare') {
    bodyBlock(g, 184, 440, 144, 250, 66, '#f7f1e8', 'rgba(176,160,214,0.55)');
    // shorts
    g.save();
    g.beginPath();
    g.roundRect(184, 440, 144, 250, 66);
    g.clip();
    g.fillStyle = look.color;
    g.fillRect(170, 612, 180, 90);
    g.fillStyle = look.dark;
    g.fillRect(290, 612, 60, 90);
    g.restore();
    g.lineWidth = 8;
    g.strokeStyle = INK;
    g.beginPath();
    g.moveTo(186, 612);
    g.lineTo(326, 612);
    g.stroke();
    g.beginPath();
    g.roundRect(184, 440, 144, 250, 66);
    outline(g);
    dot(g, 256, 580, 5);
  } else {
    const fill = top === 'check' ? look.color : look.color;
    bodyBlock(g, 184, 440, 144, 250, 66, fill, look.dark);
    g.save();
    g.beginPath();
    g.roundRect(184, 440, 144, 250, 66);
    g.clip();
    if (top === 'check') {
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 8;
      for (let x = 170; x < 340; x += 30) {
        g.beginPath();
        g.moveTo(x, 430);
        g.lineTo(x, 700);
        g.stroke();
      }
      for (let y = 450; y < 700; y += 30) {
        g.beginPath();
        g.moveTo(170, y);
        g.lineTo(340, y);
        g.stroke();
      }
    }
    if (top === 'hoodie') {
      g.fillStyle = look.dark;
      g.beginPath();
      g.roundRect(210, 588, 92, 56, 18);
      g.fill();
      g.lineWidth = 6;
      g.strokeStyle = INK;
      g.stroke();
    }
    g.restore();
    if (top === 'hoodie') {
      stick(g, [[236, 452], [232, 512]], 6);
      stick(g, [[276, 452], [280, 512]], 6);
      dot(g, 232, 516, 7, '#ffffff');
      dot(g, 280, 516, 7, '#ffffff');
    }
    if (top === 'scrubs' || top === 'check') {
      g.lineWidth = 8;
      g.strokeStyle = INK;
      g.beginPath();
      g.moveTo(222, 446);
      g.lineTo(256, 500);
      g.lineTo(290, 446);
      g.stroke();
    }
    if (top === 'scrubs') {
      g.lineWidth = 6;
      g.strokeRect(274, 590, 38, 36);
    }
  }
  if (look.stethoscope) {
    g.strokeStyle = '#2b2f3a';
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(210, 452);
    g.quadraticCurveTo(204, 560, 250, 600);
    g.moveTo(302, 452);
    g.quadraticCurveTo(306, 540, 262, 600);
    g.stroke();
    dot(g, 256, 612, 18, '#c8ccd6');
    g.lineWidth = 6;
    g.beginPath();
    g.arc(256, 612, 18, 0, Math.PI * 2);
    g.stroke();
  }
  if (look.label) {
    const size = look.label.length > 5 ? 26 : 40;
    g.font = `700 ${size}px "${FONT}"`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineWidth = 7;
    g.strokeStyle = INK;
    g.strokeText(look.label, 256, 560);
    g.fillStyle = '#ffffff';
    g.fillText(look.label, 256, 560);
  }
  if (front) drawArms();
  if (look.carry && look.carry !== 'none') {
    const at = pose === 'carry' ? [256, 600] : pose === 'hold' ? [256, 560] : pose === 'point' ? [168, 650] : pose === 'armsUp' ? [380, 150] : pose === 'shrug' ? [394, 470] : [344, 650];
    carried(g, look.carry, at[0], at[1]);
    // hands over the object
    if (pose === 'carry') {
      dot(g, 196, 600, 16);
      dot(g, 316, 600, 16);
    } else if (pose === 'hold') {
      dot(g, 236, 572, 16);
      dot(g, 278, 560, 16);
    }
  }

  // Head and face
  const hx = 256;
  const hy = pose === 'lookUp' ? 288 : 300;
  drawHead(g, hx, hy, expr, pose === 'lookUp');
  const ey = hy + (pose === 'lookUp' ? -18 : 6);
  if (look.glasses) {
    g.lineWidth = 8;
    g.strokeStyle = INK;
    for (const sx of [hx - 50, hx + 50]) {
      g.beginPath();
      g.arc(sx, ey, 36, 0, Math.PI * 2);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(hx - 14, ey - 4);
    g.quadraticCurveTo(hx, ey - 14, hx + 14, ey - 4);
    g.moveTo(hx - 86, ey - 6);
    g.lineTo(hx - 146, ey - 20);
    g.moveTo(hx + 86, ey - 6);
    g.lineTo(hx + 146, ey - 20);
    g.stroke();
  }

  // Headwear
  const hc = look.headColor ?? '#2b2a3a';
  const hd = look.headDark ?? '#1b1a26';
  const head = look.head ?? 'none';
  g.lineWidth = 12;
  g.strokeStyle = INK;
  if (head === 'hair' || head === 'bun') {
    g.save();
    g.beginPath();
    g.ellipse(hx, hy, 150, 136, 0, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = hc;
    g.beginPath();
    g.moveTo(hx - 160, hy - 10);
    g.quadraticCurveTo(hx - 120, hy - 120, hx, hy - 96);
    g.quadraticCurveTo(hx + 110, hy - 120, hx + 160, hy - 20);
    g.lineTo(hx + 160, hy - 160);
    g.lineTo(hx - 160, hy - 160);
    g.closePath();
    g.fill();
    g.fillStyle = hd;
    g.beginPath();
    g.ellipse(hx + 100, hy - 110, 70, 60, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.beginPath();
    g.ellipse(hx, hy, 150, 136, 0, Math.PI * 1.06, Math.PI * 1.94);
    g.stroke();
    if (head === 'bun') {
      g.fillStyle = hc;
      g.beginPath();
      g.arc(hx + 10, hy - 158, 46, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
  } else if (head === 'beanie') {
    g.save();
    g.beginPath();
    g.rect(60, 40, 400, hy - 70 - 40);
    g.clip();
    g.fillStyle = hc;
    g.beginPath();
    g.ellipse(hx, hy - 60, 156, 126, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = hd;
    g.beginPath();
    g.ellipse(hx + 96, hy - 60, 80, 126, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.beginPath();
    g.ellipse(hx, hy - 60, 156, 126, 0, Math.PI, Math.PI * 2);
    g.stroke();
    g.fillStyle = hd;
    g.beginPath();
    g.roundRect(hx - 162, hy - 92, 324, 44, 18);
    g.fill();
    g.stroke();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(hx, hy - 196, 30, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  } else if (head === 'straw') {
    g.fillStyle = hc;
    g.beginPath();
    g.ellipse(hx, hy - 96, 216, 38, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(hx - 110, hy - 100);
    g.quadraticCurveTo(hx - 104, hy - 216, hx, hy - 216);
    g.quadraticCurveTo(hx + 104, hy - 216, hx + 110, hy - 100);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = '#c0392b';
    g.fillRect(hx - 106, hy - 132, 212, 22);
    g.strokeStyle = 'rgba(120,80,20,0.45)';
    g.lineWidth = 4;
    for (let x = hx - 190; x < hx + 200; x += 26) {
      g.beginPath();
      g.moveTo(x, hy - 112);
      g.lineTo(x + 12, hy - 82);
      g.stroke();
    }
  } else if (head === 'cap') {
    g.save();
    g.beginPath();
    g.rect(60, 40, 400, hy - 80 - 40);
    g.clip();
    g.fillStyle = hc;
    g.beginPath();
    g.ellipse(hx, hy - 80, 150, 112, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.beginPath();
    g.ellipse(hx, hy - 80, 150, 112, 0, Math.PI, Math.PI * 2);
    g.stroke();
    g.fillStyle = hd;
    g.beginPath();
    g.ellipse(hx + 90, hy - 84, 120, 26, -0.08, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  } else if (head === 'peaked') {
    // a peaked cap: white crown (or look.crown), dark band, black peak, gold badge
    g.fillStyle = look.crown ?? '#f7f6f1';
    g.beginPath();
    g.ellipse(hx, hy - 150, 176, 46, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = hc;
    g.beginPath();
    g.roundRect(hx - 132, hy - 150, 264, 62, 14);
    g.fill();
    g.stroke();
    g.fillStyle = hd;
    g.beginPath();
    g.moveTo(hx - 120, hy - 92);
    g.quadraticCurveTo(hx, hy - 44, hx + 120, hy - 92);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = '#f2c14e';
    g.beginPath();
    g.ellipse(hx, hy - 120, 26, 20, 0, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 6;
    g.stroke();
  } else if (head === 'watch') {
    // a knitted watch cap with a turned-up cuff, no pompom
    g.save();
    g.beginPath();
    g.rect(60, 40, 400, hy - 70 - 40);
    g.clip();
    g.fillStyle = hc;
    g.beginPath();
    g.ellipse(hx, hy - 60, 154, 118, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.beginPath();
    g.ellipse(hx, hy - 60, 154, 118, 0, Math.PI, Math.PI * 2);
    g.stroke();
    g.fillStyle = hd;
    g.beginPath();
    g.roundRect(hx - 160, hy - 96, 320, 48, 18);
    g.fill();
    g.stroke();
  } else if (head === 'helmet') {
    // a round steel army helmet: a deep dome with a wide rim and a chin strap
    g.fillStyle = hc;
    g.beginPath();
    g.moveTo(hx - 178, hy - 58);
    g.bezierCurveTo(hx - 176, hy - 250, hx + 176, hy - 250, hx + 178, hy - 58);
    g.closePath();
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = hd;
    g.beginPath();
    g.ellipse(hx + 120, hy - 140, 90, 120, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.22)';
    g.beginPath();
    g.ellipse(hx - 70, hy - 175, 50, 20, -0.4, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.beginPath();
    g.moveTo(hx - 178, hy - 58);
    g.bezierCurveTo(hx - 176, hy - 250, hx + 176, hy - 250, hx + 178, hy - 58);
    g.closePath();
    g.stroke();
    g.fillStyle = hd;
    g.beginPath();
    g.roundRect(hx - 196, hy - 74, 392, 30, 15);
    g.fill();
    g.stroke();
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(hx - 150, hy - 50);
    g.quadraticCurveTo(hx - 150, hy + 110, hx, hy + 128);
    g.stroke();
  } else if (head === 'beret') {
    // a soft beret pulled to one side, with a little stalk on top
    g.fillStyle = hc;
    g.beginPath();
    g.ellipse(hx + 24, hy - 112, 182, 62, 0.1, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = hd;
    g.beginPath();
    g.ellipse(hx + 120, hy - 96, 120, 60, 0.1, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.beginPath();
    g.ellipse(hx + 24, hy - 112, 182, 62, 0.1, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = hd;
    g.beginPath();
    g.roundRect(hx - 130, hy - 86, 260, 26, 13);
    g.fill();
    g.stroke();
    stick(g, [[hx + 30, hy - 172], [hx + 36, hy - 198]], 12);
  }
  if (look.stars) {
    // silver stars across the front of the headwear
    const n = look.stars;
    const sy = head === 'peaked' ? hy - 120 : head === 'helmet' ? hy - 150 : hy - 110;
    for (let i = 0; i < n; i++) {
      const sx = hx + (i - (n - 1) / 2) * 62;
      g.fillStyle = '#eef0f4';
      g.beginPath();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 ? 11 : 27;
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
      g.lineWidth = 5;
      g.strokeStyle = INK;
      g.stroke();
    }
  }
  if (look.moustache && !look.beard) {
    g.fillStyle = look.moustache;
    g.beginPath();
    g.moveTo(hx, hy + 40);
    g.quadraticCurveTo(hx - 44, hy + 22, hx - 80, hy + 54);
    g.quadraticCurveTo(hx - 36, hy + 66, hx, hy + 50);
    g.quadraticCurveTo(hx + 36, hy + 66, hx + 80, hy + 54);
    g.quadraticCurveTo(hx + 44, hy + 22, hx, hy + 40);
    g.fill();
    g.lineWidth = 7;
    g.strokeStyle = INK;
    g.stroke();
  }
  if (look.beard) drawBeard(g, hx, hy, look.beard, expr);
  return c;
};

// A full beard and moustache drawn over the lower face, leaving the mouth readable.
const drawBeard = (g: CanvasRenderingContext2D, hx: number, hy: number, color: string, expr: Expr) => {
  g.save();
  g.beginPath();
  g.ellipse(hx, hy, 150, 136, 0, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(hx - 152, hy + 10);
  g.quadraticCurveTo(hx - 120, hy + 150, hx, hy + 150);
  g.quadraticCurveTo(hx + 120, hy + 150, hx + 152, hy + 10);
  g.lineTo(hx + 104, hy + 30);
  g.quadraticCurveTo(hx, hy + 70, hx - 104, hy + 30);
  g.closePath();
  g.fill();
  g.restore();
  // the beard hangs a little below the chin
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(hx - 110, hy + 90);
  g.quadraticCurveTo(hx - 70, hy + 186, hx, hy + 192);
  g.quadraticCurveTo(hx + 70, hy + 186, hx + 110, hy + 90);
  g.closePath();
  g.fill();
  g.lineWidth = 10;
  g.strokeStyle = INK;
  g.stroke();
  // moustache
  g.beginPath();
  g.moveTo(hx, hy + 38);
  g.quadraticCurveTo(hx - 40, hy + 26, hx - 70, hy + 52);
  g.quadraticCurveTo(hx - 34, hy + 60, hx, hy + 46);
  g.quadraticCurveTo(hx + 34, hy + 60, hx + 70, hy + 52);
  g.quadraticCurveTo(hx + 40, hy + 26, hx, hy + 38);
  g.fill();
  g.lineWidth = 7;
  g.stroke();
  // mouth line inside the beard
  g.strokeStyle = INK;
  g.lineWidth = 9;
  g.beginPath();
  if (expr === 'happy') g.arc(hx, hy + 62, 26, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (expr === 'awe') g.ellipse(hx, hy + 80, 14, 20, 0, 0, Math.PI * 2);
  else {
    g.moveTo(hx - 20, hy + 76);
    g.lineTo(hx + 20, hy + 76);
  }
  g.stroke();
};

// ---------- A sailor lying flat on his front, hiding: wide drawing (PRONE_ASPECT) ----------
export const PRONE_ASPECT = 2.5;
// Cheeks puffed out ('hold' = holding his breath) or eyes wide ('peek').
export const drawProne = (look: PersonLook, expr: 'hold' | 'peek'): HTMLCanvasElement => {
  const {c, g} = canvas(1280, 512);
  // legs and boots trailing off to the right
  stick(g, [[760, 400], [980, 410], [1150, 418]], 16);
  stick(g, [[760, 430], [980, 452], [1140, 460]], 16);
  g.fillStyle = '#2a2420';
  for (const [x, y] of [[1160, 418], [1150, 462]]) {
    g.beginPath();
    g.ellipse(x, y, 34, 20, 0, 0, Math.PI * 2);
    g.fill();
    outline(g, 8);
  }
  // body, flat along the deck
  g.fillStyle = look.color;
  g.beginPath();
  g.roundRect(440, 352, 380, 120, 56);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = look.dark;
  g.fillRect(440, 440, 380, 40);
  g.fillStyle = 'rgba(255,255,255,0.2)';
  for (let x = 500; x < 820; x += 40) g.fillRect(x, 352, 10, 120);
  g.restore();
  g.beginPath();
  g.roundRect(440, 352, 380, 120, 56);
  outline(g);
  // arms tucked forward, hands flat on the deck
  stick(g, [[470, 420], [400, 470], [330, 476]], 14);
  dot(g, 322, 476, 18);
  // head resting low, looking at the camera
  const hx = 300;
  const hy = 330;
  g.save();
  g.beginPath();
  g.ellipse(hx, hy, 150, 136, 0, 0, Math.PI * 2);
  g.fillStyle = '#fbf8f2';
  g.fill();
  g.clip();
  g.fillStyle = 'rgba(176,160,214,0.38)';
  g.beginPath();
  g.ellipse(hx + 70, hy + 60, 150, 130, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.lineWidth = 12;
  g.strokeStyle = INK;
  g.beginPath();
  g.ellipse(hx, hy, 150, 136, 0, 0, Math.PI * 2);
  g.stroke();
  const ey = hy - 4;
  if (expr === 'hold') {
    // squeezed eyes and puffed cheeks
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(hx - 70, ey - 6);
    g.lineTo(hx - 34, ey + 4);
    g.moveTo(hx + 70, ey - 6);
    g.lineTo(hx + 34, ey + 4);
    g.stroke();
    g.fillStyle = 'rgba(255,120,140,0.5)';
    g.beginPath();
    g.ellipse(hx - 84, ey + 52, 40, 30, 0, 0, Math.PI * 2);
    g.ellipse(hx + 84, ey + 52, 40, 30, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(hx - 14, ey + 62);
    g.lineTo(hx + 14, ey + 62);
    g.stroke();
  } else {
    for (const sx of [hx - 50, hx + 50]) {
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(sx, ey, 28, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 8;
      g.stroke();
      dot(g, sx - 8, ey + 4, 11);
    }
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(hx - 16, ey + 62);
    g.lineTo(hx + 16, ey + 62);
    g.stroke();
  }
  // watch cap
  g.fillStyle = look.headColor ?? '#2b2a3a';
  g.beginPath();
  g.ellipse(hx, hy - 70, 154, 92, 0, Math.PI, Math.PI * 2);
  g.fill();
  g.lineWidth = 12;
  g.stroke();
  g.fillStyle = look.headDark ?? '#1b1a26';
  g.beginPath();
  g.roundRect(hx - 160, hy - 100, 320, 44, 18);
  g.fill();
  g.stroke();
  return c;
};

// ---------- A free radical: a jittery spiky spark with one lone electron ----------
export type RadicalPose = 'wild' | 'crash';
export const drawRadical = (pose: RadicalPose = 'wild'): HTMLCanvasElement => {
  const {c, g} = canvas(512, 512);
  const cx = 256;
  const cy = 286;
  const sx = pose === 'crash' ? 1.18 : 1;
  const sy = pose === 'crash' ? 0.82 : 1;
  // legs
  stick(g, [[cx - 50, cy + 100 * sy], [cx - 70, 486]], 12);
  stick(g, [[cx + 50, cy + 100 * sy], [cx + 70, 486]], 12);
  stick(g, [[cx - 70, 486], [cx - 100, 490]], 12);
  stick(g, [[cx + 70, 486], [cx + 100, 490]], 12);
  // arms flailing
  stick(g, [[cx - 120, cy - 10], [cx - 190, cy - 60], [cx - 210, cy - 130]], 12);
  stick(g, [[cx + 120, cy], [cx + 200, cy + 30], [cx + 226, cy - 30]], 12);
  dot(g, cx - 210, cy - 130, 15);
  dot(g, cx + 226, cy - 30, 15);
  // spiky body
  const n = 13;
  g.beginPath();
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? 112 : 168 + (i % 4 === 0 ? 10 : -6);
    const x = cx + Math.cos(a) * r * sx;
    const y = cy + Math.sin(a) * r * sy;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  const grd = g.createRadialGradient(cx - 40, cy - 50, 10, cx, cy, 170);
  grd.addColorStop(0, '#ffd166');
  grd.addColorStop(0.45, '#ff7a3c');
  grd.addColorStop(1, '#e8343a');
  g.fillStyle = grd;
  g.fill();
  g.lineWidth = 12;
  g.strokeStyle = INK;
  g.stroke();
  // face: one big eye, one small, a wild grin
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(cx - 46, cy - 24, 34, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = 8;
  g.stroke();
  g.beginPath();
  g.arc(cx + 44, cy - 16, 22, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  dot(g, cx - 38, cy - 20, 12);
  dot(g, cx + 48, cy - 12, 8);
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(cx - 64, cy - 70);
  g.lineTo(cx - 20, cy - 56);
  g.moveTo(cx + 26, cy - 50);
  g.lineTo(cx + 66, cy - 62);
  g.stroke();
  g.fillStyle = INK;
  g.beginPath();
  if (pose === 'crash') g.ellipse(cx, cy + 46, 30, 22, 0, 0, Math.PI * 2);
  else {
    g.moveTo(cx - 52, cy + 30);
    g.quadraticCurveTo(cx, cy + 92, cx + 56, cy + 26);
    g.closePath();
  }
  g.fill();
  if (pose !== 'crash') {
    g.fillStyle = '#ffffff';
    g.fillRect(cx - 30, cy + 34, 16, 14);
    g.fillRect(cx + 8, cy + 36, 16, 14);
  }
  // the lone electron, with a bit of orbit
  g.strokeStyle = 'rgba(120,230,255,0.9)';
  g.lineWidth = 6;
  g.setLineDash([14, 12]);
  g.beginPath();
  g.ellipse(cx + 40, cy - 40, 200, 150, -0.4, -1.3, 0.2);
  g.stroke();
  g.setLineDash([]);
  dot(g, 418, 90, 24, '#7fe8ff');
  g.lineWidth = 7;
  g.strokeStyle = INK;
  g.beginPath();
  g.arc(418, 90, 24, 0, Math.PI * 2);
  g.stroke();
  return c;
};

// ---------- A lab mouse, side on (aspect 2) ----------
export const MOUSE_ASPECT = 2;
export const drawMouse = (pose: 'sniff' | 'curl' = 'sniff'): HTMLCanvasElement => {
  const {c, g} = canvas(1024, 512);
  const fur = '#f8f5f0';
  const shade = 'rgba(176,160,214,0.4)';
  g.lineWidth = 12;
  g.strokeStyle = INK;
  if (pose === 'sniff') {
    // tail
    g.strokeStyle = '#f0a3b4';
    g.lineWidth = 16;
    g.beginPath();
    g.moveTo(280, 380);
    g.bezierCurveTo(160, 420, 120, 300, 40, 330);
    g.stroke();
    g.strokeStyle = INK;
    g.lineWidth = 6;
    g.stroke();
    // feet
    for (const x of [380, 470, 640, 720]) {
      g.fillStyle = '#f0a3b4';
      g.beginPath();
      g.ellipse(x, 470, 30, 14, 0, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 6;
      g.stroke();
    }
    // body
    g.fillStyle = fur;
    g.beginPath();
    g.ellipse(520, 340, 270, 140, 0, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = shade;
    g.beginPath();
    g.ellipse(560, 440, 300, 110, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.lineWidth = 12;
    g.beginPath();
    g.ellipse(520, 340, 270, 140, 0, 0, Math.PI * 2);
    g.stroke();
    // head
    g.fillStyle = fur;
    g.beginPath();
    g.moveTo(700, 220);
    g.quadraticCurveTo(900, 230, 960, 330);
    g.quadraticCurveTo(880, 400, 720, 400);
    g.closePath();
    g.fill();
    g.stroke();
    // ear
    g.fillStyle = fur;
    g.beginPath();
    g.ellipse(740, 190, 70, 76, -0.3, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = '#f7b6c4';
    g.beginPath();
    g.ellipse(744, 196, 42, 48, -0.3, 0, Math.PI * 2);
    g.fill();
    // eye, nose, whiskers
    dot(g, 840, 285, 13);
    dot(g, 845, 280, 4, '#ffffff');
    dot(g, 962, 330, 16, '#f07890');
    g.lineWidth = 4;
    g.beginPath();
    for (const [dx, dy] of [[70, -30], [80, 0], [70, 30]]) {
      g.moveTo(940, 334);
      g.lineTo(940 + dx, 334 + dy);
    }
    g.stroke();
  } else {
    // curled up asleep: a round body, tail wrapped round the front
    g.fillStyle = fur;
    g.beginPath();
    g.ellipse(512, 350, 240, 150, 0, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = shade;
    g.beginPath();
    g.ellipse(560, 450, 280, 110, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.lineWidth = 12;
    g.beginPath();
    g.ellipse(512, 350, 240, 150, 0, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = fur;
    g.beginPath();
    g.ellipse(640, 300, 70, 76, -0.2, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = '#f7b6c4';
    g.beginPath();
    g.ellipse(642, 304, 42, 46, -0.2, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 8;
    g.beginPath();
    g.arc(700, 400, 18, 0.1 * Math.PI, 0.9 * Math.PI);
    g.stroke();
    dot(g, 770, 420, 13, '#f07890');
    g.strokeStyle = '#f0a3b4';
    g.lineWidth = 16;
    g.beginPath();
    g.moveTo(290, 420);
    g.bezierCurveTo(330, 520, 640, 520, 760, 470);
    g.stroke();
    g.strokeStyle = INK;
    g.lineWidth = 6;
    g.stroke();
  }
  return c;
};

// ---------- Sign boards ----------
export type SignLine = {text: string; size: number; y: number; color?: string; weight?: 500 | 700};
const signCache = new Map<string, THREE.Texture>();
// A board with lines of text (y from 0 to 1). `extra` can draw more (arrows, bars) before the text.
export const boardTexture = (
  key: string,
  w: number,
  h: number,
  bg: string,
  lines: SignLine[],
  opts: {border?: string; radius?: number; extra?: (g: CanvasRenderingContext2D) => void} = {},
) => {
  let t = signCache.get(key);
  if (t) return t;
  const {c, g} = canvas(w, h);
  const r = opts.radius ?? 36;
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect(0, 0, w, h, r);
  g.fill();
  if (opts.border !== 'none') {
    g.strokeStyle = opts.border ?? INK;
    g.lineWidth = 20;
    g.beginPath();
    g.roundRect(10, 10, w - 20, h - 20, r - 6);
    g.stroke();
  }
  opts.extra?.(g);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (const l of lines) {
    g.fillStyle = l.color ?? INK;
    g.font = `${l.weight ?? 700} ${l.size}px "${FONT}"`;
    g.fillText(l.text, w / 2, l.y * h);
  }
  t = toTexture(c);
  signCache.set(key, t);
  return t;
};
