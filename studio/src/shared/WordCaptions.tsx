// Word-by-word captions: one or two words at a time, white with a black outline, no box,
// centred about 70 % of the way down the frame, popping in over four frames.
// The lettering (font, size, spacing) comes from the theme, so Hindi captions use a Devanagari font.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {DEFAULT_THEME, Theme} from '../themes';

export type Word = {text: string; start: number; end: number; hl?: boolean};

type Page = {text: string; start: number; end: number; hl?: boolean};

// Two short words spoken close together share one caption.
export const toPages = (words: Word[]): Page[] => {
  const pages: Page[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const n = words[i + 1];
    const short = (s: string) => s.replace(/[.,?!।]/g, '').length <= 4;
    if (n && short(w.text) && short(n.text) && n.start - w.end < 0.12 && !/[.,?!।]$/.test(w.text)) {
      pages.push({text: `${w.text} ${n.text}`, start: w.start, end: n.end, hl: w.hl || n.hl});
      i++;
    } else pages.push({text: w.text, start: w.start, end: w.end, hl: w.hl});
  }
  // each caption stays until the next one starts (or a little after the last word)
  return pages.map((p, i) => ({...p, end: pages[i + 1] ? pages[i + 1].start : p.end + 0.4}));
};

export const WordCaptions: React.FC<{words: Word[]; theme?: Theme}> = ({words, theme = DEFAULT_THEME}) => {
  const cap = theme.captions;
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const pages = React.useMemo(() => toPages(words), [words]);
  const t = frame / fps;
  const page = pages.find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  const d = frame - Math.round(page.start * fps);
  const scale = [0.8, 1.08, 1.03, 1.0][Math.min(3, Math.max(0, d))];
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: height * 0.7,
        transform: `translateY(-50%) scale(${scale})`,
        textAlign: 'center',
        fontFamily: cap.fontFamily,
        fontWeight: cap.fontWeight,
        fontSize: cap.fontSize,
        lineHeight: cap.lineHeight,
        color: page.hl && cap.highlight ? cap.highlight : '#ffffff',
        WebkitTextStroke: `${Math.round(cap.fontSize * 0.2)}px #000000`,
        paintOrder: 'stroke fill',
        letterSpacing: cap.letterSpacing,
      }}
    >
      {page.text}
    </div>
  );
};
