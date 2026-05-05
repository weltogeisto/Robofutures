import assert from 'node:assert/strict';
import { computeSignalCockpit, rankMomentumTickers, mapEcosystemLayers } from '../src/lib/signalCockpit.js';

const tickers = {
  'ON': { n: 'onsemi', l: 1, ch: 105, rb: 99, ex: 35, ti: 'Core', se: 'Power/Analog' },
  '6324.T': { n: 'Harmonic Drive', l: 2, ch: 67, rb: 95, ex: 80, ti: 'Core', se: 'Harmonic Gears' },
  '6954.T': { n: 'Fanuc', l: 3, ch: 36, rb: 88, ex: 88, ti: 'Core', se: 'CNC/Robots' },
  '3037.TW': { n: 'Unimicron', l: 4, ch: 314, rb: 99, ex: 50, ti: 'Sat', se: 'ABF Subs' },
};

const ranked = rankMomentumTickers(tickers);
assert.ok(ranked.length === 4);
assert.ok(ranked[0].earlyness >= ranked[1].earlyness);
assert.ok(ranked.some(t => t.ticker === '6324.T' && t.whyNow.includes('Actuation')));

const layers = mapEcosystemLayers(tickers);
assert.equal(layers[0].id, 2);
assert.ok(layers[0].signal === 'bottleneck');

const cockpit = computeSignalCockpit(tickers);
assert.ok(cockpit.cycleClock.stage);
assert.ok(cockpit.topMomentumTickers.length >= 3);
assert.ok(cockpit.actionQueue.length >= 1);

console.log('ok - signal cockpit model');
