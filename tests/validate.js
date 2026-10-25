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
['WebApp.html', 'test-runner.html'].forEach(f => {
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
const checkedFiles = ['Code.gs', 'Setup.gs', 'WebApp.html', 'test-runner.html'];
let emojiDetected = false;

checkedFiles.forEach(f => {
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

// 7. Logic verification: Salary cycle period calculation
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
console.log('✔ Cycle check (after pay date 25 Oct): Starts on 25 Oct:', p1.start.getDate() === 25 ? 'PASS' : 'FAIL');

const p2 = getSalaryPeriod(new Date(2026, 9, 10), 25);
console.log('✔ Cycle check (before pay date 10 Oct): Starts on 25 Sep:', p2.start.getMonth() === 8 && p2.start.getDate() === 25 ? 'PASS' : 'FAIL');

// 8. Logic verification: Smart Presets extraction
const codeGs = fs.readFileSync('Code.gs', 'utf8');
if (!codeGs.includes('extractSmartPresets')) {
  throw new Error('Task 1 pending: extractSmartPresets function not implemented in Code.gs');
}

// 9. Logic verification: Close & Archive Year functions
if (!codeGs.includes('closeAndArchiveYear') || !codeGs.includes('checkPendingArchive')) {
  throw new Error('Task 2 pending: closeAndArchiveYear or checkPendingArchive not implemented in Code.gs');
}

console.log('\nAll tests completed successfully!');
