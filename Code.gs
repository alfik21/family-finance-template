/**
 * Code.gs - Backend API Google Apps Script untuk Web App Finance Tracker — Family Edition
 * Mendukung RBAC Akun Master vs Anggota, Kepemilikan Dompet Eksplisit, dan Zero-Symbol UI.
 */

function doGet(e) {
  // Gerbang akses Web App (server-side): hanya email yang terdaftar di sheet CONFIG
  // (Email Suami / Email Istri / Email Master) atau pemilik spreadsheet yang boleh
  // membuka link ini. Setting deployment "Anyone with Google account" tidak bisa
  // membatasi per-email, sehingga pembatasannya dilakukan di sini.
  var access = getWebAppAccess_();
  if (!access.allowed) {
    return buildAccessDeniedOutput_(access);
  }

  var template = HtmlService.createTemplateFromFile('WebApp');
  return template.evaluate()
    .setTitle('Finance Tracker — Family Edition')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Email pemilik spreadsheet (otoritas tertinggi, selalu dikenali sebagai Master).
 * Dipakai karena Session.getEffectiveUser() pada deployment
 * "Execute as: User accessing the web app" SELALU sama dengan pengguna aktif,
 * sehingga tidak bisa dijadikan penanda hak akses (akan membuat RBAC bocor).
 */
function getSpreadsheetOwnerEmail_(ss) {
  try {
    return (ss && ss.getOwner ? (ss.getOwner().getEmail() || '') : '').toLowerCase().trim();
  } catch (e) {
    return '';
  }
}

/**
 * Pemeriksaan hak akses Master (fail-closed):
 * - Pengguna tanpa email teridentifikasi -> BUKAN Master.
 * - Master = email pada CONFIG!B6 ATAU pemilik spreadsheet.
 */
function isMasterAccess_(ss, configSheet, activeEmailRaw) {
  var active = (activeEmailRaw || '').toLowerCase().trim();
  if (!active) return false;

  var master = '';
  try {
    if (configSheet) master = (configSheet.getRange('B6').getValue() || '').toString().toLowerCase().trim();
  } catch (e) {}

  var owner = getSpreadsheetOwnerEmail_(ss);
  return (master && active === master) || (owner && active === owner);
}

/**
 * Email Google pengguna yang sedang membuka Web App.
 * Kosong bila identitas tidak boleh diungkapkan (mis. deployment
 * "Execute as: Me" untuk pengguna di luar domain).
 */
function getActiveEmail_() {
  try {
    return (Session.getActiveUser().getEmail() || '').toLowerCase().trim();
  } catch (e) {
    return '';
  }
}

/**
 * Daftar email yang diizinkan memakai Web App (fail-closed):
 * - Email Suami  (CONFIG!B3)
 * - Email Istri  (CONFIG!B5)
 * - Email Master (CONFIG!B6)
 * - Pemilik spreadsheet
 */
function getAllowedEmails_(ss, configSheet) {
  var allowed = {};
  var add = function(value) {
    var email = (value || '').toString().toLowerCase().trim();
    if (email) allowed[email] = true;
  };

  try {
    if (configSheet) {
      add(configSheet.getRange('B3').getValue());
      add(configSheet.getRange('B5').getValue());
      add(configSheet.getRange('B6').getValue());
    }
  } catch (e) {}

  add(getSpreadsheetOwnerEmail_(ss));
  return allowed;
}

/**
 * Pemeriksaan akses Web App. Mengembalikan { allowed, email, code, message }.
 * code: 'no-identity' | 'no-sheet-access' | 'not-registered'
 */
function getWebAppAccess_() {
  var email = getActiveEmail_();
  if (!email) {
    return {
      allowed: false,
      email: '',
      code: 'no-identity',
      message: 'Email Google Anda tidak terdeteksi. Web App harus dideploy dengan ' +
        'Execute as: User accessing the web app agar identitas pengunjung bisa dibaca.'
    };
  }

  var ss = null;
  var configSheet = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    configSheet = ss.getSheetByName('CONFIG');
  } catch (err) {
    return {
      allowed: false,
      email: email,
      code: 'no-sheet-access',
      message: 'Spreadsheet tidak dapat diakses oleh akun ' + email + '.'
    };
  }

  var allowed = getAllowedEmails_(ss, configSheet);
  if (!allowed[email]) {
    return {
      allowed: false,
      email: email,
      code: 'not-registered',
      message: 'Email ' + email + ' belum terdaftar sebagai anggota keluarga.'
    };
  }

  return { allowed: true, email: email, code: '', message: '' };
}

/** Respons standar untuk fungsi server ketika akses ditolak. */
function accessDeniedResponse_(access) {
  return {
    success: false,
    accessDenied: true,
    code: access.code,
    message: access.message
  };
}

/** Halaman penolakan akses (tanpa data apa pun). */
function buildAccessDeniedOutput_(access) {
  var tips = '';
  if (access.code === 'no-identity') {
    tips = 'Buka <b>Deploy &gt; Manage deployments &gt; Edit</b>, ubah <b>Execute as</b> menjadi ' +
      '<b>User accessing the web app</b>, lalu Deploy ulang sebagai <b>New version</b>.';
  } else if (access.code === 'no-sheet-access') {
    tips = 'Bagikan spreadsheet ini sebagai <b>Editor</b> kepada akun Anda melalui tombol ' +
      '<b>Bagikan (Share)</b> di Google Sheets.';
  } else {
    tips = 'Daftarkan email tersebut pada sheet <b>CONFIG</b> (kolom <b>Email Suami</b>, ' +
      '<b>Email Istri</b>, atau <b>Email Master</b>), atau minta akun Master mendaftarkannya ' +
      'lewat tab <b>Akun &gt; Pengaturan Akun Pasangan</b>.';
  }

  var html = [
    '<!DOCTYPE html>',
    '<html lang="id"><head><base target="_top"><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Akses Ditolak - Finance Tracker — Family Edition</title>',
    '<style>',
    'body{margin:0;background:#f8faf9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;',
    'display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;}',
    '.card{max-width:520px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;',
    'padding:28px;box-shadow:0 10px 30px rgba(15,23,42,.08);}',
    '.badge{display:inline-block;font-size:11px;font-weight:bold;letter-spacing:.08em;',
    'text-transform:uppercase;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;',
    'border-radius:999px;padding:4px 10px;margin-bottom:14px;}',
    'h1{font-size:20px;margin:0 0 10px;}',
    'p{font-size:14px;line-height:1.6;color:#475569;margin:0 0 12px;}',
    '.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;',
    'font-size:13px;color:#334155;margin-bottom:14px;word-break:break-word;}',
    '.foot{font-size:12px;color:#94a3b8;}',
    '</style></head><body><div class="card">',
    '<span class="badge">Akses Ditolak</span>',
    '<h1>Anda tidak memiliki akses ke Finance Tracker — Family Edition</h1>',
    '<div class="box"><b>Email terdeteksi:</b><br>' + (access.email || '(tidak terdeteksi)') + '</div>',
    '<p>' + access.message + '</p>',
    '<p><b>Solusi:</b> ' + tips + '</p>',
    '<p class="foot">Link Web App ini hanya dapat dibuka oleh akun Google keluarga yang ' +
    'terdaftar di spreadsheet.</p>',
    '</div></body></html>'
  ].join('');

  return HtmlService.createHtmlOutput(html)
    .setTitle('Akses Ditolak - Finance Tracker — Family Edition')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getInitialData() {
  var access = getWebAppAccess_();
  if (!access.allowed) {
    // Penolakan akses: tidak ada data yang dikirim, dan pengguna yang ditolak
    // tidak pernah dianggap Master (fail-closed).
    return { accessDenied: true, isMaster: false, code: access.code, message: access.message };
  }

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
  var ownerEmail = getSpreadsheetOwnerEmail_(ss);
  var configSheet = ss.getSheetByName('CONFIG');
  var transSheet = ss.getSheetByName('TRANSAKSI');

  var categories = [];
  var incomeCategories = [];
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

    var incValues = configSheet.getRange('I2:I50').getValues();
    for (var m = 0; m < incValues.length; m++) {
      var incCat = incValues[m][0];
      if (incCat && incCat.toString().trim() !== '') {
        incomeCategories.push(incCat.toString().trim());
      }
    }
    if (incomeCategories.length === 0) {
      incomeCategories = [
        'Setor Gaji Ayah',
        'Setor Gaji Bunda',
        'Bonus & THR',
        'Hasil Usaha / Bisnis',
        'Investasi & Dividen',
        'Pemberian / Lainnya'
      ];
    }

    // Baca preset cepat secara cerdas & tahan pergeseran kolom
    var configHeaderRow = configSheet.getRange('A1:J1').getValues()[0];
    var colPreset = 7;
    var colNominal = 8;
    var colPresetCat = 10; // kolom J: KATEGORI TOMBOL (opsional, versi template baru)

    for (var h = 0; h < configHeaderRow.length; h++) {
      var hText = (configHeaderRow[h] || '').toString().toUpperCase();
      if (hText.indexOf('PRESET') !== -1) {
        colPreset = h + 1;
      } else if (hText.indexOf('NOMINAL') !== -1) {
        colNominal = h + 1;
      } else if (hText.indexOf('KATEGORI TOMBOL') !== -1) {
        colPresetCat = h + 1;
      }
    }

    var maxCol = Math.max(colPreset, colNominal, colPresetCat, 8);
    var preRaw = configSheet.getRange(2, 1, 19, maxCol).getValues();

    for (var k = 0; k < preRaw.length; k++) {
      var rowData = preRaw[k];
      var rawName = (rowData[colPreset - 1] || '').toString().trim();
      var rawAmt = Number(rowData[colNominal - 1]) || 0;
      var rawCat = (rowData[colPresetCat - 1] || '').toString().trim();

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
          amount: rawAmt,
          category: rawCat
        });
      }
    }

    // Kompatibilitas mundur (sheet lama tanpa kolom KATEGORI TOMBOL):
    // inferensi kategori preset dari riwayat transaksi berlabel sama.
    // (dilakukan SETELAH allTxForPresets terisi - lihat bawah)


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
  var masterEmail = (settings['Email Master'] || ownerEmail || '').toString().trim();
  var masterRole = (settings['Peran Master'] || 'Suami').toString().trim();

  // Deteksi RBAC: hanya email Master (CONFIG B6) atau pemilik spreadsheet.
  // TIDAK memakai effectiveEmail sebagai penanda (lihat getSpreadsheetOwnerEmail_).
  var isMaster = false;
  var cleanActive = (userEmail || '').toLowerCase().trim();
  var cleanMaster = masterEmail.toLowerCase();
  var cleanOwner = ownerEmail.toLowerCase();

  if (cleanActive && ((cleanMaster && cleanActive === cleanMaster) ||
      (cleanOwner && cleanActive === cleanOwner))) {
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

  // Kompatibilitas mundur: lengkapi kategori preset dari riwayat transaksi
  enrichPresetCategories_(presets, allTxForPresets);

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

  // CATATAN QC: TIDAK ada tulisan ke DASHBOARD di sini.
  // Sel formula bulanan DASHBOARD (A6/C6/E6/G6: =A6-E6, SUMIFS, dll.) HARUS hidup.
  // Menimpanya dengan nilai statis siklus gajian merusak TC-BAL-04 & TC-SUM-01.
  // Data ringkasan dikirim ke UI melalui objek `summary` di bawah.

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
    incomeCategories: incomeCategories,
    wallets: wallets,
    walletBalances: fin.walletBalances,
    presets: smartPresets,
    defaultPresets: presets,
    salaryDate: salaryDate,
    recent: recent,
    recentWindow: allTxForPresets.slice(0, 100),
    budgets: loadBudgets_(ss),
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
        var category = (r[4] || '').toString();
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

function loadConfigData(ss) {
  var configSheet = ss.getSheetByName('CONFIG');
  var wallets = [];
  var categories = [];
  var incomeCategories = [];
  var salaryDate = 25;

  if (configSheet) {
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

    var catValues = configSheet.getRange('C2:C50').getValues();
    for (var i = 0; i < catValues.length; i++) {
      var cat = catValues[i][0];
      if (cat && cat.toString().trim() !== '') {
        categories.push(cat.toString().trim());
      }
    }

    var incValues = configSheet.getRange('I2:I50').getValues();
    for (var m = 0; m < incValues.length; m++) {
      var incCat = incValues[m][0];
      if (incCat && incCat.toString().trim() !== '') {
        incomeCategories.push(incCat.toString().trim());
      }
    }

    var salVal = configSheet.getRange('B8').getValue();
    if (salVal && !isNaN(Number(salVal))) {
      salaryDate = Number(salVal);
    }
  }

  return {
    wallets: wallets,
    categories: categories,
    incomeCategories: incomeCategories,
    salaryDate: salaryDate
  };
}

function closeAndArchiveYear(targetYear) {
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);

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
    try { activeEmail = Session.getActiveUser().getEmail(); } catch (e) {}

    if (!isMasterAccess_(ss, configSheet, activeEmail)) {
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

    // --- TAHAP 1: HITUNG DULU (tanpa menyentuh sheet TRANSAKSI) -------------
    // Semua pembacaan/kegagalan di sini harus terjadi SEBELUM ada tulisan
    // apa pun ke TRANSAKSI, agar kegagalan tidak pernah meninggalkan
    // keadaan setengah jadi (data tahun berjalan hilang tanpa arsip).
    var configData = loadConfigData(ss);
    var wallets = configData.wallets || [];
    var walletMap = {};
    for (var w = 0; w < wallets.length; w++) {
      var wItem = wallets[w];
      var wName = typeof wItem === 'object' ? wItem.name : wItem;
      var wOwner = typeof wItem === 'object' ? (wItem.owner || 'Kas Bersama') : 'Kas Bersama';
      walletMap[wName] = { name: wName, owner: wOwner, balance: 0 };
    }

    var matchWalletKeyLocal = function(wStr) {
      if (!wStr) return null;
      var clean = wStr.replace(/\s*\[.*?\]\s*$/, '').trim().toLowerCase();
      for (var k in walletMap) {
        if (k.toLowerCase() === clean || k.toLowerCase() === wStr.trim().toLowerCase()) return k;
      }
      return null;
    };

    for (var a = 0; a < archiveRows.length; a++) {
      var aRow = archiveRows[a];
      var aType = aRow[3];
      var aWalStr = (aRow[6] || '').toString();
      var aAmount = Number(aRow[7]) || 0;

      if (aType === 'Pemasukan') {
        var kIn = matchWalletKeyLocal(aWalStr);
        if (kIn) walletMap[kIn].balance += aAmount;
      } else if (aType === 'Pengeluaran') {
        var kOut = matchWalletKeyLocal(aWalStr);
        if (kOut) walletMap[kOut].balance -= aAmount;
      } else if (aType === 'Transfer') {
        var parts = aWalStr.split(/\s+ke\s+/i);
        if (parts.length === 2) {
          var kFrom = matchWalletKeyLocal(parts[0]);
          var kTo = matchWalletKeyLocal(parts[1]);
          if (kFrom) walletMap[kFrom].balance -= aAmount;
          if (kTo) walletMap[kTo].balance += aAmount;
        }
      }
    }

    var nextYear = targetYr + 1;
    var openingRows = [];
    var seq = 1;

    for (var wk in walletMap) {
      var wObj = walletMap[wk];
      var displayName = wObj.name + ' [' + wObj.owner + ']';
      openingRows.push([
        'TRX-INIT-' + String(seq++).padStart(3, '0') + '-' + nextYear,
        new Date(nextYear, 0, 1),
        '=TEXT(B' + (openingRows.length + 2) + ', "yyyy-mm")',
        'Pemasukan',
        'Saldo Awal Tahun',
        wObj.owner || 'Kas Bersama',
        displayName,
        wObj.balance,
        'Saldo bawaan tutup buku tahun ' + targetYr + ' (' + wObj.name + ')',
        'Sistem Otomatis - Tutup Buku ' + targetYr,
        new Date()
      ]);
    }

    var newTransRows = [];
    for (var op = 0; op < openingRows.length; op++) {
      newTransRows.push(openingRows[op]);
    }
    for (var rem = 0; rem < remainingRows.length; rem++) {
      newTransRows.push(remainingRows[rem]);
    }

    // Susun isi ARSIP di memori dulu; hanya ditulis setelah semua hitungan valid
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

    // --- TAHAP 3: TIMPA TRANSAKSI + BERSIHKAN EKOR ------------------------
    // ARSIP sudah lengkap & valid pada tahap 2, sehingga aman menimpa.
    var oldDataRows = Math.max(1, lastRow - 1);
    if (newTransRows.length >= oldDataRows) {
      transSheet.getRange(2, 1, newTransRows.length, 11).setValues(newTransRows);
    } else {
      transSheet.getRange(2, 1, oldDataRows, 11).clearContent();
      transSheet.getRange(2, 1, newTransRows.length, 11).setValues(newTransRows);
    }
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

/**
 * Lengkapi kategori preset dari riwayat transaksi (kompatibilitas mundur
 * untuk sheet template lama yang belum punya kolom KATEGORI TOMBOL).
 */
function enrichPresetCategories_(presets, transactions) {
  if (!presets || !presets.length) return presets;
  var byName = {};
  (transactions || []).forEach(function(tx) {
    if (!tx || !tx.note || !tx.category) return;
    var key = tx.note.toString().trim().toLowerCase();
    if (!byName[key]) byName[key] = tx.category;
  });
  presets.forEach(function(p) {
    if (p.category) return;
    var key = (p.name || '').toString().trim().toLowerCase();
    if (byName[key]) p.category = byName[key];
  });
  return presets;
}

/**
 * ID transaksi unik. Sebelumnya dibuat inline dari 6 digit timestamp
 * (risiko tabrakan saat 2 transaksi dibuat pada detik sama -> edit/hapus
 * bisa mengenai baris yang salah).
 */
function generateTrxId() {
  var ts = new Date().getTime().toString(36).toUpperCase();
  var rand = Math.floor(Math.random() * 1296).toString(36).toUpperCase();
  var uuid = '';
  try {
    uuid = Utilities.getUuid().replace(/[^0-9a-f]/gi, '').substring(0, 4).toUpperCase();
  } catch (e) {
    uuid = ts.substring(ts.length - 4);
  }
  return 'TRX-' + ts + '-' + rand + uuid;
}

/**
 * Validasi input transaksi di sisi SERVER (TC-VAL-01 s/d TC-VAL-03).
 * UI hanya lapisan kenyamanan; server tetap wajib menolak data rusak.
 */
function validateTransactionPayload_(payload) {
  var p = payload || {};
  var amount = Number(p.amount);
  if (!isFinite(amount) || isNaN(amount)) return 'Nominal harus berupa angka yang valid.';
  if (amount <= 0) return 'Nominal harus lebih dari 0 (TC-VAL-01/02).';

  var allowedTypes = ['Pengeluaran', 'Pemasukan', 'Transfer'];
  var type = (p.type || '').toString().trim();
  if (allowedTypes.indexOf(type) === -1) return 'Tipe transaksi tidak dikenal: ' + type;

  if (type !== 'Transfer') {
    var category = (p.category || '').toString().trim();
    var wallet = (p.wallet || '').toString().trim();
    if (!category) return 'Kategori wajib dipilih.';
    if (!wallet) return 'Sumber dompet wajib dipilih.';
  }

  var rawDate = p.date;
  var d = rawDate instanceof Date ? rawDate : new Date(rawDate);
  if (!rawDate || isNaN(d.getTime())) return 'Tanggal tidak valid (TC-VAL-03).';

  return null;
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
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);

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

    // Validasi di sisi server (bukan hanya UI): nominal, tanggal, tipe, kategori/dompet
    var validationError = validateTransactionPayload_(payload);
    if (validationError) {
      return { success: false, message: validationError };
    }

    var trxId = generateTrxId();
    var rawDate = payload.date ? new Date(payload.date + 'T00:00:00') : new Date();
    var amount = Number(payload.amount);
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
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);

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

function updateTransaction(trxId, payload) {
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);

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
    var rowToUpdate = -1;
    for (var i = 0; i < ids.length; i++) {
      if ((ids[i][0] || '').toString().trim() === (trxId || '').toString().trim()) {
        rowToUpdate = i + 2;
        break;
      }
    }

    if (rowToUpdate === -1) {
      return { success: false, message: 'Transaksi ' + trxId + ' tidak ditemukan di sheet.' };
    }

    // Validasi di sisi server (konsisten dengan submitTransaction).
    // Payload edit bisa parsial -> lengkapi dengan nilai baris yang sudah ada.
    var existingRow = transSheet.getRange(rowToUpdate, 1, 1, 11).getValues()[0];
    var vPayload = {
      type: (payload.type !== undefined && payload.type !== '') ? payload.type : existingRow[3],
      category: (payload.category !== undefined && payload.category !== '') ? payload.category : existingRow[4],
      scope: (payload.scope !== undefined && payload.scope !== '') ? payload.scope : existingRow[5],
      wallet: (payload.wallet !== undefined && payload.wallet !== '') ? payload.wallet : existingRow[6],
      amount: (payload.amount !== undefined && payload.amount !== '') ? payload.amount : existingRow[7],
      date: (payload.date !== undefined && payload.date !== '') ? payload.date : existingRow[1],
      note: (payload.note !== undefined) ? payload.note : existingRow[8]
    };
    var validationError = validateTransactionPayload_(vPayload);
    if (validationError) {
      return { success: false, message: validationError };
    }

    var rawDate = vPayload.date instanceof Date ? new Date(vPayload.date.getTime()) : new Date(vPayload.date + 'T00:00:00');
    if (isNaN(rawDate.getTime())) rawDate = new Date();
    var amount = Number(vPayload.amount);
    var type = vPayload.type || 'Pengeluaran';
    var category = vPayload.category || 'Lain-lain';
    var scope = vPayload.scope || 'Kas Bersama';
    var wallet = vPayload.wallet || '';
    var note = vPayload.note || '';

    // Identitas pengubah: catat email aktif (audit trail) + peran yang dikirim UI
    var editorEmail = '';
    try { editorEmail = Session.getActiveUser().getEmail(); } catch (e) {}
    var prevAuthor = (transSheet.getRange(rowToUpdate, 10).getValue() || '').toString();
    var authorString = payload.authorRole
      ? (payload.authorRole + (editorEmail ? ' - ' + editorEmail : ''))
      : (prevAuthor || (editorEmail || 'Anonim'));

    var updatedRow = [
      trxId,
      rawDate,
      '=TEXT(B' + rowToUpdate + ', "yyyy-mm")',
      type,
      category,
      scope,
      wallet,
      amount,
      note,
      authorString,
      new Date()
    ];

    transSheet.getRange(rowToUpdate, 1, 1, 11).setValues([updatedRow]);
    transSheet.getRange(rowToUpdate, 2).setNumberFormat('yyyy-mm-dd');
    transSheet.getRange(rowToUpdate, 8).setNumberFormat('Rp #,##0');
    transSheet.getRange(rowToUpdate, 11).setNumberFormat('yyyy-mm-dd hh:mm');

    SpreadsheetApp.flush();

    return {
      success: true,
      trxId: trxId,
      message: 'Transaksi ' + trxId + ' berhasil diperbarui.'
    };
  } catch (err) {
    return { success: false, message: 'Gagal memperbarui transaksi: ' + err.toString() };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function saveConfigData(payload) {
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);

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

    // Validasi Hak Akses RBAC (fail-closed): hanya Akun Master (CONFIG B6)
    // atau pemilik spreadsheet yang boleh mengubah konfigurasi.
    // TIDAK memakai getEffectiveUser() - pada mode USER_ACCESSING nilai itu
    // selalu sama dengan pengguna aktif sehingga pemeriksaannya tidak pernah aktif.
    var activeEmail = '';
    try { activeEmail = Session.getActiveUser().getEmail(); } catch (e) {}

    if (!isMasterAccess_(ss, configSheet, activeEmail)) {
      return { success: false, message: 'Akses ditolak: Hanya Akun Master yang dapat mengubah konfigurasi.' };
    }

    if (payload.categories && Array.isArray(payload.categories)) {
      configSheet.getRange('C2:C50').clearContent();
      var catRows = payload.categories.map(function(c) { return [c]; });
      if (catRows.length > 0) {
        configSheet.getRange(2, 3, catRows.length, 1).setValues(catRows);
      }
    }

    if (payload.incomeCategories && Array.isArray(payload.incomeCategories)) {
      configSheet.getRange('I2:I50').clearContent();
      var incRows = payload.incomeCategories.map(function(c) { return [c]; });
      if (incRows.length > 0) {
        configSheet.getRange(2, 9, incRows.length, 1).setValues(incRows);
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
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);

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
    try { activeEmail = Session.getActiveUser().getEmail(); } catch (e) {}

    if (!isMasterAccess_(ss, configSheet, activeEmail)) {
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
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);

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
        byPos: { operasional: 0, ayah: 0, bunda: 0 },
        byCategory: [],
        txCount: 0
      };
    }

    var data = transSheet.getRange(2, 1, lastRow - 1, 11).getValues();
    var start = new Date(startDateStr + 'T00:00:00');
    var end = new Date(endDateStr + 'T23:59:59');

    var totalIncome = 0;
    var totalExpense = 0;
    var uangSakuAyah = 0;
    var uangSakuBunda = 0;
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

          var catLower = category.toLowerCase();
          if (catLower === 'uang saku ayah' || catLower.indexOf('uang saku ayah') !== -1) {
            uangSakuAyah += amount;
          } else if (catLower === 'uang saku bunda' || catLower.indexOf('uang saku bunda') !== -1) {
            uangSakuBunda += amount;
          }
        } else if (type === 'Pemasukan') {
          if (category !== 'Saldo Awal Tahun') {
            totalIncome += amount;
          }
        }
      }
    }

    // Pos Operasional = pengeluaran ber-scope "Kas Bersama" saja, dikurangi uang saku.
    // Sebelumnya memakai totalExpense lintas scope -> pengeluaran pribadi
    // (Suami/Istri) ikut terhitung ke operasional keluarga (meleset).
    var jointExpense = byScope['Kas Bersama'] || 0;
    var uangSakuTotal = uangSakuAyah + uangSakuBunda;
    var operasionalBersama = Math.max(0, jointExpense - uangSakuTotal);

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
      byPos: {
        operasional: operasionalBersama,
        ayah: uangSakuAyah,
        bunda: uangSakuBunda
      },
      byCategory: byCategory,
      txCount: count
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}
/* ==========================================================================
 * ANGGARAN (FASE 2 / P1): sheet BUDGET + API master-only
 * - BUDGET: [KATEGORI, LIMIT_NOMINAL, PERIODE]
 * - saveBudget / deleteBudget hanya untuk Akun Master (RBAC, fail-closed).
 * - getBudgets terbuka untuk semua pengguna terdaftar (tampilan progres).
 * ========================================================================== */

function getBudgetSheet_(ss) {
  var sheet = ss.getSheetByName('BUDGET');
  if (!sheet) {
    sheet = ss.insertSheet('BUDGET');
    sheet.setTabColor('#2d6a4f');
    sheet.getRange(1, 1, 1, 3).setValues([['KATEGORI', 'LIMIT_NOMINAL', 'PERIODE']])
      .setFontWeight('bold').setBackground('#e8f0ec').setFontColor('#1b4332');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function loadBudgets_(ss) {
  var sheet = ss.getSheetByName('BUDGET');
  var out = [];
  if (sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
      for (var i = 0; i < rows.length; i++) {
        var cat = (rows[i][0] || '').toString().trim();
        var limit = Number(rows[i][1]) || 0;
        if (cat && limit > 0) out.push({ category: cat, limit: limit });
      }
    }
  }
  return out;
}

function getBudgets() {
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return { success: true, budgets: loadBudgets_(ss) };
}

function saveBudget(payload) {
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('CONFIG');
  var activeEmail = getActiveEmail_();
  if (!isMasterAccess_(ss, configSheet, activeEmail)) {
    return { success: false, message: 'Hanya Akun Master yang dapat mengatur batas anggaran.' };
  }

  var category = (payload && payload.category ? payload.category : '').toString().trim();
  var limit = Math.round(Number(payload && payload.limit) || 0);
  if (!category) return { success: false, message: 'Kategori anggaran wajib dipilih.' };
  if (limit <= 0) return { success: false, message: 'Nominal batas harus lebih dari 0.' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Server sedang sibuk, coba beberapa saat lagi.' };
  }
  try {
    var sheet = getBudgetSheet_(ss);
    var lastRow = sheet.getLastRow();
    var found = false;
    if (lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < rows.length; i++) {
        if ((rows[i][0] || '').toString().trim().toLowerCase() === category.toLowerCase()) {
          sheet.getRange(2 + i, 2).setValue(limit);
          found = true;
          break;
        }
      }
    }
    if (!found) sheet.appendRow([category, limit, '']);
    return { success: true, message: 'Batas anggaran "' + category + '" disimpan.', budgets: loadBudgets_(ss) };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function deleteBudget(categoryName) {
  var access = getWebAppAccess_();
  if (!access.allowed) return accessDeniedResponse_(access);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('CONFIG');
  var activeEmail = getActiveEmail_();
  if (!isMasterAccess_(ss, configSheet, activeEmail)) {
    return { success: false, message: 'Hanya Akun Master yang dapat menghapus batas anggaran.' };
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Server sedang sibuk, coba beberapa saat lagi.' };
  }
  try {
    var sheet = ss.getSheetByName('BUDGET');
    if (!sheet) return { success: true, message: 'Belum ada sheet BUDGET.', budgets: [] };
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = rows.length - 1; i >= 0; i--) {
        if ((rows[i][0] || '').toString().trim().toLowerCase() === (categoryName || '').toString().trim().toLowerCase()) {
          sheet.deleteRow(2 + i);
          break;
        }
      }
    }
    return { success: true, message: 'Batas anggaran "' + categoryName + '" dihapus.', budgets: loadBudgets_(ss) };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}
