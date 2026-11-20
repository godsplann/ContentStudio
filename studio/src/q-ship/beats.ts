// "The ship nobody sank" (Undercover, Q-ships): the story's timeline in frames, keyed to words.ts.
export const s = (sec: number) => Math.round(sec * 30);

export const B = {
  hook: 0, // "The captain ordered his crew to abandon ship."
  nothing: s(3.12), // "Nothing was wrong with it."
  atlantic: s(5.28), // "North Atlantic, 1916."
  y1916: s(6.4),
  german: s(8.0), // "German submarines are hunting lone cargo ships."
  torpedoes: s(11.12), // "Torpedoes are precious,"
  precious: s(12.16),
  so: s(13.04), // "so a sub would rather surface and finish small ships with its deck gun."
  surface: s(14.32),
  finish: s(14.96),
  gun: s(16.48),
  steamer: s(17.28), // "And this rusty old steamer looks like the easiest target on the ocean."
  easiest: s(19.48),
  every: s(21.68), // "Every morning, the captain drills his crew in one thing:"
  drills: s(23.12),
  thing: s(24.56),
  running: s(25.52), // "running away."
  newHand: s(26.88), // "A new deckhand frowns."
  frowns: s(27.76),
  sir: s(28.8), // "Sir, shouldn't we practise fighting?"
  reply: s(31.36), // "Practise falling into a lifeboat."
  lifeboat: s(32.72),
  periscope: s(34.0), // "Then a periscope breaks the water."
  breaks: s(35.28),
  scramble: s(36.48), // "The crew scrambles into the boats,"
  dropping: s(38.32), // "dropping oars,"
  shouting: s(39.28), // "shouting,"
  oneMan: s(40.0), // "one man still holding his teacup."
  rises: s(42.24), // "The submarine rises, slow and confident,"
  slow: s(43.92),
  creeps: s(45.64), // "and creeps toward the empty ship."
  except: s(48.16), // "Except it isn't empty."
  isnt: s(49.32),
  half: s(50.56), // "Half the crew is still aboard, lying flat behind the rails,"
  flat: s(52.4),
  notBreathing: s(54.24), // "not breathing."
  navy: s(55.52), // "The Navy had a name for these decoys:"
  qships: s(58.0), // "Q-ships."
  men: s(59.12), // "The men in the boats were the panic party,"
  everyScream: s(61.6), // "and every scream was rehearsed."
  rehearsed: s(62.72),
  slides: s(63.84), // "The sub slides closer."
  captainNods: s(65.92), // "The captain nods."
  nods: s(66.56),
  coop: s(67.52), // "And the chicken coop on deck falls open."
  falls: s(69.12),
};
