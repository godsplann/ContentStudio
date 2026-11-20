# Video studio: shared instructions for every theme

Read this file before making any video from this folder. It records what has been decided. If something new comes up that it does not cover, ask the owner instead of inventing it.

## First step for every new video: ask which theme

This folder makes more than one kind of video. Each kind is a **theme**, with its own file in `themes/`.

1. **Ask the owner which theme the video is for**, listing the themes in the table in `themes/README.md` (today: General education, Indian mythology, Undercover) and offering "a new theme". Ask even when the topic makes the answer look obvious. Skip the question only if the owner has already named the theme in this chat.
2. **Read that theme's file** (`themes/<theme-id>.md`). It sets the channel, topics, language, tone, cast, narrator, caption font, world and sound.
3. **Where the theme file and this file differ, the theme file wins.** Everything the theme file does not mention comes from this file.
4. For a new theme, follow "Adding a theme" in `themes/README.md`.

A theme changes only those few things. The rest of this file is shared by all themes, so that as much as possible is reused.

## The style: toon-3D story shorts (decided 16 November 2026)

The owner chose this style, based on three sample videos from another channel. **The full notes are in `reference/toon-3d-style.md`: read them before building a video.**

In short:

- **Characters:** flat, inked 2D drawings that always face the camera, inside a fully lit and textured 3D world. They cast real silhouette shadows and take a tint from the scene light. What they wear and who they are comes from the theme.
- **World:** dense, detailed 3D places with a fresh palette for each scene. Hero props are richer than the characters. Signs are readable.
- **Camera:** it never rests. A slow push-in on every held shot, glides between nearby places, a few whips, aerials, macro inserts on props, point-of-view shots. Shot sizes change constantly.
- **Light:** strong and directional. A warm low sun with a blue sky fill and long shadows; warm lamp pools indoors; cool blue nights with warm lamps; bloom on anything that glows; haze with distance; soft background blur in close-ups. Everything touches the ground with a shadow.
- **Motion:** poses and expressions change in a few frames, on the spoken word. Every sentence is shown literally. Something small always moves (dust, leaves, smoke, flags).
- **Nothing over the picture** except captions: no logo, header pills, cards or boxes.

## Channel signatures (18 November 2026)

The owner wants each channel to be told apart at a glance while keeping the shared toon-3D look. Each theme has a `look` in `studio/src/themes.ts` (sticker outline on figures, colour grade, grain, wash, vignette), drawn by `studio/src/shared/finish.tsx` (`themed()`, `<Graded>`, `<Finish>`), plus its own caption lettering. The 3D world is never flattened by a channel finish.

- **Undercover: storybook print** (decided): cream sticker outline, Bebas Neue captions with a gold key word, paper grain and warm wash, coral place-and-year stencil. Details in `themes/undercover.md`.
- **Mind Matter: clean lab** (proposed, not yet confirmed): crisp cool grade, thin ink, no grain, teal chalk lines drawn in the world, Space Grotesk captions.
- **Epic Mythology: painted epic** (proposed, not yet confirmed): warm golden grade, soft vignette, gold dust, rim glow on divine figures, maroon caption outline.

## Structure of every video

1. Frame 0 is already the action. No title card or intro.
2. The first sentence states a surprising result or question; the rest explains why.
3. One idea per sentence and one picture per sentence.
4. The ending returns to the opening image or lands a final point.

## Captions

- One or two words at a time, each on screen about as long as it is spoken.
- White with a solid black outline. No box, no shadow.
- Centred, with the caption's middle about 70 % of the way down the frame.
- Each caption pops in over a few frames.
- Sentence case with the script's own punctuation.
- **The font comes from the theme** (`captions` in `studio/src/themes.ts`).

## Video format

- 1080 x 1920 vertical, 30 fps, H.264, AAC audio. Length as the owner asks (the GPU video was 24 seconds).
- Keep the bottom 350 px and the right-hand 140 px free of important content; the apps cover them with buttons.

## How videos are built

- **`reference/workflow.md` lists the steps from idea to finished file**, where rendering happens, and the ElevenLabs steps for voice and word timings. Follow it.
- In `studio/`: **Three.js** (through React Three Fiber and `@remotion/three`) draws the 3D scenes; **Remotion** adds captions and audio and renders the video. `studio/README.md` explains the commands.
- Drive all motion from the frame number so renders are repeatable.
- **Shared code, used by every theme, is in `studio/src/shared/`:** character drawing and surfaces (`toon.ts`), flat characters with shadows and crowds (`flat.tsx`), captions (`WordCaptions.tsx`). Improve these in place; never copy them into a video's folder.
- **Theme settings are in `studio/src/themes.ts`** (language, narrator, caption and sign fonts). Keep it in step with the theme files.
- `studio/src/gpu/` ("What is a GPU?", general theme, 16 November 2026) is the working example of a video: shot list, camera keys, worlds, word timings. Build new worlds, characters and shots for each topic.

## Voice and sound

- **The narrator comes from the theme.** Voices are from ElevenLabs.
- Music and sound effects are made in code (`studio/scripts/make_bed.py`). No licensed or copyrighted music.
- Keep the GPU video's mix, which the owner approved: voice on top, bed at 0.3, loudness -14 LUFS (command in `reference/workflow.md`).

## Things to avoid

- Copying the samples' characters, stories, jokes, signs or colour choices. Learn the technique only.
- Templated videos that differ only in the words. Each video needs visuals built for its topic; this also matters for YouTube's rule against mass-produced content.
- Logos or mascots of other companies. Naming a product in the script is fine; keep the visuals generic.
- Unchecked facts or numbers. Check every claim in the script before generating the voice.
- Mixing themes: one theme's channel name, logo, narrator or cast never appears in another theme's video.
