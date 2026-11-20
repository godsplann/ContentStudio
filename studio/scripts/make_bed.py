# Code-made music bed and sound effects for "What is a GPU?" (no samples, no downloads).
# Run from the studio folder: python3 scripts/make_bed.py  (needs numpy)
import numpy as np, wave
SR = 48000
DUR = 726 / 30
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(4)
out = np.zeros((N, 2))

def note(f): return 440.0 * 2 ** ((f - 69) / 12)
def env(n, a, r):
    e = np.ones(n); a = min(a, n); r = min(r, n)
    e[:a] = np.linspace(0, 1, a); e[n - r:] *= np.linspace(1, 0, r); return e
def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N: return
    s = sig[: j - i] * gain
    out[i:j, 0] += s * (1 - pan) ** 0.5
    out[i:j, 1] += s * (1 + pan) ** 0.5

# Pad: Am - F - C - G, about 6 s each, soft detuned sines with gentle harmonics
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]
seg = DUR / 4
for k, ch in enumerate(chords):
    n = int(seg * SR) + SR
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for m in ch:
        for det in (-0.12, 0.12):
            f = note(m) * 2 ** (det / 12)
            s += np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt) + 0.08 * np.sin(6 * np.pi * f * tt)
    s *= env(n, int(1.2 * SR), int(1.4 * SR)) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.25 * tt))
    add(s / 12, k * seg - 0.3 if k else 0, pan=0.0)

# Soft plucked arpeggio, eighth notes at 100 bpm, quiet
step = 60 / 100 / 2
i = 0
while i * step < DUR - 0.5:
    ch = chords[min(3, int(i * step / seg))]
    m = ch[[0, 2, 1, 3, 2, 1, 3, 2][i % 8]] + 12
    n = int(0.5 * SR); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * note(m) * tt) + 0.3 * np.sin(4 * np.pi * note(m) * tt)) * np.exp(-tt * 9)
    add(s * 0.06, i * step, pan=0.35 if i % 2 else -0.35)
    i += 1

# Low pulse to keep it moving
for k in range(int(DUR / (step * 2))):
    n = int(0.3 * SR); tt = np.arange(n) / SR
    m = chords[min(3, int(k * step * 2 / seg))][0] - 12
    add(np.sin(2 * np.pi * note(m) * tt) * np.exp(-tt * 10) * 0.12, k * step * 2)

def noise(n): return rng.standard_normal(n)
def lowpass(x, a):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y

# Paper tower topples on "alone" (6.64 s): many short crinkles
for k in range(46):
    n = int(rng.uniform(0.02, 0.07) * SR)
    g = noise(n) * env(n, 30, n // 2) * np.hanning(n) ** 0.3
    add(g * rng.uniform(0.05, 0.14), 6.64 + rng.uniform(0, 0.9) ** 1.6, pan=rng.uniform(-0.6, 0.8))
add(lowpass(noise(int(0.25 * SR)), 0.02) * env(int(0.25 * SR), 50, 9000) * 1.2, 6.64)

# CPU cores: a soft tick each time a tile gets painted (four cores together, every 9 frames)
f0 = 238 / 30
k = 0
while f0 + (k + 0.7) * 9 / 30 < 12.47:
    n = int(0.05 * SR); tt = np.arange(n) / SR
    add(np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 90) * 0.09, f0 + (k + 0.7) * 9 / 30, pan=0.2)
    k += 1

# Whip to the GPU (12.47 s)
n = int(0.4 * SR); tt = np.arange(n) / SR
w = noise(n)
w = lowpass(w, 0.05) * 3 + lowpass(w, 0.25) * np.linspace(0, 1, n) ** 2
add(w * np.sin(np.pi * tt / tt[-1]) ** 2 * 0.22, 12.42, pan=-0.2)

# All the GPU tiles light at once (15.36 s): a bright shimmer chord
for j, m in enumerate([84, 88, 91, 96, 100]):
    n = int(1.6 * SR); tt = np.arange(n) / SR
    add(np.sin(2 * np.pi * note(m) * tt) * np.exp(-tt * 3.2) * 0.07, 15.49 + j * 0.03, pan=(j - 2) * 0.25)
add(lowpass(noise(int(0.8 * SR)), 0.6) * env(int(0.8 * SR), 400, 30000) * 0.025, 15.49)

# Sign pops up (17.53 s)
n = int(0.15 * SR); tt = np.arange(n) / SR
add(np.sin(2 * np.pi * (300 + 900 * tt / tt[-1]) * tt) * np.exp(-tt * 30) * 0.25, 17.53)

# Screen switches: games, video, AI
for s0 in (21.84, 22.52, 23.04):
    n = int(0.12 * SR); tt = np.arange(n) / SR
    add(np.sign(np.sin(2 * np.pi * 1320 * tt)) * np.exp(-tt * 40) * 0.05, s0)

# Fade in/out and normalise the bed to a quiet level (voice sits on top)
fade = np.ones(N); fade[: int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR)); fade[-int(0.8 * SR):] = np.linspace(1, 0, int(0.8 * SR))
out *= fade[:, None]
out *= 0.5 / np.max(np.abs(out))
with wave.open('public/audio/what-is-a-gpu-bed.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((out * 32767).astype('<i2').tobytes())
print('wrote public/audio/what-is-a-gpu-bed.wav', DUR)
