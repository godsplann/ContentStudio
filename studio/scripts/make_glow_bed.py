# Code-made music bed and sound effects for "You are glowing right now" (no samples, no downloads).
# Run from the studio folder: python3 scripts/make_glow_bed.py  (needs numpy; scipy is used if present)
# Soft, curious pad and plucks; effects timed to the narration (seconds from words.ts).
import numpy as np, wave
try:
    from scipy.signal import lfilter
except Exception:
    lfilter = None

SR = 48000
DUR = 3303 / 30
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

# Sections (start seconds) and their chords: dark room, lab, the cell, Canada and the farm, the ending.
sections = [
    (0.0, [[50, 57, 62, 66, 69], [47, 54, 59, 62, 66]]),        # D maj9 / B m7 (night, wonder)
    (10.0, [[43, 50, 55, 59, 62], [45, 52, 57, 61, 64]]),       # G / A (the lab)
    (45.4, [[50, 57, 62, 66, 69], [52, 59, 62, 66, 71]]),       # D / E m (diving in)
    (64.9, [[43, 50, 55, 59, 66], [45, 52, 57, 61, 64]]),       # G maj7 / A
    (97.1, [[47, 54, 59, 62, 66], [43, 50, 55, 59, 62], [50, 57, 62, 66, 69]]),  # resolve home
]
bar = 4 * 60 / 84  # 84 bpm, 4/4
def chord_at(tsec):
    cur = sections[0]
    for s in sections:
        if tsec >= s[0]: cur = s
    k = int((tsec - cur[0]) / (bar * 2)) % len(cur[1])
    return cur[1][k]

# Pad: one chord every two bars, soft detuned sines
tpos = 0.0
while tpos < DUR:
    ch = chord_at(tpos + 0.01)
    length = bar * 2
    n = int((length + 1.6) * SR); tt = np.arange(n) / SR
    s = np.zeros(n)
    for m in ch:
        for det in (-0.1, 0.1):
            f = note(m) * 2 ** (det / 12)
            s += np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(4 * np.pi * f * tt)
    s *= env(n, int(1.4 * SR), int(1.6 * SR)) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.2 * tt))
    add(s / 16, tpos)
    tpos += length

# Twinkling plucks (eighths), busier inside the cell
step = 60 / 84 / 2
i = 0
while i * step < DUR - 0.4:
    tsec = i * step
    busy = 45.4 <= tsec < 64.9 or 97.1 <= tsec < 102.8
    if busy or i % 2 == 0:
        ch = chord_at(tsec)
        m = ch[[1, 3, 2, 4, 3, 2, 4, 3][i % 8]] + 12
        n = int(0.6 * SR); tt = np.arange(n) / SR
        s = (np.sin(2 * np.pi * note(m) * tt) + 0.25 * np.sin(4 * np.pi * note(m) * tt)) * np.exp(-tt * 7)
        add(s * (0.05 if busy else 0.04), tsec, pan=0.4 if i % 2 else -0.4)
    i += 1

# Soft low pulse on each beat in the lab and the cell
for k in range(int(DUR / (step * 2))):
    tsec = k * step * 2
    if 10.0 <= tsec < 64.9 or 68.7 <= tsec < 97.1:
        n = int(0.35 * SR); tt = np.arange(n) / SR
        m = chord_at(tsec)[0] - 12
        add(np.sin(2 * np.pi * note(m) * tt) * np.exp(-tt * 9) * 0.1, tsec)

# ---------- effects ----------
def tone(f, d, decay, gain, start, pan=0.0, glide=0.0):
    n = int(d * SR); tt = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f * (1 + glide * tt / d)) / SR
    add(np.sin(ph) * np.exp(-tt * decay) * gain, start, pan)
def whoosh(start, d=0.5, gain=0.25, up=True):
    n = int(d * SR); tt = np.arange(n) / SR
    s = lowpass(noise(n), 0.12) * np.sin(np.pi * tt / d) ** 2
    add(s * gain, start)
def click(start, gain=0.25):
    n = int(0.03 * SR)
    add(lowpass(noise(n), 0.5) * np.exp(-np.arange(n) / SR * 160) * gain, start)
def thud(start, gain=0.5):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    add((np.sin(2 * np.pi * 70 * tt) + 0.5 * lowpass(noise(n), 0.05)) * np.exp(-tt * 12) * gain, start)
def shimmer(start, gain=0.12, base=84):
    for k, m in enumerate([0, 4, 7, 12, 16]):
        tone(note(base + m), 1.4, 3, gain, start + k * 0.05, pan=(-0.5 + k * 0.25))

tone(1200, 0.05, 60, 0.15, 3.2)                 # heater switch
click(3.22, 0.3)
n = int(1.0 * SR); add(lowpass(noise(n), 0.03) * np.linspace(0.12, 0, n), 3.25)  # heater hum dying
shimmer(4.3, 0.06, 88)                          # "real, visible light"
whoosh(8.45, 0.6, 0.2)                          # whip back to the viewer
for k in range(4): click(14.0 + k * 0.18, 0.12)  # footsteps to the door
thud(17.2, 0.55)                                # the door shuts
click(17.25, 0.35)
for k in range(30):                             # photons landing: tiny ticks
    tone(note(96 + (k % 5) * 2), 0.12, 40, 0.05, 23.2 + k * 0.11, pan=rng.uniform(-0.6, 0.6))
for k in range(21):                             # the timer counting
    tone(2000, 0.04, 80, 0.06, 27.0 + k * 0.08)
tone(1600, 0.25, 8, 0.12, 28.7)                 # 20:00 beep
shimmer(30.9, 0.07, 84)                         # the men glow
for t0 in (34.24, 35.16, 36.0):                 # cheeks, forehead, neck
    tone(note(91), 0.5, 7, 0.09, t0)
for k in range(6): tone(1400, 0.03, 90, 0.05, 39.0 + k * 0.5)  # clock ticks
whoosh(46.2, 1.2, 0.35)                         # the dive into the skin
shimmer(47.15, 0.08, 79)
n = int(5 * SR); add(lowpass(noise(n), 0.02) * env(n, SR, SR) * 0.12, 48.0)  # furnace roar
for t0 in (50.6, 51.1, 51.6, 52.4):             # radicals popping out
    tone(300, 0.25, 10, 0.12, t0, glide=1.5)
for t0 in (54.9, 56.1):                         # crashes
    thud(t0, 0.4)
    tone(220, 0.3, 9, 0.15, t0, glide=-0.5)
n = int(3.8 * SR); tt = np.arange(n) / SR
add(np.sin(2 * np.pi * (440 + 120 * tt) * tt) * env(n, int(1.5 * SR), int(0.2 * SR)) * 0.035, 59.7)  # holding the energy
shimmer(63.72, 0.14, 91)                        # the flash of light
click(66.2, 0.5); click(66.24, 0.4)             # glow stick snap
shimmer(66.3, 0.06, 86)
for k in range(8): click(70.5 + k * 0.32, 0.08)  # footsteps in the snow
shimmer(75.8, 0.06, 84)                         # the mice glow
tone(note(62), 2.0, 1.5, 0.06, 77.2)           # the glow fades
shimmer(84.2, 0.06, 88)                         # the leaf glows brighter
for k in range(5): tone(500, 0.15, 18, 0.06, 85.2 + k * 0.2, glide=1.0)
tone(note(84), 0.6, 4, 0.06, 92.6)              # scan
shimmer(95.8, 0.06, 81)                         # the sick patch shows
shimmer(97.3, 0.05, 93)                         # aura appears
n = int(0.15 * SR); add(lowpass(noise(n), 0.4) * np.exp(-np.arange(n) / SR * 30) * 0.3, 98.55)  # aura pops
for k in range(12): tone(note(88 + (k % 4) * 3), 0.2, 20, 0.04, 99.3 + k * 0.28, pan=rng.uniform(-0.6, 0.6))
shimmer(106.2, 0.09, 86)                        # still glowing
tone(note(62), 4.0, 0.8, 0.08, 107.9)           # final low note

# fade in and out, normalise
fade = np.ones(N); fade[: int(0.4 * SR)] = np.linspace(0, 1, int(0.4 * SR)); fade[-int(2.5 * SR):] = np.linspace(1, 0, int(2.5 * SR))
out *= fade[:, None]
out /= np.max(np.abs(out)) + 1e-9
out *= 0.8
pcm = (out * 32767).astype('<i2')
with wave.open('public/audio/glow-bed.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote public/audio/glow-bed.wav', DUR, 's')
