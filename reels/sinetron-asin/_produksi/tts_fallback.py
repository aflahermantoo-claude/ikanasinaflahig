"""Suara cadangan kalau ElevenLabs kena limit/gagal: Microsoft Edge neural TTS (gratis, ada suara Jawa).

usage: python3 tts_fallback.py E4_01 E4_02 ...      (ID dialog dari voices.json "lines")
Menulis vo/<ID>.mp3 dan menandai baris di voices.json: "status": "fallback".
Butuh: pip install --break-system-packages edge-tts
"""
import asyncio, json, re, sys
import certifi

# Proxy workspace memakai CA sendiri; arahkan certifi ke bundle proxy (verifikasi TLS tetap aktif).
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'
import edge_tts  # noqa: E402

DEFAULT = {'voice': 'jv-ID-DimasNeural', 'rate': '+0%', 'pitch': '+0Hz'}


async def make(line, conf):
    text = re.sub(r'\[[^\]]*\]', '', line['prompt']).strip()  # buang tag arahan [datar] dsb.
    fb = {**DEFAULT, **conf['voices'].get(line['spk'], {}).get('fallback', {})}
    await edge_tts.Communicate(text, fb['voice'], rate=fb['rate'], pitch=fb['pitch']).save(f"vo/{line['id']}.mp3")


def main(ids):
    conf = json.load(open('voices.json'))
    todo = [l for l in conf['lines'] if l['id'] in ids]
    for l in todo:
        asyncio.run(make(l, conf))
        l['status'] = 'fallback'
        print(l['id'], 'ok', l['spk'])
    open('voices.json', 'w').write(json.dumps(conf, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main(set(sys.argv[1:]))
