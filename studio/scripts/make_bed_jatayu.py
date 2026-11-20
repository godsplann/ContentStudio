# Code-made music bed and sound effects for "जटायु" (Indian mythology theme). No samples, no downloads.
# Indian colour as the theme asks: a tanpura-like drone (Pa-Sa-Sa-Sa), a slow flute-like line in a pentatonic
# (Bhupali-like) scale, temple bells, and effects timed to the narration's word timings.
# Run from the studio folder: python3 scripts/make_bed_jatayu.py   (needs numpy; scipy optional)
import numpy as np, wave
try:
    from scipy.signal import lfilter
except ImportError:
    lfilter = None

SR = 48000
DUR = 3432 / 30
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
# phrases: (start seconds, [(note, beats)]) ; one beat = 0.6 s. Tense in the fight, slow and low for the death and the rites.
phrases = [
    (0.3, [('d', 2), ('S', 2), ('R', 1), ('G', 3), ('R', 4)]),
    (8.2, [('G', 2), ('P', 2), ('D', 2), ("S'", 4)]),
    (19.4, [('P', 1), ('G', 1), ('R', 2), ('S', 4)]),
    (29.6, [('S', 1), ('R', 1), ('G', 1), ('P', 3), ('G', 2), ('R', 3)]),
    (38.0, [('G', 1), ('P', 1), ('D', 1), ("S'", 2), ("R'", 4)]),
    (61.6, [("S'", 2), ('D', 2), ('P', 2), ('G', 3), ('R', 4)]),
    (64.4, [('R', 3), ('S', 3), ('d', 3), ('p', 6)]),
    (78.6, [('S', 2), ('R', 2), ('G', 4), ('R', 2), ('S', 6)]),
    (88.0, [('G', 2), ('P', 2), ('D', 2), ("S'", 4), ('D', 2), ('P', 4)]),
    (98.0, [('P', 2), ('G', 2), ('R', 2), ('G', 4)]),
    (104.0, [('S', 1), ('R', 1), ('G', 1), ('P', 2), ('D', 2), ("S'", 4), ("R'", 2), ("S'", 6)]),
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
for tb in (0.0, 19.92, 80.0, 110.6):
    add(bell(SA * 4), tb, pan=-0.2, gain=0.09)

def whoosh(length, gain, start, pan=0.0, bright=0.15):
    n = int(length * SR); t = np.arange(n) / SR
    w = lowpass(noise(n), bright) * 3 + lowpass(noise(n), 0.4) * np.linspace(0, 1, n) ** 2
    add(w * np.sin(np.pi * t / t[-1]) ** 2, start, pan, gain)
def thud(start, gain=1.0, length=0.8):
    add(lowpass(noise(int(length * SR)), 0.02) * np.exp(-tt(length) * 5) * 3.0 * gain, start)
def gongf(start, gain=0.25, f0=70):
    t = tt(5.0)
    g = sum(a * np.sin(2 * np.pi * f0 * r * t + r) * np.exp(-t * d) for r, a, d in [(1, 1, 0.6), (1.41, 0.6, 0.8), (2.31, 0.4, 1.0), (3.2, 0.3, 1.3), (4.7, 0.2, 1.6)])
    add(g * gain, start)
def flap(start, gain=0.12, pan=0.0):
    n = int(0.22 * SR); t = np.arange(n) / SR
    add(lowpass(noise(n), 0.06) * 4 * np.sin(np.pi * t / t[-1]) ** 3, start, pan, gain)
def clang(start, gain=0.08, pan=0.0):
    t = tt(1.2)
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(1250, 1, 5), (2730, 0.6, 7), (4100, 0.3, 9)])
    add(s, start, pan, gain)

# ---------- Effects, at the word timings ----------
# the chariot in the sky: a low hum of magic and the donkeys' hooves on the air, until it is smashed (51.96 s)
n = int(52.0 * SR); t = np.arange(n) / SR
hum = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.5 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * t))
add(hum * np.minimum(1, t / 1.0) * np.minimum(1, (t[-1] - t) / 0.3), 0, gain=0.05)
for j in range(int(51.5 / 0.27)):
    st = j * 0.27
    if 22.5 < st < 43.0 and not (24.0 < st < 30.5): continue  # quieter on Jatayu's rock
    m = int(0.05 * SR)
    add(lowpass(noise(m), 0.2) * np.exp(-np.arange(m) / SR * 60), st, pan=0.3, gain=0.05 if st < 43 else 0.08)
# the whips
whoosh(0.55, 0.22, 18.3)
whoosh(0.55, 0.22, 45.8)
# Jatayu: a cry as he is introduced and when he decides, wings as he launches and through the fight
def cry(start, gain=0.08, f0=900):
    t = tt(0.9)
    f = f0 * (1 + 0.25 * np.sin(np.pi * t / 0.9)) * (1 + 0.02 * np.sin(2 * np.pi * 30 * t))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * lowpass(noise(len(t)), 0.3)
    add(s * np.sin(np.pi * t / 0.9) ** 2, start, 0.2, gain)
cry(4.6); cry(27.7, 0.07, 820); cry(42.9, 0.09, 960)
for j in range(10): flap(41.2 + j * 0.42, 0.14)
k = 0.0
while 43.0 + k < 56.0:
    flap(43.0 + k, 0.11, pan=np.sin(k) * 0.6); k += 0.38
# blows on the chariot (44.4 s, 46.9 s) and the bow snapping (50.3 s)
for st in (44.4, 46.9): clang(st, 0.08, 0.3); thud(st, 0.4, 0.4)
n = int(0.25 * SR); add(lowpass(noise(n), 0.6) * np.exp(-np.arange(n) / SR * 40) * 0.6, 50.3, 0.2)
add(np.sin(2 * np.pi * 180 * tt(0.4)) * np.exp(-tt(0.4) * 12) * 0.2, 50.3)
# the chariot smashed (51.96 s), falling, and crashing to the ground (52.9 s)
clang(51.96, 0.1); clang(52.02, 0.07, -0.3); whoosh(0.9, 0.2, 52.0, bright=0.08)
thud(52.9, 1.2, 1.2); gongf(52.9, 0.1, 50)
# the sword: a ring as it rises (57.6 s), the stroke (60.1 s), Jatayu falls (63.2 s)
t = tt(1.6); add(np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 3) * 0.03, 57.6, 0.4)
whoosh(0.35, 0.3, 59.95, bright=0.5)
add(np.sin(2 * np.pi * 3200 * tt(0.5)) * np.exp(-tt(0.5) * 9) * 0.06, 60.1)
thud(63.2, 0.9, 1.0)
# dusk: crickets and a soft evening wind (64.6-88 s)
n = int(23.6 * SR); t = np.arange(n) / SR
chirp = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > 0.3) * (np.sin(2 * np.pi * 0.9 * t) > 0)
add(chirp * np.minimum(1, t / 2) * np.minimum(1, (t[-1] - t) / 2), 64.6, 0.5, 0.012)
add(lowpass(noise(n), 0.02) * 5 * np.minimum(1, t / 2) * np.minimum(1, (t[-1] - t) / 2), 64.6, -0.2, 0.05)
# "और फिर…": a soft shimmer as the glow gathers (78.9 s)
for j, r in enumerate([4, 5, 6, 8]):
    t = tt(2.6); add(np.sin(2 * np.pi * SA * r * t) * np.exp(-t * 1.3) * 0.03, 78.9 + j * 0.1, pan=(j - 1.5) * 0.3)
# the pyre: fire crackling (84.56 s on)
n = int(4.0 * SR); t = np.arange(n) / SR
fire = lowpass(noise(n), 0.05) * 3
for j in range(60):
    i = int(rng.uniform(0, n - 2000)); fire[i:i + 400] += noise(400) * np.exp(-np.arange(400) / 60) * 2
add(fire * np.minimum(1, t / 1.0) * np.minimum(1, (t[-1] - t) / 0.6), 84.56, 0.1, 0.06)
# into the golden recall (88.24 s): a gong; he rises into the light (94.8 s)
gongf(88.24, 0.22)
for j, r in enumerate([4, 5, 6, 8, 10]):
    t = tt(3.0); add(np.sin(2 * np.pi * SA * r * t) * np.exp(-t * 1.1) * 0.03, 94.8 + j * 0.12, pan=(j - 2) * 0.3)
# the ending: wind on the rock, one last cry with the wings wide (104.16 s on)
n = int(9.0 * SR); t = np.arange(n) / SR
add(lowpass(noise(n), 0.03) * 6 * np.minimum(1, t / 1.5), 104.16, 0.0, 0.08)
cry(111.9, 0.08, 880)
gongf(112.9, 0.16)

# fade in/out, normalise to a quiet level (the voice sits on top)
fade = np.ones(N); fade[: int(0.2 * SR)] = np.linspace(0, 1, int(0.2 * SR)); fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
out *= fade[:, None]
out *= 0.5 / np.max(np.abs(out))
with wave.open('public/audio/jatayu-bed.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((out * 32767).astype(np.int16).tobytes())
print('wrote public/audio/jatayu-bed.wav', round(DUR, 2), 's')
