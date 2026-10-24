/**
 * Code.gs - Backend API Google Apps Script untuk Web App Family Finance Tracker
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('WebApp');
  return template.evaluate()
    .setTitle('Kas Keluarga — Catat Keuangan')
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

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('CONFIG');
  var transSheet = ss.getSheetByName('TRANSAKSI');
  var dashSheet = ss.getSheetByName('DASHBOARD');

  var categories = [];
  var wallets = [];
  var presets = [];
  var userRole = 'Keluarga';
  var salaryDate = 25;

  if (configSheet) {
    var catValues = configSheet.getRange('C2:C50').getValues();
    for (var i = 0; i < catValues.length; i++) {
      var cat = catValues[i][0];
      if (cat && cat.toString().trim() !== '') {
        categories.push(cat.toString().trim());
      }
    }

    var walValues = configSheet.getRange('E2:E50').getValues();
    for (var j = 0; j < walValues.length; j++) {
      var wal = walValues[j][0];
      if (wal && wal.toString().trim() !== '') {
        wallets.push(wal.toString().trim());
      }
    }

    var preValues = configSheet.getRange('F2:G20').getValues();
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

    var valSal = configSheet.getRange('B6').getValue();
    if (valSal && !isNaN(Number(valSal))) {
      salaryDate = Number(valSal);
    }

    var suamiEmail = configSheet.getRange('B3').getValue();
    var istriEmail = configSheet.getRange('B5').getValue();
    var suamiLabel = configSheet.getRange('B2').getValue() || 'Suami';
    var istriLabel = configSheet.getRange('B4').getValue() || 'Istri';

    if (userEmail && userEmail.toLowerCase() === (suamiEmail + '').toLowerCase()) {
      userRole = suamiLabel;
    } else if (userEmail && userEmail.toLowerCase() === (istriEmail + '').toLowerCase()) {
      userRole = istriLabel;
    }
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
            authorRole = 'Suami (' + (suamiLabel || 'Ayah') + ')';
          } else if (istriEmail && authorEmail.toLowerCase().indexOf(istriEmail.toLowerCase()) !== -1) {
            authorRole = 'Istri (' + (istriLabel || 'Bunda') + ')';
          } else if (authorEmail.toLowerCase().indexOf('suami') !== -1) {
            authorRole = 'Suami (Ayah)';
          } else if (authorEmail.toLowerCase().indexOf('istri') !== -1) {
            authorRole = 'Istri (Bunda)';
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
    userRole: userRole,
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
    if (configSheet && userEmail) {
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

    if (payload.categories && Array.isArray(payload.categories)) {
      configSheet.getRange('C2:C50').clearContent();
      var catRows = payload.categories.map(function(c) { return [c]; });
      if (catRows.length > 0) {
        configSheet.getRange(2, 3, catRows.length, 1).setValues(catRows);
      }
    }

    if (payload.wallets && Array.isArray(payload.wallets)) {
      configSheet.getRange('E2:E50').clearContent();
      var walRows = payload.wallets.map(function(w) { return [w]; });
      if (walRows.length > 0) {
        configSheet.getRange(2, 5, walRows.length, 1).setValues(walRows);
      }
    }

    if (payload.salaryDate) {
      configSheet.getRange('A6').setValue('Siklus Gajian (Tgl)');
      configSheet.getRange('B6').setValue(Number(payload.salaryDate) || 25);
    }

    SpreadsheetApp.flush();
    return { success: true, message: 'Pengaturan kategori & dompet berhasil diperbarui.' };
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
