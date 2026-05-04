# Plan: Robofutures Dashboard Overhaul

## Goal
Ein modernes, Linear-inspiriertes Dashboard, das als tägliches Werkzeug für Investment-Thesis-Visualisierung und Industry-Momentum dient.

## Kern-Architektur

### Design System: Linear Dark
- Farbpalette: `#08090a` (BG), `#0f1011` (Panel), `#191a1b` (Surface)
- Text: `#f7f8f8` / `#d0d6e0` / `#8a8f98` / `#62666d`
- Akzent: `#5e6ad2` / `#7170ff` (Indigo-Violett)
- Schrift: Inter Variable, OpenType `"cv01", "ss03"`, Gewicht 400/510/590
- Glasklare Trennlinien: `rgba(255,255,255,0.05)` bis `0.08`
- Recharts beibehalten, aber in Linear-Optik neu stylen

### Neue Sektionen

**1. Sidebar (Links) – Navigation + Portfolio**
- Hypothese nav (Humanoid 4-Layer, AI Infra Megacycle, etc.)
- Schnelle Ticker-Suche
- Aktuelle Session-Information

**2. Hauptbereich – 4 Tabs**

| Tab | Inhalt | Datenquelle |
|-----|--------|-------------|
| **Overview** | Portfolio-Momentum-Matrix, Segment-Exposure, Watchlist | Real-time Yahoo Finance + Manuelle Daten |
| **Thesis** | Investment-Thesen visualisieren (Layer-Analyse, Value Chain) | Obsidian Vault Import |
| **Value Chain** | 4-Layer Robotics Supply Chain + Ticker-Dashboard | Manuell gepflegt + Live-Preise |
| **Signals** | Führende Indikatoren, Alerts, News | Manuell + X Radar |

**3. Footer / Bottom Bar**
- Letzte Datenaktualisierung
- Quellenangaben
- Link zum Obsidian Vault

## Datenstrategie

### Layer 0: Live Prices (Yahoo Finance API)
- Fetch via `https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}`
- Cached für Session-Dauer (kein Neuladen bei jedem Tab-Wechsel)
- Ticker-Liste aus den 4-Layern: ~20 Ticker

### Layer 1: Hardcoded Fundamentals (manuell gepflegt)
- Robotics Exposure %, Momentum Score, Segment-Zuordnung
- Aus unserer Deep-Dive-Analyse (heute gesammelte Daten)
- Wird bei Bedarf über Obisidian-Sync aktualisiert

### Layer 2: Thesis Daten (Obsidian Vault)
- 4-Layer Value Chain Framework
- Marktkapitalisierung, Bewertungskennzahlen
- Kann erweitert werden

## Komponenten-Architektur (React)

```
App.jsx (modularisiert)
├── 