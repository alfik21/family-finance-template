# Family Finance Tracker (Couple & Family Edition)

Sistem pencatatan dan pemantauan keuangan keluarga berbasis **Google Sheets** dan **Google Apps Script Web App (PWA)** dengan model *Hybrid* (Kas Bersama + Dompet Pribadi Suami & Istri).

---

## Fitur Utama

- **Model Hybrid**: Membedakan pos Kas Bersama rumah tangga (dapur, tagihan, sekolah anak, cicilan) dan pengeluaran pribadi masing-masing tanpa saling membatasi.
- **Mobile Bottom Navigation**: Navigasi bawah ramah ibu jari pada layar smartphone (Catat, Rekap, Kelola, Akun) dan otomatis beralih ke header atas pada desktop.
- **Sistem Akun Master & RBAC**: Akun Google pertama pembuat spreadsheet otomatis menjadi Akun Master dengan kontrol penuh; akun pasangan yang diundang berfokus mencatat transaksi dan memantau rekap keuangan.
- **Kepemilikan Dompet Eksplisit**: Setiap rekening/dompet memiliki status kepemilikan yang jelas (Kas Bersama, Suami, atau Istri) dengan rute transfer dana yang transparan.
- **Tombol Cepat Cerdas (Smart Habit-Based Presets)**: Menganalisis kebiasaan belanja berulang dan otomatis memunculkannya sebagai tombol cepat di formulir pencatatan.
- **Tutup Buku & Arsip Tahunan**: Menjaga sheet transaksi aktif selalu ramping (< 2.000 baris/tahun) dengan memindahkan riwayat tahun lampau ke tab ARSIP_YYYY statis dan mengoper sisa saldo Kas Bersama ke tahun baru.
- **Zero-Symbol & Zero-Emoji Minimalist**: Desain profesional dengan tipografi Plus Jakarta Sans angka tabular dan palet Warm Sage Green.

---

## Struktur File & Folder

```text
├── docs/
│   ├── 01_PRODUCT_BRIEF_AND_REQUIREMENTS.docx # Dokumen Word/Docs Product Brief & spesifikasi produk
│   ├── 01_PRODUCT_BRIEF_AND_REQUIREMENTS.md   # Format Markdown Product Brief & target market
│   ├── 02_PANDUAN_PENGUJIAN_PRODUK.docx       # Dokumen Word/Docs SOP pengujian mutu produk
│   ├── 02_PANDUAN_PENGUJIAN_PRODUK.md         # Format Markdown SOP pengujian mutu 2 fase
│   ├── 02_PRODUCT_TESTING_CHECKLIST.xlsx      # Workbook Google Sheets/Excel 2-tab kosong untuk QA
│   ├── 02_PRODUCT_TESTING_CHECKLIST.md        # Spesifikasi matriks kasus uji QA & UAT
│   ├── 03_USER_GUIDE.docx                     # Dokumen Word/Docs panduan lengkap pembeli
│   ├── 03_USER_GUIDE.md                       # Format Markdown panduan pengguna 4 halaman
│   ├── 04_LICENSE_AND_TERMS_OF_USE.docx       # Dokumen Word/Docs surat perjanjian lisensi
│   ├── 04_LICENSE_AND_TERMS_OF_USE.md         # Format Markdown lisensi komersial & terms of use
│   └── README.md                              # Indeks katalog dokumentasi penjualan & operasional
├── scripts/
│   ├── generate-docs-docx.js    # Generator otomatis berkas Word/Docs (.docx) siap baca
│   └── generate-testing-xlsx.js # Generator otomatis berkas Google Sheets / Excel (.xlsx) QA
├── Setup.gs          # Generator otomatis struktur Google Sheets & menu tutup buku
├── Code.gs           # Backend API Google Apps Script (RBAC, mutasi, arsip, smart presets)
├── WebApp.html       # Antarmuka PWA Mobile-First responsif
├── test-runner.html  # Simulator browser lokal untuk user testing sebelum deploy
├── preview.html      # Pratinjau interaktif aplikasi untuk promosi/demo
├── setup_guide.md    # Panduan lengkap penjual: Master sheet, trik URL /copy, & deployment
├── package.json      # Metadata proyek family-finance-template & npm scripts
└── README.md         # Petunjuk instalasi dan operasional
```

---

## Uji Coba Cepat di Komputer Lokal (User Test Harness)

Sebelum menghubungkan ke Google Drive, Anda dapat langsung mencoba alur kerja aplikasi secara lokal:

1. Buka file `test-runner.html` langsung di browser Anda (klik ganda atau `Open with Google Chrome / Edge`).
2. Di toolbar atas, coba ganti peran login: **Suami (Ayah - Master)** atau **Istri (Bunda - Diundang)**.
3. Coba tap tombol cepat atau input pengeluaran.
4. Tekan **"Simpan Pengeluaran"** dan lihat tabel simulasi spreadsheet di panel kanan langsung terbarui secara realtime.
5. Coba ganti ke **Desktop View** untuk melihat adaptasi antarmuka di layar lebar.

---

## Panduan Instalasi ke Google Sheets & Deploy Web App (3 Menit)

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka browser dan kunjungi [sheets.new](https://sheets.new).
2. Beri nama file spreadsheet Anda, misalnya: `Keuangan Keluarga 2026`.

### Langkah 2: Buka Apps Script & Salin Kode
1. Di menu atas Google Sheets, klik **Extensions** (Ekstensi) > **Apps Script**.
2. Di panel kiri Apps Script:
   - Buat file skrip baru bernama `Setup.gs`, lalu salin seluruh isi file `Setup.gs`.
   - Di file default `Code.gs`, hapus isinya dan ganti dengan isi file `Code.gs`.
   - Klik tombol **+** di sebelah Files > pilih **HTML** > beri nama `WebApp.html`. Hapus isinya dan salin seluruh isi file `WebApp.html`.
3. Klik tombol **Save** (Ctrl+S / Cmd+S).

### Langkah 3: Jalankan Setup Otomatis Spreadsheet
1. Pada dropdown fungsi di toolbar atas Apps Script, pilih fungsi `setupFinanceTracker`.
2. Klik tombol **Run** (Jalankan).
3. Jika muncul permintaan izin (*Authorization Required*), klik *Review Permissions* > pilih akun Google Anda > klik *Advanced* > klik *Go to (unsafe)* > klik *Allow*.
4. Buka kembali tab Google Sheets Anda: seluruh sheet `DASHBOARD`, `TRANSAKSI`, `BUDGET & POS`, dan `CONFIG` dengan tema Sage Green telah siap digunakan.
5. Di sheet `CONFIG`, sesuaikan email suami dan istri pada kolom B.

### Langkah 4: Deploy Web App untuk Smartphone
1. Di halaman Apps Script, klik tombol biru **Deploy** (Terapkan) di pojok kanan atas > pilih **New deployment** (Penerapan baru).
2. Klik tombol gerigi di sebelah *Select type* > pilih **Web app**.
3. Isi konfigurasi berikut:
   - **Description**: `Kas Keluarga v3`
   - **Execute as**: `User accessing the web app` *(Penting: agar transaksi otomatis mendeteksi email Google pasangan yang sedang input)*
   - **Who has access**: `Anyone with Google account`
4. Klik **Deploy** dan salin **Web app URL** yang muncul.

### Langkah 5: Pasang di Layar Utama HP (Add to Home Screen)
Kirimkan URL Web App tersebut ke WhatsApp pasangan Anda:
- **Di iPhone (Safari)**: Buka link > tap ikon **Share** (kotak panah ke atas) > pilih **Add to Home Screen**.
- **Di Android (Chrome)**: Buka link > tap menu titik tiga di pojok kanan atas > pilih **Add to Home screen** / **Install app**.

Kini aplikasi Kas Keluarga dapat diakses layaknya aplikasi native dari layar utama HP dalam 1 detik.
