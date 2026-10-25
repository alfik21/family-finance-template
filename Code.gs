/**
 * Code.gs - Backend API Google Apps Script untuk Web App Family Finance Tracker
 * Mendukung RBAC Akun Master vs Anggota, Kepemilikan Dompet Eksplisit, dan Zero-Symbol UI.
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('WebApp');
  return template.evaluate()
    .setTitle('Kas Keluarga - Catat Keuangan')
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

    var preValues = configSheet.getRange('G2:H20').getValues();
    for (var k = 0; k < preValues.length; k++) {
      var pName = preValues[k][0];
      var pAmount = preValues[k][1];
      if (pName && pName.toString().trim() !== '') {
        presets.push({
          name: pName.toString().trim(),
          amount: Number(pAmount) || 0
        });
      }
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
  if (transSheet) {
    var lastRow = transSheet.getLastRow();
    if (lastRow > 1) {
      var startRow = Math.max(2, lastRow - 9);
      var numRows = lastRow - startRow + 1;
      var rawRows = transSheet.getRange(startRow, 1, numRows, 11).getValues();

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

          recent.push({
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
          });
          if (recent.length >= 6) break;
        }
      }
    }
  }

  var summary = {
    jointBalance: 0,
    monthExpense: 0,
    monthIncome: 0
  };

  if (dashSheet) {
    try {
      summary.monthIncome = Number(dashSheet.getRange('A6').getValue()) || 0;
      summary.monthExpense = Number(dashSheet.getRange('E6').getValue()) || 0;
      summary.jointBalance = Number(dashSheet.getRange('G6').getValue()) || 0;
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
    presets: presets,
    salaryDate: salaryDate,
    recent: recent,
    summary: summary
  };
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
          totalIncome += amount;
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
