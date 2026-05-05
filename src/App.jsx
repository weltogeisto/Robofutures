import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Layers, Map, TrendingUp, TrendingDown, Bot, Star, Zap, Menu, X } from 'lucide-react';
import { computeSignalCockpit } from './lib/signalCockpit.js';

// DATA
const LAYERS = [
  { id: 1, name: 'Cyclical Semis', rank: '1st', color: '#5e6ad2', desc: 'Highest Convexity', thesis: 'Auto/Industrial cycle bottom + free robotics option' },
  { id: 2, name: 'Japanese Actuators', rank: '1st', color: '#7170ff', desc: 'Purest Humanoid Play', thesis: 'Harmonic drive monopoly. 40-60 actuators per unit.' },
  { id: 3, name: 'System Integrators', rank: '2nd', color: '#828fff', desc: 'Industrial Recovery', thesis: 'Fanuc 12% below 52w high. Automation wave.' },
  { id: 4, name: 'ABF Substrates', rank: '3rd', color: '#8b5cf6', desc: 'AI Infrastructure', thesis: "Seller's market. AI + robotics double tailwind." },
];

const ALL_TICKERS = {
  'TXN':     { n: 'Texas Instruments', l: 1, p: 280.95, c: 'USD', h: 287.83, w: 152.73, ch: 67.0, rb: 94.9, ex: 20, ti: 'Core', se: 'Analog/Power' },
  'ON':      { n: 'onsemi',            l: 1, p: 103.03, c: 'USD', h: 103.32, w: 37.19, ch: 105.1, rb: 99.6, ex: 35, ti: 'Core', se: 'Power/Analog' },
  'MCHP':    { n: 'Microchip',         l: 1, p: 93.95,  c: 'USD', h: 94.56,  w: 46.68, ch: 75.3, rb: 98.7, ex: 25, ti: 'Sat', se: 'Analog MCU' },
  'IFX.DE':   { n: 'Infineon',          l: 1, p: 57.95,  c: 'EUR', h: 58.32,  w: 29.07, ch: 53.6, rb: 98.7, ex: 30, ti: 'Core', se: 'Power Semi' },
  'ALGM':    { n: 'Allegro Micro',     l: 1, p: 48.98,  c: 'USD', h: 49.19,  w: 18.17, ch: 83.5, rb: 99.3, ex: 45, ti: 'Sat', se: 'Position Sensing' },
  'RRX':     { n: 'Regal Rexnord',     l: 1, p: 213.02, c: 'USD', h: 229.30, w: 109.50, ch: 45.9, rb: 86.4, ex: 15, ti: 'Sat', se: 'Industrial' },
  '6324.T':  { n: 'Harmonic Drive',    l: 2, p: 5150,   c: 'JPY', h: 5310,   w: 2316,  ch: 66.7, rb: 94.7, ex: 80, ti: 'Core', se: 'Harmonic Gears' },
  '6268.T':  { n: 'Nabtesco',          l: 2, p: 5041,   c: 'JPY', h: 5257,   w: 2247,  ch: 48.2, rb: 92.8, ex: 60, ti: 'Sat', se: 'RV Gears' },
  '6481.T':  { n: 'THK',               l: 2, p: 5787,   c: 'JPY', h: 6026,   w: 3395,  ch: 44.7, rb: 90.9, ex: 25, ti: 'Sat', se: 'Linear Guides' },
  '6861.T':  { n: 'Keyence',           l: 2, p: 76460,  c: 'JPY', h: 76790,  w: 51510, ch: 43.9, rb: 98.7, ex: 15, ti: 'Core', se: 'Machine Vision' },
  '6954.T':  { n: 'Fanuc',             l: 3, p: 6820,   c: 'JPY', h: 7270,   w: 3588,  ch: 35.7, rb: 87.8, ex: 88, ti: 'Core', se: 'CNC/Robots' },
  '6506.T':  { n: 'Yaskawa',           l: 3, p: 5521,   c: 'JPY', h: 5657,   w: 2807,  ch: 36.7, rb: 95.2, ex: 75, ti: 'Sat', se: 'Servo/Robots' },
  'ABBN.SW': { n: 'ABB Ltd',           l: 3, p: 79.10,  c: 'CHF', h: 79.72,  w: 44.20, ch: 33.6, rb: 98.3, ex: 48, ti: 'Sat', se: 'Ind Robots' },
  '3037.TW': { n: 'Unimicron',         l: 4, p: 911,    c: 'TWD', h: 920,    w: 90.5,  ch: 314.1, rb: 98.9, ex: 50, ti: 'Sat', se: 'ABF Subs' },
};

const SEG = [
  { id: 'humanoid', n: 'Humanoid', g: 298, m: 97, c: '#8b5cf6' },
  { id: 'warehouse', n: 'Warehouse', g: 62, m: 93, c: '#3b82f6' },
  { id: 'cobot', n: 'Collaborative', g: 52, m: 89, c: '#10b981' },
  { id: 'surgical', n: 'Surgical', g: 44, m: 86, c: '#ec4899' },
];

const MARKET = [
  { m: 'Nov 25', r: 100, sp: 100, nd: 100 },
  { m: 'Dec 25', r: 112, sp: 104, nd: 106 },
  { m: 'Jan 26', r: 128, sp: 108, nd: 112 },
  { m: 'Feb 26', r: 145, sp: 112, nd: 118 },
  { m: 'Mar 26', r: 160, sp: 116, nd: 125 },
  { m: 'Apr 26', r: 178, sp: 120, nd: 132 },
  { m: 'May 26', r: 195, sp: 124, nd: 138 },
];

const TIME_SCALES = [
  { id: '1d', label: '1D' },
  { id: '3d', label: '3D' },
  { id: '1w', label: '1W' },
  { id: '1m', label: '1M' },
  { id: '3m', label: '3M' },
  { id: '6m', label: '6M' },
  { id: '1y', label: '1Y' },
  { id: '3y', label: '3Y' },
];

// Generate ~3 years of synthetic daily data for time-scale chart
const ALL_DAILY = (() => {
  const data = [];
  const now = new Date();
  const DAYS = 756;
  let r = 48, sp = 82, nd = 72;

  for (let i = DAYS; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const rr = (Math.random() - 0.478) * 2.2;
    const sr = (Math.random() - 0.49) * 0.9;
    const nr = (Math.random() - 0.485) * 1.1;

    r = r * (1 + rr / 100);
    sp = sp * (1 + sr / 100);
    nd = nd * (1 + nr / 100);

    data.push({
      d: d.toISOString().substring(0, 10),
      r: Math.round(r * 100) / 100,
      sp: Math.round(sp * 100) / 100,
      nd: Math.round(nd * 100) / 100,
    });
  }
  return data;
})();

const filterTimeScale = (data, scale) => {
  if (!data?.length) return [];
  const map = { '1d': 1, '3d': 3, '1w': 7, '1m': 30, '3m': 90, '6m': 180, '1y': 365, '3y': 1095 };
  const days = map[scale] || 180;
  const last = new Date((data.at(-1)?.d || new Date().toISOString().slice(0, 10)) + 'T23:59:59');
  const cutoff = new Date(last);
  cutoff.setDate(cutoff.getDate() - days);
  const filtered = data.filter(d => new Date(d.d + 'T23:59:59') >= cutoff);
  if (filtered.length === 0) return data;

  // Rebase all series to 100 at start of selected period
  const base = filtered[0];
  return filtered.map(d => ({
    ...d,
    r:  Math.round((d.r  / base.r)  * 10000) / 100,
    sp: Math.round((d.sp / base.sp) * 10000) / 100,
    nd: Math.round((d.nd / base.nd) * 10000) / 100,
  }));
};

const formatXAxis = (dateStr, scale) => {
  const d = new Date(dateStr + 'T12:00:00');
  if (scale === '1d' || scale === '3d') return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' });
  if (scale === '1w') return d.toLocaleDateString('de-DE', { weekday: 'short' });
  if (scale === '1m') return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  if (scale === '3m' || scale === '6m') return d.toLocaleDateString('de-DE', { month: 'short' });
  return d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
};

const ALERTS = [
  { id: 1, ty: 'momentum', p: 'high', t: 'ON Semi +105% in 6M', tm: 'Today', read: false },
  { id: 2, ty: 'momentum', p: 'high', t: 'Unimicron +314% in 6M', tm: 'Today', read: false },
  { id: 3, ty: 'thesis', p: 'med', t: 'Layer 1 near 52w high', tm: 'Yesterday', read: false },
];

const NAV = [
  { id: 'overview', icon: Activity, label: 'Overview' },
  { id: 'thesis', icon: Layers, label: 'Thesis' },
  { id: 'valuechain', icon: Map, label: 'Value Chain' },
  { id: 'signals', icon: TrendingUp, label: 'Signals' },
];

const LayerBadge = ({ id }) => {
  const colors = ['', '#5e6ad2', '#7170ff', '#828fff', '#8b5cf6'];
  return (
    <span style={{ background: colors[id] || '#5e6ad2', color: 'white', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500 }}>
      L{id}
    </span>
  );
};

export default function App() {
  const [tab, setTab] = useState('overview');
  const [watchlist, setWatchlist] = useState(['ON', '6324.T', '6954.T', 'ALGM', '3037.TW']);
  const [expandedLayer, setExpandedLayer] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [liveQuotes, setLiveQuotes] = useState(null);
  const [liveHistory, setLiveHistory] = useState(null);
  const [timeScale, setTimeScale] = useState('6m');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch live data from public/data/ on mount
  useEffect(() => {
    const base = '/Robofutures';
    Promise.all([
      fetch(`${base}/data/quotes.json`).then(r => r.ok ? r.json() : null),
      fetch(`${base}/data/history.json`).then(r => r.ok ? r.json() : null),
    ]).then(([quotes, history]) => {
      if (quotes)  setLiveQuotes(quotes);
      if (history) setLiveHistory(history);
    }).catch(() => {});
  }, []);

  const toggleWl = (t) => {
    setWatchlist(w => w.includes(t) ? w.filter(x => x !== t) : [...w, t]);
  };

  // Merge live quotes into hardcoded ticker structure
  const mergedTickers = useMemo(() => {
    if (!liveQuotes?.quotes) return ALL_TICKERS;
    const merged = { ...ALL_TICKERS };
    for (const [sym, q] of Object.entries(liveQuotes.quotes)) {
      if (merged[sym] && q.price) {
        merged[sym] = { ...merged[sym], p: q.price, ch: q.change_pct ?? merged[sym].ch, live: true };
      }
    }
    return merged;
  }, [liveQuotes]);

  // Build chart data array from live history or fall back to synthetic
  const chartDataRaw = useMemo(() => {
    if (!liveHistory?.dates) return ALL_DAILY;
    return liveHistory.dates.map((d, i) => ({
      d,
      r:  liveHistory.r[i]  ?? 100,
      sp: liveHistory.sp[i] ?? 100,
      nd: liveHistory.nd[i] ?? 100,
    }));
  }, [liveHistory]);

  const dataUpdated = liveQuotes?.updated
    ? new Date(liveQuotes.updated).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  // ── Timeframe-aware enrichment ──────────────────────────────────────────
  const TF_DAYS = { '1d': 1, '3d': 3, '1w': 5, '1m': 21, '3m': 63, '6m': 126, '1y': 252, '3y': 756 };

  const timeframeTickers = useMemo(() => {
    if (!liveHistory?.tickers) return mergedTickers; // fallback → static ch/rb

    const nDays = TF_DAYS[timeScale] || 126;
    const enriched = {};
    for (const [sym, data] of Object.entries(mergedTickers)) {
      const hist = liveHistory.tickers[sym];
      let ch = data.ch;
      let rb = data.rb;

      if (hist?.close?.length >= nDays + 1) {
        const closes = hist.close;
        const latest = closes[closes.length - 1];
        const prior  = closes[closes.length - 1 - nDays];
        if (latest && prior && prior > 0) {
          ch = Math.round((latest - prior) / prior * 1000) / 10;
          const periodSlice = closes.slice(closes.length - 1 - nDays);
          const lo = Math.min(...periodSlice);
          const hi = Math.max(...periodSlice);
          rb = hi > lo ? Math.round((latest - lo) / (hi - lo) * 100) : data.rb;
        }
      }
      enriched[sym] = { ...data, ch, rb };
    }
    return enriched;
  }, [mergedTickers, liveHistory, timeScale]);

  const cockpit = useMemo(() => computeSignalCockpit(timeframeTickers), [timeframeTickers]);


  const switchTab = (id) => {
    setTab(id);
    setSidebarOpen(false);
  };

  const tickersByLayer = {};
  for (const k in mergedTickers) {
    const t = mergedTickers[k];
    if (!tickersByLayer[t.l]) tickersByLayer[t.l] = [];
    tickersByLayer[t.l].push(k);
  }

  const now = new Date();
  const timeStr = dataUpdated || now.toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const unreadAlerts = ALERTS.filter(a => !a.read).length;

  return (
    <div className="app-layout">
      {/* SIDEBAR OVERLAY (mobile) */}
      {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')}>
        <div className="sidebar-brand">
          <Bot size={20} />
          <span>Robofutures</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Navigation</div>
            {NAV.map(item => (
              <button key={item.id} className={'nav-item' + (tab === item.id ? ' active' : '')} onClick={() => switchTab(item.id)}>
                <item.icon size={14} />
                {item.label}
                {item.id === 'signals' && unreadAlerts > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: 9999, padding: '0 6px', fontSize: 10, fontWeight: 600 }}>{unreadAlerts}</span>
                )}
              </button>
            ))}
          </div>
          <div className="nav-section" style={{ marginTop: 24 }}>
            <div className="nav-section-title">Watchlist</div>
            {watchlist.map(tk => {
              const d = timeframeTickers[tk];
              if (!d) return null;
              return (
                <button key={tk} className="nav-item" onClick={() => toggleWl(tk)} style={{ fontSize: 12 }}>
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

      {/* HEADER */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <Menu size={20} />
          </button>
          <h1>
          {tab === 'overview' && 'Overview'}
          {tab === 'thesis' && 'Thesis'}
          {tab === 'valuechain' && 'Value Chain'}
          {tab === 'signals' && 'Signals'}
        </h1>
        </div>
        <div className="header-actions">
          <span className="header-time">
            {liveQuotes && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'var(--green-bg)', color: 'var(--green)',
                borderRadius: 9999, padding: '1px 6px', fontSize: 10,
                fontWeight: 600, marginRight: 6,
                border: '1px solid rgba(16,185,129,0.2)'
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
                LIVE
              </span>
            )}
            Updated {timeStr}
          </span>
          <button className="tab-btn" onClick={() => setShowAlerts(!showAlerts)} style={{ padding: '3px 8px' }}>
            <Bot size={14} />
            {unreadAlerts > 0 && <span className="badge badge-red" style={{ marginLeft: 4, fontSize: 9 }}>{unreadAlerts}</span>}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="main-content">
        {showAlerts && (
          <div className="card" style={{ marginBottom: 16, padding: 12 }}>
            <div className="card-title" style={{ marginBottom: 8 }}>Alerts</div>
            {ALERTS.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13, color: a.read ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                <span className={'level-dot level-' + (a.p === 'high' ? 'high' : 'ok')} />
                {a.t}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-quaternary)' }}>{a.tm}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="grid-4" style={{ marginBottom: 16 }}>
              {[{ l: 'Layer Score', v: '4.2/5', sub: 'Composite' },
                { l: 'Tickers Tracked', v: Object.keys(timeframeTickers).length, sub: 'Across 4 layers' },
                { l: 'Avg Rebound', v: Math.round(Object.values(timeframeTickers).reduce((s, t) => s + t.rb, 0) / Object.keys(timeframeTickers).length) + '%', sub: 'From 52w low' },
                { l: 'Watchlist', v: watchlist.length, sub: 'Selected positions' },
              ].map(kpi => (
                <div key={kpi.l} className="card">
                  <div className="card-title">{kpi.l}</div>
                  <div className="card-value">{kpi.v}</div>
                  <div className="card-label">{kpi.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="card" style={{ gridColumn: 'span 1' }}>
                <div className="card-title">Cycle Clock</div>
                <div className="card-value" style={{ fontSize: 28 }}>P{cockpit.cycleClock.phase}</div>
                <div style={{ fontWeight: 510, fontSize: 14, marginTop: 4 }}>{cockpit.cycleClock.stage}</div>
                <div className="card-label" style={{ marginTop: 8 }}>{cockpit.cycleClock.implication}</div>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-quaternary)' }}>
                  Confidence {cockpit.cycleClock.confidence}%
                </div>
              </div>

              <div className="card" style={{ gridColumn: 'span 1' }}>
                <div className="card-title">Momentum Ticker Radar</div>
                {cockpit.topMomentumTickers.slice(0, 5).map(t => (
                  <div key={t.ticker} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}>
                    <span style={{ fontWeight: 600, width: 62 }}>{t.ticker}</span>
                    <span style={{ flex: 1, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: t.status.startsWith('Early') ? 'var(--green)' : 'var(--text-quaternary)' }}>{t.earlyness}</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ gridColumn: 'span 1' }}>
                <div className="card-title">Action Queue</div>
                {cockpit.actionQueue.slice(0, 3).map(item => (
                  <div key={item.entity} style={{ padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 12, fontWeight: 510 }}>{item.action}</div>
                    <div className="card-label">{item.rationale}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Upstream / Downstream Layer Map</div>
              <div className="grid-4" style={{ marginTop: 10 }}>
                {cockpit.ecosystemLayers.map(layer => (
                  <div key={layer.id} style={{ padding: 10, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <LayerBadge id={layer.id} />
                      <span style={{ fontSize: 12, fontWeight: 510 }}>{layer.name}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ width: `${layer.bottleneckScore}%`, height: '100%', background: layer.signal === 'bottleneck' ? '#ef4444' : layer.signal === 'watch' ? '#f59e0b' : '#7170ff' }} />
                    </div>
                    <div className="card-label">Bottleneck {layer.bottleneckScore} · {layer.tickers.slice(0, 3).map(t => t.ticker).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIME SCALE SELECTOR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-quaternary)', fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: '0.3px' }}>TIMEFRAME</span>
              {TIME_SCALES.map(ts => (
                <button
                  key={ts.id}
                  className={'tab-btn' + (timeScale === ts.id ? ' active' : '')}
                  onClick={() => setTimeScale(ts.id)}
                  style={{ padding: '3px 10px', fontSize: 11, whiteSpace: 'nowrap' }}
                >
                  {ts.label}
                </button>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Robotics Index vs Benchmarks (Normalized)</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={filterTimeScale(chartDataRaw, timeScale)}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="d" tick={{ fill: '#62666d', fontSize: 11 }} tickFormatter={(v) => formatXAxis(v, timeScale)} />
                  <YAxis tick={{ fill: '#62666d', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#191a1b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}
                    labelFormatter={(v) => new Date(v + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  />
                  <Line type="monotone" dataKey="r" stroke="#7170ff" strokeWidth={2} dot={false} name="Robotics Index" />
                  <Line type="monotone" dataKey="sp" stroke="#8a8f98" strokeWidth={1.5} dot={false} name="S&P 500" />
                  <Line type="monotone" dataKey="nd" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="NASDAQ" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">Segment Momentum</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SEG.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.c }} />
                      <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.n}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-primary)' }}>{s.m}%</span>
                      <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{ width: s.m + '%', height: '100%', background: s.c, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Watchlist Momentum</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {watchlist.map(tk => {
                    const d = timeframeTickers[tk];
                    if (!d) return null;
                    const isUp = d.ch >= 0;
                    return (
                      <div key={tk} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontWeight: 500, width: 60 }}>{tk}</span>
                        <span style={{ flex: 1, color: 'var(--text-tertiary)', fontSize: 12 }}>{d.n}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: isUp ? 'var(--green)' : 'var(--red)', fontSize: 12 }}>
                          {isUp ? '+' : ''}{d.ch}%
                        </span>
                        <LayerBadge id={d.l} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB: THESIS */}
        {tab === 'thesis' && (
          <div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 16 }}>
              Investment thesis derived from Citrini Research + own analysis. Updated May 4, 2026.
            </p>
            <div className="grid-2">
              {LAYERS.map(layer => {
                const tickers = tickersByLayer[layer.id] || [];
                const isExpanded = expandedLayer === layer.id;
                return (
                  <div key={layer.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isExpanded ? 12 : 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: layer.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 14 }}>
                        {layer.rank}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 510, fontSize: 15 }}>{layer.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{layer.desc}</div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-quaternary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {tickers.length} tickers
                      </span>
                    </div>
                    {isExpanded && (
                      <>
                        <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          {layer.thesis}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          {tickers.map(tk => {
                            const d = timeframeTickers[tk];
                            if (!d) return null;
                            const isUp = d.ch >= 0;
                            return (
                              <div key={tk} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <span style={{ fontWeight: 500, width: 50 }}>{tk}</span>
                                <span style={{ flex: 1, color: 'var(--text-tertiary)' }}>{d.n}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-quaternary)' }}>{d.p}{d.c}</span>
                                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: isUp ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>
                                  {isUp ? '+' : ''}{d.ch}%
                                </span>
                                <span style={{ fontSize: 10, color: 'var(--text-quaternary)' }}>rb:{d.rb}%</span>
                                <span style={{ fontSize: 10, color: 'var(--text-quaternary)' }}>ex:{d.ex}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: VALUE CHAIN */}
        {tab === 'valuechain' && (
          <div className="card">
            <div className="card-title">Full Ticker Universe — 4-Layer Humanoid Robotics Value Chain</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticker</th><th>Name</th><th>Layer</th><th>Price</th><th>6M Chg</th><th>Rebound</th><th>Exposure</th><th>Tier</th><th>Segment</th>
                </tr>
              </thead>
              <tbody>
                {LAYERS.map(layer => {
                  const tickers = tickersByLayer[layer.id] || [];
                  return (
                    <React.Fragment key={layer.id}>
                      <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <td colSpan={9} style={{ padding: '8px 12px', fontWeight: 510, color: layer.color, fontSize: 12 }}>
                          {layer.rank}. {layer.name} — {layer.desc}
                        </td>
                      </tr>
                      {tickers.map(tk => {
                        const d = timeframeTickers[tk];
                        if (!d) return null;
                        const isUp = d.ch >= 0;
                        return (
                          <tr key={tk}>
                            <td style={{ fontWeight: 500 }}>{tk}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{d.n}</td>
                            <td><LayerBadge id={d.l} /></td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{d.p} {d.c}</td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', color: isUp ? 'var(--green)' : 'var(--red)' }}>
                              {isUp ? '+' : ''}{d.ch}%
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{d.rb}%</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                  <div style={{ width: d.ex + '%', height: '100%', background: '#7170ff', borderRadius: 2 }} />
                                </div>
                                <span style={{ fontSize: 11 }}>{d.ex}%</span>
                              </div>
                            </td>
                            <td><span className={'badge-tier-' + (d.ti === 'Core' ? 'core' : d.ti === 'Sat' ? 'satellite' : 'spec')} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>{d.ti}</span></td>
                            <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{d.se}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: SIGNALS */}
        {tab === 'signals' && (
          <div className="grid-3">
            {[{ n: 'Patent Momentum', v: 82, l: 'USPTO filings +12%' },
              { n: 'Hiring Velocity', v: 78, l: 'LinkedIn robotics jobs +8%' },
              { n: 'Order Book', v: 71, l: 'Capex proxy +5%' },
              { n: 'Policy Tailwinds', v: 85, l: 'Subsidies + defense +15%' },
              { n: 'Supply Chain', v: 58, l: 'Component availability -5%' },
              { n: 'Earnings Sentiment', v: 74, l: 'NLP analysis +6%' },
            ].map(ind => (
              <div key={ind.n} className="card">
                <div className="card-title">{ind.n}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div className="card-value" style={{ fontSize: 36 }}>{ind.v}</div>
                  <span style={{ color: ind.v >= 70 ? 'var(--green)' : ind.v >= 50 ? 'var(--amber)' : 'var(--red)', fontSize: 12, marginBottom: 4 }}>
                    {'\u25B2'}{ind.l.split(' ').pop()}
                  </span>
                </div>
                <div style={{ marginTop: 8, width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                  <div style={{ width: ind.v + '%', height: '100%', background: ind.v >= 70 ? '#10b981' : ind.v >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 2 }} />
                </div>
                <div className="card-label" style={{ marginTop: 8 }}>{ind.l}</div>
              </div>
            ))}
            <div className="card" style={{ gridColumn: 'span 3' }}>
              <div className="card-title">Recent Signals</div>
              {ALERTS.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                  <span className={'level-dot level-' + (a.p === 'high' ? 'high' : a.p === 'med' ? 'ok' : 'low')} />
                  <span>{a.t}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-quaternary)' }}>{a.tm}</span>
                  {!a.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7170ff' }} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {NAV.map(item => (
            <button key={item.id} className={'mobile-nav-btn' + (tab === item.id ? ' active' : '')} onClick={() => switchTab(item.id)}>
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.id === 'signals' && unreadAlerts > 0 && (
                <span className="badge-count">{unreadAlerts}</span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
