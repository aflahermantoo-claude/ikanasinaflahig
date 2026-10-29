# Serah terima produksi — Cumi yang Terhina Ep 2 & Ep 3

Status per 29 Okt 2026. Folder ini berisi semua bahan untuk merender kedua episode di sesi baru.

| Episode | Judul | Editing | Animasi | Durasi |
|---|---|---|---|---|
| Ep 2 | Chef Misterius | Kata Meledak (ala Philipsinema) | B — Reallife cartoon (mata titik, alis tebal) | ±40 dtk |
| Ep 3 | Bos Oren | Sitcom Polos (ala "Compliment Gone Wrong") | A — Sitcom deadpan (mata piring) | ±40 dtk |

Storyboard: canvas "Storyboard Ep 2 — Cumi yang Terhina" (Editing 1 & 2).
Guidebook editing: `~/Downloads/AI Editor/GUIDEBOOK_Editing_Video_Aflah.md` (v2.4) — area aman x 60–900, y 260–1670; hook ≤ 3 dtk; loudness −14 LUFS; cover dari potongan klip yang bikin penasaran.

## Sudah selesai
- Naskah + timeline semua adegan (`audio.py` → `SPECS`, `LINES`).
- Animasi per frame, lip-sync dari amplitudo suara, kata per kata (Ep 2), bar judul + subtitle (Ep 3), SFX, musik (Ep 2), ambience (Ep 3) — `render_ep.js`. Sudah diuji dengan suara pengganti.
- 20 dari 22 dialog sudah dibuat di ElevenLabs (lihat `voices.json`, `status: ok` + `session_id`). Update 29 Okt siang: akun tidak lagi diblokir, tapi masih Free — 2 dialog terakhir (E3_10, E3_11) gagal karena "Free generations are busy".

## Yang tersisa
1. **ElevenLabs:** buat 2 dialog `status: belum` yang tersisa (E3_10, E3_11) — coba lagi beberapa menit kemudian atau upgrade ke paket berbayar di `voices.json` (voice_id + prompt sudah tercantum, model `eleven_v4`, flow `vPf78XLPMQwAE6mZ7aqB`). Buat satu per satu, jangan paralel.
2. **Unduh suara:** (29 Okt: masih diblokir proxy — `CONNECT tunnel failed, 403`) pastikan domain `storage.googleapis.com` diizinkan (claude.ai → Settings → Capabilities) sebelum sesi baru dimulai. Ambil URL segar dengan `creative_get_flow_run_status(flow_id, [session_id])`, unduh take pertama ke `vo/<ID>.mp3`.
3. **Render:**
   ```
   cd reels/sinetron-asin/_produksi
   (cd engine && npm i)          # resvg
   apt-get install -y espeak-ng  # cadangan jika ada dialog yang belum ada
   python3 audio.py ep2 && python3 audio.py ep3
   N=$(node render_ep.js ep2 count); for s in $(seq 0 150 $N); do node render_ep.js ep2 batch $s $((s+150)); done
   ffmpeg -framerate 30 -i ep2/frames/%05d.png -i ep2/audio.wav -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart ep2/video.mp4
   # ulangi untuk ep3
   ```
   Render per 150 frame (batas memori). `audio.py` otomatis memakai `vo/<ID>.mp3` bila ada; kalau tidak, memakai suara pengganti espeak.
4. **QC** 6–8 frame (area aman, subtitle tidak terpotong, kata Ep 2 tidak menutupi mata), lalu simpan ke `reels/sinetron-asin/s1e2-chef-misterius/` dan `s1e3-bos-oren/` (video.mp4, cover.jpg dari potongan klip, caption.md, meta.json `status: ready`).
5. Posting lewat Windsor `create_video_post` ke @ikanasinaflah dengan `share_to_feed: false` — hanya setelah Aflah menyetujui.

## Prompt untuk sesi baru
> Lanjutkan produksi Cumi yang Terhina Ep 2 dan Ep 3. Baca `reels/sinetron-asin/_produksi/HANDOFF.md` di repo aflahermantoo-claude/ikanasinaflahig dan ikuti langkah "Yang tersisa".
