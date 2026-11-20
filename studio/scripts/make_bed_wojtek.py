# Code-made music bed and effects for the Undercover short "The Soldier Who Ate His Cigarettes" (Wojtek).
# Run from the studio folder: python3 scripts/make_bed_wojtek.py  (needs numpy; scipy is used if present)
# Undercover sound: a light, bouncy marimba march (a soldierly snare tap on top), cheeky under the camp scenes,
# a stop for "no pets", building at Monte Cassino, a chime on the badge reveal and a pen scratch to end on.
# Effect times are seconds from src/wojtek/words.ts.
import numpy as np, wave
try:
    from scipy.signal import lfilter
except Exception:
    lfilter = None

SR = 48000
DUR = 1962 / 30
N = int(SR * DUR)
rng = np.random.default_rng(5)
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

def marimba(m, length=0.5):
    n = int(length * SR); tt = np.arange(n) / SR; f = note(m)
    return (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt * 30)) * np.exp(-tt * 9)
def pluck_bass(m, length=0.4):
    n = int(length * SR); tt = np.arange(n) / SR; f = note(m)
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 6)

BPM = 116
beat = 60 / BPM
# Energy over time: 0 quiet .. 1 full
def energy(t):
    if t < 9.2: return 0.5      # the desk, the hook
    if t < 20.1: return 0.6     # the cub
    if t < 25.7: return 0.75    # beer and cigarettes, comic
    if t < 29.3: return 0.65    # sail to Italy
    if t < 30.6: return 0.0     # "no pets": the music stops
    if t < 35.4: return 0.6     # the officer laughs
    if t < 43.5: return 0.8     # made a soldier, up the ramp
    if t < 49.9: return 0.7     # Monte Cassino
    if t < 56.1: return 0.95    # he picks one up, and another
    if t < 60.3: return 0.45    # the badge: softer
    if t < 64.0: return 0.3     # the papers again
    return 0.0
# Chords (F major, cheerful): I - IV - V - I, a sly vi - ii for the officer
prog = [[41, 45, 48, 53], [46, 50, 53, 58], [48, 52, 55, 60], [41, 45, 48, 53]]
sly = [[50, 53, 57, 62], [43, 50, 53, 58]]

k = 0
t = 0.0
while t < DUR - 0.3:
    e = energy(t)
    bar = int(t / (beat * 4))
    ch = sly[bar % 2] if 30.6 <= t < 35.4 else prog[bar % 4]
    if e > 0:
        step = k % 8
        if step in (0, 4): add(pluck_bass(ch[0] - 12), t, gain=0.16 * e)
        if e > 0.5 or step % 2 == 1:
            m = ch[[1, 2, 3, 2, 1, 3, 2, 3][step]] + 12
            add(marimba(m), t, pan=0.35 if step % 2 else -0.35, gain=0.07 * (0.5 + e))
        # a little snare tap on the off-beats: the march
        if e > 0.6 and step in (2, 6):
            n = int(0.08 * SR); s = lowpass(noise(n), 0.5) * np.exp(-np.arange(n) / SR * 40)
            add(s, t, pan=0.15, gain=0.05 * e)
    k += 1
    t += beat / 2

# ---- effects ----
def boom(at, gain=0.5):
    n = int(1.2 * SR); tt = np.arange(n) / SR
    s = lowpass(noise(n), 0.08) * np.exp(-tt * 5) + np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 6)
    add(s, at, gain=gain)
def splash(at, gain=0.25):
    n = int(0.7 * SR); tt = np.arange(n) / SR
    add(lowpass(noise(n), 0.35) * np.exp(-tt * 6), at, pan=0.2, gain=gain)
def whoosh(at, length, gain=0.2):
    n = int(length * SR); tt = np.arange(n) / SR
    add(lowpass(noise(n), 0.05) * np.sin(np.pi * tt / length) ** 2, at, gain=gain)
def whistle(at):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    f = 2600 + 120 * np.sin(2 * np.pi * 30 * tt)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 400, 4000), at, gain=0.08)
def chime(at, gain=0.16):
    for i, m in enumerate([72, 76, 79, 84]):
        n = int(1.8 * SR); tt = np.arange(n) / SR
        s = (np.sin(2 * np.pi * note(m) * tt) + 0.3 * np.sin(2 * np.pi * 2 * note(m) * tt)) * np.exp(-tt * 2.5)
        add(s, at + i * 0.07, pan=(i - 1.5) * 0.3, gain=gain)
def bubbles(at, n_b=6):
    for i in range(n_b):
        n = int(0.12 * SR); tt = np.arange(n) / SR
        f = 500 + 900 * tt / 0.12 + rng.uniform(-80, 80)
        add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 25), at + i * 0.09, gain=0.05)
def cluck(at):
    n = int(0.15 * SR); tt = np.arange(n) / SR
    f = 900 - 500 * tt / 0.15
    add(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-tt * 18) * 0.5, at, pan=rng.uniform(-0.5, 0.5), gain=0.04)


def scratch(at, length, gain=0.05):
    n = int(length * SR); tt = np.arange(n) / SR
    s = lowpass(noise(n), 0.7) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * tt)) * env(n, 300, 800)
    add(s, at, pan=0.1, gain=gain)
def gulp(at):
    for i in range(3):
        n = int(0.12 * SR); tt = np.arange(n) / SR
        f = 220 + 260 * tt / 0.12
        add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 20), at + i * 0.2, gain=0.08)
def thud(at, gain=0.25):
    n = int(0.4 * SR); tt = np.arange(n) / SR
    add(lowpass(noise(n), 0.1) * np.exp(-tt * 14) + np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 16), at, gain=gain)
def horn(at):
    n = int(1.4 * SR); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * 98 * tt) + 0.5 * np.sin(2 * np.pi * 147 * tt)) * env(n, 4000, 12000)
    add(s, at, gain=0.14)

scratch(5.0, 1.0); scratch(6.6, 0.3); scratch(7.4, 0.3); scratch(8.2, 0.4)   # the pen: name, rank, number
whoosh(9.6, 0.6, 0.25)                 # the whip down to the crate
gulp(17.8); gulp(22.3)                 # milk, then beer
horn(26.0)                             # the troopship
thud(29.4, 0.3)                        # "no pets": the stop
whoosh(41.3, 1.2, 0.15)
boom(43.6, 0.25)                       # distant guns at Monte Cassino
boom(46.0, 0.15)
thud(52.0); thud(53.3); thud(54.2)     # crates set down
chime(57.4)                            # the badge reveal
scratch(63.6, 1.3, 0.07)               # the line through "Private"

# master: gentle fade-in, soft limiter
out[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]
peak = np.max(np.abs(out)) or 1.0
out = np.tanh(out / peak * 1.2) * 0.85
with wave.open('public/audio/wojtek-bed.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('wrote public/audio/wojtek-bed.wav', round(DUR, 1), 's')
