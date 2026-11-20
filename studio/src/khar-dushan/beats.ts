// "Khar-Dushan": the story's timeline (frames keyed to the narration) and where things stand.
// Source: Valmiki Ramayana, Aranya Kanda 17-30 (Shurpanakha at Panchavati, Khara's army of 14,000, the battle).
import type {V3} from '../shared/flat';

export const s = (sec: number) => Math.round(sec * 30);

export const B = {
  // hook (a flash-forward to the battle, in storm light)
  noArmy: s(6.4), // "आपके साथ कोई सेना नहीं…"
  ready: s(10.08), // "लेकिन आप अकेले उनका सामना करने के लिए तैयार हों!"
  ramayan: s(14.56), // "रामायण में एक ऐसा ही युद्ध हुआ था,"
  faced: s(17.36), // "जब श्रीराम ने अकेले 14,000 राक्षसों का सामना किया था!"
  // scene 1: Panchavati (day), then Khara's camp (night)
  panchavati: s(22.56), // "यह उस समय की बात है…"
  oneDay: s(30.08), // "एक दिन राक्षसी शूर्पणखा वहाँ पहुँची।"
  insulted: s(33.48), // "श्रीराम और लक्ष्मण से अपमानित होने के बाद"
  toBrothers: s(36.32), // "वह अपने भाइयों खर और दूषण के पास पहुँची।"
  told: s(39.84), // "उसने उन्हें अपनी बेइज्जती की कहानी सुनाई"
  incited: s(42.64), // "और श्रीराम से बदला लेने के लिए उकसाया।"
  roar: s(44.9),
  angry: s(46.32), // "गुस्से से भरा खर,"
  dushana: s(47.92), // "दूषण और"
  trishira: s(48.8), // "त्रिशिरा के साथ,"
  army: s(50.24), // "14,000 राक्षसों की विशाल सेना लेकर"
  charge: s(53.44), // "श्रीराम पर टूट पड़ा।"
  // scene 2: the battle
  lakshman: s(55.6), // "जब लक्ष्मण जी युद्ध के लिए तैयार हुए,"
  order: s(58.2), // "तब श्रीराम ने उन्हें…"
  cave: s(61.0), // "…पर्वत की एक गुफा में ले जाकर उनकी रक्षा करने का आदेश दिया।"
  alone: s(65.44), // "अब युद्धभूमि में श्रीराम अकेले थे।"
  allSides: s(68.96), // "चारों तरफ से राक्षसों ने उन पर हमला कर दिया।"
  unshaken: s(72.32), // "लेकिन श्रीराम बिल्कुल विचलित नहीं हुए।"
  arrows: s(75.44), // "उनके धनुष से निकलते बाण बिजली की गति से"
  felling: s(78.48), // "राक्षसों को धराशायी करने लगे।"
  covered: s(81.04), // "कुछ ही समय में युद्धभूमि गिरे हुए राक्षसों से पट गई।"
  generals: s(85.36), // "दूषण और त्रिशिरा भी मारे गए।"
  dushanaFalls: s(85.9),
  trishiraFalls: s(86.85),
  khara: s(88.24), // "अंत में खर स्वयं श्रीराम से भिड़ा,"
  kharaArrow: s(91.2), // "और श्रीराम के बाण से वह भी मारा गया।"
  kharaHit: s(92.25),
  over: s(94.72), // "14,000 राक्षसों की पूरी सेना का संहार हो चुका था।"
  // ending (sunset gold)
  think: s(99.4), // "सोचिए… जिस सेना को अपनी संख्या पर इतना घमंड था,"
  couldNot: s(103.92), // "वह एक अकेले योद्धा के सामने टिक नहीं पाई।"
  taught: s(107.52), // "श्रीराम ने उस दिन सिर्फ अपनी शक्ति नहीं दिखाई…"
  courageNot: s(112.76), // "साहस का मतलब यह नहीं कि आपके सामने कितने लोग हैं।"
  courageIs: s(117.12), // "साहस का मतलब है कि सही के लिए खड़े होने का हौसला कितना है!"
  finale: s(122.16), // "और यही था मर्यादा पुरुषोत्तम श्रीराम का पराक्रम!"
};

// ----- Panchavati and the plain of Janasthana -----
export const HUT: V3 = [0, 0, 0];
export const RAM_HUT: V3 = [0.7, 0, 3.4];
export const SITA_HUT: V3 = [-0.7, 0, 3.1];
export const LAK_HUT: V3 = [2.1, 0, 3.8];
export const RIVER_Z = -13; // the Godavari runs along x behind the hut
// The rocky hill with the cave where Lakshman keeps Sita safe.
export const ROCK: V3 = [-28, 0, 3];
export const CAVE_YAW = 0.6;
export const HILL_R = 8.5;
export const HILL_H = 7;
export const CAVE_MOUTH: V3 = [ROCK[0] + Math.sin(CAVE_YAW) * 8.45, 0, ROCK[2] + Math.cos(CAVE_YAW) * 8.45];
// Where Ram stands to fight, on the open plain in front of the hut; the army comes from +z.
export const RAM_B: V3 = [0, 0, 14];
export const DUSHANA_B: V3 = [-5, 0, 31];
export const TRISHIRA_B: V3 = [5, 0, 31];
export const KHARA_B: V3 = [0, 0, 37];
export const KHARA_MEET: V3 = [0, 0, 20.5];
// Sizes.
export const MAN_H = 1.6;
export const RAM_H = 1.66;
export const KHARA_H = 2.05;
export const GENERAL_H = 1.9;
export const SOLDIER_H = 1.6;

// ----- Khara's camp at Janasthana (its own world) -----
export const THRONE: V3 = [0, 0, 0];
export const DAIS_H = 0.6;
export const KHARA_C: V3 = [0, DAIS_H, -0.4];
export const DUSHANA_C: V3 = [-2.1, DAIS_H, 0.2];
export const TRISHIRA_C: V3 = [2.3, DAIS_H, 0.2];
export const SHURP_C: V3 = [0, 0, 3.6];
