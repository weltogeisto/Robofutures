import express from 'express';
import { getPatentMomentum } from '../services/patents.js';
import { getEarningsSentiment, getOrderBookStrength } from '../services/financials.js';
import { getPolicyTailwinds, getHiringVelocity } from '../services/market.js';
import { getAllCompanies } from '../services/companies.js';
import { getPerformanceData, getFallbackPerformanceData } from '../services/performance.js';

const router = express.Router();

/**
 * GET /api/signals/all
 * Returns all leading indicators
 */
router.get('/all', async (req, res) => {
  try {
    console.log('Fetching all signals...');
    
    // Fetch all signals in parallel (with timeout fallbacks)
    const signals = await Promise.allSettled([
      getPatentMomentum(),
      getHiringVelocity(),
      getOrderBookStrength(),
      getPolicyTailwinds(),
      getEarningsSentiment()
    ]);

    // Extract values or use fallbacks
    const leadingIndicators = signals.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Signal ${index} failed:`, result.reason);
        return getFallbackSignal(index);
      }
    });

    // Add Supply Chain Easing (simulated for now - no free API available)
    leadingIndicators.push({
      name: 'Supply Chain Easing',
      value: 58,
      change: -5,
      factors: { chips: 30, harmonic: -20, sensors: 15, other: 15 },
      description: 'Component availability index (simulated)',
      source: 'Simulated'
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      signals: leadingIndicators,
      cached: signals.filter(s => s.status === 'fulfilled').length < signals.length
    });

  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      signals: getAllFallbackSignals()
    });
  }
});

/**
 * GET /api/signals/patents
 * Returns patent momentum data
 */
router.get('/patents', async (req, res) => {
  try {
    const data = await getPatentMomentum();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/signals/earnings
 * Returns earnings sentiment
 */
router.get('/earnings', async (req, res) => {
  try {
    const data = await getEarningsSentiment();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/signals/policy
 * Returns policy tailwinds
 */
router.get('/policy', async (req, res) => {
  try {
    const data = await getPolicyTailwinds();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/signals/hiring
 * Returns hiring velocity
 */
router.get('/hiring', async (req, res) => {
  try {
    const data = await getHiringVelocity();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/signals/orders
 * Returns order book strength
 */
router.get('/orders', async (req, res) => {
  try {
    const data = await getOrderBookStrength();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/signals/companies
 * Returns all company data with real financials
 */
router.get('/companies', async (req, res) => {
  try {
    const data = await getAllCompanies();
    res.json({ 
      success: true, 
      ...data
    });
  } catch (error) {
    console.error('Error in /companies route:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/signals/performance
 * Returns historical performance data for robotics index and benchmarks
 * NOTE: This is a slow endpoint (~2 minutes) due to Alpha Vantage rate limits
 */
router.get('/performance', async (req, res) => {
  try {
    console.log('Fetching performance data...');
    const data = await getPerformanceData();
    res.json({ 
      success: true, 
      data,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /performance route:', error);
    
    // Return fallback data on error
    const fallbackData = getFallbackPerformanceData();
    res.json({ 
      success: true, 
      data: fallbackData,
      lastUpdate: new Date().toISOString(),
      cached: true,
      error: 'Using cached baseline data'
    });
  }
});

// Fallback signals if API calls fail
function getFallbackSignal(index) {
  const fallbacks = [
    { name: 'Patent Momentum', value: 82, change: 12, factors: { humanoid: 35, perception: 25, actuation: 20, safety: 10, other: 10 }, description: 'USPTO patent filings (cached)' },
    { name: 'Hiring Velocity', value: 78, change: 8, factors: { software: 40, controls: 25, perception: 20, safety: 15 }, description: 'Job postings growth (cached)' },
    { name: 'Order Book Strength', value: 71, change: 5, factors: { warehouse: 35, industrial: 30, cobot: 20, other: 15 }, description: 'Orders proxy (cached)' },
    { name: 'Policy Tailwinds', value: 85, change: 15, factors: { subsidies: 45, reshoring: 30, defense: 15, other: 10 }, description: 'Government incentives (cached)' },
    { name: 'Earnings Sentiment', value: 74, change: 6, factors: { mentions: 40, tone: 35, guidance: 25 }, description: 'Earnings analysis (cached)' }
  ];
  return fallbacks[index] || fallbacks[0];
}

function getAllFallbackSignals() {
  return [
    { name: 'Patent Momentum', value: 82, change: 12, factors: { humanoid: 35, perception: 25, actuation: 20, safety: 10, other: 10 }, description: 'USPTO patent filings (cached)' },
    { name: 'Hiring Velocity', value: 78, change: 8, factors: { software: 40, controls: 25, perception: 20, safety: 15 }, description: 'Job postings growth (cached)' },
    { name: 'Order Book Strength', value: 71, change: 5, factors: { warehouse: 35, industrial: 30, cobot: 20, other: 15 }, description: 'Orders proxy (cached)' },
    { name: 'Policy Tailwinds', value: 85, change: 15, factors: { subsidies: 45, reshoring: 30, defense: 15, other: 10 }, description: 'Government incentives (cached)' },
    { name: 'Supply Chain Easing', value: 58, change: -5, factors: { chips: 30, harmonic: -20, sensors: 15, other: 15 }, description: 'Component availability (simulated)' },
    { name: 'Earnings Sentiment', value: 74, change: 6, factors: { mentions: 40, tone: 35, guidance: 25 }, description: 'Earnings analysis (cached)' }
  ];
}

export default router;
