# Theme: Indian mythology

Set up on 16 November 2026. First video: "हनुमान की छलाँग" (Hanuman's leap, Valmiki Ramayana), built 16 November 2026 in `studio/src/hanuman-leap/`. Second: "जटायु" (Jatayu's last stand, Valmiki Aranya Kanda), built 17 November 2026 in `studio/src/jatayu/`, 114 s, 2,502 credits for the voice. Third: "जब अकेले श्रीराम के सामने आई 14,000 राक्षसों की सेना!" (Khara, Dushana and the 14,000, Valmiki Aranya Kanda 17-30), built 17 November 2026 in `studio/src/khar-dushan/`, 126 s, 2,982 credits for two takes plus 165 for the transcription. Points marked **(proposed)** are Claude's starting suggestions still to be confirmed by the owner.

- **Theme id:** `indian-mythology` (in `studio/src/themes.ts`)
- **Channel:** **Epic Mythology**, a separate channel from Mind Matter (name given by the owner, 16 November 2026). Never put the Mind Matter name or logo on these videos.
- **Topics:** stories from Indian mythology: the Ramayana, the Mahabharata, the Puranas and related tales.
- **Language:** Hindi, for both the narration and the captions (decided 16 November 2026). Write the script in Devanagari.
- **Tone (proposed):** a respectful storyteller. Warm and vivid, never mocking. No hype words, no clickbait, no emoji.

## Cast

**Same toon figures, new costumes** (decided 16 November 2026): keep the flat inked figure from `studio/src/shared/toon.ts` (large round head, stick limbs, ink outline, simple face) and change what it wears and carries.

**The costume kit is in `studio/src/shared/mythic.ts`:** `drawMythic(look, pose, expr)` draws a figure, and `CAST` holds the six figures the owner approved on 16 November 2026: Ram, Sita, Hanuman, Krishna, Shiv and a Rishi (sage). They are listed in `themes/indian-mythology-cast.md` and pictured in `themes/indian-mythology-cast.png`. Use them as they are. The code passes the type check, but the figures have only been drawn on a flat sheet, not yet placed in a 3D scene (use `drawMythic` where `flat.tsx` uses `drawCharacter`).

What the kit covers so far: mukut crown, tiara, peacock feather, jata topknot, long and short hair, tilak marks, blue and natural skin tones, dhoti, short dhoti, sari, robe, tiger skin, chest cloth, gold necklace, beads, garland, earrings, halo, bow and quiver, mace, trident, flute, water pot, monkey face with ears and tail, beard, third eye, crescent, snake. Poses: stand, namaste, bless, hold, flute. Expressions: calm, happy, stern.

Added for Khar-Dushan (approved by the owner 17 November 2026, `themes/khar-dushan-new-cast.png`): Shurpanakha, Khara, Dushana, Trishira (three heads, `drawTrishira` in `epic.ts`), three rakshasa soldiers, fallen figures (`drawFallen`), Ram's bow-drawing pose `shoot`, the `roar` expression, and the looks `fangs`, `horns` and `hairBack: 'wild'`. Since added: Ravana with ten heads (two arms, to stay readable), armour, a sword, Jatayu, donkeys, poses `raise` and `grab` (see `indian-mythology-cast.md`). Not drawn yet: many arms, Garuda, Nandi, sitting and kneeling. The full list the kit should cover in time:

- **Head:** crowns (mukut), turbans, topknots and matted hair (jata), long hair, a peacock feather; tilak and other forehead marks.
- **Skin tones:** a range of natural tones, plus the traditional blue for figures such as Krishna, Rama, Vishnu and Shiva.
- **Clothes:** dhoti, angavastram (shoulder cloth), sari, bark cloth for forest exile, armour for warriors.
- **Ornaments:** earrings, necklaces, armlets, garlands.
- **Things held:** bow and arrows, mace, flute, trident, discus, conch, lotus, sword.
- **Extras:** a halo or soft glow for divine figures, more than two arms or heads where a figure needs them, animal figures (Hanuman and the vanaras, Garuda, Nandi).
- **New poses** as stories need them: folded hands (namaste), blessing, drawing a bow, seated in meditation, kneeling.

**Recurring figures keep one design** (the owner chose to keep the approved cast, 16 November 2026). Unlike the general theme, the same figures return in many stories: reuse the approved designs, and add each new figure to `themes/indian-mythology-cast.md` and `mythic.ts` once the owner approves it.

**Respect (proposed).** Deities and revered figures are drawn with dignity. The slapstick physics of the general theme (people flattened, flipped or squashed) is never applied to them; keep comedy for ordinary bystanders. Follow well-known traditional iconography so viewers recognise each figure. These must be original drawings, not copies of any film, television serial, comic or other channel.

## Narrator

**Shardul K** (ElevenLabs "Shardul K - Hindu Mythology Storyteller", voice_id `6EphsklDopDQ6eRkwNHT`), chosen by the owner on 16 November 2026 from the voice's sample clip. Use it for every video in this theme.

- Model: `eleven_v4`. Hindi in Devanagari works on it (first video, 16 November 2026). One take only (see `reference/workflow.md`): about 1,500 credits for a 250-word script.
- **Speed: 1.15x for every video** (decided by the owner, 18 November 2026). `eleven_v4` has no speed setting, so generate the take at normal speed, then speed it up without changing pitch: `ffmpeg -i voice.mp3 -filter:a atempo=1.15 -c:a libmp3lame -q:a 2 voice-115.mp3`. Divide every word timing from the transcription by 1.15 when writing `words.ts`, so the captions stay in sync. Credits are unchanged (ElevenLabs charges by text).
- Pace: about **130 Hindi words a minute** at normal speed (190 words took 85 s), so about **150 words a minute after the 1.15x speed-up**. Plan scripts with that: about 150 words for a 60-second video.

## Captions and signs

- Font: **Poppins Bold** (`studio/public/fonts/Poppins-Bold.ttf`, copy and licence in `brand/fonts/`). It covers Devanagari. Space Grotesk does not, so it cannot be used for Hindi.
- Pass the theme to the captions: `<WordCaptions words={words} theme={THEMES['indian-mythology']} />`. That sets the font, a slightly smaller size, taller lines for the marks above and below letters, and zero letter spacing (tighter spacing breaks Hindi conjuncts).
- Layout is the shared one: one or two words at a time, white with a black outline, about 70 % down the frame.
- Signs and lettering inside the world are in Hindi, in Poppins (`signFont` in the theme).
- Hindi captions in Poppins render correctly, conjuncts and matras included (checked on stills, 16 November 2026).
- ElevenLabs transcription (Scribe) returned the word timings in Devanagari, matching the script. Drop the "—" tokens and quote marks when writing `words.ts`.

## World and light (proposed)

Places from the stories: forests and hermitages, palaces and courts, riverbanks, mountains, battlefields, the sea, the heavens. Use the shared light rules; this theme leans on golden hour, lamp-lit (diya) interiors, moonlit nights and a soft glow around divine figures. Hero props are things such as chariots, thrones, bows, lamps and temple bells.

## Sound (proposed)

Music bed made in code as in the general theme, but in an Indian colour: a tanpura-like drone with a slow flute-like or bell line instead of the pad chords. Start from `studio/scripts/make_bed.py`. No recorded bhajans, film music or other copyrighted music.

## Script rules (proposed)

- Tell one episode per video.
- Name the source at the planning stage (for example Valmiki Ramayana, Vyasa's Mahabharata, Bhagavata Purana) and check names, relationships and the order of events against it. Tellings differ between texts and regions: follow one named telling per video.
- The fact-check rule of `CLAUDE.md` becomes: check the story against its named source before generating the voice.
- Avoid passing judgement on beliefs or comparing religions.

## Brand assets (channel art only)

In `brand/epic-mythology/`, made on 16 November 2026 and shown to the owner; not yet confirmed as final:

- `profile.png` (1000 x 1000): the cast's gold mukut on a sunset disc. It is cropped to a circle by the apps.
- `banner.png` (2560 x 1440, YouTube size): the six cast figures either side of the name, at sunset with temple silhouettes. Everything important sits in the centre 1546 x 423 strip that phones show.
- `description.md`: channel description in Hindi and English, a short bio and the tagline "महाकाव्यों की कहानियाँ".
- Colours: deep purple `#3b1245`, maroon `#7a1f3d`, saffron `#e8612f`, sun yellow `#ffd98a`, gold `#f4b93a`, ink `#17121a`. Lettering: Poppins Bold, white with an ink outline.

As in the general theme, nothing from the channel art goes over the picture in a video.

## Where the files go

- Code: `studio/src/<topic>/`.
- Finished videos: `videos/indian-mythology/`.
