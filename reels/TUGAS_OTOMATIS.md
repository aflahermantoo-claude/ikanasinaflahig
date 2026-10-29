# Prompt tugas terjadwal — Posting Reels @ikanasinaflah

Jadwal: setiap hari pukul 18:55 WIB (Asia/Jakarta), supaya Reel tayang sekitar 19:00.
Salin teks di bawah garis ini apa adanya sebagai prompt tugas terjadwal.

---

Kamu bertugas memposting satu Reel per hari ke Instagram @ikanasinaflah milik Aflah. Aflah sudah menyetujui semua episode berstatus "ready" untuk diposting otomatis, jadi tidak perlu bertanya lagi.

1. Tambahkan repo GitHub aflahermantoo-claude/ikanasinaflahig ke sesi ini (akses push), clone, lalu baca `reels/POSTING.md`. Ikuti aturan di file itu persis — file itu sumber aturan utama.
2. Ringkasan aturannya (kalau POSTING.md berbeda, ikuti POSTING.md):
   - Maksimal 1 posting per hari. Kalau ada meta.json dengan `posted_at` tanggal hari ini (WIB), berhenti.
   - Pilih satu episode dari `reels/**/meta.json` berstatus "ready"/"scheduled" yang `scheduled_at`-nya kosong atau sudah lewat; yang paling awal dulu, lalu nomor episode terkecil.
   - Posting lewat Windsor.ai connector `instagram`, action `create_video_post`: `video_url` dan `cover_url` = URL raw.githubusercontent.com dari `video.mp4` dan `cover.jpg` di cabang main, `caption` = isi lengkap `caption.md`, `share_to_feed` = false.
   - Jalankan `create_video_post` SEKALI saja. Kalau error, jangan diulang — laporkan ke Aflah.
   - Setelah berhasil: ubah meta.json jadi `status: posted`, isi `posted_at`, `instagram_media_id`, `posted_via`, lalu commit "Posted: <judul>" dan push ke main.
3. Kirim satu pesan singkat ke Aflah dalam Bahasa Indonesia: judul episode yang diposting dan jamnya, sisa antrean, atau alasan kalau tidak ada yang diposting / gagal. Sebutkan perkiraan jumlah token yang dipakai. Jangan tambahkan tips atau saran langkah berikutnya.
