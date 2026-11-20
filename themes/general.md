# Theme: General education

- **Theme id:** `general` (in `studio/src/themes.ts`)
- **Channel:** Mind Matter, on YouTube Shorts, Instagram Reels and Facebook.
- **Topics:** technology, science and "how things work". First video: "What is a GPU?". Second: "You are glowing right now" (17 November 2026, about 1:50, code in `studio/src/glow/`).
- **Language:** English only (decided 16 November 2026).
- **Tone:** calm, clear and credible. No hype words ("viral", "hacks", "secrets"), no clickbait, no emoji.

## Cast

**A new cast for each video** (decided 16 November 2026). There are no recurring characters or mascots: design fresh characters that fit each topic, as the GPU video did with its CPU and GPU workers.

Use the drawing in `studio/src/shared/toon.ts`: white egg head, ink outline, stick limbs, and one or two identity features such as a hat or a labelled suit. Vary outfits, colours and roles per topic.

## Narrator

**Brian** (ElevenLabs "Brian - Deep, Resonant and Comforting", voice_id `nPczCjzI2devNBz1zQrb`, model `eleven_v4`), decided 16 November 2026. About 160 words a minute.

## Captions and signs

Space Grotesk Bold, sentence case. Signs inside the world use Space Grotesk too.

## World and light

A fresh palette for each scene, chosen for the topic. No fixed colours.

## Sound

Music bed and effects made in code (`studio/scripts/make_bed.py`): soft pad chords with effects timed to the words.

## Brand assets (channel art only)

- **Current channel art is in `brand/mind-matter/`**, made on 16 November 2026 after the owner said they did not like the earlier profile picture and banner. Shown to the owner; not yet confirmed as final.
  - `profile.png` (1000 x 1000): an inked yellow light bulb whose filament is an **M**, with a tilted teal orbit ring and one teal particle, on navy.
  - `banner.png` (2560 x 1440, YouTube size): six toon workers either side of the name, a yellow disc, a teal orbit arc, gears and stars on navy, with the line "Big ideas, made simple". Everything important sits in the centre 1546 x 423 strip that phones show.
- The earlier logo files are still in `logo/` (a white M with a yellow orbit ring). The owner disliked the profile picture and banner made from that look, so do not use them for new channel art unless the owner asks.
- Brand colours are in `brand/colors.json` (navy, yellow, teal). They apply to channel art, not to video scenes.

## Where the files go

- Code: `studio/src/<topic>/` (the example is `studio/src/gpu/`).
- Finished videos: `videos/`.
