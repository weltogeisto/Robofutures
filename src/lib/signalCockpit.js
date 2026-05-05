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

export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
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
  const avgSemis = ranked.filter(t => t.l === 1).reduce((s, t, _, arr) => s + t.momentum / arr.length, 0);
  const actuation = ranked.filter(t => t.l === 2).reduce((s, t, _, arr) => s + t.earlyness / arr.length, 0);
  const integrators = ranked.filter(t => t.l === 3).reduce((s, t, _, arr) => s + t.momentum / arr.length, 0);

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
