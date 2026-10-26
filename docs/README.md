# Indeks Dokumentasi Penjualan & Operasional
## Family Finance Tracker — Couple & Family Edition

Dokumen ini merupakan panduan katalog dokumentasi komersial dan operasional produk Family Finance Tracker versi 1.2.0. Seluruh dokumen telah diselaraskan dengan standar tata letak resmi dan disesuaikan untuk konteks **produk yang baru selesai dibangun/dikembangkan (*fresh build*) dan sedang bersiap untuk tahap verifikasi mutu internal (QA) serta pengujian pasangan pengguna asli (*User Acceptance Testing / UAT*)**.

---

## Matriks Dokumentasi Produk

| No. | Dokumen | Fungsi | Format Target | PIC | Lokasi Berkas |
|---|---|---|---|---|---|
| 1 | **Product Brief & Requirements** | Menjelaskan target pengguna, tujuan produk, fitur, dan batasannya | Google Docs | Operations | Berkas Word / Docs (.docx): [`docs/01_PRODUCT_BRIEF_AND_REQUIREMENTS.docx`](file:///J:/Aplikasi/family-finance-template/docs/01_PRODUCT_BRIEF_AND_REQUIREMENTS.docx)<br>Markdown: [`docs/01_PRODUCT_BRIEF_AND_REQUIREMENTS.md`](file:///J:/Aplikasi/family-finance-template/docs/01_PRODUCT_BRIEF_AND_REQUIREMENTS.md) |
| 2a | **Panduan & SOP Pengujian Produk** | Petunjuk teknis prosedur pengujian langkah demi langkah | Google Docs / PDF | Finance + Operations | Berkas Word / Docs (.docx): [`docs/02_PANDUAN_PENGUJIAN_PRODUK.docx`](file:///J:/Aplikasi/family-finance-template/docs/02_PANDUAN_PENGUJIAN_PRODUK.docx)<br>Markdown: [`docs/02_PANDUAN_PENGUJIAN_PRODUK.md`](file:///J:/Aplikasi/family-finance-template/docs/02_PANDUAN_PENGUJIAN_PRODUK.md) |
| 2b | **Product Testing Checklist (Blank Template)** | Lembar kerja kosong untuk verifikasi rumus & fungsi fitur | Google Sheets | Finance + Operations | Workbook 2 Tab (.xlsx): [`docs/02_PRODUCT_TESTING_CHECKLIST.xlsx`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.xlsx)<br>Spesifikasi (.md): [`docs/02_PRODUCT_TESTING_CHECKLIST.md`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.md)<br>CSV Tab 1: [`docs/02_PRODUCT_TESTING_CHECKLIST_TAB1_DASHBOARD.csv`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST_TAB1_DASHBOARD.csv)<br>CSV Tab 2: [`docs/02_PRODUCT_TESTING_CHECKLIST_TAB2_MATRIKS.csv`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST_TAB2_MATRIKS.csv)<br>CSV Ringkas: [`docs/02_PRODUCT_TESTING_CHECKLIST.csv`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.csv) |
| 3 | **User Guide** | Panduan penggunaan untuk pembeli | PDF | Operations | Berkas Word / Docs (.docx): [`docs/03_USER_GUIDE.docx`](file:///J:/Aplikasi/family-finance-template/docs/03_USER_GUIDE.docx)<br>Markdown: [`docs/03_USER_GUIDE.md`](file:///J:/Aplikasi/family-finance-template/docs/03_USER_GUIDE.md) |
| 4 | **License & Terms of Use** | Mengatur hak penggunaan, distribusi, dan ketentuan pembelian | PDF | Operations + Finance | Berkas Word / Docs (.docx): [`docs/04_LICENSE_AND_TERMS_OF_USE.docx`](file:///J:/Aplikasi/family-finance-template/docs/04_LICENSE_AND_TERMS_OF_USE.docx)<br>Markdown: [`docs/04_LICENSE_AND_TERMS_OF_USE.md`](file:///J:/Aplikasi/family-finance-template/docs/04_LICENSE_AND_TERMS_OF_USE.md) |

---

## Petunjuk Penggunaan Format Berkas

### 1. Dokumen 1: Product Brief & Requirements (Format: Google Docs)
- **Format Sumber**: Markdown berstruktur dokumen formal dengan tabel metadata kontrol dokumen, hirarki judul standar Google Docs (*Title, Subtitle, Heading 1, Heading 2, Heading 3*), tabel komparasi masalah & solusi, diagram roadmap tahapan rilis, dan tabel persetujuan kesiapan uji.
- **Cara Penggunaan**:
  1. Buka [docs.new](https://docs.new) pada peramban Google Chrome.
  2. Buka berkas `01_PRODUCT_BRIEF_AND_REQUIREMENTS.md`, salin seluruh isi teks.
  3. Tempel (*paste*) ke dalam Google Docs. Struktur tabel, poin, dan penomoran akan langsung terformat rapi.
  4. Simpan di folder Google Drive internal divisi Operations.

### 2. Dokumen 2a: Panduan & SOP Pengujian Produk (Format: Google Docs / PDF)
- **Format Sumber**: [`02_PANDUAN_PENGUJIAN_PRODUK.md`](file:///J:/Aplikasi/family-finance-template/docs/02_PANDUAN_PENGUJIAN_PRODUK.md)
- **Fungsi**: Berisi instruksi kerja terperinci untuk 26 skenario pengujian, klasifikasi tingkat keparahan bug (*severity*), data input prekondisi, dan kriteria ambang batas kelulusan rilis (*release gate criteria*).

### 3. Dokumen 2b: Lembar Kerja Pengujian Produk Kosong (Format: Google Sheets)
- **Format Sumber**:
  - **Workbook 2-Sheet Asli (.xlsx)**: [`02_PRODUCT_TESTING_CHECKLIST.xlsx`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.xlsx) yang memuat tab `DASHBOARD_UJI` dan `MATRIKS_UJI` kosong siap pakai dengan formula dinamis.
  - **Berkas CSV Terpisah Per-Sheet**:
    - [`02_PRODUCT_TESTING_CHECKLIST_TAB1_DASHBOARD.csv`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST_TAB1_DASHBOARD.csv)
    - [`02_PRODUCT_TESTING_CHECKLIST_TAB2_MATRIKS.csv`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST_TAB2_MATRIKS.csv)
  - **Berkas CSV Kompilasi Ringkas**: [`02_PRODUCT_TESTING_CHECKLIST.csv`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.csv)
  - **Spesifikasi Lembar Uji Lengkap**: [`02_PRODUCT_TESTING_CHECKLIST.md`](file:///J:/Aplikasi/family-finance-template/docs/02_PRODUCT_TESTING_CHECKLIST.md)
- **Cara Penggunaan**:
  - **Opsi Utama (Rekomendasi)**: Buka Google Sheets > `File` > `Open` > `Upload` > pilih berkas `02_PRODUCT_TESTING_CHECKLIST.xlsx`. Lembar kerja kosong siap diisi hasil uji riil oleh tim Finance & Operations.
  - **Opsi Multi-Sheet CSV**: Buka Google Sheets > buat spreadsheet baru > beri nama `02_PRODUCT_TESTING_CHECKLIST` > buat 2 tab bernama `DASHBOARD_UJI` dan `MATRIKS_UJI` > impor masing-masing berkas CSV terkait via `File > Import > Upload`.
  - **Opsi CSV Ringkas**: Impor langsung berkas `02_PRODUCT_TESTING_CHECKLIST.csv` ke sheet utama.

### 4. Dokumen 3: User Guide (Format: PDF)
- **Format Sumber**: [`03_USER_GUIDE.md`](file:///J:/Aplikasi/family-finance-template/docs/03_USER_GUIDE.md) berstandar cetak PDF (*Print & PDF Ready*) dengan alokasi tepat 4 halaman, pembatas halaman fisik (*Page Break markers*), spesifikasi rasio tangkapan layar, dan header/footer dokumen.
- **Cara Penggunaan**:
  1. Buka berkas `03_USER_GUIDE.md` menggunakan editor Markdown atau konversikan melalui fitur cetak peramban / ekstensi PDF.
  2. Pastikan pemisah halaman aktif pada penanda `[BATAS HALAMAN / PAGE BREAK]`.
  3. Sisipkan tangkapan layar antarmuka asli pada kotak placeholder yang telah disediakan.
  4. Ekspor menjadi berkas `Family_Finance_Tracker_User_Guide_v1.2.0.pdf` untuk disertakan dalam surel konfirmasi pembelian atau paket unduhan pembeli.

### 5. Dokumen 4: License & Terms of Use (Format: PDF)
- **Format Sumber**: [`04_LICENSE_AND_TERMS_OF_USE.md`](file:///J:/Aplikasi/family-finance-template/docs/04_LICENSE_AND_TERMS_OF_USE.md) dokumen hukum legal dengan pembagian pasal formal (Pasal 1 s/d Pasal 7), klausul lisensi 1 rumah tangga (*Single Household License*), ketentuan pengembalian dana, dan kotak pengesahan lisensi.
- **Cara Penggunaan**:
  1. Buka berkas `04_LICENSE_AND_TERMS_OF_USE.md`.
  2. Lakukan pratinjau cetak (*Print Preview*) ke ukuran kertas A4 (tepat 2 halaman).
  3. Ekspor menjadi berkas `Family_Finance_Tracker_License_and_Terms_v1.2.0.pdf`.
  4. Sertakan berkas PDF ini di dalam paket serah terima pembeli di Lynk.id / Mayar / Gumroad.

---

## Ketersediaan Berkas Dokumen Word / Google Docs (.docx)

Untuk memudahkan pembacaan langsung di komputer, ponsel, Microsoft Word, Google Docs, maupun WPS Office tanpa perlu mengonversi dari Markdown, seluruh dokumen naratif telah digenerate dalam format `.docx` siap pakai dengan tata letak visual rapi dan palet warna Sage Green:

1. **Product Brief & Requirements**: [`docs/01_PRODUCT_BRIEF_AND_REQUIREMENTS.docx`](file:///J:/Aplikasi/family-finance-template/docs/01_PRODUCT_BRIEF_AND_REQUIREMENTS.docx)
2. **Panduan & SOP Pengujian Produk**: [`docs/02_PANDUAN_PENGUJIAN_PRODUK.docx`](file:///J:/Aplikasi/family-finance-template/docs/02_PANDUAN_PENGUJIAN_PRODUK.docx)
3. **User Guide (Panduan Pengguna)**: [`docs/03_USER_GUIDE.docx`](file:///J:/Aplikasi/family-finance-template/docs/03_USER_GUIDE.docx)
4. **License & Terms of Use**: [`docs/04_LICENSE_AND_TERMS_OF_USE.docx`](file:///J:/Aplikasi/family-finance-template/docs/04_LICENSE_AND_TERMS_OF_USE.docx)

*Berkas `.docx` dapat langsung dibuka dengan Microsoft Word atau diunggah (drag & drop) ke Google Drive untuk dibuka secara langsung dengan Google Docs.*
