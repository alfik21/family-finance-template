const fs = require('fs');
const path = require('path');

// Try loading docx from local or sibling finance-template
let docx;
try {
  docx = require('docx');
} catch (e) {
  try {
    docx = require(path.resolve(__dirname, '../../finance-template/node_modules/docx'));
  } catch (err) {
    try {
      docx = require('J:/Aplikasi/finance-template/node_modules/docx');
    } catch (err2) {
      console.error('Cannot load docx library:', err2);
      process.exit(1);
    }
  }
}

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle
} = docx;

// Color Palette (Sage Green Utilitarian & Zero-Emoji Minimalist)
const COLOR_PRIMARY = '1E3A34';   // Deep Forest Sage
const COLOR_SECONDARY = '2D6A4F'; // Medium Sage Green
const COLOR_TEXT = '0F172A';      // Dark Slate Body Text
const COLOR_MUTED = '475569';     // Muted Slate Text
const COLOR_BG_LIGHT = 'F8FAFC';  // Light Slate Background
const COLOR_BORDER = 'CBD5E1';    // Slate Border

function createTitle(text) {
  return new Paragraph({
    spacing: { before: 100, after: 120 },
    children: [
      new TextRun({ text, font: 'Arial', size: 38, bold: true, color: COLOR_PRIMARY })
    ]
  });
}

function createSubtitle(text) {
  return new Paragraph({
    spacing: { before: 0, after: 240 },
    children: [
      new TextRun({ text, font: 'Arial', size: 22, italics: true, color: COLOR_MUTED })
    ]
  });
}

function createH1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({ text, font: 'Arial', size: 28, bold: true, color: COLOR_PRIMARY })
    ]
  });
}

function createH2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({ text, font: 'Arial', size: 24, bold: true, color: COLOR_SECONDARY })
    ]
  });
}

function createP(text, options = {}) {
  const runs = [];
  if (typeof text === 'string') {
    runs.push(new TextRun({ text, font: 'Arial', size: 20, color: COLOR_TEXT, ...options }));
  } else if (Array.isArray(text)) {
    text.forEach(item => {
      if (typeof item === 'string') {
        runs.push(new TextRun({ text: item, font: 'Arial', size: 20, color: COLOR_TEXT }));
      } else {
        runs.push(new TextRun({ font: 'Arial', size: 20, color: COLOR_TEXT, ...item }));
      }
    });
  }
  return new Paragraph({
    spacing: { before: 40, after: 100 },
    children: runs
  });
}

function createBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + ': ', font: 'Arial', size: 20, bold: true, color: COLOR_TEXT }));
  }
  children.push(new TextRun({ text, font: 'Arial', size: 20, color: COLOR_TEXT }));
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60 },
    children
  });
}

function createCallout(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_SECONDARY },
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLOR_BG_LIGHT },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({ text: title ? title + ' - ' : '', font: 'Arial', size: 19, bold: true, color: COLOR_PRIMARY }),
                  new TextRun({ text, font: 'Arial', size: 19, color: COLOR_MUTED })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createTable(headers, rowsData) {
  const headerCells = headers.map(h => new TableCell({
    shading: { fill: COLOR_PRIMARY },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, font: 'Arial', size: 19, bold: true, color: 'FFFFFF' })]
      })
    ]
  }));

  const tableRows = [
    new TableRow({ tableHeader: true, children: headerCells })
  ];

  rowsData.forEach((row, rowIdx) => {
    const isEven = rowIdx % 2 === 1;
    const cells = row.map((cellText) => new TableCell({
      shading: isEven ? { fill: COLOR_BG_LIGHT } : undefined,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          children: [new TextRun({ text: String(cellText), font: 'Arial', size: 19, color: COLOR_TEXT })]
        })
      ]
    }));
    tableRows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
    },
    rows: tableRows
  });
}

function createDivider() {
  return new Paragraph({
    spacing: { before: 140, after: 140 },
    border: { bottom: { color: COLOR_BORDER, space: 1, style: BorderStyle.SINGLE, size: 6 } }
  });
}

// =========================================================================
// BUILD DOC 1: PRODUCT BRIEF & REQUIREMENTS
// =========================================================================
async function buildDoc1() {
  const children = [
    createTitle('Product Brief & Requirements: Family Finance Tracker'),
    createSubtitle('Couple & Family Edition - Dokumen Spesifikasi Produk & Perencanaan Pengembangan'),
    createCallout('Fase Siklus Produk', 'Baru Selesai Pengembangan (Fresh Build) - Menuju Tahap Pengujian Internal & Pasangan Asli.'),
    createDivider(),
    createH1('Tabel Kontrol Dokumen'),
    createTable(
      ['Parameter', 'Keterangan'],
      [
        ['ID Dokumen', 'DOC-OPS-PBR-2026-FFT'],
        ['Judul Dokumen', 'Product Brief & Functional Requirements - Family Finance Tracker'],
        ['Edisi Produk', 'Couple & Family Edition (Google Sheets & Mobile PWA Web App)'],
        ['Versi Rilis', '1.2.0 (Build Perdana Pasca-Pengembangan)'],
        ['Tanggal Efektif', '26 Oktober 2026'],
        ['Klasifikasi Akses', 'Internal - Terbatas (Internal Confidential)'],
        ['Penanggung Jawab (PIC)', 'Operations Team'],
        ['Tim Peninjau (Reviewer)', 'Finance Team, Product Lead'],
        ['Status Dokumen', 'Selesai Pengembangan - Menunggu Pengujian QA & Pengguna Asli (Awaiting QA & UAT)']
      ]
    ),
    createDivider(),
    createH1('Ringkasan Eksekutif (Executive Summary)'),
    createP('Family Finance Tracker adalah sistem pencatatan, penganggaran, dan evaluasi finansial rumah tangga yang menggabungkan keandalan basis data Google Sheets dengan kemudahan akses Web App PWA (Progressive Web App) berbasis Google Apps Script.'),
    createP('Sistem ini baru saja selesai dibangun dan dikembangkan (freshly developed) oleh tim pengembang. Berbeda dengan aplikasi keuangan personal biasa, produk ini mengusung Model Finansial Hybrid yang membedakan secara tegas antara belanja Kas Bersama rumah tangga (dapur, tagihan listrik/air, sekolah anak, cicilan) dan dompet pribadi masing-masing pasangan (Suami & Istri) tanpa saling membatasi.'),
    createP('Sebelum produk dibuka untuk penjualan komersial publik, produk wajib melalui dua tahapan verifikasi kritis:'),
    createBullet('Memastikan tidak ada galat rumus, rekonsiliasi saldo per dompet akurat, fitur transfer kas tepat, pembagian pagu anggaran berfungsi, dan validasi data berjalan normal.', '1. Pengujian Kendali Mutu Internal (Internal QA)'),
    createBullet('Menguji antarmuka, kenyamanan tombol cepat di kasir, dan kemudahan kolaborasi entri data oleh pasangan suami-istri pengguna riil pertama kali.', '2. Pengujian Pengguna Asli (Pilot Couple Testing / UAT)'),
    createH1('1. Identitas dan Deskripsi Produk'),
    createH2('1.1. Nama Produk'),
    createBullet('Family Finance Tracker (Couple & Family Edition)', 'Nama Komersial'),
    createBullet('family-finance-template', 'Nama Teknis Repositori'),
    createH2('1.2. Deskripsi Konseptual'),
    createP('Aplikasi web pencatatan keuangan keluarga berbasis peramban (PWA) yang terhubung langsung secara container-bound ke Google Sheets pribadi pengguna dengan 3 mode akses:'),
    createBullet('Berjalan mandiri dari layar utama ponsel (Add to Home Screen) melalui peramban Safari (iOS) atau Chrome (Android) dengan navigasi bawah (Bottom Navigation Bar) ramah jempol.', '1. Mode Smartphone (Mobile PWA)'),
    createBullet('Antarmuka terintegrasi selebar 450x760px di Google Sheets desktop yang dapat dibuka melalui menu Family Finance Tracker > Buka Aplikasi (Modal).', '2. Mode Jendela Dialog (Modal Dialog)'),
    createBullet('Tampilan visual lembar kerja Google Sheets bertema Warm Sage Green dengan 4 tab utama (DASHBOARD, TRANSAKSI, BUDGET & POS, CONFIG).', '3. Mode Tabel Lembar Kerja (Spreadsheet View)'),
    createH1('2. Profil Target Pengguna Asli (Target Pilot & End Users)'),
    createH2('2.1. Pasangan Baru Menikah (Newlyweds)'),
    createBullet('Baru mulai menyatukan arus kas rumah tangga, membutuhkan transparansi pengeluaran bersama tanpa rasa canggung atau curiga.', 'Karakteristik'),
    createBullet('Kemudahan membedakan uang belanja dapur bersama dan uang jajan pribadi masing-masing pasangan.', 'Fokus Uji Coba'),
    createH2('2.2. Pasangan Bekerja dengan Penghasilan Ganda (Dual-Income Couple)'),
    createBullet('Suami dan istri sama-sama berpenghasilan, saling setor dana untuk pos operasional rumah tangga, dan memiliki rekening bank/e-wallet terpisah.', 'Karakteristik'),
    createBullet('Kemudahan pencatatan setoran gaji bersama, kepemilikan rekening (Explicit Wallet Ownership), dan fitur transfer kas antar-dompet.', 'Fokus Uji Coba'),
    createH2('2.3. Keluarga Muda dengan Banyak Pos Kebutuhan Anak'),
    createBullet('Memiliki pengeluaran rutin bulanan yang ketat (popok, susu, les anak, cicilan KPR, token listrik, internet).', 'Karakteristik'),
    createBullet('Peringatan visual batas anggaran (Sparkline Alert Bar) yang otomatis menyala merah saat terjadi overbudget.', 'Fokus Uji Coba'),
    createH2('2.4. Pengguna Sadar Privasi yang Mengalami Subscription Fatigue'),
    createBullet('Enggan membayar langganan aplikasi finansial bulanan (Rp 50.000 - Rp 100.000/bulan) dan menolak mengunggah data mutasi bank keluarga ke server startup asing.', 'Karakteristik'),
    createBullet('100% kepemilikan data di akun Google Drive pribadi dan kemudahan akses seumur hidup sekali bayar (lifetime access).', 'Fokus Uji Coba'),
    createH1('3. Masalah yang Ingin Diselesaikan'),
    createTable(
      ['Masalah Finansial Keluarga Saat Ini', 'Solusi yang Selesai Dikembangkan'],
      [
        ['Tercampurnya Kas Bersama & Dompet Pribadi: Kebingungan membedakan uang belanja operasional vs uang personal.', 'Model Finansial Hybrid: Pemisahan tegas pos Kas Bersama, Pribadi Suami, dan Pribadi Istri dalam satu dashboard terpadu.'],
        ['Malas Mencatat Akibat Entri Ponsel Lambat: Membuka sheet di layar HP saat di kasir terasa lambat dan merepotkan.', 'Web App PWA Ramah Jempol: Akses 1-2 detik dari layar utama HP lengkap dengan tombol cepat cerdas 1-ketuk (Smart Presets).'],
        ['Subscription Fatigue: Beban biaya langganan bulanan software keuangan keluarga yang berulang dan boros.', 'Sekali Bayar Seumur Hidup (Lifetime Access): Tanpa biaya langganan, tanpa iklan, dan tanpa batasan transaksi.'],
        ['Risiko Privasi Data Bocor: Ketakutan data mutasi keluarga disimpan di database pihak ketiga yang rawan peretasan.', '100% Kepemilikan Data di Google Drive: Template diduplikasi ke Drive pribadi pengguna; developer tidak memiliki akses.'],
        ['Spreadsheet Lemot Akibat Baris Menumpuk: File spreadsheet menjadi berat setelah ribuan baris tersimpan bertahun-tahun.', 'Fitur Tutup Buku & Arsip 1-Klik: Memindahkan riwayat tahun lalu ke sheet statis ARSIP_YYYY dan mengoper sisa saldo kas ke tahun baru otomatis.']
      ]
    ),
    createH1('4. Daftar Fitur yang Telah Selesai Dikembangkan'),
    createBullet('Pengelompokan mutasi belanja keluarga tanpa menghilangkan otonomi dompet pribadi pasangan.', '1. Model Finansial Hybrid'),
    createBullet('Desain modern dengan tipografi Plus Jakarta Sans, angka tabular, palet warna Warm Sage Green, dan bebas emoji (Zero-Emoji Policy).', '2. Antarmuka Minimalis Sage Green Utilitarian'),
    createBullet('Navigasi bawah 4 tab (Catat, Rekap, Kelola, Akun) di smartphone dan beralih ke layout desktop di monitor.', '3. Mobile Bottom Navigation & Desktop Top Header'),
    createBullet('Algoritma otomatis menganalisis kebiasaan transaksi berulang dan memunculkan tombol 1-ketuk untuk nominal rutin.', '4. Tombol Cepat Cerdas (Smart Habit-Based Presets)'),
    createBullet('Rekapitulasi transaksi dinamis berdasarkan tanggal gajian keluarga (misal: tgl 25) dengan tombol navigasi Prev dan Next.', '5. Navigasi Siklus Gajian Fleksibel (Two-Way Salary Cycle)'),
    createBullet('Mengenali email Google pembuat sebagai Akun Master (kontrol tutup buku), sedangkan pasangan yang diundang bertindak sebagai kolaborator.', '6. Role-Based Access Control (RBAC) Otomatis'),
    createBullet('Fitur mutasi antar-rekening/e-wallet dengan rute sumber dan tujuan yang jelas tanpa mempengaruhi laporan belanja bulanan.', '7. Modul Transfer Kas Antar-Dompet'),
    createBullet('Menampilkan bilah hijau proporsional jika pengeluaran aman, dan otomatis berubah merah jika overbudget.', '8. Alokasi Anggaran & Visual Sparkline Bar'),
    createBullet('Pembersihan data tahunan ke sheet ARSIP_YYYY untuk menjaga ukuran sheet aktif tetap ringan (< 2.000 baris/tahun).', '9. Fitur Tutup Buku & Arsip Tahunan'),
    createBullet('Memastikan entri data dari smartphone Suami dan Istri yang dilakukan bersamaan tidak bertabrakan atau menimpa satu sama lain.', '10. Proteksi Konkurensi (LockService)'),
    createH1('5. Batasan Produk (Product Scope & Constraints)'),
    createBullet('Produk tidak terhubung dengan API bank eksternal demi menjaga kerahasiaan sandi dan keamanan perbankan pengguna; pencatatan dilakukan mandiri oleh pasangan.', '1. Pencatatan Semi-Otomatis'),
    createBullet('Pengguna wajib memiliki akun Google aktif untuk mengoperasikan Google Sheets dan Google Apps Script.', '2. Ketergantungan Ekosistem Google Workspace'),
    createBullet('Produk didistribusikan dalam bentuk tautan duplikasi mandiri (/copy), bukan arsitektur multi-tenant SaaS terpusat.', '3. Distribusi Berkas Mandiri (Standalone File)'),
    createBullet('Pengkodean sistem telah selesai 100%, namun produk belum diuji oleh pengguna riil (real user test). Wajib melalui checklist pengujian fungsional dan pengujian keterpakaian pasangan sebelum rilis komersial.', '4. Kesiapan Produk Saat Ini'),
    createH1('6. Rencana Tahapan Rilis (Product Release Roadmap)'),
    createBullet('Koding Setup.gs, Code.gs, WebApp.html, dan test otomatis E2E.', 'Tahap 1: PENGEMBANGAN [STATUS: SELESAI]'),
    createBullet('Internal QA Testing, UAT bersama 3-5 pasangan riil, uji alur /copy, dan evaluasi masukan.', 'Tahap 2: PENGUJIAN [STATUS: SEDANG BERJALAN]'),
    createBullet('Buka toko digital (Lynk.id, Mayar, Shopee), distribusi link, kampanye edukasi, dan serah terima CS.', 'Tahap 3: PELUNCURAN [STATUS: MENDATANG]'),
    createH1('7. Model Penetapan Harga Target Sementara (Provisional Pricing)'),
    createTable(
      ['Parameter', 'Ketetapan Target Sementara'],
      [
        ['Model Lisensi', 'Pembelian Lisensi Tunggal Rumah Tangga (Akses Seumur Hidup)'],
        ['Harga Referensi Normal (MSRP / Coret)', 'Rp 199.000'],
        ['Target Harga Jual Reguler', 'Rp 99.000'],
        ['Target Harga Promosi Peluncuran (Early Bird)', 'Rp 79.000'],
        ['Paket Bundling Tambahan (Opsional)', 'Rp 129.000 (Termasuk Add-on Simulasi Dana Darurat & Investasi)'],
        ['Saluran Penjualan Rencana', 'Lynk.id, Mayar.id, Shopee Digital, Gumroad, WhatsApp Catalog']
      ]
    ),
    createH1('8. Persetujuan Kesiapan Memasuki Tahap Pengujian'),
    createTable(
      ['Peran', 'Penanggung Jawab', 'Tanggal', 'Status Keputusan'],
      [
        ['Lead Developer', 'Engineering Team', '26 Oktober 2026', 'Kode Siap Diuji (Code Freeze)'],
        ['Operasional', 'Operations Team', '26 Oktober 2026', 'Siap Masuk Tahap QA & UAT'],
        ['Keuangan', 'Finance Team', '26 Oktober 2026', 'Siap Verifikasi Rumus & Saldo']
      ]
    )
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'docs', '01_PRODUCT_BRIEF_AND_REQUIREMENTS.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('01_PRODUCT_BRIEF_AND_REQUIREMENTS.docx berhasil dibuat di:', outPath);
}

// =========================================================================
// BUILD DOC 2: PANDUAN PENGUJIAN PRODUK (SOP)
// =========================================================================
async function buildDoc2() {
  const children = [
    createTitle('Panduan & SOP Pengujian Produk: Family Finance Tracker'),
    createSubtitle('Couple & Family Edition - Standard Operating Procedure (SOP) Pengujian Mutu 2 Fase'),
    createCallout('Konteks Produk', 'Produk Baru Selesai Dikembangkan (Fresh Development) - Belum Diuji oleh Pengguna Asli.'),
    createDivider(),
    createH1('Tabel Informasi Dokumen SOP'),
    createTable(
      ['Parameter', 'Keterangan'],
      [
        ['ID Dokumen', 'SOP-QA-2026-FFT'],
        ['Versi Dokumen', '1.2.0'],
        ['Divisi Penanggung Jawab', 'Finance + Operations Team'],
        ['Tanggal Berlaku', '26 Oktober 2026'],
        ['Berkas Lembar Uji Terkait', 'docs/02_PRODUCT_TESTING_CHECKLIST.xlsx (Template Kosong 2 Tab)']
      ]
    ),
    createH1('1. Latar Belakang dan Tujuan Pengujian'),
    createP('Produk Family Finance Tracker ini baru saja selesai dibangun dan selesai dikembangkan pada tingkat kode (code freeze). Seluruh fitur utama (Web App PWA mobile-first, model finansial hybrid, pemisahan pos belanja bersama vs dompet pribadi suami & istri, tombol cepat cerdas, transfer kas antar-dompet, dan modul tutup buku tahunan) telah selesai dikoding, namun belum pernah diuji coba oleh pasangan pengguna nyata (real couple end-users).'),
    createP('Oleh karena itu, dokumen SOP ini menetapkan kerangka kerja pengujian bertahap:'),
    createBullet('Dilakukan oleh tim internal Finance dan Operations untuk memverifikasi 26 kasus uji teknis pada lembar kerja kosong.', 'Fase 1: Verifikasi Fungsional Internal (Internal QA)'),
    createBullet('Dilakukan bersama 3-5 pasangan suami-istri pengguna nyata untuk mengamati kemudahan navigasi dan kemudahan kolaborasi entri data.', 'Fase 2: Pengujian Penerimaan Pengguna Asli (User Acceptance Testing / UAT)'),
    createH1('2. Persiapan Lingkungan Uji Bersih (Clean Test Environment)'),
    createBullet('Jangan gunakan akun Google yang memiliki hak developer. Gunakan akun Gmail biasa yang belum pernah memberi izin pada skrip ini.', '1. Gunakan Akun Google Uji Baru'),
    createBullet('Buka tautan master berakhiran /copy. Pastikan muncul dialog Google resmi: Apakah Anda ingin membuat salinan dari Family Finance Tracker?.', '2. Uji Salinan Mandiri via Link /copy'),
    createBullet('Penguji wajib menguji alur instalasi Web App pada perangkat smartphone fisik (iPhone via Safari dan Android via Chrome).', '3. Simulasi Akses Smartphone Fisik'),
    createH1('3. Klasifikasi Tingkat Keparahan Bug (Severity Levels)'),
    createTable(
      ['Tingkat Keparahan', 'Kriteria & Dampak', 'Tindakan Operasional'],
      [
        ['Critical (Blocker)', 'Rumus spreadsheet rusak, saldo tidak sinkron, aplikasi tidak terbuka, otorisasi gagal.', 'Rilis DIBLOKIR. Pengembang wajib memperbaiki sebelum lanjut ke UAT.'],
        ['High (Major)', 'Fitur transfer kas salah hitung, validasi data tembus (angka 0/minus tersimpan), tombol PWA macet.', 'Wajib diperbaiki dan diuji ulang.'],
        ['Medium (Minor)', 'Teks label membingungkan pasangan awam, tata letak bergeser pada layar kecil.', 'Diperbaiki dalam siklus perbaikan rilis perdana.'],
        ['Low (Trivial)', 'Saran perbaikan warna latar, redaksi panduan kurang jelas, permintaan fitur tambahan.', 'Dicatat dalam dokumen Product Backlog.']
      ]
    ),
    createH1('4. Prosedur Uji Fase 1: Matriks Fungsional Internal (26 Skenario)'),
    createH2('A. Modul Input Transaksi Kas (PIC: Operations + Finance)'),
    createBullet('Input pengeluaran Kas Bersama. Saldo terpotong, tersimpan di TRANSAKSI, kartu Pengeluaran Bersama bertambah.', 'TC-INP-01'),
    createBullet('Input pengeluaran Dompet Pribadi Suami. Saldo dompet Suami terpotong tanpa memotong pagu Kas Bersama.', 'TC-INP-02'),
    createBullet('Input pengeluaran Dompet Pribadi Istri. Saldo dompet Istri terpotong tanpa memotong pagu Kas Bersama.', 'TC-INP-03'),
    createBullet('Input pemasukan bersama (Gaji Bersama). Saldo dompet penerima bertambah dan kartu Total Pemasukan bertambah tepat.', 'TC-INP-04'),
    createBullet('Satu ketukan pada Smart Preset mengisi nominal, peruntukan, kategori, dan catatan secara otomatis.', 'TC-INP-05'),
    createH2('B. Modul Perhitungan Saldo & Akuntansi Kas (PIC: Finance)'),
    createBullet('Perhitungan saldo otomatis per dompet: (Pemasukan + Transfer Masuk) - (Pengeluaran + Transfer Keluar).', 'TC-BAL-01'),
    createBullet('Isolasi Saldo Awal Kas Bersama di baris TRX-INIT-001 tidak menggelembungkan pemasukan operasional bulanan.', 'TC-BAL-02'),
    createBullet('Mutasi Transfer Antar-Dompet memotong dompet asal, menambah dompet tujuan, dan tidak dihitung sebagai belanja.', 'TC-BAL-03'),
    createBullet('Kartu Sisa Kas Berjalan di Dashboard menghitung akurat sesuai formula =A6-E6 (Pemasukan - Pengeluaran).', 'TC-BAL-04'),
    createBullet('Koreksi dan Hapus Transaksi me-rollback saldo dompet terkait ke posisi sebelum transaksi dicatat.', 'TC-BAL-05'),
    createH2('C. Modul Ringkasan & Siklus Waktu (PIC: Finance + Operations)'),
    createBullet('Ringkasan Transaksi Bulanan menyajikan data yang sesuai dengan filter bulan pantauan (YYYY-MM).', 'TC-SUM-01'),
    createBullet('Rekapitulasi Siklus Gajian (misal: tgl 25) mengelompokkan data dari tanggal 25 s/d 24 bulan berikutnya.', 'TC-SUM-02'),
    createBullet('Navigasi Siklus Gajian Dua Arah (Prev / Next Cycle) di Web App berfungsi lancar.', 'TC-SUM-03'),
    createBullet('Ringkasan Peruntukan Belanja di Dashboard memisahkan total belanja Kas Bersama, Pribadi Suami, dan Pribadi Istri.', 'TC-SUM-04'),
    createH2('D. Modul Visualisasi & Anggaran Belanja (PIC: Finance + Operations)'),
    createBullet('Bilah Sparkline Anggaran menampilkan warna hijau selama realisasi pengeluaran di bawah limit pagu.', 'TC-DSH-01'),
    createBullet('Bilah progress bar otomatis berubah warna merah menyala saat belanja melebihi pagu anggaran kategori.', 'TC-DSH-02'),
    createBullet('Persentase pemakaian anggaran dihitung akurat (Realisasi / Anggaran * 100) tanpa pesan galat.', 'TC-DSH-03'),
    createH2('E. Modul Validasi & Keamanan Data (PIC: Operations)'),
    createBullet('Sistem menolak simpan transaksi bernilai <= 0 dengan peringatan ramah pengguna.', 'TC-VAL-01'),
    createBullet('Sistem mencegah input angka minus atau karakter non-numerik pada field nominal Web App.', 'TC-VAL-02'),
    createBullet('Tanggal tersimpan dalam format kalender valid (YYYY-MM-DD) dan kolom bulan terisi otomatis formula TEXT.', 'TC-VAL-03'),
    createBullet('Suami dan istri input transaksi bersamaan via smartphone masing-masing; kedua baris tersimpan utuh (LockService).', 'TC-VAL-04'),
    createH2('F. Modul Verifikasi Salinan Template (PIC: Operations)'),
    createBullet('Tautan /copy menampilkan laman resmi Google Make a copy tanpa memerlukan izin akses.', 'TC-CPY-01'),
    createBullet('Berkas tersimpan mandiri di Drive pembeli; pengubahan data pembeli tidak berdampak pada Master Template.', 'TC-CPY-02'),
    createBullet('Dialog otorisasi keamanan Google berjalan mulus via opsi Advanced > Go to Family Finance Tracker.', 'TC-CPY-03'),
    createBullet('Menjalankan setupFinanceTracker otomatis membentuk sheet CONFIG, TRANSAKSI, BUDGET & POS, dan DASHBOARD.', 'TC-CPY-04'),
    createBullet('Pembeli berhasil men-deploy Web App dengan setelan Execute as: User accessing dan dibuka lancar di browser HP.', 'TC-CPY-05'),
    createBullet('Add to Home Screen di Safari (iOS) dan Chrome (Android) menghasilkan shortcut layar penuh ramah jempol.', 'TC-CPY-06'),
    createBullet('Menu Tutup Buku & Arsipkan Tahun Lalu berhasil memindahkan data lampau ke ARSIP_YYYY dan mengoper saldo awal.', 'TC-CPY-07'),
    createH1('5. Prosedur Uji Fase 2: Pengujian Penerimaan Pasangan Asli (UAT)'),
    createP('Setelah seluruh 26 butir Fase 1 bertanda PASS, lakukan pengujian bersama 3-5 pasangan pengguna nyata:'),
    createBullet('Salah satu pasangan menyalin template ke Google Drive dan melakukan deployment Web App.', 'Tugas 1: Akses Mandiri'),
    createBullet('Amati apakah pasangan dapat menyelesaikan otorisasi Apps Script dengan panduan User Guide.', 'Tugas 2: Otorisasi Mandiri'),
    createBullet('Minta pasangan menyesuaikan nama panggilan di sheet CONFIG dan mendaftarkan dompet mereka.', 'Tugas 3: Pengaturan Keluarga'),
    createBullet('Minta suami dan istri mencatat transaksi belanja kas bersama dan belanja pribadi dari HP masing-masing.', 'Tugas 4: Catat Transaksi'),
    createBullet('Minta pasangan membaca sisa anggaran dan sisa kas berjalan pada dashboard.', 'Tugas 5: Evaluasi Dashboard'),
    createH2('Formulir Evaluasi Pasangan Asli (UAT Feedback Form)'),
    createTable(
      ['Pasangan Tester', 'Latar Belakang', 'Kendala yang Dihadapi', 'Skor Otorisasi (1-5)', 'Skor Input HP (1-5)', 'Keputusan'],
      [
        ['Pasangan 1', 'Baru Menikah (Newlyweds)', '[Catat kendala riil]', '[1 - 5]', '[1 - 5]', '[Puas / Butuh Perbaikan]'],
        ['Pasangan 2', 'Dual-Income Couple', '[Catat kendala riil]', '[1 - 5]', '[1 - 5]', '[Puas / Butuh Perbaikan]'],
        ['Pasangan 3', 'Keluarga dengan 2 Anak', '[Catat kendala riil]', '[1 - 5]', '[1 - 5]', '[Puas / Butuh Perbaikan]']
      ]
    ),
    createH1('6. Syarat Ambang Batas Kelulusan (Release Gate Criteria)'),
    createP('Produk Family Finance Tracker dinyatakan SELESAI DIUJI & LAYAK JUAL (READY TO SELL) apabila:'),
    createBullet('26 dari 26 skenario fungsional berstatus PASS (100%).', '1. Fase 1 (Internal QA)'),
    createBullet('Minimal 80% pasangan penguji asli menyatakan dapat mengoperasikan aplikasi secara mandiri.', '2. Fase 2 (User Testing)'),
    createBullet('Tidak ada bug berkategori Critical atau High yang belum terselesaikan.', '3. Nol Temuan Blocker'),
    createBullet('Lembar sign-off ditandatangani oleh PIC Operations, PIC Finance, dan Product Lead.', '4. Persetujuan Lengkap')
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'docs', '02_PANDUAN_PENGUJIAN_PRODUK.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('02_PANDUAN_PENGUJIAN_PRODUK.docx berhasil dibuat di:', outPath);
}

// =========================================================================
// BUILD DOC 3: USER GUIDE (PANDUAN PENGGUNA)
// =========================================================================
async function buildDoc3() {
  const children = [
    createTitle('Panduan Pengguna: Family Finance Tracker'),
    createSubtitle('Couple & Family Edition - Edisi Rilis Perdana Pasca-Pengembangan'),
    createCallout('Format Dokumen', 'Panduan Pengguna Resmi untuk Pembeli & Pengguna Uji Coba (Versi 1.2.0).'),
    createDivider(),
    createH1('1. Selamat Datang di Family Finance Tracker'),
    createP('Selamat atas kepemilikan template Family Finance Tracker (Couple & Family Edition). Sistem ini dirancang khusus untuk membantu pasangan suami-istri mengelola keuangan keluarga secara harmonis, transparan, dan teratur dengan model finansial Hybrid (Kas Bersama + Dompet Pribadi Suami & Istri) tanpa biaya langganan bulanan (zero-subscription).'),
    createBullet('Menyatukan pos belanja operasional rumah tangga bersama tanpa membatasi uang saku atau hobi pribadi masing-masing pasangan.', 'Model Finansial Hybrid'),
    createBullet('Seluruh data mutasi tersimpan di Google Drive pribadi Anda, bukan di server startup asing.', 'Privasi Terjamin 100%'),
    createBullet('Buka aplikasi langsung dari layar utama ponsel (Add to Home Screen) dalam 1-2 detik saat berada di kasir atau pasar.', 'Akses Cepat Smartphone (PWA)'),
    createBullet('Cukup satu kali beli, dapat digunakan seterusnya tanpa batas baris transaksi.', 'Bebas Biaya Langganan Seumur Hidup'),
    createH1('2. Cara Membuat Salinan Template ke Google Drive Pribadi'),
    createP('Untuk menggunakan template, Anda cukup menduplikasi berkas Master Template ke akun Google Drive Anda dalam satu langkah mudah via trik tautan /copy:'),
    createBullet('Pastikan Anda telah masuk (login) ke akun Google / Gmail pribadi di peramban komputer atau laptop.', 'Langkah 1'),
    createBullet('Buka tautan akses resmi yang Anda terima saat pembelian berakhiran /copy.', 'Langkah 2'),
    createBullet('Peramban akan secara otomatis membuka jendela konfirmasi resmi dari Google: Apakah Anda ingin membuat salinan dari Family Finance Tracker?.', 'Langkah 3'),
    createBullet('Klik tombol biru bertuliskan Buat salinan (Make a copy).', 'Langkah 4'),
    createBullet('Seluruh struktur lembar kerja, rumus, dan skrip Google Apps Script akan diduplikasi secara utuh ke Google Drive Anda.', 'Langkah 5'),
    createH1('3. Otorisasi Keamanan Google Apps Script (Hanya 1 Kali)'),
    createP('Saat pertama kali menjalankan menu aplikasi di Google Sheets, Google mewajibkan konfirmasi izin keamanan standar:'),
    createBullet('Di tab Google Sheets Anda, segarkan halaman (refresh / tekan tombol F5).', 'Langkah 1'),
    createBullet('Tunggu beberapa detik hingga muncul menu baru di bilah menu atas: Family Finance Tracker.', 'Langkah 2'),
    createBullet('Klik menu Family Finance Tracker > pilih Jalankan Setup / Reset Template.', 'Langkah 3'),
    createBullet('Muncul jendela peringatan bertuliskan Authorization Required, klik Continue (Lanjutkan).', 'Langkah 4'),
    createBullet('Pilih akun Google Anda.', 'Langkah 5'),
    createBullet('Saat muncul jendela Google hasnt verified this app, klik tautan teks kecil di kiri bawah: Advanced (Lanjutan).', 'Langkah 6'),
    createBullet('Klik baris tulisan: Go to Family Finance Tracker (unsafe).', 'Langkah 7'),
    createBullet('Gulir ke bawah lalu klik tombol biru Allow (Izinkan). Seluruh 4 tab sheet otomatis terbentuk rapi.', 'Langkah 8'),
    createH1('4. Pengaturan Awal Keluarga di Sheet CONFIG'),
    createH2('A. Pengaturan Identitas Keluarga (Kolom A & B)'),
    createP('Ganti panggilan bawaan (Ayah / Bunda) sesuai nama panggilan di rumah. Masukkan email Google yang digunakan di smartphone masing-masing. Masukkan tanggal gajian keluarga Anda (misal: 25) untuk mengaktifkan perhitungan siklus bulanan otomatis.'),
    createH2('B. Kategori Belanja & Rekening Dompet (Kolom C s/d F)'),
    createP('Tentukan pos belanja: apakah masuk sebagai Kas Bersama, Pribadi Suami, atau Pribadi Istri. Masukkan nama rekening bank, kas tunai, atau e-wallet keluarga (misal: Kas Tunai, BCA Bersama, GoPay Suami, Mandiri Istri) beserta status pemilik rekening.'),
    createH2('C. Saldo Awal Kas Riil'),
    createP('Buka sheet TRANSAKSI, lalu pada baris ke-2 (TRX-INIT-001), ganti angka 0 pada kolom Nominal dengan saldo kas nyata Anda saat ini.'),
    createH1('5. Cara Memasukkan Transaksi'),
    createBullet('Masukkan nominal, pilih kategori belanja dan sumber dompet. Tentukan Peruntukan: Kas Bersama untuk dapur/rumah tangga, atau Pribadi Suami/Istri. Tekan Simpan Pengeluaran.', '1. Pengeluaran'),
    createBullet('Pilih tab Pemasukan, masukkan nominal setoran gaji atau bonus usaha, pilih dompet penerima, lalu simpan.', '2. Pemasukan'),
    createBullet('Gunakan saat tarik tunai dari ATM atau memindahkan saldo bank ke e-wallet. Dompet sumber berkurang dan dompet tujuan bertambah tanpa mempengaruhi laporan belanja bulanan keluarga.', '3. Transfer Kas Antar-Dompet'),
    createBullet('Sistem otomatis menganalisis kebiasaan belanja berulang Anda. Cukup ketuk satu tombol preset, seluruh kolom kategori dan nominal langsung terisi seketika.', '4. Tombol Cepat Cerdas (Smart Presets)'),
    createH1('6. Cara Membaca Dashboard & Status Anggaran'),
    createBullet('Total Pemasukan, Pengeluaran Bersama, Total Pengeluaran, dan Sisa Kas Berjalan (Total Pemasukan - Total Pengeluaran).', 'Kartu Ringkasan Finansial'),
    createBullet('Menampilkan rasio perbandingan belanja antara Kas Bersama, Pribadi Suami, dan Pribadi Istri.', 'Ringkasan Peruntukan Pasangan'),
    createBullet('Bilah hijau menandakan pengeluaran pos tersebut masih aman di bawah limit anggaran.', 'Bilah Sparkline Hijau (Aman)'),
    createBullet('Memberi sinyal visual tegas bahwa belanja pada pos tersebut telah melampaui plafon yang disepakati (Overbudget).', 'Bilah Sparkline Merah (Overbudget)'),
    createH1('7. Memasang di Layar Utama Smartphone & Kolaborasi Pasangan'),
    createH2('Langkah 1: Buat Tautan Web App Pribadi'),
    createP('Di spreadsheet komputer, klik Ekstensi > Apps Script > tombol Deploy > New deployment > jenis Web app. Set Execute as = User accessing the web app, Who has access = Anyone with Google account. Klik Deploy dan salin URL Web App yang dihasilkan ke WhatsApp pasangan.'),
    createH2('Langkah 2: Pasang di Layar Utama Smartphone'),
    createBullet('Buka tautan di Safari > ketuk tombol Share (kotak panah atas) > pilih Add to Home Screen.', 'Pengguna iPhone (Safari)'),
    createBullet('Buka tautan di Chrome > ketuk Menu Titik Tiga > pilih Add to Home screen / Install app.', 'Pengguna Android (Chrome)'),
    createH2('Langkah 3: Berbagi Hak Akses dengan Pasangan'),
    createP('Di Google Sheets komputer, klik tombol hijau Bagikan (Share) di kanan atas > masukkan email Google pasangan Anda > berikan izin sebagai Editor > Simpan. Kini suami dan istri dapat mencatat transaksi dari HP masing-masing secara bersamaan.'),
    createH1('8. Tutup Buku & Arsip Tahunan (1-Klik)'),
    createP('Di akhir tahun kalender, klik menu Family Finance Tracker pada bilah menu atas Google Sheets > pilih Tutup Buku & Arsipkan Tahun Lalu > masukkan tahun yang ingin diarsipkan (misal: 2025). Sistem secara otomatis memindahkan seluruh riwayat transaksi ke lembar baru ARSIP_2025 dan mengoper sisa saldo Kas Bersama ke tahun baru sebagai Saldo Awal.'),
    createH1('9. Solusi Masalah Umum (Troubleshooting FAQ)'),
    createTable(
      ['Kendala', 'Penyebab Umum', 'Solusi Cepat'],
      [
        ['Muncul layar Google hasnt verified this app.', 'Prosedur keamanan pertama kali Google Apps Script.', 'Klik teks kecil Advanced di kiri bawah > klik Go to Family Finance Tracker > klik Allow.'],
        ['Pasangan tidak bisa menginput Web App.', 'Email pasangan belum diberi akses edit spreadsheet.', 'Klik tombol hijau Bagikan di Google Sheets dan pastikan email pasangan terdaftar sebagai Editor.'],
        ['Salah memasukkan nominal atau kategori belanja.', 'Kesalahan input saat di kasir.', 'Buka tab Rekap di Web App HP, ketuk ikon pensil/tempat sampah. Atau langsung ubah di sheet TRANSAKSI.'],
        ['Ingin menambah rekening bank atau e-wallet baru.', 'Kebutuhan dompet baru di tengah jalan.', 'Tambahkan nama dompet baru di baris kosong sheet CONFIG. Form otomatis mengenalinya.']
      ]
    ),
    createH1('10. Kontak Dukungan Pengguna & Formulir Masukan'),
    createP('Sebagai produk rilis perdana pasca-pengembangan, kami berkomitmen mendampingi penggunaan template keluarga Anda:'),
    createBullet('+62 812-XXXX-XXXX (Senin - Sabtu, 09:00 - 17:00 WIB).', 'WhatsApp Layanan Bantuan'),
    createBullet('support@familyfinancetracker.id', 'Surel Bantuan Teknis'),
    createBullet('Tautan formulir evaluasi pengguna (Feedback Form) pada portal pembelian.', 'Kanal Masukan & Saran Fitur'),
    createBullet('Maksimal 1 x 24 jam kerja.', 'Waktu Tanggap Layanan')
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'docs', '03_USER_GUIDE.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('03_USER_GUIDE.docx berhasil dibuat di:', outPath);
}

// =========================================================================
// BUILD DOC 4: LICENSE & TERMS OF USE
// =========================================================================
async function buildDoc4() {
  const children = [
    createTitle('Surat Perjanjian Lisensi & Ketentuan Penggunaan'),
    createSubtitle('Family Finance Tracker - Couple & Family Edition (Edisi Rilis Perdana)'),
    createCallout('Nomor Registrasi Lisensi', 'LIC-OPS-FIN-2026-FFT-V120 | Tanggal Berlaku Efektif: 26 Oktober 2026.'),
    createDivider(),
    createP('PEMBERITAHUAN HUKUM: DENGAN MEMBELI, MENYALIN, MENGUNDUH, MENGAKSES, ATAU MENGGUNAKAN TEMPLATE FAMILY FINANCE TRACKER, ANDA SECARA SADAR DAN SUKARELA MENYATAKAN TELAH MEMBACA, MEMAHAMI, DAN SETUJU UNTUK TERIKAT OLEH SELURUH SYARAT DAN KETENTUAN DALAM PERJANJIAN INI.'),
    createH1('Pasal 1: Pemberian Lisensi Penggunaan (Grant of License)'),
    createBullet('Pemilik Hak Cipta memberikan kepada Pembeli suatu lisensi non-eksklusif, berlaku seumur hidup (perpetual), tidak dapat dipindahtangankan, dan terbatas untuk penggunaan 1 unit keluarga inti (Single Household Standard License).', '1.1. Sifat Lisensi'),
    createBullet('Pembeli berhak menggunakan salinan Family Finance Tracker untuk mencatat, mengelola, dan memantau keuangan rumah tangga internal keluarga Pembeli (suami, istri, dan anak) pada Google Drive pribadi.', '1.2. Lingkup Hak Pakai'),
    createH1('Pasal 2: Hak Modifikasi dan Tanggung Jawab Teknis'),
    createBullet('Pembeli diberikan hak penuh untuk mengubah formula spreadsheet, menambah kategori pengeluaran baru, mendaftarkan rekening bank/e-wallet baru, atau membuat sheet tambahan untuk kebutuhan internal keluarga.', '2.1. Hak Modifikasi'),
    createBullet('Segala bentuk kerusakan formula, terhapusnya skrip bawaan Google Apps Script (Code.gs atau Setup.gs), atau kegagalan kalkulasi saldo yang timbul akibat modifikasi mandiri merupakan tanggung jawab penuh Pembeli.', '2.2. Batasan Tanggung Jawab Modifikasi'),
    createH1('Pasal 3: Larangan Distribusi, Penggandaan, dan Pembajakan'),
    createBullet('Dilarang menjual kembali, melisensikan ulang, menyewakan, meminjamkan, atau memperdagangkan template ini baik dalam bentuk asli maupun setelah dimodifikasi.', '3.1. Larangan Penjualan Kembali (No Resale)'),
    createBullet('Dilarang membagikan link /copy, mengunggah template ke forum publik, repositori publik terbuka, atau grup percakapan massal.', '3.2. Larangan Distribusi Massal (No Redistribution)'),
    createBullet('Seluruh kode sumber, formula, dan desain antarmuka dilindungi Undang-Undang Republik Indonesia Nomor 28 Tahun 2014 tentang Hak Cipta.', '3.3. Perlindungan Hak Cipta'),
    createH1('Pasal 4: Pembaruan Sistem dan Cakupan Bantuan Teknis'),
    createBullet('Pemilik Hak Cipta berhak merilis penyempurnaan fitur minor atau perbaikan kutu skrip (bug fixes) melalui portal unduhan resmi tanpa biaya tambahan.', '4.1. Pembaruan Berkas'),
    createBullet('Mencakup panduan duplikasi berkas via link /copy, penyelesaian kendala otorisasi Google Apps Script standar, dan panduan deployment Web App ke smartphone pasangan.', '4.2. Cakupan Bantuan Teknis Standar'),
    createBullet('Tidak mencakup pembuatan fitur kustom baru di luar spesifikasi resmi, integrasi API bank eksternal, atau perbaikan formula yang rusak akibat modifikasi mandiri pengguna.', '4.3. Pengecualian Layanan'),
    createH1('Pasal 5: Kebijakan Pengembalian Dana (Refund Policy)'),
    createBullet('Mengingat produk merupakan perangkat lunak digital instan yang diserahkan seketika (instant irrevocable digital download), seluruh transaksi bersifat final dan non-refundable.', '5.1. Sifat Barang Digital Seketika'),
    createBullet('Pengembalian dana penuh hanya diproses jika tautan master terbukti rusak permanen dan tim teknis tidak mampu memberikan tautan pengganti dalam 3 x 24 jam kerja.', '5.2. Garansi Kerusakan Permanen'),
    createH1('Pasal 6: Batasan Tanggung Jawab & Sanggahan Finansial (Disclaimer)'),
    createBullet('Produk berfungsi murni sebagai alat bantu pencatatan administratif arus kas keluarga, bukan penasihat keuangan bersertifikasi (Certified Financial Planner) atau akuntan publik.', '6.1. Bukan Nasihat Finansial Resmi'),
    createBullet('Tanggung jawab atas ketepatan angka saldo riil dan mutasi transaksi berada sepenuhnya di tangan pengguna yang memasukkan data.', '6.2. Akurasi Data Input'),
    createBullet('Pembuat produk dibebaskan dari tuntutan atas downtime, perubahan kuota API, atau perubahan kebijakan sepihak oleh Google LLC.', '6.3. Ketergantungan Layanan Google'),
    createH1('Pasal 7: Pengesahan dan Ketentuan Penutup'),
    createTable(
      ['Otoritas Persetujuan', 'Divisi', 'Status Pengesahan'],
      [
        ['Manajer Operasional Produk', 'Operations Team', 'Disahkan Sah (Legally Validated)'],
        ['Manajer Kepatuhan & Keuangan', 'Finance Team', 'Disahkan Sah (Financially Approved)']
      ]
    )
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'docs', '04_LICENSE_AND_TERMS_OF_USE.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('04_LICENSE_AND_TERMS_OF_USE.docx berhasil dibuat di:', outPath);
}

async function main() {
  await buildDoc1();
  await buildDoc2();
  await buildDoc3();
  await buildDoc4();
  console.log('Seluruh 4 berkas DOCX berhasil digenerate di folder docs/');
}

main().catch(err => {
  console.error('Error generator DOCX:', err);
  process.exit(1);
});
