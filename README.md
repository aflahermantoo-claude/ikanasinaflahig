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

Posting otomatis membaca `meta.json` dengan `status: ready`, lalu mengubahnya menjadi `posted` beserta `posted_at`.
