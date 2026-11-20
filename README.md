# Content Studio

Everything that makes the videos, in one place. The folder now serves more than one theme (kind of video): the shared rules and code are used by all of them, and each theme adds a short file of its own.

| Path | What it holds |
|---|---|
| `CLAUDE.md` | Shared instructions for Claude, for every theme. Start here. |
| `themes/` | One file per theme (General education, Indian mythology, Undercover): channel, language, cast, narrator, caption font. `themes/README.md` lists them and explains how to add one |
| `brand/colors.json` | Mind Matter channel colours and what each is for |
| `brand/mind-matter/` | Mind Matter channel art: current profile picture and banner |
| `brand/undercover/` | Undercover channel art: profile picture and banner, with the HTML they are drawn from |
| `brand/epic-mythology/` | Epic Mythology channel art: profile picture, banner and channel description |
| `brand/palette.png` | The palette as a picture |
| `brand/fonts/` | Space Grotesk (Medium and Bold) and Poppins Bold (for Hindi), with their licences |
| `logo/` | Earlier Mind Matter logo (replaced by `brand/mind-matter/`) as SVG and 1000 px PNG, navy and light versions, plus the mark alone for dark backgrounds |
| `reference/cpu-vs-gpu-script.md` | The script of the first video (made in the earlier flat 2D look) |
| `reference/toon-3d-style.md` | The toon-3D style: what the sample videos did, and how the studio builds it |
| `reference/workflow.md` | The steps from topic to finished video, rendering, sound mix, and how to keep cost down |
| `videos/` | Finished videos |
| `studio/` | The 3D video project: Three.js scenes rendered with Remotion. See `studio/README.md` |

To use this with Claude: connect this folder in the Claude desktop app and ask for a new video. Claude reads `CLAUDE.md` first, asks which theme the video is for, and then reads that theme's file.
