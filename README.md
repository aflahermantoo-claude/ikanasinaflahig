# ikanasinaflahig

Antrean konten Reels untuk Instagram **@ikanasinaflah**.

## Struktur

```
reels/<seri>/<episode>/
  video.mp4     video final 1080x1920
  cover.jpg     cover Reels
  caption.md    caption + hashtag (siap tempel)
  meta.json     status posting: ready | scheduled | posted
  src/          script untuk render ulang (audio.py → timeline.json → render.js)
```

## Seri aktif

- `reels/sinetron-asin/` — Sinetron Asin Universe (Cumi Baby, Cumi Jumbo, Teri Nasi)

## Render ulang

```
cd reels/<seri>/<episode>/src
python3 audio.py          # suara, musik, SFX → audio.wav + timeline.json
npm i @resvg/resvg-js
node render.js batch 0 99999 && ffmpeg -framerate 24 -i frames/%05d.png -i audio.wav -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest ../video.mp4
```

Posting otomatis (tugas terjadwal harian, mulai 18:50, tayang 19:00 WIB) mengikuti `reels/POSTING.md`; prompt tugasnya ada di `reels/TUGAS_OTOMATIS.md`.

## Otomatis
- Produksi: tugas terjadwal "Produksi Reels @ikanasinaflah" (3x sehari) — aturan `reels/PRODUKSI.md`, prompt `reels/TUGAS_PRODUKSI_OTOMATIS.md`.
- Posting: tugas terjadwal "Posting Reels @ikanasinaflah" (tayang 19:00 WIB) — aturan `reels/POSTING.md`, prompt `reels/TUGAS_OTOMATIS.md`.
- Gaya, struktur 5 babak, footer, caption GEO: `reels/sinetron-asin/ATURAN_SERI.md`. Seri, rotasi, tokoh: `reels/sinetron-asin/SERI.md`.
