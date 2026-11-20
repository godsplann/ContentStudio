// The new cast on one sheet, for the owner to see before the video is built.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFontsLoaded} from '../shared/camera';
import {drawMouse, drawPerson, drawRadical, PersonLook, PersonPose} from '../shared/people';
import type {Expr} from '../shared/toon';
import {LOOKS, Who} from './cast';

const ROW: [Who, PersonPose, Expr, string][] = [
  ['you', 'sit', 'calm', 'You (viewer)'],
  ['you', 'hold', 'awe', ''],
  ['haru', 'carry', 'focused', 'Photographer, Japan'],
  ['v1', 'sit', 'calm', 'Volunteers'],
  ['v2', 'sit', 'calm', ''],
  ['v3', 'sit', 'happy', ''],
  ['v4', 'sit', 'calm', ''],
  ['v5', 'sit', 'awe', ''],
  ['maya', 'point', 'happy', 'Scientist, Canada'],
  ['doc', 'hold', 'focused', 'Doctor'],
  ['patient', 'sit', 'calm', 'Patient'],
  ['farmer', 'hold', 'happy', 'Farmer'],
  ['fat', 'shrug', 'awe', 'Fat molecule'],
  ['protein', 'stand', 'strain', 'Protein'],
];

export const GlowCastSheet: React.FC = () => {
  const ready = useFontsLoaded();
  if (!ready) return null;
  const imgs = ROW.map(([w, p, e]) => drawPerson(LOOKS[w] as PersonLook, p, e).toDataURL());
  return (
    <AbsoluteFill style={{background: '#1d2433', flexDirection: 'row', flexWrap: 'wrap', padding: 30, gap: 10}}>
      {ROW.map(([, , , name], i) => (
        <div key={i} style={{width: 240, textAlign: 'center', color: 'white', fontFamily: 'Space Grotesk', fontSize: 22}}>
          <img src={imgs[i]} style={{width: 240, height: 480}} />
          <div>{name}</div>
        </div>
      ))}
      <div style={{width: 300, textAlign: 'center', color: 'white', fontFamily: 'Space Grotesk', fontSize: 22}}>
        <img src={drawRadical('wild').toDataURL()} style={{width: 300, height: 300}} />
        <div>Free radical</div>
      </div>
      <div style={{width: 300, textAlign: 'center', color: 'white', fontFamily: 'Space Grotesk', fontSize: 22}}>
        <img src={drawRadical('crash').toDataURL()} style={{width: 300, height: 300}} />
      </div>
      <div style={{width: 480, textAlign: 'center', color: 'white', fontFamily: 'Space Grotesk', fontSize: 22}}>
        <img src={drawMouse('sniff').toDataURL()} style={{width: 480, height: 240}} />
        <div>Mouse</div>
      </div>
      <div style={{width: 480, textAlign: 'center', color: 'white', fontFamily: 'Space Grotesk', fontSize: 22}}>
        <img src={drawMouse('curl').toDataURL()} style={{width: 480, height: 240}} />
      </div>
    </AbsoluteFill>
  );
};
