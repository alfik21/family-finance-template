# Panduan & Prosedur Pengujian Produk (Product Testing Guide)
## Family Finance Tracker — Couple & Family Edition

**Tipe Dokumen**: Standar Operasional Prosedur (SOP) Pengujian Mutu  
**Format Target**: Google Docs / PDF  
**Divisi Penanggung Jawab (PIC)**: Finance + Operations  
**Konteks Produk**: Produk Baru Selesai Dikembangkan (Fresh Development) — Belum Diuji oleh Pengguna Asli  
**Versi Berkas**: 1.2.0  
**Tanggal Berlaku**: 26 Oktober 2026  
**Berkas Lembar Uji Terkait**:
- Workbook Template Kosong (.xlsx): [`docs/02_PRODUCT_TESTING_CHECKLIST.xlsx`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.xlsx)
- Spesifikasi Lembar Uji Markdown: [`docs/02_PRODUCT_TESTING_CHECKLIST.md`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.md)

---

## 1. Latar Belakang dan Tujuan Pengujian

Produk Family Finance Tracker ini **baru saja selesai dibangun dan selesai dikembangkan pada tingkat kode (*code freeze*)**. Seluruh fitur utama (Web App PWA mobile-first, model finansial hybrid, pemisahan pos belanja bersama vs dompet pribadi suami & istri, tombol cepat cerdas, transfer kas antar-dompet, dan modul tutup buku tahunan) telah selesai dikoding, **namun belum pernah diuji coba oleh pasangan pengguna nyata (*real couple end-users*)**.

Oleh karena itu, dokumen SOP ini menetapkan kerangka kerja pengujian bertahap:
1. **Fase 1: Verifikasi Fungsional Internal (Internal QA)**: Dilakukan oleh tim internal **Finance** dan **Operations** untuk memverifikasi 26 kasus uji teknis.
2. **Fase 2: Pengujian Penerimaan Pengguna Asli (User Acceptance Testing / UAT)**: Dilakukan bersama 3–5 pasangan suami-istri pengguna nyata untuk mengamati kemudahan navigasi, kebingungan bahasa, serta hambatan saat pertama kali menyalin dan memasang template di smartphone mereka.

---

## 2. Struktur Pengujian Dua Fase

```text
+---------------------------------------------------------------------------------+
| TAHAP 1: PENGUJIAN INTERNAL QA (FINANCE + OPERATIONS)                           |
| - Verifikasi 26 Butir Matriks Uji Fungsional Lengkap                           |
| - Uji Stabilitas Rumus Dashboard & Rekonsiliasi Saldo Kas                      |
| - Uji Alur Otorisasi Script & Error Handling Masukan Data                      |
+---------------------------------------------------------------------------------+
                                      |
                                      v (Jika Lulus 100%)
+---------------------------------------------------------------------------------+
| TAHAP 2: PENGUJIAN PENGGUNA ASLI / PILOT COUPLE TESTING (UAT)                   |
| - Libatkan 3-5 Pasangan Suami-Istri Calon Pengguna Riil                         |
| - Pengguna Mencoba Mandiri: Akses Link /copy > Setup CONFIG > Pasang PWA di HP  |
| - Uji Input Transaksi Bersamaan (Simulasi Kasir & Pasar)                        |
| - Pengumpulan Masukan (Feedback) Kenyamanan & Keterbacaan Bahasa               |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| KEPUTUSAN RILIS KOMERSIAL: PRODUK LAYAK JUAL (READY TO SELL)                   |
+---------------------------------------------------------------------------------+
```

---

## 3. Persiapan Lingkungan Uji Bersih (Clean Test Environment)

Karena produk belum pernah disentuh oleh pengguna asli, pengujian wajib disimulasikan dari sudut pandang pengguna awam:

1. **Gunakan Akun Google Uji Baru (Bukan Akun Pengembang)**:  
   Jangan gunakan akun Google yang memiliki akses developer ke repositori. Gunakan akun Gmail biasa yang belum pernah memberi izin (*OAuth consent*) pada skrip ini.
2. **Uji Salinan Mandiri via Link `/copy`**:  
   Buka tautan master berakhiran `/copy`. Pastikan muncul dialog Google resmi: *"Apakah Anda ingin membuat salinan dari Family Finance Tracker?"*.
3. **Simulasi Akses Smartphone Fisik**:  
   Penguji wajib menguji alur instalasi Web App pada perangkat smartphone fisik (iPhone via Safari dan Android via Chrome), bukan hanya simulator inspect browser di laptop.

---

## 4. Klasifikasi Tingkat Keparahan Bug (Severity Levels)

Jika ditemukan anomali atau kebingungan pengguna selama proses uji:

| Tingkat Keparahan | Kriteria | Tindakan Operasional |
|---|---|---|
| **Critical (Blocker)** | Rumus spreadsheet rusak (`#REF!`, `#VALUE!`), saldo tidak sinkron, aplikasi tidak mau terbuka, atau otorisasi gagal total. | Rilis DIBLOKIR. Pengembang wajib memperbaiki sebelum lanjut ke UAT. |
| **High (Major)** | Fitur transfer kas salah hitung, validasi data tembus (angka 0/minus tersimpan), atau tombol Web App di smartphone macet. | Wajib diperbaiki dan diuji ulang. |
| **Medium (Minor)** | Teks label membingungkan pasangan awam, tata letak bergeser pada layar kecil, atau tombol preset terlambat ter-render. | Diperbaiki dalam siklus perbaikan rilis perdana. |
| **Low (Trivial)** | Saran perbaikan warna latar, redaksi panduan kurang jelas, atau permintaan fitur tambahan baru. | Dicatat dalam dokumen masukan pengguna (*Product Backlog*). |

---

## 5. Prosedur Uji Fase 1: Matriks Fungsional Internal (26 Skenario)

Lakukan verifikasi pada lembar kerja kosong [`docs/02_PRODUCT_TESTING_CHECKLIST.xlsx`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.xlsx) (atau versi Markdown [`docs/02_PRODUCT_TESTING_CHECKLIST.md`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.md)):

### A. Modul Input Transaksi Kas (PIC: Operations + Finance)
- **TC-INP-01**: Input pengeluaran Kas Bersama. Pastikan saldo terpotong, masuk ke sheet `TRANSAKSI`, dan kartu Pengeluaran Bersama di `DASHBOARD` bertambah.
- **TC-INP-02**: Input pengeluaran Dompet Pribadi Suami. Pastikan saldo dompet Suami terpotong tanpa memotong pagu anggaran Kas Bersama.
- **TC-INP-03**: Input pengeluaran Dompet Pribadi Istri. Pastikan saldo dompet Istri terpotong tanpa memotong pagu anggaran Kas Bersama.
- **TC-INP-04**: Input pemasukan bersama (Gaji Bersama). Pastikan saldo dompet penerima bertambah dan kartu Total Pemasukan di `DASHBOARD` bertambah tepat.
- **TC-INP-05**: Pintasan Tombol Cepat Cerdas (*Smart Presets*). Satu ketukan mengisi nominal, peruntukan, kategori, dan catatan secara otomatis.

### B. Modul Perhitungan Saldo & Akuntansi Kas (PIC: Finance)
- **TC-BAL-01**: Perhitungan Saldo Otomatis per Dompet: `(Pemasukan + Transfer Masuk) - (Pengeluaran + Transfer Keluar)`.
- **TC-BAL-02**: Isolasi Saldo Awal Kas Bersama di baris `TRX-INIT-001` tidak menggelembungkan total pemasukan operasional bulanan.
- **TC-BAL-03**: Mutasi Transfer Antar-Dompet memotong dompet asal, menambah dompet tujuan, dan tidak dihitung sebagai pos belanja.
- **TC-BAL-04**: Kartu Sisa Kas Berjalan di Dashboard menghitung tepat: `=A6-E6` (Total Pemasukan dikurangi Total Pengeluaran).
- **TC-BAL-05**: Koreksi dan Hapus Transaksi me-rollback saldo dompet terkait ke posisi sebelum transaksi dicatat.

### C. Modul Ringkasan & Siklus Waktu (PIC: Finance + Operations)
- **TC-SUM-01**: Ringkasan Transaksi Bulanan menampilkan data yang sesuai dengan bulan pantauan (`YYYY-MM`).
- **TC-SUM-02**: Rekapitulasi Siklus Gajian (misal: tgl 25) menghitung mutasi dari tanggal 25 bulan berjalan hingga 24 bulan berikutnya.
- **TC-SUM-03**: Navigasi Siklus Gajian Dua Arah (*Prev / Next Cycle*) di Web App berfungsi lancar.
- **TC-SUM-04**: Ringkasan Peruntukan Belanja di Dashboard memisahkan total belanja Kas Bersama, Pribadi Suami, dan Pribadi Istri secara akurat.

### D. Modul Visualisasi & Anggaran (PIC: Finance + Operations)
- **TC-DSH-01**: Bilah Sparkline Anggaran menampilkan warna hijau selama realisasi pengeluaran di bawah limit pagu.
- **TC-DSH-02**: Indikator Batas Merah (*Overbudget*) otomatis aktif saat pengeluaran melebihi plafon anggaran yang ditetapkan di sheet `BUDGET & POS`.
- **TC-DSH-03**: Persentase pemakaian anggaran dihitung akurat (`Realisasi / Anggaran * 100`) tanpa pesan galat.

### E. Modul Validasi & Integritas Data (PIC: Operations)
- **TC-VAL-01**: Menolak simpan transaksi bernilai <= 0 dengan peringatan ramah pengguna.
- **TC-VAL-02**: Menolak input nominal negatif atau karakter non-numerik.
- **TC-VAL-03**: Validasi kolom tanggal kalender valid (`YYYY-MM-DD`) dan kolom bulan terisi otomatis.
- **TC-VAL-04**: Proteksi Konkurensi (`LockService`): input simultan dari HP Suami dan HP Istri tersimpan utuh tanpa data hilang.

### F. Modul Verifikasi Salinan Template (Post-Copy Verification) (PIC: Operations)
- **TC-CPY-01**: Tautan `/copy` menampilkan jendela resmi Google *Make a copy* bagi akun luar.
- **TC-CPY-02**: Berkas Master milik penjual terlindungi dalam status *View Only* (Pelihat).
- **TC-CPY-03**: Alur otorisasi keamanan script Google Apps Script berjalan mulus via opsi *Advanced > Go to unsafe > Allow*.
- **TC-CPY-04**: Setup otomatis via menu kustom `Family Finance Tracker > Jalankan Setup / Reset Template` membentuk 4 sheet rapi.
- **TC-CPY-05**: Deployment Web App mandiri berhasil diakses lancar via smartphone.
- **TC-CPY-06**: Pemasangan PWA di iOS (Safari Add to Home Screen) dan Android (Chrome Tambah ke Layar Utama) berjalan mulus.
- **TC-CPY-07**: Fitur Tutup Buku & Arsip Tahunan (`closeAndArchiveYear`) memindahkan transaksi tahun lalu ke `ARSIP_YYYY` dan mengoper sisa kas sebagai saldo awal baru.

---

## 6. Prosedur Uji Fase 2: Pengujian Bersama Pasangan Asli (UAT)

1. Rekrut 3–5 pasangan suami-istri yang belum pernah melihat rancangan template ini.
2. Berikan tautan `/copy` beserta panduan pembeli ([`docs/03_USER_GUIDE.md`](file:///J:/Aplikasi/family-finance-template/docs/03_USER_GUIDE.md)).
3. **Instruksi untuk Pasangan**:
   - Salah satu pasangan menyalin template ke Google Drive dan melakukan deployment Web App.
   - Mengundang email pasangan sebagai Editor.
   - Pasang icon di layar utama smartphone masing-masing.
   - Coba mencatat 5 transaksi belanja bersama dan 2 transaksi pribadi masing-masing.
   - Amati apakah pasangan mengalami kebingungan pada istilah, formulir, atau langkah otorisasi.
4. Catat seluruh masukan pada lembar umpan balik pengguna.

---

## 7. Ambang Batas Kelulusan Rilis Komersial (Release Gate Criteria)

Produk dinyatakan **LAYAK JUAL (READY TO SELL)** hanya jika:
1. Seluruh 26 kasus uji fungsional Fase 1 berstatus **PASS** (Tingkat Kelulusan 100%).
2. Nol (*zero*) cacat berkategori *Critical* dan *High*.
3. Minimal 80% pasangan penguji pada Fase 2 menyatakan panduan mudah dipahami dan berhasil mencatat transaksi mandiri dalam waktu kurang dari 10 menit sejak membuka tautan.
4. Lembar persetujuan rilis ditandatangani oleh perwakilan Tim Operations dan Tim Finance.
