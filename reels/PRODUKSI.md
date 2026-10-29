# Aturan produksi otomatis — Reels @ikanasinaflah (Sinetron Asin Universe)

Dokumen ini adalah sumber aturan untuk tugas terjadwal "Produksi Reels @ikanasinaflah".
Tugas itu jalan beberapa kali sehari. Setiap kali jalan, tugas mengisi antrean supaya bahan (video, cover, caption, meta) sudah ada di repo sebelum jadwal posting 19:00 WIB.
Wajib dibaca juga: `reels/sinetron-asin/ATURAN_SERI.md` (gaya, 5 babak, footer, caption GEO) dan `reels/sinetron-asin/SERI.md` (rotasi, premis, tokoh, suara).
Disetujui Aflah 29 Okt 2026: full otomatis, tidak perlu persetujuan naskah.

## 1. Cek antrean (cepat; kalau penuh, berhenti tanpa notifikasi)
- Slot = tanggal WIB dari max(hari ini, 2026-11-01) sampai hari ini + 3 (antrean minimal 3 hari ke depan, cadangan kalau ada run yang gagal).
  Kalau sudah lewat 19:00 WIB, slot hari ini tidak dihitung.
- Slot terisi kalau ada `reels/**/meta.json` dengan tanggal `scheduled_at` = slot itu (status apa pun: draft, scheduled, ready, hold, posted).
- Kalau semua slot terisi dan tidak ada episode berstatus `draft`, berhenti tanpa mengirim pesan.
- Kalau ada `draft` (sisa run sebelumnya), lanjutkan draft itu dulu dari langkah yang belum selesai.
- Kalau tidak ada draft, produksi untuk slot kosong paling awal. Seri dan nomor episodenya ditentukan dari rumus rotasi di SERI.md.
- Satu run memproduksi 1 episode. Kalau waktu masih cukup dan masih ada slot kosong, boleh lanjut ke episode kedua.

## 2. Naskah (wajib 5 babak)
- Baca premis seri dan `naskah.md` + `caption.md` episode-episode sebelumnya dari seri yang sama, supaya cerita nyambung. Episode baru melanjutkan cliffhanger episode sebelumnya.
- Buat folder episode `reels/sinetron-asin/s<seri>e<ep>-<judul-singkat>/`. Langsung buat `meta.json` dengan `"status": "draft"` dan `scheduled_at` = slot jam 19:00 WIB, lalu commit dan push. Ini menandai slot supaya run lain tidak dobel.
- Tulis `naskah.md` di folder itu, isinya:
  - Judul.
  - Tabel 5 babak: Drama → Diremehkan → Penemuan mengejutkan ("wah, loh!") → Drama lagi → Cliffhanger. Tiap babak berisi dialog yang mengisinya.
  - Daftar dialog berformat `ID | tokoh | prompt ElevenLabs`. ID-nya `S<seri>E<ep>_<NN>` (misalnya `S2E1_01`). Isi 9–13 dialog dalam Bahasa Indonesia dengan logat Jawa ringan, dan tag arahan seperti `[datar]` atau `[panik]` boleh dipakai.
  - Daftar shot: id shot, latar, siapa yang tampil, aksi, dan SFX.
- Target durasi ±40 detik. Hook harus muncul di ≤3 detik pertama, dan kalimat terakhir harus berupa masalah yang belum selesai.
- Soft selling: produk (cumi asin, ikan asin, teri) hadir sebagai bagian cerita, bukan iklan. Jangan menulis harga, promo, atau klaim berlebihan.
- Update SERI.md: tambahkan 1 baris ringkasan episode ini di bawah serinya.

## 3. Suara
- Tambahkan dialog ke `_produksi/voices.json` (`lines`, `status: "belum"`). Tokoh baru ditambahkan ke `voices` dan tabel di SERI.md.
  Suara Cumi Jumbo (`cj`) belum dipilih: pilih sekali dari `creative_list_voices` (pria, Indonesia/Jawa, berat dan berwibawa), lalu simpan voice_id-nya.
- ElevenLabs: `creative_generate_speech` dengan model `eleven_v4`, flow `vPf78XLPMQwAE6mZ7aqB`, dan **`generations_count: 1`** (hemat kredit). Buat satu dialog setiap kali, jangan paralel. Polling `creative_get_flow_run_status`, lalu unduh `content_url` ke `_produksi/vo/<ID>.mp3`. Catat `status: "ok"` + `session_id`.
- Jangan mengulang panggilan generate untuk dialog yang sama kalau panggilan sebelumnya sudah memulai generasi, karena itu menagih kredit dua kali.
- Kalau ElevenLabs menolak (limit, kredit habis, "busy", diblokir), tunggu 2 menit lalu coba sekali lagi. Kalau masih gagal, pakai suara cadangan:
  `pip install -q --break-system-packages edge-tts` lalu `cd reels/sinetron-asin/_produksi && python3 tts_fallback.py <ID...>` untuk **semua** dialog episode ini yang belum ada.
  Kalau satu tokoh kena cadangan, buat ulang juga dialog tokoh itu yang sudah ada di episode ini dengan cadangan, supaya suaranya konsisten.
  Catat sumber suara di meta.json (`"voice"`).
- Kalau suara cadangan juga gagal: biarkan status draft, commit dan push yang sudah ada, laporkan ke Aflah. Run berikutnya akan melanjutkan.

## 4. Animasi (hanya gaya Ep 3)
Kerja di `reels/sinetron-asin/_produksi`, dengan kunci episode `s<seri>e<ep>` (misalnya `s2e1`):
- `audio.py`: tambahkan dialog ke `LINES` dan buat `SPECS['s2e1'] = [...]`. Tiap shot berisi `id`, `lines`, `pre`/`post`/`gap`, `min`, `sfx` (nama dari dict `SFX`), `amb` (`night`/`office`/`morning`), dan `phone` (daftar kode tokoh yang suaranya lewat telepon).
- `render_ep.js`: tulis fungsi `s2e1Scene(sh, t, T)` dengan gaya A (sitcom deadpan), memakai ulang helper dan karakter dari `ep3Scene` (latar, tokoh bergaris tebal, mata piring, lip-sync dari `env`). Tokoh baru digambar dalam gaya yang sama.
  Lalu daftarkan: `SCENES.s2e1 = [s2e1Scene, ep3Overlay]; TITLES.s2e1 = '<judul bar>..';`
- Overlay `ep3Overlay` sudah menangani bar judul, subtitle, footer brand, dan penutup "BERSAMBUNG... @ikanasinaflah". Jangan menambah watermark atau kredit.
- Render:
  ```
  cd reels/sinetron-asin/_produksi
  (cd engine && npm i)
  python3 audio.py s2e1
  node render_ep.js s2e1 preview 2,10,20,30     # cek dulu
  N=$(node render_ep.js s2e1 count); for s in $(seq 0 150 $N); do node render_ep.js s2e1 batch $s $((s+150)); done
  ffmpeg -framerate 30 -i s2e1/frames/%05d.png -i s2e1/audio.wav -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart s2e1/video.mp4
  ```
  Normalisasi loudness 2-pass ke −14 LUFS, TP −1: ukur dengan `loudnorm print_format=json`, lalu terapkan dengan `linear=true` dan `-c:v copy`. Hasilnya disimpan ke `s2e1/final.mp4`.

## 5. QC (wajib sebelum dijadwalkan)
Buat lembar kontak dari 1 frame per shot, lalu lihat sendiri. Perbaiki dan render ulang kalau ada yang tidak lolos:
- Semua teks ada di area aman (x 60–900, y 260–1670 pada 1080x1920).
- Subtitle tidak terpotong dan ada di atas footer brand.
- Tidak ada watermark atau kredit, tidak ada glyph rusak (kotak kosong), dan teks tidak menutupi mata tokoh.
- Gaya visual sama dengan Ep 3.
- Kelima babak terlihat jelas, dan endingnya cliffhanger.
- Durasi 30–60 detik, loudness −14 ±1 LUFS.

## 6. Paket & antrean
- Isi folder episode:
  - `video.mp4` (final).
  - `cover.jpg`, diambil dari frame klip yang paling bikin penasaran.
  - `caption.md`, mengikuti format GEO di ATURAN_SERI.md.
  - `naskah.md`.
  - `meta.json`: `"status": "scheduled"`, `scheduled_at` = slot 19:00 WIB, `duration_sec`, `voice`, `share_to_feed: false`. Field lain mengikuti contoh `s1e3-bos-oren/meta.json`.
- Commit hanya folder episode dan perubahan di `_produksi` (kode, `voices.json`, `vo/*.mp3`), jangan frame. Gunakan pesan `Produksi: <seri> Ep N "<judul>" untuk <tanggal>`, lalu fetch + rebase dan push ke main.
- Cek bahwa URL raw `video.mp4` dan `cover.jpg` di main mengembalikan HTTP 200.

## 7. Laporan ke Aflah
Kirim lewat `SendUserMessage` + `PushNotification` dalam Bahasa Indonesia yang singkat:
- Judul, seri, episode, dan tanggal tayang.
- Ringkasan 5 babak, 1 baris per babak.
- Sumber suara (ElevenLabs atau cadangan).
- Kalimat: "Balas 'tahan' kalau episode ini mau ditunda."
- Perkiraan token yang dipakai.
- Tanpa tips atau saran.
Kalau Aflah membalas "tahan", ubah meta.json episode itu menjadi `"status": "hold"`, lalu commit dan push. Episode berstatus hold tidak akan diposting.

## Larangan
- Jangan menghapus file.
- Jangan mengubah episode yang sudah `posted`.
- Jangan mengubah jadwal tugas.
- Jangan memposting dari tugas ini. Posting dikerjakan oleh tugas "Posting Reels @ikanasinaflah".
