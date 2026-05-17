/** @typedef {import('../../types.js').Ticker} Ticker */

const LAYERS = [
  {
    id: 1,
    name: 'Cyclical Semis',
    rank: '1st',
    color: '#5e6ad2',
    desc: 'Highest Convexity',
    thesis: 'Auto/Industrial cycle bottom + free robotics option',
  },
  {
    id: 2,
    name: 'Japanese Actuators',
    rank: '1st',
    color: '#7170ff',
    desc: 'Purest Humanoid Play',
    thesis: 'Harmonic drive monopoly. 40-60 actuators per unit.',
  },
  {
    id: 3,
    name: 'System Integrators',
    rank: '2nd',
    color: '#828fff',
    desc: 'Industrial Recovery',
    thesis: 'Fanuc 12% below 52w high. Automation wave.',
  },
  {
    id: 4,
    name: 'ABF Substrates',
    rank: '3rd',
    color: '#8b5cf6',
    desc: 'AI Infrastructure',
    thesis: "Seller's market. AI + robotics double tailwind.",
  },
];

/**
 * Thesis tab — 4 investment layer cards with expandable ticker drill-down.
 *
 * @param {{
 *   tickers: Record<string, Ticker>,
 *   tickersByLayer: Record<number, string[]>,
 *   expandedLayer: number|null,
 *   setExpandedLayer: (id: number|null) => void,
 * }} props
 */
const ThesisTab = ({ tickers, tickersByLayer, expandedLayer, setExpandedLayer }) => (
  <div>
    <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 16 }}>
      Investment thesis derived from Citrini Research + own analysis. Updated May 4, 2026.
    </p>
    <div className="grid-2">
      {LAYERS.map((layer) => {
        const layerTickers = tickersByLayer[layer.id] || [];
        const isExpanded = expandedLayer === layer.id;
        return (
          <div
            key={layer.id}
            className="card"
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
            onKeyDown={(e) =>
              e.key === 'Enter' || e.key === ' ' ? setExpandedLayer(isExpanded ? null : layer.id) : null
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isExpanded ? 12 : 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: layer.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {layer.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 510, fontSize: 15 }}>{layer.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{layer.desc}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-quaternary)', fontFamily: 'JetBrains Mono, monospace' }}>
                {layerTickers.length} tickers
              </span>
            </div>
            {isExpanded && (
              <>
                <div
                  style={{
                    padding: '8px 0',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {layer.thesis}
                </div>
                <div style={{ marginTop: 8 }}>
                  {layerTickers.map((tk) => {
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
                          padding: '4px 0',
                          fontSize: 12,
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                        }}
                      >
                        <span style={{ fontWeight: 500, width: 50 }}>{tk}</span>
                        <span style={{ flex: 1, color: 'var(--text-tertiary)' }}>{d.n}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-quaternary)' }}>
                          {d.p}
                          {d.c}
                        </span>
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            color: isUp ? 'var(--green)' : 'var(--red)',
                            fontSize: 11,
                          }}
                        >
                          {isUp ? '+' : ''}
                          {d.ch}%
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-quaternary)' }}>rb:{d.rb}%</span>
                        <span style={{ fontSize: 10, color: 'var(--text-quaternary)' }}>ex:{d.ex}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default ThesisTab;
