// Browser end-to-end test of the starter app in Chromium at 360x800 and 412x915.
// Uses a locally available Playwright (no npm dependency). Exits 2 with "SKIPPED"
// when Playwright/Chromium is missing, so a skip is never reported as a pass.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { writeFile, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.log('SKIPPED: playwright not available (npm i -D playwright to enable)'); process.exit(2); }

const port = 4300 + Math.floor(Math.random() * 500);
const base = `http://localhost:${port}/`;
const server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
const tmp = await mkdtemp(join(tmpdir(), 'appfactory-e2e-'));
let browser, failures = 0;

async function waitForServer() {
  for (let i = 0; i < 50; i++) { try { if ((await fetch(base)).ok) return; } catch {} await new Promise(r => setTimeout(r, 100)); }
  throw Error('server did not start');
}

async function run(width, height) {
  const context = await browser.newContext({ viewport: { width, height }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  const step = async (name, fn) => {
    try { await fn(); console.log(`ok   ${width}px ${name}`); }
    catch (e) { failures++; console.log(`FAIL ${width}px ${name}: ${e.message}`); }
  };
  const titles = () => page.locator('#items li span').allTextContents();

  await page.goto(base);
  await step('empty state', async () => assert.match(await page.locator('#items').innerText(), /Ingen opgaver/));
  await step('create', async () => {
    await page.fill('#title', 'Pumpe'); await page.click('#submit');
    await page.fill('#title', 'Ventil'); await page.press('#title', 'Enter');
    assert.deepEqual(await titles(), ['Pumpe', 'Ventil']);
    assert.equal(await page.textContent('#open'), '2');
  });
  await step('reject blank', async () => {
    await page.fill('#title', '   '); await page.click('#submit');
    assert.match(await page.textContent('#status'), /1–200 tegn/);
    assert.equal((await titles()).length, 2);
  });
  await step('edit', async () => {
    await page.locator('li', { hasText: 'Pumpe' }).getByRole('button', { name: 'Ret' }).click();
    await page.fill('#title', 'Pumpe 2'); await page.click('#submit');
    assert.deepEqual(await titles(), ['Pumpe 2', 'Ventil']);
  });
  await step('complete', async () => {
    await page.locator('li', { hasText: 'Ventil' }).getByRole('button', { name: 'Færdig' }).click();
    assert.equal(await page.textContent('#done'), '1');
  });
  await step('search', async () => {
    await page.fill('#search', 'VENTIL'); assert.deepEqual(await titles(), ['Ventil']);
    await page.fill('#search', '');
  });
  await step('reload persistence', async () => {
    await page.reload(); assert.deepEqual(await titles(), ['Pumpe 2', 'Ventil']);
    assert.equal(await page.textContent('#done'), '1');
  });
  let backup;
  await step('export', async () => {
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#export')]);
    backup = join(tmp, `backup-${width}.json`); await dl.saveAs(backup);
    const data = JSON.parse(await readFile(backup, 'utf8'));
    assert.equal(data.version, 1); assert.equal(data.items.length, 2);
  });
  await step('delete', async () => {
    await page.locator('li', { hasText: 'Pumpe 2' }).getByRole('button', { name: 'Slet' }).click();
    assert.deepEqual(await titles(), ['Ventil']);
  });
  await step('import restores backup', async () => {
    await page.setInputFiles('#file', backup);
    await page.waitForFunction(() => document.getElementById('status').textContent.includes('importeret'));
    assert.deepEqual(await titles(), ['Pumpe 2', 'Ventil']);
  });
  await step('import rejects malformed file', async () => {
    const bad = join(tmp, 'bad.json'); await writeFile(bad, '{"version":1,"items":[{"id":1}]}');
    await page.setInputFiles('#file', bad);
    await page.waitForFunction(() => document.getElementById('status').textContent.includes('afvist'));
    assert.equal((await titles()).length, 2);
  });
  await step('no horizontal overflow', async () => {
    await page.fill('#title', 'x'.repeat(200)); await page.click('#submit');
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    assert.ok(sw <= cw, `scrollWidth ${sw} > ${cw}`);
  });
  await step('touch targets >= 44px', async () => {
    const small = await page.evaluate(() => [...document.querySelectorAll('button:not([hidden]),input:not([type=file])')]
      .map(e => e.getBoundingClientRect()).filter(r => r.width && (r.height < 44 || r.width < 44)).length);
    assert.equal(small, 0);
  });
  await step('offline reload', async () => {
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); // let the active worker control the page
    await context.setOffline(true);
    await page.reload();
    assert.equal(await page.textContent('h1'), 'Mit arbejdsbord');
    assert.equal((await titles()).length, 3);
    await context.setOffline(false);
  });
  await step('no console errors', async () => assert.deepEqual(errors.filter(e => !/ERR_INTERNET_DISCONNECTED/.test(e)), []));
  await context.close();
}

try {
  await waitForServer();
  try { browser = await chromium.launch(); }
  catch (e) { console.log('SKIPPED: Chromium could not start: ' + e.message.split('\n')[0]); process.exitCode = 2; }
  if (browser) {
    await run(360, 800);
    await run(412, 915);
    console.log(failures ? `${failures} e2e check(s) failed` : 'All e2e checks passed');
    process.exitCode = failures ? 1 : 0;
  }
} catch (e) { console.error(e); process.exitCode = 1; }
finally { await browser?.close(); server.kill(); await rm(tmp, { recursive: true, force: true }); }
