import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const issue = (id, file, severity = 'HIGH') => ({ id, severity, category: 'X', location: { file, start_line: 1 }, code_snippet: 'x' });
const report = issues => {
  const f = join(mkdtempSync(join(tmpdir(), 'scan-')), 'r.json');
  writeFileSync(f, JSON.stringify({ issues, risk_assessment: { recommendation: 'DO_NOT_INSTALL', score: 80 }, execution_successful: true }));
  return f;
};
const run = (file, ...args) => {
  try { return { code: 0, out: execFileSync('python3', ['-I', 'scripts/skillspector-summary.py', file, 'target', ...args], { encoding: 'utf8' }) }; }
  catch (e) { return { code: e.status, out: e.stdout }; }
};

test('scan filter keeps HIGH findings in files an agent executes or obeys', () => {
  const r = run(report([issue('P1', 'SKILL.md'), issue('SC2', 'scripts/x.sh'), issue('TM1', 'hooks/hooks.json'), issue('P6', 'commands/setup.md')]));
  assert.equal(r.code, 1);
  for (const f of ['SKILL.md', 'scripts/x.sh', 'hooks/hooks.json', 'commands/setup.md']) assert.match(r.out, new RegExp(f.replace('.', '\\.')));
});

test('scan filter hides docs, data and coverage notes but counts them', () => {
  const r = run(report([issue('PE3', 'data/products.csv'), issue('AS1', 'README.md'), issue('AR2', 'reference/animate.md'),
    issue('MP3', 'guides/css/a.md'), issue('PE3', '.gitignore'), issue('AE1', 'SKILL.md'), issue('X1', 'docs/a.md'), issue('X2', 'CHANGELOG.md')]));
  assert.equal(r.code, 0);
  assert.match(r.out, /8 HIGH in docs\/data hidden/);
  assert.doesNotMatch(r.out, /^- /m);
});

test('scan filter --all shows every HIGH finding', () => {
  const r = run(report([issue('PE3', 'data/products.csv'), issue('P1', 'SKILL.md')]), '--all');
  assert.equal(r.code, 1);
  assert.match(r.out, /products\.csv/);
  assert.match(r.out, /SKILL\.md/);
});

test('scan filter fails when the scan did not complete', () => {
  const f = join(mkdtempSync(join(tmpdir(), 'scan-')), 'r.json');
  writeFileSync(f, JSON.stringify({ issues: [], risk_assessment: {}, execution_successful: false }));
  assert.equal(run(f).code, 1);
});
