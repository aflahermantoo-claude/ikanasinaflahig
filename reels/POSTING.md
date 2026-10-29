# Aturan posting otomatis — Instagram @ikanasinaflah

Dokumen ini adalah sumber aturan untuk tugas terjadwal "Posting Reels @ikanasinaflah".
Kalau aturan berubah, cukup ubah file ini — prompt tugas terjadwal membaca file ini setiap kali jalan.

## Jadwal
- Satu Reel per hari, sekitar pukul 19:00 WIB.
- Maksimal **1 posting per hari**. Kalau sudah ada episode dengan `posted_at` di tanggal hari ini (WIB), jangan posting lagi.

## Memilih episode
1. Cari semua `reels/**/meta.json` dengan `"status": "ready"` atau `"status": "scheduled"`.
2. Hanya yang `scheduled_at` kosong (`null`) atau sudah lewat/sama dengan waktu sekarang (WIB).
3. Urutkan: `scheduled_at` paling awal dulu (yang `null` paling belakang), lalu nomor `episode` terkecil.
4. Ambil **satu** saja. Kalau tidak ada → antrean kosong, jangan posting apa pun.

## Cek sebelum posting
- File `video.mp4`, `cover.jpg`, `caption.md` ada di folder episode yang sama.
- Video 1080x1920, durasi 3 dtk–15 menit; cover JPEG.
- Caption ≤ 2.200 karakter.
- Kalau ada yang tidak lolos: jangan posting, laporkan ke Aflah apa yang kurang.

## Cara posting (Windsor.ai)
Connector `instagram`, action `create_video_post`, akun @ikanasinaflah:

| Parameter | Isi |
|---|---|
| `video_url` | `https://raw.githubusercontent.com/aflahermantoo-claude/ikanasinaflahig/main/<folder episode>/video.mp4` |
| `cover_url` | `https://raw.githubusercontent.com/aflahermantoo-claude/ikanasinaflahig/main/<folder episode>/cover.jpg` |
| `caption` | isi lengkap `caption.md`, apa adanya (jangan diubah) |
| `share_to_feed` | `false` (Reels tab saja, tidak masuk feed utama) |

- Pastikan kedua URL bisa diakses (HTTP 200) sebelum posting.
- **Jalankan `create_video_post` sekali saja.** Kalau hasilnya error atau tidak jelas, JANGAN diulang (bisa jadi posting ganda) — laporkan ke Aflah dan berhenti.

## Setelah posting
Ubah `meta.json` episode itu:
- `"status": "posted"`
- `"posted_at"`: waktu posting, format `2026-10-30T19:00:00+07:00`
- `"instagram_media_id"`: id dari hasil Windsor (kalau tidak ada, cari media terbaru @ikanasinaflah lewat Windsor; kalau tetap tidak ketemu, isi `null`)
- `"posted_via": "Windsor.ai create_video_post"`

Commit ke `main` dengan pesan `Posted: <judul episode>` lalu push.
Kalau push gagal, tetap laporkan id posting ke Aflah supaya besok tidak terposting ulang.

## Laporan ke Aflah
Satu pesan singkat dalam Bahasa Indonesia:
- Berhasil: judul episode + jam posting + sisa antrean (berapa episode `ready`, dan tanggal antrean habis).
- Antrean kosong: bilang antrean kosong dan perlu episode baru.
- Gagal: apa yang gagal dan apa yang perlu Aflah lakukan.
- Selalu sebutkan perkiraan jumlah token yang dipakai.

## Menambah episode baru ke antrean
Buat folder `reels/<seri>/<episode>/` berisi `video.mp4`, `cover.jpg`, `caption.md`, `meta.json` dengan `"status": "ready"`.
Isi `scheduled_at` kalau mau tanggal tertentu; kalau `null`, episode masuk antrean urut setelah yang terjadwal.
