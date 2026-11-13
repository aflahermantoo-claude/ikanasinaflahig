"""Build timeline + audio mix for Sinetron Asin episodes.
usage: python3 audio.py ep2|ep3
Voice clips are read from vo/<ID>.mp3 (ElevenLabs). Missing clips get an espeak placeholder.
"""
import json, os, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, resample_poly

EP = sys.argv[1]
SR = 44100
FPS = 30
rng = np.random.default_rng(11)

LINES = {
 'E2_01': ('nar', 'Sebelumnya... seorang chef misterius mencium aroma Cumi Baby.'),
 'E2_02': ('cb', 'Oh.'),
 'E2_03': ('teri', 'Kami chef Restoran Bintang Lima. Kami cari cumi asin paling wangi se-Jawa.'),
 'E2_04': ('kakap', 'Chef! Chef! Saya lebih segar! Saya ndak bau!'),
 'E2_05': ('teri', 'Hmm... Amis.'),
 'E2_06': ('teri', 'Mbak Cumi, mau kerja di dapur kami?'),
 'E2_07': ('cb', 'Gajinya berapa?'),
 'E2_08': ('teri', 'Nasi hangat. Tiap hari.'),
 'E2_09': ('cb', '...Deal.'),
 'E2_10': ('kakap', 'Bos... cumi asin itu mau masuk restoran.'),
 'E2_11': ('nar', 'Bersambung.'),
 'E3_01': ('kakap', 'Bos, gawat. Cumi asin itu mau kerja di restoran bintang lima.'),
 'E3_02': ('ko', 'Terus?'),
 'E3_03': ('kakap', 'Kalau dia terkenal, lapak es saya sepi, Bos!'),
 'E3_04': ('ko', 'Kamu mau saya ngapain?'),
 'E3_05': ('kakap', 'Culik, Bos! Eh... maksudnya, ajak ngobrol.'),
 'E3_06': ('ko', 'Yo wis. Kirim alamatnya.'),
 'E3_07': ('cb', 'Monggo, Mas. Cari apa?'),
 'E3_08': ('ko', '...Mbak. Saya pesan sepuluh kilo.'),
 'E3_09': ('kakap', 'Bos? Bos?! Gimana?'),
 'E3_10': ('ko', 'Sibuk. Lagi makan.'),
 'E3_11': ('ko', 'Ternyata enak.'),
 'S2E1_01': ('kakap', 'Heh, kuli baru! Jalan kok kayak siput!'),
 'S2E1_02': ('cj', 'Maaf, Pak Mandor.'),
 'S2E1_03': ('kakap', 'Kuli kayak kamu nggak akan pernah jadi apa-apa!'),
 'S2E1_04': ('teri', 'Sabar, Pak. Mandor memang begitu.'),
 'S2E1_05': ('cj', 'Ikan asin di karung ini... belum kering betul. Jemur sehari lagi.'),
 'S2E1_06': ('kakap', 'Halah! Kuli kok ngajari mandor!'),
 'S2E1_07': ('teri', 'Loh... iya, Mandor. Masih lembab!'),
 'S2E1_08': ('kakap', '...Ya wis, jemur ulang. Diam kamu.'),
 'S2E1_09': ('kakap', 'Semua dengar! Besok Juragan Besar datang inspeksi!'),
 'S2E1_10': ('kakap', 'Dan kamu, kuli caping... kamu yang nyambut beliau di gerbang!'),
 'S2E1_11': ('cj', 'Siap... Pak Mandor.'),
 'S2E1_12': ('nar', 'Mandor belum tahu... juragan yang dia tunggu, sudah dia tendang hari ini.'),
 'S3E1_01': ('cj', 'Berapa yang kamu mau? Tinggalkan anak saya!'),
 'S3E1_02': ('teri', 'Maaf, Om... saya nggak butuh uang.'),
 'S3E1_03': ('cj', 'Kamu itu cuma teri nasi. Kecil, kering, nggak ada harganya!'),
 'S3E1_04': ('cb', 'Papa! Mas Teri itu jago masak!'),
 'S3E1_05': ('cj', 'Masak? Paling cuma bisa goreng kerupuk.'),
 'S3E1_06': ('teri', 'Kalau begitu, Om cicipi dulu. Nasi goreng teri.'),
 'S3E1_07': ('cj', '...Loh. Kok enak?'),
 'S3E1_08': ('cb', 'Papa?! Piringnya kok sudah habis?'),
 'S3E1_09': ('cj', 'Itu... dimakan kucing!'),
 'S3E1_10': ('cj', 'Ya wis. Kamu boleh dekati anak saya... kalau bisa kalahkan chef pribadi saya. Besok.'),
 'S3E1_11': ('nar', 'Masalahnya... chef pribadi Papa, belum pernah kalah sekali pun.'),
 'S1E4_01': ('kakap', 'Bos? Bos! Kok teleponnya ditutup?!'),
 'S1E4_02': ('nar', 'Sejak Bos Oren mencicipi cumi asin... lapak es Kakap sepi.'),
 'S1E4_03': ('kakap', 'Heh, cumi kering! Bos Oren itu cuma kasihan sama kamu.'),
 'S1E4_04': ('kakap', 'Cumi asin kayak kamu, lakunya sehari doang!'),
 'S1E4_05': ('cb', 'Oh.'),
 'S1E4_06': ('teri', 'Mbak Cumi! Restoran penuh! Semua tamu pesan cumi asin!'),
 'S1E4_07': ('kakap', 'Loh... antre sepanjang ini... cuma buat cumi asin?'),
 'S1E4_08': ('ko', 'Kakap. Mulai besok, lapakmu jadi gudang cumi asin.'),
 'S1E4_09': ('kakap', 'Bos?! Terus saya jualan di mana?'),
 'S1E4_10': ('ko', 'Terserah. Saya sibuk makan.'),
 'S1E4_11': ('kakap', 'Halo... Juragan Hiu? Saya butuh bantuan.'),
 'S1E4_12': ('nar', 'Kakap baru saja menelepon... satu-satunya yang ditakuti Bos Oren.'),
 'S2E2_01': ('kakap', 'Heh, kuli caping! Berdiri yang tegak! Juragan Besar datang jam tujuh!'),
 'S2E2_02': ('cj', 'Siap, Pak Mandor.'),
 'S2E2_03': ('kakap', 'Kamu itu cuma pajangan. Kuli bau ikan kayak kamu jangan sampai ngomong sama beliau!'),
 'S2E2_04': ('teri', 'Sabar, Pak... nanti Mandor kena batunya.'),
 'S2E2_05': ('cj', 'Pak, karung teri itu jangan di lantai. Taruh di rak, biar tetap kering.'),
 'S2E2_06': ('kakap', 'Halah! Juragan nggak bakal ngecek sampai lantai!'),
 'S2E2_07': ('cb', 'Pak Mandor? Saya sekretaris Juragan. Beliau sudah di gudang sejak kemarin... dan sudah ngecek semuanya.'),
 'S2E2_08': ('kakap', 'Loh?! Sejak kemarin?!'),
 'S2E2_09': ('kakap', 'Berarti Juragan... nyamar jadi salah satu kuli di sini...'),
 'S2E2_10': ('kakap', 'Juragan! Ampun, Juragan! Silakan duduk!'),
 'S2E2_11': ('teri', 'Loh... saya?'),
 'S2E2_12': ('nar', 'Mandor salah sembah... dan juragan yang asli, masih berdiri di gerbang, membawa karung teri.'),
 'S3E2_01': ('cj', 'Duel dimulai! Yang kalah, angkat kaki dari rumah ini!'),
 'S3E2_02': ('kakap', 'Teri nasi lawan Chef Kakap? Ini bukan duel. Ini hiburan.'),
 'S3E2_03': ('kakap', 'Saya bawa bahan impor. Kamu bawa apa? Ikan kering bau gudang?'),
 'S3E2_04': ('cb', 'Mas... yakin cuma bawa itu?'),
 'S3E2_05': ('teri', 'Cumi asin sama teri, Dik. Itu cukup.'),
 'S3E2_06': ('cj', 'Masakan Chef... enak. Biasa.'),
 'S3E2_07': ('cj', '...Loh. Cumi asinnya kok gurih begini?'),
 'S3E2_08': ('kakap', 'Loh... kok enak?!'),
 'S3E2_09': ('kakap', 'Curang! Pasti pakai bumbu rahasia!'),
 'S3E2_10': ('teri', 'Rahasianya cuma satu, Chef. Cuminya dijemur sampai kering betul.'),
 'S3E2_11': ('cj', 'Ya wis... Teri menang.'),
 'S3E2_12': ('kakap', 'Juragan... coba tanya, Teri itu anak siapa.'),
 'S3E2_13': ('nar', 'Papa belum tahu... ayah Teri Nasi adalah orang yang paling dia benci.'),
 'S1E6_01': ('nar', "Dermaga, tengah hari. Juragan Hiu dan Bos Oren... saling tatap."),
 'S1E6_02': ('hiu', "Oren. Yang kalah, nggak boleh beli cumi asin Mbak Cumi lagi."),
 'S1E6_03': ('ko', "Setuju. Kamu yang kalah."),
 'S1E6_04': ('kakap', "Hahaha! Rebutan terus! Karung terakhirnya sudah di perahu saya!"),
 'S1E6_05': ('kakap', "Tanpa karung ini, Cumi Baby cuma cumi kecil yang nggak laku!"),
 'S1E6_06': ('cb', "Oh. Itu bukan yang terakhir."),
 'S1E6_07': ('teri', "Mbak Cumi! Jemuran tadi pagi sudah kering... lima puluh karung!"),
 'S1E6_08': ('hiu', "Loh?! Lima puluh karung... wanginya sampai ujung dermaga!"),
 'S1E6_09': ('hiu', "Duelnya batal! Lima puluh karung itu punya saya!"),
 'S1E6_10': ('ko', "Ndak. Punya saya."),
 'S1E6_11': ('kakap', "Sekarung cumi asin buat saya sendiri... Loh, kok perahunya goyang?"),
 'S1E6_12': ('nar', "Di bawah perahu Kakap... sesuatu yang jauh lebih besar dari Juragan Hiu, ikut mencium aroma cumi asin itu."),
 'S1E5_01': ('nar', 'Pagi itu... pasar mendadak sunyi. Juragan Hiu datang.'),
 'S1E5_02': ('kakap', 'Minggir semua! Juragan Hiu mau ketemu cumi kering itu!'),
 'S1E5_03': ('hiu', 'Ini yang bikin Bos Oren takluk? Cumi kecil, kering, keriput.'),
 'S1E5_04': ('kakap', 'Betul, Juragan! Baunya sampai ujung pasar!'),
 'S1E5_05': ('cb', 'Oh. Mau coba, Juragan?'),
 'S1E5_06': ('hiu', '...Loh. Ini aroma cumi asin kampung nelayan... waktu saya kecil.'),
 'S1E5_07': ('kakap', 'Loh?! Juragan... kok malah nangis?'),
 'S1E5_08': ('hiu', 'Mulai hari ini, semua cumi asin Mbak Cumi... saya yang beli.'),
 'S1E5_09': ('ko', 'Ndak bisa, Hiu. Saya pelanggan duluan.'),
 'S1E5_10': ('hiu', 'Oren. Kita selesaikan... di dermaga.'),
 'S1E5_11': ('kakap', 'Mereka rebutan... karung terakhirnya saya bawa saja.'),
 'S1E5_12': ('nar', 'Tidak ada yang sadar... karung cumi asin terakhir sudah hilang, bersama Kakap.'),
 'S2E3_01': ('kakap', 'Ampun, Juragan! Jangan potong gaji saya!'),
 'S2E3_02': ('teri', 'Pak Mandor... saya ini Teri. Kuli!'),
 'S2E3_03': ('kakap', 'Heh, caping! Minggir! Kuli kayak kamu nggak pantas berdiri dekat Juragan!'),
 'S2E3_04': ('cj', 'Saya cuma mau naruh teri ini di rak, Pak. Biar tetap kering.'),
 'S2E3_05': ('kakap', 'Bu Sekretaris... Juragan hari ini pakai baju apa, ya?'),
 'S2E3_06': ('cb', 'Beliau pakai caping, Pak. Dan bawa karung teri.'),
 'S2E3_07': ('kakap', 'Loh... caping?!'),
 'S2E3_08': ('cj', 'Seratus karung sudah saya cek. Tiga puluh... masih lembab.'),
 'S2E3_09': ('cj', 'Mulai hari ini, Teri jadi mandor. Kamu... angkat karung.'),
 'S2E3_10': ('teri', 'Loh... saya, Juragan?'),
 'S2E3_11': ('kakap', 'Bos... penyamaran Juragan sudah ketahuan. Gudang nomor seratus... malam ini.'),
 'S2E3_12': ('nar', 'Ternyata Mandor tidak sendirian... dan gudang nomor seratus, menyimpan rahasia.'),
 'S2E4_01': ('kakap', 'Bos... gudang nomor seratus sudah saya buka. Angkut semuanya malam ini!'),
 'S2E4_02': ('teri', 'Pak Kakap! Ngapain malam-malam di gudang seratus?!'),
 'S2E4_03': ('kakap', 'Mandor baru, helmnya kegedean! Gudang ini isinya cuma cumi asin kecil-kecil, keriput. Siapa yang mau?'),
 'S2E4_04': ('teri', 'Itu jemuran paling kering, Pak. Disimpan di sini biar awet.'),
 'S2E4_05': ('cj', 'Gudang seratus bukan gudang sisa. Ini cumi asin terbaik... yang saya simpan sendiri.'),
 'S2E4_06': ('kakap', 'Loh... kok wanginya begini?!'),
 'S2E4_07': ('teri', 'Pantas restoran-restoran antre dari bulan lalu, Juragan.'),
 'S2E4_08': ('cj', 'Makanya Bos-mu mau mencurinya.'),
 'S2E4_09': ('kakap', 'Hah! Bos sudah datang! Juragan nggak bisa apa-apa!'),
 'S2E4_10': ('cj', 'Saya tahu. Bos-mu itu... sudah saya kenal dari dulu.'),
 'S2E4_11': ('nar', 'Pintu truk terbuka... dan yang turun, memakai caping yang sama persis dengan Juragan.'),
 'S3E3_01': ('cj', 'Teri! Jawab sekarang. Kamu itu anak siapa?!'),
 'S3E3_02': ('teri', 'Bapak saya... cuma tukang jemur cumi di Muara Angke, Om.'),
 'S3E3_03': ('kakap', 'Tukang jemur! Pantas bahannya bau gudang.'),
 'S3E3_04': ('cj', 'Anak tukang jemur mau dekati anak juragan? Mimpi!'),
 'S3E3_05': ('cb', 'Papa! Yang penting Mas Teri jujur!'),
 'S3E3_06': ('teri', 'Ini cumi asin jemuran Bapak, Om. Dari dulu dijemur sendiri.'),
 'S3E3_07': ('cj', '...Loh. Ini aroma cumi asin pertama... yang bikin Papa kaya!'),
 'S3E3_08': ('kakap', 'Loh?! Jadi gudang Juragan dulu... mulainya dari jemuran bapaknya Teri?'),
 'S3E3_09': ('cj', 'Bapakmu itu... yang meninggalkan saya di dermaga, tiga puluh tahun lalu!'),
 'S3E3_10': ('cb', 'Papa... kenal bapaknya Mas Teri?'),
 'S3E3_11': ('cj', 'Mulai malam ini, kamu dilarang masuk rumah ini!'),
 'S3E3_12': ('nar', 'Tapi malam itu... yang mengetuk pintu, justru bapak Teri sendiri.'),
 'S3E4_01': ('cj', 'Kamu... Teri Besar?!'),
 'S3E4_02': ('bt', 'Tiga puluh tahun, Jumbo. Saya datang jemput anak saya.'),
 'S3E4_03': ('kakap', 'Hah! Tukang jemur bawa karung. Usir saja, Juragan!'),
 'S3E4_04': ('cj', 'Dulu kamu tinggalkan saya. Sekarang mau minta modal?'),
 'S3E4_05': ('cb', 'Papa, dengar dulu!'),
 'S3E4_06': ('bt', 'Saya nggak ninggalin kamu. Malam itu saya melaut, cari cumi buat jemuran kita.'),
 'S3E4_07': ('cj', '...Loh. Ini cumi asin yang dulu... kita jemur berdua.'),
 'S3E4_08': ('kakap', 'Loh?! Juragan dulu... tukang jemur juga?!'),
 'S3E4_09': ('bt', 'Waktu saya pulang, kamu sudah pergi. Bawa semua jemuran kita.'),
 'S3E4_10': ('cb', 'Papa... jadi Papa yang pergi?'),
 'S3E4_11': ('cj', 'Cukup! Semua keluar dari rumah ini!'),
 'S3E4_12': ('nar', 'Tapi di dasar karung itu... Teri menemukan surat lama, bertanda tangan Papa.'),
 'S1E7_01': ('nar', "Tengah laut. Perahu Kakap... diangkat dari bawah."),
 'S1E7_02': ('kakap', "Tolong! Tolong! Karung cumi asinku ditarik tentakel!"),
 'S1E7_03': ('kakap', "Gara-gara cumi kecil bau kamu, aku hampir dimakan monster!"),
 'S1E7_04': ('kakap', "Cumi asin kering begitu, monster juga pasti muntah!"),
 'S1E7_05': ('cb', "Monsternya nggak muntah. Dia ikut ke sini."),
 'S1E7_06': ('teri', "Mbak Cumi! Karungnya dibalikin... kosong! Bersih, nggak ada sisa!"),
 'S1E7_07': ('hiu', "Loh?! Itu... Penghuni Laut Dalam. Seratus tahun nggak pernah naik ke darat!"),
 'S1E7_08': ('teri', "Dia naik... cuma gara-gara wangi cumi asin?"),
 'S1E7_09': ('ko', "Hiu. Gencatan senjata dulu. Lima puluh karung ini kita jaga."),
 'S1E7_10': ('hiu', "Setuju. Tapi kamu yang di depan."),
 'S1E7_11': ('cb', "Biar saya yang ngomong sama dia."),
 'S1E7_12': ('nar', "Penghuni Laut Dalam menatap Cumi Baby lama sekali... lalu, untuk pertama kalinya dalam seratus tahun, dia bicara."),
 'S2E5_01': ('hiu', "Lama nggak ketemu... Jumbo."),
 'S2E5_02': ('kakap', "Kenalkan, Bos saya! Juragan Hiu!"),
 'S2E5_03': ('hiu', "Punya seratus gudang, malah nyamar jadi kuli. Dari dulu kamu memang cuma kuli, Jumbo."),
 'S2E5_04': ('kakap', "Cumi asin keriput begini, paling buat pakan kucing, Bos!"),
 'S2E5_05': ('cj', "Cium dulu. Baru ngomong."),
 'S2E5_06': ('hiu', "Loh... ini... wangi jemuran kita dulu di dermaga?!"),
 'S2E5_07': ('teri', "Juragan Hiu... nangis?"),
 'S2E5_08': ('cj', "Dijemur sampai kering, garamnya pas. Caranya nggak pernah berubah."),
 'S2E5_09': ('hiu', "Kakap! Angkut semua ke truk!"),
 'S2E5_10': ('cj', "Silakan coba. Gudang seratus... nggak pernah dijual."),
 'S2E5_11': ('teri', "Juragan! Gudang satu sampai sembilan puluh sembilan... pintunya kebuka semua!"),
 'S2E5_12': ('nar', "Malam itu... truk Juragan Hiu ternyata bukan cuma satu."),
 'S3E5_01': ('teri', "Juragan... surat ini... tanda tangannya Jumbo!"),
 'S3E5_02': ('cj', "Kembalikan! Itu bukan urusanmu!"),
 'S3E5_03': ('kakap', "Hah! Kertas lusuh bau cumi asin keriput. Paling surat utang!"),
 'S3E5_04': ('cj', "Buang saja. Itu cuma sampah dari dermaga."),
 'S3E5_05': ('cb', "Sini! Biar aku yang baca, Papa!"),
 'S3E5_06': ('cb', "\"Jemuran cumi asin ini milik kita berdua. Separuh untuk Teri Besar. Tertanda, Jumbo.\""),
 'S3E5_07': ('kakap', "Loh?! Berarti separuh harta Juragan... punya bapaknya Teri?!"),
 'S3E5_08': ('cj', "...Loh. Wanginya masih wangi jemuran cumi asin kita dulu."),
 'S3E5_09': ('bt', "Saya nggak minta hartamu, Jumbo. Saya cuma simpan cumi asinnya... dan janjimu."),
 'S3E5_10': ('cj', "Kalau begitu... Teri boleh..."),
 'S3E5_11': ('kakap', "Nggak bisa! Surat ini hilang, Juragan tetap kaya!"),
 'S3E5_12': ('nar', "Chef Kakap kabur membawa surat itu... dan di luar pagar, truk Juragan Hiu sudah menunggu."),
 'S1E8_01': ('pld', "Siapa... yang menjemur cumi asin ini?"),
 'S1E8_02': ('kakap', "Dia, Tuan! Cumi kecil itu! Hukum saja dia!"),
 'S1E8_03': ('kakap', "Cumi kering, keriput, bau gudang! Pantas Tuan sampai naik ke darat!"),
 'S1E8_04': ('hiu', "Cumi Baby... minta maaf saja, biar kita selamat."),
 'S1E8_05': ('cb', "Saya yang jemur. Dua hari di bawah matahari, garamnya pas."),
 'S1E8_06': ('pld', "Seratus tahun saya cari wangi ini. Wangi jemuran nelayan, waktu saya masih kecil."),
 'S1E8_07': ('teri', "Loh?! Monster laut... nangis?!"),
 'S1E8_08': ('ko', "Dia bukan mau makan kita. Dia kangen."),
 'S1E8_09': ('pld', "Mulai hari ini, semua cumi asin di dermaga ini... milik laut."),
 'S1E8_10': ('cb', "Nggak bisa. Sudah dipesan restoran Mas Teri."),
 'S1E8_11': ('pld', "Kalau begitu... besok saya bawa teman-teman saya."),
 'S1E8_12': ('nar', "Malam itu, di dasar laut... seratus pasang mata kuning terbuka bersamaan."),
 'S2E6_01': ('hiu', "Sembilan puluh sembilan truk, Jumbo! Malam ini semua gudangmu saya kosongkan!"),
 'S2E6_02': ('kakap', "Habis sudah, Juragan! Tinggal satu gudang, isinya cumi asin keriput!"),
 'S2E6_03': ('hiu', "Dari kuli... balik lagi jadi kuli."),
 'S2E6_04': ('cj', "Silakan. Buka truknya."),
 'S2E6_05': ('teri', "Loh?! Kata sopirnya... sembilan puluh sembilan gudang itu kosong semua!"),
 'S2E6_06': ('hiu', "Kosong?! Ke mana semua ikan asinnya?!"),
 'S2E6_07': ('cj', "Sejak jadi kuli, saya cek satu-satu. Yang terbaik dijemur ulang, lalu saya pindah ke gudang seratus."),
 'S2E6_08': ('kakap', "Bos... truknya cuma bau solar."),
 'S2E6_09': ('hiu', "Kepung gudang seratus! Nggak ada yang keluar malam ini!"),
 'S2E6_10': ('teri', "Juragan! Kita dikepung sembilan puluh sembilan truk!"),
 'S2E6_11': ('cj', "Tenang. Saya sudah telepon seseorang."),
 'S2E6_12': ('nar', "Dan dari arah dermaga... terdengar suara yang paling ditakuti Juragan Hiu."),
 'S2E7_01': ('mak', "HIUUU! Matikan truknya! Pulang!"),
 'S2E7_02': ('hiu', "Su... suara itu... jangan-jangan..."),
 'S2E7_03': ('kakap', "Cuma nenek-nenek bawa tampah, Bos! Sama kayak cumi asin keriput itu, sudah tua!"),
 'S2E7_04': ('mak', "Siapa yang bilang cumi asin keriput?!"),
 'S2E7_05': ('mak', "Hmm... dijemur dua hari, garamnya pas. Ini jemuran yang saya ajarkan."),
 'S2E7_06': ('teri', "Loh?! Nenek ini... ibunya Juragan Hiu?!"),
 'S2E7_07': ('cj', "Mak Hiu yang mengajari kami berdua menjemur. Dulu, di dermaga."),
 'S2E7_08': ('hiu', "Mak... jangan jewer saya di depan kuli..."),
 'S2E7_09': ('mak', "Truk pulang semua! Besok kalian berdua lomba jemur cumi asin, kayak dulu."),
 'S2E7_10': ('mak', "Yang kalah... jadi kuli yang menang. Seumur hidup."),
 'S2E7_11': ('hiu', "Kakap... malam ini, garam di jemuran Jumbo... tukar pakai gula."),
 'S2E7_12': ('nar', "Tengah malam, sebuah bayangan bercaping mengendap ke jemuran Juragan Jumbo... membawa sekarung gula."),
}
ESPEAK = {'nar': ('id+m1', 30, 140), 'cb': ('id+f4', 85, 155), 'teri': ('id+m4', 70, 165), 'kakap': ('id+m3', 55, 170), 'ko': ('id+m2', 20, 125), 'cj': ('id+m2', 10, 120), 'hiu': ('id+m1', 5, 120), 'bt': ('id+m1', 0, 115), 'pld': ('id+m1', 0, 100), 'mak': ('id+f2', 30, 130)}

TEMPO = {'s3e2': 1.25, 's2e2': 1.25, 's2e1': 1.2, 's3e1': 1.2, 's1e4': 1.25, 's1e5': 1.25, 's2e3': 1.3, 's3e3': 1.3, 's1e6': 1.3, 's2e4': 1.35, 's3e4': 1.3, 's1e7': 1.42, 's2e5': 1.3, 's3e5': 1.42, 's1e8': 1.42, 's2e6': 1.42, 's2e7': 1.42}

# ---------------- shot specs ----------------
SPECS = {
 's1e7': [  # babak: 1 Drama (angkat, tarik) · 2 Diremehkan (basah, oh) · 3 Penemuan (karung, loh, teri2) · 4 Drama lagi (jaga) · 5 Cliffhanger (maju, end)
  dict(id='angkat', lines=['S1E7_01'], pre=0.1, post=0.2, sfx=[('dun', 0.0)], amb='night'),
  dict(id='tarik', lines=['S1E7_02'], pre=0.2, post=0.5, sfx=[('whoosh', 0.1)], sfx_after=[('thud', 0.1)], amb='night'),
  dict(id='basah', lines=['S1E7_03', 'S1E7_04'], gap=0.3, pre=0.3, post=0.3, amb='morning'),
  dict(id='oh', lines=['S1E7_05'], pre=0.5, post=0.6, min=2.0, amb='morning'),
  dict(id='karung', lines=['S1E7_06'], pre=0.6, post=0.3, sfx=[('whoosh', 0.0), ('thud', 0.5)], amb='morning'),
  dict(id='loh', lines=['S1E7_07'], pre=0.8, post=0.4, sfx=[('sniff', 0.0), ('ting', 0.65)], amb='morning'),
  dict(id='teri2', lines=['S1E7_08'], pre=0.3, post=0.4, amb='morning'),
  dict(id='jaga', lines=['S1E7_09', 'S1E7_10'], gap=0.4, pre=0.3, post=0.4, sfx=[('dun', 0.0)], amb='morning'),
  dict(id='maju', lines=['S1E7_11'], pre=0.4, post=0.4, amb='night'),
  dict(id='end', lines=['S1E7_12'], pre=0.4, post=1.9, sfx=[('dunn', 0.0)], amb='night'),
 ],
 'ep2': [
  dict(id='recap', lines=['E2_01'], pre=0.3, post=0.5, min=3.0),
  dict(id='reveal', lines=[], min=3.0, sfx=[('whoosh', 0.0), ('dun', 0.35), ('dun', 1.05), ('dunn', 1.75)]),
  dict(id='oh', lines=['E2_02'], pre=0.7, post=1.1, min=2.2),
  dict(id='trio', lines=['E2_03'], pre=0.2, post=0.4),
  dict(id='kakap', lines=['E2_04'], pre=0.3, post=0.3, sfx=[('whoosh', 0.0), ('boing', 0.12)]),
  dict(id='faint', lines=['E2_05'], pre=0.2, post=2.0, sfx_after=[('thud', 0.35), ('thud', 0.75), ('thud', 1.15)]),
  dict(id='offer', lines=['E2_06'], pre=0.3, post=0.4, sfx=[('whoosh', 0.0)]),
  dict(id='gaji', lines=['E2_07'], pre=0.2, post=0.6),
  dict(id='deal', lines=['E2_08', 'E2_09'], gap=0.7, pre=0.2, post=1.0),
  dict(id='boss', lines=['E2_10', 'E2_11'], gap=0.5, pre=0.4, post=1.4, sfx=[('ring', 0.0)]),
 ],
 'ep3': [
  dict(id='k1', lines=['E3_01'], pre=0.3, post=0.3, sfx=[('ring', 0.0)]),
  dict(id='o1', lines=['E3_02'], pre=0.9, post=0.5),
  dict(id='k2', lines=['E3_03'], pre=0.2, post=0.3),
  dict(id='o2', lines=['E3_04'], pre=0.7, post=0.4),
  dict(id='k3', lines=['E3_05'], pre=0.2, post=0.3),
  dict(id='o3', lines=['E3_06'], pre=0.8, post=0.5, sfx_after=[('hangup', 0.2)]),
  dict(id='shop', lines=['E3_07'], pre=1.0, post=0.4, sfx=[('bell', 0.15)]),
  dict(id='sniff', lines=['E3_08'], pre=1.6, post=0.6, sfx=[('sniff', 0.2), ('ting', 1.0)]),
  dict(id='k4', lines=['E3_09'], pre=0.2, post=0.3),
  dict(id='eat', lines=['E3_10'], pre=0.6, post=0.5, sfx=[('chew', 0.0)]),
  dict(id='end', lines=['E3_11'], pre=0.7, post=1.8),
 ],
 's2e1': [  # babak: 1 Drama (kick, maaf) · 2 Diremehkan (hina, bisik) · 3 Penemuan (sniff, ketawa, cek) · 4 Drama lagi (gengsi, umum) · 5 Cliffhanger (siap, end)
  dict(id='kick', lines=['S2E1_01'], pre=0.15, post=0.4, sfx=[('whoosh', 0.05), ('thud', 0.3)], amb='office'),
  dict(id='maaf', lines=['S2E1_02'], pre=0.45, post=0.5, amb='office'),
  dict(id='hina', lines=['S2E1_03'], pre=0.2, post=0.6, amb='office'),
  dict(id='bisik', lines=['S2E1_04'], pre=0.3, post=0.4, amb='office'),
  dict(id='sniff', lines=['S2E1_05'], pre=0.9, post=0.6, sfx=[('sniff', 0.15)], amb='office'),
  dict(id='ketawa', lines=['S2E1_06'], pre=0.2, post=0.4, amb='office'),
  dict(id='cek', lines=['S2E1_07'], pre=0.6, post=0.6, sfx=[('ting', 0.2)], amb='office'),
  dict(id='gengsi', lines=['S2E1_08'], pre=0.5, post=0.3, sfx_after=[('ring', 0.2)], amb='office'),
  dict(id='umum', lines=['S2E1_09', 'S2E1_10'], gap=0.35, pre=0.3, post=0.4, sfx=[('dun', 0.0)], amb='office'),
  dict(id='siap', lines=['S2E1_11'], pre=0.6, post=0.5, amb='office'),
  dict(id='end', lines=['S2E1_12'], pre=0.7, post=1.8, sfx=[('ting', 0.3)], amb='office'),
 ],
 's3e1': [  # babak: 1 Drama (banting, tolak) · 2 Diremehkan (hina, bela, sinis) · 3 Penemuan (saji, cicip) · 4 Drama lagi (habis, syarat) · 5 Cliffhanger (end)
  dict(id='banting', lines=['S3E1_01'], pre=0.35, post=0.35, sfx=[('thud', 0.15)], amb='office'),
  dict(id='tolak', lines=['S3E1_02'], pre=0.35, post=0.35, amb='office'),
  dict(id='hina', lines=['S3E1_03'], pre=0.2, post=0.35, amb='office'),
  dict(id='bela', lines=['S3E1_04'], pre=0.25, post=0.3, sfx=[('whoosh', 0.0)], amb='office'),
  dict(id='sinis', lines=['S3E1_05'], pre=0.2, post=0.4, amb='office'),
  dict(id='saji', lines=['S3E1_06'], pre=0.4, post=0.4, sfx=[('ting', 0.1)], amb='office'),
  dict(id='cicip', lines=['S3E1_07'], pre=1.4, post=0.8, sfx=[('sniff', 0.15), ('ting', 1.1)], amb='office'),
  dict(id='habis', lines=['S3E1_08', 'S3E1_09'], gap=0.35, pre=0.3, post=0.4, sfx=[('dun', 0.0)], amb='office'),
  dict(id='syarat', lines=['S3E1_10'], pre=0.3, post=0.4, sfx_after=[('dun', 0.05)], amb='office'),
  dict(id='end', lines=['S3E1_11'], pre=0.5, post=1.9, sfx=[('dunn', 0.0)], amb='night'),
 ],
 's1e4': [  # babak: 1 Drama (tutup, sepi) · 2 Diremehkan (hina, oh) · 3 Penemuan (teri, antre) · 4 Drama lagi (bos, panik, makan) · 5 Cliffhanger (telp, end)
  dict(id='tutup', lines=['S1E4_01'], pre=0.3, post=0.3, sfx=[('hangup', 0.05)], amb='night'),
  dict(id='sepi', lines=['S1E4_02'], pre=0.3, post=0.5, amb='morning'),
  dict(id='hina', lines=['S1E4_03', 'S1E4_04'], gap=0.3, pre=0.2, post=0.3, amb='morning'),
  dict(id='oh', lines=['S1E4_05'], pre=0.6, post=0.9, min=2.0, amb='morning'),
  dict(id='teri', lines=['S1E4_06'], pre=0.3, post=0.3, sfx=[('whoosh', 0.0)], amb='morning'),
  dict(id='antre', lines=['S1E4_07'], pre=0.9, post=0.6, sfx=[('ting', 0.3)], amb='morning'),
  dict(id='bos', lines=['S1E4_08'], pre=0.6, post=0.3, sfx=[('dun', 0.0)], amb='morning'),
  dict(id='panik', lines=['S1E4_09'], pre=0.2, post=0.3, amb='morning'),
  dict(id='makan', lines=['S1E4_10'], pre=0.5, post=0.5, sfx=[('chew', 0.0)], amb='morning'),
  dict(id='telp', lines=['S1E4_11'], pre=0.6, post=0.4, sfx=[('ring', 0.0)], amb='night'),
  dict(id='end', lines=['S1E4_12'], pre=0.5, post=1.9, sfx=[('dunn', 0.0)], amb='night'),
 ],
 's2e2': [  # babak: 1 Drama (siaga, siap) · 2 Diremehkan (hina, bisik) · 3 Penemuan (tunjuk, ketawa, telp, loh) · 4 Drama lagi (curiga, sembah) · 5 Cliffhanger (end)
  dict(id='siaga', lines=['S2E2_01'], pre=0.15, post=0.3, sfx=[('dun', 0.0)], amb='morning'),
  dict(id='siap', lines=['S2E2_02'], pre=0.3, post=0.4, amb='morning'),
  dict(id='hina', lines=['S2E2_03'], pre=0.2, post=0.4, amb='morning'),
  dict(id='bisik', lines=['S2E2_04'], pre=0.3, post=0.3, amb='morning'),
  dict(id='tunjuk', lines=['S2E2_05'], pre=0.3, post=0.3, amb='morning'),
  dict(id='ketawa', lines=['S2E2_06'], pre=0.2, post=0.3, amb='morning'),
  dict(id='telp', lines=['S2E2_07'], pre=0.8, post=0.2, sfx=[('ring', 0.0)], phone=['cb'], amb='morning'),
  dict(id='loh', lines=['S2E2_08'], pre=0.2, post=0.5, sfx=[('ting', 0.1)], amb='morning'),
  dict(id='curiga', lines=['S2E2_09'], pre=0.4, post=0.4, sfx=[('dun', 0.0)], amb='morning'),
  dict(id='sembah', lines=['S2E2_10', 'S2E2_11'], gap=0.5, pre=0.3, post=0.5, sfx=[('thud', 0.15)], amb='morning'),
  dict(id='end', lines=['S2E2_12'], pre=0.4, post=1.8, sfx=[('dunn', 0.0)], amb='morning'),
 ],
 's3e2': [  # babak: 1 Drama (duel, sombong) · 2 Diremehkan (hina, khawatir, tenang) · 3 Penemuan (cicip1, cicip2, curi) · 4 Drama lagi (tuduh, rahasia, menang) · 5 Cliffhanger (bisik, end)
  dict(id='duel', lines=['S3E2_01'], pre=0.15, post=0.3, sfx=[('thud', 0.05), ('dun', 0.1)], amb='office'),
  dict(id='sombong', lines=['S3E2_02'], pre=0.25, post=0.3, sfx=[('whoosh', 0.0)], amb='office'),
  dict(id='hina', lines=['S3E2_03'], pre=0.2, post=0.3, amb='office'),
  dict(id='khawatir', lines=['S3E2_04'], pre=0.25, post=0.3, amb='office'),
  dict(id='tenang', lines=['S3E2_05'], pre=0.3, post=0.4, amb='office'),
  dict(id='cicip1', lines=['S3E2_06'], pre=0.5, post=0.4, sfx=[('chew', 0.0)], amb='office'),
  dict(id='cicip2', lines=['S3E2_07'], pre=1.2, post=0.6, sfx=[('sniff', 0.1), ('ting', 1.0)], amb='office'),
  dict(id='curi', lines=['S3E2_08'], pre=0.7, post=0.5, sfx=[('chew', 0.0), ('ting', 0.6)], amb='office'),
  dict(id='tuduh', lines=['S3E2_09'], pre=0.15, post=0.3, sfx=[('dun', 0.0)], amb='office'),
  dict(id='rahasia', lines=['S3E2_10'], pre=0.3, post=0.4, amb='office'),
  dict(id='menang', lines=['S3E2_11'], pre=0.4, post=0.5, sfx_after=[('ting', 0.05)], amb='office'),
  dict(id='bisik', lines=['S3E2_12'], pre=0.4, post=0.4, sfx=[('dun', 0.1)], amb='night'),
  dict(id='end', lines=['S3E2_13'], pre=0.4, post=1.9, sfx=[('dunn', 0.0)], amb='night'),
 ],
 's1e5': [  # babak: 1 Drama (sunyi, minggir) · 2 Diremehkan (hiu, ejek, oh) · 3 Penemuan (endus, kaget) · 4 Drama lagi (borong, oren, tantang) · 5 Cliffhanger (curi, end)
  dict(id='sunyi', lines=['S1E5_01'], pre=0.15, post=0.3, sfx=[('dun', 0.0)], amb='morning'),
  dict(id='minggir', lines=['S1E5_02'], pre=0.2, post=0.3, sfx=[('whoosh', 0.0)], amb='morning'),
  dict(id='hiu', lines=['S1E5_03'], pre=0.5, post=0.3, sfx=[('dun', 0.0)], amb='morning'),
  dict(id='ejek', lines=['S1E5_04'], pre=0.15, post=0.3, amb='morning'),
  dict(id='oh', lines=['S1E5_05'], pre=0.6, post=0.6, min=2.0, amb='morning'),
  dict(id='endus', lines=['S1E5_06'], pre=1.2, post=0.6, sfx=[('sniff', 0.1), ('ting', 1.0)], amb='morning'),
  dict(id='kaget', lines=['S1E5_07'], pre=0.2, post=0.4, sfx=[('ting', 0.1)], amb='morning'),
  dict(id='borong', lines=['S1E5_08'], pre=0.3, post=0.3, sfx=[('dun', 0.0)], amb='morning'),
  dict(id='oren', lines=['S1E5_09'], pre=0.6, post=0.3, sfx=[('whoosh', 0.0)], amb='morning'),
  dict(id='tantang', lines=['S1E5_10'], pre=0.4, post=0.5, sfx=[('thud', 0.1)], amb='morning'),
  dict(id='curi', lines=['S1E5_11'], pre=0.4, post=0.4, amb='night'),
  dict(id='end', lines=['S1E5_12'], pre=0.4, post=1.9, sfx=[('dunn', 0.0)], amb='night'),
 ],
 's1e6': [  # babak: 1 Drama (tatap, syarat, setuju) · 2 Diremehkan (perahu, oh) · 3 Penemuan (teri, loh) · 4 Drama lagi (rebut) · 5 Cliffhanger (goyang, end)
  dict(id='tatap', lines=['S1E6_01'], pre=0.15, post=0.3, sfx=[('dun', 0.0)], amb='morning'),
  dict(id='syarat', lines=['S1E6_02'], pre=0.2, post=0.3, amb='morning'),
  dict(id='setuju', lines=['S1E6_03'], pre=0.3, post=0.4, sfx_after=[('thud', 0.05)], amb='morning'),
  dict(id='perahu', lines=['S1E6_04', 'S1E6_05'], gap=0.3, pre=0.3, post=0.3, sfx=[('whoosh', 0.0)], amb='morning'),
  dict(id='oh', lines=['S1E6_06'], pre=0.5, post=0.6, min=2.0, amb='morning'),
  dict(id='teri', lines=['S1E6_07'], pre=0.3, post=0.3, sfx=[('whoosh', 0.0)], amb='morning'),
  dict(id='loh', lines=['S1E6_08'], pre=1.0, post=0.5, sfx=[('sniff', 0.05), ('ting', 0.85)], amb='morning'),
  dict(id='rebut', lines=['S1E6_09', 'S1E6_10'], gap=0.4, pre=0.2, post=0.5, sfx=[('whoosh', 0.0)], sfx_after=[('thud', 0.0)], amb='morning'),
  dict(id='goyang', lines=['S1E6_11'], pre=0.3, post=0.4, amb='night'),
  dict(id='end', lines=['S1E6_12'], pre=0.4, post=1.9, sfx=[('dunn', 0.0)], amb='night'),
 ],
 's2e3': [  # babak: 1 Drama (ampun, bingung) · 2 Diremehkan (usir, rak) · 3 Penemuan (telp, jawab, loh) · 4 Drama lagi (buka, putus) · 5 Cliffhanger (bisik, end)
  dict(id='ampun', lines=['S2E3_01'], pre=0.15, post=0.3, sfx=[('thud', 0.0), ('dun', 0.05)], amb='morning'),
  dict(id='bingung', lines=['S2E3_02'], pre=0.25, post=0.4, amb='morning'),
  dict(id='usir', lines=['S2E3_03'], pre=0.2, post=0.3, sfx=[('whoosh', 0.0)], amb='morning'),
  dict(id='rak', lines=['S2E3_04'], pre=0.3, post=0.4, sfx_after=[('thud', 0.05)], amb='morning'),
  dict(id='telp', lines=['S2E3_05'], pre=0.3, post=0.3, amb='morning'),
  dict(id='jawab', lines=['S2E3_06'], pre=0.3, post=0.3, phone=['cb'], amb='morning'),
  dict(id='loh', lines=['S2E3_07'], pre=0.6, post=0.6, sfx=[('ting', 0.5)], amb='morning'),
  dict(id='buka', lines=['S2E3_08'], pre=0.7, post=0.4, sfx=[('whoosh', 0.0), ('dun', 0.45)], amb='morning'),
  dict(id='putus', lines=['S2E3_09', 'S2E3_10'], gap=0.5, pre=0.3, post=0.5, sfx_after=[('thud', 0.0)], amb='morning'),
  dict(id='bisik', lines=['S2E3_11'], pre=0.5, post=0.4, sfx=[('dun', 0.1)], amb='night'),
  dict(id='end', lines=['S2E3_12'], pre=0.4, post=1.9, sfx=[('dunn', 0.0)], amb='night'),
 ],
 's2e4': [  # babak: 1 Drama (gembok, senter) · 2 Diremehkan (ejek, bela) · 3 Penemuan (muncul, endus, antre) · 4 Drama lagi (truk, kenal) · 5 Cliffhanger (end)
  dict(id='gembok', lines=['S2E4_01'], pre=0.15, post=0.3, sfx=[('dun', 0.0)], phone=[], amb='night'),
  dict(id='senter', lines=['S2E4_02'], pre=0.3, post=0.3, sfx=[('whoosh', 0.0)], amb='night'),
  dict(id='ejek', lines=['S2E4_03'], pre=0.2, post=0.3, amb='night'),
  dict(id='bela', lines=['S2E4_04'], pre=0.3, post=0.4, amb='night'),
  dict(id='muncul', lines=['S2E4_05'], pre=0.7, post=0.4, sfx=[('dun', 0.1)], amb='night'),
  dict(id='endus', lines=['S2E4_06'], pre=1.2, post=0.6, sfx=[('sniff', 0.1), ('ting', 1.0)], amb='night'),
  dict(id='antre', lines=['S2E4_07', 'S2E4_08'], gap=0.5, pre=0.3, post=0.5, amb='night'),
  dict(id='truk', lines=['S2E4_09'], pre=0.8, post=0.3, sfx=[('klakson', 0.0), ('dun', 0.6)], amb='night'),
  dict(id='kenal', lines=['S2E4_10'], pre=0.4, post=0.5, amb='night'),
  dict(id='end', lines=['S2E4_11'], pre=0.6, post=1.9, sfx=[('dunn', 0.2)], amb='night'),
 ],
 's3e3': [  # babak: 1 Drama (bentak, jawab) · 2 Diremehkan (ejek, mimpi, bela) · 3 Penemuan (sodor, endus, kakap) · 4 Drama lagi (dermaga, kenal, larang) · 5 Cliffhanger (end)
  dict(id='bentak', lines=['S3E3_01'], pre=0.15, post=0.3, sfx=[('thud', 0.0), ('dun', 0.05)], amb='night'),
  dict(id='jawab', lines=['S3E3_02'], pre=0.25, post=0.3, amb='night'),
  dict(id='ejek', lines=['S3E3_03'], pre=0.2, post=0.3, sfx=[('whoosh', 0.0)], amb='night'),
  dict(id='mimpi', lines=['S3E3_04'], pre=0.2, post=0.3, amb='night'),
  dict(id='bela', lines=['S3E3_05'], pre=0.2, post=0.4, amb='night'),
  dict(id='sodor', lines=['S3E3_06'], pre=0.3, post=0.4, sfx_after=[('thud', 0.0)], amb='night'),
  dict(id='endus', lines=['S3E3_07'], pre=1.2, post=0.6, sfx=[('sniff', 0.1), ('ting', 1.0)], amb='night'),
  dict(id='kakap', lines=['S3E3_08'], pre=0.3, post=0.4, sfx=[('ting', 0.1)], amb='night'),
  dict(id='dermaga', lines=['S3E3_09'], pre=0.4, post=0.4, sfx=[('dun', 0.0)], amb='night'),
  dict(id='kenal', lines=['S3E3_10'], pre=0.3, post=0.4, amb='night'),
  dict(id='larang', lines=['S3E3_11'], pre=0.2, post=0.5, sfx_after=[('thud', 0.0)], amb='night'),
  dict(id='end', lines=['S3E3_12'], pre=1.2, post=1.9, sfx=[('knock', 0.1), ('dunn', 1.0)], amb='night'),
 ],
  's3e4': [  # babak: 1 Drama (pintu, tamu) · 2 Diremehkan (ejek, modal, mohon) · 3 Penemuan (buka, endus, kakap) · 4 Drama lagi (pulang, pergi, cukup) · 5 Cliffhanger (end)
  dict(id='pintu', lines=['S3E4_01'], pre=0.5, post=0.3, sfx=[('knock', 0.0), ('dun', 0.45)], amb='night'),
  dict(id='tamu', lines=['S3E4_02'], pre=0.25, post=0.3, amb='night'),
  dict(id='ejek', lines=['S3E4_03'], pre=0.2, post=0.3, sfx=[('whoosh', 0.0)], amb='night'),
  dict(id='modal', lines=['S3E4_04'], pre=0.2, post=0.3, amb='night'),
  dict(id='mohon', lines=['S3E4_05'], pre=0.2, post=0.4, amb='night'),
  dict(id='buka', lines=['S3E4_06'], pre=0.3, post=0.4, sfx=[('thud', 0.05)], amb='night'),
  dict(id='endus', lines=['S3E4_07'], pre=1.2, post=0.6, sfx=[('sniff', 0.1), ('ting', 1.0)], amb='night'),
  dict(id='kakap', lines=['S3E4_08'], pre=0.3, post=0.4, sfx=[('ting', 0.1)], amb='night'),
  dict(id='pulang', lines=['S3E4_09'], pre=0.4, post=0.4, sfx=[('dun', 0.0)], amb='night'),
  dict(id='pergi', lines=['S3E4_10'], pre=0.3, post=0.4, amb='night'),
  dict(id='cukup', lines=['S3E4_11'], pre=0.2, post=0.5, sfx=[('thud', 0.15)], amb='night'),
  dict(id='end', lines=['S3E4_12'], pre=1.0, post=1.9, sfx=[('dunn', 0.9)], amb='night'),
 ],
}

def lp(x, f):
    b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype='band'); return lfilter(b, a, x)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def env(n, att=0.005, dec=1.0):
    t = np.arange(n) / SR; e = np.exp(-t / dec); a = int(att * SR)
    if a: e[:a] *= np.linspace(0, 1, a)
    return e
def tone(f, d, kind='sine', dec=0.8, vib=0.0):
    n = int(d * SR); t = np.arange(n) / SR
    ff = f * (1 + vib * np.sin(2 * np.pi * 5.5 * t)); ph = 2 * np.pi * np.cumsum(ff) / SR
    if kind == 'saw': w = lp(2 * ((ph / (2 * np.pi)) % 1) - 1, 1800)
    elif kind == 'marimba': w = np.sin(ph) + 0.2 * np.sin(4 * ph); dec = 0.22
    elif kind == 'pluck': w = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph); dec = 0.18
    else: w = np.sin(ph)
    return (w * env(n, 0.004, dec)).astype(np.float32)
def hz(n):
    names = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    acc = 1 if '#' in n else -1 if 'b' in n[1:-1] else 0
    return 440 * 2 ** ((names[n[0]] + acc + 12 * (int(n[-1]) - 4)) / 12)

SFX = {
 'whoosh': lambda: (bp(noise(0.45), 500, 4000) * np.sin(np.linspace(0, np.pi, int(0.45 * SR))) ** 2 * 0.6),
 'boing': lambda: tone(1, 0.5) * 0 + np.sin(2 * np.pi * np.cumsum(220 + 180 * np.sin(np.linspace(0, 14, int(0.5 * SR))) * np.exp(-np.linspace(0, 3, int(0.5 * SR)))) / SR) * env(int(0.5 * SR), 0.003, 0.25) * 0.5,
 'dun': lambda: sum(tone(hz(n), 0.65, 'saw', 0.3) for n in ('D2', 'D3', 'A3')) * 0.45 + tone(55, 0.65, 'sine', 0.35) * 1.2,
 'dunn': lambda: sum(tone(hz(n), 1.8, 'saw', 0.9) for n in ('D2', 'D3', 'F3', 'A3')) * 0.45 + tone(55, 1.8, 'sine', 0.8) * 1.4,
 'thud': lambda: lp(noise(0.25), 300) * env(int(0.25 * SR), 0.001, 0.06) * 3 + tone(70, 0.25, 'sine', 0.08),
 'ring': lambda: np.concatenate([(tone(1400, 0.35, 'sine', 2) + tone(1750, 0.35, 'sine', 2)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 20 * np.arange(int(0.35 * SR)) / SR))) * 0.25, np.zeros(int(0.2 * SR), np.float32)] * 2),
 'hangup': lambda: tone(480, 0.12, 'sine', 1) * 0.3,
 'bell': lambda: tone(1320, 1.2, 'sine', 0.5) * 0.4 + tone(1980, 1.2, 'sine', 0.35) * 0.25,
 'sniff': lambda: np.concatenate([bp(noise(0.14), 2500, 6000) * env(int(0.14 * SR), 0.04, 0.05), np.zeros(int(0.08 * SR), np.float32), bp(noise(0.14), 2500, 6000) * env(int(0.14 * SR), 0.04, 0.05), np.zeros(int(0.08 * SR), np.float32), bp(noise(0.3), 2500, 6000) * env(int(0.3 * SR), 0.08, 0.12)]) * 0.7,
 'ting': lambda: tone(2093, 0.8, 'sine', 0.25) * 0.4 + tone(3136, 0.8, 'sine', 0.2) * 0.25,
 'chew': lambda: np.concatenate([lp(noise(0.09), 800) * env(int(0.09 * SR), 0.01, 0.03) * 1.5 if k % 2 == 0 else np.zeros(int(0.12 * SR), np.float32) for k in range(10)]),
 'knock': lambda: np.concatenate([lp(noise(0.12), 600) * env(int(0.12 * SR), 0.001, 0.03) * 3 + tone(110, 0.12, 'sine', 0.04) * 0.8, np.zeros(int(0.18 * SR), np.float32)] * 3),
 'klakson': lambda: np.concatenate([(tone(392, 0.32, 'saw', 3) + tone(494, 0.32, 'saw', 3)) * 0.35, np.zeros(int(0.08 * SR), np.float32), (tone(392, 0.5, 'saw', 3) + tone(494, 0.5, 'saw', 3)) * 0.35]),
 'pop': lambda: tone(900, 0.09, 'sine', 0.03) * 0.5 + tone(1400, 0.09, 'sine', 0.02) * 0.3,
 'confetti': lambda: sum(np.roll(tone(f, 0.3, 'pluck'), int(i * 0.05 * SR)) for i, f in enumerate([1046, 1318, 1568, 2093])) * 0.3,
}

def load_clip(cid):
    spk, text = LINES[cid]
    mp3 = f'vo/{cid}.mp3'
    path = f'vo/{cid}.wav'
    if os.path.exists(mp3):
        af = ['-af', f'atempo={TEMPO[EP]}'] if EP in TEMPO else []  # tempo per episode (suara cadangan lebih lambat)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, *af, '-ac', '1', '-ar', str(SR), path], check=True)
        src = 'elevenlabs'
    else:
        v, p, s = ESPEAK[spk]
        subprocess.run(['espeak-ng', '-v', v, '-p', str(p), '-s', str(s), '-w', path, text], check=True)
        src = 'placeholder'
    sr, x = wavfile.read(path)
    x = x.astype(np.float32) / (32768.0 if x.dtype == np.int16 else 1.0)
    if sr != SR: x = resample_poly(x, SR, sr).astype(np.float32)
    idx = np.where(np.abs(x) > 0.02 * np.max(np.abs(x)))[0]
    x = x[max(0, idx[0] - int(0.03 * SR)): idx[-1] + int(0.06 * SR)]
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    return x, src

def envelope(x):
    hop = SR // FPS; n = int(np.ceil(len(x) / hop))
    e = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    return (e / (e.max() + 1e-9)).round(3).tolist()

def words_timing(text, e, dur):
    words = [w for w in re.sub(r'\[.*?\]', '', text).split() if w.strip('.?!,')]
    on = [i for i, v in enumerate(e) if v > 0.12]
    t0 = (on[0] / FPS) if on else 0; t1 = ((on[-1] + 1) / FPS) if on else dur
    wts = [len(w.strip('.,!?')) + 2 for w in words]; tot = sum(wts); out = []; t = t0
    for w, k in zip(words, wts):
        d = (t1 - t0) * k / tot; out.append({'w': w, 't0': round(t, 3), 't1': round(t + d, 3)}); t += d
    return out

def music_bounce(dur):
    out = np.zeros(int(dur * SR), np.float32)
    mel = ['C5', 'E5', 'G5', 'E5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'F5', 'E5', 'D5', 'G4']
    bass = ['C3', 'A2', 'F2', 'G2']; beat = 60 / 128 / 2; t = 0; k = 0
    while t < dur:
        i = int(t * SR)
        s = tone(hz(mel[k % 16]), 0.3, 'marimba') * 0.32; m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
        if k % 2 == 0:
            s = lp(noise(0.05), 6000) * env(int(0.05 * SR), 0.001, 0.015) * 0.25; m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
        if k % 4 == 0:
            s = tone(hz(bass[(k // 8) % 4]), 0.45, 'pluck') * 0.5; m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
            s = tone(60, 0.18, 'sine', 0.06) * 0.8; m = min(len(s), len(out) - i); out[i:i + m] += s[:m]
        t += beat; k += 1
    return out

def ambience(kind, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    if kind == 'night':
        cr = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > 0.6) * (np.sin(2 * np.pi * 0.7 * t) > 0) * 0.04
        return (cr + bp(noise(dur), 200, 1200) * 0.03).astype(np.float32)
    if kind == 'office':
        return (lp(noise(dur), 300) * 0.06 + np.sin(2 * np.pi * 60 * t) * 0.01).astype(np.float32)
    if kind == 'morning':
        out = bp(noise(dur), 300, 2000) * 0.025
        for s in np.arange(0.4, dur, 1.7):
            i = int(s * SR); ch = np.sin(2 * np.pi * np.cumsum(3200 + 900 * np.sin(np.linspace(0, 30, int(0.25 * SR)))) / SR) * env(int(0.25 * SR), 0.01, 0.1) * 0.05
            m = min(len(ch), n - i); out[i:i + m] += ch[:m]
        return out.astype(np.float32)
    return np.zeros(n, np.float32)

SPECS['s2e5'] = [  # babak: 1 Drama (caping, kenalkan) · 2 Diremehkan (ejek, pakan) · 3 Penemuan (cium, endus, nangis, resep) · 4 Drama lagi (angkut, jual) · 5 Cliffhanger (telp, end)
  dict(id='caping', lines=['S2E5_01'], pre=0.15, post=0.3, sfx=[('dun', 0.0)], amb='night'),
  dict(id='kenalkan', lines=['S2E5_02'], pre=0.2, post=0.3, sfx=[('whoosh', 0.0)], amb='night'),
  dict(id='ejek', lines=['S2E5_03'], pre=0.2, post=0.3, amb='night'),
  dict(id='pakan', lines=['S2E5_04'], pre=0.2, post=0.4, amb='night'),
  dict(id='cium', lines=['S2E5_05'], pre=0.4, post=0.3, sfx=[('thud', 0.2)], amb='night'),
  dict(id='endus', lines=['S2E5_06'], pre=1.2, post=0.6, sfx=[('sniff', 0.1), ('ting', 1.0)], amb='night'),
  dict(id='nangis', lines=['S2E5_07'], pre=0.3, post=0.4, amb='night'),
  dict(id='resep', lines=['S2E5_08'], pre=0.3, post=0.5, amb='night'),
  dict(id='angkut', lines=['S2E5_09'], pre=0.3, post=0.3, sfx=[('dun', 0.0)], amb='night'),
  dict(id='jual', lines=['S2E5_10'], pre=0.3, post=0.5, amb='night'),
  dict(id='telp', lines=['S2E5_11'], pre=0.9, post=0.3, sfx=[('ring', 0.0)], amb='night'),
  dict(id='end', lines=['S2E5_12'], pre=0.5, post=1.9, sfx=[('klakson', 0.1), ('dunn', 0.5)], amb='night'),
]

SPECS['s3e5'] = [  # babak: 1 Drama (surat, bentak) · 2 Diremehkan (rebut, buang, baca) · 3 Penemuan (isi, kakap, endus) · 4 Drama lagi (janji, ragu, kabur) · 5 Cliffhanger (end)
  dict(id='surat', lines=['S3E5_01'], pre=0.15, post=0.3, sfx=[('dun', 0.0)], amb='night'),
  dict(id='bentak', lines=['S3E5_02'], pre=0.2, post=0.3, sfx=[('thud', 0.1)], amb='night'),
  dict(id='rebut', lines=['S3E5_03'], pre=0.2, post=0.3, sfx=[('whoosh', 0.0)], amb='night'),
  dict(id='buang', lines=['S3E5_04'], pre=0.2, post=0.3, amb='night'),
  dict(id='baca', lines=['S3E5_05'], pre=0.2, post=0.3, sfx=[('whoosh', 0.0)], amb='night'),
  dict(id='isi', lines=['S3E5_06'], pre=0.4, post=0.5, amb='night'),
  dict(id='kakap', lines=['S3E5_07'], pre=0.3, post=0.4, sfx=[('ting', 0.1)], amb='night'),
  dict(id='endus', lines=['S3E5_08'], pre=1.0, post=0.6, sfx=[('sniff', 0.1), ('ting', 0.9)], amb='night'),
  dict(id='janji', lines=['S3E5_09'], pre=0.3, post=0.4, sfx=[('dun', 0.0)], amb='night'),
  dict(id='ragu', lines=['S3E5_10'], pre=0.3, post=0.2, amb='night'),
  dict(id='kabur', lines=['S3E5_11'], pre=0.15, post=0.5, sfx=[('whoosh', 0.1)], amb='night'),
  dict(id='end', lines=['S3E5_12'], pre=0.6, post=1.9, sfx=[('klakson', 0.1), ('dunn', 0.6)], amb='night'),
]

SPECS['s1e8'] = [  # babak: 1 Drama (bicara, tunjuk) · 2 Diremehkan (ejek, bisik, jemur) · 3 Penemuan (kangen, loh, kacamata) · 4 Drama lagi (milik, tolak) · 5 Cliffhanger (teman, end)
  dict(id='bicara', lines=['S1E8_01'], pre=0.1, post=0.3, sfx=[('dun', 0.0)], amb='night'),
  dict(id='tunjuk', lines=['S1E8_02'], pre=0.15, post=0.3, sfx=[('whoosh', 0.0)], amb='morning'),
  dict(id='ejek', lines=['S1E8_03'], pre=0.2, post=0.3, amb='morning'),
  dict(id='bisik', lines=['S1E8_04'], pre=0.2, post=0.3, amb='morning'),
  dict(id='jemur', lines=['S1E8_05'], pre=0.5, post=0.6, min=2.4, amb='morning'),
  dict(id='kangen', lines=['S1E8_06'], pre=1.0, post=0.5, sfx=[('sniff', 0.1), ('ting', 0.9)], amb='night'),
  dict(id='loh', lines=['S1E8_07'], pre=0.2, post=0.4, sfx=[('ting', 0.1)], amb='morning'),
  dict(id='kacamata', lines=['S1E8_08'], pre=0.6, post=0.5, amb='morning'),
  dict(id='milik', lines=['S1E8_09'], pre=0.3, post=0.4, sfx=[('dun', 0.0)], amb='night'),
  dict(id='tolak', lines=['S1E8_10'], pre=0.4, post=0.6, min=2.2, amb='night'),
  dict(id='teman', lines=['S1E8_11'], pre=0.3, post=0.5, sfx=[('whoosh', 0.2)], amb='night'),
  dict(id='end', lines=['S1E8_12'], pre=0.5, post=1.9, sfx=[('dunn', 0.3)], amb='night'),
]

SPECS['s2e6'] = [  # babak: 1 Drama (truk) · 2 Diremehkan (keriput, kuli) · 3 Penemuan (buka, loh, kosong, cek, solar) · 4 Drama lagi (kepung, panik) · 5 Cliffhanger (tenang, end)
  dict(id='truk', lines=['S2E6_01'], pre=0.15, post=0.3, sfx=[('klakson', 0.0), ('dun', 0.1)], amb='night'),
  dict(id='keriput', lines=['S2E6_02'], pre=0.2, post=0.3, sfx=[('whoosh', 0.0)], amb='night'),
  dict(id='kuli', lines=['S2E6_03'], pre=0.2, post=0.4, amb='night'),
  dict(id='buka', lines=['S2E6_04'], pre=0.3, post=0.4, sfx=[('thud', 0.1)], amb='night'),
  dict(id='loh', lines=['S2E6_05'], pre=0.8, post=0.4, sfx=[('ring', 0.0), ('ting', 0.8)], amb='night'),
  dict(id='kosong', lines=['S2E6_06'], pre=0.2, post=0.3, sfx=[('dun', 0.0)], amb='night'),
  dict(id='cek', lines=['S2E6_07'], pre=0.3, post=0.4, amb='night'),
  dict(id='solar', lines=['S2E6_08'], pre=1.0, post=0.5, sfx=[('sniff', 0.1)], amb='night'),
  dict(id='kepung', lines=['S2E6_09'], pre=0.2, post=0.3, sfx=[('dun', 0.0)], amb='night'),
  dict(id='panik', lines=['S2E6_10'], pre=0.3, post=0.3, sfx=[('klakson', 0.0)], amb='night'),
  dict(id='tenang', lines=['S2E6_11'], pre=0.4, post=0.5, amb='night'),
  dict(id='end', lines=['S2E6_12'], pre=0.5, post=1.9, sfx=[('dunn', 0.4)], amb='night'),
]

SPECS['s2e7'] = [  # babak: 1 Drama (teriak, gemetar) · 2 Diremehkan (nenek, siapa) · 3 Penemuan (endus, loh, ajari) · 4 Drama lagi (jewer, lomba, kalah) · 5 Cliffhanger (bisik, end)
  dict(id='teriak', lines=['S2E7_01'], pre=0.1, post=0.3, sfx=[('dun', 0.0)], amb='night'),
  dict(id='gemetar', lines=['S2E7_02'], pre=0.2, post=0.3, amb='night'),
  dict(id='nenek', lines=['S2E7_03'], pre=0.2, post=0.3, sfx=[('whoosh', 0.0)], amb='night'),
  dict(id='siapa', lines=['S2E7_04'], pre=0.2, post=0.3, sfx=[('thud', 0.1)], amb='night'),
  dict(id='endus', lines=['S2E7_05'], pre=1.0, post=0.4, sfx=[('sniff', 0.1), ('ting', 0.9)], amb='night'),
  dict(id='loh', lines=['S2E7_06'], pre=0.2, post=0.4, sfx=[('ting', 0.1)], amb='night'),
  dict(id='ajari', lines=['S2E7_07'], pre=0.3, post=0.4, amb='night'),
  dict(id='jewer', lines=['S2E7_08'], pre=0.3, post=0.4, sfx=[('boing', 0.1)], amb='night'),
  dict(id='lomba', lines=['S2E7_09'], pre=0.2, post=0.3, sfx=[('klakson', 0.0)], amb='night'),
  dict(id='kalah', lines=['S2E7_10'], pre=0.3, post=0.4, sfx=[('dun', 0.0)], amb='night'),
  dict(id='bisik', lines=['S2E7_11'], pre=0.4, post=0.4, amb='night'),
  dict(id='end', lines=['S2E7_12'], pre=0.4, post=1.9, sfx=[('dunn', 0.3)], amb='night'),
]

# ---------------- build ----------------
spec = SPECS[EP]; clips = {}; sources = {}
for sh in spec:
    for cid in sh['lines']:
        clips[cid], sources[cid] = load_clip(cid)

shots = []; t = 0.0
for sh in spec:
    pre, post, gap = sh.get('pre', 0.3), sh.get('post', 0.4), sh.get('gap', 0.4)
    lt = t + pre; lines = []
    for k, cid in enumerate(sh['lines']):
        x = clips[cid]; d = len(x) / SR; e = envelope(x)
        lines.append({'id': cid, 'spk': LINES[cid][0], 'text': LINES[cid][1], 'start': round(lt, 3), 'end': round(lt + d, 3), 'env': e, 'words': [{**w, 't0': round(w['t0'] + lt, 3), 't1': round(w['t1'] + lt, 3)} for w in words_timing(LINES[cid][1], e, d)]})
        lt += d + (gap if k < len(sh['lines']) - 1 else 0)
    dur = max(sh.get('min', 0), (lt - t) + post)
    shots.append({'id': sh['id'], 'start': round(t, 3), 'dur': round(dur, 3), 'lines': lines})
    t += dur
total = t
mix = np.zeros(int((total + 0.3) * SR), np.float32); voice = np.zeros_like(mix)
def put(buf, sig, at, g=1.0):
    i = int(at * SR)
    if i >= len(buf): return
    m = min(len(sig), len(buf) - i); buf[i:i + m] += np.asarray(sig[:m], np.float32) * g

events = []
for sh, spc in zip(shots, spec):
    for cid in [l['id'] for l in sh['lines']]:
        l = next(l for l in sh['lines'] if l['id'] == cid)
        x = clips[cid]
        if (l['spk'] in ('kakap',) and sh['id'] in ('boss', 'k1', 'k2', 'k3', 'k4')) or l['spk'] in spc.get('phone', ()):  # phone-ish voice
            x = bp(x, 300, 3400) * 1.3
        put(voice, x, l['start'], 0.95)
    for name, off in spc.get('sfx', []):
        put(mix, SFX[name](), sh['start'] + off, 0.6); events.append({'t': round(sh['start'] + off, 3), 'sfx': name})
    if spc.get('sfx_after'):
        end = sh['lines'][-1]['end'] if sh['lines'] else sh['start']
        for name, off in spc['sfx_after']:
            put(mix, SFX[name](), end + off, 0.6); events.append({'t': round(end + off, 3), 'sfx': name})

if EP == 'ep2':
    # pop on every word, confetti on "Deal"
    for sh in shots:
        for l in sh['lines']:
            for w in l['words']: put(mix, SFX['pop'](), w['t0'], 0.35)
    deal = next(l for sh in shots for l in sh['lines'] if l['id'] == 'E2_09'); put(mix, SFX['confetti'](), deal['start'] + 0.1, 0.6)
    mus = music_bounce(total)
    # duck music under voice
    v_env = np.convolve(np.abs(voice), np.ones(4410) / 4410, mode='same'); duck = 1 - 0.65 * np.clip(v_env / 0.08, 0, 1)
    # music off during the reveal hits and the "Oh." silence (comic stop)
    for sh in shots:
        if sh['id'] in ('reveal', 'oh'):
            a, b = int(sh['start'] * SR), int((sh['start'] + sh['dur']) * SR); duck[a:b] = 0
    put(mix, mus * duck[:len(mus)], 0, 0.55)
else:
    amb = {'k': 'night', 'o': 'office', 'shop': 'morning', 'sniff': 'morning', 'eat': 'morning', 'end': 'morning'}
    for sh, spc in zip(shots, spec):
        kind = spc.get('amb') or amb.get(sh['id'], amb.get(sh['id'][0], 'night'))  # episode baru: isi 'amb' per shot (night/office/morning)
        put(mix, ambience(kind, sh['dur']), sh['start'], 1.0)

mix += voice
mix = np.tanh(mix * 1.1); mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.89
os.makedirs(EP, exist_ok=True)
wavfile.write(f'{EP}/audio_raw.wav', SR, (mix * 32767).astype(np.int16))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{EP}/audio_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', str(SR), f'{EP}/audio.wav'], check=True)
json.dump({'total': round(total, 3), 'fps': FPS, 'shots': shots, 'events': events, 'sources': sources}, open(f'{EP}/timeline.json', 'w'))
print(EP, 'total', round(total, 2), 's', {k: v for k, v in sources.items()})
