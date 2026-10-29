# Aturan posting otomatis — Instagram @ikanasinaflah

Dokumen ini adalah sumber aturan untuk tugas terjadwal "Posting Reels @ikanasinaflah".
Kalau aturan berubah, cukup ubah file ini — prompt tugas terjadwal membaca file ini setiap kali jalan.

## Jadwal
- Satu Reel per hari, tayang pukul 19:00 WIB. Tugas mulai 18:50 WIB untuk persiapan; kalau persiapan selesai sebelum 19:00, tunggu sampai 19:00 WIB (pakai Monitor dengan until-loop yang mengecek jam, jangan foreground sleep), baru posting.
- Tidak bentrok dengan tugas "Carousel Harian Cumiasin" (15:55 WIB, carousel) — Reel tetap diposting walau hari itu sudah ada carousel.
- Maksimal **1 posting per hari**. Kalau sudah ada episode dengan `posted_at` di tanggal hari ini (WIB), jangan posting lagi.

## Memilih episode
1. Cari semua `reels/**/meta.json` dengan `"status": "ready"` atau `"status": "scheduled"`. Status `draft` (masih diproduksi) dan `hold` (ditahan Aflah) dilewati.
2. Hanya yang `scheduled_at` kosong (`null`) atau **tanggal**-nya (WIB) hari ini atau sebelumnya. Jamnya tidak dipakai untuk memilih — jam tayang selalu 19:00 WIB.
3. Urutkan: `scheduled_at` paling awal dulu (yang `null` paling belakang), lalu nomor `episode` terkecil.
4. Ambil **satu** saja. Kalau tidak ada → antrean kosong, jangan posting apa pun.

## Cek sebelum posting
- File `video.mp4`, `cover.jpg`, `caption.md` ada di folder episode yang sama.
- Video 1080x1920, durasi 3 dtk–15 menit; cover JPEG.
- Caption ≤ 2.200 karakter.
- Kalau ada yang tidak lolos: jangan posting, laporkan ke Aflah apa yang kurang.

## Cara posting (Windsor.ai)
Panggil `list_actions` connector `instagram` dulu untuk cek skema, lalu `execute_action`: connector `instagram`, account `17841444902662601` (@ikanasinaflah), action `create_video_post`.
Paket Windsor masih TRIAL: kalau pakai `get_data`, jangan pakai `force_refresh`.

| Parameter | Isi |
|---|---|
| `video_url` | `https://raw.githubusercontent.com/aflahermantoo-claude/ikanasinaflahig/main/<folder episode>/video.mp4` |
| `cover_url` | `https://raw.githubusercontent.com/aflahermantoo-claude/ikanasinaflahig/main/<folder episode>/cover.jpg` |
| `caption` | isi lengkap `caption.md`, apa adanya (jangan diubah) |
| `share_to_feed` | `false` (Reels tab saja, tidak masuk feed utama) |

- Pastikan kedua URL bisa diakses (HTTP 200) sebelum posting.
- Cek dobel sebelum posting: belum ada Reel (media_type VIDEO/REELS) dengan caption yang sama di @ikanasinaflah — cek `get_data` instagram akun 17841444902662601 (timestamp, media_id, media_type, media_caption, 7 hari terakhir).
- **Jalankan `create_video_post` sekali saja.** Kalau hasilnya error atau tidak jelas, JANGAN diulang (bisa jadi posting ganda) — tunggu 2 menit, cek lewat `get_data` apakah Reel-nya ternyata sudah tayang; kalau belum tayang, laporkan ke Aflah dan berhenti.

## Setelah posting
Ubah `meta.json` episode itu:
- `"status": "posted"`
- `"posted_at"`: waktu posting, format `2026-10-30T19:00:00+07:00`
- `"instagram_media_id"`: id dari hasil Windsor (kalau tidak ada, cari media terbaru @ikanasinaflah lewat Windsor; kalau tetap tidak ketemu, isi `null`)
- `"posted_via": "Windsor.ai create_video_post"`

Commit ke `main` dengan pesan `Posted: <judul episode>` (git user.name Claude, user.email noreply@anthropic.com), `git fetch origin main` + rebase, lalu push. Kalau push ditolak 403 / "not in this session's authorized repository set": panggil `add_repo` (owner aflahermantoo-claude, repo ikanasinaflahig, access push) lalu ulangi sekali; kalau 429, tunggu 10 detik lalu ulangi sekali.
Kalau push gagal, tetap laporkan id posting ke Aflah supaya besok tidak terposting ulang.

## Laporan ke Aflah
Kirim lewat `SendUserMessage` + `PushNotification` (supaya masuk ke HP). Satu pesan singkat dalam Bahasa Indonesia, tanpa tips/saran langkah berikutnya:
- Berhasil: judul episode + jam posting + sisa antrean (berapa episode `ready`, dan tanggal antrean habis).
- Tidak ada jadwal hari ini tapi masih ada episode terjadwal di tanggal berikutnya: bilang "hari ini tidak ada jadwal" + judul & tanggal episode berikutnya (bukan "antrean kosong").
- Antrean benar-benar kosong (tidak ada episode ready/scheduled sama sekali): bilang antrean kosong — tugas "Produksi Reels @ikanasinaflah" seharusnya sudah mengisinya, jadi sebutkan kalau ada episode yang masih `draft` (produksinya belum selesai).
- Gagal: apa yang gagal dan apa yang perlu Aflah lakukan.
- Selalu sebutkan perkiraan jumlah token yang dipakai.

## Menambah episode baru ke antrean
Buat folder `reels/<seri>/<episode>/` berisi `video.mp4`, `cover.jpg`, `caption.md`, `meta.json` dengan `"status": "ready"`.
Isi `scheduled_at` kalau mau tanggal tertentu; kalau `null`, episode masuk antrean urut setelah yang terjadwal.
