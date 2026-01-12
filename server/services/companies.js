import axios from 'axios';
import { cache } from '../index.js';

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Helper function for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get company data for a single ticker
 */
async function getCompanyData(ticker) {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'OVERVIEW',
        symbol: ticker,
        apikey: ALPHA_VANTAGE_KEY
      },
      timeout: 15000
    });

    const data = response.data;
    
    // Check for rate limit or errors
    if (data['Note']) {
      throw new Error('Rate limit exceeded');
    }
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    if (!data.Symbol) {
      throw new Error('No data returned');
    }

    // Parse and normalize data
    const marketCap = parseFloat(data.MarketCapitalization) / 1e9; // Convert to billions
    const revenue = parseFloat(data.RevenueTTM) / 1e9; // Convert to billions
    const revenueGrowth = parseFloat(data.QuarterlyRevenueGrowthYOY || 0) * 100;
    const profitMargin = parseFloat(data.ProfitMargin || 0) * 100;
    
    // Calculate exposure score based on sector/industry
    const exposure = calculateRoboticsExposure(ticker, data);
    
    // Calculate momentum from multiple factors
    const momentum = calculateMomentum(revenueGrowth, profitMargin, parseFloat(data.PERatio || 0));

    return {
      ticker: ticker,
      name: data.Name,
      marketCap: Math.round(marketCap * 10) / 10,
      revenue: Math.round(revenue * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth),
      exposure: exposure,
      momentum: momentum,
      segments: getSegments(ticker),
      tier: getTier(ticker, exposure),
      // Additional metadata
      sector: data.Sector,
      industry: data.Industry,
      peRatio: parseFloat(data.PERatio || 0),
      profitMargin: Math.round(profitMargin * 10) / 10,
      source: 'Alpha Vantage API',
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error.message);
    throw error;
  }
}

/**
 * Calculate robotics exposure based on company profile
 */
function calculateRoboticsExposure(ticker, data) {
  const industry = (data.Industry || '').toLowerCase();
  const description = (data.Description || '').toLowerCase();
  
  // Known robotics pure-plays
  const purePlays = { 'ISRG': 95, 'SYM': 100, 'ABB': 48, 'FANUY': 88, 'ROK': 58 };
  if (purePlays[ticker]) return purePlays[ticker];
  
  // Analyze industry and description
  let score = 0;
  
  if (industry.includes('robot') || industry.includes('automation')) score += 40;
  if (industry.includes('semiconductor') && description.includes('ai')) score += 35;
  if (description.includes('robot')) score += 30;
  if (description.includes('automation')) score += 25;
  if (description.includes('ai') || description.includes('artificial intelligence')) score += 20;
  
  return Math.min(100, Math.max(20, score));
}

/**
 * Calculate momentum score
 */
function calculateMomentum(revenueGrowth, profitMargin, peRatio) {
  let momentum = 50; // Base score
  
  // Revenue growth contribution (max +30)
  momentum += Math.min(30, revenueGrowth * 0.3);
  
  // Profit margin contribution (max +20)
  momentum += Math.min(20, profitMargin * 0.4);
  
  // P/E ratio penalty/bonus (lower is better, but not too low)
  if (peRatio > 0 && peRatio < 100) {
    if (peRatio < 20) momentum += 10;
    else if (peRatio > 50) momentum -= 10;
  }
  
  return Math.min(100, Math.max(30, Math.round(momentum)));
}

/**
 * Get segments for a ticker
 */
function getSegments(ticker) {
  const segmentMap = {
    'NVDA': ['humanoid', 'warehouse', 'surgical'],
    'ISRG': ['surgical'],
    'ABB': ['cobot', 'industrial'],
    'FANUY': ['cobot', 'industrial'],
    'ROK': ['cobot', 'industrial'],
    'SYM': ['warehouse'],
    'PATH': [],
    'TSLA': ['humanoid']
  };
  
  return segmentMap[ticker] || [];
}

/**
 * Determine tier classification
 */
function getTier(ticker, exposure) {
  if (exposure >= 80) return 'Core';
  if (exposure >= 50) return 'Satellite';
  return 'Speculative';
}

/**
 * Get fallback company data
 */
function getFallbackCompany(ticker) {
  const fallbacks = {
    'NVDA': { ticker: 'NVDA', name: 'NVIDIA', marketCap: 4200, revenue: 187.1, revenueGrowth: 94, exposure: 38, momentum: 94, segments: ['humanoid', 'warehouse', 'surgical'], tier: 'Core' },
    'ISRG': { ticker: 'ISRG', name: 'Intuitive Surgical', marketCap: 200, revenue: 9.6, revenueGrowth: 16, exposure: 95, momentum: 86, segments: ['surgical'], tier: 'Core' },
    'ABB': { ticker: 'ABB', name: 'ABB Ltd', marketCap: 134, revenue: 34.5, revenueGrowth: 10, exposure: 48, momentum: 70, segments: ['cobot', 'industrial'], tier: 'Satellite' },
    'FANUY': { ticker: 'FANUY', name: 'Fanuc Corp', marketCap: 34, revenue: 5.3, revenueGrowth: 6, exposure: 88, momentum: 62, segments: ['cobot', 'industrial'], tier: 'Satellite' },
    'ROK': { ticker: 'ROK', name: 'Rockwell Automation', marketCap: 45, revenue: 8.3, revenueGrowth: 12, exposure: 58, momentum: 68, segments: ['cobot', 'industrial'], tier: 'Core' },
    'SYM': { ticker: 'SYM', name: 'Symbotic', marketCap: 7, revenue: 2.4, revenueGrowth: 72, exposure: 100, momentum: 90, segments: ['warehouse'], tier: 'Speculative' },
    'PATH': { ticker: 'PATH', name: 'UiPath', marketCap: 8.5, revenue: 1.4, revenueGrowth: 18, exposure: 72, momentum: 65, segments: [], tier: 'Satellite' },
    'TSLA': { ticker: 'TSLA', name: 'Tesla (Optimus)', marketCap: 1600, revenue: 95.6, revenueGrowth: 22, exposure: 28, momentum: 82, segments: ['humanoid'], tier: 'Satellite' }
  };
  
  const fallback = fallbacks[ticker] || fallbacks['NVDA'];
  return {
    ...fallback,
    source: 'Cached',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get all companies with intelligent caching and rate limiting
 */
export async function getAllCompanies() {
  const cacheKey = 'all_companies';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('📦 Companies data from cache');
    return {
      companies: cached.companies,
      cached: true,
      lastUpdated: cached.lastUpdated
    };
  }

  const tickers = ['NVDA', 'ISRG', 'ROK', 'ABB', 'FANUY', 'SYM', 'PATH', 'TSLA'];
  const companies = [];
  let successCount = 0;
  let failCount = 0;

  console.log('🔄 Fetching company data (this takes ~90 seconds due to rate limits)...');
  
  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i];
    
    try {
      console.log(`  Fetching ${ticker} (${i + 1}/${tickers.length})...`);
      const data = await getCompanyData(ticker);
      companies.push(data);
      successCount++;
      
      // Rate limit: Wait 12 seconds between calls (5 calls per minute max)
      if (i < tickers.length - 1) {
        console.log(`  ⏳ Waiting 12s for rate limit...`);
        await sleep(12000);
      }
      
    } catch (err) {
      console.error(`  ❌ Failed to fetch ${ticker}:`, err.message);
      companies.push(getFallbackCompany(ticker));
      failCount++;
      
      // Still wait to avoid hammering the API
      if (i < tickers.length - 1) {
        await sleep(12000);
      }
    }
  }

  const result = {
    companies: companies,
    cached: false,
    lastUpdated: new Date().toISOString(),
    stats: {
      total: tickers.length,
      success: successCount,
      failed: failCount,
      fromAPI: successCount,
      fromCache: failCount
    }
  };

  // Cache for 1 HOUR (3600 seconds)
  cache.set(cacheKey, result, 3600);
  
  console.log(`✅ Companies data fetched: ${successCount} from API, ${failCount} from cache`);
  
  return result;
}
