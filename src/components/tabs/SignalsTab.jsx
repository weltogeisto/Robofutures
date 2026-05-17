/** @typedef {import('../../types.js').Alert} Alert */

const INDICATORS = [
  { n: 'Patent Momentum', v: 82, l: 'USPTO filings +12%' },
  { n: 'Hiring Velocity', v: 78, l: 'LinkedIn robotics jobs +8%' },
  { n: 'Order Book', v: 71, l: 'Capex proxy +5%' },
  { n: 'Policy Tailwinds', v: 85, l: 'Subsidies + defense +15%' },
  { n: 'Supply Chain', v: 58, l: 'Component availability -5%' },
  { n: 'Earnings Sentiment', v: 74, l: 'NLP analysis +6%' },
];

/**
 * Signals tab — leading indicator gauges + derived alert list.
 *
 * @param {{ alerts: Alert[] }} props
 */
const SignalsTab = ({ alerts }) => (
  <div className="grid-3">
    {INDICATORS.map((ind) => (
      <div key={ind.n} className="card">
        <div className="card-title">{ind.n}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <div className="card-value" style={{ fontSize: 36 }}>
            {ind.v}
          </div>
          <span
            style={{
              color: ind.v >= 70 ? 'var(--green)' : ind.v >= 50 ? 'var(--amber)' : 'var(--red)',
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            {'▲'}
            {ind.l.split(' ').pop()}
          </span>
        </div>
        <div style={{ marginTop: 8, width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <div
            style={{
              width: ind.v + '%',
              height: '100%',
              background: ind.v >= 70 ? '#10b981' : ind.v >= 50 ? '#f59e0b' : '#ef4444',
              borderRadius: 2,
            }}
          />
        </div>
        <div className="card-label" style={{ marginTop: 8 }}>
          {ind.l}
        </div>
      </div>
    ))}
    <div className="card" style={{ gridColumn: 'span 3' }}>
      <div className="card-title">Recent Signals</div>
      {alerts.map((a) => (
        <div
          key={a.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            fontSize: 13,
          }}
        >
          <span className={'level-dot level-' + (a.p === 'high' ? 'high' : a.p === 'med' ? 'ok' : 'low')} />
          <span>{a.t}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-quaternary)' }}>{a.tm}</span>
          {!a.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7170ff' }} />}
        </div>
      ))}
    </div>
  </div>
);

export default SignalsTab;
