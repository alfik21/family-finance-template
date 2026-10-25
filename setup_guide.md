# Panduan Lengkap: Menyiapkan, Mendistribusikan, & Menjual "Family Finance Tracker"

Panduan ini disusun khusus untuk membantu Anda menyiapkan **Master Google Spreadsheet**, mengemas antarmuka Web App, menggunakan **`preview.html`** untuk promosi interaktif, dan membagikan template ke pembeli menggunakan teknik duplikasi otomatis (`/copy`).

---

## 1. Mengapa Produk Ini Sangat Menarik untuk Dijual?

1. **Pasar Sangat Spesifik & Dicari (Niche Pasangan & Keluarga)**:
   - Kebanyakan aplikasi pengatur keuangan di Play Store / App Store hanya dirancang untuk 1 orang (*single-user*).
   - Pasangan suami-istri sering kesulitan memisahkan antara **uang belanja rumah tangga bersama** dan **uang jajan pribadi masing-masing**.
2. **Sekali Bayar, Tanpa Biaya Berlangganan (No Subscription)**:
   - Pembeli tidak perlu membayar Rp 50.000 - Rp 100.000 per bulan.
   - 100% hemat seumur hidup, tanpa batasan jumlah transaksi.
3. **Privasi 100% Terjamin di Google Drive Pribadi**:
   - Data keuangan keluarga tidak disimpan di server pihak ketiga atau startup yang rawan bocor/tutup. Data berada 100% di akun Google milik pembeli sendiri.
4. **Akses Cepat di Smartphone (PWA Native-Like)**:
   - Dapat ditambahkan ke Layar Utama (*Add to Home Screen*) di iOS (Safari) maupun Android (Chrome). Membuka aplikasi hanya butuh 1 detik pas di kasir atau pasar.

---

## 2. Langkah Menyiapkan "Master Spreadsheet" (File Induk Penjual)

Sebagai penjual, Anda cukup membuat **1 Master Spreadsheet** sekali saja. Pembeli nantinya akan menduplikasi dari master ini.

### A. Buat Spreadsheet Baru
1. Buka browser dan kunjungi [sheets.new](https://sheets.new).
2. Beri nama file:  
   `Family Finance Tracker - Master Template`

### B. Pasang Kode Skrip Google Apps Script
1. Di menu atas Google Sheets, klik **Ekstensi** (*Extensions*) > **Apps Script**.
2. Di panel kiri Apps Script:
   * Pada file bawaan `Code.gs`, hapus isinya dan tempel kode dari file [`Code.gs`](file:///J:/Aplikasi/family-finance-template/Code.gs).
   * Klik tombol **+** di sebelah *Files* > pilih **Script** > beri nama `Setup.gs`. Tempel kode dari file [`Setup.gs`](file:///J:/Aplikasi/family-finance-template/Setup.gs).
   * Klik tombol **+** di sebelah *Files* > pilih **HTML** > beri nama `WebApp.html`. Tempel kode dari file [`WebApp.html`](file:///J:/Aplikasi/family-finance-template/WebApp.html).
   * *(Opsional)*: Klik ikon roda gigi ⚙️ (*Project Settings*) di panel kiri > centang *"Show 'appsscript.json' manifest file in editor"*. Buka `appsscript.json` dan pastikan isinya sama dengan [`appsscript.json`](file:///J:/Aplikasi/family-finance-template/appsscript.json).
3. Klik tombol **Simpan** (ikon disket 💾 atau `Ctrl + S`).

### C. Jalankan Setup Otomatis Template
1. Kembali ke tab Google Sheets, lalu lakukan **Refresh halaman (F5)**.
2. Tunggu beberapa detik hingga muncul menu baru di toolbar atas:  
   **`[ Family Finance Tracker ]`**
3. Klik menu **Family Finance Tracker** > pilih **Jalankan Setup / Reset Template**.
4. Saat pertama kali dijalankan, Google akan memunculkan popup *"Authorization Required"* (Izin Diperlukan):
   * Klik **Lanjutkan / Continue**.
   * Pilih akun Google Anda.
   * Klik **Advanced (Lanjutan)** > Klik **Go to Family Finance Tracker (unsafe)**.
   * Klik **Allow / Izinkan**.
5. Sheet akan otomatis memformat 4 tab utama bertema *Sage Green*:
   * **`CONFIG`**: Pengaturan nama panggilan pasangan (Ayah/Bunda), tanggal gajian, daftar kategori, dompet, dan preset cepat.
   * **`TRANSAKSI`**: Lembar pencatatan mutasi kas dengan 1 baris saldo awal bersih.
   * **`BUDGET & POS`**: Alokasi anggaran bulanan dengan progress bar otomatis.
   * **`DASHBOARD`**: Kartu ringkasan finansial keluarga.

---

## 3. Langkah Deploy Web App (Untuk Akses HP)

Agar antarmuka web app bisa dibuka dari smartphone:

1. Di halaman Apps Script master Anda, klik tombol biru **Deploy** (Terapkan) di kanan atas > pilih **New deployment** (Penerapan baru).
2. Klik tombol gerigi di samping *Select type* > pilih **Web app**.
3. Atur konfigurasi:
   * **Description**: `Family Finance Tracker v1.0`
   * **Execute as**: `User accessing the web app` *(Sangat penting: agar sistem otomatis mendeteksi email Google suami atau istri yang sedang mencatat)*
   * **Who has access**: `Anyone` *(atau `Anyone with Google account`)*
4. Klik **Deploy**.
5. Salin **Web app URL** yang muncul (simpan URL ini).

---

## 4. Trik URL Sakti `/copy` untuk Pengiriman Otomatis ke Pembeli

Saat menjual di platform digital seperti **Lynk.id, Mayar, Gumroad, Shopee, atau pesan otomatis WhatsApp**:

1. Di Google Sheets Master Anda, klik tombol **Bagikan (Share)** di pojok kanan atas.
2. Pada bagian *Akses Umum (General Access)*, ubah dari *Dibatasi (Restricted)* menjadi:  
   **"Siapa saja yang memiliki link" -> "Pelihat" (*Anyone with the link -> Viewer*)**.
3. Klik **Salin link** (*Copy link*). Format aslinya adalah:
   ```text
   https://docs.google.com/spreadsheets/d/1wC4EQjbDMF_lolij68y_Qpe4XtRfJDrbEic9TMOR1bMuJ2QoCD1ql0Lr/edit?usp=sharing
   ```
4. Ganti bagian akhir `/edit?usp=sharing` menjadi **/copy**.  
   Contoh link yang diberikan ke pembeli:
   ```text
   https://docs.google.com/spreadsheets/d/1wC4EQjbDMF_lolij68y_Qpe4XtRfJDrbEic9TMOR1bMuJ2QoCD1ql0Lr/copy
   ```
5. **Keajaiban Link `/copy`**:  
   Ketika pembeli mengklik link tersebut, Google Sheets akan langsung menampilkan tombol besar:  
   **"Buat salinan dokumen" (*Make a copy*)**.  
   Seluruh rumus, format desain, dan skrip Apps Script otomatis tersalin ke Google Drive pembeli dalam 1 detik tanpa bisa merusak master template milik Anda!

---

## 5. Panduan untuk Pembeli (Cara Mengundang Pasangan & Pasang di HP)

Sertakan panduan singkat ini di halaman terima kasih (*thank you page*) atau PDF panduan pembeli:

### Langkah A: Mengundang Pasangan
1. Buka spreadsheet hasil salinan di Google Drive Anda.
2. Buka tab **`CONFIG`**:
   - Kolom B baris 2: Masukkan panggilan Suami (misal: *Ayah / Papa*).
   - Kolom B baris 3: Masukkan email Google Suami.
   - Kolom B baris 4: Masukkan panggilan Istri (misal: *Bunda / Mama*).
   - Kolom B baris 5: Masukkan email Google Istri.
   - Kolom B baris 7: Tentukan siapa Akun Master (*Suami* atau *Istri*).
3. Klik tombol **Bagikan (Share)** di pojok kanan atas spreadsheet.
4. Masukkan email Google pasangan Anda dan berikan hak akses sebagai **Editor**, lalu klik Kirim.

### Langkah B: Membuka Web App di Smartphone
1. Di spreadsheet, buka menu **Ekstensi > Apps Script**.
2. Klik **Deploy > New deployment > Web app**.
3. Pastikan *Execute as* disetel ke *User accessing the web app*, lalu klik **Deploy**.
4. Salin URL Web App dan kirimkan ke WhatsApp pasangan Anda.

### Langkah C: Pasang di Layar Utama HP (*Add to Home Screen*)
* **iPhone (Safari)**: Buka link web app di Safari > Tap ikon **Bagikan (Share / kotak panah ke atas)** di bawah layar > Pilih **Tambahkan ke Layar Utama (Add to Home Screen)**.
* **Android (Chrome)**: Buka link web app di Chrome > Tap **menu titik tiga** di kanan atas > Pilih **Tambahkan ke Layar Utama / Install Aplikasi**.

Aplikasi kini siap digunakan seperti aplikasi native langsung dari homescreen HP!

---

## 6. Cara Menggunakan `preview.html` untuk Marketing & Penjualan

File [`preview.html`](file:///J:/Aplikasi/family-finance-template/preview.html) adalah aset penjualan yang sangat berharga.

1. **Uji Coba Langsung di Laptop**:
   - Buka file `preview.html` dengan klik ganda di browser Anda.
   - Calon pembeli dapat mencoba beralih peran antara **Login Ayah (Master)** dan **Login Bunda (Diundang)**.
   - Mencoba simulasi pencatatan transaksi, transfer dana, preset 1-klik, dan melihat perubahan spreadsheet secara live di panel kanan.
2. **Hosting Gratis untuk Demo Calon Pembeli**:
   - Anda dapat mengunggah file `preview.html` dan `WebApp.html` ke hosting statis gratis seperti:
     - **GitHub Pages**
     - **Vercel**
     - **Netlify**
   - Berikan tautan demo tersebut di profil bio Instagram, TikTok, atau halaman penjualan Lynk.id/Gumroad Anda agar calon pembeli bisa mencoba sebelum membeli.

---

## 7. Template Teks Copywriting Penjualan (Tinggal Salin)

Anda bisa menyalin teks promosi ini untuk deskripsi produk di Lynk.id, Mayar, Shopee, atau caption media sosial:

> **Judul Produk:**  
> Family Finance Tracker — Template Kas Rumah Tangga Kolaboratif Pasangan (Google Sheets + Web App)
>
> **Deskripsi:**  
> Sering bingung memisahkan antara uang belanja dapur, cicilan keluarga, dan uang jajan pribadi masing-masing? Atau bosan pakai aplikasi keuangan yang harus langganan bulanan mahal?
>
> Kenalkan **Family Finance Tracker**, solusi pencatatan keuangan rumah tangga berbasis Google Sheets & Web App yang dirancang khusus untuk pasangan suami-istri modern.
>
> **Fitur Unggulan:**  
> ✅ **Akses Kolaboratif Suami-Istri**: Akun Master mengatur pos anggaran, pasangan bisa input transaksi bersama secara realtime.  
> ✅ **Tampilan Web App Elegan di HP**: Navigasi bawah ramah jempol (*Thumb-Friendly*), tanpa perlu instal aplikasi berat dari Play Store/App Store.  
> ✅ **Model Hybrid (Bersama vs Pribadi)**: Jelas membedakan beban Kas Bersama dan kantong pribadi masing-masing.  
> ✅ **Saldo Realtime per Rekening**: Pantau sisa uang di rekening BCA bersama, dompet tunai rumah, hingga GoPay/ShopeePay.  
> ✅ **Fitur Transfer Saldo**: Setor uang belanja bulanan dari rekening suami ke kas bersama otomatis mengalirkan saldo.  
> ✅ **Tombol Cepat 1-Klik**: Catat bensin, belanja sayur, atau token listrik dalam 1 ketukan.  
> ✅ **Tutup Buku & Arsip Tahunan**: Sheet tetap ringan bertahun-tahun tanpa lemot.  
> ✅ **100% Sekali Beli, Milik Anda Selamanya**: Data tersimpan aman di Google Drive pribadi Anda.
>
> 📦 **Yang Anda Dapatkan:**  
> - Link Akses Google Sheets Master Siap Duplikasi (Sekali Klik)  
> - Kode Web App Mobile Terintegrasi  
> - Video & Dokumen Panduan Pemasangan Lengkap (Mudah dipahami pemula)
