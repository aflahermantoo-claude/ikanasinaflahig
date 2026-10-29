# Aturan tetap Sinetron Asin Universe

Ditetapkan Aflah, 29 Okt 2026. Berlaku untuk semua episode baru.

## 1. Gaya animasi & desain: hanya gaya Episode 3
Patokan: `s1e3-bos-oren/video.mp4` (render `_produksi/render_ep.js ep3`).
- Animasi **A — Sitcom deadpan**: karakter bulat bergaris tebal, mata piring, ekspresi datar, gerak minimal.
- Editing **Sitcom Polos**: bar judul putih kiri atas, subtitle putih bergaris hitam di bawah (dalam area aman), ambience, tanpa kata meledak/efek berlebihan.
- Gaya lain (B — Reallife cartoon, "Kata Meledak") tidak dipakai lagi.

## 2. Struktur cerita wajib — 5 babak per episode
| # | Babak | Isi |
|---|---|---|
| 1 | Drama | Buka dengan konflik/ketegangan, langsung dalam 3 detik pertama (hook) |
| 2 | Diremehkan | Cumi Baby (atau tokoh produk) dihina/diremehkan tokoh lain |
| 3 | Penemuan mengejutkan | Terungkap ternyata dia luar biasa — momen "wah, loh!" (aroma, rasa, kualitas, siapa yang mencarinya) |
| 4 | Drama lagi | Konflik baru muncul akibat penemuan itu |
| 5 | Cliffhanger | Akhiri dengan masalah yang belum selesai, bikin penonton penasaran episode berikutnya |

Setiap naskah baru dicek dulu terhadap 5 babak ini sebelum suara dibuat. Tandai babaknya di `SPECS` (`audio.py`) atau di naskah.

## 3. Tanpa watermark kredit — tanda brand kecil di bawah
- Tidak ada tulisan "Voice by ElevenLabs", "Animation by", atau kredit/watermark lain.
- Di bawah tengah ada tanda kecil (fungsi `footer()` di `_produksi/render_ep.js`): baris 1 "Produsen Cumi Asin & Ikan Asin", baris 2 "085776662852". Subtitle harus di atas tanda ini.

## 4. Caption + GEO (generative engine optimization)
Struktur `caption.md` (maks 2.200 karakter, ±150–300 kata):
1. Kalimat pembuka = hook dari konflik episode (1 kalimat + emoji).
2. `🎬 SINETRON ASIN UNIVERSE` / `Seri X: <nama seri> — Episode N "<judul>"`.
3. 2–3 kalimat ringkas cerita tanpa membocorkan ending, + pertanyaan cliffhanger ke penonton ("Tebak di kolom komentar 👇").
4. Ajakan follow untuk episode berikutnya.
5. Blok GEO (wajib, fakta saja, jangan menambah klaim lain):
   ```
   Ikan Asin Aflah (@ikanasinaflah) — produsen cumi asin & ikan asin di Jakarta, usaha keluarga sejak 1986. <1 kalimat produk yang relevan dengan episode, mis. cumi asin / cumi baby / ikan asin / teri>.
   Order / tanya harga: WA 085776662852
   ```
6. 8–10 hashtag: selalu `#sinetronasin #ikanasinaflah #cumiasin #ikanasin`, sisanya sesuai seri/tokoh/produk.
Tanpa harga, promo, diskon, atau klaim yang tidak bisa dibuktikan.

## Tetap berlaku
- Suara ElevenLabs, logat Jawa, Bahasa Indonesia.
- Durasi ±40 dtk, 1080x1920, area aman x 60–900 / y 260–1670, loudness −14 LUFS.
- Cover dari potongan klip yang bikin penasaran.
- Soft selling; posting mengikuti `reels/POSTING.md`.
