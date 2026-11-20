# Code-made music bed and sound effects for "Bhima and the old monkey" (Epic Mythology, Vana Parva 146-150).
# No samples, no downloads. Same kit as make_bed_khar_dushan.py: a tanpura-like drone, a flute-like line and temple
# bells, plus the wind, the climb, the strain at the tail, the reveal, the giant form, Kurukshetra and the night fire,
# timed to the narration at 1.15x (words.ts). Run from the studio folder: python3 scripts/make_bed_bhima_hanuman.py
import numpy as np, wave
try:
    from scipy.signal import lfilter
except ImportError:
    lfilter = None

SR = 48000
DUR = 4335 / 30
N = int(SR * DUR)
rng = np.random.default_rng(22)
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
def env_io(t, a, b): return np.clip(np.minimum(t / a, (t[-1] - t) / b), 0, 1)

# ---------- Tanpura drone, all the way through (quieter in the morning) ----------
def pluck(f0, length=3.6):
    t = tt(length)
    s = np.zeros_like(t)
    for h in range(1, 14):
        amp = (1 / h) * (1 + 0.6 * np.sin(2 * np.pi * (0.7 + h * 0.13) * t + h))
        s += amp * np.sin(2 * np.pi * f0 * h * t) * np.exp(-t * (0.9 + h * 0.18))
    return s * np.minimum(1, t / 0.01)
cycle = [SA * 1.5 / 2, SA, SA, SA / 2]
k = 0; t0 = 0.0
while t0 < DUR:
    g = 0.035 if 6.1 < t0 < 15.2 else 0.05
    add(pluck(cycle[k % 4]), t0, pan=[-0.3, 0.1, 0.25, -0.1][k % 4], gain=g)
    t0 += 0.9; k += 1

# ---------- Flute-like line ----------
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
phrases = [
    (6.2, [('S', 2), ('R', 2), ('G', 2), ('P', 4), ('G', 2), ('R', 2), ('S', 4)]),
    (21.2, [('G', 2), ('P', 2), ('D', 2), ("S'", 4), ('D', 2), ('P', 4)]),
    (36.4, [('P', 2), ('G', 2), ('R', 2), ('S', 4)]),
    (47.0, [('G', 1), ('P', 1), ('D', 2)]),
    (69.8, [('S', 1), ('R', 1), ('G', 1), ('P', 2), ('D', 2), ("S'", 4), ('D', 2), ('P', 4)]),
    (80.4, [('G', 2), ('R', 2), ('S', 2), ('d', 4)]),
    (101.4, [('S', 2), ('R', 2), ('G', 4)]),
    (108.6, [('P', 2), ('D', 2), ("S'", 4), ("R'", 2), ("S'", 4)]),
    (111.6, [("S'", 2), ('D', 2), ('P', 2), ('G', 4)]),
    (131.0, [('S', 2), ('R', 2), ('G', 2), ('P', 4), ('G', 4)]),
    (137.0, [('G', 2), ('P', 2), ('D', 2), ("S'", 6), ('D', 2), ("S'", 8)]),
]
for start, notes in phrases:
    t = start
    for n, beats in notes:
        L = beats * 0.6
        add(flute(scale[n], L + 0.25), t, pan=0.15, gain=0.07)
        t += L

def bell(f0=520, length=4.5, bright=1.0):
    t = tt(length)
    parts = [(1, 1), (2.76, 0.6), (5.4, 0.35 * bright), (8.93, 0.2 * bright), (0.5, 0.4)]
    s = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * (0.7 + r * 0.35)) for r, a in parts)
    return s * np.minimum(1, t / 0.003)
for tb in (6.12, 21.04, 69.66, 108.52, 130.09, 141.66):
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
def drum(start, gain=0.2, f0=62):
    t = tt(0.6)
    f = f0 * (1 + 0.8 * np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + lowpass(noise(len(t)), 0.3) * np.exp(-t * 40) * 0.5
    add(s, start, 0.0, gain)
def roar(start, length, gain=0.12, pan=0.0):
    # a crowd of rakshasas: many low growls blurred together
    t = tt(length)
    s = np.zeros_like(t)
    for j in range(6):
        f = 90 + j * 23 + 8 * np.sin(2 * np.pi * (0.7 + j * 0.3) * t + j)
        s += np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.15
    s = lowpass(s + lowpass(noise(len(t)), 0.08) * 2.5, 0.12) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * t))
    add(s * env_io(t, 0.4, 0.8), start, pan, gain)
def zip_(start, gain=0.05, pan=0.0):
    n = int(0.22 * SR); t = np.arange(n) / SR
    f = 2600 - 1700 * t / t[-1]
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + lowpass(noise(n), 0.5)
    add(s * np.sin(np.pi * t / t[-1]) ** 2, start, pan, gain)


# ---------- Hook (0-6.1 s): Bhima straining at the tail ----------
n = int(6 * SR); t = np.arange(n) / SR
add(lowpass(noise(n), 0.012) * 6 * np.linspace(0.4, 1, n), 0.0, 0.0, 0.06)  # a low rumble of effort
for st in (0.3, 1.5, 2.9, 4.2): thud(st, 0.35, 0.5)
gongf(5.0, 0.14, 55)

# ---------- The camp (6.1-15.2 s): morning birds, the wind that brings the lotus ----------
for j in range(18):
    st = 6.3 + rng.uniform(0, 8.5)
    tb = tt(0.18)
    f = 3200 + 1400 * np.sin(np.pi * tb / 0.18)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tb / 0.18) ** 2, st, rng.uniform(-0.7, 0.7), 0.02)
whoosh(3.6, 0.12, 7.3, pan=0.4)
for j, r in enumerate([4, 5, 6, 8]):  # a shimmer as the lotus arrives
    t = tt(2.5); add(np.sin(2 * np.pi * SA * r * t) * np.exp(-t * 1.4) * 0.03, 9.3 + j * 0.15, pan=(j - 1.5) * 0.3)

# ---------- The climb (15.2-21 s): footsteps, the roar, trees torn up ----------
for j in range(int(5.8 / 0.42)): drum(15.3 + j * 0.42, 0.12, 58)
roar(18.4, 1.6, 0.14)
for st in (19.45, 19.9, 20.4):
    thud(st, 0.6, 0.6)
    add(lowpass(noise(int(0.25 * SR)), 0.6) * np.exp(-tt(0.25) * 18) * 1.5, st - 0.05, rng.uniform(-0.5, 0.5), 0.12)  # wood cracking

# ---------- The grove (21-65.9 s) ----------
n = int(44.8 * SR); t = np.arange(n) / SR
add(lowpass(noise(n), 0.02) * 3 * env_io(t, 2, 2), 21.0, -0.3, 0.035)  # leaves in the wind
roar(27.5, 1.0, 0.12)  # "hato!"
whoosh(1.2, 0.08, 37.6)  # the light inside the old monkey
for j, r in enumerate([4, 6, 8]):
    t = tt(2.0); add(np.sin(2 * np.pi * SA * r * t) * np.exp(-t * 1.6) * 0.025, 46.9 + j * 0.12)  # the smile
add(np.sin(2 * np.pi * 220 * tt(0.6)) * np.exp(-tt(0.6) * 5) * 0.05, 57.6)  # the tail does not move
n = int(4.4 * SR); t = np.arange(n) / SR
add(lowpass(noise(n), 0.01) * 8 * np.linspace(0.3, 1, n), 59.0, 0.0, 0.07)  # the strain builds
for st in (59.5, 60.6, 61.7, 62.6): thud(st, 0.5, 0.5); drum(st, 0.14, 50)
gongf(63.3, 0.18, 50)

# ---------- The reveal (69.7 s) and the giant (92.2-101 s) ----------
gongf(69.66, 0.22, 62)
for j, r in enumerate([4, 5, 6, 8, 10]):
    t = tt(3.0); add(np.sin(2 * np.pi * SA * r * t) * np.exp(-t * 1.1) * 0.035, 69.7 + j * 0.12, pan=(j - 2) * 0.3)
n = int(8.0 * SR); t = np.arange(n) / SR
add(lowpass(noise(n), 0.01) * 9 * np.clip(t / 4, 0, 1) * np.clip((8 - t) / 1.5, 0, 1), 92.2, 0.0, 0.09)  # the swell as he grows
for j in range(int(4 / 0.5)): drum(92.3 + j * 0.5, 0.18, 46)
for st in (93.2, 94.8): thud(st, 1.0, 1.0)
gongf(95.6, 0.3, 44)
whoosh(1.0, 0.12, 100.2)  # back to his own size

# ---------- Kurukshetra (116.6-130 s): conches, drums, the roar from the flag ----------
for j in range(int(13 / 0.6)): drum(116.7 + j * 0.6, 0.1, 60)
t = tt(2.4)
conch = sum(a * np.sin(2 * np.pi * 233 * h * t) for h, a in [(1, 1), (2, 0.5), (3, 0.3), (4, 0.15)]) * np.clip(t / 0.3, 0, 1) * np.clip((2.4 - t) / 0.6, 0, 1)
add(conch, 117.0, -0.3, 0.05)
roar(121.2, 2.2, 0.22)
thud(121.3, 1.0, 1.0); gongf(121.3, 0.22, 50)

# ---------- The Ram-katha at night (130-136.8 s): a fire ----------
n = int(6.8 * SR); t = np.arange(n) / SR
fire = lowpass(noise(n), 0.05) * 3
for j in range(80):
    i = int(rng.uniform(0, n - 2000)); fire[i:i + 400] += noise(400) * np.exp(-np.arange(400) / 60) * 2
add(fire * env_io(t, 0.4, 0.4), 130.09, 0.1, 0.05)

fade = np.ones(N); fade[: int(0.1 * SR)] = np.linspace(0, 1, int(0.1 * SR)); fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
out *= fade[:, None]
out *= 0.5 / np.max(np.abs(out))
with wave.open('public/audio/bhima-hanuman-bed.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((out * 32767).astype(np.int16).tobytes())
print('wrote public/audio/bhima-hanuman-bed.wav', round(DUR, 2), 's')
