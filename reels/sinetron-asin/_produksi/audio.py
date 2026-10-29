"""Build timeline + audio mix for Sinetron Asin episodes.
usage: python3 audio.py ep2|ep3
Voice clips are read from vo/<ID>.mp3 (ElevenLabs). Missing clips get an espeak placeholder.
"""
import json, os, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, resample_poly

EP = sys.argv[1]
SR = 44100
FPS = 30
rng = np.random.default_rng(11)

LINES = {
 'E2_01': ('nar', 'Sebelumnya... seorang chef misterius mencium aroma Cumi Baby.'),
 'E2_02': ('cb', 'Oh.'),
 'E2_03': ('teri', 'Kami chef Restoran Bintang Lima. Kami cari cumi asin paling wangi se-Jawa.'),
 'E2_04': ('kakap', 'Chef! Chef! Saya lebih segar! Saya ndak bau!'),
 'E2_05': ('teri', 'Hmm... Amis.'),
 'E2_06': ('teri', 'Mbak Cumi, mau kerja di dapur kami?'),
 'E2_07': ('cb', 'Gajinya berapa?'),
 'E2_08': ('teri', 'Nasi hangat. Tiap hari.'),
 'E2_09': ('cb', '...Deal.'),
 'E2_10': ('kakap', 'Bos... cumi asin itu mau masuk restoran.'),
 'E2_11': ('nar', 'Bersambung.'),
 'E3_01': ('kakap', 'Bos, gawat. Cumi asin itu mau kerja di restoran bintang lima.'),
 'E3_02': ('ko', 'Terus?'),
 'E3_03': ('kakap', 'Kalau dia terkenal, lapak es saya sepi, Bos!'),
 'E3_04': ('ko', 'Kamu mau saya ngapain?'),
 'E3_05': ('kakap', 'Culik, Bos! Eh... maksudnya, ajak ngobrol.'),
 'E3_06': ('ko', 'Yo wis. Kirim alamatnya.'),
 'E3_07': ('cb', 'Monggo, Mas. Cari apa?'),
 'E3_08': ('ko', '...Mbak. Saya pesan sepuluh kilo.'),
 'E3_09': ('kakap', 'Bos? Bos?! Gimana?'),
 'E3_10': ('ko', 'Sibuk. Lagi makan.'),
 'E3_11': ('ko', 'Ternyata enak.'),
}
ESPEAK = {'nar': ('id+m1', 30, 140), 'cb': ('id+f4', 85, 155), 'teri': ('id+m4', 70, 165), 'kakap': ('id+m3', 55, 170), 'ko': ('id+m2', 20, 125)}

# ---------------- shot specs ----------------
SPECS = {
 'ep2': [
  dict(id='recap', lines=['E2_01'], pre=0.3, post=0.5, min=3.0),
  dict(id='reveal', lines=[], min=3.0, sfx=[('whoosh', 0.0), ('dun', 0.35), ('dun', 1.05), ('dunn', 1.75)]),
  dict(id='oh', lines=['E2_02'], pre=0.7, post=1.1, min=2.2),
  dict(id='trio', lines=['E2_03'], pre=0.2, post=0.4),
  dict(id='kakap', lines=['E2_04'], pre=0.3, post=0.3, sfx=[('whoosh', 0.0), ('boing', 0.12)]),
  dict(id='faint', lines=['E2_05'], pre=0.2, post=2.0, sfx_after=[('thud', 0.35), ('thud', 0.75), ('thud', 1.15)]),
  dict(id='offer', lines=['E2_06'], pre=0.3, post=0.4, sfx=[('whoosh', 0.0)]),
  dict(id='gaji', lines=['E2_07'], pre=0.2, post=0.6),
  dict(id='deal', lines=['E2_08', 'E2_09'], gap=0.7, pre=0.2, post=1.0),
  dict(id='boss', lines=['E2_10', 'E2_11'], gap=0.5, pre=0.4, post=1.4, sfx=[('ring', 0.0)]),
 ],
 'ep3': [
  dict(id='k1', lines=['E3_01'], pre=0.3, post=0.3, sfx=[('ring', 0.0)]),
  dict(id='o1', lines=['E3_02'], pre=0.9, post=0.5),
  dict(id='k2', lines=['E3_03'], pre=0.2, post=0.3),
  dict(id='o2', lines=['E3_04'], pre=0.7, post=0.4),
  dict(id='k3', lines=['E3_05'], pre=0.2, post=0.3),
  dict(id='o3', lines=['E3_06'], pre=0.8, post=0.5, sfx_after=[('hangup', 0.2)]),
  dict(id='shop', lines=['E3_07'], pre=1.0, post=0.4, sfx=[('bell', 0.15)]),
  dict(id='sniff', lines=['E3_08'], pre=1.6, post=0.6, sfx=[('sniff', 0.2), ('ting', 1.0)]),
  dict(id='k4', lines=['E3_09'], pre=0.2, post=0.3),
  dict(id='eat', lines=['E3_10'], pre=0.6, post=0.5, sfx=[('chew', 0.0)]),
  dict(id='end', lines=['E3_11'], pre=0.7, post=1.8),
 ],
}

def lp(x, f):
    b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype='band'); return lfilter(b, a, x)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def env(n, att=0.005, dec=1.0):
    t = np.arange(n) / SR; e = np.exp(-t / dec); a = int(att * SR)
    if a: e[:a] *= np.linspace(0, 1, a)
    return e
def tone(f, d, kind='sine', dec=0.8, vib=0.0):
    n = int(d * SR); t = np.arange(n) / SR
    ff = f * (1 + vib * np.sin(2 * np.pi * 5.5 * t)); ph = 2 * np.pi * np.cumsum(ff) / SR
    if kind == 'saw': w = lp(2 * ((ph / (2 * np.pi)) % 1) - 1, 1800)
    elif kind == 'marimba': w = np.sin(ph) + 0.2 * np.sin(4 * ph); dec = 0.22
    elif kind == 'pluck': w = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph); dec = 0.18
    else: w = np.sin(ph)
    return (w * env(n, 0.004, dec)).astype(np.float32)
def hz(n):
    names = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    acc = 1 if '#' in n else -1 if 'b' in n[1:-1] else 0
    return 440 * 2 ** ((names[n[0]] + acc + 12 * (int(n[-1]) - 4)) / 12)

SFX = {
 'whoosh': lambda: (bp(noise(0.45), 500, 4000) * np.sin(np.linspace(0, np.pi, int(0.45 * SR))) ** 2 * 0.6),
 'boing': lambda: tone(1, 0.5) * 0 + np.sin(2 * np.pi * np.cumsum(220 + 180 * np.sin(np.linspace(0, 14, int(0.5 * SR))) * np.exp(-np.linspace(0, 3, int(0.5 * SR)))) / SR) * env(int(0.5 * SR), 0.003, 0.25) * 0.5,
 'dun': lambda: sum(tone(hz(n), 0.65, 'saw', 0.3) for n in ('D2', 'D3', 'A3')) * 0.45 + tone(55, 0.65, 'sine', 0.35) * 1.2,
 'dunn': lambda: sum(tone(hz(n), 1.8, 'saw', 0.9) for n in ('D2', 'D3', 'F3', 'A3')) * 0.45 + tone(55, 1.8, 'sine', 0.8) * 1.4,
 'thud': lambda: lp(noise(0.25), 300) * env(int(0.25 * SR), 0.001, 0.06) * 3 + tone(70, 0.25, 'sine', 0.08),
 'ring': lambda: np.concatenate([(tone(1400, 0.35, 'sine', 2) + tone(1750, 0.35, 'sine', 2)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 20 * np.arange(int(0.35 * SR)) / SR))) * 0.25, np.zeros(int(0.2 * SR), np.float32)] * 2),
 'hangup': lambda: tone(480, 0.12, 'sine', 1) * 0.3,
 'bell': lambda: tone(1320, 1.2, 'sine', 0.5) * 0.4 + tone(1980, 1.2, 'sine', 0.35) * 0.25,
 'sniff': lambda: np.concatenate([bp(noise(0.14), 2500, 6000) * env(int(0.14 * SR), 0.04, 0.05), np.zeros(int(0.08 * SR), np.float32), bp(noise(0.14), 2500, 6000) * env(int(0.14 * SR), 0.04, 0.05), np.zeros(int(0.08 * SR), np.float32), bp(noise(0.3), 2500, 6000) * env(int(0.3 * SR), 0.08, 0.12)]) * 0.7,
 'ting': lambda: tone(2093, 0.8, 'sine', 0.25) * 0.4 + tone(3136, 0.8, 'sine', 0.2) * 0.25,
 'chew': lambda: np.concatenate([lp(noise(0.09), 800) * env(int(0.09 * SR), 0.01, 0.03) * 1.5 if k % 2 == 0 else np.zeros(int(0.12 * SR), np.float32) for k in range(10)]),
 'pop': lambda: tone(900, 0.09, 'sine', 0.03) * 0.5 + tone(1400, 0.09, 'sine', 0.02) * 0.3,
 'confetti': lambda: sum(np.roll(tone(f, 0.3, 'pluck'), int(i * 0.05 * SR)) for i, f in enumerate([1046, 1318, 1568, 2093])) * 0.3,
}

def load_clip(cid):
    spk, text = LINES[cid]
    mp3 = f'vo/{cid}.mp3'
    path = f'vo/{cid}.wav'
    if os.path.exists(mp3):
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ac', '1', '-ar', str(SR), path], check=True)
        src = 'elevenlabs'
    else:
        v, p, s = ESPEAK[spk]
        subprocess.run(['espeak-ng', '-v', v, '-p', str(p), '-s', str(s), '-w', path, text], check=True)
        src = 'placeholder'
    sr, x = wavfile.read(path)
    x = x.astype(np.float32) / (32768.0 if x.dtype == np.int16 else 1.0)
    if sr != SR: x = resample_poly(x, SR, sr).astype(np.float32)
    idx = np.where(np.abs(x) > 0.02 * np.max(np.abs(x)))[0]
    x = x[max(0, idx[0] - int(0.03 * SR)): idx[-1] + int(0.06 * SR)]
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    return x, src

def envelope(x):
    hop = SR // FPS; n = int(np.ceil(len(x) / hop))
    e = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    return (e / (e.max() + 1e-9)).round(3).tolist()

def words_timing(text, e, dur):
    words = [w for w in re.sub(r'\[.*?\]', '', text).split() if w.strip('.?!,')]
    on = [i for i, v in enumerate(e) if v > 0.12]
    t0 = (on[0] / FPS) if on else 0; t1 = ((on[-1] + 1) / FPS) if on else dur
    wts = [len(w.strip('.,!?')) + 2 for w in words]; tot = sum(wts); out = []; t = t0
    for w, k in zip(words, wts):
        d = (t1 - t0) * k / tot; out.append({'w': w, 't0': round(t, 3), 't1': round(t + d, 3)}); t += d
    return out

def music_bounce(dur):
    out = np.zeros(int(dur * SR), np.float32)
    mel = ['C5', 'E5', 'G5', 'E5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'F5', 'E5', 'D5', 'G4']
    bass = ['C3', 'A2', 'F2', 'G2']; beat = 60 / 128 / 2; t = 0; k = 0
    while t < dur:
        i = int(t * SR)
        s = tone(hz(mel[k % 16]), 0.3, 'marimba') * 0.32; m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
        if k % 2 == 0:
            s = lp(noise(0.05), 6000) * env(int(0.05 * SR), 0.001, 0.015) * 0.25; m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
        if k % 4 == 0:
            s = tone(hz(bass[(k // 8) % 4]), 0.45, 'pluck') * 0.5; m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
            s = tone(60, 0.18, 'sine', 0.06) * 0.8; m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
        t += beat; k += 1
    return out

def ambience(kind, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    if kind == 'night':
        cr = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > 0.6) * (np.sin(2 * np.pi * 0.7 * t) > 0) * 0.04
        return (cr + bp(noise(dur), 200, 1200) * 0.03).astype(np.float32)
    if kind == 'office':
        return (lp(noise(dur), 300) * 0.06 + np.sin(2 * np.pi * 60 * t) * 0.01).astype(np.float32)
    if kind == 'morning':
        out = bp(noise(dur), 300, 2000) * 0.025
        for s in np.arange(0.4, dur, 1.7):
            i = int(s * SR); ch = np.sin(2 * np.pi * np.cumsum(3200 + 900 * np.sin(np.linspace(0, 30, int(0.25 * SR)))) / SR) * env(int(0.25 * SR), 0.01, 0.1) * 0.05
            m = min(len(ch), n - i); out[i:i + m] += ch[:m]
        return out.astype(np.float32)
    return np.zeros(n, np.float32)

# ---------------- build ----------------
spec = SPECS[EP]; clips = {}; sources = {}
for sh in spec:
    for cid in sh['lines']:
        clips[cid], sources[cid] = load_clip(cid)

shots = []; t = 0.0
for sh in spec:
    pre, post, gap = sh.get('pre', 0.3), sh.get('post', 0.4), sh.get('gap', 0.4)
    lt = t + pre; lines = []
    for k, cid in enumerate(sh['lines']):
        x = clips[cid]; d = len(x) / SR; e = envelope(x)
        lines.append({'id': cid, 'spk': LINES[cid][0], 'text': LINES[cid][1], 'start': round(lt, 3), 'end': round(lt + d, 3), 'env': e, 'words': [{**w, 't0': round(w['t0'] + lt, 3), 't1': round(w['t1'] + lt, 3)} for w in words_timing(LINES[cid][1], e, d)]})
        lt += d + (gap if k < len(sh['lines']) - 1 else 0)
    dur = max(sh.get('min', 0), (lt - t) + post)
    shots.append({'id': sh['id'], 'start': round(t, 3), 'dur': round(dur, 3), 'lines': lines})
    t += dur
total = t
mix = np.zeros(int((total + 0.3) * SR), np.float32); voice = np.zeros_like(mix)
def put(buf, sig, at, g=1.0):
    i = int(at * SR)
    if i >= len(buf): return
    m = min(len(sig), len(buf) - i); buf[i:i + m] += np.asarray(sig[:m], np.float32) * g

events = []
for sh, spc in zip(shots, spec):
    for cid in [l['id'] for l in sh['lines']]:
        l = next(l for l in sh['lines'] if l['id'] == cid)
        x = clips[cid]
        if (l['spk'] in ('kakap',) and sh['id'] in ('boss', 'k1', 'k2', 'k3', 'k4')) or l['spk'] in spc.get('phone', ()):  # phone-ish voice
            x = bp(x, 300, 3400) * 1.3
        put(voice, x, l['start'], 0.95)
    for name, off in spc.get('sfx', []):
        put(mix, SFX[name](), sh['start'] + off, 0.6); events.append({'t': round(sh['start'] + off, 3), 'sfx': name})
    if spc.get('sfx_after'):
        end = sh['lines'][-1]['end'] if sh['lines'] else sh['start']
        for name, off in spc['sfx_after']:
            put(mix, SFX[name](), end + off, 0.6); events.append({'t': round(end + off, 3), 'sfx': name})

if EP == 'ep2':
    # pop on every word, confetti on "Deal"
    for sh in shots:
        for l in sh['lines']:
            for w in l['words']: put(mix, SFX['pop'](), w['t0'], 0.35)
    deal = next(l for sh in shots for l in sh['lines'] if l['id'] == 'E2_09'); put(mix, SFX['confetti'](), deal['start'] + 0.1, 0.6)
    mus = music_bounce(total)
    # duck music under voice
    v_env = np.convolve(np.abs(voice), np.ones(4410) / 4410, mode='same'); duck = 1 - 0.65 * np.clip(v_env / 0.08, 0, 1)
    # music off during the reveal hits and the "Oh." silence (comic stop)
    for sh in shots:
        if sh['id'] in ('reveal', 'oh'):
            a, b = int(sh['start'] * SR), int((sh['start'] + sh['dur']) * SR); duck[a:b] = 0
    put(mix, mus * duck[:len(mus)], 0, 0.55)
else:
    amb = {'k': 'night', 'o': 'office', 'shop': 'morning', 'sniff': 'morning', 'eat': 'morning', 'end': 'morning'}
    for sh, spc in zip(shots, spec):
        kind = spc.get('amb') or amb.get(sh['id'], amb.get(sh['id'][0], 'night'))  # episode baru: isi 'amb' per shot (night/office/morning)
        put(mix, ambience(kind, sh['dur']), sh['start'], 1.0)

mix += voice
mix = np.tanh(mix * 1.1); mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.89
os.makedirs(EP, exist_ok=True)
wavfile.write(f'{EP}/audio_raw.wav', SR, (mix * 32767).astype(np.int16))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{EP}/audio_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', str(SR), f'{EP}/audio.wav'], check=True)
json.dump({'total': round(total, 3), 'fps': FPS, 'shots': shots, 'events': events, 'sources': sources}, open(f'{EP}/timeline.json', 'w'))
print(EP, 'total', round(total, 2), 's', {k: v for k, v in sources.items()})
