# Robofutures Backend API

Backend API server für das Robofutures Dashboard. Holt echte Daten von kostenlosen öffentlichen APIs.

## 🚀 Features

- ✅ **Patent Momentum**: USPTO Patent API
- ✅ **Earnings Sentiment**: Alpha Vantage Financial API
- ✅ **Policy Tailwinds**: NewsAPI
- ✅ **Hiring Velocity**: Adzuna Jobs API
- ✅ **Order Book Strength**: Financial Metrics
- 🔄 **Caching**: 5-Minuten-Cache für API-Antworten
- 🛡️ **Error Handling**: Fallback zu cached Daten

## 📋 Voraussetzungen

- Node.js 18+ installiert
- Kostenlose API Keys (siehe unten)

## 🔑 API Keys holen (alle KOSTENLOS)

### 1. Alpha Vantage (Financials)
1. Gehe zu: https://www.alphavantage.co/support/#api-key
2. Gib deine Email ein
3. Kopiere deinen API Key
4. **Limits**: 5 calls/min, 100 calls/day

### 2. NewsAPI (Policy News)
1. Gehe zu: https://newsapi.org/register
2. Registriere dich kostenlos
3. Kopiere deinen API Key
4. **Limits**: 100 requests/day

### 3. Adzuna (Jobs - Optional)
1. Gehe zu: https://developer.adzuna.com/signup
2. Registriere dich
3. Kopiere App ID und App Key
4. **Limits**: 500 requests/month

### 4. USPTO (Patents)
- ✅ **Keine Registrierung nötig** - komplett frei zugänglich

### 5. SEC EDGAR (Financials)
- ✅ **Keine Registrierung nötig** - nur User-Agent Header erforderlich

## 🛠️ Installation

```bash
# In das server-Verzeichnis wechseln
cd server

# Dependencies installieren
npm install

# .env Datei erstellen
cp .env.example .env

# .env editieren und API Keys eintragen
nano .env  # oder mit einem Editor deiner Wahl
```

## ⚙️ Konfiguration

Bearbeite die `.env` Datei:

```env
PORT=3001
NODE_ENV=development

# Alpha Vantage (PFLICHT)
ALPHA_VANTAGE_API_KEY=dein_key_hier

# NewsAPI (PFLICHT)
NEWS_API_KEY=dein_key_hier

# SEC EDGAR (optional - Default funktioniert)
SEC_USER_AGENT=RobofuturesDashboard deine@email.com

# Adzuna (OPTIONAL - ohne werden simulierte Daten verwendet)
ADZUNA_APP_ID=dein_app_id
ADZUNA_APP_KEY=dein_app_key
```

## 🚀 Server starten

### Development Mode (mit Auto-Reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Server läuft auf: **http://localhost:3001**

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:3001/api/health
```
Returns server status und cache statistics.

### Alle Signale
```bash
GET http://localhost:3001/api/signals/all
```
Returns alle 6 Leading Indicators.

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-01-11T10:30:00.000Z",
  "signals": [
    {
      "name": "Patent Momentum",
      "value": 82,
      "change": 12,
      "factors": {...},
      "description": "USPTO patent filings velocity",
      "dataPoints": 234,
      "source": "USPTO PEDS API"
    },
    ...
  ]
}
```

### Einzelne Signale
```bash
GET http://localhost:3001/api/signals/patents
GET http://localhost:3001/api/signals/earnings
GET http://localhost:3001/api/signals/policy
GET http://localhost:3001/api/signals/hiring
GET http://localhost:3001/api/signals/orders
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Alle Signale abrufen
curl http://localhost:3001/api/signals/all

# Nur Patent-Daten
curl http://localhost:3001/api/signals/patents
```

## 📊 Datenquellen

| Signal | API | Kosten | Rate Limit | Registrierung |
|--------|-----|--------|------------|---------------|
| Patent Momentum | USPTO PEDS | FREE | 10 req/sec | Nein |
| Earnings Sentiment | Alpha Vantage | FREE | 5/min, 100/day | Ja (Email) |
| Policy Tailwinds | NewsAPI | FREE | 100/day | Ja |
| Hiring Velocity | Adzuna | FREE | 500/month | Ja (optional) |
| Order Book | Alpha Vantage | FREE | 5/min, 100/day | Ja |
| Supply Chain | - | Simuliert | - | - |

## 🔄 Caching

- **Cache Duration**: 5 Minuten (300 Sekunden)
- **Strategie**: In-Memory Cache (NodeCache)
- **Fallback**: Bei API-Fehlern werden gecachte Daten zurückgegeben

## ⚠️ Rate Limits beachten

### Alpha Vantage (Strictest):
- 5 Calls pro Minute
- 100 Calls pro Tag
- **Lösung**: Server wartet automatisch 12 Sekunden zwischen Calls

### NewsAPI:
- 100 Requests pro Tag
- **Lösung**: Cache reduziert Calls drastisch

### USPTO:
- ~10 Requests pro Sekunde
- **Lösung**: Kein Problem bei normalem Gebrauch

## 🐛 Troubleshooting

### "API Key invalid"
- Prüfe ob `.env` Datei existiert
- Prüfe ob Keys korrekt kopiert (keine Leerzeichen)
- Teste Keys direkt im Browser

### "Rate limit exceeded"
- Warte ein paar Minuten
- Cache läuft 5 Minuten → weniger API Calls

### "No data returned"
- Prüfe Internet-Verbindung
- Prüfe API Status auf deren Websites
- Fallback-Daten werden automatisch verwendet

## 📝 Development Notes

### Neue API hinzufügen:
1. Erstelle Service in `services/`
2. Füge Route in `routes/signals.js` hinzu
3. Update cache keys
4. Teste mit `curl`

### Logs aktivieren:
```bash
NODE_ENV=development npm run dev
```

## 🔗 Nützliche Links

- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [NewsAPI Docs](https://newsapi.org/docs)
- [Adzuna API Docs](https://developer.adzuna.com/overview)
- [USPTO API Docs](https://developer.uspto.gov/)
- [SEC EDGAR API](https://www.sec.gov/edgar/sec-api-documentation)

## 📄 License

MIT
