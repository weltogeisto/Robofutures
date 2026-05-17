import { describe, it, expect } from 'vitest';
import { computeSignalCockpit, rankMomentumTickers, mapEcosystemLayers } from '../src/lib/signalCockpit.js';

const tickers = {
  ON: { n: 'onsemi', l: 1, ch: 105, rb: 99, ex: 35, ti: 'Core', se: 'Power/Analog' },
  '6324.T': { n: 'Harmonic Drive', l: 2, ch: 67, rb: 95, ex: 80, ti: 'Core', se: 'Harmonic Gears' },
  '6954.T': { n: 'Fanuc', l: 3, ch: 36, rb: 88, ex: 88, ti: 'Core', se: 'CNC/Robots' },
  '3037.TW': { n: 'Unimicron', l: 4, ch: 314, rb: 99, ex: 50, ti: 'Sat', se: 'ABF Subs' },
};

describe('rankMomentumTickers', () => {
  it('returns all tickers sorted by earlyness', () => {
    const ranked = rankMomentumTickers(tickers);
    expect(ranked.length).toBe(4);
    expect(ranked[0].earlyness).toBeGreaterThanOrEqual(ranked[1].earlyness);
    expect(ranked.some((t) => t.ticker === '6324.T' && t.whyNow.includes('Actuation'))).toBe(true);
  });
});

describe('mapEcosystemLayers', () => {
  it('puts layer 2 first as bottleneck', () => {
    const layers = mapEcosystemLayers(tickers);
    expect(layers[0].id).toBe(2);
    expect(layers[0].signal).toBe('bottleneck');
  });
});

describe('computeSignalCockpit', () => {
  it('returns cockpit with expected shape', () => {
    const cockpit = computeSignalCockpit(tickers);
    expect(cockpit.cycleClock.stage).toBeTruthy();
    expect(cockpit.topMomentumTickers.length).toBeGreaterThanOrEqual(3);
    expect(cockpit.actionQueue.length).toBeGreaterThanOrEqual(1);
  });
});
