# 🚀 Quick Start Guide

Schnelleinstieg für das Robofutures Dashboard mit echten Daten.

## Option 1: Nur Frontend (Cached Data)

```bash
npm install
npm run dev
```

Öffne: http://localhost:5173

✅ Dashboard läuft sofort
❌ Nur simulierte/gecachte Daten

---

## Option 2: Full Stack (Real Data) - Empfohlen

### Schritt 1: API Keys holen (5 Minuten)

#### Alpha Vantage (PFLICHT)
1. Gehe zu: https://www.alphavantage.co/support/#api-key
2. Gib deine Email ein → Sofortiger kostenloser Key
3. Kopiere den Key

#### NewsAPI (PFLICHT)
1. Gehe zu: https://newsapi.org/register
2. Registriere dich kostenlos
3. Kopiere den API Key

#### Adzuna (OPTIONAL - für Job-Daten)
1. Gehe zu: https://developer.adzuna.com/signup
2. Registriere dich
3. Kopiere App ID und App Key

### Schritt 2: Backend Setup (2 Minuten)

```bash
# In neuem Terminal
cd server

# Dependencies installieren
npm install

# .env Datei erstellen
cp .env.example .env

# .env editieren
nano .env  # oder mit deinem Editor

# Füge deine API Keys ein:
# ALPHA_VANTAGE_API_KEY=dein_key_hier
# NEWS_API_KEY=dein_key_hier
# (Adzuna optional)

# Backend starten
npm run dev
```

✅ Server läuft auf: http://localhost:3001
✅ Test: http://localhost:3001/api/health

### Schritt 3: Frontend Setup (1 Minute)

```bash
# In neuem Terminal (im Hauptverzeichnis)
npm install

# Optional: .env für andere Backend-URL
cp .env.example .env

# Frontend starten
npm run dev
```

✅ Dashboard läuft auf: http://localhost:5173
✅ Zeigt "Live Data" 🟢 wenn Backend läuft

---

## ✅ Erfolgreich, wenn:

1. **Header zeigt**: "Live Data" 🟢 (grün pulsierend)
2. **Leading Indicators** zeigen unterschiedliche Werte bei jedem Refresh
3. **Console** (F12) zeigt keine Fehler
4. **Backend Terminal** zeigt API-Aufrufe

---

## 🐛 Troubleshooting

### "Cached Data" 🟡 statt "Live Data"
→ Backend läuft nicht oder falsche URL
```bash
# Prüfe Backend:
curl http://localhost:3001/api/health
```

### "Failed to fetch"
→ CORS Problem oder Backend nicht erreichbar
→ Prüfe ob beide Server laufen (Port 3001 + 5173)

### "API Key invalid"
→ Keys falsch kopiert
→ Prüfe `.env` Datei in `server/` Verzeichnis
→ Keine Leerzeichen vor/nach Keys

### Rate Limit Errors
→ Normal bei ersten Tests
→ Warte 1-2 Minuten
→ Backend cached die Daten automatisch

---

## 📊 Ersten Test machen

1. Öffne Dashboard: http://localhost:5173
2. Schaue auf Header → sollte "Live Data" 🟢 zeigen
3. Klicke **Refresh Button**
4. Backend Terminal zeigt: `Fetching all signals...`
5. Signale ändern sich leicht
6. Klicke auf einen Signal-Badge → Details-Drawer öffnet sich

---

## 🎯 Nächste Schritte

- [ ] Teste alle Tabs (Overview, Signals, Supply Chain, Companies, Events)
- [ ] Klicke auf verschiedene Signale um Details zu sehen
- [ ] Filtere nach Segmenten (Humanoid, Surgical, etc.)
- [ ] Aktiviere Compare Mode
- [ ] Füge Companies zur Watchlist hinzu (Star-Icon)

---

## 🔧 Development Mode

**Frontend mit Hot Reload:**
```bash
npm run dev
```

**Backend mit Auto-Restart:**
```bash
cd server
npm run dev  # nutzt nodemon
```

Beide Server laufen parallel → Änderungen werden sofort sichtbar!

---

## 📦 Production Build

```bash
# Frontend build
npm run build

# Serve production build
npm run preview
```

---

## 🚀 Deploy to Production

### Frontend (GitHub Pages)
- Automatisch bei Push to `main`
- Siehe `.github/workflows/deploy.yml`

### Backend (Railway/Render)
```bash
cd server
# Push to Railway/Render
# Setze ENV Variables in Dashboard
```

---

**Bei Problemen**: Siehe `README.md` oder `server/README.md` für Details
