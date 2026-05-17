import { scoreTicker } from './signalCockpit.js';

/**
 * Maps ticker sector strings to segment IDs.
 * Based on the se (sector) field in ALL_TICKERS.
 *
 * @type {Record<string, string>}
 */
const SEGMENT_OF_SE = {
  // Humanoid — pure-play actuators and precision motion for humanoid robots
  'Harmonic Gears': 'humanoid', // 6324.T — Harmonic Drive, monopoly on strain-wave gears
  'RV Gears': 'humanoid', // 6268.T — Nabtesco, robotic RV gearboxes
  'Linear Guides': 'humanoid', // 6481.T — THK, linear motion components
  'Position Sensing': 'humanoid', // ALGM — Allegro Micro, position/current sensing in actuators
  // Warehouse — logistics automation, conventional industrial automation
  'CNC/Robots': 'warehouse', // 6954.T — Fanuc, industrial CNC + robot OEMs
  'Servo/Robots': 'warehouse', // 6506.T — Yaskawa, servo drives + robots
  'Ind Robots': 'warehouse', // ABBN.SW — ABB, industrial robot integrator
  Industrial: 'warehouse', // RRX — Regal Rexnord, industrial motion
  // Collaborative — cobots + machine vision enabling safe human-robot interaction
  'Machine Vision': 'cobot', // 6861.T — Keyence, machine vision sensors
  'Analog MCU': 'cobot', // MCHP — Microchip, embedded control for cobots
  // Surgical — precision analog + power for medical robots
  'Power Semi': 'surgical', // IFX.DE — Infineon, power semis used in surgical robots
  'Analog/Power': 'surgical', // TXN — Texas Instruments, analog signal chain
  'Power/Analog': 'surgical', // ON — onsemi, power management
  // ABF Substrates do not map cleanly to a single segment
  'ABF Subs': null,
};

/**
 * Hardcoded fallback momentum values (used when bucket is empty).
 *
 * @type {Record<string, number>}
 */
const FALLBACK_MOMENTUM = { humanoid: 97, warehouse: 93, cobot: 89, surgical: 86 };

/**
 * Computes segment momentum from timeframe-enriched tickers.
 * Returns a momentum value 0–100 for each segment in segmentIds.
 * Falls back to hardcoded value when no tickers map to a segment.
 *
 * @param {Record<string, any>} timeframeTickers
 * @param {string[]} [segmentIds]
 * @returns {Record<string, number>}
 */
export function computeSegmentMomentum(timeframeTickers, segmentIds = Object.keys(FALLBACK_MOMENTUM)) {
  /** @type {Record<string, number[]>} */
  const buckets = {};
  for (const id of segmentIds) buckets[id] = [];

  for (const [ticker, data] of Object.entries(timeframeTickers)) {
    const segId = SEGMENT_OF_SE[data.se];
    if (segId && buckets[segId]) {
      const scored = scoreTicker(ticker, data);
      buckets[segId].push(scored.earlyness);
    }
  }

  /** @type {Record<string, number>} */
  const result = {};
  for (const id of segmentIds) {
    const vals = buckets[id];
    if (vals.length === 0) {
      result[id] = FALLBACK_MOMENTUM[id] ?? 50;
    } else {
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      // Scale from earlyness range (0–120) to percentage (0–100)
      result[id] = Math.round(Math.min(100, (avg / 120) * 100));
    }
  }
  return result;
}
