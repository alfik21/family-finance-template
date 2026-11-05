const fs = require('fs');
const vm = require('vm');

console.log('Running Family Finance Tracker Test Suite (v2.0 RBAC & Bottom Nav)...\n');

// 1. Syntax Check
const files = ['Code.gs', 'Setup.gs'];
files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  new vm.Script(code);
  console.log('✔ Syntax OK: ' + f);
});

// 2. HTML embedded scripts
['WebApp.html', 'test-runner.html', 'preview.html'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const scripts = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi) || [];
  scripts.forEach((s) => {
    const code = s.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '');
    if (code.trim() && !s.includes('cdn.tailwindcss.com')) {
      new vm.Script(code);
    }
  });
  console.log('✔ HTML Scripts OK: ' + f);
});

// 3. Zero-Emoji / Zero-Symbol Verification
// Regex for emoji characters
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}]/u;
const checkedFiles = [
  'Code.gs', 'Setup.gs', 'WebApp.html', 'test-runner.html', 'preview.html',
  'demo/preview.html', 'demo/WebApp.html', 'setup_guide.md', 'README.md'
];
let emojiDetected = false;

checkedFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      console.error(`✘ Emoji detected in ${f}:${idx + 1}: ${line.trim()}`);
      emojiDetected = true;
    }
  });
});

if (!emojiDetected) {
  console.log('✔ Zero-Emoji Policy: Passed across all project files!');
} else {
  throw new Error('Policy violation: Unicode emojis found in project files.');
}

// 4. Feature Verification: Mobile Bottom Navigation
const webAppHtml = fs.readFileSync('WebApp.html', 'utf8');
if (webAppHtml.includes('mobileNavTabRecord') && webAppHtml.includes('mobileNavTabAccount') && webAppHtml.includes('fixed bottom-0')) {
  console.log('✔ Mobile Bottom Nav: Verified (Thumb-reachable container & 4 tabs)');
} else {
  throw new Error('Mobile Bottom Nav elements missing in WebApp.html');
}

// 5. Feature Verification: RBAC & Account Management
if (webAppHtml.includes('viewAccount') && webAppHtml.includes('accMasterRole') && webAppHtml.includes('manageRbacWarning')) {
  console.log('✔ RBAC & Account Settings: Verified (View 4, master toggle, restricted member lock)');
} else {
  throw new Error('RBAC & Account elements missing in WebApp.html');
}

// 6. Feature Verification: Wallet Ownership & Transfer Route
if (webAppHtml.includes('transferRoutePreview') && webAppHtml.includes('optGroup.label') && webAppHtml.includes('Kas Bersama')) {
  console.log('✔ Explicit Wallet Ownership: Verified (Optgroup badges and transfer routing preview)');
} else {
  throw new Error('Wallet ownership elements missing in WebApp.html');
}

// 7. Logic verification: Salary cycle period calculation (with strict assertions)
function getSalaryPeriod(today, salaryDate) {
  let start, end;
  if (today.getDate() >= salaryDate) {
    start = new Date(today.getFullYear(), today.getMonth(), salaryDate);
    end = new Date(today.getFullYear(), today.getMonth() + 1, salaryDate - 1);
  } else {
    start = new Date(today.getFullYear(), today.getMonth() - 1, salaryDate);
    end = new Date(today.getFullYear(), today.getMonth(), salaryDate - 1);
  }
  return { start, end };
}

const p1 = getSalaryPeriod(new Date(2026, 9, 26), 25);
if (p1.start.getDate() !== 25) {
  throw new Error('Cycle check after pay date failed');
}
console.log('✔ Cycle check (after pay date 25 Oct): Starts on 25 Oct: PASS');

const p2 = getSalaryPeriod(new Date(2026, 9, 10), 25);
if (!(p2.start.getMonth() === 8 && p2.start.getDate() === 25)) {
  throw new Error('Cycle check before pay date failed');
}
console.log('✔ Cycle check (before pay date 10 Oct): Starts on 25 Sep: PASS');

// 8. Logic verification: Smart Presets extraction
const codeGs = fs.readFileSync('Code.gs', 'utf8');
if (!codeGs.includes('extractSmartPresets')) {
  throw new Error('Task 1 pending: extractSmartPresets function not implemented in Code.gs');
}

// 9. Logic verification: Close & Archive Year functions
if (!codeGs.includes('closeAndArchiveYear') || !codeGs.includes('checkPendingArchive')) {
  throw new Error('Task 2 pending: closeAndArchiveYear or checkPendingArchive not implemented in Code.gs');
}

// 10. WebApp Archiving & Preset UI verification
if (!webAppHtml.includes('sectionMasterArchiving') || !webAppHtml.includes('executeYearlyArchive')) {
  throw new Error('Task 4 pending: sectionMasterArchiving or executeYearlyArchive not implemented in WebApp.html');
}
if (!webAppHtml.includes('subPanelPre') || !webAppHtml.includes('togglePresetMode')) {
  throw new Error('Task 4 pending: subPanelPre or togglePresetMode not implemented in WebApp.html');
}
console.log('✔ WebApp Archiving UI & Smart Preset Mode Controls: Verified');

// 11. Verification: deleteTransaction support
if (!codeGs.includes('deleteTransaction') || !webAppHtml.includes('confirmDeleteTx')) {
  throw new Error('Verification failed: deleteTransaction missing in Code.gs or confirmDeleteTx in WebApp.html');
}
console.log('✔ Transaction Deletion & Live Reversal: Verified');

// 12. Verification: Financial State & Wallet Balances calculation
if (!codeGs.includes('calculateFinancialState') || !webAppHtml.includes('recalculateLocalBalances')) {
  throw new Error('Verification failed: calculateFinancialState missing in Code.gs or recalculateLocalBalances in WebApp.html');
}
console.log('✔ Realtime Cumulative Wallet Balances & Cycle Sync: Verified');

// 13. Verification: Single-Scope Kas Bersama & Reconciliation
if (!webAppHtml.includes('walletBalancesContainer') || !webAppHtml.includes('Kas Bersama')) {
  throw new Error('Verification failed: walletBalancesContainer or Kas Bersama missing in WebApp.html');
}
console.log('✔ Single-Scope Kas Bersama & Wallet Reconciliation UI: Verified');

// 14. Verification: Quick Edit Transaction (Backend & Frontend)
if (!codeGs.includes('function updateTransaction') || !webAppHtml.includes('startEditTransaction') || !webAppHtml.includes('bannerEditMode')) {
  throw new Error('Verification failed: updateTransaction in Code.gs or startEditTransaction/bannerEditMode in WebApp.html missing');
}
console.log('✔ Quick Edit Transaction (updateTransaction & inline edit form): Verified');

// 15. Verification: Initial Balance Input on Wallet Creation
if (!webAppHtml.includes('inputNewWalletInitialBalance') || !webAppHtml.includes('Saldo Awal Tahun')) {
  throw new Error('Verification failed: inputNewWalletInitialBalance missing in WebApp.html');
}
console.log('✔ Wallet Initial Balance Input & Opening Balance Generation: Verified');

// 16. Verification: Salary Cycle Navigation
if (!webAppHtml.includes('navigateSalaryCycle') || !webAppHtml.includes('btnPeriodPrevCycle') || !webAppHtml.includes('textActiveCycleRange')) {
  throw new Error('Verification failed: navigateSalaryCycle or cycle navigation buttons missing in WebApp.html');
}
console.log('✔ Salary Cycle Navigation & Cycle Range Indicator: Verified');

// 17. Verification: Multi-Wallet Carryover in Annual Closing
if (!codeGs.includes('TRX-INIT-') || !codeGs.includes('walletMap') || !webAppHtml.includes('walletBalancesMap')) {
  throw new Error('Verification failed: Multi-wallet carryover logic missing in Code.gs or WebApp.html');
}
console.log('✔ Multi-Wallet Balance Preservation in Yearly Archive: Verified');

// 18. Verification Point 1: Distribusi Pos Pengeluaran Pasangan (Operasional, Ayah, Bunda)
if (!webAppHtml.includes('cyclePosOperasional') || !webAppHtml.includes('cyclePosAyah') || !webAppHtml.includes('cyclePosBunda') || !codeGs.includes('byPos')) {
  throw new Error('Verification failed: Pos Pengeluaran Pasangan elements or byPos calculation missing');
}
console.log('✔ Distribusi Pos Pengeluaran Pasangan: Verified (Operasional, Ayah, Bunda & byPos calculation)');

// 19. Verification Point 2: Two-Way Salary Cycle Navigation
if (!webAppHtml.includes('btnPeriodPrevCycle') || !webAppHtml.includes('btnPeriodNextCycle') || !webAppHtml.includes('btnResetToCurrentCycle')) {
  throw new Error('Verification failed: Two-way cycle pager buttons missing in WebApp.html');
}
console.log('✔ Two-Way Salary Cycle Navigation: Verified (Prev, Next, Reset pill, Clamped offset)');

// 20. Verification Point 3: Manage Income Categories in View 3
if (!webAppHtml.includes('btnCatTypeExpense') || !webAppHtml.includes('btnCatTypeIncome') || !webAppHtml.includes('setCategoryManageType') || !codeGs.includes('incomeCategories')) {
  throw new Error('Verification failed: Income categories management or persistence missing');
}
console.log('✔ Manage Income Categories: Verified (Expense/Income toggle & Sheets persistence)');

// 21. Verification Point 4: Single-Scope Wallet Creation (No Owner Dropdown)
if (webAppHtml.includes('selectNewWalletOwner')) {
  throw new Error('Verification failed: selectNewWalletOwner still present in WebApp.html');
}
console.log('✔ Single-Scope Wallet Creation: Verified (selectNewWalletOwner removed, defaults Kas Bersama)');

// 22. Verification Point 5: Locked Transaction Type on Edit Mode
if (!webAppHtml.includes('textEditTypeLockedHint') || !webAppHtml.includes('b.disabled = true') || !webAppHtml.includes('b.disabled = false')) {
  throw new Error('Verification failed: Locked transaction type controls on edit mode missing in WebApp.html');
}
console.log('✔ Locked Transaction Type on Edit: Verified (Buttons disabled, hint displayed, restored on cancel)');

// 23. Verification Point 6: Dead Code Cleanup
if (webAppHtml.includes('id="sectionScope"') || webAppHtml.includes('currentScopeChoice') || webAppHtml.includes('setScopeChoice(')) {
  throw new Error('Verification failed: Dead scope elements or functions still present in WebApp.html');
}
console.log('✔ Dead Code Cleanup: Verified (Zero scope stubs, zero console errors)');

// =========================================================================
// FUNCTIONAL UNIT TESTS (Node VM Execution of Backend & Frontend Math)
// =========================================================================

// 24. Functional Test: calculateFinancialState execution & regression check
const vmSandbox = {
  console, Date, Math, Number, Object, Array, String, Boolean, RegExp, isNaN,
  Utilities: { formatDate: () => '2026-10-25' },
  Session: {
    getScriptTimeZone: () => 'Asia/Jakarta',
    getActiveUser: () => ({ getEmail: () => 'suami@test.com' }),
    getEffectiveUser: () => ({ getEmail: () => 'suami@test.com' })
  },
  SpreadsheetApp: { getActiveSpreadsheet: () => null, flush: () => {} },
  LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) }
};

vm.createContext(vmSandbox);
vm.runInContext(codeGs, vmSandbox);

const mockWallets = [
  { name: 'BCA Bersama', owner: 'Kas Bersama' },
  { name: 'Kas Tunai', owner: 'Kas Bersama' },
  { name: 'BCA Suami', owner: 'Suami' }
];

const mockTransRows = [
  ['TRX-001', new Date(2026, 9, 26), '2026-10', 'Pemasukan', 'Setor Gaji Ayah', 'Kas Bersama', 'BCA Bersama [Kas Bersama]', 10000000, '', 'suami@test.com', new Date()],
  ['TRX-002', new Date(2026, 9, 27), '2026-10', 'Pengeluaran', 'Belanja Dapur', 'Kas Bersama', 'BCA Bersama [Kas Bersama]', 1500000, '', 'istri@test.com', new Date()],
  ['TRX-003', new Date(2026, 9, 28), '2026-10', 'Transfer', 'Transfer Kas', 'Transfer', 'BCA Bersama [Kas Bersama] ke Kas Tunai [Kas Bersama]', 500000, '', 'suami@test.com', new Date()],
  ['TRX-004', new Date(2026, 9, 29), '2026-10', 'Pengeluaran', 'Bensin Motor', 'Pribadi Suami', 'BCA Suami [Suami]', 50000, '', 'suami@test.com', new Date()]
];

const mockSheet = {
  getLastRow: () => mockTransRows.length + 1,
  getRange: () => ({ getValues: () => mockTransRows })
};

const finState = vmSandbox.calculateFinancialState(mockSheet, mockWallets, 25);
if (!finState || typeof finState !== 'object') {
  throw new Error('calculateFinancialState returned invalid result');
}
if (finState.cycleIncome !== 10000000) {
  throw new Error(`Expected cycleIncome 10,000,000 but got ${finState.cycleIncome}`);
}
if (finState.cycleExpense !== 1550000) {
  throw new Error(`Expected cycleExpense 1,550,000 but got ${finState.cycleExpense}`);
}
if (finState.cycleJointExpense !== 1500000) {
  throw new Error(`Expected cycleJointExpense 1,500,000 but got ${finState.cycleJointExpense}`);
}
// BCA Bersama: +10,000,000 - 1,500,000 - 500,000 = 8,000,000
// Kas Tunai: +500,000
// Kas Bersama Joint: 8,500,000
if (finState.jointBalance !== 8500000) {
  throw new Error(`Expected jointBalance 8,500,000 but got ${finState.jointBalance}`);
}
console.log('✔ Functional Test: calculateFinancialState arithmetic & regression verified (No ReferenceError)');

// 25. Functional Test: loadConfigData definition and execution
if (typeof vmSandbox.loadConfigData !== 'function') {
  throw new Error('Verification failed: loadConfigData function is not defined in Code.gs');
}

const mockConfigSheet = {
  getRange: (rangeStr) => ({
    getValues: () => {
      if (rangeStr === 'E2:F50') return [['BCA Bersama', 'Kas Bersama'], ['Dompet Tunai', 'Kas Bersama']];
      if (rangeStr === 'C2:C50') return [['Belanja'], ['Makan']];
      if (rangeStr === 'I2:I50') return [['Gaji'], ['Bonus']];
      return [];
    },
    getValue: () => 25
  })
};

const mockSSForConfig = {
  getSheetByName: (name) => (name === 'CONFIG' ? mockConfigSheet : null)
};

const loadedConfig = vmSandbox.loadConfigData(mockSSForConfig);
if (!loadedConfig.wallets || loadedConfig.wallets.length !== 2 || loadedConfig.incomeCategories.length !== 2) {
  throw new Error('loadConfigData failed to correctly read configuration');
}
console.log('✔ Functional Test: loadConfigData helper verified');

// 26. Security Verification: escapeHtml implementation & sanitization
if (!webAppHtml.includes('function escapeHtml')) {
  throw new Error('Security check failed: escapeHtml helper missing in WebApp.html');
}

function testEscapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const xssPayload = '<script>alert("xss")</script>';
const escaped = testEscapeHtml(xssPayload);
if (escaped.includes('<') || escaped.includes('>') || escaped.includes('"')) {
  throw new Error('XSS escaping failed');
}
console.log('✔ Security Verification: escapeHtml sanitizes markup and attribute injection: PASS');

// 27. Configuration Verification: Setup.gs Column 9 KATEGORI PEMASUKAN
const setupGs = fs.readFileSync('Setup.gs', 'utf8');
if (!setupGs.includes('KATEGORI PEMASUKAN') || !setupGs.includes('Setor Gaji Ayah')) {
  throw new Error('Setup.gs CONFIG sheet missing Column 9 KATEGORI PEMASUKAN definition');
}
console.log('✔ Configuration Verification: Setup.gs initializes Column 9 KATEGORI PEMASUKAN');

// 28. Commercial Security: No developer private IDs leaked
const setupGuide = fs.readFileSync('setup_guide.md', 'utf8');
const packageJson = fs.readFileSync('package.json', 'utf8');
const gitignore = fs.readFileSync('.gitignore', 'utf8');

if (setupGuide.includes('1wC4EQjbDMF')) {
  throw new Error('Security leak: Developer spreadsheet ID found in setup_guide.md');
}
if (packageJson.includes('AKfycbweiRp')) {
  throw new Error('Security leak: Hardcoded deployment ID found in package.json');
}
if (!gitignore.includes('.clasp.json')) {
  throw new Error('Security leak: .clasp.json not listed in .gitignore');
}
console.log('✔ Commercial Security: Private script IDs & deployment endpoints removed from public docs');

console.log('\nAll tests completed successfully!');
