import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveDashboardAlerts, getDataHealth } from '../src/lib/signalCockpit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function readText(path) {
  return readFileSync(resolve(ROOT, path), 'utf8');
}

function readJson(path) {
  return JSON.parse(readText(path));
}

describe('conflict markers', () => {
  it('no conflict markers in key files', () => {
    const files = [
      'README.md',
      '.github/workflows/deploy.yml',
      '.github/workflows/data-update.yml',
      'src/App.jsx',
      'src/index.css',
    ];
    for (const file of files) {
      const text = readText(file);
      expect(/^<<<<<<< |^=======\s*$|^>>>>>>> /m.test(text), `${file} contains merge-conflict markers`).toBe(false);
    }
  });
});

describe('data shape', () => {
  it('quotes.json has expected structure', () => {
    const quotes = readJson('public/data/quotes.json');
    expect(quotes.updated).toBeTruthy();
    expect(quotes.quotes && typeof quotes.quotes === 'object').toBe(true);
    expect(Object.keys(quotes.quotes).length).toBeGreaterThanOrEqual(10);
    for (const [symbol, quote] of Object.entries(quotes.quotes)) {
      expect('price' in quote, `${symbol} exposes price or explicit null/error`).toBe(true);
      if (quote.price !== null) {
        expect(Number.isFinite(quote.price), `${symbol} price is finite`).toBe(true);
      }
    }
  });

  it('history.json has expected structure', () => {
    const history = readJson('public/data/history.json');
    expect(Array.isArray(history.dates) && history.dates.length > 100).toBe(true);
    expect(history.updated).toBeTruthy();
    for (const key of ['r', 'sp', 'nd']) {
      expect(history[key].length).toBe(history.dates.length);
      expect(history[key].every(Number.isFinite)).toBe(true);
    }
  });
});

describe('canonical workflow', () => {
  it('data requirements file exists and dependencies are pinned', () => {
    expect(existsSync(resolve(ROOT, 'requirements-data.txt')), 'requirements-data.txt not found').toBe(true);
    const requirements = readText('requirements-data.txt').trim().split('\n');
    expect(requirements.every((line) => /[<>=~!]/.test(line))).toBe(true);
  });

  it('data workflow has correct steps in order', () => {
    const dataWorkflow = readText('.github/workflows/data-update.yml');
    expect(dataWorkflow).toMatch(/pip install -r requirements-data\.txt/);
    expect(dataWorkflow).toMatch(/npm ci/);
    expect(dataWorkflow).toMatch(/npm run test/);
    expect(dataWorkflow).toMatch(/npm run build/);
    expect(dataWorkflow).toMatch(/actions\/deploy-pages@v4/);
    expect(dataWorkflow).toMatch(/group: pages-deploy/);

    const testIndex = dataWorkflow.indexOf('Run tests');
    const commitIndex = dataWorkflow.indexOf('Commit refreshed data if changed');
    const buildIndex = dataWorkflow.indexOf('Build static site');
    const deployIndex = dataWorkflow.indexOf('actions/deploy-pages@v4');
    expect(testIndex).toBeLessThan(commitIndex);
    expect(commitIndex).toBeLessThan(buildIndex);
    expect(buildIndex).toBeLessThan(deployIndex);
  });

  it('deploy workflow shares pages concurrency group', () => {
    const deployWorkflow = readText('.github/workflows/deploy.yml');
    expect(deployWorkflow).toMatch(/group: pages-deploy/);
  });

  it('legacy node data workflow is removed', () => {
    expect(existsSync(resolve(ROOT, '.github/workflows/update-data.yml')), 'legacy workflow should not exist').toBe(
      false,
    );
  });
});

describe('mobile CSS', () => {
  it('sidebar is not hidden by CSS', () => {
    const css = readText('src/index.css');
    expect(/\.sidebar\s*\{\s*display:\s*none;\s*\}/.test(css)).toBe(false);
  });
});

describe('deriveDashboardAlerts', () => {
  const now = new Date('2026-05-15T12:00:00Z');
  const freshUpdated = '2026-05-15T11:00:00Z';
  const staleUpdated = '2020-01-01T00:00:00Z';
  const freshQuotes = { updated: freshUpdated, quotes: { ON: { price: 10 } } };
  const freshHistory = { updated: freshUpdated, dates: ['2026-01-01'], r: [100], sp: [100], nd: [100] };

  it('fresh data has fresh status', () => {
    const freshHealth = getDataHealth(freshQuotes, freshHistory, now);
    expect(freshHealth.status).toBe('fresh');
  });

  it('stale data has stale status', () => {
    const staleHealth = getDataHealth(
      { updated: staleUpdated, quotes: { ON: { price: 10 } } },
      { updated: staleUpdated, dates: ['2020-01-01'], r: [100], sp: [100], nd: [100] },
      now,
    );
    expect(staleHealth.status).toBe('stale');
  });

  it('fresh quotes do not mask stale history', () => {
    const mixedHealth = getDataHealth(
      freshQuotes,
      { updated: staleUpdated, dates: ['2020-01-01'], r: [100], sp: [100], nd: [100] },
      now,
    );
    expect(mixedHealth.status).toBe('stale');
  });

  it('invalid timestamps treated as missing', () => {
    const invalidHealth = getDataHealth(
      { updated: 'not-a-date', quotes: { ON: { price: 10 } } },
      freshHistory,
      now,
    );
    expect(invalidHealth.status).toBe('missing');
  });

  it('stale data emits correct alert types', () => {
    const staleHealth = getDataHealth(
      { updated: staleUpdated, quotes: { ON: { price: 10 } } },
      { updated: staleUpdated, dates: ['2020-01-01'], r: [100], sp: [100], nd: [100] },
      now,
    );
    const alerts = deriveDashboardAlerts({
      dataHealth: staleHealth,
      tickers: {
        ON: { n: 'onsemi', ch: 105, rb: 99, l: 1 },
        '6324.T': { n: 'Harmonic Drive', ch: 67, rb: 95, l: 2 },
      },
    });
    expect(alerts.some((alert) => alert.type === 'data-health')).toBe(true);
    expect(alerts.some((alert) => alert.type === 'crowding')).toBe(true);
    expect(alerts.some((alert) => alert.type === 'momentum')).toBe(true);
  });
});
