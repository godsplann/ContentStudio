// Word timings for the narration (ElevenLabs transcription of take 1, Brian voice).
// Times are in seconds from the start of the voice file.
export type Word = {text: string; start: number; end: number};

export const words: Word[] = [
  {text: 'Your', start: 0.0, end: 0.24},
  {text: 'screen', start: 0.44, end: 0.64},
  {text: 'redraws', start: 0.76, end: 1.28},
  {text: 'millions', start: 1.36, end: 1.76},
  {text: 'of', start: 1.84, end: 1.92},
  {text: 'pixels,', start: 2.2, end: 2.8},
  {text: 'sixty', start: 2.88, end: 3.28},
  {text: 'times', start: 3.48, end: 3.68},
  {text: 'every', start: 3.76, end: 4.08},
  {text: 'second.', start: 4.28, end: 4.96},
  {text: "That's", start: 5.04, end: 5.2},
  {text: 'too', start: 5.28, end: 5.36},
  {text: 'much', start: 5.44, end: 5.6},
  {text: 'math', start: 5.68, end: 5.92},
  {text: 'for', start: 5.96, end: 6.0},
  {text: 'the', start: 6.08, end: 6.16},
  {text: 'CPU', start: 6.24, end: 6.56},
  {text: 'alone.', start: 6.64, end: 7.6},
  {text: 'A', start: 7.68, end: 7.84},
  {text: 'CPU', start: 7.92, end: 8.48},
  {text: 'has', start: 8.56, end: 8.64},
  {text: 'a', start: 8.8, end: 8.88},
  {text: 'few', start: 8.96, end: 9.04},
  {text: 'powerful', start: 9.12, end: 9.6},
  {text: 'cores', start: 9.8, end: 10.0},
  {text: 'that', start: 10.08, end: 10.16},
  {text: 'work', start: 10.24, end: 10.4},
  {text: 'through', start: 10.52, end: 10.64},
  {text: 'jobs', start: 10.84, end: 11.04},
  {text: 'one', start: 11.12, end: 11.2},
  {text: 'after', start: 11.28, end: 11.52},
  {text: 'another.', start: 11.96, end: 12.44},
  {text: 'A', start: 12.48, end: 12.64},
  {text: 'GPU', start: 12.76, end: 13.36},
  {text: 'has', start: 13.44, end: 13.68},
  {text: 'thousands', start: 13.76, end: 14.16},
  {text: 'of', start: 14.24, end: 14.32},
  {text: 'tiny', start: 14.4, end: 14.64},
  {text: 'cores,', start: 14.96, end: 15.32},
  {text: 'all', start: 15.36, end: 15.52},
  {text: 'working', start: 15.68, end: 15.84},
  {text: 'at', start: 15.88, end: 15.92},
  {text: 'the', start: 16.0, end: 16.08},
  {text: 'same', start: 16.2, end: 16.32},
  {text: 'time.', start: 16.8, end: 17.36},
  {text: 'GPU', start: 17.48, end: 18.0},
  {text: 'stands', start: 18.08, end: 18.32},
  {text: 'for', start: 18.4, end: 18.48},
  {text: 'graphics', start: 18.56, end: 18.96},
  {text: 'processing', start: 19.04, end: 19.6},
  {text: 'unit,', start: 19.68, end: 20.24},
  {text: 'and', start: 20.32, end: 20.4},
  {text: 'today', start: 20.68, end: 20.96},
  {text: 'it', start: 21.04, end: 21.12},
  {text: 'powers', start: 21.2, end: 21.52},
  {text: 'games,', start: 21.84, end: 22.24},
  {text: 'video', start: 22.52, end: 22.8},
  {text: 'and', start: 22.88, end: 22.96},
  {text: 'AI.', start: 23.04, end: 23.68},
];

export const FPS = 30;
// Voice length plus a short tail.
export const DURATION_FRAMES = Math.ceil((23.68 + 0.52) * FPS); // 726 frames, 24.2 s

// Frame of the first word matching `text` at or after `after` seconds.
export const at = (text: string, after = 0): number => {
  const w = words.find((x) => x.start >= after && x.text.replace(/[.,?!]/g, '') === text);
  if (!w) throw new Error(`word not found: ${text}`);
  return Math.round(w.start * FPS);
};
