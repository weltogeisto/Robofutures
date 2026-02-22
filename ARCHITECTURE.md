# Architecture & Developer Guide — Robofutures

**Last Updated:** 2026-01-15
**Repository:** Robofutures
**Purpose:** Investment sector monitoring dashboard for the robotics industry supercycle

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Technology Stack](#technology-stack)
4. [Development Workflows](#development-workflows)
5. [Code Architecture](#code-architecture)
6. [Key Conventions](#key-conventions)
7. [Deployment Process](#deployment-process)
8. [Working with This Codebase](#working-with-this-codebase)
9. [Data Architecture](#data-architecture)
10. [Important Considerations](#important-considerations)

---

## Project Overview

### Purpose
Robofutures is a comprehensive investment monitoring dashboard focused on tracking and analyzing the robotics industry supercycle. It provides real-time insights into:
- Market performance relative to benchmarks (S&P 500, NASDAQ, SOXX, Industrials)
- Six robotics market segments (humanoid, surgical, warehouse, collaborative, agricultural, industrial)
- Leading indicators (patents, hiring, order books, policy, supply chain, earnings sentiment)
- Supply chain dependencies and component tracking
- Company screening and watchlist management
- Event alerts and signal monitoring

### Target Deployment
- **Production:** GitHub Pages at `https://weltogeisto.github.io/Robofutures/`
- **Environment:** Static site with no backend services
- **Data:** All data is embedded in the React application (synthetic demo data for most metrics)

### Current State
- **Status:** Active development
- **Lines of Code:** ~1,026 lines (primarily in App.jsx)
- **Testing:** No formal test suite (manual testing via dev server)
- **TypeScript:** Not currently used (plain JavaScript/JSX)

---

## Repository Structure

```
Robofutures/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD for GitHub Pages
├── src/
│   ├── App.jsx                  # Main dashboard component (~1,010 lines)
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global Tailwind CSS styles
├── .gitignore
├── README.md
├── ARCHITECTURE.md              # This file
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

### Key Files

| File | Purpose | Notes |
|------|---------|-------|
| `src/App.jsx` | Main dashboard logic and UI | Monolithic component — all state, components, data |
| `src/main.jsx` | React application entry | Renders App into DOM |
| `src/index.css` | Global styles | Tailwind imports + dark theme |
| `vite.config.js` | Build configuration | **CRITICAL:** `base: '/Robofutures/'` for GitHub Pages |
| `.github/workflows/deploy.yml` | CI/CD pipeline | Auto-deploy to GitHub Pages on push to main |

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **React** | 18.3.1 | Component-based UI framework |
| **React-DOM** | 18.3.1 | React rendering for web |
| **Recharts** | 2.15.4 | Composable charting library |
| **Lucide-react** | 0.541.0 | SVG icon library |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **Vite** | 5.4.11 | Build tool and dev server |
| **@vitejs/plugin-react** | 4.3.4 | React JSX support |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |
| **PostCSS** | 8.4.49 | CSS transformation |
| **Autoprefixer** | 10.4.20 | Vendor prefix injection |

**Critical `vite.config.js` setting:**
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/Robofutures/'  // REQUIRED for GitHub Pages project sites
})
```

---

## Development Workflows

```bash
npm install       # Install dependencies
npm run dev       # Dev server at http://localhost:5173/Robofutures/
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

---

## Code Architecture

### App.jsx Structure (~1,010 lines)

```
App.jsx
├── Data Layer (lines 1–200)
│   ├── DATA_SOURCES — metadata/provenance
│   ├── fullMarketPerformanceData
│   ├── segments
│   ├── companies
│   ├── supplyChainComponents
│   ├── leadingIndicators
│   └── initialAlerts
│
├── Utility Components (lines 200–400)
│   ├── InfoButton
│   ├── MomentumBadge
│   ├── TrendIndicator
│   └── CustomTooltip
│
└── Main Component (lines 400–1010)
    ├── useState hooks
    ├── WatchlistSidebar
    └── Tab Content (Overview, Signals, Supply Chain, Companies, Events)
```

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `activeTab` | String | Current tab |
| `selectedCompany` | String | Company filter |
| `selectedSegment` | String | Segment filter |
| `selectedComponent` | String | Supply chain filter |
| `isCollapsed` | Boolean | Sidebar state |
| `selectedSignal` | Object/null | Signal drawer |
| `watchlist` | Set | Watched tickers |
| `alerts` | Array | Alert objects |
| `isCreatingAlert` | Boolean | Alert form visibility |
| `newAlert` | Object | Alert form data |

---

## Key Conventions

- **Indentation:** 2 spaces
- **Quotes:** Single
- **Components:** PascalCase functional components with hooks
- **Constants:** UPPER_SNAKE_CASE
- **Variables:** camelCase

### Tailwind Patterns

```jsx
// Card
<div className="bg-slate-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
// Badge
<span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
// Button
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
```

### Chart Pattern (Recharts)

```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
    <XAxis dataKey="month" stroke="#94a3b8" />
    <YAxis stroke="#94a3b8" />
    <Tooltip content={<CustomTooltip />} />
    <Line type="monotone" dataKey="value" stroke="#8b5cf6" />
  </LineChart>
</ResponsiveContainer>
```

### Color Palette

```javascript
// Momentum badges
high:   'text-green-400 bg-green-500/10'   // > 80
medium: 'text-yellow-400 bg-yellow-500/10' // 60–80
low:    'text-red-400 bg-red-500/10'       // < 60

// Segment colors
humanoid:   '#8b5cf6'  surgical: '#ec4899'
warehouse:  '#3b82f6'  cobot:    '#10b981'
agri:       '#f59e0b'  industrial:'#6366f1'
```

---

## Deployment

**Trigger:** Push to `main`

**Steps:** Checkout → Node 20 setup → `npm ci` → `npm run build` → upload `dist/` → deploy to GitHub Pages

**GitHub Pages settings:** Settings → Pages → Source: **GitHub Actions**

**If repo is renamed:** Update `base` in `vite.config.js` to `/NEW_REPO_NAME/`

---

## Data Architecture

### Cross-Reference Model

```
Segment "Humanoid Robots"
  ├── Companies: ['TSLA', 'Figure AI', 'Boston Dynamics']
  └── Components: ['Harmonic Drives', 'Servo Motors', 'AI Chips']
```

Filtering is bidirectional: selecting a segment highlights its companies and components, and vice versa.

### Data Status

| Dataset | Source | Status |
|---------|--------|--------|
| Company Financials | Yahoo Finance, SEC EDGAR | Real structure, synthetic values |
| Market Indices | Synthetic | Demo only |
| Leading Indicators | Synthetic (USPTO, PitchBook, LinkedIn) | Demo only |
| Supply Chain | Synthetic (industry reports) | Demo only |

### Watchlist Persistence
Not yet implemented — resets on page reload. Future: `localStorage`.

---

## Debugging Tips

1. **Dev server won't start** — check port 5173, delete `node_modules/` and reinstall
2. **Build errors** — run `npm run build` for specific messages, check imports
3. **Deployment broken** — check GitHub Actions tab, verify Pages source = GitHub Actions
4. **Styles missing** — verify Tailwind classes, clear browser cache

---

## External Resources

- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Recharts Docs](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)
