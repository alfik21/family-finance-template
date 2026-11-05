/**
 * tests/qc-audit.js
 * ---------------------------------------------------------------------------
 * QC / Pre-Commercial Audit Suite - Family Finance Tracker
 * ---------------------------------------------------------------------------
 * Suite ini menguji temuan QA pra-rilis secara OTOMATIS (reproducible):
 *   - Keamanan RBAC (Akun Master vs Anggota Diundang)
 *   - Integritas field Peruntukan / Scope (Model Hybrid)
 *   - Integritas formula DASHBOARD (TC-BAL-04 & TC-SUM-01)
 *   - Sinkronisasi data server -> UI (incomeCategories, pendingArchive)
 *   - Kategori tombol cepat (TC-INP-05)
 *   - Keamanan data tutup buku (tidak boleh ada jendela kehilangan data)
 *   - Validasi input server-side (TC-VAL-01 s/d TC-VAL-03)
 *   - Unik ID transaksi, XSS, kebocoran kredensial, sinkronisasi demo
 *
 * Jalankan: node tests/qc-audit.js  (atau npm test)
 * ---------------------------------------------------------------------------
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let passed = 0;
const failures = [];
const results = [];

function check(id, desc, fn) {
  try {
    fn();
    passed++;
    results.push({ id, status: 'PASS', desc });
    console.log('  PASS  ' + id + ' - ' + desc);
  } catch (e) {
    failures.push({ id, desc, error: e.message });
    results.push({ id, status: 'FAIL', desc, error: e.message });
    console.log('  FAIL  ' + id + ' - ' + desc);
    console.log('        -> ' + e.message);
  }
}

function eq(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error((label || 'value') + ': expected ' + e + ' but got ' + a);
}

// ===========================================================================
// 1. SANDBOX BACKEND (Code.gs) DENGAN MOCK GOOGLE APPS SCRIPT
// ===========================================================================

const codeGs = read('Code.gs');

function colToNum(letters) {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function parseA1(ref) {
  const m = String(ref).match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
  if (!m) return null;
  const c1 = colToNum(m[1]);
  const r1 = parseInt(m[2], 10);
  const c2 = m[3] ? colToNum(m[3]) : c1;
  const r2 = m[4] ? parseInt(m[4], 10) : r1;
  return { r1, c1, r2, c2 };
}

/** Sheet grid generik: mendukung semua bentuk getRange yang dipakai Code.gs */
function makeGridSheet(name, initial, ops) {
  let data = (initial || []).map((r) => r.slice());

  const ensure = (r, c) => {
    while (data.length < r) data.push([]);
    data.forEach((row) => { while (row.length < c) row.push(''); });
  };

  const slice = (r1, c1, r2, c2) => {
    ensure(r2, c2);
    const out = [];
    for (let r = r1 - 1; r < r2; r++) {
      out.push(data[r].slice(c1 - 1, c2).map((v) => (v === undefined ? '' : v)));
    }
    return out;
  };

  const write = (r1, c1, rows) => {
    rows.forEach((row, i) => {
      const ri = r1 - 1 + i;
      ensure(ri + 1, c1 + row.length - 1);
      row.forEach((v, j) => { data[ri][c1 - 1 + j] = v; });
    });
  };

  const sheet = {
    name,
    _data: () => data,
    getLastRow() {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].some((v) => v !== '' && v !== null && v !== undefined)) return i + 1;
      }
      return 0;
    },
    getRange(a, b, c, d) {
      let r1, c1, r2, c2;
      if (typeof a === 'string') {
        const p = parseA1(a);
        if (!p) throw new Error('Range tidak dikenal: ' + a);
        ({ r1, c1, r2, c2 } = p);
      } else {
        r1 = a; c1 = b; r2 = a + (c || 1) - 1; c2 = b + (d || 1) - 1;
      }
      return {
        getValues: () => slice(r1, c1, r2, c2),
        getValue: () => slice(r1, c1, r1, c1)[0][0],
        setValue(v) {
          ops.push({ sheet: name, op: 'setValue', ref: r1 + ':' + c1, value: v });
          write(r1, c1, [[v]]);
          return this;
        },
        setValues(rows) {
          ops.push({ sheet: name, op: 'setValues', ref: r1 + ':' + c1, rows: rows.length });
          write(r1, c1, rows);
          return this;
        },
        clearContent() {
          ops.push({ sheet: name, op: 'clearContent', ref: r1 + ':' + c1 });
          for (let r = r1 - 1; r < r2; r++) {
            ensure(r + 1, c2);
            for (let c = c1 - 1; c < c2; c++) data[r][c] = '';
          }
          return this;
        },
        setNumberFormat() { return this; },
        setBackground() { return this; },
        setFontColor() { return this; },
        setFontWeight() { return this; },
        setFontSize() { return this; },
        setHorizontalAlignment() { return this; },
        setFrozenRows() { return this; },
        merge() { return this; },
        clear() { data = []; ops.push({ sheet: name, op: 'clear' }); return this; },
        setTabColor() { return this; }
      };
    },
    appendRow(row) {
      ops.push({ sheet: name, op: 'appendRow', id: row[0] });
      write(sheet.getLastRow() + 1, 1, [row]);
    },
    deleteRow(idx) {
      ops.push({ sheet: name, op: 'deleteRow', idx });
      data.splice(idx - 1, 1);
    },
    setTabColor() { return this; },
    setFrozenRows() { return this; },
    clear() { data = []; return this; },
    getRangeForFormula: null
  };
  return sheet;
}

/** Stub DASHBOARD: hanya mencatat setiap setValue untuk membuktikan formula dirusak */
function makeDashboardStub(ops) {
  return {
    name: 'DASHBOARD',
    getRange(ref) {
      return {
        setValue(v) { ops.push({ sheet: 'DASHBOARD', op: 'setValue', ref, value: v }); return this; },
        setFormula(f) { ops.push({ sheet: 'DASHBOARD', op: 'setFormula', ref, formula: f }); return this; },
        getValue() { return null; },
        getValues() { return [[]]; }
      };
    }
  };
}

function buildConfigGrid(opts) {
  const o = opts || {};
  const withCategoryColumn = o.withCategoryColumn !== false; // kolom J KATEGORI TOMBOL
  const headers = ['PENGATURAN KELUARGA', '', 'KATEGORI PENGELUARAN', 'ALOKASI POS',
    'DOMPET / REKENING', 'PEMILIK DOMPET', 'PRESET CEPAT', 'NOMINAL DEFAULT', 'KATEGORI PEMASUKAN'];
  if (withCategoryColumn) headers.push('KATEGORI TOMBOL');

  const settings = [
    ['Label Suami', o.suamiLabel || 'Ayah'],
    ['Email Suami', o.suamiEmail || 'suami@x.com'],
    ['Label Istri', o.istriLabel || 'Bunda'],
    ['Email Istri', o.istriEmail || 'istri@x.com'],
    ['Email Master', o.masterEmail === undefined ? 'master@x.com' : o.masterEmail],
    ['Peran Master', 'Suami'],
    ['Siklus Gajian (Tgl)', 25],
    ['Bulan Acuan', '2026-11']
  ];

  const cats = o.categories || ['Belanja Pasar & Dapur', 'Listrik & Utilitas', 'Transportasi & Bensin', 'Makan Luar & Jajan', 'Lain-lain'];
  const wallets = o.wallets || [
    ['Rekening BCA Bersama', 'Kas Bersama'],
    ['Kas Tunai Rumah', 'Kas Bersama'],
    ['BCA Pribadi Suami', 'Suami']
  ];
  const incomes = o.incomeCategories || ['Setor Gaji Ayah', 'Setor Gaji Bunda', 'Bonus & THR'];
  const presets = o.presets || [
    ['Token Listrik', 100000, 'Listrik & Utilitas'],
    ['Bensin Motor', 35000, 'Transportasi & Bensin'],
    ['Kopi Pagi', 22000, 'Makan Luar & Jajan']
  ];

  const grid = [headers];
  const maxRows = Math.max(settings.length, cats.length, wallets.length, incomes.length, presets.length, 12);
  for (let i = 0; i < maxRows; i++) {
    const row = new Array(headers.length).fill('');
    const s = settings[i]; if (s) { row[0] = s[0]; row[1] = s[1]; }
    if (cats[i]) row[2] = cats[i];
    if (wallets[i]) { row[4] = wallets[i][0]; row[5] = wallets[i][1]; }
    if (incomes[i]) row[8] = incomes[i];
    if (presets[i]) { row[6] = presets[i][0]; row[7] = presets[i][1]; if (withCategoryColumn) row[9] = presets[i][2] || ''; }
    grid.push(row);
  }
  return grid;
}

function buildTransGrid(rows) {
  const header = ['ID', 'TANGGAL', 'BULAN', 'TIPE', 'KATEGORI', 'PERUNTUKAN', 'DOMPET', 'NOMINAL', 'CATATAN', 'DIINPUT OLEH', 'WAKTU INPUT'];
  return [header].concat(rows || []);
}

function makeSandbox() {
  const state = {
    activeEmail: '',
    effEmail: '',
    ownerEmail: 'owner@x.com',
    sheets: {},
    ops: []
  };

  const ss = {
    getSheetByName: (n) => state.sheets[n] || null,
    insertSheet(n) {
      const s = makeGridSheet(n, [], state.ops);
      state.sheets[n] = s;
      return s;
    },
    getOwner: () => ({ getEmail: () => state.ownerEmail }),
    getSheets: () => Object.values(state.sheets)
  };

  const sandbox = {
    console,
    Date, Math, Number, Object, Array, String, Boolean, RegExp, isNaN, JSON,
    parseInt, parseFloat, isFinite,
    Utilities: {
      formatDate: (d, tz, fmt) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        if (fmt === 'yyyy-MM-dd HH:mm') return `${y}-${m}-${dd} 00:00`;
        if (fmt === 'yyyy-mm') return `${y}-${m}`;
        return `${y}-${m}-${dd}`;
      },
      getUuid: () => 'uuid-' + Math.random().toString(36).slice(2)
    },
    Session: {
      getScriptTimeZone: () => 'Asia/Jakarta',
      getActiveUser: () => ({ getEmail: () => state.activeEmail }),
      getEffectiveUser: () => ({ getEmail: () => state.effEmail })
    },
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, flush: () => {} },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) }
  };

  vm.createContext(sandbox);
  vm.runInContext(codeGs, sandbox, { filename: 'Code.gs' });

  return { sandbox, state, ss };
}

function setupEnv(env, cfgOpts, transRows) {
  env.state.sheets = {};
  env.state.ops = [];
  env.state.sheets.CONFIG = makeGridSheet('CONFIG', buildConfigGrid(cfgOpts), env.state.ops);
  env.state.sheets.TRANSAKSI = makeGridSheet('TRANSAKSI', buildTransGrid(transRows), env.state.ops);
  env.state.sheets.DASHBOARD = makeDashboardStub(env.state.ops);
}

console.log('\n=== QC AUDIT: Family Finance Tracker (Pra-Komersial) ===\n');

// ---------------------------------------------------------------------------
// MODUL A: RBAC (Akun Master vs Anggota Diundang)
// ---------------------------------------------------------------------------
console.log('[A] Modul RBAC & Otorisasi');

const rbacEnv = makeSandbox();

// Skenario deployment yang direkomendasikan README/appsscript.json:
// executeAs: USER_ACCESSING -> Session.getActiveUser() === Session.getEffectiveUser()
function rbacConfig(opts) {
  setupEnv(rbacEnv, Object.assign({ masterEmail: 'master@x.com' }, opts));
}

check('QC-RBAC-01', 'Anggota diundang (active === effective, bukan master) TIDAK boleh dianggap Master', () => {
  rbacConfig();
  rbacEnv.state.activeEmail = 'spouse@x.com';
  rbacEnv.state.effEmail = 'spouse@x.com'; // mode USER_ACCESSING
  const d = rbacEnv.sandbox.getInitialData();
  if (d.isMaster !== false) throw new Error('isMaster=' + d.isMaster + ' untuk spouse@x.com (RBAC bocor: semua pengguna jadi Master)');
});

check('QC-RBAC-02', 'Pengguna tanpa email (anonim / akses link) TIDAK boleh dianggap Master', () => {
  rbacConfig();
  rbacEnv.state.activeEmail = '';
  rbacEnv.state.effEmail = '';
  const d = rbacEnv.sandbox.getInitialData();
  if (d.isMaster !== false) throw new Error('isMaster=' + d.isMaster + ' untuk pengguna anonim');
});

check('QC-RBAC-03', 'Akun Master (email cocok dengan CONFIG B6) tetap diakui sebagai Master', () => {
  rbacConfig();
  rbacEnv.state.activeEmail = 'master@x.com';
  rbacEnv.state.effEmail = 'master@x.com';
  const d = rbacEnv.sandbox.getInitialData();
  if (d.isMaster !== true) throw new Error('Master tidak dikenali (isMaster=' + d.isMaster + ')');
});

check('QC-RBAC-04', 'Pemilik spreadsheet tetap Master walau CONFIG B6 kosong', () => {
  rbacConfig({ masterEmail: '' });
  rbacEnv.state.activeEmail = 'owner@x.com';
  rbacEnv.state.effEmail = 'owner@x.com';
  const d = rbacEnv.sandbox.getInitialData();
  if (d.isMaster !== true) throw new Error('Pemilik spreadsheet tidak dikenali sebagai Master');
});

check('QC-RBAC-05', 'saveConfigData DITOLAK untuk anggota bukan-master (mode USER_ACCESSING)', () => {
  rbacConfig();
  rbacEnv.state.activeEmail = 'spouse@x.com';
  rbacEnv.state.effEmail = 'spouse@x.com';
  const res = rbacEnv.sandbox.saveConfigData({ masterRole: 'Istri' });
  if (res.success !== false) throw new Error('saveConfigData berhasil untuk non-master: ' + JSON.stringify(res));
  const b6 = rbacEnv.state.sheets.CONFIG.getRange('B6').getValue();
  if (b6 !== 'master@x.com') throw new Error('CONFIG B6 ikut berubah walau ditolak');
});

check('QC-RBAC-06', 'closeAndArchiveYear DITOLAK untuk anggota bukan-master (data 2025 tersedia, jadi penolakan murni karena RBAC)', () => {
  rbacConfig();
  rbacEnv.state.activeEmail = 'spouse@x.com';
  rbacEnv.state.effEmail = 'spouse@x.com';
  // Sediakan data tahun 2025 supaya penolakan TIDAK bisa berasal dari
  // "tidak ada data" (harus berasal dari pemeriksaan hak akses)
  rbacEnv.state.sheets.TRANSAKSI = makeGridSheet('TRANSAKSI', buildTransGrid([
    ['TRX-2025', new Date(2025, 5, 10), '2025-06', 'Pengeluaran', 'Belanja Pasar & Dapur', 'Kas Bersama', 'Rekening BCA Bersama [Kas Bersama]', 150000, '', 'spouse@x.com', new Date()]
  ]), rbacEnv.state.ops);
  const res = rbacEnv.sandbox.closeAndArchiveYear(2025);
  if (res.success !== false) throw new Error('Tutup buku dilakukan non-master: ' + JSON.stringify(res));
  const arsip = rbacEnv.state.sheets['ARSIP_2025'];
  if (arsip) throw new Error('Tab ARSIP_2025 dibuat oleh non-master');
  const ids = rbacEnv.state.sheets.TRANSAKSI._data().map((r) => r[0]);
  if (!ids.includes('TRX-2025')) throw new Error('Data transaksi 2025 ikut berubah oleh non-master');
});

check('QC-RBAC-07', 'saveAccountSettings DITOLAK untuk pengguna tanpa identitas (email kosong)', () => {
  rbacConfig();
  rbacEnv.state.activeEmail = '';
  rbacEnv.state.effEmail = '';
  const res = rbacEnv.sandbox.saveAccountSettings({ suamiLabel: 'Hacker' });
  if (res.success !== false) throw new Error('saveAccountSettings diterima untuk pengguna tanpa email');
});

check('QC-RBAC-08', 'Pemilik spreadsheet MASIH BISA mengubah konfigurasi (tidak terkunci)', () => {
  rbacConfig();
  rbacEnv.state.activeEmail = 'owner@x.com';
  rbacEnv.state.effEmail = 'owner@x.com';
  const res = rbacEnv.sandbox.saveAccountSettings({ masterRole: 'Suami' });
  if (res.success !== true) throw new Error('Pemilik diblokir: ' + JSON.stringify(res));
});

// ---------------------------------------------------------------------------
// MODUL B: PERUNTUKAN / SCOPE (Model Hybrid)
// ---------------------------------------------------------------------------
console.log('\n[B] Modul Peruntukan / Scope (Model Hybrid)');

const webAppHtml = read('WebApp.html');

function extractFunction(src, name) {
  const start = src.indexOf('function ' + name);
  if (start === -1) throw new Error('fungsi ' + name + ' tidak ditemukan');
  let i = src.indexOf('{', start);
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) break; }
  }
  return src.slice(start, i + 1);
}

function runResolveScope(scopeValue, walletValue, type) {
  // Ekstrak seluruh rantai dependensi resolveResolvedScope (QC-SCOPE-02/03)
  const src = extractFunction(webAppHtml, 'deriveScopeFromWallet') + '\n' +
    extractFunction(webAppHtml, 'resolveResolvedScope');
  const doc = {
    getElementById: (id) => {
      if (id === 'scopeSelect') return scopeValue === undefined ? null : { value: scopeValue };
      if (id === 'walletSelect') return { value: walletValue || '' };
      return null;
    }
  };
  const factory = new Function('document', 'currentType', src + '\nreturn resolveResolvedScope;');
  return factory(doc, type || 'Pengeluaran')();
}

check('QC-SCOPE-01', 'Form input memiliki field Peruntukan (didokumentasikan di User Guide)', () => {
  if (!webAppHtml.includes('id="scopeSelect"')) throw new Error('elemen id="scopeSelect" tidak ada di WebApp.html');
  if (!webAppHtml.includes('id="colScope"')) throw new Error('kontainer colScope tidak ada');
});

check('QC-SCOPE-02', 'Dompet pribadi Suami menghasilkan Peruntukan "Pribadi Suami" (bukan selalu Kas Bersama)', () => {
  const got = runResolveScope(undefined, 'BCA Pribadi Suami [Suami]', 'Pengeluaran');
  if (got !== 'Pribadi Suami') throw new Error('mengembalikan ' + JSON.stringify(got));
});

check('QC-SCOPE-03', 'Pilihan manual pada field Peruntukan dihormati', () => {
  const got = runResolveScope('Pribadi Istri', 'Rekening BCA Bersama [Kas Bersama]', 'Pengeluaran');
  if (got !== 'Pribadi Istri') throw new Error('mengembalikan ' + JSON.stringify(got));
});

check('QC-SCOPE-04', 'Transfer selalu ber-scope "Transfer"', () => {
  const got = runResolveScope('Kas Bersama', 'A [Kas Bersama] ke B [Kas Bersama]', 'Transfer');
  if (got !== 'Transfer') throw new Error('mengembalikan ' + JSON.stringify(got));
});

check('QC-SCOPE-05', 'Field Peruntukan disembunyikan untuk tipe selain Pengeluaran (antibingung)', () => {
  if (!/getElementById\('colScope'\)/.test(webAppHtml)) throw new Error('updateDynamicUI tidak mengelola visibilitas colScope');
});

check('QC-SCOPE-06', 'Kalkulasi lokal Rekap memakai scope Kas Bersama untuk pos Operasional', () => {
  const src = extractFunction(webAppHtml, 'fetchCustomPeriodSummary');
  if (!/scopes\[['"]Kas Bersama['"]\]/.test(src) && !/byScope/.test(src)) {
    throw new Error('perhitungan operasional lokal tidak memakai scope Kas Bersama');
  }
  if (!/Math\.max\(0,\s*\(scopes\[['"]Kas Bersama['"]\]/.test(src.replace(/\s+/g, ' '))) {
    throw new Error('operasional lokal masih memakai totalExpense lintas scope (pribadi ikut terhitung)');
  }
});

// ---------------------------------------------------------------------------
// MODUL C: INTEGRITAS FORMULA DASHBOARD (TC-BAL-04, TC-SUM-01)
// ---------------------------------------------------------------------------
console.log('\n[C] Modul Integritas Formula DASHBOARD');

const dashEnv = makeSandbox();

check('QC-DASH-01', 'getInitialData TIDAK menimpa formula DASHBOARD A6/C6/E6/G6 (TC-BAL-04, TC-SUM-01)', () => {
  setupEnv(dashEnv, {});
  dashEnv.state.activeEmail = 'master@x.com';
  dashEnv.state.effEmail = 'master@x.com';
  dashEnv.state.sheets.TRANSAKSI = makeGridSheet('TRANSAKSI', buildTransGrid([
    ['TRX-1', new Date(2026, 10, 26), '2026-11', 'Pemasukan', 'Setor Gaji Ayah', 'Kas Bersama', 'Rekening BCA Bersama [Kas Bersama]', 10000000, '', 'master@x.com', new Date()]
  ]), dashEnv.state.ops);
  dashEnv.sandbox.getInitialData();
  const dashWrites = dashEnv.state.ops.filter((o) => o.sheet === 'DASHBOARD');
  if (dashWrites.length > 0) {
    throw new Error('formula DASHBOARD ditimpa: ' + dashWrites.map((w) => w.op + '@' + w.ref).join(', ') +
      ' -> nilai statis siklus gajian menggantikan formula bulanan =A6-E6');
  }
});

// ---------------------------------------------------------------------------
// MODUL D: SINKRONISASI DATA SERVER -> UI
// ---------------------------------------------------------------------------
console.log('\n[D] Modul Sinkronisasi Server -> UI');

const fetchSrc = extractFunction(webAppHtml, 'fetchServerData');

check('QC-SYNC-01', 'fetchServerData menerapkan incomeCategories dari CONFIG', () => {
  if (!/appData\.incomeCategories\s*=\s*data\.incomeCategories/.test(fetchSrc)) {
    throw new Error('appData.incomeCategories tidak pernah diisi dari data server (kustomisasi pemasukan tidak tersinkron antar perangkat)');
  }
});

check('QC-SYNC-02', 'fetchServerData menerapkan pendingArchive (peringatan tutup buku)', () => {
  if (!/appData\.pendingArchive\s*=\s*data\.pendingArchive/.test(fetchSrc)) {
    throw new Error('appData.pendingArchive tidak pernah diisi -> boxPendingArchiveAlert tidak pernah muncul');
  }
});

check('QC-SYNC-03', 'fetchServerData menerapkan defaultPresets (mode preset manual)', () => {
  if (!/appData\.defaultPresets\s*=\s*data\.defaultPresets/.test(fetchSrc)) {
    throw new Error('appData.defaultPresets tidak pernah diisi dari server');
  }
});

// ---------------------------------------------------------------------------
// MODUL E: TOMBOL CEPAT / PRESET (TC-INP-05)
// ---------------------------------------------------------------------------
console.log('\n[E] Modul Tombol Cepat (TC-INP-05)');

const presetEnv = makeSandbox();

check('QC-PRESET-01', 'Preset dari CONFIG membawa kategori (satu ketukan terisi lengkap)', () => {
  setupEnv(presetEnv, {});
  presetEnv.state.activeEmail = 'master@x.com';
  presetEnv.state.effEmail = 'master@x.com';
  const d = presetEnv.sandbox.getInitialData();
  const p = (d.defaultPresets || []).find((x) => x.name === 'Token Listrik');
  if (!p) throw new Error('preset Token Listrik tidak terbaca dari CONFIG');
  if (!p.category || p.category === 'Lain-lain') {
    throw new Error('preset tanpa kategori: ' + JSON.stringify(p) + ' -> field Kategori tidak terisi otomatis');
  }
});

check('QC-PRESET-02', 'Kompatibilitas mundur: sheet lama tanpa kolom J tetap terbantu riwayat transaksi', () => {
  setupEnv(presetEnv, { withCategoryColumn: false });
  presetEnv.state.activeEmail = 'master@x.com';
  presetEnv.state.effEmail = 'master@x.com';
  presetEnv.state.sheets.TRANSAKSI = makeGridSheet('TRANSAKSI', buildTransGrid([
    ['TRX-9', new Date(2026, 10, 20), '2026-11', 'Pengeluaran', 'Listrik & Utilitas', 'Kas Bersama', 'Rekening BCA Bersama [Kas Bersama]', 100000, 'Token Listrik', 'master@x.com', new Date()],
    ['TRX-10', new Date(2026, 10, 21), '2026-11', 'Pengeluaran', 'Listrik & Utilitas', 'Kas Bersama', 'Rekening BCA Bersama [Kas Bersama]', 100000, 'Token Listrik', 'master@x.com', new Date()]
  ]), presetEnv.state.ops);
  const d = presetEnv.sandbox.getInitialData();
  const p = (d.defaultPresets || []).find((x) => x.name === 'Token Listrik');
  if (!p || !p.category) throw new Error('kategori preset tidak tersinfer dari riwayat: ' + JSON.stringify(p));
});

check('QC-PRESET-03', 'renderPresets tidak mengarang kategori "Lain-lain" untuk preset tanpa kategori', () => {
  if (/p\.category\s*\|\|\s*'Lain-lain'/.test(webAppHtml)) {
    throw new Error('renderPresets menjejalkan kategori Lain-lain palsu ke field Kategori');
  }
});

// ---------------------------------------------------------------------------
// MODUL F: KEAMANAN DATA TUTUP BUKU
// ---------------------------------------------------------------------------
console.log('\n[F] Modul Keamanan Data Tutup Buku (closeAndArchiveYear)');

const archEnv = makeSandbox();

check('QC-ARCH-01', 'Kegagalan saat proses tutup buku TIDAK menghapus sheet TRANSAKSI', () => {
  setupEnv(archEnv, {});
  archEnv.state.activeEmail = 'master@x.com';
  archEnv.state.effEmail = 'master@x.com';

  const rows = [
    ['TRX-A', new Date(2025, 5, 10), '2025-06', 'Pemasukan', 'Setor Gaji Ayah', 'Kas Bersama', 'Rekening BCA Bersama [Kas Bersama]', 5000000, '', 'master@x.com', new Date()],
    ['TRX-B', new Date(2025, 6, 10), '2025-07', 'Pengeluaran', 'Belanja Pasar & Dapur', 'Kas Bersama', 'Rekening BCA Bersama [Kas Bersama]', 1500000, '', 'master@x.com', new Date()]
  ];
  archEnv.state.sheets.TRANSAKSI = makeGridSheet('TRANSAKSI', buildTransGrid(rows), archEnv.state.ops);

  // Picu kegagalan di tengah proses: pembacaan dompet CONFIG melempar error
  const realGetRange = archEnv.state.sheets.CONFIG.getRange.bind(archEnv.state.sheets.CONFIG);
  archEnv.state.sheets.CONFIG.getRange = (a, b, c, d) => {
    const ref = typeof a === 'string' ? a : (a + ':' + b);
    if (String(ref).indexOf('E2') === 0 || (typeof a === 'number' && c === 50)) {
      throw new Error('Simulasi kegagalan membaca CONFIG');
    }
    return realGetRange(a, b, c, d);
  };

  const res = archEnv.sandbox.closeAndArchiveYear(2025);
  const clears = archEnv.state.ops.filter((o) => o.sheet === 'TRANSAKSI' && (o.op === 'clearContent' || o.op === 'setValues' || o.op === 'clear'));
  if (res.success !== false) throw new Error('seharusnya gagal, tapi: ' + JSON.stringify(res));
  if (clears.length > 0) {
    throw new Error('TRANSAKSI sudah diubah (' + clears.map((c) => c.op).join(',') + ') sebelum proses selesai -> data tahun berjalan berisiko hilang');
  }
  const stillThere = archEnv.state.sheets.TRANSAKSI.getLastRow();
  if (stillThere < 3) throw new Error('baris TRANSAKSI tinggal ' + stillThere);
});

check('QC-ARCH-02', 'Tutup buku sukses: data pindah ke ARSIP_2025 + saldo awal masuk, tanpa keadaan kosong', () => {
  setupEnv(archEnv, {});
  archEnv.state.activeEmail = 'master@x.com';
  archEnv.state.effEmail = 'master@x.com';
  const rows = [
    ['TRX-A', new Date(2025, 5, 10), '2025-06', 'Pemasukan', 'Setor Gaji Ayah', 'Kas Bersama', 'Rekening BCA Bersama [Kas Bersama]', 5000000, '', 'master@x.com', new Date()],
    ['TRX-B', new Date(2025, 6, 10), '2025-07', 'Pengeluaran', 'Belanja Pasar & Dapur', 'Kas Bersama', 'Rekening BCA Bersama [Kas Bersama]', 1500000, '', 'master@x.com', new Date()],
    ['TRX-C', new Date(2026, 0, 5), '2026-01', 'Pengeluaran', 'Lain-lain', 'Kas Bersama', 'Kas Tunai Rumah [Kas Bersama]', 100000, '', 'master@x.com', new Date()]
  ];
  archEnv.state.sheets.TRANSAKSI = makeGridSheet('TRANSAKSI', buildTransGrid(rows), archEnv.state.ops);

  const res = archEnv.sandbox.closeAndArchiveYear(2025);
  if (res.success !== true) throw new Error(JSON.stringify(res));

  const arsip = archEnv.state.sheets['ARSIP_2025'];
  if (!arsip) throw new Error('tab ARSIP_2025 tidak dibuat');
  const arsipIds = arsip._data().map((r) => r[0]);
  if (!arsipIds.includes('TRX-A') || !arsipIds.includes('TRX-B')) throw new Error('data 2025 tidak masuk ARSIP');

  const transIds = archEnv.state.sheets.TRANSAKSI._data().map((r) => r[0]);
  if (transIds.includes('TRX-A')) throw new Error('data 2025 masih tersisa di TRANSAKSI');
  if (!transIds.includes('TRX-C')) throw new Error('data 2026 ikut terhapus!');
  if (!transIds.some((id) => String(id).indexOf('TRX-INIT-') === 0)) throw new Error('baris saldo awal tahun baru tidak dibuat');
});

// ---------------------------------------------------------------------------
// MODUL G: VALIDASI INPUT SERVER-SIDE (TC-VAL-01..03)
// ---------------------------------------------------------------------------
console.log('\n[G] Modul Validasi Input Server-Side');

const valEnv = makeSandbox();

function submitWith(payload) {
  setupEnv(valEnv, {});
  valEnv.state.activeEmail = 'spouse@x.com';
  valEnv.state.effEmail = 'spouse@x.com';
  return valEnv.sandbox.submitTransaction(Object.assign({
    type: 'Pengeluaran',
    category: 'Belanja Pasar & Dapur',
    scope: 'Kas Bersama',
    wallet: 'Rekening BCA Bersama [Kas Bersama]',
    date: '2026-11-05',
    note: 'Beli sayur',
    authorRole: 'Suami (Ayah)'
  }, payload));
}

check('QC-VAL-01', 'Server menolak nominal 0 (TC-VAL-01)', () => {
  const res = submitWith({ amount: 0 });
  if (res.success !== false) throw new Error('nominal 0 diterima server');
});

check('QC-VAL-02', 'Server menolak nominal negatif (TC-VAL-02)', () => {
  const res = submitWith({ amount: -50000 });
  if (res.success !== false) throw new Error('nominal negatif diterima server');
});

check('QC-VAL-03', 'Server menolak nominal non-numerik (TC-VAL-02)', () => {
  const res = submitWith({ amount: 'seratus ribu' });
  if (res.success !== false) throw new Error('nominal non-numerik diterima server');
});

check('QC-VAL-04', 'Server menolak tanggal tidak valid (TC-VAL-03)', () => {
  const res = submitWith({ amount: 50000, date: '2026-13-45' });
  if (res.success !== false) throw new Error('tanggal tidak valid diterima server: ' + JSON.stringify(res));
});

check('QC-VAL-05', 'Payload valid tetap tersimpan dengan benar', () => {
  const res = submitWith({ amount: 75000 });
  if (res.success !== true) throw new Error(JSON.stringify(res));
  const data = valEnv.state.sheets.TRANSAKSI._data();
  const last = data[data.length - 1];
  if (last[7] !== 75000) throw new Error('nominal tersimpan ' + last[7]);
  if (last[1] instanceof Date && isNaN(last[1].getTime())) throw new Error('tanggal tersimpan Invalid Date');
});

// ---------------------------------------------------------------------------
// MODUL H: UNIK ID TRANSAKSI
// ---------------------------------------------------------------------------
console.log('\n[H] Modul Unik ID Transaksi');

check('QC-ID-01', 'generateTrxId() selalu unik (aman untuk edit/hapus)', () => {
  if (typeof valEnv.sandbox.generateTrxId !== 'function') {
    throw new Error('helper generateTrxId tidak ada di Code.gs (ID masih dibuat inline dari6 digit timestamp -> rentan tabrakan)');
  }
  const seen = new Set();
  for (let i = 0; i < 500; i++) {
    const id = valEnv.sandbox.generateTrxId();
    if (seen.has(id)) throw new Error('ID duplikat setelah ' + i + ' kali: ' + id);
    seen.add(id);
  }
});

// ---------------------------------------------------------------------------
// MODUL I: KEAMANAN (XSS & Kebocoran Kredensial)
// ---------------------------------------------------------------------------
console.log('\n[I] Modul Keamanan');

check('QC-XSS-01', 'Semua data pengguna di innerHTML lewat escapeHtml (authorRole & owner dompet)', () => {
  const unsafe = [];
  if (/\+\s*\(tx\.authorRole\s*\|\|/.test(webAppHtml) && !/escapeHtml\(tx\.authorRole/.test(webAppHtml)) {
    unsafe.push('tx.authorRole tanpa escape');
  }
  if (/ownerBadge = '<span[^>]*>' \+ wb\.owner \+/.test(webAppHtml)) unsafe.push('wb.owner tanpa escape');
  if (unsafe.length) throw new Error(unsafe.join('; '));
});

check('QC-SEC-01', 'File kredensial (.clasp.json) tidak ter-track git', () => {
  let tracked = '';
  try {
    tracked = execSync('git ls-files -- .clasp.json', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (e) { tracked = ''; }
  if (tracked) throw new Error('.clasp.json masih ter-track git: ' + tracked);
});

check('QC-SEC-02', 'Tidak ada ID deployment / script Google di berkas sumber yang dijual', () => {
  const scanFiles = ['Code.gs', 'Setup.gs', 'WebApp.html', 'preview.html', 'test-runner.html',
    'package.json', 'README.md', 'setup_guide.md', 'appsscript.json', 'vercel.json'];
  const bad = [];
  scanFiles.forEach((f) => {
    const c = read(f);
    if (/AKfycb[A-Za-z0-9_-]{10,}/.test(c)) bad.push(f + ': deployment ID');
    if (/1wC4EQjbDMF/.test(c)) bad.push(f + ': script ID developer');
    if (/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]{30,}/.test(c)) bad.push(f + ': spreadsheet ID nyata');
  });
  if (bad.length) throw new Error(bad.join(', '));
});

check('QC-SEC-03', 'Manifest web app memaksa login Google (konsisten dengan README & membuat RBAC deterministik)', () => {
  const manifest = JSON.parse(read('appsscript.json'));
  if (manifest.webapp.executeAs !== 'USER_ACCESSING') {
    throw new Error('executeAs=' + manifest.webapp.executeAs + ' (README mewajibkan USER_ACCESSING)');
  }
  // Dalam skema Google Apps Script manifest: ketika executeAs: USER_ACCESSING,
  // enum yang valid untuk akun Google yang login adalah 'ANYONE'.
  if (manifest.webapp.access !== 'ANYONE') {
    throw new Error('access=' + manifest.webapp.access + ' -> diharapkan ANYONE untuk USER_ACCESSING');
  }
});

// ---------------------------------------------------------------------------
// MODUL J: SINKRONISASI DEMO & KONSISTENSI DOKUMEN
// ---------------------------------------------------------------------------
console.log('\n[J] Modul Sinkronisasi Demo & Konsistensi');

check('QC-DEMO-01', 'Berkas demo/ identik dengan sumber (preview, WebApp, vercel)', () => {
  const pairs = [['preview.html', 'demo/preview.html'], ['WebApp.html', 'demo/WebApp.html'], ['vercel.json', 'demo/vercel.json']];
  const diff = pairs.filter(([a, b]) => {
    try { return fs.readFileSync(path.join(ROOT, a), 'utf8') !== fs.readFileSync(path.join(ROOT, b), 'utf8'); }
    catch (e) { return true; }
  });
  if (diff.length) throw new Error('tidak sinkron: ' + diff.map((d) => d.join(' vs ')).join(', ') + ' (jalankan: npm run sync)');
});

check('QC-DOC-01', 'Field Peruntukan pada User Guide kini benar-benar ada di aplikasi', () => {
  const guide = read('docs/03_USER_GUIDE.md');
  if (guide.includes('Peruntukan   : [') && !webAppHtml.includes('id="scopeSelect"')) {
    throw new Error('User Guide mendokumentasikan field Peruntukan yang tidak ada di aplikasi');
  }
});

// ---------------------------------------------------------------------------
// RINGKASAN
// ---------------------------------------------------------------------------
console.log('\n============================================================');
console.log('HASIL QC: ' + passed + ' LULUS, ' + failures.length + ' GAGAL');
console.log('============================================================');
if (failures.length) {
  console.log('\nDaftar temuan yang BELUM diperbaiki:');
  failures.forEach((f, i) => console.log('  ' + (i + 1) + '. [' + f.id + '] ' + f.desc));
  console.log('\nStatus: DITAHAN (HOLD) - belum layak komersial.');
  process.exit(1);
}
console.log('Status: SELURUH TEMUAN QA LULUS - siap lanjut ke UAT pilot couples.');
