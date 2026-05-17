import { describe, it, expect } from 'vitest';
import { computeSegmentMomentum } from '../src/lib/segmentMomentum.js';

const ACTUATOR_DOMINATED = {
  '6324.T': { n: 'Harmonic Drive', l: 2, ch: 80, rb: 95, ex: 80, se: 'Harmonic Gears' },
  '6268.T': { n: 'Nabtesco', l: 2, ch: 70, rb: 93, ex: 60, se: 'RV Gears' },
  '6954.T': { n: 'Fanuc', l: 3, ch: 20, rb: 70, ex: 88, se: 'CNC/Robots' },
  '6506.T': { n: 'Yaskawa', l: 3, ch: 15, rb: 65, ex: 75, se: 'Servo/Robots' },
};

// High-momentum warehouse tickers + very-low humanoid ticker
const INTEGRATOR_DOMINATED = {
  '6954.T': { n: 'Fanuc', l: 3, ch: 90, rb: 20, ex: 88, se: 'CNC/Robots' },
  '6506.T': { n: 'Yaskawa', l: 3, ch: 85, rb: 20, ex: 75, se: 'Servo/Robots' },
  '6324.T': { n: 'Harmonic Drive', l: 2, ch: 1, rb: 10, ex: 5, se: 'Harmonic Gears' },
};

describe('computeSegmentMomentum', () => {
  it('returns momentum for all standard segments', () => {
    const result = computeSegmentMomentum(ACTUATOR_DOMINATED);
    expect(typeof result.humanoid).toBe('number');
    expect(typeof result.warehouse).toBe('number');
    expect(typeof result.cobot).toBe('number');
    expect(typeof result.surgical).toBe('number');
  });

  it('returns values in [0, 100] range', () => {
    const result = computeSegmentMomentum(ACTUATOR_DOMINATED);
    for (const val of Object.values(result)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
  });

  it('humanoid > warehouse when actuator tickers dominate', () => {
    const result = computeSegmentMomentum(ACTUATOR_DOMINATED);
    expect(result.humanoid).toBeGreaterThan(result.warehouse);
  });

  it('warehouse > humanoid when integrator tickers dominate', () => {
    const result = computeSegmentMomentum(INTEGRATOR_DOMINATED);
    expect(result.warehouse).toBeGreaterThan(result.humanoid);
  });

  it('falls back to hardcoded values for empty buckets', () => {
    // Empty tickers → all fallback
    const result = computeSegmentMomentum({});
    expect(result.humanoid).toBe(97);
    expect(result.warehouse).toBe(93);
    expect(result.cobot).toBe(89);
    expect(result.surgical).toBe(86);
  });
});
