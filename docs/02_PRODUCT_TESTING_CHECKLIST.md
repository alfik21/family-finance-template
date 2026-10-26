# Lembar Kerja Pengujian Produk (Product Testing Checklist - Blank Template)
## Family Finance Tracker — Couple & Family Edition

**Tipe Dokumen**: Lembar Kendali Mutu Pra-Peluncuran (Pre-Launch QA & UAT Checklist)  
**Format Target**: Google Sheets (Struktur 2 Tab: `DASHBOARD_UJI` dan `MATRIKS_UJI`)  
**Divisi Penanggung Jawab (PIC)**: Finance + Operations  
**Status Produk**: Baru Selesai Dikembangkan (Fresh Build) — Belum Diuji oleh Pengguna Asli  
**Dokumen Panduan & SOP Uji**: [`docs/02_PANDUAN_PENGUJIAN_PRODUK.md`](file:///J:/Aplikasi/family-finance-template/docs/02_PANDUAN_PENGUJIAN_PRODUK.md)  
**Berkas Spreadsheet Multi-Sheet Kosong (.xlsx)**: [`docs/02_PRODUCT_TESTING_CHECKLIST.xlsx`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.xlsx)  
**Berkas CSV Kosong Per-Sheet**:  
- Tab 1: [`docs/02_PRODUCT_TESTING_CHECKLIST_TAB1_DASHBOARD.csv`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST_TAB1_DASHBOARD.csv)  
- Tab 2: [`docs/02_PRODUCT_TESTING_CHECKLIST_TAB2_MATRIKS.csv`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST_TAB2_MATRIKS.csv)  
- Berkas CSV Ringkas Standar: [`docs/02_PRODUCT_TESTING_CHECKLIST.csv`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.csv)  

---

> [!IMPORTANT]
> **Kondisi Berkas Pengujian**:  
> Produk ini berada pada fase **baru selesai dikembangkan pada level koding**. Seluruh formulir pengujian berikut sengaja berstatus **PENDING** dan dikosongkan pada kolom hasil observasi (`Actual Result`) serta tanggal verifikasi agar tim internal (**Finance** dan **Operations**) bersama pasangan penguji asli (*pilot couple users*) dapat menguji dan mengisi data secara objektif.

---

## 1. Tab 1: DASHBOARD_UJI (Ringkasan Eksekutif & Lembar Sign-Off Kosong)

### A. Metrik Kelulusan Pengujian Produk Baru

| Parameter Metrik | Formula Google Sheets | Nilai Saat Ini | Target Kelulusan | Status Evaluasi |
|---|---|---|---|---|
| Total Kasus Uji Fungsional | `=COUNTA(MATRIKS_UJI!A2:A27)` | 26 | 26 | Terdefinisi |
| Skenario Lulus (PASS) | `=COUNTIF(MATRIKS_UJI!F2:F27, "PASS")` | 0 | 26 | Belum Diuji |
| Skenario Gagal (FAIL) | `=COUNTIF(MATRIKS_UJI!F2:F27, "FAIL")` | 0 | 0 | Menunggu Eksekusi |
| Skenario Belum Diuji (PENDING) | `=COUNTIF(MATRIKS_UJI!F2:F27, "PENDING")` | 26 | 0 | 26 Butir Antre Uji |
| Tingkat Kelulusan (Pass Rate) | `=C4/C3` | 0.0% | 100.0% | Belum Memenuhi Syarat |
| Status Kesiapan Komersial | `=IF(C7=1, "LAYAK JUAL (READY TO SELL)", "DITAHAN (HOLD)")` | DITAHAN (HOLD) | LAYAK JUAL | Menunggu Hasil QA & UAT |

### B. Lembar Tanda Tangan Persetujuan Rilis (Sign-Off Kosong Bertahap)

| Tahap Persetujuan | Penanggung Jawab (PIC) | Tanggal Verifikasi | Status Keputusan |
|---|---|---|---|
| Tahap 1: Verifikasi Fungsional Internal | Operations Team | [Belum Diisi] | [Pending QA] |
| Tahap 1: Verifikasi Rumus & Rekonsiliasi Saldo | Finance Team | [Belum Diisi] | [Pending QA] |
| Tahap 2: Verifikasi Uji Coba Pasangan Asli (UAT) | 3-5 Pilot Couples | [Belum Diisi] | [Pending UAT] |
| Persetujuan Akhir Rilis Penjualan Publik | Operations Lead | [Belum Diisi] | [Pending Sign-Off] |

---

## 2. Tab 2: MATRIKS_UJI (Formulir 26 Kasus Uji Kosong)

### Modul A: Input Transaksi Kas (Kas Bersama & Dompet Pribadi)

| Test ID | Modul | Fitur & Skenario | Expected Result | Actual Result | Status | PIC | Tanggal Uji | Catatan / Evidence |
|---|---|---|---|---|---|---|---|---|
| TC-INP-01 | Input Kas | Pengeluaran Kas Bersama | Mutasi tersimpan di sheet TRANSAKSI, saldo dompet terpotong, kartu Pengeluaran Bersama di DASHBOARD bertambah. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-INP-02 | Input Kas | Pengeluaran Dompet Pribadi Suami | Saldo dompet Suami terpotong, pagu Kas Bersama tidak berkurang, mutasi teralokasi ke Pribadi Suami. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-INP-03 | Input Kas | Pengeluaran Dompet Pribadi Istri | Saldo dompet Istri terpotong, pagu Kas Bersama tidak berkurang, mutasi teralokasi ke Pribadi Istri. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-INP-04 | Input Kas | Pemasukan Gaji Bersama | Pemasukan tersimpan bertipe Pemasukan, saldo dompet penerima bertambah, kartu Total Pemasukan bertambah tepat. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-INP-05 | Input Kas | Pintasan Tombol Cepat Cerdas | Satu ketukan pada Smart Preset mengisi nominal, peruntukan, kategori, dan catatan secara otomatis. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |

### Modul B: Perhitungan Saldo & Akuntansi Kas

| Test ID | Modul | Fitur & Skenario | Expected Result | Actual Result | Status | PIC | Tanggal Uji | Catatan / Evidence |
|---|---|---|---|---|---|---|---|---|
| TC-BAL-01 | Akuntansi | Kalkulasi Saldo per Dompet | Saldo akhir dompet sama dengan (Total Pemasukan + Transfer Masuk) - (Total Pengeluaran + Transfer Keluar). | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-BAL-02 | Akuntansi | Isolasi Saldo Awal Template | Saldo awal di baris TRX-INIT-001 menjadi saldo pembuka kas tanpa menggelembungkan arus kas bulanan. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-BAL-03 | Akuntansi | Mutasi Transfer Antar-Dompet | Dompet asal terpotong, dompet tujuan bertambah nominal identik, total kas stabil, tercatat [Asal] ke [Tujuan]. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-BAL-04 | Akuntansi | Kartu Sisa Kas Berjalan | Kartu Sisa Kas Berjalan di Dashboard menghitung akurat sesuai formula =A6-E6 (Pemasukan - Pengeluaran). | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-BAL-05 | Akuntansi | Koreksi & Hapus Transaksi | Mengedit atau menghapus mutasi me-rollback saldo dompet terkait secara presisi ke posisi semula. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |

### Modul C: Ringkasan & Siklus Waktu (Bulanan & Siklus Gajian)

| Test ID | Modul | Fitur & Skenario | Expected Result | Actual Result | Status | PIC | Tanggal Uji | Catatan / Evidence |
|---|---|---|---|---|---|---|---|---|
| TC-SUM-01 | Ringkasan | Arus Kas Bulan Kalender | Kartu dan tabel ringkasan menyajikan data yang sesuai dengan filter bulan pantauan (YYYY-MM). | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-SUM-02 | Ringkasan | Rekap Siklus Gajian Fleksibel | Ketika tanggal gajian disetel (misal: 25), Web App mengelompokkan data dari tanggal 25 s/d 24 bulan berikutnya. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-SUM-03 | Ringkasan | Navigasi Siklus Dua Arah | Tombol navigasi siklus sebelumnya (Prev) dan berikutnya (Next) di Web App menyajikan data siklus terkait. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-SUM-04 | Ringkasan | Distribusi Belanja Pasangan | Tabel ringkasan peruntukan di Dashboard memisahkan total belanja Kas Bersama, Pribadi Suami, dan Pribadi Istri. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |

### Modul D: Visualisasi & Anggaran Belanja

| Test ID | Modul | Fitur & Skenario | Expected Result | Actual Result | Status | PIC | Tanggal Uji | Catatan / Evidence |
|---|---|---|---|---|---|---|---|---|
| TC-DSH-01 | Visual | Bar Sparkline Anggaran | Kolom status progress di sheet BUDGET & POS menampilkan bilah hijau proporsional jika belanja di bawah limit. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |
| TC-DSH-02 | Visual | Indikator Batas Overbudget | Bilah progress bar otomatis berubah warna merah menyala saat belanja melebihi pagu anggaran kategori. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-DSH-03 | Visual | Persentase Pemakaian Kuota | Kolom % Pemakaian terhitung akurat sesuai formula Realisasi / Anggaran tanpa pesan galat (#DIV/0!). | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |

### Modul E: Validasi & Integritas Data

| Test ID | Modul | Fitur & Skenario | Expected Result | Actual Result | Status | PIC | Tanggal Uji | Catatan / Evidence |
|---|---|---|---|---|---|---|---|---|
| TC-VAL-01 | Validasi | Nominal Kosong atau Nol | Menolak simpan transaksi bernilai <= 0 dengan peringatan ramah pengguna pada antarmuka Web App. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-VAL-02 | Validasi | Nominal Negatif & Karakter Teks | Sistem mencegah input angka minus atau karakter non-numerik pada field nominal Web App. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-VAL-03 | Validasi | Integritas Format Tanggal | Tanggal tersimpan dalam format kalender valid (YYYY-MM-DD) dan kolom bulan terisi otomatis formula TEXT. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-VAL-04 | Validasi | Proteksi Konkurensi Pasangan | Suami dan istri input transaksi bersamaan via smartphone masing-masing; kedua baris tersimpan lengkap (LockService). | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |

### Modul F: Verifikasi Salinan Template (Post-Copy Verification)

| Test ID | Modul | Fitur & Skenario | Expected Result | Actual Result | Status | PIC | Tanggal Uji | Catatan / Evidence |
|---|---|---|---|---|---|---|---|---|
| TC-CPY-01 | Distribusi | Akses Link Trik /copy | Tautan /copy menampilkan laman resmi Google Make a copy tanpa memerlukan izin akses dari pemilik. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-CPY-02 | Distribusi | Isolasi Berkas Pembeli | Berkas tersimpan mandiri di Drive pembeli; pengubahan data pembeli tidak berdampak pada Master Template. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-CPY-03 | Distribusi | Otorisasi Script Pengguna | Dialog otorisasi keamanan Google berjalan mulus via opsi Advanced > Go to Family Finance Tracker (unsafe). | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-CPY-04 | Distribusi | Setup Otomatis Spreadsheet | Menjalankan setupFinanceTracker otomatis membentuk sheet CONFIG, TRANSAKSI, BUDGET & POS, dan DASHBOARD. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-CPY-05 | Distribusi | Deploy Web App Mandiri | Pembeli berhasil men-deploy Web App dengan setelan Execute as: User accessing dan dibuka lancar di browser HP. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-CPY-06 | Distribusi | Pasang ke Layar HP (PWA) | Add to Home Screen di Safari (iOS) dan Chrome (Android) menghasilkan shortcut layar penuh ramah jempol. | [Kosong] | PENDING | Operations | [Kosong] | [Kosong] |
| TC-CPY-07 | Distribusi | Tutup Buku & Arsip Tahunan | Menu Tutup Buku & Arsipkan Tahun Lalu berhasil memindahkan data lampau ke ARSIP_YYYY dan mengoper saldo awal. | [Kosong] | PENDING | Finance | [Kosong] | [Kosong] |

---

## 3. Instruksi Pelaksanaan Pengujian

1. Unduh berkas [`02_PRODUCT_TESTING_CHECKLIST.xlsx`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.xlsx).
2. Unggah ke Google Sheets (`File > Open > Upload`).
3. Jalankan pengujian Fase 1 (Internal QA) sesuai petunjuk di [`02_PANDUAN_PENGUJIAN_PRODUK.md`](file:///J:/Aplikasi/family-finance-template/docs/02_PANDUAN_PENGUJIAN_PRODUK.md).
4. Setelah seluruh 26 butir lulus (**PASS**), lakukan pengujian Fase 2 bersama 3–5 pasangan pengguna nyata (*pilot couples*).
5. Isi kolom *Actual Result*, ubah status menjadi **PASS**, masukkan tanggal uji dan catatan temuan.
6. Tanda tangani lembar persetujuan sign-off sebelum produk dipublikasikan untuk penjualan umum.
