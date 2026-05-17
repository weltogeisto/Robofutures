/**
 * @file JSDoc type definitions for shared data shapes across the dashboard.
 */

// This export makes the file a module so JSDoc @typedef imports work.
export {};

/**
 * @typedef {Object} Ticker
 * @property {string} n - Display name
 * @property {number} l - Layer (1–4)
 * @property {number} p - Latest price
 * @property {string} c - Currency code (USD, JPY, EUR, CHF, TWD)
 * @property {number} h - 52-week high (fallback)
 * @property {number} w - 52-week low (fallback)
 * @property {number} ch - % change over selected timeframe
 * @property {number} rb - Rebound % (from period low to period high range)
 * @property {number} ex - Robotics exposure %
 * @property {string} ti - Tier (Core | Sat)
 * @property {string} se - Sector/subsector label
 * @property {boolean} [live] - True when price was overridden from live quotes
 */

/**
 * @typedef {Object} DataHealth
 * @property {'fresh'|'degraded'|'stale'|'missing'} status
 * @property {string} label
 * @property {string|null} updated
 * @property {number|null} ageHours
 * @property {{ quotes: number|null, history: number|null }} ages
 * @property {string[]} failed
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} Alert
 * @property {string} id
 * @property {string} type
 * @property {string} ty
 * @property {'high'|'med'|'low'} p
 * @property {'high'|'med'|'low'} priority
 * @property {string} t - Alert text
 * @property {string} tm - Timestamp label
 * @property {boolean} read
 */

/**
 * @typedef {Object} ScoredTicker
 * @property {string} ticker
 * @property {number} earlyness
 * @property {number} momentum
 * @property {string} status
 * @property {string} name
 * @property {string} layerName
 * @property {string} whyNow
 */

/**
 * @typedef {Object} EcosystemLayer
 * @property {number} id
 * @property {string} name
 * @property {number} bottleneckScore
 * @property {ScoredTicker[]} tickers
 * @property {'bottleneck'|'watch'|'normal'} signal
 */

/**
 * @typedef {Object} CycleClockData
 * @property {number} phase
 * @property {string} stage
 * @property {number} confidence
 * @property {string} implication
 * @property {string[]} evidence
 */

/**
 * @typedef {Object} CockpitData
 * @property {CycleClockData} cycleClock
 * @property {ScoredTicker[]} topMomentumTickers
 * @property {EcosystemLayer[]} ecosystemLayers
 * @property {Array<{entity:string, action:string, rationale:string}>} actionQueue
 */
