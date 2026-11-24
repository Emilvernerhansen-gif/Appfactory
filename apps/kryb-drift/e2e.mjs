// Browser test of the Kryb i Ly drift artifact with a mocked runtime, Chromium at 360 and 412 px.
// Usage: node apps/kryb-drift/e2e.mjs [--shots DIR] [--old FILE]   (exit 2 = SKIPPED)
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.log('SKIPPED: playwright not available'); process.exit(2); }

const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const dir = new URL('.', import.meta.url);
const mock = readFileSync(new URL('mock-claude.js', dir), 'utf8');
// Same skeleton the Artifact tool wraps around the page at publish time.
const wrap = body => `<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${body}</body></html>`;
const pages = { '/new': wrap(readFileSync(new URL('index.html', dir), 'utf8')) };
if (arg('--old')) pages['/old'] = readFileSync(arg('--old'), 'utf8');
const shots = arg('--shots');
const verbose = process.env.E2E_VERBOSE === '1';
let browser, failures = 0, passed = 0;

async function open(path, opts) {
  const context = await browser.newContext({ deviceScaleFactor: shots ? 2 : 1, ...opts });
  await context.addInitScript(mock);
  await context.route('http://kro.test/**', r => {
    const body = pages[new URL(r.request().url()).pathname];
    return body ? r.fulfill({ contentType: 'text/html; charset=utf-8', body }) : r.fulfill({ status: 404 });
  });
  const page = await context.newPage(); page.setDefaultTimeout(5000);
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://kro.test' + path);
  return { context, page, errors };
}

async function run(width, height) {
  const { context, page, errors } = await open('/new', { viewport: { width, height }, colorScheme: 'dark' });
  const step = async (name, fn) => {
    try { await fn(); passed++; if (verbose) console.log(`ok   ${width}px ${name}`); }
    catch (e) { failures++; console.log(`FAIL ${width}px ${name}: ${e.message.split('\n').slice(0,4).join(' | ')}`); }
  };
  const head = () => page.locator('#head').innerText();
  const cards = () => page.locator('#list .card .sted').allTextContents();
  const pill = k => page.locator(`#pills [data-f="${k}"] b`).innerText();
  const card = t => page.locator('#list .card', { hasText: t });
  const go = async v => { await page.click(`nav.tabs a[data-v="${v}"]`); await page.waitForSelector(`#v-${v}:not([hidden])`); };

  await page.waitForSelector('#list .card');
  await step('loads data and counts open faults', async () => {
    assert.equal(await head(), '4 åbne fejl');
    assert.equal(await page.locator('#badge').innerText(), '4');
    assert.equal(await pill('open'), '4'); assert.equal(await pill('done'), '2');
  });
  await step('oldest open fault first, age flagged', async () => {
    assert.equal((await cards())[0], '#112');
    assert.match(await card('Loftslampe').locator('.age').getAttribute('class'), /old/);
  });
  await step('create fault', async () => {
    await page.click('#bNew');
    await page.fill('#nSted', '#130'); await page.fill('#nFejl', 'Håndklædestang løs'); await page.selectOption('#nKat', 'Inventar');
    await page.click('#nForm button.main');
    await page.waitForFunction(() => document.getElementById('head').innerText.startsWith('5'));
    assert.ok((await cards()).includes('#130'));
  });
  await step('reject blank fault', async () => {
    await page.click('#bNew'); await page.fill('#nSted', '   '); await page.fill('#nFejl', 'x');
    await page.click('#nForm button.main');
    assert.equal(await page.locator('#sheet').evaluate(d => d.open), true);
    await page.click('#sheet [data-close]');
  });
  await step('change status and filter by it', async () => {
    await card('Radiator kold').click();
    await page.click('#sheet .seg [data-v="I gang"]');
    await page.waitForFunction(() => !document.getElementById('sheet').open);
    await page.click('#pills [data-f="I gang"]');
    assert.deepEqual((await cards()).sort(), ['Pool', 'Restaurant']);
    await page.click('#pills [data-f="open"]');
  });
  await step('mark fixed, then undo from toast', async () => {
    await card('Fliser løse').click();
    await page.click('#sheet .seg [data-v="Færdig"]');
    await page.waitForFunction(() => document.getElementById('head').innerText.startsWith('4'));
    assert.match(await page.locator('#toastT').innerText(), /Pool meldt udbedret/);
    await page.click('#toastU');
    await page.waitForFunction(() => document.getElementById('head').innerText.startsWith('5'));
    assert.equal(await page.evaluate(() => window.__store.faults.get('x3').doneAt), null);
  });
  await step('edit fault text and place', async () => {
    await card('Bruseslange').click();
    await page.fill('#eFejl', 'Bruseslange utæt ved kobling'); await page.fill('#eSted', '#115');
    await page.click('#eForm button.main');
    await page.waitForFunction(() => document.body.innerText.includes('ved kobling'));
    assert.ok((await cards()).includes('#115'));
  });
  await step('delete needs confirmation', async () => {
    await card('Håndklædestang').click();
    await page.click('#eDel');
    assert.equal(await page.locator('#eDel').innerText(), 'Bekræft slet');
    await page.click('#eDel');
    await page.waitForFunction(() => !document.body.innerText.includes('Håndklædestang'));
  });
  await step('search and place filter', async () => {
    await page.fill('#fQ', 'LOFT'); assert.deepEqual(await cards(), ['#112']);
    await page.fill('#fQ', 'zzz'); assert.match(await page.locator('#list').innerText(), /Ingen fejl matcher/);
    await page.fill('#fQ', ''); await page.selectOption('#fSted', 'Pool'); assert.deepEqual(await cards(), ['Pool']);
    await page.selectOption('#fSted', '');
  });
  await step('fixed list shows who fixed it', async () => {
    await page.click('#pills [data-f="done"]');
    await page.waitForFunction(() => document.getElementById('list').innerText.includes('Kim'));
    await page.click('#pills [data-f="open"]');
  });
  await step('meter reading with low-value guard', async () => {
    await go('drift');
    assert.equal(await head(), '1 skal klares');
    await page.click('#tList .card'); await page.fill('#mVal', '120,5'); await page.click('#tForm button.main');
    await page.waitForFunction(() => document.getElementById('head').innerText === 'Drift');
    await page.click('#tList .card'); await page.fill('#mVal', '100'); await page.click('#tForm button.main');
    assert.match(await page.locator('#toastT').innerText(), /Lavere end sidst/);
    await page.click('#sheet [data-close]');
    assert.equal(await page.evaluate(() => window.__store.readings.size), 1);
  });
  await step('recurring task create', async () => {
    await page.click('#v-drift details summary');
    await page.fill('#tNavn', 'Rens emhætte'); await page.selectOption('#tType', 'opgave'); await page.click('#fTask button.main');
    await page.waitForFunction(() => document.getElementById('tList').innerText.includes('Rens emhætte'));
  });
  await step('room round creates faults', async () => {
    await page.click('#rList ~ details summary');
    await page.fill('#rAdd', '#201, #202\n#201'); await page.click('#rAddB');
    await page.waitForSelector('#rList [data-room]');
    await page.click('#rList [data-room]');
    assert.equal(await page.locator('[data-rsave]').isDisabled(), true);
    await page.click('[data-r="fejl"][data-i="3"]');
    await page.locator('[data-txt="3"]').fill('Bipper');
    await page.click('[data-allok]'); await page.click('[data-rsave]');
    await page.waitForFunction(() => [...window.__store.faults.values()].some(f => f.fejl === 'Røgalarm: Bipper'));
    assert.equal(await page.evaluate(() => window.__store.rounds.size), 1);
  });
  await step('manual with https link only', async () => {
    await go('manualer');
    await page.click('#v-manualer details summary');
    await page.fill('#mNavn', 'Opvaskemaskine'); await page.fill('#mLink', 'javascript:alert(1)'); await page.click('#fMan button.main');
    assert.equal(await page.evaluate(() => window.__store.manuals.size), 0);
    await page.fill('#mLink', 'https://example.com/manual.pdf'); await page.click('#fMan button.main');
    await page.waitForFunction(() => document.getElementById('mList').innerText.includes('Opvaskemaskine'));
  });
  await step('history chart and figures', async () => {
    await go('historik');
    assert.equal(await page.locator('#hWeek svg rect').count(), 16);
    assert.match(await page.locator('#kpis').innerText(), /åbne nu/);
  });
  await step('markup in data stays text', async () => {
    await go('fejl');
    await page.evaluate(() => { window.__store.faults.set('evil', { sted: '<img src=x onerror=window.__pwn=1>', fejl: '<b>x</b>', kat: 'El', bem: '', status: 'Åben', dato: '2026-01-01' }); window.__emit('faults'); });
    await page.waitForFunction(() => document.getElementById('list').innerText.includes('<b>x</b>'));
    assert.equal(await page.evaluate(() => window.__pwn), undefined);
    assert.equal(await page.locator('#list img, #list b:not(.pill b)').count(), 0);
    await page.evaluate(() => { window.__store.faults.delete('evil'); window.__emit('faults'); });
  });
  for (const v of ['fejl', 'drift', 'manualer', 'historik']) {
    await step(`no horizontal overflow, targets >= 44px (${v})`, async () => {
      await go(v);
      const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        small: [...document.querySelectorAll('button,a,select,input:not([type=checkbox]):not([type=file])')].filter(e => e.offsetParent)
          .map(e => [e.getBoundingClientRect(), e]).filter(([r]) => r.width && r.height < 44).map(([, e]) => e.outerHTML.slice(0, 60)) }));
      assert.ok(r.sw <= r.cw, `scrollWidth ${r.sw} > ${r.cw}`); assert.deepEqual(r.small, []);
    });
  }
  await step('no console errors', async () => assert.deepEqual(errors, []));
  if (shots && width === 412) {
    await go('fejl'); await page.waitForTimeout(3000);
    await page.screenshot({ path: `${shots}/new-412-dark.png` });
    await card('Loftslampe').click(); await page.waitForTimeout(300);
    await page.screenshot({ path: `${shots}/new-412-sheet.png` }); await page.click('#sheet [data-close]');
    await go('historik'); await page.screenshot({ path: `${shots}/new-412-historik.png`, fullPage: true });
  }
  await context.close();
}

try {
  try { browser = await chromium.launch(); }
  catch (e) { console.log('SKIPPED: Chromium could not start: ' + e.message.split('\n')[0]); process.exit(2); }
  await run(360, 800);
  await run(412, 915);
  if (shots) {
    for (const [path, name] of [['/new', 'new-412-light'], ['/old', 'old-412']]) {
      if (!pages[path]) continue;
      const { context, page } = await open(path, { viewport: { width: 412, height: 915 }, colorScheme: name.includes('light') ? 'light' : 'dark' });
      await page.waitForTimeout(600); await page.screenshot({ path: `${shots}/${name}.png` }); await context.close();
    }
  }
  console.log(failures ? `${failures} kryb-drift check(s) failed, ${passed} passed` : `All ${passed} kryb-drift checks passed (360px, 412px)`);
  process.exitCode = failures ? 1 : 0;
} catch (e) { console.error(e); process.exitCode = 1; }
finally { await browser?.close(); }
