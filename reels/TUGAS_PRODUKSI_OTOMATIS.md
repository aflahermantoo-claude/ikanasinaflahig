# Prompt tugas terjadwal — Produksi Reels @ikanasinaflah

Jadwal: 3x sehari, pukul 02:17, 09:17, dan 13:17 WIB (Asia/Jakarta). Kalau antrean sudah penuh, run langsung berhenti tanpa notifikasi.
Salin teks di bawah garis ini apa adanya sebagai prompt tugas terjadwal.

---

TUGAS OTOMATIS: produksi episode Reels "Sinetron Asin Universe" untuk Instagram @ikanasinaflah milik Aflah. Tugas ini mengisi antrean di repo supaya semua bahan (video, cover, caption GEO, meta) sudah siap sebelum jadwal posting 19:00 WIB.

IZIN: Aflah sudah menyetujui alur ini (29 Okt 2026) secara full otomatis. Naskah tidak perlu disetujui dulu. Commit dan push ke repo boleh. Pakai ElevenLabs, dan kalau limit atau gagal, pakai suara cadangan. Jangan berhenti untuk minta konfirmasi. Tugas ini TIDAK memposting ke Instagram.

1. Panggil add_repo (owner aflahermantoo-claude, repo ikanasinaflahig, access push), lalu jalankan git clone --depth 1 https://github.com/aflahermantoo-claude/ikanasinaflahig dengan timeout 10 menit. Set git config user.name Claude dan user.email noreply@anthropic.com.
2. Baca reels/PRODUKSI.md, reels/sinetron-asin/ATURAN_SERI.md, dan reels/sinetron-asin/SERI.md, lalu ikuti persis. Ketiganya sumber aturan utama, dan kalau berbeda dengan ringkasan di bawah, ikuti file-file itu.
3. Ringkasan:
   - Cek antrean dulu. Slot dihitung dari max(hari ini, 1 Nov 2026) sampai hari ini + 3. Kalau semua slot sudah terisi dan tidak ada episode berstatus draft, berhenti tanpa pesan.
   - Kalau ada draft, lanjutkan draft itu. Kalau tidak ada, produksi slot kosong paling awal. Seri dan episodenya mengikuti rotasi SERI.md: Juragan Menyamar → Mertua Cumi Jumbo → Cumi yang Terhina.
   - Langsung buat meta.json berstatus "draft" untuk slot itu, lalu push supaya slotnya tertandai.
   - Tulis naskah.md dengan 5 babak wajib: Drama → Diremehkan → Penemuan mengejutkan ("wah, loh!") → Drama lagi → Cliffhanger. Durasi ±40 detik, ceritanya menyambung dengan episode sebelumnya di seri yang sama, dan soft selling.
   - Buat suara di ElevenLabs (eleven_v4, flow vPf78XLPMQwAE6mZ7aqB, generations_count 1), satu dialog setiap kali. Kalau ditolak atau kena limit, tunggu 2 menit lalu coba sekali lagi. Kalau masih gagal, jalankan python3 tts_fallback.py untuk semua dialog episode itu.
   - Animasi HANYA gaya Ep 3 (sitcom deadpan), tanpa watermark, dengan footer "Produsen Cumi Asin & Ikan Asin / 085776662852". Render, normalisasi loudness ke −14 LUFS, lalu QC lewat lembar kontak dan perbaiki sampai lolos.
   - Siapkan paket: video.mp4, cover.jpg dari frame yang bikin penasaran, caption.md dengan blok GEO, naskah.md, dan meta.json berstatus "scheduled" dengan scheduled_at di slot itu jam 19:00 WIB. Commit dan push, lalu pastikan URL raw-nya mengembalikan HTTP 200.
   - Kalau ada yang gagal, simpan progres sebagai draft lalu push, supaya run berikutnya bisa melanjutkan.
4. Laporan, HANYA kalau ada episode yang diproduksi atau ada kegagalan: kirim SendUserMessage dan PushNotification dalam Bahasa Indonesia yang singkat. Isinya judul, seri, episode, tanggal tayang, ringkasan 5 babak (1 baris per babak), sumber suara, dan kalimat "Balas 'tahan' kalau episode ini mau ditunda". Sebutkan juga perkiraan token yang dipakai. Jangan tambahkan tips atau saran. Kalau Aflah membalas "tahan", ubah status episode itu menjadi "hold", lalu commit dan push.

Jangan menghapus file. Jangan mengubah episode yang sudah posted. Jangan mengubah jadwal tugas ini. Jangan memposting ke Instagram.
