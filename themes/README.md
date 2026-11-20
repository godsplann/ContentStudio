# Themes

A theme is one kind of video. Each theme has one file here that lists **only what differs** from the shared rules in `CLAUDE.md`: channel, topics, language, tone, cast, narrator, caption lettering, world and sound. Everything else is shared by all themes: the toon-3D technique, camera, caption layout, video format, the studio code, rendering and the sound mix.

| Theme | File | Language | Narrator | Status |
|---|---|---|---|---|
| General education | `general.md` | English | Brian | In use ("What is a GPU?") |
| Indian mythology (Epic Mythology channel) | `indian-mythology.md` | Hindi | Shardul K | In use ("हनुमान की छलाँग", 16 November 2026) |
| Undercover (trivia and true stories) | `undercover.md` | English | Albert B. Squid | In use ("The ship nobody sank", 18 November 2026) |

## How a theme is chosen

At the start of every new video Claude asks the owner which theme to use, listing the rows above, and then reads that theme's file. A theme's file wins over `CLAUDE.md` wherever the two differ.

## Adding a theme

1. Copy `_template.md` to `<theme-id>.md` and fill it in with the owner. Ask the owner for anything the template needs; do not invent it.
2. Add the theme to `studio/src/themes.ts` (language, narrator, caption font). If the language needs a new script, add a font to `studio/public/fonts/` and load it in `studio/src/fonts.ts`.
3. Add a row to the table above.
