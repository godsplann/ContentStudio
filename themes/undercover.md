# Theme: Undercover

Set up on 18 November 2026. First video: "The ship nobody sank" (Q-ships), built 18 November 2026 in `studio/src/q-ship/`, 71 s, 992 credits for the voice. Second video: "The Soldier Who Ate His Cigarettes" (Wojtek), built 19 November 2026 in `studio/src/wojtek/`, 65 s, 845 credits. Third video: "Why Four Soldiers Could Lift a Tank" (the Ghost Army), built 20 November 2026 in `studio/src/ghost-army/`, 62.5 s, the first told as a mystery (a strange act first, the reason held back until the end). Scripts ready in `videos/undercover/`, not voiced yet: the Emu War, Headless Mike and Violet Jessop (written in the earlier formula), and the 1904 Olympic marathon. Points marked **(proposed)** are Claude's starting suggestions still to be confirmed by the owner.

- **Theme id:** `undercover` (in `studio/src/themes.ts`)
- **Channel:** **Undercover**, a separate channel from Mind Matter and Epic Mythology (name given by the owner, 18 November 2026). Never put another channel's name, logo, narrator or cast in these videos.
- **Topics:** little-known trivia and random true stories that are highly engaging: odd history, strange coincidences, forgotten inventions, hidden details in everyday things.
- **Language:** English, for narration and captions (decided 18 November 2026).
- **Genre and tone:** short, hooky stories with a twist (decided 18 November 2026). "Undercover" means what is hidden under the surface of everyday history and science, **not** spies, detectives or suspense. Curious, fun and lively, like a friend who can't wait to tell you this one; every claim true. No fake "you won't believe" hype, no clickbait the video does not pay off, no emoji.

## Cast (proposed)

A new cast for each video, as in the general theme, using the shared figures (`studio/src/shared/toon.ts`, `people.ts`). Real historical people are drawn as generic figures with one identifying feature (era clothing, a prop), never as caricatures.

## Look: bright, curious toon-3D (decided 18 November 2026)

Same toon figures, technique and pipeline as every theme (`reference/toon-3d-style.md`). The owner first chose a dark noir twist, then asked for something moderate, then decided the channel is about hooky stories rather than suspense, so the noir look is dropped.

- **Light:** the shared warm, sunny rules, each story lit for its own place and time (a grey dawn sea, a sunny courtyard). Keep one small "reveal" touch per video: a warm pool of light or a soft glow on the moment the twist lands, echoing the logo.
- **Palette:** fresh per story, as in the general theme. The brand coral, cream and gold (below) are for channel art; use them in videos only for the place-and-year card.
- **Channel signature: "storybook print" (decided by the owner, 18 November 2026).** What tells Undercover apart from the other channels at a glance, set in `look` of `studio/src/themes.ts` and drawn by `studio/src/shared/finish.tsx`:
  - every flat figure has a **cream sticker outline** (`#fff8ea`, 16 px on the 512 px drawing): wrap drawings with `themed(THEMES.undercover, ...)` when caching sprites;
  - **captions in Bebas Neue**, larger (150 px), with **one gold key word per sentence** (`hl: true` in `words.ts`, colour `#ffd25e`);
  - a light **paper grain**, a warm wash and a soft vignette over the picture (`<Finish>`), and a gentle grade (`<Graded>`);
  - the **place-and-year stencil** in the brand coral on a crate or sign inside the world.
  - **The 3D world stays fully lit and textured, as in every theme.** The owner asked for this explicitly: no halftone or flat print effect on the world itself.
- **No** evidence boards, red string, "CLASSIFIED" stamps, fedoras or spy props unless the story itself needs them.

## Narrator

**Albert B. Squid** (ElevenLabs library voice "Albert B. Squid: High Energy", voice_id `f1w4R5zdOEHtIZfIaVFa`), chosen by the owner on 18 November 2026 from a shortlist, because he sounds excited. An upbeat, warm, slightly deep American radio-host voice. Use it for every Undercover video.

- Model: `eleven_v4`. One take only (see `reference/workflow.md`).
- Pace: measured at about **143 words a minute** (167 words took 70.1 s in the Q-ship video). Plan about 145 words for a 60-second video.
- His natural energy suits the curious, lively tone of the channel.

## Captions and signs

Bebas Neue (`brand/fonts/`, copied to `studio/public/fonts/`), 150 px, shared caption layout, one gold key word per sentence (see the channel signature above). Stencils and signs inside the world use Bebas Neue too.

## Sound

First bed: `studio/scripts/make_bed_q_ship.py` (112 bpm marimba plucks and soft bass, a hush for the reveal, a ticking pulse before the twist, a four-note chime on it). Music bed made in code: light, bouncy and curious (plucked strings or marimba, a soft pulse), building under the escalation and landing a bright "ta-da" chime on the twist. No licensed music.

## Script rules

### The story formula (owner asked for this on 18 November 2026)

Learned from the structure of the Ricks Clips Shorts (@RicksClips3000), studied on 18 November 2026. **Use the structure only: never copy their stories, jokes, characters or topics.**

0. **Always start with a hook (owner's reminder, 19 November 2026).** The first line is a one-sentence hook that states the surprise in the first 2-3 seconds ("Australia once went to war with birds. And lost.", "She survived the Titanic. It wasn't even her closest call."). Never make the viewer wait two or three sentences for the surprise. The strange action (step 1) comes right after the hook.
1. **Open on an action that makes no sense (0-5 s).** Frame 0 is someone in the middle of a strange or self-defeating act, stated flat: "He fired gold into his own mine." No intro, no "did you know". The viewer's "why would anyone do that?" carries the video.
2. **Place-and-year beat (5-8 s).** Instead of a stock link phrase, the narrator sets the scene with a place and a year ("North Atlantic, 1916."), then one sentence of stakes. The same place and year appear in the world (a stencil on a crate, a date on a newspaper). This is the channel's signature beat.
3. **A doubter voices the audience.** A sceptical side character (boss, buddy, official) mocks the plan with one funny line of dialogue. It raises the stakes of the payoff.
4. **Escalate in about three beats.** Each beat is a bit stranger or funnier than the last, and each is a concrete picture we can film.
5. **Name it as a reveal (around 40-45 s).** The real concept arrives as a quiet reveal in the narrator's own words, phrased fresh for each video ("The Navy had a name for these ships...", "Scientists still have a name for it..."). Explained in about 10 seconds.
6. **Ironic twist, cut off in the last seconds.** The ending turns on the hero or the doubter. Stop on the moment itself (the fuse reaching the powder) rather than after it, so the clip loops back into the opening.

### Make it easy to follow (owner feedback on the Q-ship video, 18 November 2026)

The owner found the first video hard to follow. Lessons, to apply to every Undercover script and shot plan:

- **One place, one hero, one thread.** Keep the story on the main location and the main character. Side trips (the torpedo room, a second U-boat shelling another ship) make viewers rebuild the scene each time. Use one only when the story can't be understood without it.
- **Tell it in order.** The opening can be the strange action, but then continue forward from it or label the jump back clearly. The Q-ship video opened on the abandonment, jumped back to "every morning" and then forward again.
- **Background explanation stays short.** Give the viewer only the one fact they need to get the twist (here: subs surface to save torpedoes), told on the main location, not in a separate scene.
- **Fewer, clearer shots.** Aim for about one shot per sentence (the first video had 31 shots in 71 s, plus whips). Hold a shot long enough to read it.
- **Characters big and readable.** Faces should fill a good part of the frame on the important lines. No wide shots where the cast are tiny, and no shots of bare hull or empty sea that don't show the sentence.
- **Show the twist object clearly from the start.** Plant it (the coop with hens) early and in the same framing as the reveal, so the payoff is instantly recognised.
- **Check before building:** read the shot plan as a viewer seeing it once, on a phone, with sound off. If a shot needs the caption to make sense, simplify it.

**Length and voice.** 55-65 seconds, about 160-170 words. Short sentences, mostly present tense, like a story told across a table. Characters are unnamed archetypes ("he", "his buddy", "the sheriff"), each with one identifying feature for the toon figure.

**Easy to follow on one listen** (owner's feedback on the Q-ship video, 18 November 2026: the words were not easily consumable). The viewer hears each line once, at speed, with one word on screen at a time.

- Short sentences: about 12 words at most, one idea each. Never chain cause and effect into one sentence ("X, so Y would rather Z with its W").
- Everyday words. Skip jargon, or say it plainly the first time ("its big gun on deck", not "its deck gun"). Introduce at most one new term per video: the reveal name.
- Spell out the logic the viewer needs, step by step: "Torpedoes were expensive. So a sub would rather come up and use its gun."
- Make it clear who is speaking: "the captain says". Avoid two quoted lines back to back with no speaker named.
- No piled-up lists of actions ("dropping oars, shouting, one man still holding his teacup"); pick the one funniest picture.
- Read-aloud test before generating the voice: could a 12-year-old retell the story after hearing it once?

**No stock phrases** (owner's decision, 18 November 2026). Never use "You see", "Well, it's called", "But here's the thing", "Turns out" or any other link phrase that would repeat across videos. Each script finds its own wording; check a new script against the last few before generating the voice.

**Titles.** "Why ___", "How ___ worked" or "The ___ that ___". Hint at the concept; never give away the twist.

### Facts

- The **concept is real and sourced**; the little story around it may be an invented illustration. Never present an invented scene, name or line of dialogue as a historical record. When the story is a real documented event, keep its facts as the sources give them.
- **Every factual claim is checked against at least two reliable sources** before the voice is generated, and the sources are listed in the video's `<video>.md`. Trivia online is full of myths: if a popular "fact" is false, skip it or make the debunking the story.
- Say "reportedly" or "according to" where sources disagree.
- One concept per video. No stories that mock private individuals or recent tragedies.

## Brand assets (channel art only)

Final direction chosen by the owner on 18 November 2026 (concept B, "the reveal", from `brand/undercover/logo-concepts.png`), replacing an earlier spy-in-a-fedora design. In `brand/undercover/`:

- `profile.png` (1000 x 1000): a serving dome lifted off a plate, with warm light and a gold question mark underneath and a few sparkles, on coral. Fits YouTube's circle crop.
- `banner.png` (2560 x 1440): the dome mark beside the wordmark UNDERCOVER (Bebas Neue, cream with a dark drop) and the line "Little-known stories. Big twists." (Space Grotesk Bold on a gold tag), on coral with soft light rays, floating sparkles and question marks. Mark, name and line sit inside the centre 1546 x 423 strip that phones show.
- `source/*.html`: the files they are drawn from; edit and re-render with headless Chrome at the same sizes.
- Colours: coral `#ffb184` / `#f4805c` / `#de5f45` (light centre to edge), cream `#fff8ea` and `#f4efe4`, gold `#ffd25e` to `#ffb43c`, light `#fff6c8`, ink outline `#14161c`.
- Fonts (in `brand/fonts/`, with licences): Bebas Neue (OFL) for the wordmark, Space Grotesk Bold for lines of text. Special Elite (Apache 2.0) is there from the earlier design and is no longer used. Video captions use Bebas Neue (see Captions and signs).

## Where the files go

- Code: `studio/src/<topic>/`
- Finished videos: `videos/undercover/`
