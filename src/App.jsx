<<<<<<< HEAD
import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Layers, Map, TrendingUp, TrendingDown, Bot, Star, Zap } from 'lucide-react';
=======
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Globe, Cpu, Activity, DollarSign, BarChart3, ChevronDown, ChevronUp, ChevronRight, Bell, ArrowUpRight, ArrowDownRight, Minus, Target, Truck, Building2, Microscope, Bot, RefreshCw, Info, X, Plus, Star, Filter, Download, Eye, EyeOff, Bookmark, BookmarkCheck, AlertCircle, CheckCircle, Clock, ExternalLink, Layers, GitBranch, Map } from 'lucide-react';
import dataSources from './data/dataSources.json';
import fullMarketPerformanceData from './data/marketPerformance.json';
import segments from './data/segments.json';
import companies from './data/companies.json';
import supplyChainComponents from './data/supplyChainComponents.json';
import leadingIndicators from './data/leadingIndicators.json';
import initialAlerts from './data/alerts.json';
import tickerHistory30d from './data/tickerHistory30d.json';
import tickerHistory180d from './data/tickerHistory180d.json';
>>>>>>> origin/main

// DATA
const LAYERS = [
  { id: 1, name: 'Cyclical Semis', rank: '1st', color: '#5e6ad2', desc: 'Highest Convexity', thesis: 'Auto/Industrial cycle bottom + free robotics option' },
  { id: 2, name: 'Japanese Actuators', rank: '1st', color: '#7170ff', desc: 'Purest Humanoid Play', thesis: 'Harmonic drive monopoly. 40-60 actuators per unit.' },
  { id: 3, name: 'System Integrators', rank: '2nd', color: '#828fff', desc: 'Industrial Recovery', thesis: 'Fanuc 12% below 52w high. Automation wave.' },
  { id: 4, name: 'ABF Substrates', rank: '3rd', color: '#8b5cf6', desc: 'AI Infrastructure', thesis: "Seller's market. AI + robotics double tailwind." },
];

const ALL_TICKERS = {
  'TXN': { n: 'Texas Instruments', l: 1, p: 280.95, c: 'USD', h: 287.83, w: 152.73, ch: 67.0, rb: 94.9, ex: 20, ti: 'Core', se: 'Analog/Power' },
  'ON': { n: 'onsemi', l: 1, p: 103.03, c: 'USD', h: 103.32, w: 37.19, ch: 105.1, rb: 99.6, ex: 35, ti: 'Core', se: 'Power/Analog' },
  'MCHP': { n: 'Microchip', l: 1, p: 93.95, c: 'USD', h: 94.56, w: 46.68, ch: 75.3, rb: 98.7, ex: 25, ti: 'Sat', se: 'Analog MCU' },
  'IFX': { n: 'Infineon', l: 1, p: 57.95, c: 'EUR', h: 58.32, w: 29.07, ch: 53.6, rb: 98.7, ex: 30, ti: 'Core', se: 'Power Semi' },
  'ALGM': { n: 'Allegro Micro', l: 1, p: 48.98, c: 'USD', h: 49.19, w: 18.17, ch: 83.5, rb: 99.3, ex: 45, ti: 'Sat', se: 'Position Sensing' },
  'RRX': { n: 'Regal Rexnord', l: 1, p: 213.02, c: 'USD', h: 229.30, w: 109.50, ch: 45.9, rb: 86.4, ex: 15, ti: 'Sat', se: 'Industrial' },
  '6324.T': { n: 'Harmonic Drive', l: 2, p: 5150, c: 'JPY', h: 5310, w: 2316, ch: 66.7, rb: 94.7, ex: 80, ti: 'Core', se: 'Harmonic Gears' },
  '6268.T': { n: 'Nabtesco', l: 2, p: 5041, c: 'JPY', h: 5257, w: 2247, ch: 48.2, rb: 92.8, ex: 60, ti: 'Sat', se: 'RV Gears' },
  '6481.T': { n: 'THK', l: 2, p: 5787, c: 'JPY', h: 6026, w: 3395, ch: 44.7, rb: 90.9, ex: 25, ti: 'Sat', se: 'Linear Guides' },
  '6861.T': { n: 'Keyence', l: 2, p: 76460, c: 'JPY', h: 76790, w: 51510, ch: 43.9, rb: 98.7, ex: 15, ti: 'Core', se: 'Machine Vision' },
  '6954.T': { n: 'Fanuc', l: 3, p: 6820, c: 'JPY', h: 7270, w: 3588, ch: 35.7, rb: 87.8, ex: 88, ti: 'Core', se: 'CNC/Robots' },
  '6506.T': { n: 'Yaskawa', l: 3, p: 5521, c: 'JPY', h: 5657, w: 2807, ch: 36.7, rb: 95.2, ex: 75, ti: 'Sat', se: 'Servo/Robots' },
  'ABBN.SW': { n: 'ABB Ltd', l: 3, p: 79.10, c: 'CHF', h: 79.72, w: 44.20, ch: 33.6, rb: 98.3, ex: 48, ti: 'Sat', se: 'Ind Robots' },
  '3037.TW': { n: 'Unimicron', l: 4, p: 911, c: 'TWD', h: 920, w: 90.5, ch: 314.1, rb: 98.9, ex: 50, ti: 'Sat', se: 'ABF Subs' },
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

// UTILITY
const LayerBadge = ({ id }) => {
  const colors = ['', '#5e6ad2', '#7170ff', '#828fff', '#8b5cf6'];
  return (
    <span style={{ background: colors[id] || '#5e6ad2', color: 'white', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500 }}>
      L{id}
    </span>
  );
};

// MAIN APP
export default function App() {
  const [tab, setTab] = useState('overview');
  const [watchlist, setWatchlist] = useState(['ON', '6324.T', '6954.T', 'ALGM', '3037.TW']);
  const [expandedLayer, setExpandedLayer] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);

<<<<<<< HEAD
  const toggleWl = (t) => {
    setWatchlist(w => w.includes(t) ? w.filter(x => x !== t) : [...w, t]);
  };

  const tickersByLayer = {};
  for (const k in ALL_TICKERS) {
    const t = ALL_TICKERS[k];
    if (!tickersByLayer[t.l]) tickersByLayer[t.l] = [];
    tickersByLayer[t.l].push(k);
=======
const Sparkline = ({ data, color = '#94a3b8' }) => (
  <div className="h-10 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded p-2 shadow-lg">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
>>>>>>> origin/main
  }

<<<<<<< HEAD
  const now = new Date();
  const timeStr = now.toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const unreadAlerts = ALERTS.filter(a => !a.read).length;

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Bot size={20} />
          <span>Robofutures</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Navigation</div>
            {NAV.map(item => (
              <button key={item.id} className={'nav-item' + (tab === item.id ? ' active' : '')} onClick={() => setTab(item.id)}>
                <item.icon size={14} />
                {item.label}
                {item.id === 'signals' && unreadAlerts > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: 9999, padding: '0 6px', fontSize: 10, fontWeight: 600 }}>{unreadAlerts}</span>
=======
const formatLiveTimestamp = (timestamp) => {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
};

const formatCompactNumber = (value) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const getPercentChange = (series, lookback) => {
  if (!series || lookback <= 0 || series.length <= lookback) return null;
  const latest = series[series.length - 1]?.price;
  const past = series[series.length - 1 - lookback]?.price;
  if (!Number.isFinite(latest) || !Number.isFinite(past) || past === 0) return null;
  return Number((((latest - past) / past) * 100).toFixed(2));
};

// ============================================================================
// SIGNAL DECOMPOSITION DRAWER
// ============================================================================

const SignalDrawer = ({ signal, onClose }) => {
  if (!signal) return null;
  
  const factorEntries = Object.entries(signal.factors);
  const maxFactor = Math.max(...factorEntries.map(([, v]) => Math.abs(v)));
  
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">{signal.name}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
      </div>
      
      <div className="p-4 space-y-5">
        {/* Score */}
        <div className="text-center py-2">
          <div className="text-4xl font-mono text-slate-200 mb-1">{signal.value}</div>
          <div className="flex items-center justify-center gap-2">
            <TrendIndicator value={signal.change} suffix=" pts/wk" />
          </div>
        </div>
        
        {/* Description */}
        <div className="border-l-2 border-slate-700 pl-3">
          <p className="text-xs text-slate-500">{signal.description}</p>
        </div>
        
        {/* Factor Breakdown */}
        <div>
          <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-3">Factor Contribution</h4>
          <div className="space-y-3">
            {factorEntries.map(([factor, value]) => (
              <div key={factor}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 capitalize">{factor}</span>
                  <span className={`font-mono ${value >= 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                    {value >= 0 ? '+' : ''}{value}%
                  </span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${value >= 0 ? 'bg-slate-500' : 'bg-slate-600'}`}
                    style={{ width: `${(Math.abs(value) / maxFactor) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Historical Context */}
        <div className="bg-slate-900/50 border border-slate-800 rounded p-3">
          <h4 className="text-xs text-slate-500 mb-2">Historical Context</h4>
          <p className="text-xs text-slate-400">
            When this signal exceeded 75 for 6+ weeks, robotics outperformed S&P 500 by 
            avg 12% over following 12 months (n=4 since 2020).
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs py-2 rounded transition-colors">
            Set Alert
          </button>
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs py-2 rounded transition-colors">
            Add to Report
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FOLLOWED TICKER HISTORY DRAWER
// ============================================================================

const TickerHistoryDrawer = ({ ticker, onClose, historyByRange }) => {
  const [range, setRange] = useState('30d');

  if (!ticker) return null;

  const rangeOptions = [
    { id: '30d', label: '30D' },
    { id: '180d', label: '6M' },
  ];

  const series = historyByRange?.[range]?.[ticker] || [];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-300">{ticker} history</h3>
          <p className="text-xs text-slate-500">Multi-range price history</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          {rangeOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setRange(option.id)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                range === option.id
                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                  : 'text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="h-56 bg-slate-900/40 border border-slate-800 rounded p-2">
          {series.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="price" stroke="#e2e8f0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              History unavailable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// WATCHLIST SIDEBAR
// ============================================================================

const WatchlistSidebar = ({ watchlist, setWatchlist, alerts, setAlerts, companies }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const unreadAlerts = alerts.filter(a => !a.read).length;
  
  const toggleWatchlist = (ticker) => {
    setWatchlist(prev => 
      prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]
    );
  };
  
  const markAlertRead = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };
  
  return (
    <div className={`bg-slate-950 border-r border-slate-800 transition-all ${isExpanded ? 'w-56' : 'w-10'}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-slate-500 hover:text-slate-300 border-b border-slate-800"
      >
        {isExpanded ? (
          <>
            <span className="text-xs text-slate-400 uppercase tracking-wide">Workspace</span>
            <ChevronDown size={14} />
          </>
        ) : (
          <Layers size={14} className="mx-auto" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-3 space-y-4">
          {/* Alerts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 uppercase tracking-wide">Alerts</span>
              {unreadAlerts > 0 && (
                <span className="text-xs text-slate-400">{unreadAlerts}</span>
              )}
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {alerts.slice(0, 4).map(alert => (
                <button
                  key={alert.id}
                  onClick={() => markAlertRead(alert.id)}
                  className={`w-full text-left p-2 rounded text-xs transition-colors ${
                    alert.read ? 'bg-slate-900/30' : 'bg-slate-900/50'
                  } hover:bg-slate-900`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 ${
                      alert.priority === 'critical' ? 'text-red-500' : 
                      alert.priority === 'high' ? 'text-amber-500' : 'text-slate-600'
                    }`}>•</span>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate ${alert.read ? 'text-slate-500' : 'text-slate-300'}`}>
                        {alert.title}
                      </p>
                      <p className="text-slate-600 text-xs">{alert.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Watchlist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 uppercase tracking-wide">Watchlist</span>
              <span className="text-xs text-slate-600">{watchlist.length}</span>
            </div>
            {watchlist.length === 0 ? (
              <p className="text-slate-600 text-xs">Star companies to track</p>
            ) : (
              <div className="space-y-1">
                {watchlist.map(ticker => {
                  const company = companies.find(c => c.ticker === ticker);
                  if (!company) return null;
                  return (
                    <div key={ticker} className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 text-xs font-mono">{ticker}</span>
                        <MomentumBadge value={company.momentum} size="sm" />
                      </div>
                      <button 
                        onClick={() => toggleWatchlist(ticker)}
                        className="text-amber-600 hover:text-amber-500"
                      >
                        <Star size={10} fill="currentColor" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <button className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-slate-400 p-2 rounded hover:bg-slate-900/50 transition-colors">
              <Download size={12} /> Export
            </button>
            <button className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-slate-400 p-2 rounded hover:bg-slate-900/50 transition-colors">
              <Plus size={12} /> New Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function RoboticsDashboard() {
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState(['sp500']);
  const [watchlist, setWatchlist] = useState(['NVDA', 'SYM']);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [liveMarketData, setLiveMarketData] = useState({
    status: 'idle',
    updatedAt: null,
    assets: [],
    error: null,
  });
  const [liveHeadlines, setLiveHeadlines] = useState({
    status: 'idle',
    updatedAt: null,
    items: [],
    error: null,
  });

  useEffect(() => {
    let isActive = true;
    const fetchLiveData = async () => {
      setLiveMarketData(prev => ({ ...prev, status: 'loading', error: null }));
      setLiveHeadlines(prev => ({ ...prev, status: 'loading', error: null }));

      const symbols = ['NVDA', 'ISRG', 'ABB', 'ROK', 'FANUY', 'SYM'];

      // Fetch News (CORS Friendly Algolia API)
      fetch('https://hn.algolia.com/api/v1/search_by_date?query=robotics&tags=story')
        .then(res => res.json())
        .then(newsData => {
          if (!isActive) return;
          const formattedNews = (newsData.hits || [])
            .filter(item => item.title)
            .slice(0, 6)
            .map(item => ({
              id: item.objectID,
              title: item.title,
              url: item.url || item.story_url || `https://news.ycombinator.com/item?id=${item.objectID}`,
              createdAt: item.created_at,
              author: item.author,
            }));
          setLiveHeadlines({
            status: 'ready',
            updatedAt: new Date().toISOString(),
            items: formattedNews,
            error: null,
          });
        })
        .catch(error => {
          if (!isActive) return;
          setLiveHeadlines(prev => ({
            ...prev,
            status: 'error',
            error: 'Unable to load live news',
          }));
        });

      // Fetch Market Data (Requires CORS proxy since YF blocks browser requests)
      const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
      
      fetch(proxyUrl)
        .then(res => {
          if (!res.ok) throw new Error('Proxy failed');
          return res.json();
        })
        .then(marketData => {
          if (!isActive) return;
          const quoteResults = marketData?.quoteResponse?.result ?? [];
          if (!quoteResults.length) throw new Error('No data');

          const formattedAssets = quoteResults.map(quote => ({
            id: quote.symbol,
            name: quote.shortName || quote.longName || quote.symbol,
            symbol: quote.symbol,
            price: quote.regularMarketPrice ?? quote.postMarketPrice ?? quote.preMarketPrice,
            change: quote.regularMarketChangePercent ?? quote.postMarketChangePercent ?? quote.preMarketChangePercent,
            marketCap: quote.marketCap,
            image: null,
            timestamp: quote.regularMarketTime ?? quote.postMarketTime ?? quote.preMarketTime,
          }));

          const latestTimestamp = formattedAssets
            .map(asset => (asset.timestamp ? asset.timestamp * 1000 : 0))
            .reduce((max, value) => Math.max(max, value), 0);

          setLiveMarketData({
            status: 'ready',
            updatedAt: latestTimestamp ? new Date(latestTimestamp).toISOString() : new Date().toISOString(),
            assets: formattedAssets.map(({ timestamp, ...asset }) => asset),
            error: null,
          });
        })
        .catch(error => {
          if (!isActive) return;
          setLiveMarketData(prev => ({
            ...prev,
            status: 'error',
            error: 'Unable to load live market data',
          }));
        });
    };

    fetchLiveData();

    return () => {
      isActive = false;
    };
  }, []);
  
  // Cross-filtering logic
  const filteredCompanies = useMemo(() => {
    if (!selectedSegment) return companies;
    return companies.filter(c => c.segments.includes(selectedSegment));
  }, [selectedSegment]);

  const historyByRange = useMemo(() => ({
    '30d': tickerHistory30d,
    '180d': tickerHistory180d,
  }), []);

  const followedTickers = useMemo(() => (
    watchlist
      .map(ticker => {
        const company = companies.find(c => c.ticker === ticker);
        const history = historyByRange['30d'][ticker] || [];
        const latestPrice = history[history.length - 1]?.price ?? null;
        const lookback30d = history.length > 1 ? Math.min(29, history.length - 1) : 0;
        return {
          ticker,
          name: company?.name ?? ticker,
          latestPrice,
          change1d: getPercentChange(history, 1),
          change7d: getPercentChange(history, 7),
          change30d: getPercentChange(history, lookback30d),
          sparkline: history,
        };
      })
  ), [historyByRange, watchlist]);
  
  const filteredComponents = useMemo(() => {
    if (!selectedSegment) return supplyChainComponents;
    const segment = segments.find(s => s.id === selectedSegment);
    if (!segment) return supplyChainComponents;
    return supplyChainComponents.filter(c => segment.components.includes(c.name));
  }, [selectedSegment]);
  
  // Thesis health calculation
  const thesisHealth = useMemo(() => {
    const avgMomentum = leadingIndicators.reduce((sum, i) => sum + i.value, 0) / leadingIndicators.length;
    const positiveChanges = leadingIndicators.filter(i => i.change > 0).length;
    const breadth = positiveChanges / leadingIndicators.length;
    return {
      score: Math.round(avgMomentum * 0.6 + breadth * 100 * 0.4),
      status: avgMomentum >= 75 && breadth >= 0.6 ? 'Strong' : avgMomentum >= 60 ? 'Moderate' : 'Weak',
      breadth: Math.round(breadth * 100),
    };
  }, []);
  
  // Benchmark comparison data
  const benchmarkOptions = [
    { id: 'sp500', name: 'S&P 500', color: '#3b82f6' },
    { id: 'nasdaq', name: 'NASDAQ', color: '#10b981' },
    { id: 'soxx', name: 'SOXX (Semis)', color: '#f59e0b' },
    { id: 'industrials', name: 'Industrials', color: '#ec4899' },
  ];
  
  const toggleBenchmark = (id) => {
    setSelectedBenchmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'signals', label: 'Signals', icon: Activity },
    { id: 'supply', label: 'Supply Chain', icon: GitBranch },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'events', label: 'Events & Alerts', icon: Bell },
  ];
  
  // Get current date for fallback display
  const currentDateFormatted = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const liveAsOf = liveMarketData.updatedAt ? formatLiveTimestamp(liveMarketData.updatedAt) : currentDateFormatted;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Left Sidebar - Watchlist & Alerts */}
      <WatchlistSidebar 
        watchlist={watchlist} 
        setWatchlist={setWatchlist}
        alerts={alerts}
        setAlerts={setAlerts}
        companies={companies}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-lg font-medium text-slate-200">Robotics Sector Monitor</h1>
              <p className="text-slate-500 text-xs mt-0.5">Investment signals · Live as of {liveAsOf}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Segment Filter */}
              <div className="flex items-center gap-2">
                <select 
                  value={selectedSegment || ''}
                  onChange={(e) => setSelectedSegment(e.target.value || null)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                >
                  <option value="">All Segments</option>
                  {segments.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Compare Mode Toggle */}
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  compareMode ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <BarChart3 size={14} />
                Compare
              </button>
              
              {/* Focus Mode */}
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`p-2 rounded transition-colors ${
                  focusMode ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Focus mode"
              >
                {focusMode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          {/* Thesis Health - Compact KPI Row */}
          <div className="flex items-center gap-6 py-3 px-4 bg-slate-900/50 border border-slate-800 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Thesis</span>
              <span className={`text-lg font-mono tabular-nums ${
                thesisHealth.status === 'Strong' ? 'text-emerald-500' :
                thesisHealth.status === 'Moderate' ? 'text-amber-500' : 'text-red-500'
              }`}>{thesisHealth.score}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Breadth</span>
              <span className="text-sm font-mono text-slate-300">{thesisHealth.breadth}%</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Regime</span>
              <span className="text-sm text-slate-300">Leadership</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-xs text-slate-500 flex-1">
              {thesisHealth.status === 'Strong' 
                ? 'Signals suggest broad-based strength versus selected benchmarks. Review thesis, sizing, and risk limits.'
                : 'Monitoring for confirmation of sustained outperformance vs benchmarks.'}
            </span>
          </div>
          
          {/* Selected Segment Indicator */}
          {selectedSegment && (
            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="text-slate-600">Filter:</span>
              <span className="text-slate-400">
                {segments.find(s => s.id === selectedSegment)?.name}
              </span>
              <button onClick={() => setSelectedSegment(null)} className="text-slate-600 hover:text-slate-400">
                <X size={12} />
              </button>
            </div>
          )}
          
          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-1 border-b border-slate-800 mb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id 
                    ? 'border-slate-400 text-slate-200' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Chart with Compare Mode */}
            <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-300">Relative Performance (indexed to 100)</h3>
                  <InfoButton dataKey="marketIndices" />
                </div>
                
                {/* Benchmark Toggles */}
                <div className="flex items-center gap-2">
                  {benchmarkOptions.map(b => (
                    <button
                      key={b.id}
                      onClick={() => toggleBenchmark(b.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        selectedBenchmarks.includes(b.id) 
                          ? 'bg-slate-800 text-slate-300' 
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={focusMode ? 450 : 300}>
                <AreaChart data={fullMarketPerformanceData}>
                  <defs>
                    <linearGradient id="roboticsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={100} stroke="#334155" strokeDasharray="5 5" />
                  
                  <Area 
                    type="monotone" 
                    dataKey="robotics" 
                    stroke="#e2e8f0" 
                    strokeWidth={2} 
                    fill="url(#roboticsGrad)" 
                    name="Robotics" 
                  />
                  
                  {selectedBenchmarks.includes('sp500') && (
                    <Line type="monotone" dataKey="sp500" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="S&P 500" />
                  )}
                  {selectedBenchmarks.includes('nasdaq') && (
                    <Line type="monotone" dataKey="nasdaq" stroke="#10b981" strokeWidth={1.5} dot={false} name="NASDAQ" />
                  )}
                  {selectedBenchmarks.includes('soxx') && (
                    <Line type="monotone" dataKey="soxx" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="SOXX" />
                  )}
                  {selectedBenchmarks.includes('industrials') && (
                    <Line type="monotone" dataKey="industrials" stroke="#ec4899" strokeWidth={1.5} dot={false} name="Industrials" />
                  )}
                  
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Outperformance Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800">
                <div>
                  <div className="text-xs text-slate-600">vs S&P 500</div>
                  <div className="text-sm font-mono text-emerald-500">+54%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">vs NASDAQ</div>
                  <div className="text-sm font-mono text-emerald-500">+41%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">vs Industrials</div>
                  <div className="text-sm font-mono text-emerald-500">+65%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Sharpe</div>
                  <div className="text-sm font-mono text-slate-300">1.82</div>
                </div>
              </div>
            </div>

            {/* Live Market Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-300">Live Market Pulse</h3>
                    <InfoButton dataKey="livePulse" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <RefreshCw
                      size={12}
                      className={liveMarketData.status === 'loading' ? 'animate-spin' : ''}
                    />
                    <span>
                      {liveMarketData.status === 'ready' && liveMarketData.updatedAt
                        ? `Updated ${formatLiveTimestamp(liveMarketData.updatedAt)}`
                        : liveMarketData.status === 'loading'
                          ? 'Updating live feed'
                          : 'Live feed unavailable'}
                    </span>
                  </div>
                </div>

                {liveMarketData.assets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="text-xs text-slate-500 border-b border-slate-800">
                        <tr>
                          <th className="text-left pb-2 font-medium">Asset</th>
                          <th className="text-right pb-2 font-medium">Price</th>
                          <th className="text-right pb-2 font-medium">% Change</th>
                          <th className="text-right pb-2 font-medium">Market Cap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {liveMarketData.assets.map(asset => (
                          <tr key={asset.id} className="text-sm text-slate-300">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                {asset.image && (
                                  <img src={asset.image} alt="" className="w-4 h-4 rounded-full" />
                                )}
                                <div>
                                  <div className="text-slate-300">{asset.name}</div>
                                  <div className="text-xs text-slate-500">{asset.symbol}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 text-right font-mono text-slate-300">
                              {formatCurrency(asset.price)}
                            </td>
                            <td className="py-2 text-right">
                              {Number.isFinite(asset.change) ? (
                                <TrendIndicator value={Number(asset.change.toFixed(2))} />
                              ) : (
                                <span className="text-xs text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-2 text-right text-xs text-slate-500 font-mono">
                              {formatCompactNumber(asset.marketCap)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    {liveMarketData.status === 'loading'
                      ? 'Loading live market data…'
                      : 'Live market data is temporarily unavailable.'}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-300">Live News Pulse</h3>
                    <InfoButton dataKey="liveNews" />
                  </div>
                  <div className="text-xs text-slate-500">
                    {liveHeadlines.updatedAt ? `Updated ${formatLiveTimestamp(liveHeadlines.updatedAt)}` : '—'}
                  </div>
                </div>

                {liveHeadlines.items.length > 0 ? (
                  <div className="space-y-3">
                    {liveHeadlines.items.slice(0, 4).map(item => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-slate-300">{item.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {item.author} · {formatLiveTimestamp(item.createdAt)}
                            </p>
                          </div>
                          <ExternalLink size={12} className="text-slate-600" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    {liveHeadlines.status === 'loading'
                      ? 'Loading live headlines…'
                      : 'Live headlines are temporarily unavailable.'}
                  </p>
                )}
              </div>
            </div>

            {/* Followed Tickers */}
            <div className="bg-slate-900/50 border border-slate-800 rounded overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-300">Followed Tickers</h3>
                  <InfoButton dataKey="companyFinancials" />
                </div>
                <span className="text-xs text-slate-500">{followedTickers.length} tracked</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="text-left p-3 text-slate-500 text-xs font-medium">Ticker</th>
                      <th className="text-right p-3 text-slate-500 text-xs font-medium">Last</th>
                      <th className="text-right p-3 text-slate-500 text-xs font-medium">1D</th>
                      <th className="text-right p-3 text-slate-500 text-xs font-medium">7D</th>
                      <th className="text-right p-3 text-slate-500 text-xs font-medium">30D</th>
                      <th className="text-center p-3 text-slate-500 text-xs font-medium">30D Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {followedTickers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-xs text-slate-500 text-center">
                          Star companies to track in your watchlist.
                        </td>
                      </tr>
                    ) : (
                      followedTickers.map(ticker => (
                        <tr
                          key={ticker.ticker}
                          className="hover:bg-slate-900/50 cursor-pointer"
                          onClick={() => setSelectedTicker(ticker.ticker)}
                        >
                          <td className="p-3">
                            <div className="text-slate-300 text-sm">{ticker.ticker}</div>
                            <div className="text-xs text-slate-600">{ticker.name}</div>
                          </td>
                          <td className="p-3 text-right text-sm text-slate-400 font-mono">
                            {ticker.latestPrice ? formatCurrency(ticker.latestPrice) : '—'}
                          </td>
                          <td className="p-3 text-right">
                            {ticker.change1d === null ? (
                              <span className="text-xs text-slate-500">—</span>
                            ) : (
                              <TrendIndicator value={ticker.change1d} />
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {ticker.change7d === null ? (
                              <span className="text-xs text-slate-500">—</span>
                            ) : (
                              <TrendIndicator value={ticker.change7d} />
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {ticker.change30d === null ? (
                              <span className="text-xs text-slate-500">—</span>
                            ) : (
                              <TrendIndicator value={ticker.change30d} />
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {ticker.sparkline.length ? (
                              <Sparkline data={ticker.sparkline} />
                            ) : (
                              <span className="text-xs text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {!focusMode && (
              <>
                {/* Segment Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {segments.map(segment => (
                    <button
                      key={segment.id}
                      onClick={() => setSelectedSegment(selectedSegment === segment.id ? null : segment.id)}
                      className={`p-3 rounded border transition-colors text-left ${
                        selectedSegment === segment.id 
                          ? 'border-slate-500 bg-slate-800/50' 
                          : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: segment.color }} />
                        <MomentumBadge value={segment.momentum} size="sm" />
                      </div>
                      <div className="text-sm text-slate-300 truncate">{segment.name}</div>
                      <div className="text-xs text-slate-600">${segment.marketSize}B</div>
                      <TrendIndicator value={segment.growth} />
                    </button>
                  ))}
                </div>
                
                {/* Leading Indicators Summary */}
                <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-300">Leading Indicators</h3>
                    <InfoButton dataKey="leadingIndicators" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {leadingIndicators.map(indicator => (
                      <button
                        key={indicator.name}
                        onClick={() => setSelectedSignal(indicator)}
                        className="text-left p-2 bg-slate-900/30 rounded border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="text-xs text-slate-500 mb-1 truncate">{indicator.name}</div>
                        <div className="flex items-center gap-2">
                          <MomentumBadge value={indicator.value} size="sm" onClick={() => setSelectedSignal(indicator)} />
                          <TrendIndicator value={indicator.change} suffix="" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* SIGNALS TAB */}
        {activeTab === 'signals' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {leadingIndicators.map(indicator => (
                <div 
                  key={indicator.name}
                  className="bg-slate-900/50 border border-slate-800 rounded p-4 cursor-pointer hover:border-slate-700 transition-colors"
                  onClick={() => setSelectedSignal(indicator)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm text-slate-300">{indicator.name}</h4>
                    <MomentumBadge value={indicator.value} onClick={() => setSelectedSignal(indicator)} />
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{indicator.description}</p>
                  
                  {/* Mini factor bars */}
                  <div className="space-y-2">
                    {Object.entries(indicator.factors).slice(0, 3).map(([factor, value]) => (
                      <div key={factor} className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 w-20 capitalize">{factor}</span>
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${value >= 0 ? 'bg-slate-500' : 'bg-slate-600'}`}
                            style={{ width: `${Math.min(Math.abs(value) * 2, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono ${value >= 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                          {value >= 0 ? '+' : ''}{value}%
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="mt-3 text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1">
                    View decomposition <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUPPLY CHAIN TAB */}
        {activeTab === 'supply' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-300">Component Dependencies</h3>
                  <InfoButton dataKey="supplyChain" />
                </div>
                {selectedSegment && (
                  <span className="text-xs text-slate-500">
                    Filtered: {segments.find(s => s.id === selectedSegment)?.name}
                  </span>
>>>>>>> origin/main
                )}
              </button>
            ))}
          </div>
          <div className="nav-section" style={{ marginTop: 24 }}>
            <div className="nav-section-title">Watchlist</div>
            {watchlist.map(tk => {
              const d = ALL_TICKERS[tk];
              if (!d) return null;
              return (
                <button key={tk} className="nav-item" onClick={() => toggleWl(tk)} style={{ fontSize: 12 }}>
                  <Star size={10} style={{ color: '#f59e0b' }} />
                  {tk}
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-quaternary)' }}>
                    {d.p}{d.c === 'JPY' ? '' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* HEADER */}
      <header className="app-header">
        <h1>
          {tab === 'overview' && 'Overview'}
          {tab === 'thesis' && 'Thesis'}
          {tab === 'valuechain' && 'Value Chain'}
          {tab === 'signals' && 'Signals'}
        </h1>
        <div className="header-actions">
          <span className="header-time">Updated {timeStr}</span>
          <button className="tab-btn" onClick={() => setShowAlerts(!showAlerts)} style={{ padding: '3px 8px' }}>
            <Bell size={14} />
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
            {/* KPI Cards */}
            <div className="grid-4" style={{ marginBottom: 16 }}>
              {[{ l: 'Layer Score', v: '4.2/5', sub: 'Composite' },
                { l: 'Tickers Tracked', v: Object.keys(ALL_TICKERS).length, sub: 'Across 4 layers' },
                { l: 'Avg Rebound', v: Math.round(Object.values(ALL_TICKERS).reduce((s, t) => s + t.rb, 0) / Object.keys(ALL_TICKERS).length) + '%', sub: 'From 52w low' },
                { l: 'Watchlist', v: watchlist.length, sub: 'Selected positions' },
              ].map(kpi => (
                <div key={kpi.l} className="card">
                  <div className="card-title">{kpi.l}</div>
                  <div className="card-value">{kpi.v}</div>
                  <div className="card-label">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Market Chart */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Robotics Index vs Benchmarks (Normalized)</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={MARKET}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="m" tick={{ fill: '#62666d', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#62666d', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#191a1b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }} />
                  <Line type="monotone" dataKey="r" stroke="#7170ff" strokeWidth={2} dot={false} name="Robotics Index" />
                  <Line type="monotone" dataKey="sp" stroke="#8a8f98" strokeWidth={1.5} dot={false} name="S&P 500" />
                  <Line type="monotone" dataKey="nd" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="NASDAQ" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Segments + Momentum */}
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
                    const d = ALL_TICKERS[tk];
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
                            const d = ALL_TICKERS[tk];
                            if (!d) return null;
                            const isUp = d.ch >= 0;
                            return (
                              <div key={tk} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <span style={{ fontWeight: 500, width: 50 }}>{tk}</span>
                                <span style={{ flex: 1, color: 'var(--text-tertiary)' }}>{d.n}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-quaternary)' }}>{d.p}{d.c === 'JPY' ? '' : ''}</span>
                                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: isUp ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>
                                  {isUp ? '+' : ''}{d.ch}%
                                </span>
                                <span style={{ fontSize: 10, color: 'var(--text-quaternary)' }}>rb: {d.rb}%</span>
                                <span style={{ fontSize: 10, color: 'var(--text-quaternary)' }}>ex: {d.ex}%</span>
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

<<<<<<< HEAD
        {/* TAB: VALUE CHAIN */}
        {tab === 'valuechain' && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Full Ticker Universe — 4-Layer Humanoid Robotics Value Chain</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Name</th>
                    <th>Layer</th>
                    <th>Price</th>
                    <th>6M Chg</th>
                    <th>Rebound</th>
                    <th>Exposure</th>
                    <th>Tier</th>
                    <th>Segment</th>
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
                          const d = ALL_TICKERS[tk];
                          if (!d) return null;
                          const isUp = d.ch >= 0;
                          return (
                            <tr key={tk}>
                              <td style={{ fontWeight: 500 }}>{tk}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{d.n}</td>
                              <td><LayerBadge id={d.l} /></td>
                              <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{d.p}{d.c === 'USD' ? '' : ' ' + d.c}</td>
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
=======
        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-slate-800 text-center">
          <p className="text-slate-600 text-xs">
            Company data: Yahoo Finance (Dec 18) · Live pulse: Yahoo Finance quotes + Hacker News ·
            Indices & signals: Synthetic · Not investment advice
          </p>
        </div>
      </div>
      
      {/* Signal Decomposition Drawer */}
      {selectedSignal && (
        <SignalDrawer signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
      )}

      {selectedTicker && (
        <TickerHistoryDrawer
          ticker={selectedTicker}
          onClose={() => setSelectedTicker(null)}
          historyByRange={historyByRange}
        />
      )}
>>>>>>> origin/main
    </div>
  );
}