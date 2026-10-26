const fs = require('fs');
const path = require('path');

// Try loading exceljs from local or sibling finance-template
let ExcelJS;
try {
  ExcelJS = require('exceljs');
} catch (e) {
  try {
    ExcelJS = require(path.resolve(__dirname, '../../finance-template/node_modules/exceljs'));
  } catch (err) {
    try {
      ExcelJS = require('J:/Aplikasi/finance-template/node_modules/exceljs');
    } catch (err2) {
      console.error('Cannot load ExcelJS:', err2);
      process.exit(1);
    }
  }
}

async function createBlankTestingWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Operations & Finance Team';
  workbook.lastModifiedBy = 'Operations Team';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ==========================================
  // SHEET 1: DASHBOARD_UJI (BLANK TEMPLATE)
  // ==========================================
  const dashSheet = workbook.addWorksheet('DASHBOARD_UJI', {
    views: [{ showGridLines: true }]
  });

  dashSheet.columns = [
    { width: 38 },
    { width: 34 },
    { width: 22 },
    { width: 24 }
  ];

  // Header Title
  dashSheet.mergeCells('A1:D1');
  const titleCell = dashSheet.getCell('A1');
  titleCell.value = 'DASHBOARD KENDALI MUTU (PRODUK BARU SELESAI PENGEMBANGAN)';
  titleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A34' } }; // Sage Dark
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(1).height = 36;

  // Metadata
  dashSheet.addRow([]);
  dashSheet.addRow(['Status Siklus Produk', 'Baru Selesai Koding (Menunggu Uji Internal & Pasangan Asli)']);
  dashSheet.addRow(['Versi Target Rilis', '1.2.0 (Couple & Family Edition)']);
  dashSheet.addRow(['Divisi Penguji (PIC)', 'Finance + Operations + Pilot Couples']);
  dashSheet.addRow(['Dokumen Panduan SOP', 'docs/02_PANDUAN_PENGUJIAN_PRODUK.md']);

  for (let r = 3; r <= 6; r++) {
    dashSheet.getCell(`A${r}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF475569' } };
    dashSheet.getCell(`B${r}`).font = { name: 'Arial', size: 10, color: { argb: 'FF0F172A' } };
  }

  // Metric Section
  dashSheet.addRow([]);
  const metricHeaderRow = dashSheet.addRow(['METRIK PENGUJIAN PRODUK BARU', 'FORMULA SPREADSHEET', 'NILAI SAAT INI', 'TARGET KELULUSAN']);
  metricHeaderRow.height = 24;
  metricHeaderRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D6A4F' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const metricsData = [
    ['Total Kasus Uji Fungsional', '=COUNTA(MATRIKS_UJI!A2:A27)', 26, 26],
    ['Skenario Lulus (PASS)', '=COUNTIF(MATRIKS_UJI!F2:F27, "PASS")', 0, 26],
    ['Skenario Gagal (FAIL)', '=COUNTIF(MATRIKS_UJI!F2:F27, "FAIL")', 0, 0],
    ['Skenario Belum Diuji (PENDING)', '=COUNTIF(MATRIKS_UJI!F2:F27, "PENDING")', 26, 0],
    ['Tingkat Kelulusan (Pass Rate)', '=C10/C9', 0.0, 1.0],
    ['Status Kesiapan Komersial', '=IF(C13=1, "LAYAK JUAL (READY TO SELL)", "DITAHAN (HOLD)")', 'DITAHAN (HOLD)', 'LAYAK JUAL']
  ];

  metricsData.forEach(row => {
    const r = dashSheet.addRow(row);
    r.height = 22;
    r.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    r.getCell(2).font = { name: 'Courier New', size: 9, color: { argb: 'FF475569' } };
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Format Pass Rate as %
  dashSheet.getCell('C13').numFmt = '0.0%';
  dashSheet.getCell('D13').numFmt = '0.0%';
  dashSheet.getCell('C14').font = { bold: true, color: { argb: 'FFDC2626' } }; // Red if on hold

  // Sign-off Section
  dashSheet.addRow([]);
  dashSheet.addRow([]);
  const signHeaderRow = dashSheet.addRow(['LEMBAR PERSETUJUAN RILIS BERTAHAP', 'PENANGGUNG JAWAB (PIC)', 'TANGGAL VERIFIKASI', 'STATUS KEPUTUSAN']);
  signHeaderRow.height = 24;
  signHeaderRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const signOffData = [
    ['Tahap 1: Verifikasi Fungsional Internal', 'Operations Team', '', '[Pending QA]'],
    ['Tahap 1: Verifikasi Rumus & Rekonsiliasi Saldo', 'Finance Team', '', '[Pending QA]'],
    ['Tahap 2: Uji Coba Pasangan Asli (UAT)', '3-5 Pilot Couples', '', '[Pending UAT]'],
    ['Persetujuan Akhir Rilis Penjualan Publik', 'Operations Lead', '', '[Pending Sign-Off]']
  ];

  signOffData.forEach(row => {
    const r = dashSheet.addRow(row);
    r.height = 22;
    r.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).font = { italic: true, color: { argb: 'FF64748B' } };
  });

  // ==========================================
  // SHEET 2: MATRIKS_UJI (BLANK TEMPLATE)
  // ==========================================
  const matrixSheet = workbook.addWorksheet('MATRIKS_UJI', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }]
  });

  matrixSheet.columns = [
    { header: 'Test ID', key: 'id', width: 14 },
    { header: 'Modul', key: 'module', width: 15 },
    { header: 'Fitur & Skenario', key: 'scenario', width: 28 },
    { header: 'Expected Result', key: 'expected', width: 55 },
    { header: 'Actual Result', key: 'actual', width: 35 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'PIC', key: 'pic', width: 15 },
    { header: 'Tanggal Uji', key: 'date', width: 14 },
    { header: 'Catatan / Evidence', key: 'notes', width: 45 }
  ];

  const headerRow = matrixSheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A34' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Raw data items with blank results
  const testCases = [
    ['TC-INP-01', 'Input Kas', 'Pengeluaran Kas Bersama', 'Mutasi tersimpan di sheet TRANSAKSI, saldo dompet terpotong, kartu Pengeluaran Bersama di DASHBOARD bertambah.', '', 'PENDING', 'Operations', '', ''],
    ['TC-INP-02', 'Input Kas', 'Pengeluaran Dompet Pribadi Suami', 'Saldo dompet Suami terpotong, pagu Kas Bersama tidak berkurang, mutasi teralokasi ke Pribadi Suami.', '', 'PENDING', 'Finance', '', ''],
    ['TC-INP-03', 'Input Kas', 'Pengeluaran Dompet Pribadi Istri', 'Saldo dompet Istri terpotong, pagu Kas Bersama tidak berkurang, mutasi teralokasi ke Pribadi Istri.', '', 'PENDING', 'Finance', '', ''],
    ['TC-INP-04', 'Input Kas', 'Pemasukan Gaji Bersama', 'Pemasukan tersimpan bertipe Pemasukan, saldo dompet penerima bertambah, kartu Total Pemasukan bertambah tepat.', '', 'PENDING', 'Finance', '', ''],
    ['TC-INP-05', 'Input Kas', 'Pintasan Tombol Cepat Cerdas', 'Satu ketukan pada Smart Preset mengisi nominal, peruntukan, kategori, dan catatan secara otomatis.', '', 'PENDING', 'Operations', '', ''],
    ['TC-BAL-01', 'Akuntansi', 'Kalkulasi Saldo per Dompet', 'Saldo akhir dompet sama dengan (Total Pemasukan + Transfer Masuk) - (Total Pengeluaran + Transfer Keluar).', '', 'PENDING', 'Finance', '', ''],
    ['TC-BAL-02', 'Akuntansi', 'Isolasi Saldo Awal Template', 'Saldo awal di baris TRX-INIT-001 menjadi saldo pembuka kas tanpa menggelembungkan arus kas bulanan.', '', 'PENDING', 'Finance', '', ''],
    ['TC-BAL-03', 'Akuntansi', 'Mutasi Transfer Antar-Dompet', 'Dompet asal terpotong, dompet tujuan bertambah nominal identik, total kas stabil, tercatat [Asal] ke [Tujuan].', '', 'PENDING', 'Finance', '', ''],
    ['TC-BAL-04', 'Akuntansi', 'Kartu Sisa Kas Berjalan', 'Kartu Sisa Kas Berjalan di Dashboard menghitung akurat sesuai formula =A6-E6 (Pemasukan - Pengeluaran).', '', 'PENDING', 'Finance', '', ''],
    ['TC-BAL-05', 'Akuntansi', 'Koreksi & Hapus Transaksi', 'Mengedit atau menghapus mutasi me-rollback saldo dompet terkait secara presisi ke posisi semula.', '', 'PENDING', 'Finance', '', ''],
    ['TC-SUM-01', 'Ringkasan', 'Arus Kas Bulan Kalender', 'Kartu dan tabel ringkasan menyajikan data yang sesuai dengan filter bulan pantauan (YYYY-MM).', '', 'PENDING', 'Finance', '', ''],
    ['TC-SUM-02', 'Ringkasan', 'Rekap Siklus Gajian Fleksibel', 'Ketika tanggal gajian disetel (misal: 25), Web App mengelompokkan data dari tanggal 25 s/d 24 bulan berikutnya.', '', 'PENDING', 'Finance', '', ''],
    ['TC-SUM-03', 'Ringkasan', 'Navigasi Siklus Dua Arah', 'Tombol navigasi siklus sebelumnya (Prev) dan berikutnya (Next) di Web App menyajikan data siklus terkait.', '', 'PENDING', 'Operations', '', ''],
    ['TC-SUM-04', 'Ringkasan', 'Distribusi Belanja Pasangan', 'Tabel ringkasan peruntukan di Dashboard memisahkan total belanja Kas Bersama, Pribadi Suami, dan Pribadi Istri.', '', 'PENDING', 'Finance', '', ''],
    ['TC-DSH-01', 'Visual', 'Bar Sparkline Anggaran', 'Kolom status progress di sheet BUDGET & POS menampilkan bilah hijau proporsional jika belanja di bawah limit.', '', 'PENDING', 'Finance', '', ''],
    ['TC-DSH-02', 'Visual', 'Indikator Batas Overbudget', 'Bilah progress bar otomatis berubah warna merah menyala saat belanja melebihi pagu anggaran kategori.', '', 'PENDING', 'Operations', '', ''],
    ['TC-DSH-03', 'Visual', 'Persentase Pemakaian Kuota', 'Kolom % Pemakaian terhitung akurat sesuai formula Realisasi / Anggaran tanpa pesan galat (#DIV/0!).', '', 'PENDING', 'Finance', '', ''],
    ['TC-VAL-01', 'Validasi', 'Nominal Kosong atau Nol', 'Menolak simpan transaksi bernilai <= 0 dengan peringatan ramah pengguna pada antarmuka Web App.', '', 'PENDING', 'Operations', '', ''],
    ['TC-VAL-02', 'Validasi', 'Nominal Negatif & Karakter Teks', 'Sistem mencegah input angka minus atau karakter non-numerik pada field nominal Web App.', '', 'PENDING', 'Operations', '', ''],
    ['TC-VAL-03', 'Validasi', 'Integritas Format Tanggal', 'Tanggal tersimpan dalam format kalender valid (YYYY-MM-DD) dan kolom bulan terisi otomatis formula TEXT.', '', 'PENDING', 'Operations', '', ''],
    ['TC-VAL-04', 'Validasi', 'Proteksi Konkurensi Pasangan', 'Suami dan istri input transaksi bersamaan via smartphone masing-masing; kedua baris tersimpan lengkap (LockService).', '', 'PENDING', 'Operations', '', ''],
    ['TC-CPY-01', 'Distribusi', 'Akses Link Trik /copy', 'Tautan /copy menampilkan laman resmi Google Make a copy tanpa memerlukan izin akses dari pemilik.', '', 'PENDING', 'Operations', '', ''],
    ['TC-CPY-02', 'Distribusi', 'Isolasi Berkas Pembeli', 'Berkas tersimpan mandiri di Drive pembeli; pengubahan data pembeli tidak berdampak pada Master Template.', '', 'PENDING', 'Operations', '', ''],
    ['TC-CPY-03', 'Distribusi', 'Otorisasi Script Pengguna', 'Dialog otorisasi keamanan Google berjalan mulus via opsi Advanced > Go to Family Finance Tracker (unsafe).', '', 'PENDING', 'Operations', '', ''],
    ['TC-CPY-04', 'Distribusi', 'Setup Otomatis Spreadsheet', 'Menjalankan setupFinanceTracker otomatis membentuk sheet CONFIG, TRANSAKSI, BUDGET & POS, dan DASHBOARD.', '', 'PENDING', 'Operations', '', ''],
    ['TC-CPY-05', 'Distribusi', 'Deploy Web App Mandiri', 'Pembeli berhasil men-deploy Web App dengan setelan Execute as: User accessing dan dibuka lancar di browser HP.', '', 'PENDING', 'Operations', '', ''],
    ['TC-CPY-06', 'Distribusi', 'Pasang ke Layar HP (PWA)', 'Add to Home Screen di Safari (iOS) dan Chrome (Android) menghasilkan shortcut layar penuh ramah jempol.', '', 'PENDING', 'Operations', '', ''],
    ['TC-CPY-07', 'Distribusi', 'Tutup Buku & Arsip Tahunan', 'Menu Tutup Buku & Arsipkan Tahun Lalu berhasil memindahkan data lampau ke ARSIP_YYYY dan mengoper saldo awal.', '', 'PENDING', 'Finance', '', '']
  ];

  testCases.forEach((tc, idx) => {
    const row = matrixSheet.addRow(tc);
    row.height = 20;

    // Zebra striping
    if (idx % 2 === 1) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      });
    }

    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF92400E' } };
    row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Light yellow PENDING badge

    row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const outputPath = path.join(__dirname, '..', 'docs', '02_PRODUCT_TESTING_CHECKLIST.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log('Workbook XLSX Template Kosong berhasil dibuat di:', outputPath);
}

createBlankTestingWorkbook().catch(err => {
  console.error('Gagal membuat XLSX:', err);
  process.exit(1);
});
