// @ts-nocheck — lightweight-charts has no bundled .d.ts file in all versions
import React, { useRef, useEffect } from 'react';

/**
 * @typedef {{ t: string|number, o: number, h: number, l: number, c: number, v?: number }} OhlcBar
 */

/**
 * Candlestick chart using lightweight-charts (Apache-2.0).
 * Code-split via React.lazy in TickerDetailDrawer to keep main bundle slim.
 *
 * @param {{ ohlc: OhlcBar[], height?: number }} props
 */
const CandlestickChart = ({ ohlc, height = 320 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !ohlc?.length) return;

    let chart;
    import('lightweight-charts').then(({ createChart, ColorType }) => {
      chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#0f1011' },
          textColor: '#62666d',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.04)' },
          horzLines: { color: 'rgba(255,255,255,0.04)' },
        },
        width: containerRef.current.clientWidth,
        height,
        timeScale: { borderColor: 'rgba(255,255,255,0.08)' },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      const sorted = [...ohlc].sort((a, b) => {
        const ta = typeof a.t === 'string' ? a.t : String(a.t);
        const tb = typeof b.t === 'string' ? b.t : String(b.t);
        return ta < tb ? -1 : ta > tb ? 1 : 0;
      });

      candleSeries.setData(
        sorted.map((bar) => ({
          time: typeof bar.t === 'number' ? bar.t : bar.t.slice(0, 10),
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
        })),
      );

      chart.timeScale().fitContent();
    });

    return () => {
      if (chart) chart.remove();
    };
  }, [ohlc, height]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
};

export default CandlestickChart;
