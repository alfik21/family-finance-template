# Product Brief & Requirements: Family Finance Tracker (Couple & Family Edition)

**Tipe Dokumen**: Dokumen Spesifikasi Produk & Perencanaan Pengembangan  
**Format Target**: Google Docs  
**Divisi Penanggung Jawab (PIC)**: Operations  
**Fase Siklus Produk**: Baru Selesai Pengembangan (Fresh Build) — Menuju Tahap Pengujian Internal & Pengguna Asli  

---

## Tabel Kontrol Dokumen

| Parameter | Keterangan |
|---|---|
| ID Dokumen | DOC-OPS-PBR-2026-FFT |
| Judul Dokumen | Product Brief & Functional Requirements — Family Finance Tracker |
| Edisi Produk | Couple & Family Edition (Google Sheets & Mobile PWA Web App) |
| Versi Rilis | 1.2.0 (Build Perdana Pasca-Pengembangan) |
| Tanggal Efektif | 26 Oktober 2026 |
| Klasifikasi Akses | Internal — Terbatas (Internal Confidential) |
| Penanggung Jawab (PIC) | Operations Team |
| Tim Peninjau (Reviewer) | Finance Team, Product Lead |
| Status Dokumen | Selesai Pengembangan — Menunggu Pengujian QA & Pengguna Asli (Awaiting QA & UAT) |

---

## Ringkasan Eksekutif (Executive Summary)

Family Finance Tracker adalah sistem pencatatan, penganggaran, dan evaluasi finansial rumah tangga yang menggabungkan keandalan basis data **Google Sheets** dengan kemudahan akses **Web App PWA (Progressive Web App)** berbasis **Google Apps Script**. 

Sistem ini **baru saja selesai dibangun dan dikembangkan (*freshly developed*)** oleh tim pengembang. Berbeda dengan aplikasi keuangan personal biasa, produk ini mengusung **Model Finansial Hybrid** yang membedakan secara tegas antara belanja Kas Bersama rumah tangga (dapur, tagihan listrik/air, sekolah anak, cicilan) dan dompet pribadi masing-masing pasangan (Suami & Istri) tanpa saling membatasi.

Sebelum produk ini dibuka untuk penjualan komersial publik, produk wajib melalui dua tahapan verifikasi kritis:
1. **Pengujian Kendali Mutu Internal (Internal QA)**: Memastikan tidak ada galat rumus, rekonsiliasi saldo per dompet akurat, fitur transfer kas tepat, pembagian pagu anggaran berfungsi, dan validasi data berjalan normal.
2. **Pengujian Pengguna Asli (*Pilot Couple Testing / UAT*)**: Menguji antarmuka, kenyamanan tombol cepat di kasir, dan kemudahan kolaborasi entri data oleh pasangan suami-istri pengguna riil pertama kali.

---

## 1. Identitas dan Deskripsi Produk

### 1.1. Nama Produk
- **Nama Komersial**: Family Finance Tracker (Couple & Family Edition)
- **Nama Teknis Repositori**: `family-finance-template`

### 1.2. Deskripsi Konseptual
Aplikasi web pencatatan keuangan keluarga berbasis peramban (PWA) yang terhubung langsung secara *container-bound* ke Google Sheets pribadi pengguna. Menghilangkan kebutuhan instalasi aplikasi dari Play Store/App Store dengan 3 mode akses:
1. **Mode Smartphone (Mobile PWA)**: Berjalan mandiri dari layar utama ponsel (*Add to Home Screen*) melalui peramban Safari (iOS) atau Chrome (Android) dengan navigasi bawah (*Bottom Navigation Bar*) ramah jempol.
2. **Mode Jendela Dialog (Modal Dialog)**: Antarmuka terintegrasi selebar 450x760px di Google Sheets desktop yang dapat dibuka melalui menu `Family Finance Tracker > Buka Aplikasi (Modal)`.
3. **Mode Tabel Lembar Kerja (Spreadsheet View)**: Tampilan visual lembar kerja Google Sheets bertema *Warm Sage Green* dengan 4 tab utama (`DASHBOARD`, `TRANSAKSI`, `BUDGET & POS`, `CONFIG`).

---

## 2. Profil Target Pengguna Asli (Target Pilot & End Users)

Profil pengguna yang ditargetkan untuk pengujian awal dan penjualan komersial:

### 2.1. Pasangan Baru Menikah (Newlyweds)
- **Karakteristik**: Baru mulai menyatukan arus kas rumah tangga, membutuhkan transparansi pengeluaran bersama tanpa rasa canggung atau curiga.
- **Fokus Uji Coba**: Kemudahan membedakan uang belanja dapur bersama dan uang jajan pribadi masing-masing pasangan.

### 2.2. Pasangan Bekerja dengan Penghasilan Ganda (Dual-Income Couple)
- **Karakteristik**: Suami dan istri sama-sama berpenghasilan, saling setor dana untuk pos operasional rumah tangga, dan memiliki rekening bank/e-wallet terpisah.
- **Fokus Uji Coba**: Kemudahan pencatatan setoran gaji bersama, kepemilikan rekening (*Explicit Wallet Ownership*), dan fitur transfer kas antar-dompet.

### 2.3. Keluarga Muda dengan Banyak Pos Kebutuhan Anak
- **Karakteristik**: Memiliki pengeluaran rutin bulanan yang ketat (popok, susu, les anak, cicilan KPR, token listrik, internet).
- **Fokus Uji Coba**: Peringatan visual batas anggaran (*Sparkline Alert Bar*) yang otomatis menyala merah saat terjadi *overbudget*.

### 2.4. Pengguna Sadar Privasi yang Mengalami Subscription Fatigue
- **Karakteristik**: Enggan membayar langganan aplikasi finansial bulanan (Rp 50.000 – Rp 100.000/bulan) dan menolak mengunggah data mutasi bank keluarga ke server startup asing.
- **Fokus Uji Coba**: 100% kepemilikan data di akun Google Drive pribadi dan kemudahan akses seumur hidup sekali bayar (*lifetime access*).

---

## 3. Masalah yang Ingin Diselesaikan

| Masalah Finansial Keluarga Saat Ini | Solusi yang Selesai Dikembangkan |
|---|---|
| **Tercampurnya Kas Bersama & Dompet Pribadi**: Kebingungan membedakan uang belanja operasional rumah tangga vs uang hobi/kebutuhan personal. | **Model Finansial Hybrid**: Pemisahan tegas pos *Kas Bersama*, *Pribadi Suami*, dan *Pribadi Istri* dalam satu dashboard terpadu. |
| **Malas Mencatat Akibat Entri Ponsel Lambat**: Membuka aplikasi Google Sheets biasa di layar kecil HP saat di kasir terasa lambat dan merepotkan. | **Web App PWA Ramah Jempol**: Akses 1–2 detik dari layar utama HP lengkap dengan tombol cepat cerdas 1-ketuk (*Smart Presets*). |
| **Subscription Fatigue**: Beban biaya langganan bulanan software keuangan keluarga yang berulang dan boros. | **Sekali Bayar Seumur Hidup (*Lifetime Access*)**: Tanpa biaya langganan, tanpa iklan, dan tanpa batasan transaksi. |
| **Risiko Privasi Data Bocor**: Ketakutan data mutasi keluarga disimpan di database pihak ketiga yang rawan peretasan. | **100% Kepemilikan Data di Google Drive**: Template diduplikasi ke Drive pribadi pengguna; pengembang tidak memiliki akses ke berkas. |
| **Spreadsheet Lemot Akibat Baris Menumpuk**: File spreadsheet menjadi berat setelah ribuan baris transaksi tersimpan bertahun-tahun. | **Fitur Tutup Buku & Arsip 1-Klik**: Memindahkan riwayat tahun lalu ke sheet statis `ARSIP_YYYY` dan mengoper sisa saldo kas ke tahun baru otomatis. |

---

## 4. Daftar Fitur yang Telah Selesai Dikembangkan

1. **Model Finansial Hybrid (Kas Bersama + Dompet Pribadi Suami & Istri)**: Pengelompokan mutasi belanja keluarga tanpa menghilangkan otonomi dompet pribadi pasangan.
2. **Antarmuka Minimalis Sage Green Utilitarian**: Desain modern dengan tipografi *Plus Jakarta Sans*, angka tabular (*num-tabular*), palet warna *Warm Sage Green*, dan bebas emoji (*Zero-Emoji Policy*).
3. **Mobile Bottom Navigation & Desktop Top Header**: Navigasi bawah 4 tab (*Catat, Rekap, Kelola, Akun*) di smartphone dan beralih ke layout desktop di monitor.
4. **Tombol Cepat Cerdas (Smart Habit-Based Presets)**: Algoritma otomatis menganalisis kebiasaan transaksi berulang dan memunculkan tombol 1-ketuk untuk nominal rutin (Bensin, Galon/Gas, Sayur).
5. **Navigasi Siklus Gajian Fleksibel (Two-Way Salary Cycle)**: Rekapitulasi transaksi dinamis berdasarkan tanggal gajian keluarga (misal: tgl 25) dengan tombol navigasi siklus sebelumnya (*Prev*) dan berikutnya (*Next*).
6. **Role-Based Access Control (RBAC) Otomatis**: Mengenali email Google pembuat sebagai Akun Master (memiliki akses tutup buku dan kontrol akun), sedangkan pasangan yang diundang bertindak sebagai kolaborator pencatat.
7. **Modul Transfer Kas Antar-Dompet**: Fitur mutasi antar-rekening/e-wallet dengan rute sumber dan tujuan yang jelas tanpa mempengaruhi laporan belanja bulanan.
8. **Alokasi Anggaran & Visual Sparkline Bar**: Menampilkan bilah hijau proporsional jika pengeluaran aman, dan otomatis berubah merah menyala jika melampaui limit anggaran (*overbudget*).
9. **Fitur Tutup Buku & Arsip Tahunan (`closeAndArchiveYear`)**: Pembersihan data tahunan ke sheet `ARSIP_YYYY` untuk menjaga ukuran sheet aktif tetap ringan (< 2.000 baris/tahun).
10. **Proteksi Konkurensi (`LockService`)**: Memastikan entri data dari smartphone Suami dan Istri yang dilakukan bersamaan tidak bertabrakan atau menimpa satu sama lain.

---

## 5. Batasan Produk (Product Scope & Constraints)

1. **Pencatatan Semi-Otomatis (Bukan Integrasi Otomatis Open Banking)**: Produk tidak terhubung dengan API bank eksternal demi menjaga kerahasiaan sandi dan keamanan perbankan pengguna; pencatatan dilakukan mandiri oleh pasangan.
2. **Ketergantungan Ekosistem Google Workspace**: Pengguna wajib memiliki akun Google aktif untuk mengoperasikan Google Sheets dan Google Apps Script.
3. **Distribusi Berkas Mandiri (Standalone File)**: Produk didistribusikan dalam bentuk tautan duplikasi mandiri (`/copy`), bukan arsitektur multi-tenant SaaS terpusat.
4. **Kesiapan Produk Saat Ini**: Pengkodean sistem telah selesai 100%, namun produk **belum diuji oleh pengguna riil (*real user test*)**. Wajib melalui checklist pengujian fungsional dan pengujian keterpakaian pasangan (*couple usability testing*) sebelum rilis komersial.

---

## 6. Rencana Tahapan Rilis (Product Release Roadmap)

```text
+-----------------------+      +-----------------------+      +-----------------------+
| Tahap 1: PENGEMBANGAN | ---> | Tahap 2: PENGUJIAN    | ---> | Tahap 3: PELUNCURAN   |
| Status: SELESAI       |      | Status: SEDANG JALAN  |      | Status: MENDATANG     |
|                       |      |                       |      |                       |
| - Koding Setup.gs     |      | - Internal QA Testing |      | - Buka Toko Digital   |
| - Koding Code.gs      |      | - UAT Pasangan Riil   |      | - Distribusi Link     |
| - Koding WebApp.html  |      | - Uji Alur /copy      |      | - Kampanye Edukasi    |
| - Unit Testing Otomatis|     | - Evaluasi Feedback   |      | - Serah Terima CS     |
+-----------------------+      +-----------------------+      +-----------------------+
```

---

## 7. Model Penetapan Harga Target Sementara (Provisional Pricing)

| Parameter | Ketetapan Target Sementara |
|---|---|
| Model Lisensi | Pembelian Lisensi Tunggal Rumah Tangga (Akses Seumur Hidup) |
| Harga Referensi Normal (MSRP / Coret) | Rp 199.000 |
| Target Harga Jual Reguler | Rp 99.000 |
| Target Harga Promosi Peluncuran (Early Bird) | Rp 79.000 |
| Paket Bundling Tambahan (Opsional) | Rp 129.000 (Termasuk Add-on Simulasi Dana Darurat & Investasi) |
| Saluran Penjualan Rencana | Lynk.id, Mayar.id, Shopee Digital, Gumroad, WhatsApp Catalog |

---

## 8. Persetujuan Kesiapan Memasuki Tahap Pengujian

Dokumen ini menyatakan bahwa tahap pengembangan kode teknis telah rampung dan produk diserahkan secara resmi untuk memasuki tahap verifikasi mutu internal serta pengujian bersama pengguna asli:

| Peran | Penanggung Jawab | Tanggal | Status Keputusan |
|---|---|---|---|
| Lead Developer | Engineering Team | 26 Oktober 2026 | Kode Siap Diuji (Code Freeze) |
| Operasional | Operations Team | 26 Oktober 2026 | Siap Masuk Tahap QA & UAT |
| Keuangan | Finance Team | 26 Oktober 2026 | Siap Verifikasi Rumus & Saldo |
