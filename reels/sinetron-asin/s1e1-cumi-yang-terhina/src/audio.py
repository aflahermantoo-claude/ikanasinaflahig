import json, subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, resample_poly

SR = 44100
rng = np.random.default_rng(7)

def tts(text, voice, pitch, speed, name):
    path = f"vo_{name}.wav"
    subprocess.run(["espeak-ng", "-v", voice, "-p", str(pitch), "-s", str(speed), "-g", "4", "-w", path, text], check=True)
    sr, x = wavfile.read(path)
    x = x.astype(np.float32) / 32768.0
    if sr != SR:
        x = resample_poly(x, SR, sr).astype(np.float32)
    # trim silence
    idx = np.where(np.abs(x) > 0.01)[0]
    x = x[idx[0]:idx[-1] + 1] if len(idx) else x
    return x / (np.max(np.abs(x)) + 1e-9) * 0.9

def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return lfilter(b, a, x)

def lp(x, f):
    b, a = butter(2, f / (SR / 2))
    return lfilter(b, a, x)

def env(n, attack=0.005, decay=1.0):
    t = np.arange(n) / SR
    e = np.exp(-t / decay)
    a = int(attack * SR)
    if a > 0:
        e[:a] *= np.linspace(0, 1, a)
    return e

def tone(freq, dur, kind="piano", decay=0.8, vib=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq * (1 + vib * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    if kind == "piano":
        w = np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    elif kind == "marimba":
        w = np.sin(ph) + 0.2 * np.sin(4 * ph)
        decay = 0.25
    elif kind == "saw":
        w = 2 * ((ph / (2 * np.pi)) % 1) - 1
        w = lp(w, 1800)
    else:
        w = np.sin(ph)
    return (w * env(n, 0.01 if kind != "saw" else 0.03, decay)).astype(np.float32)

def hz(note):
    names = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
    n = note[0]; acc = 0; o = note[-1]
    if "#" in note: acc = 1
    if "b" in note[1:-1]: acc = -1
    return 440 * 2 ** ((names[n] + acc + 12 * (int(o) - 4)) / 12)

def noise(dur):
    return rng.standard_normal(int(dur * SR)).astype(np.float32)

def thunder():
    n = noise(3.0)
    brown = np.cumsum(n); brown = brown - lp(brown, 20); brown /= np.max(np.abs(brown))
    crack = bp(noise(0.15), 800, 6000) * 0.6
    out = brown * env(len(brown), 0.02, 1.0)
    out[:len(crack)] += crack * env(len(crack), 0.001, 0.05)
    return out

def rain(dur):
    return bp(noise(dur), 1500, 7000) * 0.25

def cling():
    return tone(2093, 0.8, "sine", 0.25) + tone(3136, 0.8, "sine", 0.2) * 0.6

def sniff():
    out = np.zeros(int(0.5 * SR), np.float32)
    for s in (0.0, 0.22):
        b = bp(noise(0.12), 2500, 6000) * env(int(0.12 * SR), 0.03, 0.05)
        i = int(s * SR); out[i:i + len(b)] += b
    return out

def brake():
    n = int(0.8 * SR); t = np.arange(n) / SR
    f = 1900 - 400 * t
    w = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t))
    return (w * env(n, 0.02, 0.4) * 0.5 + bp(noise(0.8), 300, 2000) * env(n, 0.01, 0.3) * 0.3).astype(np.float32)

def step():
    return lp(noise(0.08), 900) * env(int(0.08 * SR), 0.001, 0.02) * 2.0

def whoosh(dur=0.5):
    n = int(dur * SR); x = bp(noise(dur), 400, 3000)
    return x * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.7

def hit(dur):
    out = sum(tone(hz(nn), dur, "saw", dur * 0.45) for nn in ("D2", "D3", "A3", "F3"))
    boom = tone(55, dur, "sine", 0.4) * 1.5
    return out * 0.5 + boom

def sad_trombone():
    seq = [("A#3", 0.35), ("A3", 0.35), ("G#3", 0.35), ("G3", 1.1)]
    parts = [tone(hz(n), d, "saw", 0.8, vib=0.02 if i == 3 else 0.0) for i, (n, d) in enumerate(seq)]
    return np.concatenate(parts) * 0.6

def gong():
    out = np.zeros(int(3 * SR), np.float32)
    for f, a in ((110, 1), (167, .6), (231, .5), (298, .35), (421, .25)):
        out += tone(f, 3, "sine", 1.4) * a
    return out * 0.5

def sad_music(dur):
    out = np.zeros(int(dur * SR), np.float32)
    chords = [("A3", "C4", "E4"), ("F3", "A3", "C4"), ("C3", "E3", "G3"), ("G3", "B3", "D4")]
    t = 0.0; k = 0
    while t < dur:
        for j, nn in enumerate(chords[k % 4]):
            s = tone(hz(nn), 2.4, "piano", 1.2) * 0.35
            i = int((t + j * 0.18) * SR)
            if i < len(out):
                m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
        t += 2.0; k += 1
    return out

def market_music(dur):
    out = np.zeros(int(dur * SR), np.float32)
    mel = ["E5", "G5", "A5", "G5", "E5", "D5", "C5", "D5", "E5", "G5", "C6", "A5", "G5", "E5", "D5", "C5"]
    bass = ["C3", "G2", "A2", "G2"]
    beat = 0.25; t = 0.0; k = 0
    while t < dur:
        s = tone(hz(mel[k % len(mel)]), 0.4, "marimba") * 0.35
        i = int(t * SR); m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
        if k % 4 == 0:
            b = tone(hz(bass[(k // 4) % 4]), 0.9, "piano", 0.4) * 0.4
            m = min(len(b), len(out) - i); out[i:i + m] += b[:m]
        t += beat; k += 1
    return out

def suspense(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    d = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * t))
    out = d.astype(np.float32) * 0.35
    for s in np.arange(0.3, dur, 0.85):
        hb = tone(60, 0.3, "sine", 0.08) * 1.2
        for off in (0, 0.18):
            i = int((s + off) * SR); m = min(len(hb), n - i)
            if m > 0: out[i:i + m] += hb[:m]
    return out

# ---------- voices ----------
V = {
    "baby": ("id+f4", 85, 150),
    "kakap": ("id+m3", 55, 165),
    "narator": ("id+m1", 30, 135),
    "chef": ("id+m2", 15, 115),
}
lines = [
    ("baby", "Aku cuma cumi asin... tapi aku punya mimpi!"),
    ("narator", "Di sebuah pasar kecil, hiduplah Cumi Baby, cumi asin yang selalu tersenyum."),
    ("kakap", "Ih, bau! Kering! Keriput! Siapa yang mau beli kamu?!"),
    ("kakap", "Lihat? Bahkan kucing pun jijik sama kamu!"),
    ("baby", "Suatu hari nanti... aku akan buktikan."),
    ("narator", "Malam itu, seseorang datang..."),
    ("chef", "Aroma ini... yang saya cari, selama dua puluh tahun!"),
    ("narator", "Siapakah chef misterius itu? Bersambung."),
]
vo = [tts(txt, *V[who], f"s{i+1}") for i, (who, txt) in enumerate(lines)]

planned = [3.0, 6.0, 7.0, 6.0, 8.0, 8.0, 7.0, 5.5]
offset = [0.5, 0.5, 0.9, 1.8, 0.8, 2.8, 0.6, 1.2]
extra = [0.6, 0.6, 1.4, 2.6, 0.8, 0.6, 2.6, 1.6]   # tail after voice (S4: sad trombone, S7: dun dun dunn)

scenes = []; t = 0.0
for i in range(8):
    vl = len(vo[i]) / SR
    d = max(planned[i], offset[i] + vl + extra[i])
    scenes.append({"start": round(t, 3), "dur": round(d, 3), "vo": [round(t + offset[i], 3), round(t + offset[i] + vl, 3)]})
    t += d
total = t
mix = np.zeros(int((total + 0.5) * SR), np.float32)

def put(sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(mix): return
    m = min(len(sig), len(mix) - i)
    mix[i:i + m] += sig[:m] * gain

S = scenes
# music beds
put(sad_music(S[0]["dur"]), 0, 0.30)
put(market_music(S[1]["dur"] + S[2]["dur"] + S[3]["dur"] - 2.0), S[1]["start"], 0.28)
put(sad_music(S[4]["dur"]), S[4]["start"], 0.32)
put(suspense(S[5]["dur"] + S[6]["dur"] - 2.0), S[5]["start"], 0.30)
# sfx
put(thunder(), 0.05, 0.9)
put(rain(S[0]["dur"]), 0, 0.5)
put(cling(), S[2]["start"] + 0.2, 0.35)
laugh_at = S[2]["vo"][1] + 0.1
for v, p, sp, off in (("id+m3", 45, 180, 0.0), ("id+f2", 75, 190, 0.12), ("id+m5", 60, 170, 0.25)):
    put(tts("ha ha ha ha ha", v, p, sp, "laugh" + v[-2:]), laugh_at + off, 0.35)
put(sniff(), S[3]["start"] + 1.0, 0.6)
put(sad_trombone(), S[3]["vo"][1] + 0.3, 0.45)
put(rain(S[4]["dur"]) , S[4]["start"], 0.75)
put(thunder(), S[4]["start"] + S[4]["dur"] * 0.55, 0.5)
put(brake(), S[5]["start"] + 0.4, 0.6)
steps = [S[5]["start"] + 1.5 + k * 0.45 for k in range(3)]
for s in steps: put(step(), s, 0.8)
hits = [S[6]["vo"][1] + 0.35 + k * 0.6 for k in range(3)]
for k, h in enumerate(hits):
    put(whoosh(0.35), h - 0.3, 0.5)
    put(hit(0.6 if k < 2 else 1.8), h, 0.55 if k < 2 else 0.8)
put(gong(), S[7]["start"] + 0.1, 0.6)
# voices last, on top
for i in range(8):
    put(vo[i], S[i]["vo"][0], 0.95)

mix = np.tanh(mix * 1.2)
mix = mix / np.max(np.abs(mix)) * 0.89
wavfile.write("audio.wav", SR, (mix * 32767).astype(np.int16))
json.dump({"total": round(total, 3), "scenes": scenes, "hits": [round(h, 3) for h in hits], "thunder": [0.05, round(S[4]["start"] + S[4]["dur"] * 0.55, 3)], "steps": [round(s, 3) for s in steps], "laugh": round(laugh_at, 3), "trombone": round(S[3]["vo"][1] + 0.3, 3)}, open("timeline.json", "w"), indent=1)
print(json.dumps({"total": total, "scenes": [(s["start"], s["dur"]) for s in scenes]}))
