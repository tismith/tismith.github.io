const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdir } = require('node:fs/promises');
const { chromium } = require('playwright');

const origin = 'http://127.0.0.1:4173';
const server = spawn('python3', [
  '-m', 'http.server', '4173', '--bind', '127.0.0.1', '--directory', '_site'
], { stdio: 'inherit' });

async function main() {
  let browser;
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetch(origin);
        assert.equal(response.status, 200, 'Homepage must return HTTP 200');
        break;
      } catch (error) {
        if (attempt >= 40) throw error;
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }

    await mkdir('browser-test-results', { recursive: true });
    browser = await chromium.launch();
    for (const [name, viewport] of [
      ['desktop', { width: 1280, height: 800 }],
      ['mobile', { width: 390, height: 844 }]
    ]) {
      const context = await browser.newContext({ viewport });
      // Keep this smoke test independent of analytics, fonts and Disqus.
      await context.route('**/*', route =>
        new URL(route.request().url()).origin === origin
          ? route.continue()
          : route.abort()
      );
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.request().resourceType() === 'stylesheet' && response.status() >= 400) {
          errors.push('Stylesheet failed: ' + response.url());
        }
      });
      try {
        const response = await page.goto(origin, { waitUntil: 'load' });
        assert.equal(response.status(), 200);
        assert.match(await page.title(), /Home.*Code/);
        await page.locator('.content .post-title a').first().waitFor({ state: 'visible' });
        assert.ok(
          (await page.locator('.content .post').first().innerText()).trim().length > 100,
          'Homepage must display post content'
        );
        const styles = await page.locator('.content').evaluate(element => ({
          font: getComputedStyle(element).fontFamily,
          loaded: [...document.styleSheets].filter(sheet =>
            sheet.href && new URL(sheet.href).origin === location.origin && sheet.cssRules.length > 0
          ).length
        }));
        assert.ok(styles.loaded >= 3, 'All three local stylesheets must load');
        assert.match(styles.font, /PT Sans/, 'Site typography must be applied');
        assert.deepEqual(errors, [], 'Page must render without JavaScript or stylesheet errors');
        console.log('Homepage renders successfully at ' + name + ' viewport');
      } finally {
        await page.screenshot({ path: 'browser-test-results/homepage-' + name + '.png', fullPage: true });
        await context.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
