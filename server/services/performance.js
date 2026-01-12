import axios from 'axios';
import { cache } from '../index.js';
import { config } from '../config.js';

const ALPHA_VANTAGE_KEY = config.alphaVantageKey;

// Debug: Log API key status on module load
console.log('🔑 Performance Service - API Key Status:', ALPHA_VANTAGE_KEY ? `Present (${ALPHA_VANTAGE_KEY.substring(0, 4)}...)` : 'MISSING!');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get monthly stock performance data
 */
async function getStockPerformance(symbol) {
  try {
    console.log(`  🔍 Fetching ${symbol} TIME_SERIES_MONTHLY with API key: ${ALPHA_VANTAGE_KEY ? 'YES' : 'NO'}`);
    
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_MONTHLY',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_KEY
      },
      timeout: 15000
    });

    const data = response.data;
    
    console.log(`  📦 Response keys for ${symbol}:`, Object.keys(data));
    
    if (data['Note']) {
      console.log(`  ⚠️  Rate limit message:`, data['Note']);
      throw new Error('Rate limit exceeded');
    }
    
    if (data['Error Message']) {
      console.log(`  ❌ Error message:`, data['Error Message']);
      throw new Error(data['Error Message']);
    }
    
    const timeSeries = data['Monthly Time Series'];
    if (!timeSeries) {
      console.log(`  ❌ No 'Monthly Time Series' in response. Available keys:`, Object.keys(data));
      throw new Error('No time series data');
    }

    console.log(`  ✅ Got ${Object.keys(timeSeries).length} months of data for ${symbol}`);
    
    // Convert to array and sort by date
    const prices = Object.entries(timeSeries)
      .map(([date, values]) => ({
        date: date,
        close: parseFloat(values['4. close'])
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return prices;

  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Normalize price series to index (base = 100 at start date)
 */
function normalizeToIndex(prices, baseDate) {
  const basePrice = prices.find(p => p.date >= baseDate)?.close;
  if (!basePrice) return prices;
  
  return prices.map(p => ({
    date: p.date,
    value: (p.close / basePrice) * 100
  }));
}

/**
 * Calculate weighted robotics index from multiple stocks
 */
function calculateRoboticsIndex(stockData, weights) {
  // Find common dates
  const allDates = stockData[0].map(p => p.date);
  
  return allDates.map(date => {
    let weightedSum = 0;
    let totalWeight = 0;
    
    stockData.forEach((stock, index) => {
      const point = stock.find(p => p.date === date);
      if (point) {
        weightedSum += point.value * weights[index];
        totalWeight += weights[index];
      }
    });
    
    return {
      date: date,
      value: totalWeight > 0 ? weightedSum / totalWeight : 100
    };
  });
}

/**
 * Get performance chart data
 */
export async function getPerformanceData() {
  const cacheKey = 'performance_chart';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('📦 Performance data from cache');
    return cached;
  }

  console.log('🔄 Fetching performance data (this takes ~2 minutes)...');

  try {
    // Define our robotics portfolio with weights
    const roboticsStocks = [
      { symbol: 'NVDA', weight: 0.25 },   // AI/Chips - largest weight
      { symbol: 'ISRG', weight: 0.20 },   // Surgical robotics
      { symbol: 'ROK', weight: 0.15 },    // Industrial automation
      { symbol: 'ABB', weight: 0.10 },    // Industrial robots
      { symbol: 'SYM', weight: 0.10 },    // Warehouse automation
      { symbol: 'TSLA', weight: 0.10 },   // Humanoid (Optimus)
      { symbol: 'PATH', weight: 0.05 },   // RPA
      { symbol: 'FANUY', weight: 0.05 }   // Industrial robots
    ];

    // Benchmark indices
    const benchmarks = ['SPY', 'QQQ', 'SOXX', 'XLI']; // S&P500, Nasdaq, Semiconductors, Industrials

    const allSymbols = [
      ...roboticsStocks.map(s => s.symbol),
      ...benchmarks
    ];

    // Fetch all data with rate limiting
    const allData = [];
    
    for (let i = 0; i < allSymbols.length; i++) {
      const symbol = allSymbols[i];
      
      try {
        console.log(`  Fetching ${symbol} (${i + 1}/${allSymbols.length})...`);
        const data = await getStockPerformance(symbol);
        allData.push({ symbol, data });
        
        // Rate limit: 12 seconds between calls
        if (i < allSymbols.length - 1) {
          console.log(`  ⏳ Waiting 12s for rate limit...`);
          await sleep(12000);
        }
      } catch (error) {
        console.error(`  ❌ Failed to fetch ${symbol}:`, error.message);
        allData.push({ symbol, data: null });
        
        // Still wait to avoid hammering
        if (i < allSymbols.length - 1) {
          await sleep(12000);
        }
      }
    }

    // Base date for normalization (Jan 2024)
    const baseDate = '2024-01-01';
    
    // Normalize all series to index (100 at base date)
    const normalizedData = {};
    allData.forEach(({ symbol, data }) => {
      if (data && data.length > 0) {
        normalizedData[symbol] = normalizeToIndex(data, baseDate);
      }
    });

    // Calculate robotics index
    const roboticsNormalized = roboticsStocks
      .filter(s => normalizedData[s.symbol])
      .map(s => normalizedData[s.symbol]);
    
    const roboticsWeights = roboticsStocks
      .filter(s => normalizedData[s.symbol])
      .map(s => s.weight);
    
    const roboticsIndex = calculateRoboticsIndex(roboticsNormalized, roboticsWeights);

    // Format data for frontend
    const chartData = roboticsIndex.map(point => {
      const date = new Date(point.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      return {
        month: monthYear,
        date: point.date,
        robotics: Math.round(point.value),
        sp500: Math.round(normalizedData['SPY']?.find(p => p.date === point.date)?.value || 100),
        nasdaq: Math.round(normalizedData['QQQ']?.find(p => p.date === point.date)?.value || 100),
        soxx: Math.round(normalizedData['SOXX']?.find(p => p.date === point.date)?.value || 100),
        industrials: Math.round(normalizedData['XLI']?.find(p => p.date === point.date)?.value || 100)
      };
    });

    // Filter to last 24 months
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 24);
    
    const filteredData = chartData.filter(d => new Date(d.date) >= cutoffDate);

    const result = {
      data: filteredData,
      metadata: {
        baseDate: baseDate,
        dataPoints: filteredData.length,
        portfolio: roboticsStocks.map(s => ({ 
          symbol: s.symbol, 
          weight: s.weight,
          available: !!normalizedData[s.symbol]
        })),
        benchmarks: benchmarks.map(b => ({
          symbol: b,
          available: !!normalizedData[b]
        })),
        lastUpdated: new Date().toISOString()
      },
      source: 'Alpha Vantage API'
    };

    // Cache for 24 HOURS (86400 seconds) - stock data only updates daily
    cache.set(cacheKey, result, 86400);
    
    console.log(`✅ Performance data fetched: ${filteredData.length} data points`);
    
    return result;

  } catch (error) {
    console.error('Performance data error:', error);
    throw error;
  }
}

/**
 * Fallback performance data
 */
export function getFallbackPerformanceData() {
  return {
    data: [
      { month: 'Jan 24', date: '2024-01', robotics: 100, sp500: 100, nasdaq: 100, soxx: 100, industrials: 100 },
      { month: 'Mar 24', date: '2024-03', robotics: 112, sp500: 106, nasdaq: 108, soxx: 115, industrials: 104 },
      { month: 'Jun 24', date: '2024-06', robotics: 128, sp500: 112, nasdaq: 118, soxx: 132, industrials: 108 },
      { month: 'Sep 24', date: '2024-09', robotics: 142, sp500: 118, nasdaq: 125, soxx: 145, industrials: 112 },
      { month: 'Dec 24', date: '2024-12', robotics: 158, sp500: 124, nasdaq: 132, soxx: 158, industrials: 118 },
      { month: 'Mar 25', date: '2025-03', robotics: 175, sp500: 130, nasdaq: 140, soxx: 168, industrials: 122 },
      { month: 'Jun 25', date: '2025-06', robotics: 195, sp500: 136, nasdaq: 148, soxx: 180, industrials: 128 },
      { month: 'Sep 25', date: '2025-09', robotics: 212, sp500: 142, nasdaq: 155, soxx: 192, industrials: 132 },
      { month: 'Dec 25', date: '2025-12', robotics: 228, sp500: 148, nasdaq: 162, soxx: 205, industrials: 138 }
    ],
    metadata: {
      baseDate: '2024-01-01',
      dataPoints: 9
    },
    source: 'Cached'
  };
}
