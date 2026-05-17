import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Layers, Map, TrendingUp, Bot, Star, Menu } from 'lucide-react';
import { computeSignalCockpit, deriveDashboardAlerts, getDataHealth } from './lib/signalCockpit.js';
import { fetchWithRetry } from './lib/fetchJson.js';
import OverviewTab from './components/tabs/OverviewTab.jsx';
import ThesisTab from './components/tabs/ThesisTab.jsx';
import ValueChainTab from './components/tabs/ValueChainTab.jsx';
import SignalsTab from './components/tabs/SignalsTab.jsx';

/** @typedef {import('./types.js').Ticker} Ticker */

// ── Static data constants ───────────────────────────────────────────────────

/** @type {Record<string, Ticker>} */
const ALL_TICKERS = {
  TXN: { n: 'Texas Instruments', l: 1, p: 280.95, c: 'USD', h: 287.83, w: 152.73, ch: 67.0, rb: 94.9, ex: 20, ti: 'Core', se: 'Analog/Power' },
  ON: { n: 'onsemi', l: 1, p: 103.03, c: 'USD', h: 103.32, w: 37.19, ch: 105.1, rb: 99.6, ex: 35, ti: 'Core', se: 'Power/Analog' },
  MCHP: { n: 'Microchip', l: 1, p: 93.95, c: 'USD', h: 94.56, w: 46.68, ch: 75.3, rb: 98.7, ex: 25, ti: 'Sat', se: 'Analog MCU' },
  'IFX.DE': { n: 'Infineon', l: 1, p: 57.95, c: 'EUR', h: 58.32, w: 29.07, ch: 53.6, rb: 98.7, ex: 30, ti: 'Core', se: 'Power Semi' },
  ALGM: { n: 'Allegro Micro', l: 1, p: 48.98, c: 'USD', h: 49.19, w: 18.17, ch: 83.5, rb: 99.3, ex: 45, ti: 'Sat', se: 'Position Sensing' },
  RRX: { n: 'Regal Rexnord', l: 1, p: 213.02, c: 'USD', h: 229.3, w: 109.5, ch: 45.9, rb: 86.4, ex: 15, ti: 'Sat', se: 'Industrial' },
  '6324.T': { n: 'Harmonic Drive', l: 2, p: 5150, c: 'JPY', h: 5310, w: 2316, ch: 66.7, rb: 94.7, ex: 80, ti: 'Core', se: 'Harmonic Gears' },
  '6268.T': { n: 'Nabtesco', l: 2, p: 5041, c: 'JPY', h: 5257, w: 2247, ch: 48.2, rb: 92.8, ex: 60, ti: 'Sat', se: 'RV Gears' },
  '6481.T': { n: 'THK', l: 2, p: 5787, c: 'JPY', h: 6026, w: 3395, ch: 44.7, rb: 90.9, ex: 25, ti: 'Sat', se: 'Linear Guides' },
  '6861.T': { n: 'Keyence', l: 2, p: 76460, c: 'JPY', h: 76790, w: 51510, ch: 43.9, rb: 98.7, ex: 15, ti: 'Core', se: 'Machine Vision' },
  '6954.T': { n: 'Fanuc', l: 3, p: 6820, c: 'JPY', h: 7270, w: 3588, ch: 35.7, rb: 87.8, ex: 88, ti: 'Core', se: 'CNC/Robots' },
  '6506.T': { n: 'Yaskawa', l: 3, p: 5521, c: 'JPY', h: 5657, w: 2807, ch: 36.7, rb: 95.2, ex: 75, ti: 'Sat', se: 'Servo/Robots' },
  'ABBN.SW': { n: 'ABB Ltd', l: 3, p: 79.1, c: 'CHF', h: 79.72, w: 44.2, ch: 33.6, rb: 98.3, ex: 48, ti: 'Sat', se: 'Ind Robots' },
  '3037.TW': { n: 'Unimicron', l: 4, p: 911, c: 'TWD', h: 920, w: 90.5, ch: 314.1, rb: 98.9, ex: 50, ti: 'Sat', se: 'ABF Subs' },
};

const NAV = [
  { id: 'overview', icon: Activity, label: 'Overview' },
  { id: 'thesis', icon: Layers, label: 'Thesis' },
  { id: 'valuechain', icon: Map, label: 'Value Chain' },
  { id: 'signals', icon: TrendingUp, label: 'Signals' },
];

const TF_DAYS = { '1d': 1, '3d': 3, '1w': 5, '1m': 21, '3m': 63, '6m': 126, '1y': 252, '3y': 756 };

// ── App shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('overview');
  const [watchlist, setWatchlist] = useState(['ON', '6324.T', '6954.T', 'ALGM', '3037.TW']);
  const [expandedLayer, setExpandedLayer] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [liveQuotes, setLiveQuotes] = useState(null);
  const [liveHistory, setLiveHistory] = useState(null);
  const [timeScale, setTimeScale] = useState('6m');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    Promise.all([
      fetchWithRetry(`${base}/data/quotes.json`).catch((err) => { setFetchError(err.message); return null; }),
      fetchWithRetry(`${base}/data/history.json`).catch((err) => { setFetchError(err.message); return null; }),
    ]).then(([quotes, history]) => {
      if (quotes) setLiveQuotes(quotes);
      if (history) setLiveHistory(history);
    });
  }, []);

  const toggleWl = (t) => setWatchlist((w) => (w.includes(t) ? w.filter((x) => x !== t) : [...w, t]));
  const switchTab = (id) => { setTab(id); setSidebarOpen(false); };

  const mergedTickers = useMemo(() => {
    if (!liveQuotes?.quotes) return ALL_TICKERS;
    const merged = { ...ALL_TICKERS };
    for (const [sym, q] of Object.entries(liveQuotes.quotes)) {
      if (merged[sym] && q.price) merged[sym] = { ...merged[sym], p: q.price, ch: q.change_pct ?? merged[sym].ch, live: true };
    }
    return merged;
  }, [liveQuotes]);

  const chartDataRaw = useMemo(() => {
    if (!liveHistory?.dates) return [];
    return liveHistory.dates.map((d, i) => ({ d, r: liveHistory.r[i] ?? 100, sp: liveHistory.sp[i] ?? 100, nd: liveHistory.nd[i] ?? 100 }));
  }, [liveHistory]);

  const dataHealth = useMemo(() => getDataHealth(liveQuotes, liveHistory), [liveQuotes, liveHistory]);

  const timeframeTickers = useMemo(() => {
    if (!liveHistory?.tickers) return mergedTickers;
    const nDays = TF_DAYS[timeScale] || 126;
    const enriched = {};
    for (const [sym, data] of Object.entries(mergedTickers)) {
      const hist = liveHistory.tickers[sym];
      let { ch, rb } = data;
      if (hist?.close?.length >= nDays + 1) {
        const closes = hist.close;
        const latest = closes[closes.length - 1];
        const prior = closes[closes.length - 1 - nDays];
        if (latest && prior && prior > 0) {
          ch = Math.round(((latest - prior) / prior) * 1000) / 10;
          const slice = closes.slice(closes.length - 1 - nDays);
          const lo = Math.min(...slice);
          const hi = Math.max(...slice);
          rb = hi > lo ? Math.round(((latest - lo) / (hi - lo)) * 100) : data.rb;
        }
      }
      enriched[sym] = { ...data, ch, rb };
    }
    return enriched;
  }, [mergedTickers, liveHistory, timeScale]);

  const cockpit = useMemo(() => computeSignalCockpit(timeframeTickers), [timeframeTickers]);

  const alerts = useMemo(() => {
    const base = deriveDashboardAlerts({ dataHealth, tickers: timeframeTickers });
    if (!fetchError) return base;
    return [{ id: 'fetch-error', type: 'fetch-error', ty: 'fetch-error', p: 'high', priority: 'high', t: `Fetch failed: ${fetchError}`, tm: 'Now', read: false }, ...base].slice(0, 6);
  }, [dataHealth, timeframeTickers, fetchError]);

  const tickersByLayer = useMemo(() => {
    /** @type {Record<number, string[]>} */
    const byLayer = {};
    for (const k in mergedTickers) {
      const l = mergedTickers[k].l;
      if (!byLayer[l]) byLayer[l] = [];
      byLayer[l].push(k);
    }
    return byLayer;
  }, [mergedTickers]);

  const dataUpdated = liveQuotes?.updated
    ? new Date(liveQuotes.updated).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;
  const timeStr = dataUpdated || new Date().toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const dataStatusTone = dataHealth.status === 'fresh'
    ? { color: 'var(--green)', bg: 'var(--green-bg)' }
    : dataHealth.status === 'degraded'
      ? { color: 'var(--amber)', bg: 'var(--amber-bg)' }
      : { color: 'var(--red)', bg: 'var(--red-bg)' };

  const TAB_LABELS = { overview: 'Overview', thesis: 'Thesis', valuechain: 'Value Chain', signals: 'Signals' };

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          className="sidebar-overlay open"
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? setSidebarOpen(false) : null)}
        />
      )}

      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')}>
        <div className="sidebar-brand">
          <Bot size={20} />
          <span>Robofutures</span>
        </div>
        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          <div className="nav-section">
            <div className="nav-section-title">Navigation</div>
            {NAV.map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={tab === item.id}
                aria-controls={`tabpanel-${item.id}`}
                tabIndex={tab === item.id ? 0 : -1}
                className={'nav-item' + (tab === item.id ? ' active' : '')}
                onClick={() => switchTab(item.id)}
              >
                <item.icon size={14} />
                {item.label}
                {item.id === 'signals' && unreadAlerts > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: 9999, padding: '0 6px', fontSize: 10, fontWeight: 600 }}>
                    {unreadAlerts}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="nav-section" style={{ marginTop: 24 }}>
            <div className="nav-section-title">Watchlist</div>
            {watchlist.map((tk) => {
              const d = timeframeTickers[tk];
              if (!d) return null;
              return (
                <button
                  key={tk}
                  className="nav-item"
                  aria-pressed={watchlist.includes(tk)}
                  onClick={() => toggleWl(tk)}
                  style={{ fontSize: 12 }}
                >
                  <Star size={10} style={{ color: '#f59e0b' }} />
                  {tk}
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-quaternary)' }}>
                    {d.p}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      <header className="app-header" role="banner">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <Menu size={20} />
          </button>
          <h1>{TAB_LABELS[tab] || tab}</h1>
        </div>
        <div className="header-actions">
          <span className="header-time">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: dataStatusTone.bg, color: dataStatusTone.color, borderRadius: 9999, padding: '1px 6px', fontSize: 10, fontWeight: 600, marginRight: 6, border: `1px solid ${dataStatusTone.color}` }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: dataStatusTone.color }} />
              {dataHealth.label}
            </span>
            Updated {timeStr}
          </span>
          <button className="tab-btn" onClick={() => setShowAlerts(!showAlerts)} style={{ padding: '3px 8px' }}>
            <Bot size={14} />
            {unreadAlerts > 0 && <span className="badge badge-red" style={{ marginLeft: 4, fontSize: 9 }}>{unreadAlerts}</span>}
          </button>
        </div>
      </header>

      <main className="main-content">
        {showAlerts && (
          <div className="card" style={{ marginBottom: 16, padding: 12 }}>
            <div className="card-title" style={{ marginBottom: 8 }}>Alerts</div>
            {alerts.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13, color: a.read ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                <span className={'level-dot level-' + (a.p === 'high' ? 'high' : 'ok')} />
                {a.t}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-quaternary)' }}>{a.tm}</span>
              </div>
            ))}
          </div>
        )}

        <div id="tabpanel-overview" role="tabpanel" hidden={tab !== 'overview'}>
          <OverviewTab cockpit={cockpit} tickers={timeframeTickers} watchlist={watchlist} timeScale={timeScale} setTimeScale={setTimeScale} chartDataRaw={chartDataRaw} />
        </div>
        <div id="tabpanel-thesis" role="tabpanel" hidden={tab !== 'thesis'}>
          <ThesisTab tickers={timeframeTickers} tickersByLayer={tickersByLayer} expandedLayer={expandedLayer} setExpandedLayer={setExpandedLayer} />
        </div>
        <div id="tabpanel-valuechain" role="tabpanel" hidden={tab !== 'valuechain'}>
          <ValueChainTab tickers={timeframeTickers} tickersByLayer={tickersByLayer} timeScale={timeScale} />
        </div>
        <div id="tabpanel-signals" role="tabpanel" hidden={tab !== 'signals'}>
          <SignalsTab alerts={alerts} />
        </div>
      </main>

      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={'mobile-nav-btn' + (tab === item.id ? ' active' : '')}
              onClick={() => switchTab(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.id === 'signals' && unreadAlerts > 0 && <span className="badge-count">{unreadAlerts}</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
