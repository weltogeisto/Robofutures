const LAYER_NAMES = {
  1: 'Cyclical semis / power / analog',
  2: 'Japanese actuators / precision motion',
  3: 'System integrators / robot OEMs',
  4: 'ABF substrates / AI infrastructure',
};

const LAYER_PRESSURE = {
  1: 72,
  2: 91,
  3: 68,
  4: 83,
};

const MS_PER_HOUR = 60 * 60 * 1000;
// Allow normal weekend/holiday gaps while still flagging genuinely stale dashboards.
const STALE_AFTER_HOURS = 72;

export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function payloadAgeHours(updatedRaw, now) {
  if (!updatedRaw) {
    return { updatedRaw: null, updatedAt: null, valid: false, ageHours: null };
  }
  const updatedAt = new Date(updatedRaw);
  if (Number.isNaN(updatedAt.getTime())) {
    return { updatedRaw, updatedAt: null, valid: false, ageHours: null };
  }
  return {
    updatedRaw,
    updatedAt,
    valid: true,
    ageHours: Math.max(0, (now.getTime() - updatedAt.getTime()) / MS_PER_HOUR),
  };
}

export function getDataHealth(quotesPayload, historyPayload, now = new Date()) {
  const quoteEntries = quotesPayload?.quotes && typeof quotesPayload.quotes === 'object'
    ? Object.entries(quotesPayload.quotes)
    : [];
  const historyDates = Array.isArray(historyPayload?.dates) ? historyPayload.dates : [];
  const explicitFailures = [
    ...(Array.isArray(quotesPayload?.failed) ? quotesPayload.failed : []),
    ...(Array.isArray(historyPayload?.failed) ? historyPayload.failed : []),
  ];
  const quoteFailures = quoteEntries
    .filter(([, quote]) => quote?.error || quote?.price == null || Number.isNaN(Number(quote.price)))
    .map(([symbol]) => symbol);
  const failed = [...new Set([...explicitFailures, ...quoteFailures])].sort();

  const quoteAge = payloadAgeHours(quotesPayload?.updated, now);
  const historyAge = payloadAgeHours(historyPayload?.updated, now);
  const validAges = [quoteAge.ageHours, historyAge.ageHours].filter(age => age != null);
  const ageHours = validAges.length ? Math.max(...validAges) : null;
  const updatedRaw = [quoteAge, historyAge]
    .filter(item => item.valid)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]?.updatedRaw ?? null;

  const warnings = [];
  if (!quoteEntries.length) warnings.push('No quote payload loaded');
  if (!historyDates.length) warnings.push('No history payload loaded');
  if (quoteEntries.length && !quoteAge.valid) warnings.push('Quote timestamp missing or invalid');
  if (historyDates.length && !historyAge.valid) warnings.push('History timestamp missing or invalid');
  if (failed.length) warnings.push(`${failed.length} symbol${failed.length === 1 ? '' : 's'} failed`);
  if (ageHours != null && ageHours > STALE_AFTER_HOURS) warnings.push(`Data is ${Math.round(ageHours)}h old`);

  let status = 'fresh';
  if (!quoteEntries.length || !historyDates.length || !quoteAge.valid || !historyAge.valid) {
    status = 'missing';
  } else if (ageHours > STALE_AFTER_HOURS) {
    status = 'stale';
  } else if (failed.length) {
    status = 'degraded';
  }

  const labels = {
    fresh: 'LIVE',
    degraded: 'DEGRADED',
    stale: 'STALE',
    missing: 'NO DATA',
  };

  return {
    status,
    label: labels[status],
    updated: updatedRaw,
    ageHours: ageHours == null ? null : Math.round(ageHours * 10) / 10,
    ages: {
      quotes: quoteAge.ageHours == null ? null : Math.round(quoteAge.ageHours * 10) / 10,
      history: historyAge.ageHours == null ? null : Math.round(historyAge.ageHours * 10) / 10,
    },
    failed,
    warnings,
  };
}

function alertPriorityFromStatus(status) {
  if (status === 'missing' || status === 'stale') return 'high';
  if (status === 'degraded') return 'med';
  return 'low';
}

function priorityLabel(priority) {
  return priority === 'high' ? 'high' : priority === 'med' ? 'med' : 'low';
}

/**
 * @param {{ dataHealth?: ReturnType<typeof getDataHealth>, tickers?: Record<string, any> }} [options]
 */
export function deriveDashboardAlerts({ dataHealth, tickers = {} } = {}) {
  const alerts = [];
  const health = dataHealth ?? getDataHealth(null, null);

  if (health.status !== 'fresh') {
    const priority = alertPriorityFromStatus(health.status);
    alerts.push({
      id: 'data-health',
      type: 'data-health',
      ty: 'data-health',
      p: priority,
      priority,
      t: health.warnings[0] ?? 'Dashboard data needs attention',
      tm: health.updated ? 'Data health' : 'Now',
      read: false,
    });
  }

  const ranked = Object.entries(tickers)
    .map(([symbol, data]) => ({ symbol, ...data }))
    .sort((a, b) => Math.abs(b.ch ?? 0) - Math.abs(a.ch ?? 0));

  ranked
    .filter(ticker => (ticker.ch ?? 0) >= 75)
    .slice(0, 2)
    .forEach(ticker => {
      alerts.push({
        id: `momentum-${ticker.symbol}`,
        type: 'momentum',
        ty: 'momentum',
        p: 'high',
        priority: 'high',
        t: `${ticker.symbol} momentum +${Math.round(ticker.ch)}% on selected timeframe`,
        tm: 'Momentum',
        read: false,
      });
    });

  ranked
    .filter(ticker => (ticker.rb ?? 0) >= 98)
    .slice(0, 2)
    .forEach(ticker => {
      alerts.push({
        id: `crowding-${ticker.symbol}`,
        type: 'crowding',
        ty: 'crowding',
        p: 'med',
        priority: 'med',
        t: `${ticker.symbol} near range high; wait for pullback / confirm volume`,
        tm: 'Crowding',
        read: false,
      });
    });

  if (health.failed.length > 0) {
    const symbols = health.failed.slice(0, 4).join(', ');
    const more = health.failed.length > 4 ? ` +${health.failed.length - 4} more` : '';
    alerts.push({
      id: 'failed-symbols',
      type: 'failed-symbols',
      ty: 'failed-symbols',
      p: 'med',
      priority: 'med',
      t: `${health.failed.length} symbol${health.failed.length === 1 ? '' : 's'} failed to fetch: ${symbols}${more}`,
      tm: 'Data',
      read: false,
    });
  }

  return alerts.slice(0, 6).map(alert => ({
    ...alert,
    p: priorityLabel(alert.p),
  }));
}

export function scoreTicker(ticker, data = {}) {
  const exposure = data.ex ?? 0;
  const rebound = data.rb ?? 0;
  const change = data.ch ?? 0;
  const layerBonus = data.l === 2 ? 10 : data.l === 1 ? 6 : data.l === 4 ? 4 : 0;
  const crowdingPenalty = rebound > 98 ? 10 : rebound > 92 ? 5 : 0;
  const earlyness = clamp(
    exposure * 0.35
    + Math.max(change, 0) * 0.28
    + Math.max(100 - rebound, 0) * 0.22
    + layerBonus
    - crowdingPenalty,
    0,
    120,
  );
  const momentum = clamp(50 + change * 0.32 + rebound * 0.22 + exposure * 0.2, 0, 120);
  const status = rebound >= 98
    ? 'Crowded / wait for pullback'
    : earlyness >= 45
      ? 'Early / under-owned'
      : momentum >= 70
        ? 'Confirming momentum'
        : 'Watch only';

  return {
    ticker,
    ...data,
    name: data.n,
    layerName: LAYER_NAMES[data.l] ?? 'Other',
    earlyness,
    momentum,
    status,
    whyNow: data.l === 2
      ? 'Actuation bottleneck has high robotics purity and often moves before revenue confirmation.'
      : data.l === 1
        ? 'Analog/power semis offer cyclical recovery plus robotics optionality.'
        : data.l === 4
          ? 'AI substrate bottleneck can benefit before downstream robot volumes are obvious.'
          : 'Integrator momentum confirms downstream adoption but can be later-cycle.',
  };
}

export function rankMomentumTickers(tickers = {}) {
  return Object.entries(tickers)
    .map(([ticker, data]) => scoreTicker(ticker, data))
    .sort((a, b) => b.earlyness - a.earlyness || b.momentum - a.momentum);
}

export function mapEcosystemLayers(tickers = {}) {
  const layers = new Map();
  Object.entries(tickers).forEach(([ticker, data]) => {
    const id = data.l ?? 0;
    if (!layers.has(id)) {
      layers.set(id, {
        id,
        name: LAYER_NAMES[id] ?? 'Other',
        bottleneckScore: LAYER_PRESSURE[id] ?? 50,
        tickers: [],
        signal: (LAYER_PRESSURE[id] ?? 50) >= 85 ? 'bottleneck' : (LAYER_PRESSURE[id] ?? 50) >= 75 ? 'watch' : 'normal',
      });
    }
    layers.get(id).tickers.push(scoreTicker(ticker, data));
  });
  return [...layers.values()]
    .map(layer => ({
      ...layer,
      tickers: layer.tickers.sort((a, b) => b.earlyness - a.earlyness),
    }))
    .sort((a, b) => b.bottleneckScore - a.bottleneckScore);
}

export function classifyCycleStage(tickers = {}) {
  const ranked = rankMomentumTickers(tickers);
  /** @type {(t: ReturnType<typeof scoreTicker>) => boolean} */
  const isL1 = (t) => /** @type {any} */ (t).l === 1;
  /** @type {(t: ReturnType<typeof scoreTicker>) => boolean} */
  const isL2 = (t) => /** @type {any} */ (t).l === 2;
  /** @type {(t: ReturnType<typeof scoreTicker>) => boolean} */
  const isL3 = (t) => /** @type {any} */ (t).l === 3;
  const avgSemis = ranked.filter(isL1).reduce((s, t, _, arr) => s + t.momentum / arr.length, 0);
  const actuation = ranked.filter(isL2).reduce((s, t, _, arr) => s + t.earlyness / arr.length, 0);
  const integrators = ranked.filter(isL3).reduce((s, t, _, arr) => s + t.momentum / arr.length, 0);

  let phase = 2;
  let stage = 'Early public-market positioning';
  if (actuation >= 45 && avgSemis >= 72 && integrators < 78) {
    phase = 3;
    stage = 'Upstream bottleneck / early order-book preparation';
  } else if (integrators >= 78) {
    phase = 4;
    stage = 'Integrator confirmation / downstream adoption';
  }

  return {
    phase,
    stage,
    confidence: clamp((avgSemis + actuation + integrators) / 3),
    implication: phase <= 3
      ? 'Favor upstream bottlenecks and under-owned supplier proxies before broad downstream confirmation.'
      : 'Momentum is confirming downstream; monitor crowding and pullback entries.',
    evidence: [
      `Layer 2 actuation earlyness: ${Math.round(actuation)}.`,
      `Layer 1 semi momentum: ${Math.round(avgSemis)}.`,
      `Layer 3 integrator momentum: ${Math.round(integrators)}.`,
    ],
  };
}

export function computeSignalCockpit(tickers = {}) {
  const topMomentumTickers = rankMomentumTickers(tickers);
  const ecosystemLayers = mapEcosystemLayers(tickers);
  const cycleClock = classifyCycleStage(tickers);
  const actionQueue = [
    ...topMomentumTickers.filter(t => t.status === 'Early / under-owned').slice(0, 3).map(t => ({
      entity: t.ticker,
      action: `Research ${t.ticker}`,
      rationale: `${t.layerName}; earlyness ${t.earlyness}; ${t.whyNow}`,
    })),
    ...ecosystemLayers.filter(l => l.signal === 'bottleneck').slice(0, 1).map(l => ({
      entity: `Layer ${l.id}`,
      action: `Map beneficiaries in ${l.name}`,
      rationale: `Bottleneck score ${l.bottleneckScore}; leading tickers: ${l.tickers.slice(0, 4).map(t => t.ticker).join(', ')}`,
    })),
  ];

  return { cycleClock, topMomentumTickers, ecosystemLayers, actionQueue };
}
