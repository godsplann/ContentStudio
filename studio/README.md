# Content Studio: 3D video renderer

Three.js draws the 3D scenes; Remotion adds captions and audio and renders the video.

## First-time setup (once, on your Mac)

You need Node.js 18 or newer (`node -v` to check). Then, in Terminal:

```bash
cd ~/Documents/"Content Studio"/studio
npm install
```

## Everyday commands

| Command | What it does |
|---|---|
| `npm run studio` | Opens Remotion Studio in your browser: live preview, scrub the timeline, edit and see changes at once |
| `npm run render` | Renders the `WhatIsGPU` video to `out/what-is-a-gpu.mp4` (needs the voice file, see below) |
| `npx remotion render <CompositionId> out/<name>.mp4` | Renders any other composition |

The first render downloads a headless browser, which takes a minute.

## What is where

| Path | Purpose |
|---|---|
| `src/Root.tsx` | The list of videos. Add one `<Composition>` per video |
| `src/gpu/` | The first toon-3D video, "What is a GPU?". The working example of the style |
| `src/gpu/WhatIsGPU.tsx` | Shot list and camera keys, the two worlds, captions and audio |
| `src/shared/toon.ts` | Shared by all videos. Canvas-drawn characters (heads, hats, faces, poses), surfaces, signs and pixel pictures |
| `src/shared/flat.tsx` | Shared by all videos. Flat characters that face the camera and cast silhouette shadows; instanced crowds |
| `src/gpu/DeskWorld.tsx`, `src/gpu/BoardWorld.tsx` | The two places: a desk with a pixel monitor, and the inside of the computer |
| `src/shared/WordCaptions.tsx` | Shared by all videos. One- or two-word captions, white with a black outline; the font comes from the theme |
| `src/themes.ts` | The themes (General education, Indian mythology): language, narrator, caption and sign fonts |
| `src/gpu/words.ts` | Word timings of the narration, from ElevenLabs transcription |
| `scripts/make_bed.py` | Makes the music bed and sound effects in code (`python3 scripts/make_bed.py`, needs numpy) |
| `src/theme.ts` | Mind Matter brand colours, font and the video size (1080 x 1920, 30 fps) |
| `src/fonts.ts` | Loads Space Grotesk and Poppins (for Hindi) from `public/fonts` |
| `public/audio/` | Music and voice files. Reference them with `staticFile('audio/<file>')` |
| `remotion.config.ts` | Render settings, including the WebGL renderer Three.js needs |

## Making a new video

1. Choose the theme (see `../themes/`). Make a new folder `src/<topic>/` following the pattern of `src/gpu/`. Import `toon.ts`, `flat.tsx` and `WordCaptions.tsx` from `src/shared/` and pass the theme to the captions: `<WordCaptions words={words} theme={THEMES['indian-mythology']} />` (with no `theme`, captions use the general theme). Build new worlds, characters and shots for the topic.
2. Drive all motion from `useCurrentFrame()`, never from a clock, so each frame renders the same every time.
3. Put the narration in `public/audio/` and fill `words.ts` with its word timings (ElevenLabs transcription gives them).
4. Register it in `src/Root.tsx`, setting `durationInFrames` to the audio length in seconds times 30, plus a short tail.

The "What is a GPU?" composition expects `public/audio/what-is-a-gpu-voice.mp3` (the narration) and `public/audio/what-is-a-gpu-bed.wav` (the music bed). Without the voice file, render with `--props='{"audio":false}'`.

## Versions

Remotion 4.0.543 (all `@remotion/*` packages must stay on the same version), Three.js 0.187, React Three Fiber 9.8, React 19.

Remotion is free for individuals and very small teams; larger companies need a paid licence. See https://remotion.dev/license.
