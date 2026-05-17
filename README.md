# 🤖 Robofutures — Robotics Supercycle Monitor

**Live dashboard:** https://weltogeisto.github.io/Robofutures/

Robofutures is a static React dashboard for tracking the Robotics / Physical AI investment cycle: market momentum, upstream bottlenecks, value-chain layers, ticker watchlists, and alert-style research prompts.

## What it tracks

- Robotics and Physical AI ticker momentum
- Upstream / downstream value-chain layers
- Cycle phase and bottleneck pressure
- Watchlist performance versus benchmarks
- Data freshness and dashboard health
- Action-oriented signals for follow-up research

## Tech stack

- React 18 + Vite
- Recharts for charting
- Lucide icons
- Custom Linear-inspired CSS
- GitHub Pages for hosting
- GitHub Actions + Python/yfinance for data refresh

## Local development

```bash
npm install
npm run dev
```

The Vite dev server uses the configured base path from `vite.config.js`.

## Quality checks

```bash
npm run test
npm run build
```

`npm run test` runs the signal-cockpit checks plus repository/data-shape checks.

## Data pipeline

The canonical live data path is:

```text
scripts/update_data.py → public/data/quotes.json + public/data/history.json → Vite build → GitHub Pages
```

The scheduled workflow `.github/workflows/data-update.yml` refreshes market data, runs tests, builds the site, deploys the current artifact to GitHub Pages, and then commits changed `public/data/*.json` files back to `main` for auditability.

Data source: Yahoo Finance via `yfinance` (free/no API key). Treat it as best-effort market data; the UI surfaces stale or partial data states instead of silently pretending everything is live.

## Deployment

GitHub Pages must be configured as:

- **Settings → Pages → Source:** GitHub Actions

The regular deploy workflow `.github/workflows/deploy.yml` still deploys on source pushes to `main`. The market-data workflow also deploys directly after refreshing data so scheduled data commits do not rely on a second push-triggered workflow.

## Important: Vite base path

For GitHub Pages project sites, Vite needs the repository path:

```js
base: '/Robofutures/'
```

If the repository is renamed, update `vite.config.js` and verify the live dashboard path.
