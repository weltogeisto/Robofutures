import React from 'react';
import LayerBadge from '../LayerBadge.jsx';
import Sparkline from '../Sparkline.jsx';

/** @typedef {import('../../types.js').Ticker} Ticker */

const LAYERS = [
  { id: 1, name: 'Cyclical Semis', rank: '1st', color: '#5e6ad2', desc: 'Highest Convexity' },
  { id: 2, name: 'Japanese Actuators', rank: '1st', color: '#7170ff', desc: 'Purest Humanoid Play' },
  { id: 3, name: 'System Integrators', rank: '2nd', color: '#828fff', desc: 'Industrial Recovery' },
  { id: 4, name: 'ABF Substrates', rank: '3rd', color: '#8b5cf6', desc: 'AI Infrastructure' },
];

/**
 * Value Chain tab — full 14-ticker table grouped by layer.
 *
 * @param {{
 *   tickers: Record<string, Ticker>,
 *   tickersByLayer: Record<number, string[]>,
 *   timeScale: string,
 *   liveHistory: any,
 * }} props
 */
const ValueChainTab = ({ tickers, tickersByLayer, timeScale, liveHistory }) => (
  <div className="card">
    <div className="card-title">Full Ticker Universe — 4-Layer Humanoid Robotics Value Chain</div>
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Name</th>
            <th>Layer</th>
            <th>Price</th>
            <th>{timeScale.toUpperCase()} Chg</th>
            <th>Rebound</th>
            <th>Exposure</th>
            <th>Tier</th>
            <th>Segment</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {LAYERS.map((layer) => {
            const layerTickers = tickersByLayer[layer.id] || [];
            return (
              <React.Fragment key={layer.id}>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <td
                    colSpan={10}
                    style={{ padding: '8px 12px', fontWeight: 510, color: layer.color, fontSize: 12 }}
                  >
                    {layer.rank}. {layer.name} — {layer.desc}
                  </td>
                </tr>
                {layerTickers.map((tk) => {
                  const d = tickers[tk];
                  if (!d) return null;
                  const isUp = d.ch >= 0;
                  return (
                    <tr key={tk}>
                      <td style={{ fontWeight: 500 }}>{tk}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{d.n}</td>
                      <td>
                        <LayerBadge id={d.l} />
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {d.p} {d.c}
                      </td>
                      <td
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: isUp ? 'var(--green)' : 'var(--red)',
                        }}
                      >
                        {isUp ? '+' : ''}
                        {d.ch}%
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{d.rb}%</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div
                            style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}
                          >
                            <div
                              style={{ width: d.ex + '%', height: '100%', background: '#7170ff', borderRadius: 2 }}
                            />
                          </div>
                          <span style={{ fontSize: 11 }}>{d.ex}%</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={
                            'badge-tier-' + (d.ti === 'Core' ? 'core' : d.ti === 'Sat' ? 'satellite' : 'spec')
                          }
                          style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4 }}
                        >
                          {d.ti}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{d.se}</td>
                      <td>
                        <Sparkline data={liveHistory?.tickers?.[tk]?.close?.slice(-30)} />
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default ValueChainTab;
