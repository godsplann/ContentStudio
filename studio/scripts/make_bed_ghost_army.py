# Code-made music bed and effects for the Undercover short "The Soldiers Who Lifted a Tank" (the Ghost Army).
# Run from the studio folder: python3 scripts/make_bed_ghost_army.py  (needs numpy; scipy is used if present)
# Undercover sound: a light, bouncy marimba march in C, with a rubbery "boing" hidden in the very first lift
# (the twist, planted), a bicycle bell and a stop on "freeze", crickets, a bulldozer and rumbling speaker trucks at
# night, a bright morning, a cafe musette in town, a plane drone with shutter clicks, rubber squeaks on the reveal,
# a rising whoosh as the tank inflates, a march for the "division", a hush and a chime for the Ghost Army and 1996,
# and a hiss with a sliding-down whistle as the plug comes out. Effect times are seconds from src/ghost-army/words.ts.
import numpy as np, wave
try:
    from scipy.signal import lfilter
except Exception:
    lfilter = None

SR = 48000
DUR = 62.5
N = int(SR * DUR)
rng = np.random.default_rng(11)
out = np.zeros((N, 2))

def note(m): return 440.0 * 2 ** ((m - 69) / 12)
def env(n, a, r):
    e = np.ones(n); a = min(a, n); r = min(r, n)
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[n - r:] *= np.linspace(1, 0, r)
    return e
def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig)); s = sig[: j - i] * gain
    out[i:j, 0] += s * (1 - pan) ** 0.5
    out[i:j, 1] += s * (1 + pan) ** 0.5
def lowpass(x, a):
    if lfilter is not None: return lfilter([a], [1, a - 1], x)
    y = np.zeros_like(x); acc = 0.0
    for k, v in enumerate(x): acc += a * (v - acc); y[k] = acc
    return y
def noise(n): return rng.standard_normal(n)
def sweep(f0, f1, length, shape=1.0):
    n = int(length * SR); u = np.linspace(0, 1, n) ** shape
    f = f0 + (f1 - f0) * u
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def marimba(m, length=0.5):
    n = int(length * SR); tt = np.arange(n) / SR; f = note(m)
    return (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt * 30)) * np.exp(-tt * 9)
def pluck_bass(m, length=0.4):
    n = int(length * SR); tt = np.arange(n) / SR; f = note(m)
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 6)
def bell_tone(m, length=1.6, decay=2.5):
    n = int(length * SR); tt = np.arange(n) / SR; f = note(m)
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt * 6)) * np.exp(-tt * decay)

BPM = 112
beat = 60 / BPM
def energy(t):
    if t < 7.4: return 0.6      # the lift
    if t < 8.2: return 0.0      # "freeze": the music stops dead
    if t < 14.0: return 0.55    # how? / very strong
    if t < 16.4: return 0.3     # that night: thinning out
    if t < 25.5: return 0.45    # night: muted, with the machines
    if t < 30.0: return 0.65    # morning
    if t < 35.6: return 0.0     # town: the musette instead
    if t < 39.1: return 0.5     # the plane
    if t < 42.4: return 0.25    # the reveal: a hush
    if t < 45.0: return 0.6     # inflating
    if t < 48.9: return 0.95    # the division: full march
    if t < 52.9: return 0.8     # the real attack
    if t < 59.2: return 0.0     # Ghost Army and the secret: pad and clock
    return 0.55                 # back in the field
major = [[48, 52, 55, 60], [53, 57, 60, 65], [55, 59, 62, 67], [48, 52, 55, 60]]   # C F G C
night = [[45, 48, 52, 57], [41, 45, 48, 53], [43, 47, 50, 55], [45, 48, 52, 57]]   # Am F G Am

k = 0
t = 0.0
while t < DUR - 0.3:
    e = energy(t)
    bar = int(t / (beat * 4))
    ch = night[bar % 4] if 14.0 <= t < 25.5 else major[bar % 4]
    if e > 0:
        step = k % 8
        if step in (0, 4): add(pluck_bass(ch[0] - 12), t, gain=0.17 * e)
        if e > 0.4 or step % 2 == 1:
            m = ch[[1, 2, 3, 2, 1, 3, 2, 3][step]] + 12
            add(marimba(m), t, pan=0.35 if step % 2 else -0.35, gain=0.07 * (0.5 + e))
        if e > 0.6 and step in (2, 6):
            n = int(0.08 * SR); s = lowpass(noise(n), 0.5) * np.exp(-np.arange(n) / SR * 40)
            add(s, t, pan=0.15, gain=0.06 * e)
        if e > 0.9 and step in (1, 3, 5, 7):  # snare rolls for the parade-ground division
            n = int(0.05 * SR); s = lowpass(noise(n), 0.6) * np.exp(-np.arange(n) / SR * 60)
            add(s, t + beat / 4, pan=-0.15, gain=0.035)
    k += 1
    t += beat / 2

# ---- effects ----
def boing(at, f0=180, f1=420, length=0.55, gain=0.16):
    n = int(length * SR); tt = np.arange(n) / SR
    f = f0 + (f1 - f0) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * tt) * np.exp(-tt * 5))
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5) * env(n, 200, 2000), at, gain=gain)
def squeak(at, gain=0.07):
    n = int(0.18 * SR); tt = np.arange(n) / SR
    f = 1400 + 600 * np.sin(np.pi * tt / 0.18)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6
    add(lowpass(s, 0.4) * env(n, 300, 1500), at, pan=0.2, gain=gain)
def bike_bell(at):
    for i in range(2):
        add(bell_tone(88, 0.8, 5) + 0.6 * bell_tone(95, 0.8, 6), at + i * 0.16, pan=0.4, gain=0.07)
def brakes(at):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    f = 2300 - 300 * tt / 0.5
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 500, 6000) * (0.6 + 0.4 * np.sin(2 * np.pi * 40 * tt)), at, pan=0.4, gain=0.05)
def thud(at, gain=0.25):
    n = int(0.4 * SR); tt = np.arange(n) / SR
    add(lowpass(noise(n), 0.1) * np.exp(-tt * 14) + np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 16), at, gain=gain)
def whoosh(at, length, gain=0.2, rise=False):
    n = int(length * SR); tt = np.arange(n) / SR
    shape = (tt / length) ** 2 if rise else np.sin(np.pi * tt / length) ** 2
    add(lowpass(noise(n), 0.05) * shape, at, gain=gain)
def chime(at, notes=(72, 76, 79, 84), gain=0.15):
    for i, m in enumerate(notes):
        add(bell_tone(m, 1.8), at + i * 0.07, pan=(i - 1.5) * 0.3, gain=gain)
def crickets(a, b, gain=0.02):
    t = a
    while t < b:
        for c in range(3):
            n = int(0.03 * SR); tt = np.arange(n) / SR
            add(np.sin(2 * np.pi * 4300 * tt) * np.sin(np.pi * tt / 0.03), t + c * 0.045, pan=rng.uniform(-0.8, 0.8), gain=gain)
        t += rng.uniform(0.25, 0.6)
def engine(a, b, f0, gain, pan=0.0, clank=0.0):
    n = int((b - a) * SR); tt = np.arange(n) / SR
    saw = 2 * ((f0 * tt) % 1) - 1
    s = lowpass(saw, 0.05) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * tt)) + 0.3 * lowpass(noise(n), 0.03)
    if clank:
        c = (np.sin(2 * np.pi * 6 * tt) > 0.96).astype(float)
        s += clank * lowpass(noise(n), 0.4) * lowpass(c, 0.02) * 6
    add(s * env(n, int(0.6 * SR), int(0.8 * SR)), a, pan=pan, gain=gain)
def brush(at):
    n = int(0.22 * SR); tt = np.arange(n) / SR
    add(lowpass(noise(n), 0.3) * np.sin(np.pi * tt / 0.22) ** 2, at, pan=-0.2, gain=0.035)
def musette(a, b):
    chords = [[60, 64, 67], [62, 65, 69], [59, 62, 67], [60, 64, 67]]
    t = a
    i = 0
    while t < b:
        for m in chords[i % 4]:
            n = int(beat * 2 * SR); tt = np.arange(n) / SR; f = note(m + 12)
            s = (2 * ((f * tt) % 1) - 1) * 0.5 + (2 * ((f * 1.004 * tt) % 1) - 1) * 0.5
            add(lowpass(s, 0.25) * (0.75 + 0.25 * np.sin(2 * np.pi * 6 * tt)) * env(n, 800, 3000), t, pan=0.1, gain=0.022)
        add(pluck_bass(chords[i % 4][0] - 24), t, gain=0.12)
        add(pluck_bass(chords[i % 4][2] - 24), t + beat, gain=0.09)
        t += beat * 2
        i += 1
def fanfare(at):
    for i, m in enumerate([67, 72, 76, 79]):
        n = int(0.22 * SR); tt = np.arange(n) / SR; f = note(m)
        s = sum(np.sin(2 * np.pi * f * h * tt) / h for h in range(1, 6))
        add(s * env(n, 300, 3000), at + i * 0.12, gain=0.05)
def slide_down(at, length=0.9, f0=1500, f1=350, gain=0.07):
    n = int(length * SR); tt = np.arange(n) / SR
    s = sweep(f0, f1, length, 0.8) * (1 + 0.15 * np.sin(2 * np.pi * 6 * tt))
    add(s * env(n, 400, 3000), at, gain=gain)
def drone(a, b, gain, doppler=True):
    n = int((b - a) * SR); tt = np.arange(n) / SR
    u = tt / (b - a)
    f = 92 * (1.06 - 0.12 * u) if doppler else 92
    ph = np.cumsum(np.full(n, 1.0) * f) / SR
    s = (2 * ((ph * 1.0) % 1) - 1) + 0.5 * (2 * ((ph * 2.01) % 1) - 1)
    s = lowpass(s, 0.08) * np.sin(np.pi * u) ** 1.5
    add(s, a, pan=0.0, gain=gain)
def shutter(at):
    for d, g in ((0, 0.12), (0.05, 0.08)):
        n = int(0.03 * SR)
        add(lowpass(noise(n), 0.8) * np.exp(-np.arange(n) / SR * 120), at + d, pan=0.1, gain=g)
def compressor(a, b):
    t = a
    while t < b:
        n = int(0.09 * SR); tt = np.arange(n) / SR
        add(lowpass(noise(n), 0.15) * np.exp(-tt * 30) + 0.5 * np.sin(2 * np.pi * 60 * tt) * np.exp(-tt * 30), t, pan=-0.3, gain=0.07)
        t += 0.16
def hiss(at, length, gain=0.07):
    n = int(length * SR); tt = np.arange(n) / SR
    s = (noise(n) - lowpass(noise(n), 0.2)) * env(n, 600, int(length * SR * 0.4))
    add(s, at, pan=-0.2, gain=gain)
def tick(a, b, gain=0.05):
    t = a
    i = 0
    while t < b:
        n = int(0.02 * SR); tt = np.arange(n) / SR
        add(np.sin(2 * np.pi * (2500 if i % 2 else 2000) * tt) * np.exp(-tt * 300), t, pan=0.2 if i % 2 else -0.2, gain=gain)
        t += 0.25
        i += 1
def pad(a, b, notes, gain=0.03):
    n = int((b - a) * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * note(m) * tt + 0.3 * np.sin(2 * np.pi * 0.3 * tt)) for m in notes)
    add(s * env(n, int(0.8 * SR), int(1.0 * SR)), a, gain=gain)
def creak(at):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    f = 160 + 90 * tt / 0.5
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (np.sin(2 * np.pi * 30 * tt) > 0)
    add(lowpass(s, 0.3) * env(n, 300, 4000), at, gain=0.04)

# the lift: a heave, then a cheeky rubbery boing (planted for the twist)
thud(0.0, 0.18)
boing(3.5, 150, 330, 0.5, 0.12)
bike_bell(5.7)
brakes(7.35)
boing(10.85, 300, 520, 0.35, 0.07)    # the shrug
thud(13.25, 0.22)                     # "very strong"
whoosh(14.0, 2.2, 0.12)               # day to night
crickets(15.2, 25.6)
engine(16.3, 25.6, 46, 0.09, pan=-0.2)                 # the bulldozer
engine(20.0, 25.4, 38, 0.13, pan=0.35, clank=0.6)      # tank noises from the speakers
thud(21.8, 0.3)                       # "blast"
chime(25.6, (79, 84, 88), 0.08)       # morning
for x in (27.2, 27.6, 28.1, 28.5, 29.0): brush(x)
musette(29.9, 35.6)
fanfare(32.7)                         # the "general" shows off
slide_down(34.25, 0.8, 1200, 500, 0.05)  # the paper star flutters down
drone(35.5, 39.2, 0.12)
for x in (37.62, 37.95, 38.32): shutter(x)
squeak(39.96)
squeak(40.3, 0.05)
boing(41.6, 140, 300, 0.7, 0.2)       # "rubber"
chime(41.62, (76, 79, 84), 0.09)
whoosh(42.4, 2.4, 0.22, rise=True)    # inflating: a rising whoosh
compressor(42.4, 44.7)
n_ = int(2.3 * SR); add(sweep(220, 660, 2.3, 1.5) * env(n_, 2000, 4000), 42.45, gain=0.04)
boing(44.6, 220, 440, 0.45, 0.12)     # full: a springy settle
drone(48.6, 50.8, 0.1)
shutter(49.81); shutter(50.1)
whoosh(50.35, 0.5, 0.3)               # the whip to the real attack
engine(50.6, 53.2, 34, 0.16, pan=0.0, clank=0.9)
pad(52.9, 55.6, [55, 60, 64, 67, 72], 0.025)   # the Ghost Army: a soft shimmer
chime(54.35, (84, 88, 91), 0.06)
tick(55.5, 57.3)                      # the years tick by
creak(57.3)
chime(57.4, (72, 76, 79, 84), 0.15)   # 1996
squeak(61.05, 0.06)
hiss(61.15, 1.35, 0.09)               # the plug
slide_down(61.25, 1.2, 900, 220, 0.07)

# master: gentle fade-in, soft limiter
out[: int(0.2 * SR)] *= np.linspace(0, 1, int(0.2 * SR))[:, None]
peak = np.max(np.abs(out)) or 1.0
out = np.tanh(out / peak * 1.2) * 0.85
with wave.open('public/audio/ghost-army-bed.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('wrote public/audio/ghost-army-bed.wav', round(DUR, 1), 's')
