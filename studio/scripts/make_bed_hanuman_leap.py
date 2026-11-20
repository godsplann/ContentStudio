# Code-made music bed and sound effects for "हनुमान की छलाँग" (Indian mythology theme). No samples, no downloads.
# Indian colour as the theme asks: a tanpura-like drone (Pa-Sa-Sa-Sa), a slow flute-like line in a pentatonic
# (Bhupali-like) scale, temple bells, and effects timed to the narration's word timings.
# Run from the studio folder: python3 scripts/make_bed_hanuman_leap.py   (needs numpy; scipy optional)
import numpy as np, wave
try:
    from scipy.signal import lfilter
except ImportError:
    lfilter = None

SR = 48000
DUR = 2582 / 30
N = int(SR * DUR)
rng = np.random.default_rng(8)
out = np.zeros((N, 2))
SA = 138.59  # C#3

def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N or i + len(sig) <= 0: return
    s = sig * gain
    if i < 0: s = s[-i:]; i = 0
    j = min(N, i + len(s)); s = s[: j - i]
    out[i:j, 0] += s * np.sqrt((1 - pan) / 2) * 1.414
    out[i:j, 1] += s * np.sqrt((1 + pan) / 2) * 1.414

def lowpass(x, a):
    if lfilter is not None: return lfilter([a], [1, a - 1], x)
    y = np.zeros_like(x); acc = 0.0
    for k, v in enumerate(x): acc += a * (v - acc); y[k] = acc
    return y

def tt(sec): return np.arange(int(sec * SR)) / SR
def noise(n): return rng.standard_normal(n)

# ---------- Tanpura: Pa, Sa', Sa', Sa, one pluck every 0.9 s, rich decaying harmonics with a slow "jawari" shimmer ----------
def pluck(f0, length=3.6):
    t = tt(length)
    s = np.zeros_like(t)
    for h in range(1, 14):
        amp = (1 / h) * (1 + 0.6 * np.sin(2 * np.pi * (0.7 + h * 0.13) * t + h))  # shimmer
        s += amp * np.sin(2 * np.pi * f0 * h * t) * np.exp(-t * (0.9 + h * 0.18))
    att = np.minimum(1, t / 0.01)
    return s * att
cycle = [SA * 1.5 / 2, SA, SA, SA / 2]  # Pa (low), Sa, Sa, Sa (low)
k = 0; t0 = 0.0
while t0 < DUR:
    add(pluck(cycle[k % 4]), t0, pan=[-0.3, 0.1, 0.25, -0.1][k % 4], gain=0.05)
    t0 += 0.9; k += 1

# ---------- Flute-like line: Bhupali (Sa Re Ga Pa Dha), slow and breathy, with vibrato ----------
scale = {'S': 1.0, 'R': 9 / 8, 'G': 5 / 4, 'P': 3 / 2, 'D': 5 / 3, "S'": 2.0, "R'": 9 / 4, 'd': 5 / 6, 'p': 3 / 4}
def flute(ratio, length):
    f0 = SA * 2 * ratio
    t = tt(length)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.5)
    ph = 2 * np.pi * np.cumsum(f0 * vib) / SR
    s = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    breath = lowpass(noise(len(t)), 0.08) * 0.25
    env = np.minimum(1, t / 0.18) * np.minimum(1, (length - t) / 0.35)
    return (s + breath) * np.clip(env, 0, 1)
# phrases: (start seconds, [(note, beats)]) ; one beat = 0.6 s. Placed in the gaps of the story.
phrases = [
    (0.4, [('G', 2), ('R', 1), ('S', 3), ('d', 2), ('S', 4)]),
    (8.6, [('P', 2), ('G', 1), ('R', 1), ('G', 3), ('R', 1), ('S', 4)]),
    (19.3, [('G', 1), ('P', 1), ('D', 1), ("S'", 2), ('D', 1), ('P', 2), ('G', 2), ('R', 1), ('G', 3)]),
    (26.4, [('R', 2), ('S', 2), ('d', 2), ('p', 4), ('d', 2), ('S', 4)]),
    (34.0, [('S', 2), ('R', 1), ('G', 2), ('P', 3), ('G', 2), ('R', 4)]),
    (40.0, [('G', 1), ('P', 1), ('D', 2), ("S'", 4), ('D', 2), ('P', 4)]),
    (47.2, [('P', 1), ('D', 1), ("S'", 1), ("R'", 3), ("S'", 2), ('D', 1), ("S'", 6)]),
    (58.4, [("S'", 1), ('D', 1), ('P', 1), ('G', 2), ('R', 2), ('G', 4)]),
    (63.2, [('G', 2), ('P', 2), ('D', 2), ('P', 3), ('G', 3), ('P', 4)]),
    (69.6, [('S', 2), ('R', 2), ('G', 2), ('P', 4), ('D', 2), ("S'", 6), ('D', 2), ('P', 4)]),
    (79.0, [('G', 2), ('R', 2), ('S', 4), ('d', 2), ('S', 6)]),
]
for start, notes in phrases:
    t = start
    for n, beats in notes:
        L = beats * 0.6
        add(flute(scale[n], L + 0.25), t, pan=0.15, gain=0.07)
        t += L

# ---------- Temple bell: inharmonic partials, long decay ----------
def bell(f0=520, length=4.5, bright=1.0):
    t = tt(length)
    parts = [(1, 1), (2.76, 0.6), (5.4, 0.35 * bright), (8.93, 0.2 * bright), (0.5, 0.4)]
    s = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * (0.7 + r * 0.35)) for r, a in parts)
    return s * np.minimum(1, t / 0.003)
for tb in (0.0, 19.12, 33.4, 69.5):
    add(bell(SA * 4), tb, pan=-0.2, gain=0.09)

# ---------- Effects, at the word timings ----------
def whoosh(length, gain, start, pan=0.0, bright=0.15):
    n = int(length * SR); t = np.arange(n) / SR
    w = lowpass(noise(n), bright) * 3 + lowpass(noise(n), 0.4) * np.linspace(0, 1, n) ** 2
    add(w * np.sin(np.pi * t / t[-1]) ** 2, start, pan, gain)

whoosh(0.5, 0.2, 13.75)                         # whip to Lanka (frames 418-432)
whoosh(0.9, 0.12, 18.95, bright=0.05)           # into the memory
whoosh(0.9, 0.12, 33.25, bright=0.05)           # out of the memory
whoosh(0.7, 0.14, 24.45, pan=0.3)               # little Hanuman leaps the fire
# kamandal clatter and water splash (24.75 s + landing)
for j in range(4):
    n = int(0.12 * SR); t = np.arange(n) / SR
    add(np.sin(2 * np.pi * (900 - j * 120) * t) * np.exp(-t * 35) * 0.12, 25.08 + j * 0.09, pan=-0.3)
add(lowpass(noise(int(0.6 * SR)), 0.3) * np.exp(-tt(0.6) * 6) * 0.15, 25.1, pan=-0.3)
# the curse: a deep bell and a rising shimmer (27.2 s), then the glow fading (29.44 s)
add(bell(SA, 5.0, 0.5), 27.2, gain=0.14)
for j, r in enumerate([4, 5, 6, 8]):
    t = tt(2.2); add(np.sin(2 * np.pi * SA * r * t) * np.exp(-t * 1.6) * 0.035, 27.25 + j * 0.08, pan=(j - 1.5) * 0.3)
t = tt(2.5); add(np.sin(2 * np.pi * (SA * 8 - 300 * t) * t) * np.exp(-t * 1.4) * 0.03, 29.44)
# wind rising around Hanuman (pavanputra 38.32 s to growth 51 s)
n = int(12.7 * SR); t = np.arange(n) / SR
wind = lowpass(noise(n), 0.03) * 6 * (0.3 + 0.7 * (t / t[-1]) ** 2) * (1 + 0.4 * np.sin(2 * np.pi * 0.3 * t))
add(wind * np.minimum(1, t / 1.5), 38.32, pan=0.0, gain=0.09)
# growth: a deep rising rumble (48.4-51 s) and a thud when he stands tall
t = tt(3.0)
add(np.sin(2 * np.pi * np.cumsum(40 + 50 * (t / t[-1])) / SR) * np.minimum(1, t / 0.4) * np.minimum(1, (3 - t) / 0.3) * 0.35, 48.3)
add(lowpass(noise(int(0.9 * SR)), 0.02) * np.exp(-tt(0.9) * 5) * 3.0, 50.85)
# "जय श्री राम": a big gong and bells (53.92 s)
t = tt(5.0)
gong = sum(a * np.sin(2 * np.pi * 70 * r * t + r) * np.exp(-t * d) for r, a, d in [(1, 1, 0.6), (1.41, 0.6, 0.8), (2.31, 0.4, 1.0), (3.2, 0.3, 1.3), (4.7, 0.2, 1.6)])
add(gong * 0.25, 53.92)
add(bell(SA * 4, 4.0), 54.0, pan=0.4, gain=0.08)
add(bell(SA * 6, 4.0), 54.1, pan=-0.4, gain=0.06)
# the leap: crouch creak, a boom and a long whoosh up (57.12 s)
add(lowpass(noise(int(1.2 * SR)), 0.015) * np.exp(-tt(1.2) * 3.5) * 4.0, 57.12)
whoosh(1.6, 0.3, 57.0, bright=0.2)
# over the sea: rushing air (58.56-59.92 s)
whoosh(1.5, 0.18, 58.5, pan=0.4, bright=0.1)
# landing in the vatika (hanumanDrops + 14 frames)
add(lowpass(noise(int(0.25 * SR)), 0.05) * np.exp(-tt(0.25) * 18) * 1.2, 61.43)
# the ring glints (63.04 s) and Shri Ram appears in it (67.52 s)
for j, r in enumerate([8, 10, 12, 16]):
    t = tt(1.6); add(np.sin(2 * np.pi * SA * r * t) * np.exp(-t * 3) * 0.03, 63.1 + j * 0.06, pan=0.5)
add(bell(SA * 2, 5.0), 67.52, gain=0.1)
for j, r in enumerate([3, 4, 5, 6, 8]):
    t = tt(3.0); add(np.sin(2 * np.pi * SA * r * t) * np.exp(-t * 1.2) * 0.03, 67.6 + j * 0.1, pan=(j - 2) * 0.3)
# the army cheers (from 76.5 s): soft chatter of many voices (filtered noise bursts)
for j in range(60):
    st = 76.4 + rng.uniform(0, 7.5); n = int(rng.uniform(0.08, 0.2) * SR)
    s = lowpass(noise(n), 0.25) * np.hanning(n)
    add(s * np.sin(2 * np.pi * rng.uniform(300, 700) * np.arange(n) / SR), st, pan=rng.uniform(-0.8, 0.8), gain=0.03)

# fade in/out, normalise to a quiet level (the voice sits on top)
fade = np.ones(N); fade[: int(0.2 * SR)] = np.linspace(0, 1, int(0.2 * SR)); fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
out *= fade[:, None]
out *= 0.5 / np.max(np.abs(out))
with wave.open('public/audio/hanuman-leap-bed.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((out * 32767).astype('<i2').tobytes())
print('wrote public/audio/hanuman-leap-bed.wav', round(DUR, 2))
