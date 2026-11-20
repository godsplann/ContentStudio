# Code-made music bed and effects for the Undercover short "The ship nobody sank" (Q-ships).
# Run from the studio folder: python3 scripts/make_bed_q_ship.py  (needs numpy; scipy is used if present)
# Undercover sound: light, bouncy and curious (marimba-like plucks over a soft pulse), building under
# the escalation, dropping to a hush for the reveal, landing a bright "ta-da" chime on the twist.
# Effect times are seconds from src/q-ship/words.ts.
import numpy as np, wave
try:
    from scipy.signal import lfilter
except Exception:
    lfilter = None

SR = 48000
DUR = 2127 / 30
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

BPM = 112
beat = 60 / BPM
# Energy over time: 0 quiet .. 1 full
def energy(t):
    if t < 5.3: return 0.55
    if t < 21.7: return 0.6
    if t < 34.0: return 0.75    # the drill, comic
    if t < 42.2: return 0.95    # periscope and panic
    if t < 48.2: return 0.7     # the sub rises, confident
    if t < 55.5: return 0.25    # "isn't empty": hush
    if t < 63.8: return 0.6     # the name
    if t < 69.1: return 0.35    # tension before the twist
    return 0.0
# Chords (C major-ish, curious): I - vi - IV - V, darker iv for the tension
prog = [[48, 52, 55, 60], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]]
tense = [[45, 51, 57, 60], [44, 50, 56, 59]]

k = 0
t = 0.0
while t < DUR - 0.3:
    e = energy(t)
    bar = int(t / (beat * 4))
    ch = (tense[bar % 2] if 63.8 <= t < 69.1 or 48.2 <= t < 55.5 else prog[bar % 4])
    if e > 0:
        step = k % 8
        # bass on beats 1 and 3
        if step in (0, 4): add(pluck_bass(ch[0] - 12), t, gain=0.16 * e)
        # marimba arpeggio in eighths, offbeats only when quiet
        if e > 0.5 or step % 2 == 1:
            m = ch[[1, 2, 3, 2, 1, 3, 2, 3][step]] + 12
            add(marimba(m), t, pan=0.35 if step % 2 else -0.35, gain=0.07 * (0.5 + e))
        # soft shaker pulse when busy
        if e > 0.7:
            n = int(0.06 * SR); s = lowpass(noise(n), 0.6) * env(n, 30, n - 30)
            add(s, t, pan=0.2, gain=0.02 * e)
    k += 1
    t += beat / 2

# Tension pulse under "the sub slides closer" and "the captain nods": a low ticking heartbeat
for i in range(12):
    tt0 = 63.9 + i * 0.44
    if tt0 > 69.0: break
    add(pluck_bass(36, 0.3), tt0, gain=0.18)

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

whistle(23.1); whistle(25.5)
boom(16.5, 0.55)                       # the hunter's deck gun
boom(16.85, 0.2)                       # hit on the sailing ship
splash(33.3, 0.2)                      # the deckhand lands in the boat
bubbles(35.2)                          # the periscope breaks the water
splash(38.9); splash(39.1)             # oars
whoosh(42.4, 2.2, 0.3)                 # the U-boat rises
for i in range(4): cluck(66.8 + i * 0.35)
boom(69.15, 0.35)                      # the coop's walls slam down
chime(69.2)                            # the reveal

# master: gentle fade-in, soft limiter
out[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]
peak = np.max(np.abs(out)) or 1.0
out = np.tanh(out / peak * 1.2) * 0.85
with wave.open('public/audio/q-ship-bed.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('wrote public/audio/q-ship-bed.wav', round(DUR, 1), 's')
