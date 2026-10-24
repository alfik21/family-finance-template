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

  if (configSheet) {
    var catValues = configSheet.getRange('C2:C20').getValues();
    for (var i = 0; i < catValues.length; i++) {
      var cat = catValues[i][0];
      if (cat && cat.toString().trim() !== '') {
        categories.push(cat.toString().trim());
      }
    }

    var walValues = configSheet.getRange('E2:E20').getValues();
    for (var j = 0; j < walValues.length; j++) {
      var wal = walValues[j][0];
      if (wal && wal.toString().trim() !== '') {
        wallets.push(wal.toString().trim());
      }
    }

    var preValues = configSheet.getRange('F2:G15').getValues();
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

          recent.push({
            id: row[0],
            date: dateFormatted,
            type: row[3],
            category: row[4],
            scope: row[5],
            wallet: row[6],
            amount: Number(row[7]) || 0,
            note: row[8] || '',
            author: row[9] || ''
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
      userEmail || 'Anonim',
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
