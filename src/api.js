// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Fetch all signals from backend
 */
export async function fetchSignals() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/signals/all`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.signals) {
      return data.signals;
    }
    
    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error('Error fetching signals:', error);
    
    // Return fallback data if API fails
    return getFallbackSignals();
  }
}

/**
 * Fetch specific signal
 */
export async function fetchSignal(type) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/signals/${type}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error(`Error fetching ${type} signal:`, error);
    return null;
  }
}

/**
 * Check backend health
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'offline', error: error.message };
  }
}

/**
 * Fallback signals if backend is unavailable
 */
function getFallbackSignals() {
  return [
    { 
      name: 'Patent Momentum', 
      value: 82, 
      change: 12, 
      factors: { humanoid: 35, perception: 25, actuation: 20, safety: 10, other: 10 }, 
      description: 'USPTO + WIPO robotics patent filings velocity (offline mode)',
      source: 'Cached'
    },
    { 
      name: 'Hiring Velocity', 
      value: 78, 
      change: 8, 
      factors: { software: 40, controls: 25, perception: 20, safety: 15 }, 
      description: 'LinkedIn robotics job postings growth rate (offline mode)',
      source: 'Cached'
    },
    { 
      name: 'Order Book Strength', 
      value: 71, 
      change: 5, 
      factors: { warehouse: 35, industrial: 30, cobot: 20, other: 15 }, 
      description: 'Automation capex + robot orders proxy (offline mode)',
      source: 'Cached'
    },
    { 
      name: 'Policy Tailwinds', 
      value: 85, 
      change: 15, 
      factors: { subsidies: 45, reshoring: 30, defense: 15, other: 10 }, 
      description: 'Government incentives + procurement (offline mode)',
      source: 'Cached'
    },
    { 
      name: 'Supply Chain Easing', 
      value: 58, 
      change: -5, 
      factors: { chips: 30, harmonic: -20, sensors: 15, other: 15 }, 
      description: 'Component availability index (offline mode)',
      source: 'Cached'
    },
    { 
      name: 'Earnings Sentiment', 
      value: 74, 
      change: 6, 
      factors: { mentions: 40, tone: 35, guidance: 25 }, 
      description: 'NLP analysis of robotics mentions in calls (offline mode)',
      source: 'Cached'
    },
  ];
}
