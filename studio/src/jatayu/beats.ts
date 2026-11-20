// "Jatayu": the story's timeline (frames keyed to the narration) and where things stand in the forest world.
// Source: Valmiki Ramayana, Aranya Kanda 49-51 (the golden donkey chariot, Jatayu's fight) and 67-68 (Ram finds him).
import type {V3} from '../shared/flat';

export const s = (sec: number) => Math.round(sec * 30);

export const B = {
  butOld: s(4.48), // "लेकिन एक बूढ़े पक्षी ने…"
  when: s(9.04), // "जब रावण माता सीता का अपहरण…"
  thenOnTheWay: s(15.76), // "तभी रास्ते में उसकी नजर पड़ी"
  vulture: s(18.64),
  name: s(19.92), // "उसका नाम था जटायु।"
  jatayuSaw: s(22.56), // "जटायु ने जब देखा…"
  forcibly: s(25.68),
  decided: s(27.64), // "तो उसने उसे रोकने का फैसला किया"
  think: s(30.52), // "सोचिए…"
  tenHeads: s(32.56),
  otherSide: s(35.36), // "और दूसरी तरफ था एक बूढ़ा पक्षी"
  noCare: s(38.76), // "लेकिन जटायु ने अपनी उम्र…"
  launch: s(41.6),
  attack: s(43.0), // "उसने रावण के रथ पर हमला कर दिया"
  hit1: s(44.4),
  battle: s(45.84), // "दोनों के बीच भयंकर युद्ध हुआ"
  bow: s(48.56), // "जटायु ने रावण के धनुष को तोड़ दिया"
  bowSnap: s(50.3),
  chariot: s(51.2), // "उसके रथ को तोड़ डाला"
  chariotSmash: s(51.96),
  crash: s(52.9),
  save: s(52.8), // "और सीता को बचाने की पूरी कोशिश की"
  end: s(56.04), // "लेकिन अंत में रावण ने अपनी तलवार से"
  raise: s(57.6),
  cut: s(60.1), // "पंख काट दिए"
  fall: s(61.68), // "जटायु जमीन पर गिर पड़ा"
  landed: s(63.2),
  later: s(64.64), // dusk: "कुछ समय बाद जब भगवान राम और लक्ष्मण वहाँ पहुँचे"
  ramArrives: s(68.4),
  found: s(68.68), // "तो उन्हें घायल जटायु मिला"
  lastBreath: s(71.36), // "जटायु ने अपनी आखिरी साँसें लेते हुए…"
  told: s(75.76),
  andThen: s(78.88), // "और फिर…"
  rites: s(80.0), // "भगवान राम ने जटायु को अपने पिता समान सम्मान दिया"
  pyre: s(84.56), // "और उसका अंतिम संस्कार स्वयं किया"
  feared: s(88.24), // "जिस रावण से बड़े-बड़े योद्धा डरते थे"
  oldBird: s(91.48), // "उससे एक बूढ़ा पक्षी… लड़ गया"
  because: s(94.8), // "क्योंकि उसे सही और गलत का फर्क पता था"
  realValour: s(98.76), // "क्योंकि असली वीरता इस बात में नहीं होती…"
  stand: s(104.16), // "असली वीरता इस बात में होती है…"
  standUp: s(110.6), // "…खड़े होते हैं"
};

// ----- The forest south of Panchavati -----
// A tall rock with a dead tree on top: Jatayu's perch.
export const CLIFF: V3 = [0, 0, 0];
export const CLIFF_H = 12;
export const PERCH: V3 = [0.2, CLIFF_H, 0.3];
export const J_H = 2.4; // Jatayu's height (a giant vulture: taller than a man)
// The clearing below where the chariot comes down and the fight ends.
export const CLEAR: V3 = [9, 0, -8];
export const RAVANA_G: V3 = [8.0, 0, -8.6];
export const SITA_G: V3 = [6.5, 0, -8.3];
export const JATAYU_G: V3 = [10.2, 0, -8.2];
// The river bank and the pyre.
export const PYRE: V3 = [-12, 0, -10];
// Sizes.
export const MAN_H = 1.6; // Ram, Lakshman, Sita
export const RAVANA_BODY_H = 2.2; // Ravana's body, feet to crown
export const RAVANA_PLANE_H = (RAVANA_BODY_H * 1200) / 1024;
export const DONKEY_H = 1.5;
