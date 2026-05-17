import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { deriveDashboardAlerts, getDataHealth } from '../src/lib/signalCockpit.js';

function readText(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function assertNoConflictMarkers() {
  const files = [
    'README.md',
    '.github/workflows/deploy.yml',
    '.github/workflows/data-update.yml',
    'src/App.jsx',
    'src/index.css',
  ];

  for (const file of files) {
    const text = readText(file);
    assert.equal(/^<<<<<<< |^=======\s*$|^>>>>>>> /m.test(text), false, `${file} contains merge-conflict markers`);
  }
}

function assertDataShape() {
  const quotes = readJson('public/data/quotes.json');
  const history = readJson('public/data/history.json');

  assert.ok(quotes.updated, 'quotes.json exposes updated timestamp');
  assert.ok(quotes.quotes && typeof quotes.quotes === 'object', 'quotes.json exposes quotes object');
  assert.ok(Object.keys(quotes.quotes).length >= 10, 'quotes.json contains the dashboard ticker universe');

  for (const [symbol, quote] of Object.entries(quotes.quotes)) {
    assert.ok('price' in quote, `${symbol} exposes price or explicit null/error`);
    if (quote.price !== null) assert.equal(Number.isFinite(quote.price), true, `${symbol} price is finite`);
  }

  assert.ok(Array.isArray(history.dates) && history.dates.length > 100, 'history has enough date rows');
  assert.ok(history.updated, 'history.json exposes updated timestamp');
  for (const key of ['r', 'sp', 'nd']) {
    assert.equal(history[key].length, history.dates.length, `${key} length matches dates`);
    assert.equal(history[key].every(Number.isFinite), true, `${key} contains finite numbers`);
  }
}

function assertCanonicalWorkflow() {
  assert.equal(existsSync(new URL('../requirements-data.txt', import.meta.url)), true, 'data updater has explicit Python requirements');

  const dataWorkflow = readText('.github/workflows/data-update.yml');
  const deployWorkflow = readText('.github/workflows/deploy.yml');
  const requirements = readText('requirements-data.txt').trim().split('\n');
  assert.ok(requirements.every(line => /[<>=~!]/.test(line)), 'data requirements are pinned or bounded');

  assert.match(dataWorkflow, /pip install -r requirements-data\.txt/, 'data workflow installs pinned data requirements');
  assert.match(dataWorkflow, /npm ci/, 'data workflow installs frontend dependencies');
  assert.match(dataWorkflow, /npm run test/, 'data workflow runs tests before deploy');
  assert.match(dataWorkflow, /npm run build/, 'data workflow builds the static site');
  assert.match(dataWorkflow, /actions\/deploy-pages@v4/, 'data workflow deploys GitHub Pages itself');
  assert.match(dataWorkflow, /group: pages-deploy/, 'data workflow shares Pages concurrency group');
  assert.match(deployWorkflow, /group: pages-deploy/, 'source deploy workflow shares Pages concurrency group');

  const testIndex = dataWorkflow.indexOf('Run tests');
  const commitIndex = dataWorkflow.indexOf('Commit refreshed data if changed');
  const buildIndex = dataWorkflow.indexOf('Build static site');
  const deployIndex = dataWorkflow.indexOf('actions/deploy-pages@v4');
  assert.ok(testIndex < commitIndex && commitIndex < buildIndex && buildIndex < deployIndex, 'data workflow tests, commits, then builds/deploys the committed refresh');

  assert.equal(existsSync(new URL('../.github/workflows/update-data.yml', import.meta.url)), false, 'legacy Node data workflow is removed');
}

function assertMobileCss() {
  const css = readText('src/index.css');
  assert.equal(/\.sidebar\s*\{\s*display:\s*none;\s*\}/.test(css), false, 'mobile CSS must not hide the slide-in sidebar');
}

function assertDerivedAlerts() {
  const now = new Date('2026-05-15T12:00:00Z');
  const freshUpdated = '2026-05-15T11:00:00Z';
  const staleUpdated = '2020-01-01T00:00:00Z';
  const freshQuotes = { updated: freshUpdated, quotes: { ON: { price: 10 } } };
  const freshHistory = { updated: freshUpdated, dates: ['2026-01-01'], r: [100], sp: [100], nd: [100] };

  const freshHealth = getDataHealth(freshQuotes, freshHistory, now);
  assert.equal(freshHealth.status, 'fresh');

  const staleHealth = getDataHealth(
    { updated: staleUpdated, quotes: { ON: { price: 10 } } },
    { updated: staleUpdated, dates: ['2020-01-01'], r: [100], sp: [100], nd: [100] },
    now,
  );
  assert.equal(staleHealth.status, 'stale');

  const mixedHealth = getDataHealth(
    freshQuotes,
    { updated: staleUpdated, dates: ['2020-01-01'], r: [100], sp: [100], nd: [100] },
    now,
  );
  assert.equal(mixedHealth.status, 'stale', 'fresh quotes must not mask stale history');

  const invalidHealth = getDataHealth(
    { updated: 'not-a-date', quotes: { ON: { price: 10 } } },
    freshHistory,
    now,
  );
  assert.equal(invalidHealth.status, 'missing', 'invalid timestamps must not be treated as live');

  const alerts = deriveDashboardAlerts({
    dataHealth: staleHealth,
    tickers: {
      ON: { n: 'onsemi', ch: 105, rb: 99, l: 1 },
      '6324.T': { n: 'Harmonic Drive', ch: 67, rb: 95, l: 2 },
    },
  });

  assert.ok(alerts.some(alert => alert.type === 'data-health'), 'stale data emits data-health alert');
  assert.ok(alerts.some(alert => alert.type === 'crowding'), 'near-high rebound emits crowding alert');
  assert.ok(alerts.some(alert => alert.type === 'momentum'), 'large positive change emits momentum alert');
}

assertNoConflictMarkers();
assertDataShape();
assertCanonicalWorkflow();
assertMobileCss();
assertDerivedAlerts();

console.log('ok - dashboard stabilization checks');
