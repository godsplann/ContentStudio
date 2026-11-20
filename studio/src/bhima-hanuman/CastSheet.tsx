// Sheet of the figures proposed for "Bhima and the old monkey" (Vana Parva 146-150), for the owner's approval.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAST, drawMythic} from '../shared/mythic';
import {drawOldMonkeyLying} from '../shared/epic';

type Item = {label: string; draw: () => HTMLCanvasElement; w: number; h: number};

const ROW1: Item[] = [
  {label: 'भीम', draw: () => drawMythic(CAST.bhima.look, 'hold', 'stern'), w: 400, h: 800},
  {label: 'भीम: पूँछ उठाते', draw: () => drawMythic(CAST.bhima.look, 'lift', 'strain'), w: 400, h: 800},
  {label: 'भीम: विनती', draw: () => drawMythic(CAST.bhima.look, 'namaste', 'awe'), w: 400, h: 800},
  {label: 'द्रौपदी', draw: () => drawMythic(CAST.draupadi.look, 'hold', 'happy'), w: 340, h: 680},
  {label: 'हनुमान: असली रूप', draw: () => drawMythic(CAST.hanumanDivine.look, 'bless', 'happy'), w: 400, h: 800},
];
const ROW2: Item[] = [
  {label: 'बूढ़ा बंदर (हनुमान)', draw: () => drawOldMonkeyLying('calm', true), w: 1000, h: 500},
  {label: 'बूढ़ा बंदर: मुस्कान', draw: () => drawOldMonkeyLying('happy', true), w: 1000, h: 500},
];

const Row: React.FC<{items: Item[]; height: number}> = ({items, height}) => (
  <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 30, height}}>
    {items.map((it, i) => (
      <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <img src={it.draw().toDataURL()} style={{width: it.w, height: it.h}} />
        <div style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 44, color: '#fff', WebkitTextStroke: '8px #17121a', paintOrder: 'stroke fill', marginTop: 8, height: 60}}>{it.label}</div>
      </div>
    ))}
  </div>
);

export const BhimaCastSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#3b1245, #7a1f3d 70%, #e8612f)', padding: 30, gap: 30}}>
    <Row items={ROW1} height={900} />
    <Row items={ROW2} height={600} />
  </AbsoluteFill>
);
