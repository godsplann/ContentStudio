// Video themes. A theme is the small set of things that differ between kinds of video:
// language, narrator and caption lettering here; cast and world rules in themes/<id>.md.
// Everything else (toon-3D technique, camera, captions layout, format, render, mix) is shared.
// Keep this file in sync with the theme files in the top-level themes/ folder.

export type ThemeId = 'general' | 'indian-mythology' | 'undercover';

export type Theme = {
  id: ThemeId;
  name: string;
  language: 'en' | 'hi';
  // ElevenLabs narrator. voiceId is null until the owner has picked one.
  voice: {name: string; voiceId: string | null; model: string};
  captions: {
    fontFamily: string;
    fontWeight: number;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    // colour for words marked hl in words.ts (one key word per sentence), if the theme uses it
    highlight?: string;
  };
  // Lettering for signs and labels drawn inside the 3D world.
  signFont: string;
  // The channel's signature finish on top of the shared toon-3D look (shared/finish.tsx).
  // Each channel gets its own so the three are told apart at a glance; the 3D world itself stays fully lit and textured.
  look: {
    // a coloured border cut around every flat figure, like a sticker (px on the 512-wide drawing)
    sticker?: {width: number; color: string};
    // CSS filter over the rendered 3D picture: a gentle colour grade
    grade?: string;
    // paper grain over the picture, 0 to 1
    grain?: number;
    // soft dark edge, CSS colour of the vignette or undefined
    vignette?: string;
    // a warm tint laid over the picture (multiply), CSS colour with alpha
    wash?: string;
  };
};

export const THEMES: Record<ThemeId, Theme> = {
  general: {
    id: 'general',
    name: 'General education (Mind Matter)',
    language: 'en',
    voice: {name: 'Brian', voiceId: 'nPczCjzI2devNBz1zQrb', model: 'eleven_v4'},
    captions: {fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 96, lineHeight: 1.1, letterSpacing: -1},
    signFont: 'Space Grotesk',
    look: {},
  },
  'indian-mythology': {
    id: 'indian-mythology',
    name: 'Indian mythology (Hindi)',
    language: 'hi',
    voice: {name: 'Shardul K', voiceId: '6EphsklDopDQ6eRkwNHT', model: 'eleven_v4'},
    // Poppins covers Devanagari. Letter spacing must stay 0: tightening it breaks Hindi conjuncts.
    captions: {fontFamily: 'Poppins', fontWeight: 700, fontSize: 92, lineHeight: 1.3, letterSpacing: 0},
    signFont: 'Poppins',
    look: {},
  },
  undercover: {
    id: 'undercover',
    name: 'Undercover (trivia and true stories)',
    language: 'en',
    voice: {name: 'Albert B. Squid', voiceId: 'f1w4R5zdOEHtIZfIaVFa', model: 'eleven_v4'},
    // Storybook-print signature (owner, 18 November 2026): Bebas Neue captions with a gold key word,
    // cream sticker outline on the figures, light paper grain and a warm wash. The 3D world stays as in every theme.
    captions: {fontFamily: 'Bebas Neue', fontWeight: 400, fontSize: 150, lineHeight: 1.0, letterSpacing: 2, highlight: '#ffd25e'},
    signFont: 'Bebas Neue',
    look: {
      sticker: {width: 16, color: '#fff8ea'},
      grade: 'saturate(1.06) contrast(1.04) sepia(0.06)',
      grain: 0.5,
      vignette: 'rgba(40,22,14,0.32)',
      wash: 'rgba(255,214,170,0.10)',
    },
  },
};

export const DEFAULT_THEME: Theme = THEMES.general;
