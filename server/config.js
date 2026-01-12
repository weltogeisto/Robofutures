// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

// Export configuration
export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY,
  newsApiKey: process.env.NEWS_API_KEY,
  secUserAgent: process.env.SEC_USER_AGENT,
  adzunaAppId: process.env.ADZUNA_APP_ID,
  adzunaAppKey: process.env.ADZUNA_APP_KEY
};

// Debug: Log on first load
console.log('⚙️  Configuration loaded');
console.log('🔑 Alpha Vantage Key:', config.alphaVantageKey ? `Present (${config.alphaVantageKey.substring(0, 4)}...)` : '❌ MISSING!');
console.log('🔑 News API Key:', config.newsApiKey ? `Present (${config.newsApiKey.substring(0, 4)}...)` : '❌ MISSING!');
