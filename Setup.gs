/**
 * Setup.gs - Generator Otomatis Struktur & Visual Google Sheets
 * Jalankan fungsi setupFinanceTracker() satu kali dari editor Apps Script.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Family Finance')
    .addItem('Jalankan Setup / Reset Template', 'setupFinanceTracker')
    .addToUi();
}

function setupFinanceTracker() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var palette = {
    primaryDark: '#1b4332',
    primary: '#2d6a4f',
    primaryLight: '#40916c',
    surface: '#e9f5ee',
    background: '#f8f9fa',
    border: '#d8e2dc',
    textMain: '#212529',
    textMuted: '#6c757d',
    white: '#ffffff',
    warning: '#f57c00',
    danger: '#d32f2f'
  };

  createConfigSheet(ss, palette);
  createTransactionsSheet(ss, palette);
  createBudgetSheet(ss, palette);
  createDashboardSheet(ss, palette);

  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }

  var dashboard = ss.getSheetByName('DASHBOARD');
  if (dashboard) {
    ss.setActiveSheet(dashboard);
  }

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('Setup Selesai! Seluruh sheet, formula, dan palet warna Sage Green telah disiapkan.');
}

function createConfigSheet(ss, palette) {
  var sheet = getOrCreateSheet(ss, 'CONFIG');
  sheet.clear();
  sheet.setTabColor(palette.primaryLight);

  var headers = [
    ['PENGATURAN KELUARGA', '', 'KATEGORI PENGELUARAN', 'ALOKASI POS', 'DOMPET / AKUN', 'PRESET CEPAT WEB APP', 'NOMINAL DEFAULT']
  ];
  sheet.getRange(1, 1, 1, 7).setValues(headers)
    .setBackground(palette.primaryDark)
    .setFontColor(palette.white)
    .setFontWeight('bold')
    .setFontSize(10);

  var configData = [
    ['Label Suami', 'Ayah', 'Belanja Pasar & Dapur', 'Kas Bersama', 'Kas Tunai Rumah', 'Bensin Motor', 35000],
    ['Email Suami', 'suami@gmail.com', 'Makan Luar & Jajan', 'Kas Bersama', 'Rekening BCA Bersama', 'Kopi Pagi', 22000],
    ['Label Istri', 'Bunda', 'Listrik & Utilitas', 'Kas Bersama', 'BCA Pribadi Suami', 'Belanja Sayur', 75000],
    ['Email Istri', 'istri@gmail.com', 'Internet & Pulsa', 'Kas Bersama', 'BCA Pribadi Istri', 'Galon & Gas', 45000],
    ['Bulan Acuan', '=TEXT(TODAY(), "yyyy-mm")', 'Kebutuhan Anak & Les', 'Kas Bersama', 'GoPay Suami', 'Token Listrik', 100000],
    ['', '', 'Transportasi & Bensin', 'Kas Bersama', 'GoPay Istri', 'Jajan Anak', 20000],
    ['', '', 'Cicilan & Kewajiban', 'Kas Bersama', 'ShopeePay', '', ''],
    ['', '', 'Pribadi Suami', 'Pribadi Suami', '', '', ''],
    ['', '', 'Pribadi Istri', 'Pribadi Istri', '', '', ''],
    ['', '', 'Sedekah & Orang Tua', 'Kas Bersama', '', '', ''],
    ['', '', 'Darurat & Tabungan', 'Kas Bersama', '', '', ''],
    ['', '', 'Lain-lain', 'Kas Bersama', '', '', '']
  ];

  sheet.getRange(2, 1, configData.length, 7).setValues(configData);
  sheet.getRange(2, 7, configData.length, 1).setNumberFormat('Rp #,##0');
  sheet.getRange(1, 1, configData.length + 1, 7).setFontFamily('Roboto');
  
  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 180);
  sheet.setColumnWidth(6, 160);
  sheet.setColumnWidth(7, 140);
}

function createTransactionsSheet(ss, palette) {
  var sheet = getOrCreateSheet(ss, 'TRANSAKSI');
  sheet.clear();
  sheet.setTabColor(palette.primary);

  var headers = [
    ['ID', 'TANGGAL', 'BULAN', 'TIPE', 'KATEGORI', 'PERUNTUKAN', 'DOMPET', 'NOMINAL', 'CATATAN', 'DIINPUT OLEH', 'WAKTU INPUT']
  ];

  sheet.getRange(1, 1, 1, 11).setValues(headers)
    .setBackground(palette.primaryDark)
    .setFontColor(palette.white)
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center');

  sheet.setFrozenRows(1);

  var initialRows = [
    [
      'TRX-001',
      new Date(),
      '=TEXT(B2, "yyyy-mm")',
      'Pengeluaran',
      'Belanja Pasar & Dapur',
      'Kas Bersama',
      'Rekening BCA Bersama',
      150000,
      'Belanja mingguan pasar',
      'suami@gmail.com',
      new Date()
    ],
    [
      'TRX-002',
      new Date(),
      '=TEXT(B3, "yyyy-mm")',
      'Pengeluaran',
      'Transportasi & Bensin',
      'Pribadi Suami',
      'BCA Pribadi Suami',
      50000,
      'Isi bensin motor kantor',
      'suami@gmail.com',
      new Date()
    ]
  ];

  sheet.getRange(2, 1, initialRows.length, 11).setValues(initialRows);

  sheet.getRange('B2:B').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('H2:H').setNumberFormat('Rp #,##0');
  sheet.getRange('K2:K').setNumberFormat('yyyy-mm-dd hh:mm');

  var configSheet = ss.getSheetByName('CONFIG');
  var categoryRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(configSheet.getRange('C2:C15'), true)
    .build();
  sheet.getRange('E2:E5000').setDataValidation(categoryRule);

  var typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pengeluaran', 'Pemasukan', 'Transfer'], true)
    .build();
  sheet.getRange('D2:D5000').setDataValidation(typeRule);

  var scopeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Kas Bersama', 'Pribadi Suami', 'Pribadi Istri', 'Transfer'], true)
    .build();
  sheet.getRange('F2:F5000').setDataValidation(scopeRule);

  var walletRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(configSheet.getRange('E2:E15'), true)
    .build();
  sheet.getRange('G2:G5000').setDataValidation(walletRule);

  sheet.setColumnWidth(1, 90);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 90);
  sheet.setColumnWidth(4, 110);
  sheet.setColumnWidth(5, 180);
  sheet.setColumnWidth(6, 130);
  sheet.setColumnWidth(7, 160);
  sheet.setColumnWidth(8, 130);
  sheet.setColumnWidth(9, 220);
  sheet.setColumnWidth(10, 160);
  sheet.setColumnWidth(11, 140);
}

function createBudgetSheet(ss, palette) {
  var sheet = getOrCreateSheet(ss, 'BUDGET & POS');
  sheet.clear();
  sheet.setTabColor(palette.primaryLight);

  var titleRange = sheet.getRange('A1:G1');
  titleRange.merge();
  titleRange.setValue('ALOKASI ANGGARAN & REALISASI BULAN INI')
    .setBackground(palette.primaryDark)
    .setFontColor(palette.white)
    .setFontWeight('bold')
    .setFontSize(12)
    .setHorizontalAlignment('center');

  sheet.getRange('A2:G2').setValues([[
    'KATEGORI',
    'POS',
    'ANGGARAN (LIMIT)',
    'REALISASI',
    'SISA KUOTA',
    '% PEMAKAIAN',
    'STATUS PROGRESS'
  ]])
  .setBackground(palette.surface)
  .setFontColor(palette.primaryDark)
  .setFontWeight('bold')
  .setFontSize(10);

  var categories = [
    ['Belanja Pasar & Dapur', 'Kas Bersama', 3000000],
    ['Makan Luar & Jajan', 'Kas Bersama', 1200000],
    ['Listrik & Utilitas', 'Kas Bersama', 900000],
    ['Internet & Pulsa', 'Kas Bersama', 450000],
    ['Kebutuhan Anak & Les', 'Kas Bersama', 1500000],
    ['Transportasi & Bensin', 'Kas Bersama', 800000],
    ['Cicilan & Kewajiban', 'Kas Bersama', 2500000],
    ['Pribadi Suami', 'Pribadi Suami', 1000000],
    ['Pribadi Istri', 'Pribadi Istri', 1000000],
    ['Sedekah & Orang Tua', 'Kas Bersama', 1000000],
    ['Darurat & Tabungan', 'Kas Bersama', 2000000],
    ['Lain-lain', 'Kas Bersama', 500000]
  ];

  var rows = [];
  for (var i = 0; i < categories.length; i++) {
    var r = i + 3;
    rows.push([
      categories[i][0],
      categories[i][1],
      categories[i][2],
      '=SUMIFS(TRANSAKSI!$H:$H, TRANSAKSI!$E:$E, A' + r + ', TRANSAKSI!$D:$D, "Pengeluaran", TRANSAKSI!$C:$C, DASHBOARD!$B$3)',
      '=C' + r + '-D' + r,
      '=IF(C' + r + '>0, D' + r + '/C' + r + ', 0)',
      '=SPARKLINE(D' + r + ', {"charttype","bar";"max",C' + r + ';"color1",IF(D' + r + '>C' + r + ',"#d32f2f","#2d6a4f")})'
    ]);
  }

  sheet.getRange(3, 1, rows.length, 7).setValues(rows);

  sheet.getRange('C3:E' + (rows.length + 2)).setNumberFormat('Rp #,##0');
  sheet.getRange('F3:F' + (rows.length + 2)).setNumberFormat('0.0%');

  var totalRow = rows.length + 3;
  sheet.getRange(totalRow, 1).setValue('TOTAL ANGGARAN').setFontWeight('bold');
  sheet.getRange(totalRow, 3).setFormula('=SUM(C3:C' + (totalRow - 1) + ')').setFontWeight('bold').setNumberFormat('Rp #,##0');
  sheet.getRange(totalRow, 4).setFormula('=SUM(D3:D' + (totalRow - 1) + ')').setFontWeight('bold').setNumberFormat('Rp #,##0');
  sheet.getRange(totalRow, 5).setFormula('=SUM(E3:E' + (totalRow - 1) + ')').setFontWeight('bold').setNumberFormat('Rp #,##0');
  sheet.getRange(totalRow, 6).setFormula('=D' + totalRow + '/C' + totalRow).setFontWeight('bold').setNumberFormat('0.0%');
  sheet.getRange(totalRow, 1, 1, 7).setBackground(palette.surface);

  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 130);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 110);
  sheet.setColumnWidth(7, 160);
}

function createDashboardSheet(ss, palette) {
  var sheet = getOrCreateSheet(ss, 'DASHBOARD');
  sheet.clear();
  sheet.setTabColor(palette.primaryDark);
  sheet.showGridLines(true);

  sheet.getRange('A1:G1').merge()
    .setValue('FAMILY FINANCE TRACKER — KAS RUMAH TANGGA')
    .setBackground(palette.primaryDark)
    .setFontColor(palette.white)
    .setFontWeight('bold')
    .setFontSize(14)
    .setHorizontalAlignment('center');

  sheet.getRange('A3').setValue('Bulan Pantauan:').setFontWeight('bold').setFontColor(palette.textMuted);
  sheet.getRange('B3').setValue('=TEXT(TODAY(), "yyyy-mm")')
    .setFontWeight('bold')
    .setBackground(palette.surface)
    .setHorizontalAlignment('center');

  sheet.getRange('D3').setValue('Update Terakhir:').setFontWeight('bold').setFontColor(palette.textMuted);
  sheet.getRange('E3').setValue('=NOW()')
    .setNumberFormat('yyyy-mm-dd hh:mm')
    .setHorizontalAlignment('center');

  var cards = [
    { label: 'TOTAL PEMASUKAN', formula: '=SUMIFS(TRANSAKSI!H:H, TRANSAKSI!D:D, "Pemasukan", TRANSAKSI!C:C, B3)', col: 1 },
    { label: 'PENGELUARAN BERSAMA', formula: '=SUMIFS(TRANSAKSI!H:H, TRANSAKSI!D:D, "Pengeluaran", TRANSAKSI!F:F, "Kas Bersama", TRANSAKSI!C:C, B3)', col: 3 },
    { label: 'TOTAL PENGELUARAN', formula: '=SUMIFS(TRANSAKSI!H:H, TRANSAKSI!D:D, "Pengeluaran", TRANSAKSI!C:C, B3)', col: 5 },
    { label: 'SISA KAS BERJALAN', formula: '=A6-E6', col: 7 }
  ];

  for (var c = 0; c < cards.length; c++) {
    var startCol = cards[c].col;
    sheet.getRange(5, startCol).setValue(cards[c].label)
      .setFontSize(9)
      .setFontColor(palette.textMuted)
      .setFontWeight('bold');
    
    sheet.getRange(6, startCol).setFormula(cards[c].formula)
      .setFontSize(16)
      .setFontWeight('bold')
      .setFontColor(palette.primaryDark)
      .setNumberFormat('Rp #,##0');
      
    sheet.getRange(5, startCol, 2, 1)
      .setBackground(palette.surface)
      .setBorder(true, true, true, true, false, false, palette.border, SpreadsheetApp.BorderStyle.SOLID);
  }

  sheet.getRange('A9:G9').merge()
    .setValue('RINGKASAN PERUNTUKAN BULAN INI')
    .setBackground(palette.primary)
    .setFontColor(palette.white)
    .setFontWeight('bold')
    .setFontSize(10);

  sheet.getRange('A10:G10').setValues([[
    'Peruntukan', 'Total Belanja', 'Rasio', '', '', '', ''
  ]]).setFontWeight('bold').setBackground(palette.surface);

  var scopes = [
    ['Kas Bersama', '=SUMIFS(TRANSAKSI!H:H, TRANSAKSI!D:D, "Pengeluaran", TRANSAKSI!F:F, "Kas Bersama", TRANSAKSI!C:C, B3)'],
    ['Pribadi Suami', '=SUMIFS(TRANSAKSI!H:H, TRANSAKSI!D:D, "Pengeluaran", TRANSAKSI!F:F, "Pribadi Suami", TRANSAKSI!C:C, B3)'],
    ['Pribadi Istri', '=SUMIFS(TRANSAKSI!H:H, TRANSAKSI!D:D, "Pengeluaran", TRANSAKSI!F:F, "Pribadi Istri", TRANSAKSI!C:C, B3)']
  ];

  for (var s = 0; s < scopes.length; s++) {
    var rowIdx = 11 + s;
    sheet.getRange(rowIdx, 1).setValue(scopes[s][0]);
    sheet.getRange(rowIdx, 2).setFormula(scopes[s][1]).setNumberFormat('Rp #,##0');
    sheet.getRange(rowIdx, 3).setFormula('=IF($E$6>0, B' + rowIdx + '/$E$6, 0)').setNumberFormat('0.0%');
  }

  sheet.getRange('A15:G15').merge()
    .setValue('5 TRANSAKSI TERAKHIR')
    .setBackground(palette.primary)
    .setFontColor(palette.white)
    .setFontWeight('bold')
    .setFontSize(10);

  sheet.getRange('A16:G16').setValues([[
    'Tanggal', 'Tipe', 'Kategori', 'Peruntukan', 'Nominal', 'Catatan', 'Diinput Oleh'
  ]]).setFontWeight('bold').setBackground(palette.surface);

  for (var t = 0; t < 5; t++) {
    var tRow = 17 + t;
    var srcRow = 2 + t;
    sheet.getRange(tRow, 1).setFormula('=IF(TRANSAKSI!B' + srcRow + '<>"", TRANSAKSI!B' + srcRow + ', "")').setNumberFormat('yyyy-mm-dd');
    sheet.getRange(tRow, 2).setFormula('=IF(TRANSAKSI!D' + srcRow + '<>"", TRANSAKSI!D' + srcRow + ', "")');
    sheet.getRange(tRow, 3).setFormula('=IF(TRANSAKSI!E' + srcRow + '<>"", TRANSAKSI!E' + srcRow + ', "")');
    sheet.getRange(tRow, 4).setFormula('=IF(TRANSAKSI!F' + srcRow + '<>"", TRANSAKSI!F' + srcRow + ', "")');
    sheet.getRange(tRow, 5).setFormula('=IF(TRANSAKSI!H' + srcRow + '<>"", TRANSAKSI!H' + srcRow + ', "")').setNumberFormat('Rp #,##0');
    sheet.getRange(tRow, 6).setFormula('=IF(TRANSAKSI!I' + srcRow + '<>"", TRANSAKSI!I' + srcRow + ', "")');
    sheet.getRange(tRow, 7).setFormula('=IF(TRANSAKSI!J' + srcRow + '<>"", TRANSAKSI!J' + srcRow + ', "")');
  }

  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 130);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 130);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 200);
  sheet.setColumnWidth(7, 180);
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}
