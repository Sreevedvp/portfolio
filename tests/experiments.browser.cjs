const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => { errors.push(error.message); console.error('Page error:', error.message); });
    const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:3015';
    await page.goto(`${base}/#experiments`);
    const section = page.locator('#experiments');
    await section.getByRole('heading', { name: 'Small pieces. Open possibilities.' }).waitFor();
    await section.scrollIntoViewIfNeeded();
    const navigation = page.getByRole('navigation', { name: 'Fast UI documentation' });
    const frame = page.frameLocator('iframe[title="Fast UI interactive Rust component playground"]');
    await frame.getByRole('button', { name: 'Create project' }).click();
    await frame.getByRole('status').filter({ hasText: 'Primary action clicked.' }).waitFor();
    await frame.getByRole('button', { name: 'Fields', exact: true }).click();
    await frame.getByRole('button', { name: 'Save project' }).click();
    await frame.getByRole('alert').waitFor();
    await frame.getByLabel('Email', { exact: true }).fill('demo@example.com');
    await frame.getByRole('alert').waitFor({ state: 'hidden' });
    await frame.getByRole('button', { name: 'Table', exact: true }).click();
    await frame.getByRole('table', { name: 'Project workspace' }).waitFor();
    await frame.getByRole('button', { name: 'Dialog', exact: true }).click();
    await frame.getByRole('button', { name: 'Open dialog' }).click();
    await frame.getByRole('dialog').waitFor();
    await frame.getByRole('button', { name: 'Keep exploring' }).click();
    await frame.getByRole('dialog').waitFor({ state: 'hidden' });
    await frame.getByRole('button', { name: 'Buttons', exact: true }).click();

    const out = process.env.SCREENSHOT_DIR || '/private/tmp/fast-ui-extraction/screenshots';
    fs.mkdirSync(out, { recursive: true });
    await section.screenshot({ path: path.join(out, 'experiments-desktop.png') });
    await page.evaluate(() => document.getElementById('experiments').scrollIntoView());
    await page.screenshot({ path: path.join(out, 'portfolio-experiments-desktop.png') });
    await navigation.getByRole('button', { name: /Installation/ }).click();
    await section.getByRole('button', { name: 'Copy Install components', exact: true }).click();
    assert((await page.evaluate(() => navigator.clipboard.readText())).includes('dx components add'));
    await section.getByRole('button', { name: 'Cargo dependency', exact: true }).click();
    await section.getByRole('button', { name: 'Copy Cargo.toml', exact: true }).click();
    assert((await page.evaluate(() => navigator.clipboard.readText())).includes('../dioxus-complib'));
    await section.screenshot({ path: path.join(out, 'experiments-installation.png') });

    const zip = await context.request.get(`${base}/experiments/fast-ui/fast-ui-0.1.0.zip`);
    assert(zip.ok());
    assert.equal((await zip.body()).subarray(0, 2).toString(), 'PK');
    await navigation.getByRole('button', { name: /Components/ }).click();
    await section.getByRole('button', { name: 'Dialog', exact: true }).click();
    await section.getByRole('button', { name: 'Copy Dialog example' }).waitFor();
    await navigation.getByRole('button', { name: /Theming/ }).click();
    await section.getByRole('button', { name: 'Copy Your theme.css' }).waitFor();
    await navigation.getByRole('button', { name: /Status/ }).click();
    assert((await section.innerText()).includes('Dioxus 0.7.10'));
    assert((await section.innerText()).includes('experimental') || (await section.innerText()).includes('Experimental'));

    await navigation.getByRole('button', { name: /Overview/ }).click();
    await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
    await section.screenshot({ path: path.join(out, 'experiments-dark.png') });
    await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await section.scrollIntoViewIfNeeded();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Portfolio overflow on mobile');
    await frame.getByRole('button', { name: 'Create project' }).waitFor();
    const child = page.frames().find(f => f.url().includes('/playground/'));
    assert(await child.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Playground overflow on mobile');
    await section.screenshot({ path: path.join(out, 'experiments-mobile.png') });
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: /Experiments/ }).click();
    assert.equal(await page.getByRole('button', { name: 'Toggle menu' }).getAttribute('aria-expanded'), 'false');
    assert.deepEqual(errors, [], 'Browser runtime errors');
    console.log('PASS: dedicated navigation, documentation pages, clipboard examples, source download, actual Rust playground interactions, light/dark themes, mobile layout and menu.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
