const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdir, readdir, readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { chromium } = require('playwright');

const origin = 'http://127.0.0.1:4173';
const siteOrigin = 'https://tismith.id.au';
const server = spawn('python3', [
  '-m', 'http.server', '4173', '--bind', '127.0.0.1', '--directory', '_site'
], { stdio: 'inherit' });

async function sitePages(directory = '_site') {
  const pages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...await sitePages(path));
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(path, 'utf8');
      // Verification files have no site layout.
      if (!html.includes('class="content container"')) continue;
      let url = '/' + path.slice('_site/'.length);
      url = url.replace(/index\.html$/, '');
      pages.push(url);
    }
  }
  return pages.sort();
}

async function main() {
  let browser;
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        assert.equal((await fetch(origin)).status, 200);
        break;
      } catch (error) {
        if (attempt >= 40) throw error;
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }
    const pages = await sitePages();
    for (const required of ['/', '/about.html', '/archive.html', '/404.html']) {
      assert.ok(pages.includes(required), 'Missing generated page: ' + required);
    }
    assert.ok(pages.some(path => /^\/page\d+\/$/.test(path)), 'Pagination must be generated');
    const responses = new Map();
    await mkdir('browser-test-results', { recursive: true });
    browser = await chromium.launch();

    for (const [name, viewport] of [
      ['desktop', { width: 1280, height: 800 }],
      ['mobile', { width: 390, height: 844 }]
    ]) {
      const context = await browser.newContext({ viewport });
      // External services remain outside the deterministic rendering checks.
      await context.route('**/*', route =>
        new URL(route.request().url()).origin === origin
          ? route.continue()
          : route.abort()
      );
      try {
        for (const path of pages) {
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          page.on('response', response => {
            if (['stylesheet', 'image', 'script'].includes(response.request().resourceType()) &&
                response.status() >= 400) errors.push('Resource failed: ' + response.url());
          });
          try {
            assert.equal((await page.goto(origin + path, { waitUntil: 'load' })).status(), 200);
            await page.locator('.content h1').first().waitFor({ state: 'visible' });
            assert.ok((await page.locator('.content').innerText()).trim().length > 30,
              'Page must contain text: ' + path);
            if (path === '/') {
              assert.match(await page.title(), /Home.*Code/);
              await page.locator('.content .post-title a').first().waitFor({ state: 'visible' });
              assert.ok((await page.locator('.content .post').first().innerText()).length > 100);
            }
            const styles = await page.locator('.content').evaluate(element => ({
              font: getComputedStyle(element).fontFamily,
              loaded: [...document.styleSheets].filter(sheet =>
                sheet.href && new URL(sheet.href).origin === location.origin && sheet.cssRules.length > 0
              ).length
            }));
            assert.ok(styles.loaded >= 3, 'Local stylesheets must load: ' + path);
            assert.match(styles.font, /PT Sans/);
            assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),
              siteOrigin + path, 'Canonical must be absolute HTTPS: ' + path);
            const insecure = await page.locator('script[src], link[rel="stylesheet"][href], img[src]').evaluateAll(elements =>
              elements.map(element => element.getAttribute('src') || element.getAttribute('href'))
                .filter(url => url.startsWith('http://'))
            );
            assert.deepEqual(insecure, [], 'Insecure resource URL on ' + path);

            if (name === 'desktop') {
              const links = await page.locator('a[href], link[rel="alternate"][href], img[src]').evaluateAll(elements =>
                elements.map(element => element.href || element.src)
              );
              for (const href of links) {
                const target = new URL(href);
                if (![new URL(origin).origin, siteOrigin].includes(target.origin)) continue;
                const localUrl = origin + target.pathname + target.search;
                if (!responses.has(localUrl)) {
                  const response = await context.request.get(localUrl);
                  responses.set(localUrl, { status: response.status(), html: await response.text() });
                }
                const result = responses.get(localUrl);
                assert.equal(result.status, 200, 'Broken internal link on ' + path + ': ' + href);
                if (target.hash) {
                  const fragment = decodeURIComponent(target.hash.slice(1));
                  const found = await page.evaluate(({ html, fragment }) => {
                    const document = new DOMParser().parseFromString(html, 'text/html');
                    return !!document.getElementById(fragment) ||
                      [...document.getElementsByName(fragment)].length > 0;
                  }, { html: result.html, fragment });
                  assert.ok(found, 'Missing internal anchor on ' + path + ': ' + href);
                }
              }
            }
            assert.deepEqual(errors, [], 'Rendering errors on ' + path);
            console.log('Renders successfully: ' + name + ' ' + path);
          } finally {
            const label = path === '/' ? 'homepage' : path.replace(/^\//, '').replace(/[^a-zA-Z0-9_-]/g, '-');
            await page.screenshot({ path: 'browser-test-results/' + label + '-' + name + '.png', fullPage: true });
            await page.close();
          }
        }
      } finally {
        await context.close();
      }
    }
    console.log('Checked ' + pages.length + ' pages on desktop/mobile and ' + responses.size + ' internal targets');
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
