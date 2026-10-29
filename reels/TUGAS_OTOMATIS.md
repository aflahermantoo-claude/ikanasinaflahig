# Prompt tugas terjadwal — Posting Reels @ikanasinaflah

Jadwal: setiap hari pukul 18:50 WIB (Asia/Jakarta). Tugas menyiapkan lalu menunggu, dan Reel tayang tepat 19:00 WIB.
Salin teks di bawah garis ini apa adanya sebagai prompt tugas terjadwal.

---

TUGAS HARIAN OTOMATIS: posting 1 Reel ke Instagram @ikanasinaflah milik Aflah, tayang pukul 19:00 WIB.

IZIN: Aflah sudah menyetujui alur ini (29 Okt 2026): setiap episode berstatus "ready" atau "scheduled" di repo boleh langsung diposting, commit dan push ke repo juga boleh, tanpa konfirmasi per postingan. Jangan berhenti untuk minta konfirmasi.

1. Panggil add_repo (owner aflahermantoo-claude, repo ikanasinaflahig, access push), lalu jalankan git clone --depth 1 https://github.com/aflahermantoo-claude/ikanasinaflahig dengan timeout 10 menit. Baca reels/POSTING.md dan ikuti aturannya persis. File itu sumber aturan utama, dan kalau berbeda dengan ringkasan di bawah, ikuti POSTING.md.
2. Ringkasan aturan:
   - Maksimal 1 posting per hari. Kalau sudah ada meta.json dengan posted_at bertanggal hari ini (WIB), berhenti.
   - Pilih SATU episode dari reels/**/meta.json yang berstatus "ready" atau "scheduled", dengan tanggal scheduled_at hari ini atau sebelumnya (atau null). Urutkan dari scheduled_at paling awal, lalu nomor episode terkecil.
   - Pastikan URL raw.githubusercontent.com untuk video.mp4 dan cover.jpg mengembalikan HTTP 200. Pastikan juga Reel ini belum tayang dengan cek Windsor get_data instagram akun 17841444902662601, 7 hari terakhir, tanpa force_refresh.
   - Kalau belum jam 19:00 WIB, tunggu dengan Monitor until-loop sampai jam 19:00.
   - Posting: jalankan Windsor list_actions instagram, lalu execute_action dengan connector instagram, account 17841444902662601, action create_video_post. Isinya: video_url dan cover_url berupa URL raw di cabang main, caption berupa isi lengkap caption.md tanpa diubah, dan share_to_feed false.
   - Jalankan create_video_post SEKALI saja. Kalau error, jangan diulang. Tunggu 2 menit lalu cek apakah Reel sudah tayang. Kalau belum tayang, laporkan.
   - Setelah tayang, ubah meta.json: status "posted", lalu isi posted_at, instagram_media_id, dan posted_via. Commit dengan pesan "Posted: <judul>", jalankan fetch dan rebase, lalu push ke main.
3. Laporan: kirim SendUserMessage dan PushNotification dalam Bahasa Indonesia yang singkat. Isinya judul episode dan jam tayang, sisa antrean, atau alasan gagal dan apa yang perlu dilakukan Aflah. Sebutkan juga perkiraan jumlah token yang dipakai. Jangan tambahkan tips atau saran langkah berikutnya.

Jangan menghapus file apa pun. Jangan mengubah jadwal tugas ini.
