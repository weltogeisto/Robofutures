import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LayerBadge from '../LayerBadge.jsx';
import { computeSegmentMomentum } from '../../lib/segmentMomentum.js';

// Import types for JSDoc only — no runtime cost
/** @typedef {import('../../types.js').Ticker} Ticker */
/** @typedef {import('../../types.js').CockpitData} CockpitData */

const SEG_DEFS = [
  { id: 'humanoid', n: 'Humanoid', c: '#8b5cf6' },
  { id: 'warehouse', n: 'Warehouse', c: '#3b82f6' },
  { id: 'cobot', n: 'Collaborative', c: '#10b981' },
  { id: 'surgical', n: 'Surgical', c: '#ec4899' },
];

const TIME_SCALES = [
  { id: '1d', label: '1D' },
  { id: '3d', label: '3D' },
  { id: '1w', label: '1W' },
  { id: '1m', label: '1M' },
  { id: '3m', label: '3M' },
  { id: '6m', label: '6M' },
  { id: '1y', label: '1Y' },
  { id: '3y', label: '3Y' },
];

/**
 * @param {Array<{d:string,r:number,sp:number,nd:number}>} data
 * @param {string} scale
 * @returns {Array<{d:string,r:number,sp:number,nd:number}>}
 */
const filterTimeScale = (data, scale) => {
  if (!data?.length) return [];
  const map = { '1d': 1, '3d': 3, '1w': 7, '1m': 30, '3m': 90, '6m': 180, '1y': 365, '3y': 1095 };
  const days = map[scale] || 180;
  const last = new Date((data.at(-1)?.d || new Date().toISOString().slice(0, 10)) + 'T23:59:59');
  const cutoff = new Date(last);
  cutoff.setDate(cutoff.getDate() - days);
  const filtered = data.filter((d) => new Date(d.d + 'T23:59:59') >= cutoff);
  if (filtered.length === 0) return data;
  const base = filtered[0];
  return filtered.map((d) => ({
    ...d,
    r: Math.round((d.r / base.r) * 10000) / 100,
    sp: Math.round((d.sp / base.sp) * 10000) / 100,
    nd: Math.round((d.nd / base.nd) * 10000) / 100,
  }));
};

const formatXAxis = (dateStr, scale) => {
  const d = new Date(dateStr + 'T12:00:00');
  if (scale === '1d' || scale === '3d') return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' });
  if (scale === '1w') return d.toLocaleDateString('de-DE', { weekday: 'short' });
  if (scale === '1m') return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  if (scale === '3m' || scale === '6m') return d.toLocaleDateString('de-DE', { month: 'short' });
  return d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
};

/**
 * Overview tab — KPIs, cycle clock, momentum radar, layer map, chart, segments, watchlist.
 *
 * @param {{
 *   cockpit: CockpitData,
 *   tickers: Record<string, Ticker>,
 *   watchlist: string[],
 *   timeScale: string,
 *   setTimeScale: (s: string) => void,
 *   chartDataRaw: Array<{d:string,r:number,sp:number,nd:number}>,
 * }} props
 */
const OverviewTab = ({ cockpit, tickers, watchlist, timeScale, setTimeScale, chartDataRaw }) => {
  const chartData = filterTimeScale(chartDataRaw, timeScale);
  const segMomentum = useMemo(() => computeSegmentMomentum(tickers), [tickers]);

  return (
    <>
      <div className="grid-4" style={{ marginBottom: 16 }}>
        {[
          { l: 'Layer Score', v: '4.2/5', sub: 'Composite' },
          { l: 'Tickers Tracked', v: Object.keys(tickers).length, sub: 'Across 4 layers' },
          {
            l: 'Avg Rebound',
            v:
              Math.round(
                Object.values(tickers).reduce((s, t) => s + t.rb, 0) / Object.keys(tickers).length,
              ) + '%',
            sub: 'From 52w low',
          },
          { l: 'Watchlist', v: watchlist.length, sub: 'Selected positions' },
        ].map((kpi) => (
          <div key={kpi.l} className="card">
            <div className="card-title">{kpi.l}</div>
            <div className="card-value">{kpi.v}</div>
            <div className="card-label">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-title">Cycle Clock</div>
          <div className="card-value" style={{ fontSize: 28 }}>
            P{cockpit.cycleClock.phase}
          </div>
          <div style={{ fontWeight: 510, fontSize: 14, marginTop: 4 }}>{cockpit.cycleClock.stage}</div>
          <div className="card-label" style={{ marginTop: 8 }}>
            {cockpit.cycleClock.implication}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-quaternary)' }}>
            Confidence {cockpit.cycleClock.confidence}%
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-title">Momentum Ticker Radar</div>
          {cockpit.topMomentumTickers.slice(0, 5).map((t) => (
            <div
              key={t.ticker}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: 12,
              }}
            >
              <span style={{ fontWeight: 600, width: 62 }}>{t.ticker}</span>
              <span
                style={{
                  flex: 1,
                  color: 'var(--text-tertiary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.name}
              </span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: t.status.startsWith('Early') ? 'var(--green)' : 'var(--text-quaternary)',
                }}
              >
                {t.earlyness}
              </span>
            </div>
          ))}
        </div>

        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-title">Action Queue</div>
          {cockpit.actionQueue.slice(0, 3).map((item) => (
            <div key={item.entity} style={{ padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 510 }}>{item.action}</div>
              <div className="card-label">{item.rationale}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Upstream / Downstream Layer Map</div>
        <div className="grid-4" style={{ marginTop: 10 }}>
          {cockpit.ecosystemLayers.map((layer) => (
            <div
              key={layer.id}
              style={{
                padding: 10,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <LayerBadge id={layer.id} />
                <span style={{ fontSize: 12, fontWeight: 510 }}>{layer.name}</span>
              </div>
              <div
                style={{
                  height: 4,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: `${layer.bottleneckScore}%`,
                    height: '100%',
                    background:
                      layer.signal === 'bottleneck' ? '#ef4444' : layer.signal === 'watch' ? '#f59e0b' : '#7170ff',
                  }}
                />
              </div>
              <div className="card-label">
                Bottleneck {layer.bottleneckScore} · {layer.tickers.slice(0, 3).map((t) => t.ticker).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TIME SCALE SELECTOR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 12,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-quaternary)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            letterSpacing: '0.3px',
          }}
        >
          TIMEFRAME
        </span>
        {TIME_SCALES.map((ts) => (
          <button
            key={ts.id}
            className={'tab-btn' + (timeScale === ts.id ? ' active' : '')}
            onClick={() => setTimeScale(ts.id)}
            style={{ padding: '3px 10px', fontSize: 11, whiteSpace: 'nowrap' }}
          >
            {ts.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Robotics Index vs Benchmarks (Normalized)</div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="d"
                tick={{ fill: '#62666d', fontSize: 11 }}
                tickFormatter={(v) => formatXAxis(v, timeScale)}
              />
              <YAxis tick={{ fill: '#62666d', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#191a1b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}
                labelFormatter={(v) =>
                  new Date(v + 'T12:00:00').toLocaleDateString('de-DE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                }
              />
              <Line type="monotone" dataKey="r" stroke="#7170ff" strokeWidth={2} dot={false} name="Robotics Index" />
              <Line type="monotone" dataKey="sp" stroke="#8a8f98" strokeWidth={1.5} dot={false} name="S&P 500" />
              <Line type="monotone" dataKey="nd" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="NASDAQ" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-quaternary)',
              fontSize: 13,
            }}
          >
            No history available
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Segment Momentum</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SEG_DEFS.map((s) => {
              const m = segMomentum[s.id] ?? 50;
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.c }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.n}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-primary)' }}>
                    {m}%
                  </span>
                  <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ width: m + '%', height: '100%', background: s.c, borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Watchlist Momentum</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {watchlist.map((tk) => {
              const d = tickers[tk];
              if (!d) return null;
              const isUp = d.ch >= 0;
              return (
                <div
                  key={tk}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={{ fontWeight: 500, width: 60 }}>{tk}</span>
                  <span style={{ flex: 1, color: 'var(--text-tertiary)', fontSize: 12 }}>{d.n}</span>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: isUp ? 'var(--green)' : 'var(--red)',
                      fontSize: 12,
                    }}
                  >
                    {isUp ? '+' : ''}
                    {d.ch}%
                  </span>
                  <LayerBadge id={d.l} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewTab;
