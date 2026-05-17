# Contributing to Robofutures

## Development commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (http://localhost:5173/Robofutures/) |
| `npm run build` | Production build → `dist/` |
| `npm run test` | Run Vitest test suite |
| `npm run lint` | ESLint (0 warnings allowed) |
| `npm run typecheck` | TypeScript checkJs (no emit) |
| `npm run format` | Prettier (write) |

All five checks must pass before merging. CI runs them in order: `lint → typecheck → test → build`.

## Branch naming

- `feat/<short-description>` — new feature
- `fix/<short-description>` — bug fix
- `chore/<short-description>` — tooling / infra
- `docs/<short-description>` — documentation only

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add candlestick drawer
fix: correct rebound calculation for 1D timeframe
chore: upgrade vitest to v5
docs: update CLAUDE.md with new tab structure
```

## Data refresh

To regenerate `public/data/quotes.json` and `public/data/history.json` (including OHLC):

```bash
pip install -r requirements-data.txt
python3 scripts/update_data.py
```

Requires Python 3.10+. Dependencies: `yfinance`, `pandas` (see `requirements-data.txt`).
Data is fetched from Yahoo Finance public endpoints — no API key required.

## Architecture

All UI logic is split across:
- `src/App.jsx` — layout shell, state, data fetching
- `src/components/tabs/` — tab content components
- `src/components/` — shared components (LayerBadge, Sparkline, etc.)
- `src/lib/` — pure business logic (signalCockpit, segmentMomentum, fetchJson)
- `src/types.js` — JSDoc @typedef definitions

See `CLAUDE.md` for full architecture documentation.
