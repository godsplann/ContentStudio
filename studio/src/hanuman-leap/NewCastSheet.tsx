// Sheet of the figures added for "Hanuman's leap", for the owner's approval.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAST, drawMythic, MythicExpr, MythicPose} from '../shared/mythic';

const ROWS: {key: string; label: string; pose?: MythicPose; expr?: MythicExpr; scale?: number}[] = [
  {key: 'jambavan', label: 'जाम्बवान'},
  {key: 'baalHanuman', label: 'बाल हनुमान', scale: 0.72},
  {key: 'vanaraA', label: 'वानर'},
  {key: 'vanaraB', label: 'वानर'},
  {key: 'vanaraC', label: 'वानर'},
  {key: 'hanuman', label: 'हनुमान: उदास', pose: 'stand', expr: 'sad'},
  {key: 'hanuman', label: 'हनुमान: छलाँग', pose: 'fly', expr: 'stern'},
  {key: 'hanuman', label: 'हनुमान: अंगूठी', pose: 'offer', expr: 'happy'},
];

export const NewCastSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#3b1245, #7a1f3d 70%, #e8612f)', flexDirection: 'row', flexWrap: 'wrap', padding: 40, gap: 0}}>
    {ROWS.map((r, i) => {
      const c = CAST[r.key];
      const url = drawMythic(c.look, r.pose ?? c.pose, r.expr ?? c.expr).toDataURL();
      return (
        <div key={i} style={{width: 380, height: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
          <img src={url} style={{width: 330 * (r.scale ?? 1), height: 660 * (r.scale ?? 1)}} />
          <div style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 40, color: '#fff', WebkitTextStroke: '8px #17121a', paintOrder: 'stroke fill', marginTop: 12}}>{r.label}</div>
        </div>
      );
    })}
  </AbsoluteFill>
);
