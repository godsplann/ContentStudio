// Sheet of the figures added for "Jatayu", for the owner's approval.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAST, drawMythic} from '../shared/mythic';
import {drawDonkey, drawJatayu, drawRavana} from '../shared/epic';

type Item = {label: string; draw: () => HTMLCanvasElement; w: number; h: number};

const ROW1: Item[] = [
  {label: 'रावण', draw: () => drawRavana('hold', 'stern'), w: 800, h: 750},
  {label: 'रावण: वार', draw: () => drawRavana('raise', 'stern'), w: 800, h: 750},
  {label: 'रावण: सीता हरण', draw: () => drawRavana('grab', 'stern'), w: 800, h: 750},
  {label: 'लक्ष्मण', draw: () => drawMythic(CAST.lakshman.look, 'hold', 'calm'), w: 330, h: 660},
];
const ROW2: Item[] = [
  {label: 'जटायु', draw: () => drawJatayu('perch', 'calm'), w: 560, h: 560},
  {label: 'जटायु: उड़ान', draw: () => drawJatayu('fly', 'calm'), w: 560, h: 560},
  {label: 'जटायु: हमला', draw: () => drawJatayu('attack', 'stern'), w: 560, h: 560},
  {label: 'जटायु: घायल', draw: () => drawJatayu('wounded', 'weak'), w: 560, h: 560},
  {label: 'रथ के गधे', draw: () => drawDonkey(0), w: 560, h: 420},
];

const Row: React.FC<{items: Item[]; height: number}> = ({items, height}) => (
  <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 20, height}}>
    {items.map((it, i) => (
      <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <img src={it.draw().toDataURL()} style={{width: it.w, height: it.h}} />
        <div style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 44, color: '#fff', WebkitTextStroke: '8px #17121a', paintOrder: 'stroke fill', marginTop: 8}}>{it.label}</div>
      </div>
    ))}
  </div>
);

export const JatayuCastSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#3b1245, #7a1f3d 70%, #e8612f)', padding: 30, gap: 30}}>
    <Row items={ROW1} height={860} />
    <Row items={ROW2} height={660} />
  </AbsoluteFill>
);
