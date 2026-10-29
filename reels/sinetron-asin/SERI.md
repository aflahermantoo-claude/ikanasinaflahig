# Seri, tokoh & rotasi — Sinetron Asin Universe

## Rotasi tayang (mulai 1 Nov 2026, 1 episode per hari, 19:00 WIB)
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

## Seri 2 — Juragan Menyamar
Premis: Cumi Jumbo, pemilik 100 gudang ikan asin, menyamar jadi kuli di gudangnya sendiri (pakai caping). Mandor galak (Kakap berhelm kuning) meremehkannya tanpa tahu dia juragan. Soft sell: kualitas & ketelitian gudang ikan asin.
- Ep 1 "Hari Pertama Jadi Kuli" — mandor menendang caping Cumi Jumbo ("Kuli kayak kamu nggak akan pernah jadi apa-apa!"); Cumi Jumbo diam-diam membuktikan dia paling paham ikan asin; mandor mengumumkan "Besok Juragan Besar datang inspeksi!" — Cumi Jumbo mengedip ke kamera. ✅ Diproduksi (tayang 1 Nov 2026): Teri (kuli) membuktikan ikan asinnya memang masih lembab; mandor menyuruh "kuli caping" menyambut Juragan di gerbang besok.

## Seri 3 — Mertua Cumi Jumbo
Premis: Cumi Baby, putri juragan terkaya (Papa Cumi Jumbo), jatuh cinta pada Teri Nasi yang sederhana. Papa menolak keras — sampai diam-diam mencicipi masakan Teri. Soft sell: nasi goreng teri / masakan ikan asin.
- Ep 1 "Tinggalkan Anak Saya!" — Papa Cumi Jumbo membanting amplop uang di meja makan: "Berapa yang kamu mau? Tinggalkan anak saya!"; Teri Nasi menolak uangnya; Papa diam-diam mencicipi nasi goreng teri...

## Tokoh & suara (ElevenLabs, `_produksi/voices.json`)
| Kode | Tokoh | Suara ElevenLabs | Cadangan (Microsoft Edge neural) |
|---|---|---|---|
| nar | Narator sinetron | Hendro Atmoko `F414PgPuQGviai32J141` | jv-ID-DimasNeural |
| cb | Cumi Baby (wanita) | Mutia `eRyKqfgsJAedPgBBSuqA` | jv-ID-SitiNeural |
| teri | Teri / Teri Nasi (pria muda) | Wibowo `401JBh3qavLxL2CJfqvZ` | id-ID-ArdiNeural |
| kakap | Kakap Segar / Mandor | Maliq Nganjuk `EIcz16yo4q5hJFhNay0n` | jv-ID-DimasNeural |
| ko | Bos Oren | Bambangg `IMaRqUzeNVCT6ks9SI4Y` | jv-ID-DimasNeural (pitch rendah) |
| cj | Cumi Jumbo / Papa (pria tua berwibawa) | Bambang (Grounded and authoritative) `j7n5yC6BN3oA2ZIWImty` | jv-ID-DimasNeural (pitch rendah) |

Tokoh baru: tambahkan baris di tabel ini + voices.json, dan gambar dalam gaya Ep 3.
