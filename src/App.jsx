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

// ============================================================================
// DATA LAYER - All data with provenance metadata
// ============================================================================

const DATA_SOURCES = dataSources;

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const InfoButton = ({ dataKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const source = DATA_SOURCES[dataKey];
  
  if (!source) return null;
  
  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-600 hover:text-slate-400 transition-colors ml-1"
      >
        <Info size={11} />
      </button>
      {isOpen && (
        <div className="absolute z-50 right-0 top-5 w-64 bg-slate-900 border border-slate-800 rounded p-3 shadow-xl text-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 uppercase tracking-wide text-xs">Data Source</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300">
              <X size={10} />
            </button>
          </div>
          <div className="space-y-1.5 text-slate-500">
            <div><span className="text-slate-600">Source:</span> {source.source}</div>
            <div><span className="text-slate-600">As of:</span> {source.asOf}</div>
            <div><span className="text-slate-600">Def:</span> {source.definition}</div>
          </div>
          <button className="mt-2 text-slate-500 hover:text-slate-400 text-xs">Copy citation</button>
        </div>
      )}
    </div>
  );
};

const MomentumBadge = ({ value, size = 'md', onClick }) => {
  const getColor = (v) => {
    if (v >= 85) return 'text-emerald-500';
    if (v >= 70) return 'text-slate-300';
    if (v >= 50) return 'text-amber-500';
    return 'text-red-500';
  };
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm';
  
  return (
    <span 
      onClick={onClick}
      className={`${getColor(value)} ${sizeClass} font-mono tabular-nums ${onClick ? 'cursor-pointer hover:underline' : ''}`}
    >
      {value}
    </span>
  );
};

const TrendIndicator = ({ value, suffix = '%' }) => {
  if (value > 0) return <span className="text-emerald-600 flex items-center gap-0.5 text-xs font-mono"><ArrowUpRight size={10} />+{value}{suffix}</span>;
  if (value < 0) return <span className="text-red-600 flex items-center gap-0.5 text-xs font-mono"><ArrowDownRight size={10} />{value}{suffix}</span>;
  return <span className="text-slate-500 flex items-center gap-0.5 text-xs font-mono"><Minus size={10} />{value}{suffix}</span>;
};

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
  }
  return null;
};

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

      try {
        const symbols = ['NVDA', 'ISRG', 'ABB', 'ROK', 'FANUY', 'SYM'];
        const [marketResponse, newsResponse] = await Promise.all([
          fetch(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`
          ),
          fetch('https://hn.algolia.com/api/v1/search_by_date?query=robotics&tags=story'),
        ]);

        if (!marketResponse.ok) {
          throw new Error('Market feed unavailable');
        }
        if (!newsResponse.ok) {
          throw new Error('News feed unavailable');
        }

        const marketData = await marketResponse.json();
        const newsData = await newsResponse.json();

        if (!isActive) return;

        const quoteResults = marketData?.quoteResponse?.result ?? [];

        if (!quoteResults.length) {
          throw new Error('Market feed unavailable');
        }

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

        setLiveMarketData({
          status: 'ready',
          updatedAt: latestTimestamp ? new Date(latestTimestamp).toISOString() : new Date().toISOString(),
          assets: formattedAssets.map(({ timestamp, ...asset }) => asset),
          error: null,
        });
        setLiveHeadlines({
          status: 'ready',
          updatedAt: new Date().toISOString(),
          items: formattedNews,
          error: null,
        });
      } catch (error) {
        if (!isActive) return;
        setLiveMarketData(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unable to load live market data',
        }));
        setLiveHeadlines(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unable to load live news',
        }));
      }
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
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="text-left p-3 text-slate-500 text-xs font-medium">Component</th>
                      <th className="text-left p-3 text-slate-500 text-xs font-medium">Region</th>
                      <th className="text-center p-3 text-slate-500 text-xs font-medium">Concentration</th>
                      <th className="text-center p-3 text-slate-500 text-xs font-medium">Lead Time</th>
                      <th className="text-center p-3 text-slate-500 text-xs font-medium">Criticality</th>
                      <th className="text-center p-3 text-slate-500 text-xs font-medium">Price Δ</th>
                      <th className="text-center p-3 text-slate-500 text-xs font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredComponents.map(component => (
                      <tr key={component.id} className="hover:bg-slate-900/50">
                        <td className="p-3">
                          <span className="text-slate-300 text-sm">{component.name}</span>
                          <div className="text-xs text-slate-600">{component.suppliers.slice(0, 2).join(', ')}</div>
                        </td>
                        <td className="p-3 text-xs text-slate-500">{component.region}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${component.concentration > 80 ? 'bg-amber-600' : component.concentration > 60 ? 'bg-slate-500' : 'bg-slate-600'}`}
                                style={{ width: `${component.concentration}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 font-mono">{component.concentration}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs font-mono ${component.leadTime > 15 ? 'text-amber-500' : 'text-slate-500'}`}>
                            {component.leadTime}w
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <MomentumBadge value={component.criticality} size="sm" />
                        </td>
                        <td className="p-3 text-center">
                          <TrendIndicator value={component.priceChange} />
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs ${
                            component.shortage === 'Critical' ? 'text-red-500' :
                            component.shortage === 'Medium' ? 'text-amber-500' :
                            'text-slate-500'
                          }`}>
                            {component.shortage}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Chokepoint Note */}
            <div className="bg-slate-900/30 border-l-2 border-amber-600 rounded-r p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-amber-600 mt-0.5" size={14} />
                <div>
                  <span className="text-xs text-slate-300">Harmonic Drives:</span>
                  <span className="text-xs text-slate-500 ml-1">
                    89% concentration, 22w lead time, Japan single-source risk. May constrain humanoid scaling.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPANIES TAB */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-300">Company Screener</h3>
                  <InfoButton dataKey="companyFinancials" />
                </div>
                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400">
                  <Download size={12} /> CSV
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="text-left p-3 text-slate-500 text-xs font-medium w-8"></th>
                      <th className="text-left p-3 text-slate-500 text-xs font-medium">Company</th>
                      <th className="text-right p-3 text-slate-500 text-xs font-medium">Mkt Cap</th>
                      <th className="text-right p-3 text-slate-500 text-xs font-medium">Rev</th>
                      <th className="text-right p-3 text-slate-500 text-xs font-medium">Growth</th>
                      <th className="text-center p-3 text-slate-500 text-xs font-medium">Exposure</th>
                      <th className="text-center p-3 text-slate-500 text-xs font-medium">Mom</th>
                      <th className="text-center p-3 text-slate-500 text-xs font-medium">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredCompanies.map(company => (
                      <tr key={company.ticker} className="hover:bg-slate-900/50">
                        <td className="p-3">
                          <button 
                            onClick={() => setWatchlist(prev => 
                              prev.includes(company.ticker) 
                                ? prev.filter(t => t !== company.ticker) 
                                : [...prev, company.ticker]
                            )}
                            className={watchlist.includes(company.ticker) ? 'text-amber-500' : 'text-slate-700 hover:text-slate-500'}
                          >
                            <Star size={12} fill={watchlist.includes(company.ticker) ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-300 text-sm">{company.name}</div>
                          <div className="text-xs text-slate-600">{company.ticker}</div>
                        </td>
                        <td className="p-3 text-right text-sm text-slate-400 font-mono">
                          {company.marketCap >= 1000 ? `${(company.marketCap / 1000).toFixed(1)}T` : `${company.marketCap}B`}
                        </td>
                        <td className="p-3 text-right text-sm text-slate-500 font-mono">{company.revenue}B</td>
                        <td className="p-3 text-right">
                          <TrendIndicator value={company.revenueGrowth} />
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-500 rounded-full" style={{ width: `${company.exposure}%` }} />
                            </div>
                            <span className="text-xs text-slate-600 font-mono">{company.exposure}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <MomentumBadge value={company.momentum} size="sm" />
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs ${
                            company.tier === 'Core' ? 'text-slate-300' :
                            company.tier === 'Satellite' ? 'text-slate-500' :
                            'text-slate-600'
                          }`}>
                            {company.tier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Alerts */}
              <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Recent Alerts</h3>
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-3 rounded border ${
                        alert.read ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-900/50 border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs ${
                              alert.priority === 'critical' ? 'text-red-500' :
                              alert.priority === 'high' ? 'text-amber-500' :
                              'text-slate-500'
                            }`}>
                              {alert.priority}
                            </span>
                            <span className="text-xs text-slate-600">{alert.time}</span>
                          </div>
                          <p className="text-sm text-slate-300">{alert.title}</p>
                        </div>
                        {!alert.read && <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Create Alert */}
              <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Create Alert</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Type</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300">
                      <option>Signal crosses threshold</option>
                      <option>Price movement</option>
                      <option>Earnings date</option>
                      <option>Supply chain change</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Condition</label>
                    <div className="flex gap-2">
                      <select className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300">
                        <option>Humanoid Momentum</option>
                        <option>Patent Momentum</option>
                        <option>Hiring Velocity</option>
                      </select>
                      <select className="w-20 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300">
                        <option>&gt;</option>
                        <option>&lt;</option>
                      </select>
                      <input type="number" placeholder="75" className="w-16 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300" />
                    </div>
                  </div>
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-sm transition-colors">
                    Create Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}
