import React, { Suspense, lazy } from 'react';
import Sparkline from './Sparkline.jsx';

/** @typedef {import('../types.js').Ticker} Ticker */

// Code-split candlestick chart to keep main bundle slim (~130 KB gz for lightweight-charts)
const CandlestickChart = lazy(() => import('./CandlestickChart.jsx'));

/**
 * Right-side drawer showing ticker KPIs + candlestick chart.
 * Triggered by clicking a row in ValueChainTab.
 *
 * @param {{
 *   ticker: string|null,
 *   data: Ticker|null,
 *   ohlc: Array<{t:string,o:number,h:number,l:number,c:number,v?:number}>|null,
 *   closes30: number[]|null,
 *   onClose: () => void,
 * }} props
 */
const TickerDetailDrawer = ({ ticker, data, ohlc, closes30, onClose }) => {
  if (!ticker || !data) return null;

  return (
    <>
      {/* backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close ticker detail"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
        }}
        onClick={onClose}
        onKeyDown={(e) => (e.key === 'Escape' || e.key === 'Enter' ? onClose() : null)}
      />
      {/* drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${ticker} detail`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px, 100vw)',
          background: 'var(--bg-panel, #0f1011)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          zIndex: 201,
          overflowY: 'auto',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{ticker}</h2>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 13, marginTop: 2 }}>{data.n}</div>
          </div>
          <button
            className="tab-btn"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: '4px 10px', fontSize: 13 }}
          >
            ✕
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { l: 'Price', v: `${data.p} ${data.c}` },
            { l: 'Change', v: `${data.ch >= 0 ? '+' : ''}${data.ch}%` },
            { l: 'Rebound', v: `${data.rb}%` },
            { l: 'Exposure', v: `${data.ex}%` },
          ].map((kpi) => (
            <div key={kpi.l} className="card" style={{ padding: '10px 14px' }}>
              <div className="card-label">{kpi.l}</div>
              <div
                className="card-value"
                style={{
                  fontSize: 18,
                  color:
                    kpi.l === 'Change'
                      ? data.ch >= 0
                        ? 'var(--green)'
                        : 'var(--red)'
                      : 'var(--text-primary)',
                }}
              >
                {kpi.v}
              </div>
            </div>
          ))}
        </div>

        {/* 30-day sparkline */}
        {closes30 && closes30.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 8 }}>
              30-Day Price Trend
            </div>
            <Sparkline data={closes30} height={48} />
          </div>
        )}

        {/* Candlestick chart */}
        <div>
          <div className="card-title" style={{ marginBottom: 8 }}>
            Candlestick (1Y daily)
          </div>
          {ohlc && ohlc.length > 0 ? (
            <Suspense
              fallback={
                <div
                  style={{
                    height: 320,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-quaternary)',
                    fontSize: 13,
                  }}
                >
                  Loading chart…
                </div>
              }
            >
              <CandlestickChart ohlc={ohlc} height={320} />
            </Suspense>
          ) : (
            <div
              style={{
                height: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-quaternary)',
                fontSize: 13,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 6,
              }}
            >
              No OHLC data yet — run scripts/update_data.py to generate candle data
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default TickerDetailDrawer;
