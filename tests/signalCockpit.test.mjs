import { describe, it, expect } from 'vitest';
import { computeSignalCockpit, rankMomentumTickers, mapEcosystemLayers, deriveDashboardAlerts, getDataHealth } from '../src/lib/signalCockpit.js';

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

describe('deriveDashboardAlerts — failed symbols', () => {
  it('emits failed-symbols alert when data has failed symbols', () => {
    const now = new Date('2026-05-15T12:00:00Z');
    const freshUpdated = '2026-05-15T11:00:00Z';
    const health = getDataHealth(
      { updated: freshUpdated, quotes: { ON: { price: 10 }, MCHP: { error: true, price: null } }, failed: ['MCHP', 'IFX.DE'] },
      { updated: freshUpdated, dates: ['2026-01-01'], r: [100], sp: [100], nd: [100] },
      now,
    );
    expect(health.failed.length).toBeGreaterThan(0);

    const alerts = deriveDashboardAlerts({ dataHealth: health, tickers });
    const failedAlert = alerts.find((a) => a.type === 'failed-symbols');
    expect(failedAlert).toBeTruthy();
    expect(failedAlert?.t).toContain('MCHP');
  });

  it('does not emit failed-symbols alert when no failures', () => {
    const now = new Date('2026-05-15T12:00:00Z');
    const freshUpdated = '2026-05-15T11:00:00Z';
    const health = getDataHealth(
      { updated: freshUpdated, quotes: { ON: { price: 10 } } },
      { updated: freshUpdated, dates: ['2026-01-01'], r: [100], sp: [100], nd: [100] },
      now,
    );
    const alerts = deriveDashboardAlerts({ dataHealth: health, tickers });
    expect(alerts.find((a) => a.type === 'failed-symbols')).toBeUndefined();
  });
});
