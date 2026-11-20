// Sheet of the figures added for "Khar-Dushan" (Ram against the 14,000), for the owner's approval.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAST, drawMythic} from '../shared/mythic';
import {drawFallen, drawTrishira} from '../shared/epic';

type Item = {label: string; draw: () => HTMLCanvasElement; w: number; h: number};

const ROW1: Item[] = [
  {label: 'शूर्पणखा', draw: () => drawMythic(CAST.shurpanakha.look, 'grab', 'stern'), w: 330, h: 660},
  {label: 'खर', draw: () => drawMythic(CAST.khara.look, 'hold', 'roar'), w: 380, h: 760},
  {label: 'दूषण', draw: () => drawMythic(CAST.dushana.look, 'hold', 'stern'), w: 360, h: 720},
  {label: 'त्रिशिरा', draw: () => drawTrishira('hold', 'stern'), w: 700, h: 752},
  {label: 'श्रीराम: बाण', draw: () => drawMythic(CAST.ram.look, 'shoot', 'stern'), w: 330, h: 660},
];
const ROW2: Item[] = [
  {label: 'राक्षस सेना', draw: () => drawMythic(CAST.rakshasaA.look, 'hold', 'roar'), w: 300, h: 600},
  {label: '', draw: () => drawMythic(CAST.rakshasaB.look, 'hold', 'roar'), w: 300, h: 600},
  {label: '', draw: () => drawMythic(CAST.rakshasaC.look, 'hold', 'roar'), w: 300, h: 600},
  {label: 'गिरे हुए राक्षस', draw: () => drawFallen(() => drawMythic(CAST.rakshasaB.look, 'stand', 'sad')), w: 600, h: 300},
];

const Row: React.FC<{items: Item[]; height: number}> = ({items, height}) => (
  <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 20, height}}>
    {items.map((it, i) => (
      <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <img src={it.draw().toDataURL()} style={{width: it.w, height: it.h}} />
        <div style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 44, color: '#fff', WebkitTextStroke: '8px #17121a', paintOrder: 'stroke fill', marginTop: 8, height: 60}}>{it.label}</div>
      </div>
    ))}
  </div>
);

export const KharDushanCastSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#3b1245, #7a1f3d 70%, #e8612f)', padding: 30, gap: 30}}>
    <Row items={ROW1} height={860} />
    <Row items={ROW2} height={700} />
  </AbsoluteFill>
);
