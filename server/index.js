// CRITICAL: Load configuration FIRST (includes dotenv.config())
import { config } from './config.js';

import express from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import signalsRouter from './routes/signals.js';

const app = express();
const PORT = config.port;

// Initialize cache (TTL: 5 minutes)
export const cache = new NodeCache({ stdTTL: 300 });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/signals', signalsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cache: {
      keys: cache.keys().length,
      stats: cache.getStats()
    }
  });
});

// Cache management (development only)
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ 
    success: true, 
    message: 'Cache cleared',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Robofutures API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
