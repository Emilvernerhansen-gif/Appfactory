import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs'; import { spawnSync } from 'node:child_process';
const json = f => JSON.parse(readFileSync(f, 'utf8'));
const settings = json('.claude/settings.json');
const setup = readFileSync('scripts/setup.sh', 'utf8');
const version = setup.match(/^RTK_VERSION=(\S+)$/m)[1];

test('CLAUDE.md only imports the shared AGENTS.md', () => assert.equal(readFileSync('CLAUDE.md', 'utf8').trim(), '@AGENTS.md'));
test('permanent instructions stay small', () => assert.ok(readFileSync('AGENTS.md', 'utf8').length < 3000));
test('exactly one project hook per event, no overlap', () => {
  assert.deepEqual(Object.keys(settings.hooks).sort(), ['PreToolUse', 'SessionStart']);
  for (const e of Object.values(settings.hooks)) assert.equal(e.length, 1);
  assert.equal(settings.hooks.PreToolUse[0].matcher, 'Bash');
});
test('telemetry is off for RTK and ccusage', () => { assert.equal(settings.env.RTK_TELEMETRY_DISABLED, '1'); assert.equal(settings.env.DO_NOT_TRACK, '1'); });
test('RTK download is pinned and checksum-verified', () => {
  assert.match(setup, /releases\/download\/v\$RTK_VERSION/);
  assert.equal((setup.match(/SUM=[0-9a-f]{64}/g) || []).length, 4);
  assert.match(readFileSync('docs/TOOLS.md', 'utf8'), new RegExp(`RTK ${version.replace(/\./g, '\\.')}`));
});
test('Bash hook passes through when rtk is missing', () => {
  const r = spawnSync('sh', ['-c', settings.hooks.PreToolUse[0].hooks[0].command], { input: '{"tool_input":{"command":"ls"}}', env: { PATH: '/usr/bin:/bin' } });
  assert.equal(r.status, 0); assert.equal(String(r.stdout), '');
});
test('OpenCode config pins Superpowers and loads the RTK plugin', () => {
  assert.match(json('opencode.json').plugin[0], /^superpowers@git\+https:\/\/github\.com\/obra\/superpowers\.git#v\d/);
  assert.match(readFileSync('.opencode/plugins/rtk.ts', 'utf8'), /rtk rewrite/);
});
test('project skill names do not collide with Superpowers skills', () => {
  const sp = ['brainstorming', 'writing-plans', 'executing-plans', 'test-driven-development', 'systematic-debugging', 'verification-before-completion', 'requesting-code-review'];
  for (const s of readdirSync('.claude/skills')) assert.ok(!sp.includes(s), s);
});
