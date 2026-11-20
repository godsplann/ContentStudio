# Code-made music bed and sound effects for "Khar-Dushan" (Ram against the 14,000; Indian mythology theme).
# No samples, no downloads. Same kit as make_bed_jatayu.py: a tanpura-like drone, a flute-like line in a
# Bhupali-like scale and temple bells, plus war drums, crowd roars, arrow zips, a camp fire and morning birds,
# all timed to the narration's word timings. Run from the studio folder: python3 scripts/make_bed_khar_dushan.py
import numpy as np, wave
try:
    from scipy.signal import lfilter
except ImportError:
    lfilter = None

SR = 48000
DUR = 3822 / 30
N = int(SR * DUR)
rng = np.random.default_rng(14)
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
    g = 0.035 if 22.5 < t0 < 36.3 else 0.05
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
    (10.2, [('d', 2), ('S', 2), ('R', 1), ('G', 3)]),
    (22.6, [('S', 2), ('R', 2), ('G', 2), ('P', 4), ('G', 2), ('R', 2), ('S', 4)]),
    (27.4, [('G', 2), ('P', 2), ('D', 2), ("S'", 4)]),
    (33.6, [('R', 2), ('S', 2), ('d', 4)]),
    (65.5, [('S', 3), ('d', 3), ('S', 4)]),
    (72.4, [('G', 2), ('P', 2), ('D', 4)]),
    (94.8, [("S'", 2), ('D', 2), ('P', 2), ('G', 4), ('R', 4)]),
    (104.0, [('S', 1), ('R', 1), ('G', 1), ('P', 2), ('D', 2), ("S'", 4)]),
    (110.0, [("S'", 2), ('D', 2), ('P', 2), ('G', 4)]),
    (117.2, [('G', 1), ('P', 1), ('D', 1), ("S'", 2), ("R'", 4), ("S'", 6)]),
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
for tb in (22.56, 94.72, 117.12, 122.16):
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

# ---------- Hook (0-22.5 s): the army roaring, war drums, Ram's arrows ----------
roar(0.0, 6.6, 0.16)
roar(6.4, 4.0, 0.06)
for j in range(int(22 / 0.45)):
    st = j * 0.45
    if st < 22.3: drum(st, 0.14 if j % 4 else 0.22)
whoosh(0.5, 0.22, 14.6)
for st in np.arange(17.6, 21.6, 0.18): zip_(st + rng.uniform(0, 0.08), 0.05, rng.uniform(-0.6, 0.6))
for st in (18.6, 19.6, 20.6): thud(st, 0.5, 0.5)
gongf(21.5, 0.12, 55)

# ---------- Morning at Panchavati (22.5-36.3 s): birds, a stream ----------
n = int(13.8 * SR); t = np.arange(n) / SR
add(lowpass(noise(n), 0.05) * 2 * env_io(t, 1, 1), 22.56, -0.4, 0.04)
for j in range(22):
    st = 22.8 + rng.uniform(0, 13)
    tb = tt(0.18)
    f = 3200 + 1400 * np.sin(np.pi * tb / 0.18)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tb / 0.18) ** 2, st, rng.uniform(-0.7, 0.7), 0.02)
add(np.sin(2 * np.pi * 180 * tt(1.2)) * np.exp(-tt(1.2) * 2) * 0.05, 33.5)  # a low sting as she is shamed

# ---------- Khara's camp (36.3-53.4 s): fire, drums, the roar ----------
n = int(17.2 * SR); t = np.arange(n) / SR
fire = lowpass(noise(n), 0.05) * 3
for j in range(200):
    i = int(rng.uniform(0, n - 2000)); fire[i:i + 400] += noise(400) * np.exp(-np.arange(400) / 60) * 2
add(fire * env_io(t, 0.4, 0.4), 36.32, 0.1, 0.05)
for j in range(int(14 / 0.9)):
    drum(36.4 + j * 0.9, 0.1, 55)
roar(44.9, 1.8, 0.2)  # Khara roars
gongf(46.32, 0.2)
for j, st in enumerate([47.92, 48.8]): whoosh(0.4, 0.18, st, pan=-0.3 + j * 0.6)
for j in range(int(5.4 / 0.3)):  # marching drums
    drum(50.24 + j * 0.3, 0.16 if j % 2 else 0.24, 70)
roar(50.4, 3.4, 0.1)
roar(53.44, 2.2, 0.18)  # the charge
thud(54.3, 0.8, 1.0)

# ---------- Scene 2 (55.6-65.4 s): tension rising ----------
n = int(9.8 * SR); t = np.arange(n) / SR
add(lowpass(noise(n), 0.015) * 6 * np.linspace(0.3, 1, n), 55.6, 0.0, 0.05)
for j in range(int(9.6 / 0.9)): drum(55.8 + j * 0.9, 0.08, 50)

# ---------- The battle (65.4-94.7 s) ----------
n = int(29.3 * SR); t = np.arange(n) / SR
add(lowpass(noise(n), 0.03) * 6 * env_io(t, 1.5, 1.0), 65.44, -0.2, 0.06)  # storm wind
roar(68.96, 3.4, 0.2)  # from all sides
gongf(72.32, 0.14, 60)  # unshaken
for st in np.arange(75.5, 85.6, 0.09):
    zip_(st + rng.uniform(0, 0.05), 0.045, rng.uniform(-0.7, 0.7))
for st in np.arange(76.4, 85.8, 0.35):
    thud(st + rng.uniform(0, 0.1), 0.25, 0.4)
for j in range(int(10 / 0.45)): drum(75.44 + j * 0.45, 0.16, 66)
for st in (85.9, 86.85): thud(st, 0.9, 0.8); zip_(st - 0.2, 0.08)
whoosh(0.4, 0.2, 86.4)
roar(88.24, 2.8, 0.2, 0.2)  # Khara charges
for j in range(int(2.8 / 0.4)): thud(88.4 + j * 0.4, 0.35, 0.3)
zip_(92.05, 0.12)
thud(92.25, 1.3, 1.2); gongf(92.25, 0.3, 48)

# ---------- Ending ----------
roar(99.4, 4.4, 0.06)  # the army remembered, far away
gongf(103.92, 0.18)
n = int(22 * SR); t = np.arange(n) / SR
add(lowpass(noise(n), 0.02) * 4 * env_io(t, 2, 3), 104.0, 0.0, 0.04)
for j, r in enumerate([4, 5, 6, 8, 10]):
    t = tt(3.0); add(np.sin(2 * np.pi * SA * r * t) * np.exp(-t * 1.1) * 0.03, 117.12 + j * 0.12, pan=(j - 2) * 0.3)
gongf(122.16, 0.2)
for j in range(4): drum(122.3 + j * 0.6, 0.12, 60)

fade = np.ones(N); fade[: int(0.1 * SR)] = np.linspace(0, 1, int(0.1 * SR)); fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
out *= fade[:, None]
out *= 0.5 / np.max(np.abs(out))
with wave.open('public/audio/khar-dushan-bed.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((out * 32767).astype(np.int16).tobytes())
print('wrote public/audio/khar-dushan-bed.wav', round(DUR, 2), 's')
