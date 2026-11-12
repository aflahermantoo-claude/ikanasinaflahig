# Seri, tokoh & rotasi — Sinetron Asin Universe

## ⚠️ ATURAN AKTIF mulai 12 Nov 2026 (permintaan Aflah) — 2 Reels per hari
Dua jalur tayang, masing-masing 1 episode per hari. Jalur ditandai `"slot"` di meta.json dan jam di `scheduled_at`.

| Jalur | Jam tayang | Seri | Batas |
|---|---|---|---|
| `malam` | 19:00 WIB | Seri 2 — Juragan Menyamar (paling banyak views) | sampai **Ep 10** (Ep 3 = 12 Nov … Ep 10 = 19 Nov 2026), lalu berhenti dan lapor sekali ke Aflah |
| `pagi` | 09:00 WIB (mulai 13 Nov 2026) | Seri 3 — Mertua Cumi Jumbo ↔ Seri 1 — Cumi yang Terhina, bergantian | lanjut terus (aturan lama tanpa Seri 2) |

- Jalur pagi, urutan stok yang sudah jadi: 13 Nov S3E2, 14 S1E5, 15 S3E3, 16 S1E6, 17 S3E4, 18 S1E7, 19 S3E5, 20 S1E8. Setelah itu lanjut bergantian: S3E6, S1E9, S3E7, S1E10, dst. (Seri 3 dulu, lalu Seri 1).
- Produksi jalan setiap hari ±16:00 WIB: isi slot kosong jalur malam dulu (episode Seri 2 berikutnya), lalu jalur pagi.
- Rotasi di bawah ini (3 seri bergilir) TIDAK berlaku selama aturan aktif ini ada.

## Rotasi tayang lama (1–11 Nov 2026, 1 episode per hari, 19:00 WIB)
Urutan bergilir, diulang terus:
1. Seri 2 — Juragan Menyamar (episode berikutnya)
2. Seri 3 — Mertua Cumi Jumbo (episode berikutnya)
3. Seri 1 — Cumi yang Terhina (episode berikutnya)

Contoh: 1 Nov = S2E1, 2 Nov = S3E1, 3 Nov = S1E4, 4 Nov = S2E2, 5 Nov = S3E2, 6 Nov = S1E5, dst.
Rumus: hari ke-n sejak 1 Nov (n = 0,1,2,...) → seri ke-(n mod 3) di daftar di atas, episode ke-(n div 3 + 1) dari seri itu (Seri 1 dimulai dari Ep 4).
Kalau Aflah bilang suatu seri dihentikan/ditambah, ubah daftar ini.

Folder: `reels/sinetron-asin/s<seri>e<ep>-<judul-singkat>/` (contoh `s2e1-hari-pertama-jadi-kuli`).

## Seri 1 — Cumi yang Terhina
Premis: Cumi Baby (cumi asin kecil, kering, sering diejek) ternyata punya aroma yang dicari chef dan bos-bos besar. Kakap Segar iri dan terus berusaha menjatuhkannya.
- Ep 1 "Dihina di Pasar" — Cumi Baby dihina Kakap Segar di Pasar Ikan Bu Sum karena kering dan bau; chef misterius mencium aromanya.
- Ep 2 "Chef Misterius" — trio chef Teri (Restoran Bintang Lima) menawari Cumi Baby kerja, gajinya nasi hangat tiap hari; Kakap menelepon "Bos".
- Ep 3 "Bos Oren" — Kakap minta Bos Oren (kucing oren, bos pasar) "mengajak ngobrol" Cumi Baby; Bos Oren malah pesan 10 kilo: "Ternyata enak." Kakap masih menunggu di telepon.
- Ep 4 dst: lanjutkan dari sini (Kakap kehilangan dukungan Bos Oren, Cumi Baby mulai kerja di restoran, dsb.).
- Ep 4 "Kakap Ditinggal Bos" — ✅ Diproduksi (tayang 3 Nov 2026): telepon Kakap ditutup Bos Oren, lapak esnya sepi; Kakap menghina Cumi Baby ("lakunya sehari doang!"), lalu kaget melihat antrean tamu restoran Teri yang semuanya pesan cumi asin; Bos Oren menjadikan lapak es Kakap gudang cumi asin; malamnya Kakap menelepon "Juragan Hiu" — satu-satunya yang ditakuti Bos Oren.
- Ep 5 "Juragan Hiu" — ✅ Diproduksi (tayang 6 Nov 2026): Juragan Hiu datang dan meremehkan Cumi Baby ("cumi kecil, kering, keriput"); aroma cumi asin mengingatkannya pada kampung nelayan masa kecil sampai menangis; dia mau memborong semua cumi asin, Bos Oren menolak — duel di dermaga; sementara itu Kakap kabur membawa karung cumi asin terakhir.
- Ep 6 "Duel di Dermaga" — ✅ Diproduksi (tayang 9 Nov 2026): Juragan Hiu & Bos Oren saling tatap di dermaga (yang kalah tak boleh beli cumi asin lagi); Kakap mendayung perahu membawa karung "terakhir" dan mengejek Cumi Baby — "Oh. Itu bukan yang terakhir"; Teri datang: jemuran pagi kering, lima puluh karung, wanginya sampai ujung dermaga ("Loh?!"); duel batal, kedua bos tarik-tarikan karung; di tengah laut perahu Kakap goyang — sesuatu yang lebih besar dari Juragan Hiu ikut mencium aromanya.
- Ep 7 "Penghuni Laut Dalam" — ✅ Diproduksi (tayang 12 Nov 2026): tentakel raksasa mengangkat perahu Kakap dan merebut karung cumi asinnya; Kakap basah kuyup menyalahkan Cumi Baby ("monster juga pasti muntah!") — "Monsternya nggak muntah. Dia ikut ke sini"; karung dikembalikan kosong-bersih, Juragan Hiu gemetar: Penghuni Laut Dalam, seratus tahun tak pernah naik ("Loh?!"); Bos Oren & Juragan Hiu gencatan senjata menjaga lima puluh karung; Cumi Baby maju sendirian — dan untuk pertama kalinya dalam seratus tahun, Penghuni Laut Dalam bicara.
- Ep 8 "Kata Pertama" — ✅ Diproduksi (tayang 15 Nov 2026): kata pertama Penghuni Laut Dalam: "Siapa yang menjemur cumi asin ini?" — Kakap menunjuk Cumi Baby, mengejeknya "kering, keriput, bau gudang", Juragan Hiu menyuruhnya minta maaf; Cumi Baby: "Saya yang jemur. Dua hari, garamnya pas"; Penghuni Laut Dalam menangis — seratus tahun mencari wangi jemuran nelayan masa kecilnya ("Loh?! Monster laut nangis?!"), Bos Oren: "Dia kangen"; dia mengklaim semua cumi asin dermaga milik laut, Cumi Baby menolak — sudah dipesan restoran Teri; "Besok saya bawa teman-teman saya" — seratus pasang mata kuning terbuka di dasar laut.

## Seri 2 — Juragan Menyamar
Premis: Cumi Jumbo, pemilik 100 gudang ikan asin, menyamar jadi kuli di gudangnya sendiri (pakai caping). Mandor galak (Kakap berhelm kuning) meremehkannya tanpa tahu dia juragan. Soft sell: kualitas & ketelitian gudang ikan asin.
- Ep 1 "Hari Pertama Jadi Kuli" — mandor menendang caping Cumi Jumbo ("Kuli kayak kamu nggak akan pernah jadi apa-apa!"); Cumi Jumbo diam-diam membuktikan dia paling paham ikan asin; mandor mengumumkan "Besok Juragan Besar datang inspeksi!" — Cumi Jumbo mengedip ke kamera. ✅ Diproduksi (tayang 1 Nov 2026): Teri (kuli) membuktikan ikan asinnya memang masih lembab; mandor menyuruh "kuli caping" menyambut Juragan di gerbang besok.
- Ep 2 "Salah Sembah" — ✅ Diproduksi (tayang 4 Nov 2026): hari inspeksi, mandor menyebut kuli caping "cuma pajangan" dan mengejek tegurannya soal karung teri di lantai; sekretaris menelepon — Juragan sudah di gudang sejak kemarin; mandor panik lalu menyembah Teri, sementara juragan asli masih berdiri di gerbang membawa karung teri.
- Ep 3 "Juragan di Gerbang" — ✅ Diproduksi (tayang 7 Nov 2026): Mandor masih menyembah Teri dan mengusir kuli caping yang menaruh karung teri di rak; sekretaris di telepon: Juragan "pakai caping, bawa karung teri" — "Loh... caping?!"; Cumi Jumbo membuka caping (100 karung dicek, 30 masih lembab), Teri jadi mandor, Kakap jadi kuli; malamnya Kakap bercaping menelepon "Bos": "Gudang nomor seratus... malam ini."
- Ep 4 "Gudang Nomor Seratus" — ✅ Diproduksi (tayang 10 Nov 2026): malam, Kakap bercaping membuka gembok Gudang No. 100 untuk "Bos"; Mandor Teri memergokinya, Kakap mengejek helm Teri dan "cumi asin kecil-kecil, keriput"; Cumi Jumbo muncul — gudang seratus berisi cumi asin terbaiknya, Kakap mencium karung ("Loh... kok wanginya begini?!"); lampu truk datang, Cumi Jumbo sudah kenal Bos itu dari dulu; yang turun dari truk memakai caping yang sama persis dengan Juragan.
- Ep 5 "Caping Kembar" — ✅ Diproduksi (tayang 13 Nov 2026): yang turun dari truk ternyata Juragan Hiu bercaping; Hiu mengejek Cumi Jumbo ("dari dulu cuma kuli") dan Kakap mengejek cumi asin gudang seratus ("pakan kucing"); Hiu mencium karung — "Loh... wangi jemuran kita dulu di dermaga?!" — dan menangis: dulu mereka berdua kuli jemur, capingnya kembar; Hiu menyuruh angkut semua, Cumi Jumbo: gudang seratus tak pernah dijual; HP Teri: gudang 1 sampai 99 pintunya terbuka semua — truk Juragan Hiu bukan cuma satu.
- Ep 6 "Truk Tengah Malam" — ✅ Diproduksi (tayang 15 Nov 2026, malam): Juragan Hiu tertawa dengan 99 truk, semua gudang Jumbo mau dikosongkan; Kakap mengejek "tinggal satu gudang cumi asin keriput", Hiu: "dari kuli balik jadi kuli"; Cumi Jumbo: "Silakan, buka truknya" — sopir lapor 99 gudang kosong semua ("Loh?!"): sejak jadi kuli dia mengecek satu-satu, yang terbaik dijemur ulang dan dipindah ke gudang seratus, truk Hiu cuma bau solar; Hiu menyuruh 99 truk mengepung gudang seratus; Cumi Jumbo tenang: "Saya sudah telepon seseorang" — dari arah dermaga terdengar suara yang paling ditakuti Juragan Hiu.

## Seri 3 — Mertua Cumi Jumbo
Premis: Cumi Baby, putri juragan terkaya (Papa Cumi Jumbo), jatuh cinta pada Teri Nasi yang sederhana. Papa menolak keras — sampai diam-diam mencicipi masakan Teri. Soft sell: nasi goreng teri / masakan ikan asin.
- Ep 1 "Tinggalkan Anak Saya!" — Papa Cumi Jumbo membanting amplop uang di meja makan: "Berapa yang kamu mau? Tinggalkan anak saya!"; Teri Nasi menolak uangnya; Papa diam-diam mencicipi nasi goreng teri... ✅ Diproduksi (tayang 2 Nov 2026): Papa ketahuan menghabiskan sepiring ("dimakan kucing!"), lalu memberi syarat — Teri harus mengalahkan chef pribadi Papa besok; chef itu belum pernah kalah.
- Ep 2 "Chef Tak Terkalahkan" — ✅ Diproduksi (tayang 5 Nov 2026): chef pribadi Papa ternyata Chef Kakap, yang mengejek bahan Teri ("ikan kering bau gudang"); nasi goreng cumi asin & teri buatan Teri bikin Papa dan Chef Kakap sendiri terdiam ("Loh... kok enak?!"); Papa gengsi mengakui Teri menang, lalu Chef Kakap berbisik "Teri itu anak siapa" — ayah Teri adalah orang yang paling Papa benci.
- Ep 3 "Anak Siapa?" — ✅ Diproduksi (tayang 8 Nov 2026): Papa menginterogasi Teri — bapaknya "cuma tukang jemur cumi di Muara Angke"; Chef Kakap & Papa mengejek; aroma cumi asin jemuran bapak Teri ternyata aroma cumi asin pertama yang bikin Papa kaya ("Loh!"); bapak Teri meninggalkan Papa di dermaga 30 tahun lalu, Teri dilarang masuk rumah; malam itu yang mengetuk pintu justru bapak Teri sendiri.
- Ep 4 "Tamu Tengah Malam" — ✅ Diproduksi (tayang 11 Nov 2026): Papa membuka pintu — "Teri Besar", bapak Teri bercaping memikul karung, datang menjemput anaknya; Chef Kakap ("usir saja!") & Papa ("mau minta modal?") meremehkannya; isi karung: cumi asin yang dulu mereka jemur berdua ("Loh...") — malam itu bapak Teri melaut, Papa-lah yang pergi membawa semua jemuran; Papa mengusir semua orang; di dasar karung Teri menemukan surat lama bertanda tangan Papa.
- Ep 5 "Surat di Dasar Karung" — ✅ Diproduksi (tayang 14 Nov 2026): Teri mengangkat surat lama bertanda tangan "Jumbo", Papa panik; Chef Kakap mengejek "kertas lusuh bau cumi asin keriput, paling surat utang", Papa menyuruh buang; Cumi Baby membacanya — "Jemuran cumi asin ini milik kita berdua. Separuh untuk Teri Besar." ("Loh?!"), Papa mengendus surat yang masih wangi jemuran mereka dulu; Bapak Teri tak minta harta, cuma menyimpan janji, Papa mulai luluh — Chef Kakap menyambar surat dan kabur; di luar pagar, truk Juragan Hiu sudah menunggu.

## Tokoh & suara (ElevenLabs, `_produksi/voices.json`)
| Kode | Tokoh | Suara ElevenLabs | Cadangan (Microsoft Edge neural) |
|---|---|---|---|
| nar | Narator sinetron | Hendro Atmoko `F414PgPuQGviai32J141` | jv-ID-DimasNeural |
| cb | Cumi Baby (wanita) | Mutia `eRyKqfgsJAedPgBBSuqA` | jv-ID-SitiNeural |
| teri | Teri / Teri Nasi (pria muda) | Wibowo `401JBh3qavLxL2CJfqvZ` | id-ID-ArdiNeural |
| kakap | Kakap Segar / Mandor | Maliq Nganjuk `EIcz16yo4q5hJFhNay0n` | jv-ID-DimasNeural |
| ko | Bos Oren | Bambangg `IMaRqUzeNVCT6ks9SI4Y` | jv-ID-DimasNeural (pitch rendah) |
| cj | Cumi Jumbo / Papa (pria tua berwibawa) | Bambang (Grounded and authoritative) `j7n5yC6BN3oA2ZIWImty` | jv-ID-DimasNeural (pitch rendah) |
| hiu | Juragan Hiu (hiu abu-abu, bekas luka, kalung emas "H") | Kang Nandar `aK834gEOxQEtviMPgurT` | id-ID-ArdiNeural (pitch rendah) |
| pld | Penghuni Laut Dalam (gurita raksasa ungu, mata piring, seratus tahun di dasar laut) | A Serakkk - Deep, hoarse `LxiqOV1uxBCgYTeitAHf` | id-ID-ArdiNeural (pelan, pitch sangat rendah) |
| bt | Bapak Teri / "Teri Besar" (teri tua, sisik abu, kumis & alis putih, caping, karung cumi) | Arthur - Wise Indonesian Narrator `tX4zpyB6s34no1FgD0Mm` | id-ID-ArdiNeural (pelan, pitch rendah) |

Tokoh baru: tambahkan baris di tabel ini + voices.json, dan gambar dalam gaya Ep 3.
