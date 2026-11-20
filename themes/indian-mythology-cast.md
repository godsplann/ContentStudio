# Indian mythology: the cast

Recurring figures keep one design in every video. The owner approved these six on 16 November 2026 ("Let's keep these"), from the sheet `indian-mythology-cast.png`. The drawings are defined in `CAST` in `studio/src/shared/mythic.ts`: change a figure there and here together, and only when the owner asks.

| Figure | Key in `CAST` | Look |
|---|---|---|
| Ram | `ram` | Light blue skin, tall gold mukut with a red gem, yellow dhoti with red border, orange chest cloth, gold necklace, bow in hand and quiver on the back, halo |
| Sita | `sita` | Long black hair with a centre parting, gold tiara, red bindi, red sari with gold border, gold necklace and earrings, halo |
| Hanuman | `hanuman` | Orange fur, pale muzzle, round ears, curled tail, small gold tiara, orange forehead mark, short red dhoti, gold mace |
| Krishna | `krishna` | Deeper blue skin, black curls, gold headband with a peacock feather, yellow dhoti with green border, flower garland, flute, halo |
| Shiv | `shiv` | Pale blue-grey skin, long dark hair with a topknot and crescent moon, third eye, three ash lines, snake at the neck, bead necklace, tiger skin, trident, halo |
| Rishi (a sage, for any story) | `rishi` | White topknot and beard, three ash lines, saffron robe and chest cloth, bead necklace, water pot |

## Added for "Hanuman's leap" (approved by the owner, 17 November 2026)

Shown to the owner on 16 November 2026 as `hanuman-leap-new-cast.png`; in `CAST` in `mythic.ts`:

| Figure | Key | Look |
|---|---|---|
| Jambavan (bear king) | `jambavan` | Dark brown fur, round ears, tan muzzle and big nose, white bushy brows and beard, small gold tiara, green short dhoti, bead necklace, wooden staff |
| Young Hanuman | `baalHanuman` | The cast Hanuman, lighter fur, no crown or mace; draw at about 0.7 of Hanuman's height |
| Vanaras (army) | `vanaraA/B/C` | Monkey figures in brown, golden and grey fur, green, blue and rust short dhotis |

New in the kit for them: `bear`, `muzzle` and `brows` looks, a `staff`, poses `fly` (arms up in a V; roll the figure to make it fly, or use as a cheer) and `offer` (a ring held out), expressions `sad` and `awe`.

When a story needs a new figure, design it in the same way, show the owner a sheet, and add it here once approved.

## Added for "Jatayu" (approved by the owner, 17 November 2026: "This is good")

Shown to the owner on 17 November 2026 as `jatayu-new-cast.png`. Lakshman and Ravana's main figure are in `CAST` in `mythic.ts`; the wider drawings are in `studio/src/shared/epic.ts` (pass their `*_ASPECT` to the flat plane).

| Figure | Where | Look |
|---|---|---|
| Lakshman | `CAST.lakshman` | Fair skin, gold mukut, green dhoti with gold border, yellow chest cloth, gold necklace, bow and quiver, halo |
| Ravana | `drawRavana(pose, expr)`, body in `CAST.ravana` | Ten heads (main head plus nine smaller ones fanned behind), dark brown skin, spiked dark-gold crowns, curled moustache, ash marks, gold armour, purple dhoti, curved sword. Poses: hold, raise (sword up), grab (arm reaching out) |
| Jatayu | `drawJatayu(pose, expr)` | Old vulture king: bare pinkish head, white wisps and bushy brows, small gold crown, white ruff, brown body and wings, hooked yellow beak. Poses: perch, fly, attack (talons out), wounded (wings cut short, loose feathers). Expressions: calm, stern, weak |
| Chariot donkeys | `drawDonkey(step)` | Dark grey, glowing red eye, small horns, fangs, gold harness and maroon saddle cloth; two gallop frames |

New in the kit: headgear `spiked`, `held: 'sword'`, `mustache`, `armour`, poses `raise` and `grab`.

## Added for "Khar-Dushan" (approved by the owner, 17 November 2026)

Shown as `khar-dushan-new-cast.png`. In `CAST` in `mythic.ts` unless noted.

| Figure | Where | Look |
|---|---|---|
| Shurpanakha | `CAST.shurpanakha` | Grey-green skin, wild dark-red mane, small fangs, gold earrings and necklace, dark green sari with red border |
| Khara | `CAST.khara` | Red-brown skin, wild black mane, dark-gold spiked crown, curled moustache, fangs, bronze armour, maroon dhoti, gold mace |
| Dushana | `CAST.dushana` | Slate-blue skin, cream horns, wild black mane, moustache, fangs, iron armour, dark green dhoti, sword |
| Trishira | `drawTrishira(pose, expr)` in `epic.ts`, body in `CAST.trishira` | Three olive-green heads with small gold tiaras, fangs, armour, brown dhoti, trident |
| Rakshasa army | `CAST.rakshasaA/B/C` | Purple, olive and rust skins, wild manes, fangs, some with horns, short dhotis; sword, mace or trident; usually `roar` |
| Fallen figures | `drawFallen(draw)` in `epic.ts` (aspect 2) | Any standing figure laid on its side, head to the left; used for the fallen army and the generals |

New in the kit: pose `shoot` (Ram drawing his bow; flip the plane to aim right), expression `roar`, looks `fangs`, `horns`, `hairBack: 'wild'`.
