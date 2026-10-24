# Family Finance Tracker (Couple Edition)

Sistem pencatatan dan pemantauan keuangan rumah tangga berbasis **Google Sheets** dan **Google Apps Script Web App (PWA)** dengan model *Hybrid* (Kas Bersama + Dompet Pribadi Suami & Istri).

---

## Fitur Utama

- **Model Hybrid**: Membedakan pos Kas Bersama rumah tangga (dapur, tagihan, sekolah anak, cicilan) dan pengeluaran pribadi masing-masing tanpa saling membatasi.
- **Deteksi Akun Otomatis**: Mengenali email Google suami atau istri secara otomatis saat membuka Web App di smartphone.
- **3 Menu Utama di Web App**:
  1. `Catat`: Form cepat mobile-first dengan local caching (< 100ms), preset 1-tap, dan selector peruntukan cerdas (Bersama vs Pribadi).
  2. `Rekap Siklus`: Menarik rekap kas berdasarkan **Siklus Gajian** (misal tgl 25 s/d 24), Bulan Kalender, atau rentang kustom dengan breakdown beban pasangan.
  3. `Kelola`: Tambah/hapus Kategori Belanja dan Dompet / Rekening langsung dari HP tanpa perlu membuka spreadsheet di laptop.
- **Google Sheets Minimalist (Sage Green)**: Tab Dashboard, Transaksi, Budget & Pos, serta Config yang otomatis digenerate tanpa perlu mendesain manual.
- **Anti-AI Slop**: Tanpa gradien ungu generik, tanpa hiasan emoji berlebihan, dan angka rupiah menggunakan *tabular numerals* yang sejajar dan nyaman dibaca.

---

## Struktur File

```text
├── Setup.gs          # Generator 1-klik untuk membangun dan memformat seluruh tab Google Sheets
├── Code.gs           # Backend API Google Apps Script (doGet, getInitialData, submitTransaction)
├── WebApp.html       # Antarmuka PWA Mobile-First responsif
├── test-runner.html  # Simulator browser lokal untuk user testing sebelum deploy
└── README.md         # Petunjuk instalasi dan operasional
```

---

## Uji Coba Cepat di Komputer Lokal (User Test Harness)

Sebelum menghubungkan ke Google Drive, Anda dapat langsung mencoba alur kerja aplikasi secara lokal:

1. Buka file `test-runner.html` langsung di browser Anda (klik ganda atau `Open with Google Chrome / Edge`).
2. Di toolbar atas, coba ganti peran login: **Suami (Ayah)** atau **Istri (Bunda)**.
3. Coba tap tombol cepat seperti **"Bensin Motor"** atau **"Sayur Pasar"**.
4. Tekan **"Simpan Transaksi"** dan lihat tabel simulasi spreadsheet di panel kanan langsung terbarui secara realtime.
5. Coba ganti ke **Desktop View** untuk melihat adaptasi tampilan di layar lebar.

---

## Panduan Instalasi ke Google Sheets & Deploy Web App (3 Menit)

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka browser dan kunjungi [sheets.new](https://sheets.new).
2. Beri nama file spreadsheet Anda, misalnya: `Keuangan Keluarga 2026`.

### Langkah 2: Buka Apps Script & Salin Kode
1. Di menu atas Google Sheets, klik **Extensions** (Ekstensi) > **Apps Script**.
2. Di panel kiri Apps Script:
   - Buat file skrip baru bernama `Setup.gs`, lalu salin seluruh isi file [`Setup.gs`](file:///J:/Aplikasi/couple-finance-template/Setup.gs).
   - Di file default `Code.gs`, hapus isinya dan ganti dengan isi file [`Code.gs`](file:///J:/Aplikasi/couple-finance-template/Code.gs).
   - Klik tombol **+** di sebelah Files > pilih **HTML** > beri nama `WebApp.html`. Hapus isinya dan salin seluruh isi file [`WebApp.html`](file:///J:/Aplikasi/couple-finance-template/WebApp.html).
3. Klik tombol **Save** (Ctrl+S / Cmd+S).

### Langkah 3: Jalankan Setup Otomatis Spreadsheet
1. Pada dropdown fungsi di toolbar atas Apps Script, pilih fungsi `setupFinanceTracker`.
2. Klik tombol **Run** (Jalankan).
3. Jika muncul permintaan izin (*Authorization Required*), klik *Review Permissions* > pilih akun Google Anda > klik *Advanced* > klik *Go to (unsafe)* > klik *Allow*.
4. Buka kembali tab Google Sheets Anda: seluruh sheet `DASHBOARD`, `TRANSAKSI`, `BUDGET & POS`, dan `CONFIG` dengan tema Sage Green telah siap digunakan.
5. Di sheet `CONFIG`, sesuaikan email suami dan istri pada kolom B.

### Langkah 4: Deploy Web App untuk Smartphone
1. Di halaman Apps Script, klik tombol biru **Deploy** (Terapkan) di pojok kanan atas > pilih **New deployment** (Penerapan baru).
2. Klik ikon gerigi ⚙️ di sebelah *Select type* > pilih **Web app**.
3. Isi konfigurasi berikut:
   - **Description**: `Kas Keluarga v1`
   - **Execute as**: `User accessing the web app` *(Penting: agar transaksi otomatis mendeteksi email Google pasangan yang sedang input)*
   - **Who has access**: `Anyone with Google account`
4. Klik **Deploy** dan salin **Web app URL** yang muncul.

### Langkah 5: Pasang di Layar Utama HP (Add to Home Screen)
Kirimkan URL Web App tersebut ke WhatsApp pasangan Anda:
- **Di iPhone (Safari)**: Buka link > tap ikon **Share** (kotak panah ke atas) > pilih **Add to Home Screen**.
- **Di Android (Chrome)**: Buka link > tap menu titik tiga di pojok kanan atas > pilih **Add to Home screen** / **Install app**.

Kini aplikasi Kas Keluarga dapat diakses layaknya aplikasi native dari layar utama HP dalam 1 detik.
