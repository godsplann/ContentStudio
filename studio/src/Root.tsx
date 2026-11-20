import React from 'react';
import {Composition} from 'remotion';
import {WhatIsGPU, whatIsGpuDuration} from './gpu/WhatIsGPU';
import {VIDEO} from './theme';
import {NewCastSheet} from './hanuman-leap/NewCastSheet';
import {HanumanLeap, hanumanLeapDuration} from './hanuman-leap/HanumanLeap';
import {JatayuCastSheet} from './jatayu/CastSheet';
import {Jatayu, jatayuDuration} from './jatayu/Jatayu';
import {JatayuStills, STILL_FRAMES} from './jatayu/Stills';
import {KharDushanCastSheet} from './khar-dushan/CastSheet';
import {BhimaCastSheet} from './bhima-hanuman/CastSheet';
import {BhimaHanuman, bhimaHanumanDuration, BhimaHanumanStills, STILL_FRAMES as BH_STILLS} from './bhima-hanuman/BhimaHanuman';
import {KharDushan, kharDushanDuration} from './khar-dushan/KharDushan';
import {KharDushanStills, STILL_FRAMES as KD_STILLS} from './khar-dushan/Stills';
import {GlowCastSheet} from './glow/CastSheet';
import {Glowing, glowingDuration} from './glow/Glowing';
import {GlowingStills, STILL_FRAMES as GLOW_STILLS} from './glow/Stills';
import {QShip, qShipDuration, QShipStills, STILL_FRAMES as QS_STILLS} from './q-ship/QShip';
import {Wojtek, wojtekDuration, WojtekStills, STILL_FRAMES as WJ_STILLS} from './wojtek/Wojtek';
import {GhostArmy, ghostArmyDuration, GhostArmyStills, STILL_FRAMES as GA_STILLS} from './ghost-army/GhostArmy';
import './fonts';

// Register one <Composition> per video. Each appears in Remotion Studio and can be rendered by id.
export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="WhatIsGPU"
        component={WhatIsGPU}
        durationInFrames={whatIsGpuDuration}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{audio: true}}
      />
      <Composition
        id="HanumanLeap"
        component={HanumanLeap}
        durationInFrames={hanumanLeapDuration}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{audio: true}}
      />
      <Composition
        id="Jatayu"
        component={Jatayu}
        durationInFrames={jatayuDuration}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{audio: true}}
      />
      <Composition id="JatayuStills" component={JatayuStills} durationInFrames={STILL_FRAMES.length} fps={30} width={1080} height={1920} />
      <Composition
        id="KharDushan"
        component={KharDushan}
        durationInFrames={kharDushanDuration}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{audio: true}}
      />
      <Composition id="KharDushanStills" component={KharDushanStills} durationInFrames={KD_STILLS.length} fps={30} width={1080} height={1920} />
      <Composition
        id="BhimaHanuman"
        component={BhimaHanuman}
        durationInFrames={bhimaHanumanDuration}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{audio: true}}
      />
      <Composition id="BhimaHanumanStills" component={BhimaHanumanStills} durationInFrames={BH_STILLS.length} fps={30} width={1080} height={1920} />
      <Composition id="BhimaCast" component={BhimaCastSheet} durationInFrames={1} fps={30} width={2300} height={1640} />
      <Composition id="KharDushanCast" component={KharDushanCastSheet} durationInFrames={1} fps={30} width={3200} height={1680} />
      <Composition id="JatayuCast" component={JatayuCastSheet} durationInFrames={1} fps={30} width={3200} height={1640} />
      <Composition id="HanumanLeapCast" component={NewCastSheet} durationInFrames={1} fps={30} width={1600} height={1880} />
      <Composition
        id="Glowing"
        component={Glowing}
        durationInFrames={glowingDuration}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{audio: true}}
      />
      <Composition id="GlowingStills" component={GlowingStills} durationInFrames={GLOW_STILLS.length} fps={30} width={1080} height={1920} />
      <Composition
        id="QShip"
        component={QShip}
        durationInFrames={qShipDuration}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{audio: true}}
      />
      <Composition id="QShipStills" component={QShipStills} durationInFrames={QS_STILLS.length} fps={30} width={1080} height={1920} />
      <Composition
        id="Wojtek"
        component={Wojtek}
        durationInFrames={wojtekDuration}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{audio: true}}
      />
      <Composition id="WojtekStills" component={WojtekStills} durationInFrames={WJ_STILLS.length} fps={30} width={1080} height={1920} />
      <Composition
        id="GhostArmy"
        component={GhostArmy}
        durationInFrames={ghostArmyDuration}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{audio: true}}
      />
      <Composition id="GhostArmyStills" component={GhostArmyStills} durationInFrames={GA_STILLS.length} fps={30} width={1080} height={1920} />
      <Composition id="GlowCast" component={GlowCastSheet} durationInFrames={1} fps={30} width={2200} height={1500} />
    </>
  );
};
