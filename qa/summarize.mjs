// Turns Playwright JSON results into a pass/fail/not-run matrix (markdown) for the QA report.
// Usage: node qa/summarize.mjs qa/artifacts/results-chromium.json > out.md
import fs from 'node:fs';
const res = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const rows = new Map(); const projects = new Set(); const notes = [];
const walk = (s, file) => {
  (s.specs || []).forEach((sp) => sp.tests.forEach((t) => {
    projects.add(t.projectName);
    const r = t.results.at(-1) || { status: 'skipped' };
    const key = `${file} › ${sp.title}`;
    if (!rows.has(key)) rows.set(key, {});
    const st = r.status === 'passed' ? (t.annotations?.some((a) => a.type === 'skip') ? 'skip' : 'pass') : r.status === 'skipped' ? 'skip' : 'FAIL';
    rows.get(key)[t.projectName] = st;
    if (st === 'FAIL') notes.push(`- **${t.projectName}** · ${sp.title}: ${(r.errors || []).map((e) => (e.message || '').replace(/\x1b\[[0-9;]*m/g, '').split('\n')[0]).join(' / ').slice(0, 220)}`);
  }));
  (s.suites || []).forEach((x) => walk(x, file || x.file));
};
res.suites.forEach((s) => walk(s, s.file));
const P = [...projects].sort();
const short = (p) => p.replace('chromium-', 'cr:').replace('webkit-', 'wk:');
console.log(`| Check | ${P.map(short).join(' | ')} |`);
console.log(`|---|${P.map(() => '---').join('|')}|`);
for (const [k, v] of rows) console.log(`| ${k.replace('.spec.js', '')} | ${P.map((p) => v[p] || '—').join(' | ')} |`);
const all = [...rows.values()].flatMap((v) => Object.values(v));
console.log(`\nTotals: pass ${all.filter((x) => x === 'pass').length}, FAIL ${all.filter((x) => x === 'FAIL').length}, skipped ${all.filter((x) => x === 'skip').length}\n`);
console.log(notes.join('\n'));
