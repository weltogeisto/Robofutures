#!/usr/bin/env python3
"""
Fetch live market data for the Robofutures dashboard.
Uses yfinance (free, no API key needed).
Outputs JSON files to public/data/ for the React app to consume.
"""

import json
import os
import sys
from datetime import datetime, timedelta

try:
    import yfinance as yf
except ImportError:
    print("Installing yfinance...")
    os.system(f"{sys.executable} -m pip install yfinance")
    import yfinance as yf

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Tickers ──────────────────────────────────────────────────────────────────

COMPANY_TICKERS = {
    'NVDA': 'NVIDIA',
    'ISRG': 'Intuitive Surgical',
    'ABB':  'ABB Ltd',
    'FANUY': 'Fanuc Corp',
    'ROK':  'Rockwell Automation',
    'SYM':  'Symbotic',
    'PATH': 'UiPath',
    'TSLA': 'Tesla (Optimus)',
}

INDEX_TICKERS = {
    'SPY':  'sp500',
    'QQQ':  'nasdaq',
    'SOXX': 'soxx',
    'XLI':  'industrials',
}

# A basket of robotics-exposed tickers to build a synthetic "robotics" index
ROBOTICS_BASKET = ['NVDA', 'ISRG', 'ABB', 'ROK', 'SYM', 'TSLA', 'FANUY', 'PATH']

# Company metadata (static attributes that don't come from price data)
COMPANY_META = {
    'NVDA':  {'exposure': 38, 'segments': ['humanoid', 'warehouse', 'surgical'], 'tier': 'Core'},
    'ISRG':  {'exposure': 95, 'segments': ['surgical'], 'tier': 'Core'},
    'ABB':   {'exposure': 48, 'segments': ['cobot', 'industrial'], 'tier': 'Satellite'},
    'FANUY': {'exposure': 88, 'segments': ['cobot', 'industrial'], 'tier': 'Satellite'},
    'ROK':   {'exposure': 58, 'segments': ['cobot', 'industrial'], 'tier': 'Core'},
    'SYM':   {'exposure': 100, 'segments': ['warehouse'], 'tier': 'Speculative'},
    'PATH':  {'exposure': 72, 'segments': [], 'tier': 'Satellite'},
    'TSLA':  {'exposure': 28, 'segments': ['humanoid'], 'tier': 'Satellite'},
}


def fetch_company_data():
    """Fetch current company fundamentals and price data."""
    companies = []
    tickers_str = ' '.join(COMPANY_TICKERS.keys())
    data = yf.Tickers(tickers_str)

    for ticker, name in COMPANY_TICKERS.items():
        try:
            t = data.tickers[ticker]
            info = t.info
            market_cap_b = round(info.get('marketCap', 0) / 1e9, 1)
            revenue_b = round(info.get('totalRevenue', 0) / 1e9, 1)
            revenue_growth = round((info.get('revenueGrowth', 0) or 0) * 100)

            # Simple momentum: % above 200-day SMA, scaled 0-100
            hist = t.history(period='1y')
            if len(hist) >= 200:
                sma200 = hist['Close'].rolling(200).mean().iloc[-1]
                current = hist['Close'].iloc[-1]
                momentum = min(100, max(0, int(50 + (current / sma200 - 1) * 200)))
            elif len(hist) > 20:
                sma = hist['Close'].mean()
                current = hist['Close'].iloc[-1]
                momentum = min(100, max(0, int(50 + (current / sma - 1) * 200)))
            else:
                momentum = 50

            meta = COMPANY_META.get(ticker, {})
            companies.append({
                'ticker': ticker,
                'name': name,
                'marketCap': market_cap_b,
                'revenue': revenue_b,
                'revenueGrowth': revenue_growth,
                'exposure': meta.get('exposure', 50),
                'momentum': momentum,
                'segments': meta.get('segments', []),
                'tier': meta.get('tier', 'Satellite'),
            })
            print(f"  {ticker}: mktcap={market_cap_b}B, mom={momentum}")
        except Exception as e:
            print(f"  {ticker}: ERROR - {e}")
            # Fallback to static data
            meta = COMPANY_META.get(ticker, {})
            companies.append({
                'ticker': ticker,
                'name': name,
                'marketCap': 0,
                'revenue': 0,
                'revenueGrowth': 0,
                'exposure': meta.get('exposure', 50),
                'momentum': 50,
                'segments': meta.get('segments', []),
                'tier': meta.get('tier', 'Satellite'),
            })

    return companies


def fetch_market_performance():
    """Fetch historical index performance, normalized to 100."""
    end = datetime.now()
    start = end - timedelta(days=540)  # ~18 months

    all_tickers = list(INDEX_TICKERS.keys()) + ROBOTICS_BASKET
    print(f"  Downloading history for: {all_tickers}")
    df = yf.download(all_tickers, start=start, end=end, interval='1mo', auto_adjust=True)

    if df.empty:
        print("  WARNING: No historical data returned")
        return []

    close = df['Close'] if 'Close' in df.columns else df

    # Build robotics composite (equal-weight of basket)
    robotics_cols = [c for c in ROBOTICS_BASKET if c in close.columns]
    index_data = {}

    for idx_ticker, idx_name in INDEX_TICKERS.items():
        if idx_ticker in close.columns:
            series = close[idx_ticker].dropna()
            if len(series) > 0:
                index_data[idx_name] = (series / series.iloc[0] * 100).round(1)

    if robotics_cols:
        basket = close[robotics_cols].dropna(how='all')
        # Normalize each to 100, then average
        normalized = basket.div(basket.iloc[0]) * 100
        index_data['robotics'] = normalized.mean(axis=1).round(1)

    if not index_data:
        return []

    # Build output array
    import pandas as pd
    combined = pd.DataFrame(index_data).dropna(how='all')
    combined = combined.ffill()

    result = []
    for date, row in combined.iterrows():
        month_label = date.strftime('%b %y')
        entry = {'month': month_label, 'date': date.strftime('%Y-%m')}
        for col in ['robotics', 'sp500', 'nasdaq', 'soxx', 'industrials']:
            if col in row and not pd.isna(row[col]):
                entry[col] = float(row[col])
        result.append(entry)

    return result


def main():
    print("=== Robofutures Daily Data Update ===")
    print(f"Time: {datetime.utcnow().isoformat()}Z")

    print("\n1. Fetching company data...")
    companies = fetch_company_data()

    print("\n2. Fetching market performance...")
    performance = fetch_market_performance()

    # Build metadata
    today = datetime.utcnow().strftime('%Y-%m-%d')
    meta = {
        'lastUpdated': today,
        'source': 'Yahoo Finance via yfinance',
        'disclaimer': 'For research/educational use only. Not investment advice.',
    }

    # Write output
    output = {
        'meta': meta,
        'companies': companies,
        'marketPerformance': performance,
    }

    out_path = os.path.join(OUTPUT_DIR, 'market.json')
    with open(out_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\nData written to {out_path}")
    print(f"Companies: {len(companies)}, Performance points: {len(performance)}")
    print("Done.")


if __name__ == '__main__':
    main()
