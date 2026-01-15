# CLAUDE.md - AI Assistant Guide for Robofutures Repository

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
/home/user/Robofutures/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD for GitHub Pages
├── src/
│   ├── App.jsx                  # Main dashboard component (1,010 lines)
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global Tailwind CSS styles
├── .gitignore                   # Ignore rules (node_modules, dist, env files)
├── README.md                    # Basic setup and deployment instructions
├── CLAUDE.md                    # This file - AI assistant guide
├── index.html                   # HTML entry point
├── package.json                 # NPM dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── vite.config.js               # Vite build configuration (base: '/Robofutures/')
```

### Key Files

| File | Purpose | Lines | Notes |
|------|---------|-------|-------|
| `src/App.jsx` | Main dashboard logic and UI | 1,010 | Monolithic component - all state, components, data |
| `src/main.jsx` | React application entry | 11 | Renders App into DOM |
| `src/index.css` | Global styles | 8 | Tailwind imports + dark theme |
| `vite.config.js` | Build configuration | 12 | **CRITICAL:** `base: '/Robofutures/'` for GitHub Pages |
| `.github/workflows/deploy.yml` | CI/CD pipeline | 31 | Auto-deploy to GitHub Pages on push to main |

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **React** | 18.3.1 | Component-based UI framework |
| **React-DOM** | 18.3.1 | React rendering for web |
| **Recharts** | 2.15.4 | Composable charting library (LineChart, BarChart, etc.) |
| **Lucide-react** | 0.541.0 | Beautiful SVG icon library |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **Vite** | 5.4.11 | Build tool and dev server (very fast HMR) |
| **@vitejs/plugin-react** | 4.3.4 | React JSX support for Vite |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **PostCSS** | 8.4.49 | CSS transformation |
| **Autoprefixer** | 10.4.20 | Vendor prefix injection |

### Build System: Vite

**Why Vite:**
- Lightning-fast dev server with Hot Module Replacement (HMR)
- Optimized production builds using Rollup
- Native ES modules support
- Modern, well-maintained tooling

**Configuration (`vite.config.js`):**
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/Robofutures/'  // CRITICAL for GitHub Pages project sites
})
```

### Styling: Tailwind CSS

**Configuration (`tailwind.config.js`):**
- Content sources: `./index.html`, `./src/**/*.{js,jsx}`
- Theme: Extended default (no custom overrides)
- Dark theme applied globally in `index.css`

**Design System:**
- Background: `slate-950` (dark)
- Text: `slate-100` (light on dark)
- Utility-first approach (no separate CSS modules)

---

## Development Workflows

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd Robofutures

# Install dependencies
npm install

# Start development server
npm run dev
# Server runs at http://localhost:5173/Robofutures/
```

### Available Scripts

| Command | Purpose | Notes |
|---------|---------|-------|
| `npm run dev` | Start Vite dev server | Hot reload enabled, runs on port 5173 |
| `npm run build` | Build for production | Output to `dist/` directory |
| `npm run preview` | Preview production build locally | Serves built `dist/` folder |

### Development Workflow

1. **Make changes** in `src/` files
2. **View changes** automatically in browser (HMR)
3. **Test manually** via UI interaction
4. **Build locally** with `npm run build` to verify no build errors
5. **Commit** changes following git best practices
6. **Push to main** triggers automatic deployment

### Git Workflow

**Current Branch:**
- Development happens on feature branches (e.g., `claude/claude-md-mkfpywoppmvoro3q-4Kp4T`)
- Main branch (`main`) is deployment source for GitHub Pages

**Important Git Rules:**
- ✅ Develop on assigned feature branch
- ✅ Commit with clear, descriptive messages
- ✅ Push to feature branch for review
- ✅ Merge to `main` only after approval
- ❌ Never force push to `main`
- ❌ Never commit `node_modules/` or `dist/` (in `.gitignore`)

---

## Code Architecture

### Application Structure

The application uses a **monolithic component architecture** where all logic resides in `src/App.jsx`:

```
App.jsx (1,010 lines)
├── Data Layer (lines 1-200)
│   ├── DATA_SOURCES - Metadata about data provenance
│   ├── fullMarketPerformanceData - Market indices
│   ├── segments - Robotics sector segments
│   ├── companies - Company financial data
│   ├── supplyChainComponents - Component tracking
│   ├── leadingIndicators - Signal factors
│   └── initialAlerts - Alert/event data
│
├── Utility Components (lines 200-400)
│   ├── InfoButton - Data source tooltips
│   ├── MomentumBadge - Color-coded momentum indicators
│   ├── TrendIndicator - Up/down/neutral arrows
│   └── CustomTooltip - Chart hover information
│
├── Main Component (lines 400-1010)
│   ├── State Management (useState hooks)
│   ├── WatchlistSidebar - Left navigation with alerts
│   ├── Tab Navigation (Overview, Signals, Supply Chain, Companies, Events)
│   └── Tab Content Rendering
```

### Component Hierarchy

```
<App>
  ├── <WatchlistSidebar>
  │   ├── Watchlist section
  │   └── Alerts section
  │
  └── Main Content
      ├── Tab Navigation
      └── Tab Content
          ├── Overview Tab
          │   ├── Market performance charts
          │   ├── Segment cards
          │   └── Leading indicators summary
          │
          ├── Signals Tab
          │   ├── Leading indicator cards
          │   └── SignalDrawer (factor decomposition)
          │
          ├── Supply Chain Tab
          │   └── Component dependencies table
          │
          ├── Companies Tab
          │   └── Company screener with watchlist
          │
          └── Events & Alerts Tab
              ├── Alert list
              └── Alert creation form
```

### State Management

**No external state library** (Redux, Zustand, etc.) - uses React's built-in `useState`:

| State Variable | Purpose | Type |
|----------------|---------|------|
| `activeTab` | Current selected tab | String |
| `selectedCompany` | Currently selected company filter | String |
| `selectedSegment` | Currently selected segment filter | String |
| `selectedComponent` | Currently selected supply chain component | String |
| `isCollapsed` | Sidebar collapsed state | Boolean |
| `selectedSignal` | Signal for drawer decomposition | Object/null |
| `watchlist` | Set of watched company tickers | Set |
| `alerts` | Array of alert objects | Array |
| `isCreatingAlert` | Alert creation form visibility | Boolean |
| `newAlert` | New alert form data | Object |

**Key Pattern:** State is lifted to `App` component and passed down as props. No prop drilling issues yet due to single-file architecture.

---

## Key Conventions

### Code Style

1. **Indentation:** 2 spaces (not tabs)
2. **Quotes:** Single quotes for strings (`'example'`)
3. **Semicolons:** Present at end of statements
4. **Component Style:** Functional components with hooks
5. **Naming:**
   - Components: PascalCase (`InfoButton`, `TrendIndicator`)
   - Variables: camelCase (`activeTab`, `selectedCompany`)
   - Constants: UPPER_SNAKE_CASE (`DATA_SOURCES`)

### React Patterns

**Preferred:**
```jsx
// Functional components with hooks
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  return <div>Content</div>;
};
```

**Avoid:**
- Class components (not used in this codebase)
- `useEffect` for simple state derivations (prefer `useMemo`, `useCallback`)
- Prop drilling beyond 2 levels (consider refactoring if needed)

### Data Patterns

**All data includes provenance metadata:**
```javascript
const DATA_SOURCES = {
  companyFinancials: {
    source: 'Yahoo Finance, SEC EDGAR filings',
    asOf: '2025-12-18',
    definition: 'Market cap: shares outstanding × price',
    revisionPolicy: 'Updated daily; historical not restated',
  },
  // ...
};
```

**InfoButton pattern for data transparency:**
```jsx
<InfoButton metadata={DATA_SOURCES.companyFinancials} />
```

### Tailwind CSS Patterns

**Common utility combinations:**
```jsx
// Card container
<div className="bg-slate-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">

// Badge
<span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">

// Button
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
```

### Chart Patterns (Recharts)

**Standard chart setup:**
```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
    <XAxis dataKey="month" stroke="#94a3b8" />
    <YAxis stroke="#94a3b8" />
    <Tooltip content={<CustomTooltip />} />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#8b5cf6" />
  </LineChart>
</ResponsiveContainer>
```

---

## Deployment Process

### Automatic Deployment (GitHub Actions)

**Trigger:** Push to `main` branch

**Workflow:** `.github/workflows/deploy.yml`

**Steps:**
1. Checkout code (`actions/checkout@v4`)
2. Setup Node.js 20 with npm cache (`actions/setup-node@v4`)
3. Install dependencies (`npm ci`)
4. Build project (`npm run build`)
5. Configure GitHub Pages (`actions/configure-pages@v4`)
6. Upload artifacts from `./dist/` (`actions/upload-pages-artifact@v3`)
7. Deploy to GitHub Pages (`actions/deploy-pages@v4`)

**Permissions Required:**
- `contents: read`
- `pages: write`
- `id-token: write`

**Environment:** `github-pages`

### Manual Deployment Verification

Before pushing to `main`, verify build succeeds:

```bash
# Build locally
npm run build

# Preview built version
npm run preview

# Check for build errors
# Build output should be in dist/ directory
ls -la dist/
```

### Critical Configuration

**GitHub Pages Settings:**
- Go to **Settings → Pages**
- **Source:** GitHub Actions (not branch)
- **Base path in vite.config.js:** MUST be `/Robofutures/`

**If repository is renamed:**
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/NEW_REPO_NAME/'  // Update this!
})
```

---

## Working with This Codebase

### When Adding Features

1. **Read existing code first** - Understand patterns before modifying
2. **Locate the relevant section** in `App.jsx`:
   - Data: Lines 1-200
   - Components: Lines 200-400
   - Main app logic: Lines 400-1010
3. **Follow existing patterns** - Match naming, structure, styling
4. **Update data sources** - If adding data, include provenance metadata
5. **Test manually** - Run `npm run dev` and verify UI behavior
6. **Build locally** - Run `npm run build` to catch build errors

### When Fixing Bugs

1. **Identify the affected component/section**
2. **Check state dependencies** - What state affects this behavior?
3. **Verify data flow** - Is data being passed correctly?
4. **Test edge cases** - Empty states, null values, array boundaries
5. **Avoid over-engineering** - Fix the specific issue, don't refactor unnecessarily

### When Refactoring

**Current monolithic structure works for ~1,000 lines. Consider refactoring when:**
- File exceeds 1,500 lines
- Components are reused across multiple sections
- State management becomes complex

**Refactoring strategy (if needed):**
```
src/
├── components/
│   ├── InfoButton.jsx
│   ├── MomentumBadge.jsx
│   ├── TrendIndicator.jsx
│   └── WatchlistSidebar.jsx
├── data/
│   ├── dataSources.js
│   ├── marketData.js
│   └── companies.js
├── tabs/
│   ├── OverviewTab.jsx
│   ├── SignalsTab.jsx
│   └── CompaniesTab.jsx
└── App.jsx (orchestration only)
```

**But:** Only refactor if there's a clear benefit. Current structure is maintainable.

### Common Tasks

#### Adding a New Company

**Location:** `src/App.jsx`, around line 66

```javascript
const companies = [
  // Add new entry
  {
    ticker: 'ABBV',
    name: 'AbbVie Robotics',
    marketCap: 150,
    revenue: 12.5,
    revenueGrowth: 28,
    exposure: 65,
    momentum: 82,
    segments: ['surgical'],
    tier: 'Satellite'
  },
  // ...
];
```

#### Adding a New Market Segment

**Location:** `src/App.jsx`, around line 50

```javascript
const segments = [
  // Add new entry
  {
    id: 'healthcare',
    name: 'Healthcare Robotics',
    growth: 85,
    marketSize: 22.5,
    momentum: 91,
    color: '#14b8a6',
    companies: ['ISRG', 'ABBV'],
    components: ['Vision Systems', 'Force Sensors']
  },
  // ...
];
```

#### Adding a New Tab

1. **Add tab button** (around line 600):
```jsx
<button
  onClick={() => setActiveTab('newtab')}
  className={activeTab === 'newtab' ? '...' : '...'}
>
  New Tab
</button>
```

2. **Add tab content** (around line 900):
```jsx
{activeTab === 'newtab' && (
  <div>
    <h2>New Tab Content</h2>
    {/* Your content here */}
  </div>
)}
```

#### Updating Chart Colors

**Location:** Throughout `App.jsx` in chart definitions

```jsx
// Match existing color palette
const CHART_COLORS = {
  primary: '#8b5cf6',    // Purple
  secondary: '#3b82f6',  // Blue
  success: '#10b981',    // Green
  warning: '#f59e0b',    // Orange
  danger: '#ef4444',     // Red
  info: '#06b6d4',       // Cyan
};
```

---

## Data Architecture

### Data Sources and Provenance

**All data includes metadata:**
- `source` - Where the data comes from
- `asOf` - Date of last update
- `definition` - How metrics are calculated
- `revisionPolicy` - How/when data is updated

**Data Types:**

| Dataset | Source | Status | Update Frequency |
|---------|--------|--------|------------------|
| Company Financials | Yahoo Finance, SEC EDGAR | Real structure, synthetic values | Daily (if live) |
| Market Indices | Synthetic demo data | Demo only | N/A |
| Leading Indicators | Synthetic (real sources: USPTO, PitchBook, LinkedIn) | Demo only | N/A |
| Supply Chain | Synthetic (real sources: industry reports) | Demo only | N/A |

### Cross-Reference Architecture

**Segments ↔ Companies ↔ Components:**

```
Segment "Humanoid Robots"
  ├── Companies: ['TSLA', 'Figure AI', 'Boston Dynamics']
  └── Components: ['Harmonic Drives', 'Servo Motors', 'AI Chips', 'Force Sensors']

Company "TSLA"
  ├── Segments: ['humanoid']
  └── Tier: 'Satellite'

Component "Harmonic Drives"
  └── Used by segments: ['humanoid', 'industrial']
```

**Filtering Logic:**
- Selecting a segment highlights its companies and components
- Selecting a company filters to its relevant segments
- Selecting a component shows which segments depend on it

### Watchlist System

**Implementation:**
```javascript
const [watchlist, setWatchlist] = useState(new Set(['NVDA', 'ISRG']));

// Add to watchlist
setWatchlist(prev => new Set([...prev, ticker]));

// Remove from watchlist
setWatchlist(prev => {
  const newSet = new Set(prev);
  newSet.delete(ticker);
  return newSet;
});
```

**Persistence:** Not yet implemented (watchlist resets on page reload)

### Alert System

**Alert Structure:**
```javascript
{
  id: 1,
  title: 'Alert Title',
  description: 'Alert description text',
  type: 'signal' | 'earnings' | 'supply' | 'policy' | 'price',
  priority: 'high' | 'medium' | 'low',
  date: 'YYYY-MM-DD',
  read: false
}
```

**Unread Count:**
```javascript
const unreadCount = alerts.filter(a => !a.read).length;
```

---

## Important Considerations

### Performance

**Current Status:** Good performance for current dataset size
- ~1,000 lines of code
- Small data arrays (< 100 items each)
- No performance issues observed

**Potential Issues (as data grows):**
- Large company lists (> 1,000 companies) may need virtualization
- Complex filtering across multiple dimensions may need memoization
- Chart re-renders could be optimized with `React.memo`

**Recommended:**
```javascript
// Memoize expensive calculations
const filteredCompanies = useMemo(() => {
  return companies.filter(/* complex logic */);
}, [companies, filterDependencies]);

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

### Security

**No security concerns for current architecture:**
- No user authentication
- No backend API calls
- No user-generated content storage
- No XSS vectors (React escapes by default)

**If adding features:**
- ❌ Avoid `dangerouslySetInnerHTML`
- ✅ Sanitize any user input before rendering
- ✅ Use environment variables for any API keys (`.env` in `.gitignore`)

### Accessibility

**Current Status:** Basic accessibility
- Semantic HTML elements used
- Buttons have hover states
- Charts may not be screen-reader friendly

**Improvements to consider:**
- Add `aria-label` to icon-only buttons
- Add keyboard navigation support
- Provide text alternatives for charts
- Test with screen readers

### Browser Compatibility

**Vite default targets:**
- Modern browsers (ES2020+)
- No IE11 support

**If older browser support needed:**
- Update Vite build target in `vite.config.js`
- Add polyfills for older JavaScript features

### Scaling Considerations

**When to refactor:**
- App.jsx exceeds 1,500 lines
- State management becomes unwieldy (consider Zustand or Redux)
- Multiple developers working simultaneously (split into modules)
- Need server-side rendering (migrate to Next.js)
- Need real-time data (add WebSocket connection)

**What works well currently:**
- Monolithic structure (easy to understand entire app)
- Embedded data (no API latency)
- Static deployment (cheap, fast, reliable)

---

## Quick Reference

### Common File Paths

```bash
# Main application code
/home/user/Robofutures/src/App.jsx

# Configuration
/home/user/Robofutures/vite.config.js
/home/user/Robofutures/tailwind.config.js
/home/user/Robofutures/package.json

# Deployment
/home/user/Robofutures/.github/workflows/deploy.yml

# Output
/home/user/Robofutures/dist/  # After npm run build
```

### Common Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173/Robofutures/)
npm run build        # Build for production (output to dist/)
npm run preview      # Preview production build

# Git workflow
git status           # Check current changes
git add .            # Stage all changes
git commit -m "msg"  # Commit with message
git push             # Push to remote branch
```

### Color Palette Reference

```javascript
// Momentum colors (used in badges, charts)
const MOMENTUM_COLORS = {
  high: 'text-green-400 bg-green-500/10',      // > 80
  medium: 'text-yellow-400 bg-yellow-500/10',  // 60-80
  low: 'text-red-400 bg-red-500/10',           // < 60
};

// Segment colors
const SEGMENT_COLORS = {
  humanoid: '#8b5cf6',    // Purple
  surgical: '#ec4899',    // Pink
  warehouse: '#3b82f6',   // Blue
  cobot: '#10b981',       // Green
  agri: '#f59e0b',        // Orange
  industrial: '#6366f1',  // Indigo
};
```

---

## Getting Help

### Resources

- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Recharts Docs:** https://recharts.org/
- **Lucide Icons:** https://lucide.dev/

### Debugging Tips

1. **Dev server not starting:**
   - Check if port 5173 is already in use
   - Delete `node_modules/` and run `npm install` again
   - Check for syntax errors in configuration files

2. **Build errors:**
   - Run `npm run build` to see specific error messages
   - Check for missing imports
   - Verify all file paths are correct

3. **Deployment not working:**
   - Check GitHub Actions tab for workflow errors
   - Verify GitHub Pages is enabled in repository settings
   - Confirm `base` path in `vite.config.js` matches repo name

4. **Styles not applying:**
   - Verify Tailwind classes are correct
   - Check if PostCSS is processing correctly
   - Clear browser cache

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-15 | 1.0.0 | Initial CLAUDE.md creation - comprehensive codebase documentation |

---

**End of CLAUDE.md**

This guide should be updated whenever significant architectural changes are made to the repository. When in doubt, read the source code and follow existing patterns.
