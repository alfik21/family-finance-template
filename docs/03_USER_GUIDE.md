# Panduan Pengguna (User Guide)
## Family Finance Tracker — Couple & Family Edition

**Tipe Dokumen**: Panduan Pengguna & Serah Terima Pembeli (Edisi Rilis Perdana)  
**Format Target**: PDF (Tata Letak Standar 4 Halaman Siap Cetak / Print-Ready)  
**Divisi Penanggung Jawab (PIC)**: Operations  
**Versi Berkas**: 1.2.0  

---

<!-- ======================================================================= -->
<!-- HALAMAN 1 DARI 4                                                        -->
<!-- ======================================================================= -->

### Dokumen: Family Finance Tracker User Guide | Halaman 1 dari 4 | Pengenalan & Duplikasi

## 1. Selamat Datang di Family Finance Tracker

Selamat atas kepemilikan sistem **Family Finance Tracker (Couple & Family Edition)**. Template ini dirancang khusus untuk membantu pasangan suami-istri mengelola keuangan keluarga secara harmonis, transparan, dan teratur dengan model finansial *Hybrid* (Kas Bersama + Dompet Pribadi Suami & Istri) tanpa biaya langganan bulanan (*zero-subscription*).

### Nilai Utama Produk:
- **Model Finansial Hybrid**: Menyatukan pos belanja operasional rumah tangga bersama tanpa membatasi uang saku atau hobi pribadi masing-masing pasangan.
- **Privasi Terjamin 100%**: Seluruh data mutasi tersimpan di Google Drive pribadi Anda, bukan di server startup asing.
- **Akses Cepat Smartphone (PWA)**: Buka aplikasi langsung dari layar utama ponsel (*Add to Home Screen*) dalam 1–2 detik saat berada di kasir atau pasar.
- **Bebas Biaya Langganan Seumur Hidup**: Cukup satu kali beli, dapat digunakan seterusnya tanpa batas baris transaksi.

---

## 2. Cara Membuat Salinan Template ke Google Drive Pribadi

Untuk menggunakan template, Anda cukup menduplikasi berkas Master Template ke akun Google Drive Anda dalam satu langkah mudah via trik tautan `/copy`.

### Langkah-langkah Duplikasi:
1. Pastikan Anda telah masuk (*login*) ke akun Google / Gmail pribadi di peramban komputer atau laptop.
2. Buka tautan akses resmi yang Anda terima saat pembelian:  
   `https://docs.google.com/spreadsheets/d/.../copy`
3. Peramban akan secara otomatis membuka jendela konfirmasi resmi dari Google:  
   **"Salin dokumen — Apakah Anda ingin membuat salinan dari Family Finance Tracker?"**
4. Klik tombol biru bertuliskan **"Buat salinan"** (*Make a copy*).
5. Seluruh struktur lembar kerja, rumus, dan skrip Google Apps Script akan diduplikasi secara utuh ke Google Drive Anda.
6. Berkas baru ini sekarang menjadi milik pribadi keluarga Anda. Ganti nama berkas di pojok kiri atas sesuai nama keluarga Anda (misal: *Keuangan Keluarga Kami 2026*).

```text
+-----------------------------------------------------------------------------------+
| TANGKAPAN LAYAR 01: HALAMAN DUPLIKASI GOOGLE SHEETS                               |
| Lokasi: Jendela browser saat mengakses tautan /copy                               |
| Dimensi Rekomendasi: 16:9 | Resolusi: 1920x1080                                  |
|                                                                                   |
|  [ Logo Google Sheets ]                                                          |
|  Salin dokumen                                                                    |
|  Apakah Anda ingin membuat salinan dari Family Finance Tracker - Master?          |
|                                                                                   |
|                             [  Buat salinan  ]                                    |
+-----------------------------------------------------------------------------------+
```

--- [BATAS HALAMAN / PAGE BREAK — HALAMAN 1 SELESAI] ---

<!-- ======================================================================= -->
<!-- HALAMAN 2 DARI 4                                                        -->
<!-- ======================================================================= -->

### Dokumen: Family Finance Tracker User Guide | Halaman 2 dari 4 | Otorisasi & Konfigurasi CONFIG

## 3. Otorisasi Keamanan Google Apps Script (Hanya 1 Kali)

Saat pertama kali menjalankan menu aplikasi di Google Sheets, Google mewajibkan konfirmasi izin keamanan standar. Ini adalah prosedur resmi dan aman untuk memastikan skrip hanya berjalan di akun Google Drive Anda sendiri.

### Panduan Otorisasi Langkah demi Langkah:
1. Di tab Google Sheets Anda, segarkan halaman (*refresh* / tekan tombol F5).
2. Tunggu beberapa detik hingga muncul menu baru di bilah menu atas: **`Family Finance Tracker`**.
3. Klik menu **`Family Finance Tracker`** > pilih **"Jalankan Setup / Reset Template"**.
4. Muncul jendela peringatan bertuliskan *"Authorization Required"*, klik **"Continue"** (*Lanjutkan*).
5. Pilih akun Google Anda.
6. Saat muncul jendela *"Google hasn't verified this app"*, klik tautan teks kecil di kiri bawah: **"Advanced"** (*Lanjutan*).
7. Klik baris tulisan: **"Go to Family Finance Tracker (unsafe)"**.
8. Gulir ke bawah lalu klik tombol biru **"Allow"** (*Izinkan*).
9. Seluruh 4 tab utama (`DASHBOARD`, `TRANSAKSI`, `BUDGET & POS`, `CONFIG`) dengan tema warna Sage Green akan otomatis terformat rapi.

```text
+-----------------------------------------------------------------------------------+
| TANGKAPAN LAYAR 02: ALUR OTORISASI KEAMANAN APPS SCRIPT                           |
| Lokasi: Jendela modal Google OAuth Consent Screen                                 |
| Dimensi Rekomendasi: 16:9 | Fokus: Klik 'Advanced' lalu 'Go to Family Finance...'  |
+-----------------------------------------------------------------------------------+
```

---

## 4. Pengaturan Awal Keluarga di Sheet CONFIG

Sebelum mulai mencatat, buka tab **`CONFIG`** pada Google Spreadsheet Anda untuk melakukan personalisasi sederhana:

```text
+-----------------------------------------------------------------------------------+
| TANGKAPAN LAYAR 03: PENGATURAN SHEET CONFIG                                       |
| Lokasi: Tab CONFIG pada Google Sheets                                             |
| Menampilkan: Kolom Pengaturan Keluarga, Kategori Belanja, dan Rekening Dompet     |
+-----------------------------------------------------------------------------------+
```

1. **Pengaturan Identitas Keluarga (Kolom A & B):**
   - **Label Suami & Istri**: Ganti panggilan bawaan (*Ayah / Bunda*) sesuai nama panggilan di rumah.
   - **Email Suami & Istri**: Masukkan email Google yang digunakan di smartphone masing-masing.
   - **Siklus Gajian (Tgl)**: Masukkan tanggal gajian keluarga Anda (misal: 25) untuk mengaktifkan perhitungan siklus bulanan otomatis.
2. **Kategori Pengeluaran & Alokasi Pos (Kolom C & D):**
   - Tentukan pos belanja: apakah masuk sebagai `Kas Bersama`, `Pribadi Suami`, atau `Pribadi Istri`.
3. **Daftar Rekening / Dompet (Kolom E & F):**
   - Masukkan nama rekening bank, kas tunai, atau e-wallet keluarga (misal: *Kas Tunai*, *BCA Bersama*, *GoPay Suami*, *Mandiri Istri*). Tentukan status pemilik rekening.
4. **Saldo Awal Kas Riil:**
   - Buka sheet **`TRANSAKSI`**, lalu pada baris ke-2 (`TRX-INIT-001`), ganti angka 0 pada kolom Nominal dengan saldo kas nyata Anda saat ini.

--- [BATAS HALAMAN / PAGE BREAK — HALAMAN 2 SELESAI] ---

<!-- ======================================================================= -->
<!-- HALAMAN 3 DARI 4                                                        -->
<!-- ======================================================================= -->

### Dokumen: Family Finance Tracker User Guide | Halaman 3 dari 4 | Transaksi & Dashboard Anggaran

## 5. Cara Memasukkan Transaksi

Antarmuka Web App dirancang ramah jempol dengan 3 jenis transaksi yang dapat dipilih di bagian atas formulir:

```text
+-----------------------------------------------------------------------------------+
| FORM PENCATATAN TRANSAKSI                                                         |
| [ Pengeluaran ]              [ Pemasukan ]               [ Transfer Kas ]         |
|                                                                                   |
| Nominal (Rp) : [ 75.000                                      ] (Format Otomatis)  |
|                                                                                   |
| TOMBOL CEPAT : [ Bensin Rp 35k ] [ Galon Rp 45k ] [ Belanja Sayur Rp 75k ]        |
|                                                                                   |
| Kategori     : [ Belanja Pasar & Dapur                       v]                   |
| Sumber Dompet: [ Rekening BCA Bersama                        v]                   |
| Peruntukan   : [ Kas Bersama            ]  [ Pribadi          ]                   |
| Catatan      : [ Sayur sop, daging ayam                      ]                    |
|                                                                                   |
|                             [ SIMPAN TRANSAKSI ]                                  |
+-----------------------------------------------------------------------------------+
```

1. **Pengeluaran**: Masukkan nominal, pilih kategori belanja dan sumber dompet. Tentukan **Peruntukan**: pilih *Kas Bersama* untuk belanja dapur/rumah tangga, atau pilih *Pribadi Suami/Istri* jika memakai uang saku pribadi. Tekan **Simpan Pengeluaran**.
2. **Pemasukan**: Pilih tab Pemasukan, masukkan nominal setoran gaji atau bonus usaha, pilih dompet penerima, lalu simpan.
3. **Transfer Kas Antar-Dompet**: Gunakan saat tarik tunai dari ATM atau memindahkan saldo bank ke e-wallet. Dompet sumber berkurang dan dompet tujuan bertambah tanpa mempengaruhi laporan belanja bulanan keluarga.
4. **Tombol Cepat Cerdas (Smart Presets)**: Sistem otomatis menganalisis kebiasaan belanja berulang Anda. Cukup ketuk satu tombol preset, seluruh kolom kategori dan nominal langsung terisi seketika.

---

## 6. Cara Membaca Dashboard & Status Anggaran

```text
+-----------------------------------------------------------------------------------+
| TANGKAPAN LAYAR 04: DASHBOARD UTAMA & STATUS ANGGARAN SPARKLINE                   |
| Menampilkan: 4 Kartu KPI Kas, Ringkasan Peruntukan Pasangan, dan Bar Anggaran     |
+-----------------------------------------------------------------------------------+
```

### A. Indikator Dashboard Utama (Sheet DASHBOARD)
- **Total Pemasukan**: Total seluruh dana masuk pada bulan berjalan.
- **Pengeluaran Bersama**: Khusus total belanja kebutuhan rumah tangga bersama.
- **Total Pengeluaran**: Akumulasi belanja bersama ditambah belanja pribadi pasangan.
- **Sisa Kas Berjalan**: Sisa uang nyata keluarga yang siap dibelanjakan (`Total Pemasukan - Total Pengeluaran`).
- **Ringkasan Peruntukan Pasangan**: Menampilkan rasio perbandingan belanja antara Kas Bersama, Pribadi Suami, dan Pribadi Istri.

### B. Kontrol Anggaran (Sheet BUDGET & POS)
- **Bilah Sparkline Hijau**: Menandakan pengeluaran pos tersebut masih aman berada di bawah limit anggaran bulanan.
- **Bilah Sparkline Merah (*Overbudget*)**: Memberi sinyal visual tegas bahwa belanja pada pos tersebut telah melampaui plafon yang disepakati, tanda bagi pasangan untuk mengerem belanja hingga gajian berikutnya.

--- [BATAS HALAMAN / PAGE BREAK — HALAMAN 3 SELESAI] ---

<!-- ======================================================================= -->
<!-- HALAMAN 4 DARI 4                                                        -->
<!-- ======================================================================= -->

### Dokumen: Family Finance Tracker User Guide | Halaman 4 dari 4 | PWA Smartphone, Tutup Buku, & Bantuan

## 7. Memasang di Layar Utama Smartphone & Kolaborasi Pasangan

Akses aplikasi dari smartphone layaknya aplikasi native tanpa perlu membuka komputer:

### Langkah 1: Buat Tautan Web App Pribadi
1. Buka spreadsheet Anda di laptop/komputer > klik **Ekstensi** > **Apps Script**.
2. Di pojok kanan atas, klik **Deploy** > **New deployment** > pilih jenis **Web app**.
3. Atur konfigurasi:
   - **Execute as:** `User accessing the web app` *(Penting agar otomatis mendeteksi email pasangan yang sedang mencatat).*
   - **Who has access:** `Anyone with Google account` (atau `Anyone`).
4. Klik **Deploy** dan salin **Web app URL** yang muncul. Kirimkan tautan tersebut ke WhatsApp pasangan Anda.

### Langkah 2: Pasang di Layar Utama Smartphone (Add to Home Screen)
- **Pengguna iPhone (Safari)**: Buka tautan di Safari > ketuk tombol **Share** (kotak panah ke atas) > pilih **"Add to Home Screen"** (*Tambah ke Layar Utama*).
- **Pengguna Android (Chrome)**: Buka tautan di Chrome > ketuk **Menu Titik Tiga** di kanan atas > pilih **"Add to Home screen"** / **"Install app"**.

### Langkah 3: Berbagi Hak Akses dengan Pasangan
Di Google Sheets komputer, klik tombol hijau **Bagikan (*Share*)** di kanan atas > masukkan email Google pasangan Anda > berikan izin sebagai **Editor** > Simpan. Kini suami dan istri dapat mencatat transaksi dari HP masing-masing secara bersamaan.

---

## 8. Tutup Buku & Arsip Tahunan (1-Klik)

Agar spreadsheet Anda tidak lambat setelah ribuan baris mutasi:
1. Di akhir tahun kalender, klik menu **`Family Finance Tracker`** pada bilah menu atas Google Sheets.
2. Pilih **"Tutup Buku & Arsipkan Tahun Lalu"** > masukkan tahun yang ingin diarsipkan (misal: `2025`).
3. Sistem secara otomatis memindahkan seluruh riwayat transaksi tahun tersebut ke lembar baru `ARSIP_2025` dan mengoper sisa saldo Kas Bersama ke tahun baru sebagai **Saldo Awal**. Sheet aktif Anda kembali ringan dan siap pakai!

---

## 9. Solusi Masalah Umum (Troubleshooting FAQ)

| Gejala Kendala | Penyebab Umum | Langkah Solusi Cepat |
|---|---|---|
| Muncul layar "Google hasn't verified this app". | Prosedur keamanan pertama kali Google Apps Script. | Klik teks kecil **Advanced** di kiri bawah > klik **Go to Family Finance Tracker (unsafe)** > klik **Allow**. |
| Pasangan tidak bisa menginput atau membuka Web App. | Email pasangan belum diberi akses edit spreadsheet. | Klik tombol hijau **Bagikan** di Google Sheets dan pastikan email pasangan terdaftar sebagai **Editor**. |
| Salah memasukkan nominal atau kategori belanja. | Kesalahan input saat di kasir. | Buka tab **Rekap** di Web App HP, ketuk ikon pensil/tempat sampah. Atau langsung ubah baris terkait di sheet `TRANSAKSI`. |
| Ingin menambah rekening bank atau e-wallet baru. | Kebutuhan dompet baru di tengah jalan. | Tambahkan nama dompet baru di baris kosong sheet `CONFIG`. Dropdown formulir akan otomatis mengenalinya. |

---

## 10. Kontak Dukungan Pengguna & Formulir Masukan

Sebagai produk rilis perdana pasca-pengembangan, kami berkomitmen mendampingi penggunaan template Anda:
- **WhatsApp Layanan Bantuan**: `+62 812-XXXX-XXXX` *(Senin – Sabtu, 09:00 – 17:00 WIB)*
- **Surel Bantuan Teknis**: `support@familyfinancetracker.id`
- **Kanal Masukan & Saran Fitur**: Tautan formulir evaluasi pengguna (*Feedback Form*) pada portal pembelian
- **Waktu Tanggap Layanan**: Maksimal 1 x 24 jam kerja

*Hak Cipta 2026 Family Finance Tracker Operations Team. Seluruh hak dilindungi undang-undang.*
