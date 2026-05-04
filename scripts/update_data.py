#!/usr/bin/env python3
"""
Fetch live market data from Yahoo Finance for the Robofutures dashboard.
Outputs two JSON files to public/data/:
  - quotes.json  : latest price, change, volume for all watchlist tickers
  - history.json : 3Y daily close prices (normalized) for chart time-scale selector

Run: python3 scripts/update_data.py
"""
import json, os, sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import yfinance as yf
import pandas as pd

# ── Tickers ──────────────────────────────────────────────────────────────────
TICKERS = {
    "TXN":     {"name": "Texas Instruments", "layer": 1},
    "ON":      {"name": "onsemi",            "layer": 1},
    "MCHP":    {"name": "Microchip",         "layer": 1},
    "IFX.DE":  {"name": "Infineon",          "layer": 1},
    "ALGM":    {"name": "Allegro Micro",     "layer": 1},
    "RRX":     {"name": "Regal Rexnord",     "layer": 1},
    "6324.T":  {"name": "Harmonic Drive",    "layer": 2},
    "6268.T":  {"name": "Nabtesco",          "layer": 2},
    "6481.T":  {"name": "THK",               "layer": 2},
    "6861.T":  {"name": "Keyence",           "layer": 2},
    "6954.T":  {"name": "Fanuc",             "layer": 3},
    "6506.T":  {"name": "Yaskawa",           "layer": 3},
    "ABBN.SW": {"name": "ABB Ltd",           "layer": 3},
    "3037.TW": {"name": "Unimicron",         "layer": 4},
}

# Benchmarks (for chart) + Robotics ETF proxy
BENCHMARKS = {
    "BOTZ":  "Robotics Index (BOTZ ETF)",
    "SPY":   "S&P 500",
    "QQQ":   "NASDAQ 100",
}

ALL_SYMBOLS = list(TICKERS.keys()) + list(BENCHMARKS.keys())

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR   = SCRIPT_DIR.parent / "public" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def fetch_history(period="3y"):
    """Fetch daily close prices for all symbols over the given period."""
    print(f"[history] Fetching {period} daily data for {len(ALL_SYMBOLS)} symbols...")
    end = datetime.now()
    start = end - timedelta(days=3*365 + 30)

    frames = {}
    failed = []
    for sym in ALL_SYMBOLS:
        try:
            tk = yf.Ticker(sym)
            df = tk.history(start=start.strftime("%Y-%m-%d"),
                           end=end.strftime("%Y-%m-%d"),
                           auto_adjust=True)
            if df.empty:
                print(f"  ⚠  {sym}: empty response")
                failed.append(sym)
                continue
            frames[sym] = df["Close"]
            print(f"  ✓  {sym}: {len(df)} rows")
        except Exception as e:
            print(f"  ✗  {sym}: {e}")
            failed.append(sym)

    if not frames:
        print("[history] No data fetched!")
        return None

    # Merge into single DataFrame, forward-fill gaps (holidays differ by market)
    all_df = pd.DataFrame(frames)
    all_df.index = all_df.index.tz_localize(None)  # drop tz for JSON compat
    # Normalize timestamps to calendar dates to avoid multi-row per day across timezones
    all_df.index = all_df.index.normalize()
    # Drop duplicate dates (keep last), sort, ffill
    all_df = all_df[~all_df.index.duplicated(keep='last')].sort_index().ffill().bfill()

    # Normalize all to 100 at first common row (robotics index = BOTZ)
    first_row = all_df.iloc[0]
    norm_df = (all_df / first_row) * 100.0

    # Build output
    out = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "failed": failed,
        "dates": [d.strftime("%Y-%m-%d") for d in norm_df.index],
        "r": [round(v, 2) for v in norm_df["BOTZ"].tolist()] if "BOTZ" in norm_df.columns else [],
        "sp": [round(v, 2) for v in norm_df["SPY"].tolist()] if "SPY" in norm_df.columns else [],
        "nd": [round(v, 2) for v in norm_df["QQQ"].tolist()] if "QQQ" in norm_df.columns else [],
        "tickers": {}
    }

    # Per-ticker raw close (not normalized) for individual chart views later
    for sym in TICKERS:
        if sym in all_df.columns:
            out["tickers"][sym] = {
                "close": [round(v, 2) for v in all_df[sym].tolist()],
            }

    return out


def fetch_quotes():
    """Fetch latest quotes for all watchlist tickers."""
    print(f"[quotes] Fetching latest quotes for {len(TICKERS)} tickers...")
    quotes = {}

    for sym, meta in TICKERS.items():
        try:
            tk = yf.Ticker(sym)
            info = tk.fast_info
            price    = round(float(info.last_price), 2)
            prev     = round(float(info.previous_close), 2)
            chg      = round(price - prev, 2)
            chg_pct  = round((chg / prev) * 100, 2) if prev else 0
            hi52     = round(float(info.year_high), 2) if hasattr(info, 'year_high') else None
            lo52     = round(float(info.year_low), 2) if hasattr(info, 'year_low') else None
            mktcap   = round(float(info.market_cap) / 1e9, 2) if hasattr(info, 'market_cap') and info.market_cap else None
            vol      = int(info.last_volume) if hasattr(info, 'last_volume') else None

            quotes[sym] = {
                "price": price,
                "change": chg,
                "change_pct": chg_pct,
                "prev_close": prev,
                "high_52w": hi52,
                "low_52w": lo52,
                "market_cap_bn": mktcap,
                "volume": vol,
            }
            print(f"  ✓  {sym}: {price} ({chg_pct:+.2f}%)")
        except Exception as e:
            print(f"  ✗  {sym}: {e}")
            quotes[sym] = {"price": None, "error": str(e)}

    return {
        "updated": datetime.now(timezone.utc).isoformat(),
        "quotes": quotes,
    }


def main():
    print("=" * 60)
    print("Robofutures — Yahoo Finance Data Update")
    print("=" * 60)

    # 1. Fetch quotes (fast)
    quotes = fetch_quotes()
    qpath = DATA_DIR / "quotes.json"
    with open(qpath, "w") as f:
        json.dump(quotes, f, indent=2)
    print(f"\n[quotes] Written to {qpath}")

    # 2. Fetch history (slower)
    history = fetch_history()
    if history:
        hpath = DATA_DIR / "history.json"
        with open(hpath, "w") as f:
            json.dump(history, f)
        print(f"[history] Written to {hpath} ({len(history['dates'])} dates)")

    print("\n✓ Done.")


if __name__ == "__main__":
    main()
