import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {FONT_FAMILY} from './theme';

// Fonts are loaded from public/fonts so renders work offline.
export const fontsReady = Promise.all([
  loadFont({family: FONT_FAMILY, url: staticFile('fonts/SpaceGrotesk-Medium.woff'), weight: '500'}),
  loadFont({family: FONT_FAMILY, url: staticFile('fonts/SpaceGrotesk-Bold.woff'), weight: '700'}),
  // Hindi (Devanagari) captions and signs for the Indian mythology theme.
  loadFont({family: 'Poppins', url: staticFile('fonts/Poppins-Bold.ttf'), weight: '700'}),
  // Undercover captions and in-world stencils.
  loadFont({family: 'Bebas Neue', url: staticFile('fonts/BebasNeue-Regular.ttf'), weight: '400'}),
]);
