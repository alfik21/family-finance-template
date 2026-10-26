/**
 * Code.gs - Backend API Google Apps Script untuk Web App Family Finance Tracker
 * Mendukung RBAC Akun Master vs Anggota, Kepemilikan Dompet Eksplisit, dan Zero-Symbol UI.
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('WebApp');
  return template.evaluate()
    .setTitle('Family Finance Tracker')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getInitialData() {
  var userEmail = '';
  try {
    userEmail = Session.getActiveUser().getEmail();
  } catch (err) {
    userEmail = '';
  }

  var effectiveEmail = '';
  try {
    effectiveEmail = Session.getEffectiveUser().getEmail();
  } catch (err) {
    effectiveEmail = '';
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('CONFIG');
  var transSheet = ss.getSheetByName('TRANSAKSI');
  var dashSheet = ss.getSheetByName('DASHBOARD');

  var categories = [];
  var wallets = [];
  var presets = [];
  var salaryDate = 25;

  var settings = {};
  if (configSheet) {
    var settingRows = configSheet.getRange('A2:B15').getValues();
    for (var s = 0; s < settingRows.length; s++) {
      var key = (settingRows[s][0] || '').toString().trim();
      var val = settingRows[s][1];
      if (key) {
        settings[key] = val;
      }
    }

    var catValues = configSheet.getRange('C2:C50').getValues();
    for (var i = 0; i < catValues.length; i++) {
      var cat = catValues[i][0];
      if (cat && cat.toString().trim() !== '') {
        categories.push(cat.toString().trim());
      }
    }

    var walValues = configSheet.getRange('E2:F50').getValues();
    for (var j = 0; j < walValues.length; j++) {
      var walName = (walValues[j][0] || '').toString().trim();
      var walOwner = (walValues[j][1] || '').toString().trim() || 'Kas Bersama';
      if (walName !== '') {
        wallets.push({
          name: walName,
          owner: walOwner
        });
      }
    }

    // Baca preset cepat secara cerdas & tahan pergeseran kolom
    var configHeaderRow = configSheet.getRange('A1:J1').getValues()[0];
    var colPreset = 7;
    var colNominal = 8;

    for (var h = 0; h < configHeaderRow.length; h++) {
      var hText = (configHeaderRow[h] || '').toString().toUpperCase();
      if (hText.indexOf('PRESET') !== -1) {
        colPreset = h + 1;
      } else if (hText.indexOf('NOMINAL') !== -1) {
        colNominal = h + 1;
      }
    }

    var maxCol = Math.max(colPreset, colNominal, 8);
    var preRaw = configSheet.getRange(2, 1, 19, maxCol).getValues();

    for (var k = 0; k < preRaw.length; k++) {
      var rowData = preRaw[k];
      var rawName = (rowData[colPreset - 1] || '').toString().trim();
      var rawAmt = Number(rowData[colNominal - 1]) || 0;

      // Deteksi anomali: jika rawName berupa angka murni (seperti '35000') dan rawAmt 0,
      // artinya kolom bergeser dari template versi sebelumnya (kolom F adalah nama, G adalah angka)
      if (/^\d+$/.test(rawName) && rawAmt === 0 && colPreset > 1) {
        var prevColVal = (rowData[colPreset - 2] || '').toString().trim();
        if (prevColVal && isNaN(Number(prevColVal))) {
          rawAmt = Number(rawName);
          rawName = prevColVal;
        }
      }

      if (rawName && !/^\d+$/.test(rawName) && rawAmt > 0) {
        presets.push({
          name: rawName,
          amount: rawAmt
        });
      }
    }

    if (presets.length === 0) {
      presets = [
        { name: 'Bensin Motor', amount: 35000, category: 'Transportasi & Bensin', scope: 'Kas Bersama' },
        { name: 'Kopi Pagi', amount: 22000, category: 'Makan Luar & Jajan', scope: 'Pribadi Suami' },
        { name: 'Belanja Sayur', amount: 75000, category: 'Belanja Pasar & Dapur', scope: 'Kas Bersama' },
        { name: 'Token Listrik', amount: 100000, category: 'Listrik & Utilitas', scope: 'Kas Bersama' },
        { name: 'Galon dan Gas', amount: 45000, category: 'Listrik & Utilitas', scope: 'Kas Bersama' }
      ];
    }

    var salVal = settings['Siklus Gajian (Tgl)'];
    if (salVal && !isNaN(Number(salVal))) {
      salaryDate = Number(salVal);
    }
  }

  var suamiLabel = settings['Label Suami'] || 'Ayah';
  var suamiEmail = (settings['Email Suami'] || '').toString().trim();
  var istriLabel = settings['Label Istri'] || 'Bunda';
  var istriEmail = (settings['Email Istri'] || '').toString().trim();
  var masterEmail = (settings['Email Master'] || effectiveEmail || '').toString().trim();
  var masterRole = (settings['Peran Master'] || 'Suami').toString().trim();

  // Deteksi RBAC: Apakah pengguna aktif adalah Master?
  var isMaster = false;
  var cleanActive = (userEmail || '').toLowerCase().trim();
  var cleanMaster = masterEmail.toLowerCase();
  var cleanEff = effectiveEmail.toLowerCase();

  if (!cleanActive) {
    // Mode demo lokal atau permission restricted
    isMaster = true;
  } else if ((cleanEff && cleanActive === cleanEff) || (cleanMaster && cleanActive === cleanMaster)) {
    isMaster = true;
  }

  // Tentukan user role tampilan
  var userRole = 'Suami (' + suamiLabel + ')';
  if (cleanActive && cleanActive === istriEmail.toLowerCase()) {
    userRole = 'Istri (' + istriLabel + ')';
  } else if (cleanActive && cleanActive === suamiEmail.toLowerCase()) {
    userRole = 'Suami (' + suamiLabel + ')';
  } else if (masterRole === 'Istri' && isMaster) {
    userRole = 'Istri (' + istriLabel + ')';
  }

  var recent = [];
  var allTxForPresets = [];
  if (transSheet) {
    var lastRow = transSheet.getLastRow();
    if (lastRow > 1) {
      var scanRows = Math.min(100, lastRow - 1);
      var startRow = Math.max(2, lastRow - scanRows + 1);
      var rawRows = transSheet.getRange(startRow, 1, scanRows, 11).getValues();

      for (var r = rawRows.length - 1; r >= 0; r--) {
        var row = rawRows[r];
        if (row[0]) {
          var dateFormatted = '';
          if (row[1] instanceof Date) {
            dateFormatted = Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd');
          } else {
            dateFormatted = row[1] ? row[1].toString() : '';
          }

          var authorEmail = (row[9] || '').toString();
          var authorRole = 'Keluarga';
          if (suamiEmail && authorEmail.toLowerCase().indexOf(suamiEmail.toLowerCase()) !== -1) {
            authorRole = 'Suami (' + suamiLabel + ')';
          } else if (istriEmail && authorEmail.toLowerCase().indexOf(istriEmail.toLowerCase()) !== -1) {
            authorRole = 'Istri (' + istriLabel + ')';
          } else if (authorEmail.toLowerCase().indexOf('suami') !== -1) {
            authorRole = 'Suami (' + suamiLabel + ')';
          } else if (authorEmail.toLowerCase().indexOf('istri') !== -1) {
            authorRole = 'Istri (' + istriLabel + ')';
          } else if (authorEmail) {
            authorRole = authorEmail.split('@')[0];
          }

          var txObj = {
            id: row[0],
            date: dateFormatted,
            type: row[3],
            category: row[4],
            scope: row[5],
            wallet: row[6],
            amount: Number(row[7]) || 0,
            note: row[8] || '',
            author: authorEmail,
            authorRole: authorRole
          };

          allTxForPresets.push(txObj);
          if (recent.length < 6) {
            recent.push(txObj);
          }
        }
      }
    }
  }

  var smartPresets = extractSmartPresets(allTxForPresets, presets, 6);

  // Hitung saldo kumulatif riil dompet & ringkasan siklus gajian berjalan
  var fin = calculateFinancialState(transSheet, wallets, salaryDate);

  var summary = {
    jointBalance: fin.jointBalance,
    monthExpense: fin.cycleExpense,
    monthIncome: fin.cycleIncome,
    cycleJointExpense: fin.cycleJointExpense,
    cycleLabel: fin.cycleLabel,
    suamiBalance: fin.suamiBalance,
    istriBalance: fin.istriBalance
  };

  // Sinkronkan ke sheet DASHBOARD jika tersedia
  if (dashSheet) {
    try {
      dashSheet.getRange('A6').setValue(fin.cycleIncome);
      dashSheet.getRange('C6').setValue(fin.cycleJointExpense);
      dashSheet.getRange('E6').setValue(fin.cycleExpense);
      dashSheet.getRange('G6').setValue(fin.jointBalance);
    } catch (e) {}
  }

  return {
    userEmail: userEmail,
    effectiveEmail: effectiveEmail,
    userRole: userRole,
    isMaster: isMaster,
    accounts: {
      suamiLabel: suamiLabel,
      suamiEmail: suamiEmail,
      istriLabel: istriLabel,
      istriEmail: istriEmail,
      masterEmail: masterEmail,
      masterRole: masterRole
    },
    categories: categories,
    wallets: wallets,
    walletBalances: fin.walletBalances,
    presets: smartPresets,
    defaultPresets: presets,
    salaryDate: salaryDate,
    recent: recent,
    summary: summary,
    pendingArchive: checkPendingArchive()
  };
}

function calculateFinancialState(transSheet, wallets, salaryDate) {
  var walletMap = {};
  (wallets || []).forEach(function(w) {
    var name = typeof w === 'object' ? w.name : w;
    var owner = (typeof w === 'object' && w.owner) ? w.owner : 'Kas Bersama';
    if (name) {
      walletMap[name] = {
        name: name,
        owner: owner,
        balance: 0
      };
    }
  });

  var today = new Date();
  var salDate = Number(salaryDate) || 25;
  var cycleStart, cycleEnd;
  if (today.getDate() >= salDate) {
    cycleStart = new Date(today.getFullYear(), today.getMonth(), salDate, 0, 0, 0);
    cycleEnd = new Date(today.getFullYear(), today.getMonth() + 1, salDate - 1, 23, 59, 59);
  } else {
    cycleStart = new Date(today.getFullYear(), today.getMonth() - 1, salDate, 0, 0, 0);
    cycleEnd = new Date(today.getFullYear(), today.getMonth(), salDate - 1, 23, 59, 59);
  }

  var cycleExpense = 0;
  var cycleIncome = 0;
  var cycleJointExpense = 0;

  var matchWalletKey = function(wStr) {
    if (!wStr) return null;
    var clean = wStr.replace(/\s*\[.*?\]\s*$/, '').trim().toLowerCase();
    for (var k in walletMap) {
      if (k.toLowerCase() === clean || k.toLowerCase() === wStr.trim().toLowerCase()) {
        return k;
      }
    }
    return null;
  };

  if (transSheet) {
    var lastRow = transSheet.getLastRow();
    if (lastRow > 1) {
      var rows = transSheet.getRange(2, 1, lastRow - 1, 11).getValues();
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (!r[0]) continue;

        var rawDate = r[1];
        var dObj = (rawDate instanceof Date) ? rawDate : new Date(rawDate);
        var type = r[3];
        var scope = r[5];
        var walletStr = (r[6] || '').toString();
        var amount = Number(r[7]) || 0;

        // 1. Mutasi Akumulatif Riil Tiap Dompet
        if (type === 'Pemasukan') {
          var kIn = matchWalletKey(walletStr);
          if (kIn) walletMap[kIn].balance += amount;
        } else if (type === 'Pengeluaran') {
          var kOut = matchWalletKey(walletStr);
          if (kOut) walletMap[kOut].balance -= amount;
        } else if (type === 'Transfer') {
          var parts = walletStr.split(/\s+ke\s+/i);
          if (parts.length === 2) {
            var kFrom = matchWalletKey(parts[0]);
            var kTo = matchWalletKey(parts[1]);
            if (kFrom) walletMap[kFrom].balance -= amount;
            if (kTo) walletMap[kTo].balance += amount;
          }
        }

        // 2. Filter Mutasi Siklus Gajian Berjalan
        if (!isNaN(dObj.getTime()) && dObj >= cycleStart && dObj <= cycleEnd) {
          if (type === 'Pengeluaran') {
            cycleExpense += amount;
            if (scope === 'Kas Bersama') cycleJointExpense += amount;
          } else if (type === 'Pemasukan') {
            if (category !== 'Saldo Awal Tahun') {
              cycleIncome += amount;
            }
          }
        }
      }
    }
  }

  var jointBalance = 0;
  var suamiBalance = 0;
  var istriBalance = 0;
  var walletList = [];

  for (var k in walletMap) {
    var item = walletMap[k];
    walletList.push(item);
    if (item.owner === 'Kas Bersama') {
      jointBalance += item.balance;
    } else if (item.owner === 'Suami') {
      suamiBalance += item.balance;
    } else if (item.owner === 'Istri') {
      istriBalance += item.balance;
    }
  }

  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var cycleLabel = cycleStart.getDate() + ' ' + monthNames[cycleStart.getMonth()] + ' - ' +
                   cycleEnd.getDate() + ' ' + monthNames[cycleEnd.getMonth()];

  return {
    walletBalances: walletList,
    jointBalance: jointBalance,
    suamiBalance: suamiBalance,
    istriBalance: istriBalance,
    cycleExpense: cycleExpense,
    cycleIncome: cycleIncome,
    cycleJointExpense: cycleJointExpense,
    cycleLabel: cycleLabel
  };
}

function checkPendingArchive() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var transSheet = ss.getSheetByName('TRANSAKSI');
    if (!transSheet) return { hasPending: false, pendingYears: [] };

    var lastRow = transSheet.getLastRow();
    if (lastRow <= 1) return { hasPending: false, pendingYears: [] };

    var currentYear = new Date().getFullYear();
    var rawDates = transSheet.getRange(2, 2, lastRow - 1, 1).getValues();
    var yearsMap = {};

    for (var i = 0; i < rawDates.length; i++) {
      var d = rawDates[i][0];
      if (!d) continue;
      var dateObj = (d instanceof Date) ? d : new Date(d);
      var yr = dateObj.getFullYear();
      if (!isNaN(yr) && yr < currentYear) {
        yearsMap[yr] = true;
      }
    }

    var pendingYears = Object.keys(yearsMap).map(Number).sort();
    return {
      hasPending: pendingYears.length > 0,
      pendingYears: pendingYears
    };
  } catch (e) {
    return { hasPending: false, pendingYears: [], error: e.toString() };
  }
}

function closeAndArchiveYear(targetYear) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Server sedang sibuk, silakan coba sesaat lagi.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = ss.getSheetByName('CONFIG');
    var transSheet = ss.getSheetByName('TRANSAKSI');
    if (!transSheet) return { success: false, message: 'Sheet TRANSAKSI tidak ditemukan.' };

    var activeEmail = '';
    try { activeEmail = Session.getActiveUser().getEmail().toLowerCase().trim(); } catch (e) {}
    var effEmail = '';
    try { effEmail = Session.getEffectiveUser().getEmail().toLowerCase().trim(); } catch (e) {}
    var currentMaster = configSheet ? (configSheet.getRange('B6').getValue() || '').toString().toLowerCase().trim() : '';

    if (activeEmail && activeEmail !== effEmail && activeEmail !== currentMaster) {
      return { success: false, message: 'Akses ditolak: Hanya Akun Master yang dapat melakukan tutup buku tahunan.' };
    }

    var lastRow = transSheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, message: 'Tidak ada data transaksi di sheet TRANSAKSI.' };
    }

    var allData = transSheet.getRange(2, 1, lastRow - 1, 11).getValues();
    var targetYr = Number(targetYear);
    if (!targetYr || isNaN(targetYr)) {
      targetYr = new Date().getFullYear() - 1;
    }

    var archiveRows = [];
    var remainingRows = [];
    var totalIncome = 0;
    var totalExpense = 0;
    var netCashflow = 0;
    var carryoverBalance = 0;

    for (var i = 0; i < allData.length; i++) {
      var row = allData[i];
      var rawDate = row[1];
      if (!rawDate) continue;

      var dateObj = (rawDate instanceof Date) ? rawDate : new Date(rawDate);
      var rowYr = dateObj.getFullYear();
      var type = row[3];
      var scope = row[5];
      var amount = Number(row[7]) || 0;

      if (rowYr === targetYr) {
        archiveRows.push(row);
        var walStr = (row[6] || '').toString();
        if (type === 'Pemasukan') {
          totalIncome += amount;
          if (scope === 'Kas Bersama' || walStr.indexOf('Kas Bersama') !== -1) carryoverBalance += amount;
        } else if (type === 'Pengeluaran') {
          totalExpense += amount;
          if (scope === 'Kas Bersama' || walStr.indexOf('Kas Bersama') !== -1) carryoverBalance -= amount;
        } else if (type === 'Transfer') {
          var parts = walStr.split(/\s+ke\s+/i);
          if (parts.length === 2) {
            var fromIsJoint = parts[0].indexOf('Kas Bersama') !== -1;
            var toIsJoint = parts[1].indexOf('Kas Bersama') !== -1;
            if (toIsJoint && !fromIsJoint) {
              carryoverBalance += amount;
            } else if (fromIsJoint && !toIsJoint) {
              carryoverBalance -= amount;
            }
          }
        }
      } else {
        remainingRows.push(row);
      }
    }

    if (archiveRows.length === 0) {
      return { success: false, message: 'Tidak ditemukan transaksi untuk tahun ' + targetYr + ' di sheet TRANSAKSI.' };
    }

    netCashflow = totalIncome - totalExpense;

    var archiveSheetName = 'ARSIP_' + targetYr;
    var archiveSheet = ss.getSheetByName(archiveSheetName);
    if (!archiveSheet) {
      archiveSheet = ss.insertSheet(archiveSheetName);
    } else {
      archiveSheet.clear();
    }

    archiveSheet.setTabColor('#2d6a4f');

    var titleRange = archiveSheet.getRange('A1:K1');
    titleRange.merge();
    titleRange.setValue('ARSIP TRANSAKSI TAHUN ' + targetYr + ' (DITUTUP SECARA PERMANEN)')
      .setBackground('#1b4332')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontSize(11)
      .setHorizontalAlignment('center');

    archiveSheet.getRange('A2:B2').merge().setValue('TOTAL PEMASUKAN TAHUNAN').setFontSize(9).setFontWeight('bold').setFontColor('#6c757d').setBackground('#f8f9fa');
    archiveSheet.getRange('C2:D2').merge().setValue('TOTAL PENGELUARAN TAHUNAN').setFontSize(9).setFontWeight('bold').setFontColor('#6c757d').setBackground('#f8f9fa');
    archiveSheet.getRange('E2:F2').merge().setValue('ARUS KAS BERSIH').setFontSize(9).setFontWeight('bold').setFontColor('#6c757d').setBackground('#f8f9fa');
    archiveSheet.getRange('G2:H2').merge().setValue('SALDO KAS DIOPER KE TAHUN BARU').setFontSize(9).setFontWeight('bold').setFontColor('#6c757d').setBackground('#f8f9fa');
    archiveSheet.getRange('I2:K2').merge().setValue('STATUS PENUTUPAN BUKU').setFontSize(9).setFontWeight('bold').setFontColor('#6c757d').setBackground('#f8f9fa');

    archiveSheet.getRange('A3:B3').merge().setValue(totalIncome).setNumberFormat('Rp #,##0').setFontWeight('bold').setFontSize(11).setFontColor('#1b4332');
    archiveSheet.getRange('C3:D3').merge().setValue(totalExpense).setNumberFormat('Rp #,##0').setFontWeight('bold').setFontSize(11).setFontColor('#d32f2f');
    archiveSheet.getRange('E3:F3').merge().setValue(netCashflow).setNumberFormat('Rp #,##0').setFontWeight('bold').setFontSize(11).setFontColor(netCashflow >= 0 ? '#1b4332' : '#d32f2f');
    archiveSheet.getRange('G3:H3').merge().setValue(carryoverBalance).setNumberFormat('Rp #,##0').setFontWeight('bold').setFontSize(11).setFontColor('#2d6a4f');
    archiveSheet.getRange('I3:K3').merge().setValue('Selesai Ditutup pada ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')).setFontSize(9).setFontColor('#6c757d');

    var headers = [
      ['ID', 'TANGGAL', 'BULAN', 'TIPE', 'KATEGORI', 'PERUNTUKAN', 'DOMPET', 'NOMINAL', 'CATATAN', 'DIINPUT OLEH', 'WAKTU INPUT']
    ];
    archiveSheet.getRange(5, 1, 1, 11).setValues(headers)
      .setBackground('#2d6a4f')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontSize(9)
      .setHorizontalAlignment('center');

    var staticArchiveRows = [];
    for (var a = 0; a < archiveRows.length; a++) {
      var r = archiveRows[a];
      var dateStr = (r[1] instanceof Date) ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), 'yyyy-MM-dd') : r[1];
      var monthStr = (r[2] && r[2].toString().indexOf('=') === -1) ? r[2] : (dateStr ? dateStr.toString().substring(0, 7) : '');
      var createdStr = (r[10] instanceof Date) ? Utilities.formatDate(r[10], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : r[10];

      staticArchiveRows.push([
        r[0],
        dateStr,
        monthStr,
        r[3],
        r[4],
        r[5],
        r[6],
        Number(r[7]) || 0,
        r[8] || '',
        r[9] || '',
        createdStr
      ]);
    }

    archiveSheet.getRange(6, 1, staticArchiveRows.length, 11).setValues(staticArchiveRows);
    archiveSheet.getRange(6, 8, staticArchiveRows.length, 1).setNumberFormat('Rp #,##0');
    archiveSheet.setFrozenRows(5);

    transSheet.getRange(2, 1, Math.max(1, lastRow - 1), 11).clearContent();

    var nextYear = targetYr + 1;
    var openingRow = [
      'TRX-INIT-' + nextYear,
      new Date(nextYear, 0, 1),
      '=TEXT(B2, "yyyy-mm")',
      'Pemasukan',
      'Saldo Awal Tahun',
      'Kas Bersama',
      'Kas Tunai Rumah [Kas Bersama]',
      carryoverBalance,
      'Saldo bawaan tutup buku tahun ' + targetYr,
      'Sistem Otomatis - Tutup Buku ' + targetYr,
      new Date()
    ];

    var newTransRows = [openingRow];
    for (var rem = 0; rem < remainingRows.length; rem++) {
      newTransRows.push(remainingRows[rem]);
    }

    transSheet.getRange(2, 1, newTransRows.length, 11).setValues(newTransRows);
    transSheet.getRange(2, 2, newTransRows.length, 1).setNumberFormat('yyyy-mm-dd');
    transSheet.getRange(2, 8, newTransRows.length, 1).setNumberFormat('Rp #,##0');
    transSheet.getRange(2, 11, newTransRows.length, 1).setNumberFormat('yyyy-mm-dd hh:mm');

    SpreadsheetApp.flush();

    return {
      success: true,
      archivedYear: targetYr,
      archivedRows: archiveRows.length,
      carryoverBalance: carryoverBalance,
      sheetName: archiveSheetName,
      message: 'Tutup buku tahun ' + targetYr + ' berhasil. ' + archiveRows.length + ' transaksi diarsipkan ke tab ' + archiveSheetName + ' dan saldo Kas Bersama (Rp ' + carryoverBalance.toLocaleString('id-ID') + ') telah dioper ke tahun baru.'
    };
  } catch (err) {
    return { success: false, message: 'Terjadi kesalahan saat tutup buku: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function extractSmartPresets(transactions, defaultPresets, maxPresets) {
  maxPresets = maxPresets || 6;
  defaultPresets = defaultPresets || [];
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return defaultPresets.slice(0, maxPresets);
  }

  var countMap = {};
  for (var i = 0; i < transactions.length; i++) {
    var tx = transactions[i];
    if (tx.type !== 'Pengeluaran' || !tx.amount || Number(tx.amount) <= 0) continue;

    var name = (tx.note || tx.category || '').trim();
    if (!name) continue;

    var key = (name + '|' + Number(tx.amount) + '|' + (tx.category || '') + '|' + (tx.scope || 'Kas Bersama')).toLowerCase();
    if (!countMap[key]) {
      countMap[key] = {
        name: name,
        amount: Number(tx.amount),
        category: tx.category || 'Lain-lain',
        scope: tx.scope || 'Kas Bersama',
        count: 0
      };
    }
    countMap[key].count++;
  }

  var sorted = [];
  for (var k in countMap) {
    if (countMap[k].count >= 2) {
      sorted.push(countMap[k]);
    }
  }

  sorted.sort(function(a, b) {
    return b.count - a.count;
  });

  var result = sorted.slice(0, maxPresets);

  if (result.length < maxPresets && defaultPresets.length > 0) {
    for (var d = 0; d < defaultPresets.length; d++) {
      var def = defaultPresets[d];
      var isAlreadyIn = result.some(function(r) {
        return r.name.toLowerCase() === def.name.toLowerCase() && r.amount === def.amount;
      });
      if (!isAlreadyIn) {
        result.push(def);
        if (result.length >= maxPresets) break;
      }
    }
  }

  return result.length > 0 ? result : defaultPresets.slice(0, maxPresets);
}

function submitTransaction(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Server sedang sibuk, coba beberapa saat lagi.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var transSheet = ss.getSheetByName('TRANSAKSI');
    if (!transSheet) {
      return { success: false, message: 'Sheet TRANSAKSI tidak ditemukan.' };
    }

    var userEmail = '';
    try {
      userEmail = Session.getActiveUser().getEmail();
    } catch (err) {
      userEmail = payload.author || '';
    }

    var trxId = 'TRX-' + (new Date().getTime().toString().slice(-6));
    var rawDate = payload.date ? new Date(payload.date + 'T00:00:00') : new Date();
    var amount = Number(payload.amount) || 0;
    var type = payload.type || 'Pengeluaran';
    var category = payload.category || 'Lain-lain';
    var scope = payload.scope || 'Kas Bersama';
    var wallet = payload.wallet || 'Kas Tunai Rumah';
    var note = payload.note || '';

    var authorString = userEmail || 'Anonim';
    var configSheet = ss.getSheetByName('CONFIG');

    if (payload.authorRole) {
      authorString = payload.authorRole + (userEmail ? ' - ' + userEmail : '');
    } else if (configSheet && userEmail) {
      var sEmail = (configSheet.getRange('B3').getValue() || '').toString().toLowerCase();
      var iEmail = (configSheet.getRange('B5').getValue() || '').toString().toLowerCase();
      var sLabel = configSheet.getRange('B2').getValue() || 'Ayah';
      var iLabel = configSheet.getRange('B4').getValue() || 'Bunda';

      if ((sEmail && userEmail.toLowerCase().indexOf(sEmail) !== -1) || userEmail.toLowerCase().indexOf('suami') !== -1) {
        authorString = 'Suami (' + sLabel + ') - ' + userEmail;
      } else if ((iEmail && userEmail.toLowerCase().indexOf(iEmail) !== -1) || userEmail.toLowerCase().indexOf('istri') !== -1) {
        authorString = 'Istri (' + iLabel + ') - ' + userEmail;
      }
    }

    var newRow = [
      trxId,
      rawDate,
      '=TEXT(B' + (transSheet.getLastRow() + 1) + ', "yyyy-mm")',
      type,
      category,
      scope,
      wallet,
      amount,
      note,
      authorString,
      new Date()
    ];

    transSheet.appendRow(newRow);

    var lastRowIdx = transSheet.getLastRow();
    transSheet.getRange(lastRowIdx, 2).setNumberFormat('yyyy-mm-dd');
    transSheet.getRange(lastRowIdx, 8).setNumberFormat('Rp #,##0');
    transSheet.getRange(lastRowIdx, 11).setNumberFormat('yyyy-mm-dd hh:mm');

    SpreadsheetApp.flush();

    return {
      success: true,
      trxId: trxId,
      message: 'Transaksi berhasil disimpan.'
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

function deleteTransaction(trxId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Server sedang sibuk, coba sesaat lagi.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var transSheet = ss.getSheetByName('TRANSAKSI');
    if (!transSheet) {
      return { success: false, message: 'Sheet TRANSAKSI tidak ditemukan.' };
    }

    var lastRow = transSheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, message: 'Tidak ada data transaksi di sheet.' };
    }

    var ids = transSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var rowToDelete = -1;
    for (var i = 0; i < ids.length; i++) {
      if ((ids[i][0] || '').toString().trim() === (trxId || '').toString().trim()) {
        rowToDelete = i + 2;
        break;
      }
    }

    if (rowToDelete === -1) {
      return { success: false, message: 'Transaksi ' + trxId + ' tidak ditemukan di sheet.' };
    }

    transSheet.deleteRow(rowToDelete);
    SpreadsheetApp.flush();

    return {
      success: true,
      trxId: trxId,
      message: 'Transaksi ' + trxId + ' berhasil dihapus.'
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function saveConfigData(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Server sedang sibuk.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = ss.getSheetByName('CONFIG');
    if (!configSheet) return { success: false, message: 'Sheet CONFIG tidak ditemukan.' };

    // Validasi Hak Akses RBAC: Hanya akun Master atau Spreadsheet Owner yang boleh mengubah
    var activeEmail = '';
    try { activeEmail = Session.getActiveUser().getEmail().toLowerCase().trim(); } catch (e) {}
    var effEmail = '';
    try { effEmail = Session.getEffectiveUser().getEmail().toLowerCase().trim(); } catch (e) {}
    var currentMaster = (configSheet.getRange('B6').getValue() || '').toString().toLowerCase().trim();

    if (activeEmail && activeEmail !== effEmail && activeEmail !== currentMaster) {
      return { success: false, message: 'Akses ditolak: Hanya Akun Master yang dapat mengubah konfigurasi.' };
    }

    if (payload.categories && Array.isArray(payload.categories)) {
      configSheet.getRange('C2:C50').clearContent();
      var catRows = payload.categories.map(function(c) { return [c]; });
      if (catRows.length > 0) {
        configSheet.getRange(2, 3, catRows.length, 1).setValues(catRows);
      }
    }

    if (payload.wallets && Array.isArray(payload.wallets)) {
      configSheet.getRange('E2:F50').clearContent();
      var walRows = payload.wallets.map(function(w) {
        if (typeof w === 'object' && w.name) {
          return [w.name, w.owner || 'Kas Bersama'];
        }
        return [w, 'Kas Bersama'];
      });
      if (walRows.length > 0) {
        configSheet.getRange(2, 5, walRows.length, 2).setValues(walRows);
      }
    }

    if (payload.salaryDate) {
      configSheet.getRange('A8').setValue('Siklus Gajian (Tgl)');
      configSheet.getRange('B8').setValue(Number(payload.salaryDate) || 25);
    }

    // Jika ada pembaruan akun keluarga
    if (payload.accounts) {
      if (payload.accounts.suamiLabel) configSheet.getRange('B2').setValue(payload.accounts.suamiLabel);
      if (payload.accounts.suamiEmail) configSheet.getRange('B3').setValue(payload.accounts.suamiEmail);
      if (payload.accounts.istriLabel) configSheet.getRange('B4').setValue(payload.accounts.istriLabel);
      if (payload.accounts.istriEmail) configSheet.getRange('B5').setValue(payload.accounts.istriEmail);
      if (payload.accounts.masterEmail) configSheet.getRange('B6').setValue(payload.accounts.masterEmail);
      if (payload.accounts.masterRole) configSheet.getRange('B7').setValue(payload.accounts.masterRole);
    }

    SpreadsheetApp.flush();
    return { success: true, message: 'Pengaturan berhasil diperbarui di Google Sheets.' };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function saveAccountSettings(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Server sedang sibuk.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = ss.getSheetByName('CONFIG');
    if (!configSheet) return { success: false, message: 'Sheet CONFIG tidak ditemukan.' };

    var activeEmail = '';
    try { activeEmail = Session.getActiveUser().getEmail().toLowerCase().trim(); } catch (e) {}
    var effEmail = '';
    try { effEmail = Session.getEffectiveUser().getEmail().toLowerCase().trim(); } catch (e) {}
    var currentMaster = (configSheet.getRange('B6').getValue() || '').toString().toLowerCase().trim();

    if (activeEmail && activeEmail !== effEmail && activeEmail !== currentMaster) {
      return { success: false, message: 'Akses ditolak: Hanya Akun Master yang dapat mengubah akun keluarga.' };
    }

    if (payload.suamiLabel) configSheet.getRange('B2').setValue(payload.suamiLabel);
    if (payload.suamiEmail) configSheet.getRange('B3').setValue(payload.suamiEmail);
    if (payload.istriLabel) configSheet.getRange('B4').setValue(payload.istriLabel);
    if (payload.istriEmail) configSheet.getRange('B5').setValue(payload.istriEmail);
    if (payload.masterEmail) configSheet.getRange('B6').setValue(payload.masterEmail);
    if (payload.masterRole) configSheet.getRange('B7').setValue(payload.masterRole);

    SpreadsheetApp.flush();
    return { success: true, message: 'Pengaturan akun keluarga berhasil disimpan.' };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getPeriodSummary(startDateStr, endDateStr) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var transSheet = ss.getSheetByName('TRANSAKSI');
    if (!transSheet) return { success: false, message: 'Sheet TRANSAKSI tidak ditemukan.' };

    var lastRow = transSheet.getLastRow();
    if (lastRow <= 1) {
      return {
        success: true,
        totalIncome: 0,
        totalExpense: 0,
        netCashflow: 0,
        byScope: { 'Kas Bersama': 0, 'Pribadi Suami': 0, 'Pribadi Istri': 0 },
        byCategory: [],
        txCount: 0
      };
    }

    var data = transSheet.getRange(2, 1, lastRow - 1, 11).getValues();
    var start = new Date(startDateStr + 'T00:00:00');
    var end = new Date(endDateStr + 'T23:59:59');

    var totalIncome = 0;
    var totalExpense = 0;
    var byScope = { 'Kas Bersama': 0, 'Pribadi Suami': 0, 'Pribadi Istri': 0 };
    var catMap = {};
    var count = 0;

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var rawDate = row[1];
      if (!rawDate) continue;

      var txDate = (rawDate instanceof Date) ? rawDate : new Date(rawDate);
      if (txDate >= start && txDate <= end) {
        count++;
        var type = row[3];
        var category = row[4] || 'Lain-lain';
        var scope = row[5] || 'Kas Bersama';
        var amount = Number(row[7]) || 0;

        if (type === 'Pengeluaran') {
          totalExpense += amount;
          if (byScope[scope] !== undefined) {
            byScope[scope] += amount;
          } else {
            byScope[scope] = amount;
          }

          catMap[category] = (catMap[category] || 0) + amount;
        } else if (type === 'Pemasukan') {
          if (category !== 'Saldo Awal Tahun') {
            totalIncome += amount;
          }
        }
      }
    }

    var byCategory = [];
    for (var catName in catMap) {
      var amt = catMap[catName];
      byCategory.push({
        category: catName,
        amount: amt,
        percentage: totalExpense > 0 ? (amt / totalExpense) * 100 : 0
      });
    }

    byCategory.sort(function(a, b) { return b.amount - a.amount; });

    return {
      success: true,
      startDate: startDateStr,
      endDate: endDateStr,
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      netCashflow: totalIncome - totalExpense,
      byScope: byScope,
      byCategory: byCategory,
      txCount: count
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}
