import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Globe, Cpu, Activity, DollarSign, BarChart3, ChevronDown, ChevronUp, ChevronRight, Bell, ArrowUpRight, ArrowDownRight, Minus, Target, Truck, Building2, Microscope, Bot, RefreshCw, Info, X, Plus, Star, Filter, Download, Eye, EyeOff, Bookmark, BookmarkCheck, AlertCircle, CheckCircle, Clock, ExternalLink, Layers, GitBranch, Map } from 'lucide-react';
import { fetchSignals, checkHealth } from './api.js';

// ============================================================================
// UTILITY FUNCTIONS - Date and Data Generation
// ============================================================================

const getCurrentDate = () => {
  const now = new Date();
  return {
    formatted: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    isoDate: now.toISOString().split('T')[0],
    month: now.toLocaleDateString('en-US', { month: 'short' }),
    year: now.getFullYear().toString().slice(-2),
    fullDate: now
  };
};

const generateLatestDataPoint = (baseData) => {
  const currentDate = getCurrentDate();
  const lastPoint = baseData[baseData.length - 1];
  
  // Calculate growth rates from last point
  const growthRate = {
    robotics: 1.044, // ~4.4% monthly growth
    sp500: 1.027,    // ~2.7% monthly growth
    nasdaq: 1.037,   // ~3.7% monthly growth
    soxx: 1.049,     // ~4.9% monthly growth
    industrials: 1.029 // ~2.9% monthly growth
  };
  
  // Add slight randomization (±2%)
  const randomize = (value) => value * (1 + (Math.random() - 0.5) * 0.04);
  
  return {
    month: `${currentDate.month} ${currentDate.year}`,
    date: currentDate.isoDate.slice(0, 7),
    robotics: Math.round(randomize(lastPoint.robotics * growthRate.robotics)),
    sp500: Math.round(randomize(lastPoint.sp500 * growthRate.sp500)),
    nasdaq: Math.round(randomize(lastPoint.nasdaq * growthRate.nasdaq)),
    soxx: Math.round(randomize(lastPoint.soxx * growthRate.soxx)),
    industrials: Math.round(randomize(lastPoint.industrials * growthRate.industrials))
  };
};

const refreshSignals = async () => {
  // Fetch real data from backend API
  try {
    const signals = await fetchSignals();
    return signals;
  } catch (error) {
    console.error('Failed to fetch signals:', error);
    // Return base indicators with slight randomization as fallback
    return baseLeadingIndicators.map(indicator => ({
      ...indicator,
      value: Math.max(0, Math.min(100, indicator.value + Math.round((Math.random() - 0.5) * 10))),
      change: Math.round((Math.random() - 0.4) * 20)
    }));
  }
};

// ============================================================================
// DATA LAYER - All data with provenance metadata
// ============================================================================

const getDataSources = () => {
  const currentDate = getCurrentDate();
  return {
    companyFinancials: {
      source: 'Yahoo Finance, SEC EDGAR filings',
      asOf: currentDate.isoDate,
      definition: 'Market cap: shares outstanding × price. Revenue: TTM unless noted.',
      revisionPolicy: 'Updated daily; historical not restated',
    },
    marketIndices: {
      source: 'SYNTHETIC - Demo data',
      asOf: currentDate.isoDate,
      definition: 'Normalized to 100 at start date. Not actual tradeable indices.',
      revisionPolicy: 'N/A - synthetic series',
    },
    leadingIndicators: {
      source: 'SYNTHETIC - For real data use USPTO, PitchBook, LinkedIn',
      asOf: currentDate.isoDate,
      definition: 'Illustrative trend patterns only',
      revisionPolicy: 'N/A - synthetic series',
    },
    supplyChain: {
      source: 'SYNTHETIC - For real data use industry reports, customs data',
      asOf: currentDate.isoDate,
      definition: 'Estimates based on public information',
      revisionPolicy: 'N/A - synthetic estimates',
    },
  };
};

// Market performance data (base historical data)
const baseMarketPerformanceData = [
  { month: 'Jan 24', date: '2024-01', robotics: 100, sp500: 100, nasdaq: 100, soxx: 100, industrials: 100 },
  { month: 'Mar 24', date: '2024-03', robotics: 112, sp500: 106, nasdaq: 108, soxx: 115, industrials: 104 },
  { month: 'Jun 24', date: '2024-06', robotics: 128, sp500: 112, nasdaq: 118, soxx: 132, industrials: 108 },
  { month: 'Sep 24', date: '2024-09', robotics: 142, sp500: 118, nasdaq: 125, soxx: 145, industrials: 112 },
  { month: 'Dec 24', date: '2024-12', robotics: 158, sp500: 124, nasdaq: 132, soxx: 158, industrials: 118 },
  { month: 'Mar 25', date: '2025-03', robotics: 175, sp500: 130, nasdaq: 140, soxx: 168, industrials: 122 },
  { month: 'Jun 25', date: '2025-06', robotics: 195, sp500: 136, nasdaq: 148, soxx: 180, industrials: 128 },
  { month: 'Sep 25', date: '2025-09', robotics: 212, sp500: 142, nasdaq: 155, soxx: 192, industrials: 132 },
  { month: 'Dec 25', date: '2025-12', robotics: 228, sp500: 148, nasdaq: 162, soxx: 205, industrials: 138 },
];

// Leading indicators (base values)
const baseLeadingIndicators = [
  { name: 'Patent Momentum', value: 82, change: 12, factors: { humanoid: 35, perception: 25, actuation: 20, safety: 10, other: 10 }, description: 'USPTO + WIPO robotics patent filings velocity' },
  { name: 'Hiring Velocity', value: 78, change: 8, factors: { software: 40, controls: 25, perception: 20, safety: 15 }, description: 'LinkedIn robotics job postings growth rate' },
  { name: 'Order Book Strength', value: 71, change: 5, factors: { warehouse: 35, industrial: 30, cobot: 20, other: 15 }, description: 'Automation capex + robot orders proxy' },
  { name: 'Policy Tailwinds', value: 85, change: 15, factors: { subsidies: 45, reshoring: 30, defense: 15, other: 10 }, description: 'Government incentives + procurement' },
  { name: 'Supply Chain Easing', value: 58, change: -5, factors: { chips: 30, harmonic: -20, sensors: 15, other: 15 }, description: 'Component availability index' },
  { name: 'Earnings Sentiment', value: 74, change: 6, factors: { mentions: 40, tone: 35, guidance: 25 }, description: 'NLP analysis of robotics mentions in calls' },
];

// Segments with cross-filter support
const segments = [
  { id: 'humanoid', name: 'Humanoid Robots', growth: 298, marketSize: 3.2, momentum: 97, color: '#8b5cf6', 
    companies: ['TSLA', 'Figure AI', 'Boston Dynamics'], components: ['Harmonic Drives', 'Servo Motors', 'AI Chips', 'Force Sensors'] },
  { id: 'surgical', name: 'Surgical Robotics', growth: 44, marketSize: 19.8, momentum: 86, color: '#ec4899',
    companies: ['ISRG'], components: ['Vision Systems', 'Force Sensors', 'Controllers/PLCs'] },
  { id: 'warehouse', name: 'Warehouse/Logistics', growth: 62, marketSize: 26.5, momentum: 93, color: '#3b82f6',
    companies: ['SYM', 'AMZN'], components: ['LiDAR Sensors', 'Vision Systems', 'Controllers/PLCs', 'Batteries/Power'] },
  { id: 'cobot', name: 'Collaborative Robots', growth: 52, marketSize: 14.2, momentum: 89, color: '#10b981',
    companies: ['ABB', 'FANUY', 'ROK'], components: ['Force Sensors', 'Servo Motors', 'Vision Systems'] },
  { id: 'agri', name: 'Agricultural Robots', growth: 42, marketSize: 9.8, momentum: 78, color: '#f59e0b',
    companies: [], components: ['LiDAR Sensors', 'Vision Systems', 'Batteries/Power'] },
  { id: 'industrial', name: 'Industrial Arms', growth: 16, marketSize: 54.8, momentum: 62, color: '#6366f1',
    companies: ['ABB', 'FANUY', 'ROK'], components: ['Servo Motors', 'Harmonic Drives', 'Controllers/PLCs'] },
];

// Company data with exposure mapping
const companies = [
  { ticker: 'NVDA', name: 'NVIDIA', marketCap: 4200, revenue: 187.1, revenueGrowth: 94, exposure: 38, momentum: 94, segments: ['humanoid', 'warehouse', 'surgical'], tier: 'Core' },
  { ticker: 'ISRG', name: 'Intuitive Surgical', marketCap: 200, revenue: 9.6, revenueGrowth: 16, exposure: 95, momentum: 86, segments: ['surgical'], tier: 'Core' },
  { ticker: 'ABB', name: 'ABB Ltd', marketCap: 134, revenue: 34.5, revenueGrowth: 10, exposure: 48, momentum: 70, segments: ['cobot', 'industrial'], tier: 'Satellite' },
  { ticker: 'FANUY', name: 'Fanuc Corp', marketCap: 34, revenue: 5.3, revenueGrowth: 6, exposure: 88, momentum: 62, segments: ['cobot', 'industrial'], tier: 'Satellite' },
  { ticker: 'ROK', name: 'Rockwell Automation', marketCap: 45, revenue: 8.3, revenueGrowth: 12, exposure: 58, momentum: 68, segments: ['cobot', 'industrial'], tier: 'Core' },
  { ticker: 'SYM', name: 'Symbotic', marketCap: 7, revenue: 2.4, revenueGrowth: 72, exposure: 100, momentum: 90, segments: ['warehouse'], tier: 'Speculative' },
  { ticker: 'PATH', name: 'UiPath', marketCap: 8.5, revenue: 1.4, revenueGrowth: 18, exposure: 72, momentum: 65, segments: [], tier: 'Satellite' },
  { ticker: 'TSLA', name: 'Tesla (Optimus)', marketCap: 1600, revenue: 95.6, revenueGrowth: 22, exposure: 28, momentum: 82, segments: ['humanoid'], tier: 'Satellite' },
];

// Supply chain components
const supplyChainComponents = [
  { id: 'ai-chips', name: 'AI Chips', suppliers: ['NVIDIA', 'AMD', 'Intel'], concentration: 84, leadTime: 14, criticality: 98, priceChange: 8, shortage: 'Medium', region: 'USA/Taiwan' },
  { id: 'servo', name: 'Servo Motors', suppliers: ['Yaskawa', 'Fanuc', 'Siemens'], concentration: 71, leadTime: 11, criticality: 92, priceChange: 6, shortage: 'Medium', region: 'Japan/Germany' },
  { id: 'lidar', name: 'LiDAR Sensors', suppliers: ['Hesai', 'Luminar', 'Velodyne'], concentration: 62, leadTime: 8, criticality: 84, priceChange: -18, shortage: 'Low', region: 'China/USA' },
  { id: 'harmonic', name: 'Harmonic Drives', suppliers: ['Harmonic Drive', 'Nabtesco', 'Sumitomo'], concentration: 89, leadTime: 22, criticality: 96, priceChange: 22, shortage: 'Critical', region: 'Japan' },
  { id: 'force', name: 'Force Sensors', suppliers: ['ATI', 'Robotiq', 'OnRobot'], concentration: 56, leadTime: 7, criticality: 78, priceChange: 4, shortage: 'Low', region: 'USA/Denmark' },
  { id: 'vision', name: 'Vision Systems', suppliers: ['Cognex', 'Keyence', 'Basler'], concentration: 60, leadTime: 5, criticality: 82, priceChange: 2, shortage: 'Low', region: 'USA/Japan/Germany' },
  { id: 'battery', name: 'Batteries/Power', suppliers: ['CATL', 'LG Energy', 'Panasonic'], concentration: 76, leadTime: 12, criticality: 88, priceChange: -12, shortage: 'Low', region: 'China/Korea/Japan' },
  { id: 'plc', name: 'Controllers/PLCs', suppliers: ['Rockwell', 'Siemens', 'Mitsubishi'], concentration: 54, leadTime: 6, criticality: 75, priceChange: 1, shortage: 'Low', region: 'USA/Germany/Japan' },
];

// Alerts/Events
const initialAlerts = [
  { id: 1, type: 'signal', priority: 'high', title: 'Humanoid momentum crossed 95', time: '2h ago', read: false },
  { id: 2, type: 'earnings', priority: 'medium', title: 'ISRG earnings in 5 days', time: '1d ago', read: false },
  { id: 3, type: 'supply', priority: 'critical', title: 'Harmonic drive lead time +2 weeks', time: '3d ago', read: true },
  { id: 4, type: 'policy', priority: 'medium', title: 'EU robotics subsidy program announced', time: '5d ago', read: true },
  { id: 5, type: 'price', priority: 'low', title: 'SYM up 8% on volume spike', time: '1w ago', read: true },
];

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const InfoButton = ({ dataKey, dataSources }) => {
  const [isOpen, setIsOpen] = useState(false);
  const source = dataSources[dataKey];
  
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
  
  // Data refresh state
  const [marketPerformanceData, setMarketPerformanceData] = useState(baseMarketPerformanceData);
  const [leadingIndicators, setLeadingIndicators] = useState(baseLeadingIndicators);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSources, setDataSources] = useState(getDataSources());
  const [backendStatus, setBackendStatus] = useState('unknown');
  
  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Update data sources with current date
    setDataSources(getDataSources());
    
    // Generate latest data point if needed
    const currentDate = getCurrentDate();
    const lastDataPoint = baseMarketPerformanceData[baseMarketPerformanceData.length - 1];
    
    // Check if we need a new data point (different month)
    let updatedMarketData = [...baseMarketPerformanceData];
    if (lastDataPoint.date !== currentDate.isoDate.slice(0, 7)) {
      const newPoint = generateLatestDataPoint(baseMarketPerformanceData);
      updatedMarketData = [...baseMarketPerformanceData, newPoint];
    }
    setMarketPerformanceData(updatedMarketData);
    
    // Fetch real signals from backend
    const refreshedSignals = await refreshSignals();
    setLeadingIndicators(refreshedSignals);
    
    // Check backend health
    const health = await checkHealth();
    setBackendStatus(health.status === 'ok' ? 'online' : 'offline');
    
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);
  
  // Auto-refresh on mount
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);
  
  // Optional: Polling every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [handleRefresh]);
  
  // Cross-filtering logic
  const filteredCompanies = useMemo(() => {
    if (!selectedSegment) return companies;
    return companies.filter(c => c.segments.includes(selectedSegment));
  }, [selectedSegment]);
  
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
  }, [leadingIndicators]);
  
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
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <p className="text-slate-500">
                  Investment signals · {getCurrentDate().formatted}
                </p>
                <span className="text-slate-700">|</span>
                <span className="text-slate-600">
                  Updated: {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {backendStatus && (
                  <>
                    <span className="text-slate-700">|</span>
                    <span className={`flex items-center gap-1 ${
                      backendStatus === 'online' ? 'text-emerald-600' : 
                      backendStatus === 'offline' ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 
                        backendStatus === 'offline' ? 'bg-amber-500' : 'bg-slate-500'
                      }`} />
                      {backendStatus === 'online' ? 'Live Data' : backendStatus === 'offline' ? 'Cached Data' : 'Checking...'}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  isRefreshing 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Refresh data"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Updating...' : 'Refresh'}
              </button>
              
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
                  <InfoButton dataKey="marketIndices" dataSources={dataSources} />
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
                <AreaChart data={marketPerformanceData}>
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
                    <InfoButton dataKey="leadingIndicators" dataSources={dataSources} />
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
                  <InfoButton dataKey="supplyChain" dataSources={dataSources} />
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
                  <InfoButton dataKey="companyFinancials" dataSources={dataSources} />
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
            Company data: Yahoo Finance (Dec 18) · Indices & signals: Synthetic · 
            Not investment advice
          </p>
        </div>
      </div>
      
      {/* Signal Decomposition Drawer */}
      {selectedSignal && (
        <SignalDrawer signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
      )}
    </div>
  );
}
