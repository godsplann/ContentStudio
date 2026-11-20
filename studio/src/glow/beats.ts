// "You are glowing right now": the story's timeline, in frames keyed to the narration (words.ts).
export const s = (sec: number) => Math.round(sec * 30);

export const B = {
  hook: 0, // "Right now, your body is giving off light."
  notHeat: s(3.16), // "Not heat."
  real: s(4.16), // "Real, visible light."
  faint: s(6.28), // "It is just a thousand times too faint for your eyes to see."
  thousand: s(7.04),
  japan: s(10.0), // "In 2009, scientists in Japan set out to photograph it."
  sealed: s(14.28), // "They sealed a room so that not a single ray of outside light could get in."
  closed: s(17.2),
  five: s(18.64), // "Five young men sat in front of a camera in total darkness."
  darkness: s(21.28),
  sensitive: s(22.4), // "The camera was so sensitive it could pick up single particles of light."
  particles: s(25.0),
  twenty: s(26.72), // "Each picture took twenty minutes."
  pictures: s(28.96), // "And in those pictures, the men were glowing."
  glowing: s(30.88),
  face: s(31.92), // "The light was strongest on the face: the cheeks, the forehead and the neck."
  cheeks: s(34.24),
  forehead: s(35.16),
  neck: s(36.0),
  changed: s(36.92), // "And it changed through the day."
  dimmest: s(38.76), // "It was dimmest at ten in the morning"
  brightest: s(41.0), // "and brightest around four in the afternoon,"
  inStep: s(42.96), // "in step with the body's internal clock."
  where: s(45.44), // "So where does it come from?"
  everyCell: s(47.2), // "Every cell in your body burns fuel to stay alive."
  burning: s(50.4), // "That burning makes highly reactive molecules called free radicals."
  radicals: s(53.12),
  crash: s(54.43), // "When they crash into the fats and proteins in your cells, they pass on a little energy."
  hitFat: s(54.9),
  hitProtein: s(56.1),
  pass: s(57.84),
  hold: s(59.64), // "Those molecules hold the energy for a moment, then let it go as a tiny flash of light."
  letGo: s(62.16),
  flash: s(63.72),
  glowStick: s(64.96), // "It is the same kind of chemistry that makes a glow stick shine."
  snap: s(66.2),
  canada: s(68.72), // "In 2025, scientists in Canada took the idea further."
  mice: s(72.96), // "They filmed living mice in the dark, and the mice glowed."
  miceGlow: s(75.76),
  died: s(76.88), // "After the mice died, the glow almost vanished."
  vanished: s(79.2),
  plants: s(80.35), // "Plants showed something similar."
  leaf: s(82.27), // "Where a leaf was damaged, it glowed brighter, because its stressed cells were making more of those reactive molecules."
  damaged: s(83.0),
  brighter: s(84.2),
  because: s(85.01),
  doctors: s(88.96), // "Scientists hope this light could one day help doctors check the health of tissue without touching it,"
  tissue: s(92.56),
  farmers: s(94.24), // "or help farmers spot sick crops early."
  crops: s(95.72),
  aura: s(97.12), // "This is not a mysterious aura."
  chem: s(99.09), // "It is chemistry, the side effect of your cells at work."
  nextTime: s(102.88), // "So the next time you sit in a dark room, remember."
  still: s(106.16), // "You are still glowing."
  cantSee: s(107.84), // "You just can't see it."
  end: s(109.04),
};
