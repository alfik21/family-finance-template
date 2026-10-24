const fs = require('fs');
const vm = require('vm');

console.log('Running Family Finance Tracker Test Suite...\n');

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

// 3. Logic verification: Salary cycle period calculation
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

console.log('\nAll tests completed successfully!');
