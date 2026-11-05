# 05 - Laporan Bug QC & Catatan Perbaikan (Pra-Komersial)

**Produk:** Family Finance Tracker - Google Sheets + Apps Script PWA
**Tanggal pengujian:** 2026-11-05
**Penguji:** QC / Pre-Commercial Audit (otomatis + verifikasi browser)
**Status akhir:** **LULUS QC** - 35/35 temuan otomatis diperbaiki, siap lanjut ke UAT pilot couples.

---

## 1. Ruang Lingkup & Metode

Pengujian mencakup **dua sisi** produk sebagaimana diminta:

| Sisi | Objek | Metode |
|---|---|---|
| **Produk asli** | `Code.gs`, `Setup.gs`, `appsscript.json` (backend Apps Script) | Sandbox mock Apps Script (`tests/qc-audit.js`) - RBAC, validasi, arsip, formula |
| **Produk demo** | `WebApp.html`, `preview.html`, `demo/*` (frontend statis) | Extractor fungsi + verifikasi interaktif di browser (`test-runner.html`, `preview.html`) |

**Suite:** `tests/qc-audit.js` (28 modul/temuan) digabung dengan `tests/validate.js` (suite lama) lewat `npm test`.

### 1.1 Kondisi AWAL (sebelum perbaikan)

Dijalankan terhadap kode versi committed (`git stash` ke `HEAD`) untuk memperoleh baseline yang reproducible:

```
HASIL QC: 7 LULUS, 28 GAGAL
Status: DITAHAN (HOLD) - belum layak komersial.
```

> Catatan: hasil awal saat audit pertama kali adalah **10 LULUS / 25 GAGAL**. Selisihnya karena
> 3 test kemudian **diperkuat** agar tidak bisa lulus karena alasan yang salah:
> `QC-RBAC-06` (dulu lulus karena "tidak ada data 2025", bukan karena RBAC),
> `QC-SCOPE-04` (dulu tidak mengekstrak `deriveScopeFromWallet`),
> `QC-ARCH-02` (baseline `HEAD` ternyata memanggil `loadConfigData` yang **tidak terdefinisi** - lihat QC-ARCH-03).

### 1.2 Kondisi AKHIR (sesudah perbaikan)

```
npm test
  -> tests/validate.js : lulus (tanpa regresi)
  -> tests/qc-audit.js : HASIL QC: 35 LULUS, 0 GAGAL
Status: SELURUH TEMUAN QA LULUS - siap lanjut ke UAT pilot couples.
```

Verifikasi browser (tanpa error console):

| Halaman | URL | Console error |
|---|---|---|
| Test harness | `http://127.0.0.1:8899/test-runner.html` | 0 |
| Preview produk | `http://127.0.0.1:8899/preview.html` | 0 |

---

## 2. Ringkasan Temuan

| Severity | Jumlah | ID |
|---|---|---|
| **Critical** | 6 | QC-RBAC-01, QC-RBAC-02, QC-RBAC-05, QC-RBAC-06, QC-ARCH-01, QC-DASH-01 |
| **High** | 8 | QC-RBAC-07, QC-SCOPE-01, QC-SCOPE-02, QC-SCOPE-03, QC-SCOPE-06, QC-VAL-04, QC-SEC-03, QC-ARCH-03 |
| **Medium** | 9 | QC-SCOPE-04, QC-VAL-01, QC-VAL-02, QC-VAL-03, QC-ID-01, QC-XSS-01, QC-SYNC-01, QC-SYNC-02, QC-PRESET-01 |
| **Low** | 6 | QC-SCOPE-05, QC-SYNC-03, QC-PRESET-02, QC-PRESET-03, QC-DOC-01, QC-SEC-04 |
| **Total** | **29** | 28 dari suite + 1 temuan audit git (QC-SEC-04) |

Skala severity mengikuti `docs/02_PANDUAN_PENGUJIAN_PRODUK.md` bagian 4.

---

## 3. Detail Temuan & Perbaikan

### 3.1 Modul RBAC / Otorisasi (AKUN MASTER vs ANGGOTA DIUNDANG)

#### QC-RBAC-01 - Critical - `Code.gs` `getInitialData()`

- **Bukti (awal):** `isMaster=true untuk spouse@x.com (RBAC bocor: semua pengguna jadi Master)`
- **Penyebab:** Penanda Master memakai kondisi `cleanActive === cleanEff` (`getActiveUser()` vs `getEffectiveUser()`). Pada deployment `Execute as: User accessing the web app` **keduanya selalu sama**, sehingga kondisi ini benar untuk **semua** pengguna -> setiap anggota diundang menjadi Master dan bisa mengubah konfigurasi.
- **Perbaikan:** Penanda Master ditulis ulang *fail-closed*:
  `Master = email pada CONFIG!B6` **ATAU** `pemilik spreadsheet` (`ss.getOwner().getEmail()`).
  Helper baru: `getSpreadsheetOwnerEmail_(ss)` dan `isMasterAccess_(ss, configSheet, activeEmailRaw)`.
  `Session.getEffectiveUser()` **tidak lagi dipakai** sebagai penanda hak akses.
- **TC terkait:** seluruh modul RBAC (TC-CPY-01 s/d TC-CPY-07).

#### QC-RBAC-02 - Critical - `Code.gs` `getInitialData()`

- **Bukti (awal):** `isMaster=true untuk pengguna anonim`
- **Penyebab:** Cabang `if (!cleanActive) { isMaster = true; }` diperlakukan sebagai "mode demo lokal", padahal pada produksi berarti pengguna **tanpa identitas**.
- **Perbaikan:** Email kosong -> **bukan** Master (fail-closed). Mode demo lokal ditangani di sisi UI, bukan dengan memberi hak Master.
- **TC terkait:** TC-CPY-01.

#### QC-RBAC-05 - Critical - `Code.gs` `saveConfigData()`

- **Bukti (awal):** `saveConfigData berhasil untuk non-master: {"success":true,...}`
- **Penyebab:** Guard `if (activeEmail && activeEmail !== effEmail && activeEmail !== currentMaster)` tidak pernah aktif pada mode `USER_ACCESSING` (karena `activeEmail === effEmail` selalu).
- **Perbaikan:** Guard diganti `isMasterAccess_(...)`; non-master menerima `{success:false}` dan CONFIG B6 tidak berubah.
- **TC terkait:** TC-CPY-02.

#### QC-RBAC-06 - Critical - `Code.gs` `closeAndArchiveYear()`

- **Bukti (awal, setelah test diperkuat):** `Tab ARSIP_2025 dibuat oleh non-master`
- **Penyebab:** Guard RBAC memakai pola `activeEmail !== effEmail` yang sama -> tidak pernah aktif, sehingga **anggota diundang bisa menjalankan tutup buku** (menulis ARSIP dan menimpa TRANSAKSI).
- **Perbaikan:** Guard diganti `isMasterAccess_`. Test kini menyediakan baris transaksi 2025 agar penolakan **hanya** bisa berasal dari pemeriksaan hak akses, bukan dari "tidak ada data".
- **TC terkait:** TC-BAL-05.

#### QC-RBAC-07 - High - `Code.gs` `saveAccountSettings()`

- **Bukti (awal):** `saveAccountSettings diterima untuk pengguna tanpa email`
- **Perbaikan:** Guard yang sama diganti `isMasterAccess_` (email kosong -> ditolak).
- **TC terkait:** TC-CPY-03.

#### QC-ARCH-03 - High - `Code.gs` `closeAndArchiveYear()` (temuan versi committed)

- **Bukti:** `git grep -n "function loadConfigData" HEAD -- "*.gs"` -> **tidak ada hasil**, sedangkan `HEAD:Code.gs:589` memanggil `loadConfigData(ss)`. Pada deployment, tutup buku akan selalu gagal: `ReferenceError: loadConfigData is not defined`.
- **Perbaikan:** Fungsi `loadConfigData(ss)` kini ada di `Code.gs` (baris 474) dan sudah teruji `QC-ARCH-02`.
  **Tindak lanjut:** pastikan perubahan `Code.gs` ini ikut ter-commit & ter-push (lihat §5).

---

### 3.2 Modul Peruntukan / Scope (MODEL HYBRID)

> `docs/03_USER_GUIDE.md` baris 134-146 mendokumentasikan field **Peruntukan** pada form input.
> Pada kondisi awal field itu **tidak ada sama sekali** di aplikasi.

#### QC-SCOPE-01 - High - `WebApp.html` form input

- **Bukti (awal):** `elemen id="scopeSelect" tidak ada di WebApp.html`
- **Perbaikan:** Blok `#colScope` + `<select id="scopeSelect">` (opsi `Kas Bersama` / `Pribadi Suami` / `Pribadi Istri`) + `#scopeHint` ditambahkan setelah `#colWallet`.
- **TC terkait:** TC-INP-03.

#### QC-SCOPE-02 - High - `WebApp.html` `resolveResolvedScope()`

- **Bukti (awal):** `mengembalikan "Kas Bersama"` untuk dompet `BCA Pribadi Suami [Suami]` (dibuktikan juga di browser: `functionIgnoresWallet: true`).
- **Penyebab:** `resolveResolvedScope()` hanya `return 'Kas Bersama'` - **mengabaikan total kepemilikan dompet**, sehingga seluruh belanja pribadi tercatat sebagai Kas Bersama dan KPI "Ringkasan Peruntukan Pasangan" meleset.
- **Perbaikan:** Fungsi baru `deriveScopeFromWallet(walletValue)` membaca suffix `[Suami]` / `[Istri]` / `[Kas Bersama]` dari nama dompet; `resolveResolvedScope()` memakainya sebagai default.
- **TC terkait:** TC-INP-03, TC-SUM-02.

#### QC-SCOPE-03 - High - `WebApp.html` `resolveResolvedScope()`

- **Bukti (awal):** pemilihan manual diabaikan -> selalu `"Kas Bersama"`.
- **Perbaikan:** Pilihan user pada `#scopeSelect` **dihormati lebih dulu**; hanya jika kosong baru di-derive dari dompet.
- **TC terkait:** TC-INP-03.

#### QC-SCOPE-04 - Medium - `WebApp.html` `resolveResolvedScope()`

- **Bukti (awal):** `fungsi deriveScopeFromWallet tidak ditemukan` (rantai dependensi belum ada).
- **Perbaikan:** Transfer selalu `'Transfer'`, Pemasukan selalu `'Kas Bersama'`; rantai `deriveScopeFromWallet` diekstrak dan diuji bersama.
- **TC terkait:** TC-INP-04.

#### QC-SCOPE-05 - Low - `WebApp.html` `updateDynamicUI()`

- **Bukti (awal):** `updateDynamicUI tidak mengelola visibilitas colScope`.
- **Perbaikan:** `#colScope` ditampilkan hanya untuk tipe **Pengeluaran**; disembunyikan untuk Pemasukan & Transfer (field tidak relevan -> anti-bingung).
- **TC terkait:** TC-INP-04.

#### QC-SCOPE-06 - High - `Code.gs` `getPeriodSummary()` & `WebApp.html` `fetchCustomPeriodSummary()`

- **Bukti (awal):** `operasional lokal masih memakai totalExpense lintas scope (pribadi ikut terhitung)`.
- **Penyebab:** `operasionalBersama = Math.max(0, totalExpense - uangSakuAyah - uangSakuBunda)` - `totalExpense` mencakup seluruh scope, jadi belanja pribadi ikut terhitung ke pos "Operasional Rumah Tangga Bersama".
- **Perbaikan:** `operasionalBersama = Math.max(0, (byScope['Kas Bersama'] || 0) - uangSakuAyah - uangSakuBunda)` di **kedua** sisi (server `getPeriodSummary` dan fallback lokal `fetchCustomPeriodSummary`/`renderCycleData`).
- **TC terkait:** TC-SUM-02.

---

### 3.3 Modul Integritas Formula DASHBOARD

#### QC-DASH-01 - Critical - `Code.gs` `getInitialData()`

- **Bukti (awal):** `formula DASHBOARD ditimpa: setValue@A6, setValue@C6, setValue@E6, setValue@G6 -> nilai statis siklus gajian menggantikan formula bulanan =A6-E6`
- **Penyebab:** Setiap kali aplikasi dibuka, `getInitialData()` menulis **nilai statis** ke `DASHBOARD!A6/C6/E6/G6`, mematikan formula siklus gajian dan SUMIFS yang dibuat `Setup.gs` (TC-BAL-04 & TC-SUM-01 gagal total).
- **Perbaikan:** Seluruh blok tulis ke DASHBOARD **dihapus**; ringkasan dikirim ke UI lewat objek `summary` pada hasil `getInitialData()`.
- **TC terkait:** TC-BAL-04, TC-SUM-01, TC-DSH-01.

---

### 3.4 Modul Sinkronisasi Server -> UI

#### QC-SYNC-01 - Medium - `WebApp.html` `fetchServerData()`

- **Bukti (awal):** `appData.incomeCategories tidak pernah diisi dari data server` -> kustomisasi kategori pemasukan di CONFIG tidak pernah sampai ke UI (terus memakai nilai lokal/demo).
- **Perbaikan:** `if (data.incomeCategories && data.incomeCategories.length) appData.incomeCategories = data.incomeCategories;`
- **TC terkait:** TC-INP-02, TC-CPY-04.

#### QC-SYNC-02 - Medium - `WebApp.html` `fetchServerData()`

- **Bukti (awal):** `appData.pendingArchive tidak pernah diisi -> boxPendingArchiveAlert tidak pernah muncul`. Elemen peringatan tutup buku ada di HTML tapi **tidak pernah terisi**.
- **Perbaikan:** `appData.pendingArchive` kini diisi dari server + fungsi baru `renderPendingArchiveAlert()` dipanggil saat sinkron dan saat render halaman Akun (bukti browser: `pendingText = "Ditemukan transaksi tahun 2025 yang belum ditutup buku."`).
- **TC terkait:** TC-BAL-05.

#### QC-SYNC-03 - Low - `WebApp.html` `fetchServerData()`

- **Bukti (awal):** `appData.defaultPresets tidak pernah diisi dari server`.
- **Perbaikan:** `appData.defaultPresets` diisi dari `data.defaultPresets` (mode preset manual kini mengikuti CONFIG).
- **TC terkait:** TC-INP-05.

---

### 3.5 Modul Tombol Cepat / Preset (TC-INP-05)

#### QC-PRESET-01 - Medium - `Code.gs` + `Setup.gs`

- **Bukti (awal):** `preset tanpa kategori: {"name":"Token Listrik","amount":100000} -> field Kategori tidak terisi otomatis`. Satu ketukan preset hanya mengisi nominal & catatan; **Kategori harus dipilih manual** (bertentangan dengan User Guide baris 146: "seluruh kolom otomatis terisi").
- **Perbaikan:**
  - `Setup.gs`: header CONFIG diperluas ke kolom **J "KATEGORI TOMBOL"** + nilai kategori untuk 6 preset (`getRange` 9 -> 10 kolom, `setColumnWidth(10)`).
  - `Code.gs`: deteksi `colPresetCat` dari header + pembacaan nilai kategori preset.
- **TC terkait:** TC-INP-05.

#### QC-PRESET-02 - Low - `Code.gs` `enrichPresetCategories_()`

- **Bukti (awal):** `kategori preset tidak tersinfer dari riwayat` (sheet lama tanpa kolom J).
- **Perbaikan:** Helper baru `enrichPresetCategories_(presets, transactions)` melengkapi kategori preset dari riwayat transaksi berlabel sama (kompatibilitas mundur untuk template versi lama).
- **TC terkait:** TC-INP-05.

#### QC-PRESET-03 - Low - `WebApp.html` `renderPresets()`

- **Bukti (awal):** `renderPresets menjejalkan kategori Lain-lain palsu ke field Kategori` (`p.category || 'Lain-lain'`).
- **Perbaikan:** `category: (p.category || '').toString().trim()` dan `scope: p.scope || ''` - tidak ada kategori karangan; `applyPreset()` hanya menulis kategori bila preset benar-benar membawanya.
- **TC terkait:** TC-INP-05.

---

### 3.6 Modul Keamanan Data Tutup Buku

#### QC-ARCH-01 - Critical - `Code.gs` `closeAndArchiveYear()`

- **Bukti (awal):** `TRANSAKSI sudah diubah (clearContent) sebelum proses selesai -> data tahun berjalan berisiko hilang`
- **Penyebab:** Urutan lama = arsipkan -> **`clearContent()` TRANSAKSI** -> `loadConfigData()` & hitung saldo -> tulis baris baru. Bila terjadi error di tengah (mis. CONFIG tidak terbaca), TRANSAKSI sudah kosong sementara ARSIP belum/bagal -> **kehilangan data**.
- **Perbaikan:** Urutan dirombak total menjadi 3 tahap tanpa pernah ada keadaan kosong:
  1. **HITUNG DULU** (baca semua data, hitung saldo per dompet, susun baris ARSIP & baris saldo awal di memori) - belum menyentuh TRANSAKSI.
  2. **TULIS ARSIP** (`ARSIP_<tahun>`).
  3. **TIMPA TRANSAKSI + bersihkan ekor** (hanya bila ARSIP lengkap).
- **TC terkait:** TC-BAL-05.

#### QC-ARCH-02 - Critical - `Code.gs` `closeAndArchiveYear()` (uji jalur sukses)

- **Bukti (awal):** gagal/hasil tidak lengkap. Kini:
  - `ARSIP_2025` berisi `TRX-A` & `TRX-B`,
  - `TRANSAKSI` tidak lagi berisi `TRX-A`, **masih** berisi `TRX-C` (2026 tidak ikut terhapus),
  - baris saldo awal `TRX-INIT-...-2026` dibuat.
- **TC terkait:** TC-BAL-05.

---

### 3.7 Modul Validasi Input Server-Side (TC-VAL-01..04)

#### QC-VAL-01, QC-VAL-02, QC-VAL-03 - Medium - `Code.gs` `validateTransactionPayload_()`

- **Bukti (awal):** `nominal 0 diterima server`, `nominal negatif diterima server`, `nominal non-numerik diterima server`.
- **Penyebab:** `Number(payload.amount) || 0` tanpa pemeriksaan -> data rusak tersimpan langsung ke spreadsheet (server adalah otoritas terakhir, UI hanya lapisan kenyamanan).
- **Perbaikan:** Helper baru `validateTransactionPayload_(payload)` menolak: `amount <= 0`, `NaN/Infinity`, tipe di luar whitelist `['Pengeluaran','Pemasukan','Transfer']`, kategori/dompet kosong (non-Transfer), dan tanggal invalid. Dipakai di `submitTransaction()` **dan** `updateTransaction()` (payload edit dilengkapi dari baris lama sebelum divalidasi).
- **TC terkait:** TC-VAL-01, TC-VAL-02.

#### QC-VAL-04 - High - `Code.gs` `validateTransactionPayload_()`

- **Bukti (awal):** `tanggal tidak valid diterima server: {"success":true,"trxId":"TRX-095860",...}` (`date: '2026-13-45'`).
- **Perbaikan:** `isNaN(new Date(rawDate).getTime())` -> ditolak.
- **TC terkait:** TC-VAL-03.

---

### 3.8 Modul Unik ID Transaksi

#### QC-ID-01 - Medium - `Code.gs` `generateTrxId()`

- **Bukti (awal):** `helper generateTrxId tidak ada di Code.gs (ID masih dibuat inline dari 6 digit timestamp -> rentan tabrakan)`.
- **Penyebab:** `'TRX-' + new Date().getTime().toString().slice(-6)` -> dua transaksi pada detik sama menghasilkan ID sama -> **edit/hapus bisa mengenai baris yang salah**.
- **Perbaikan:** Helper `generateTrxId()` = `TRX-<base36 timestamp>-<random 2 digit>-<4 char uuid>`; diuji 500x tidak pernah duplikat.
- **TC terkait:** TC-VAL-04, TC-INP-01.

---

### 3.9 Modul Keamanan

#### QC-XSS-01 - Medium - `WebApp.html`

- **Bukti (awal):** `tx.authorRole tanpa escape; wb.owner tanpa escape` -> nama pengguna / pemilik dompet yang diisi pengguna masuk ke `innerHTML` tanpa escaping (stored XSS).
- **Perbaikan:** `escapeHtml(tx.authorRole || ...)` pada badge penulis transaksi dan `escapeHtml(wb.owner)` pada badge pemilik dompet. Terverifikasi: `escapeHtml('<img src=x onerror=alert(1)>')` -> `&lt;img src=x onerror=alert(1)&gt;`.
- **TC terkait:** TC-CPY-06.

#### QC-SEC-03 - High - `appsscript.json`

- **Bukti (awal):** `access=ANYONE -> pengguna anonim bisa memanggil skrip tanpa email`.
- **Penyebab:** Manifest memakai `"access": "ANYONE"` padahal README & `menuShowMobileGuide` merekomendasikan **"Anyone with Google account"**. Pada `ANYONE`, `Session.getActiveUser()` bisa kosong -> seluruh pemeriksaan email tidak berarti.
- **Perbaikan:** `"access": "ANYONE_WITH_GOOGLE_ACCOUNT"` (dengan `executeAs: USER_ACCESSING` yang sudah benar) -> setiap pemanggilan punya email, RBAC deterministik. Panduan di `Setup.gs` juga diselaraskan.
- **TC terkait:** TC-CPY-01.

#### QC-SEC-04 - Low - Audit git (di luar suite)

- **Bukti:** Riwayat git (`package.json` versi lama, commit `cc12122`) memuat **deployment ID** web app:
  `AKfycbweiRpK0Y4TOYkAbKx8QAcOn8G25YQB_NVUl0MpcIi1Pb5Dm5AcS66Iiz2AfX02sSZO`.
  Berkas `.clasp.json` sendiri sudah benar: tidak ter-track & masuk `.gitignore` (ada staged deletion).
- **Status:** **DITERIMA sebagai risiko dengan mitigasi rotasi** - pembersihan riwayat git **tidak dilakukan** (destruktif: force-push + memutus clone downstream). **Keputusan (2026-11-05): rotasi / re-deploy web app** sehingga deployment ID lama tidak lagi berlaku.
- **Rekomendasi (lihat §5):** putuskan antara (a) menerima risiko, lalu **rotasi/re-deploy** web app sehingga ID lama tidak berlaku, atau (b) rewrite riwayat dengan persetujuan pemilik repo.
- **TC terkait:** TC-CPY-07.

---

### 3.10 Modul Dokumentasi

#### QC-DOC-01 - Low - `docs/03_USER_GUIDE.md` vs `WebApp.html`

- **Bukti (awal):** `User Guide mendokumentasikan field Peruntukan yang tidak ada di aplikasi`.
- **Perbaikan:** Field Peruntukan kini benar-benar ada -> klaim dokumentasi terpenuhi (dicek otomatis: bila User Guide menyebut `Peruntukan   : [` maka `WebApp.html` wajib punya `id="scopeSelect"`).

---

## 4. Pemetaan Otomasi -> Checklist Pengujian (`02_PRODUCT_TESTING_CHECKLIST.md`)

> **Catatan:** kolom STATUS pada checklist **tidak diisi PASS** - checklist adalah milik UAT manusia.
> Pemetaan di bawah hanya menunjukkan TC mana yang kini tercakup otomatis.

| TC | Terkait Temuan | Status otomasi |
|---|---|---|
| TC-INP-01 | QC-ID-01 | Teruji (`qc-audit.js` Modul H) |
| TC-INP-02 | QC-SYNC-01 | Teruji (Modul D) |
| TC-INP-03 | QC-SCOPE-01/02/03 | Teruji (Modul B) + browser |
| TC-INP-04 | QC-SCOPE-04/05 | Teruji (Modul B) + browser |
| TC-INP-05 | QC-PRESET-01/02/03, QC-SYNC-03 | Teruji (Modul E) + browser |
| TC-BAL-04 | QC-DASH-01 | Teruji (Modul C) |
| TC-BAL-05 | QC-ARCH-01/02/03, QC-SYNC-02 | Teruji (Modul F) |
| TC-SUM-01 | QC-DASH-01 | Teruji (Modul C) |
| TC-SUM-02 | QC-SCOPE-06 | Teruji (Modul B) |
| TC-VAL-01..04 | QC-VAL-01..04, QC-ID-01 | Teruji (Modul G & H) |
| TC-CPY-01..07 | QC-RBAC-01..07, QC-XSS-01, QC-SEC-03/04 | Teruji (Modul A & I) |
| TC-DSH-01..03 | QC-DASH-01 | Sebagian (formula tidak lagi ditimpa); visual = UAT manusia |

---

## 5. Temuan yang DITERIMA sebagai Keputusan Desain (bukan bug)

| ID | Temuan | Alasan diterima |
|---|---|---|
| DES-01 | `XFrameOptionsMode.ALLOWALL` dipertahankan di `doGet()` | Dihapus akan memecah `openWebAppModal` (dialog modal Google Sheets membutuhkannya). Risiko clickjacking termitigasi oleh kewajiban login Google (`ANYONE_WITH_GOOGLE_ACCOUNT`). **Low** - dipantau. |
| DES-02 | `deleteTransaction` / `updateTransaction` tanpa guard RBAC | Konsisten dengan UI & `03_USER_GUIDE.md`: anggota diundang boleh mengelola transaksinya sendiri. Menambahkan guard akan memblokir fitur yang didokumentasikan. |
| DES-03 | Deployment ID bocor di riwayat git (QC-SEC-04) | Rewrite riwayat destruktif (force-push, memutus clone) -> **keputusan: rotasi / re-deploy web app** agar ID lama tidak berlaku; terdokumentasi di §3.9 & §6. |

---

## 6. Tindak Lanjut Sebelum Rilis

1. **Commit & push seluruh perubahan** - `npm test` (wajib 35/35) dan `npm run sync` dijalankan sebelum commit.
   - [x] Commit lokal: `073905d fix(qc): perbaiki 29 temuan QA pra-rilis agar layak komersial` (19 berkas).
   - [x] Push ke `origin/master` (`90aa68e..073905d`).
2. **Redeploy web app** dengan manifest baru (`Anyone with Google account`) dan verifikasi `getInitialData().isMaster` benar untuk akun Master, anggota diundang, dan akun tanpa email.
3. **QC-SEC-04 - KEPUTUSAN: rotasi / re-deploy** (riwayat git tidak di-rewrite). Lakankan pada langkah 2; setelah deploy baru, ID `AKfycb...` pada riwayat tidak lagi berlaku.
4. **UAT manusia** terhadap `docs/02_PRODUCT_TESTING_CHECKLIST.md` (26 TC) - terutama TC-DSH-01..03 (visual) dan TC-CPY-04..05 (alur berbagi akses) yang tidak bisa dibuktikan otomatis.

---

## 7. Cara Mereproduksi Hasil

```bash
npm test          # tests/validate.js + tests/qc-audit.js (harus 35 LULUS, 0 GAGAL)
npm run sync      # sinkronkan demo/ dengan sumber
```

Baseline "sebelum perbaikan" dapat dilihat kapan pun dengan menyimpan perubahan sementara:

```bash
git stash push -- Code.gs WebApp.html appsscript.json Setup.gs demo/WebApp.html
node tests/qc-audit.js   # -> 7 LULUS, 28 GAGAL (kondisi HEAD)
git stash pop
```
