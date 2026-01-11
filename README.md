# Robofuture Dashboard (Vite + React + Tailwind + Backend API)

This repo is set up to deploy automatically to **GitHub Pages** on every push to `main`.

## 🚀 Features

- ✅ **Real-time Data** from public APIs (USPTO, Alpha Vantage, NewsAPI)
- ✅ **Auto-refresh** with manual refresh button
- ✅ **Live/Cached mode** indicator
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **GitHub Pages** deployment ready

## 📋 Prerequisites

- Node.js 18+ installed
- Free API keys (see Backend Setup)

## 🛠️ Local Development

### Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file (optional - defaults to localhost:3001)
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

### Backend Setup (for real data)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file and add your API keys
cp .env.example .env

# Edit .env and add your free API keys:
# - Alpha Vantage: https://www.alphavantage.co/support/#api-key
# - NewsAPI: https://newsapi.org/register
# - Adzuna (optional): https://developer.adzuna.com/signup

# Start backend server
npm run dev
```

Backend runs on: **http://localhost:3001**

**See `server/README.md` for detailed backend setup instructions.**

### Running Both (Full Stack)

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

Open: **http://localhost:5173**

## 📡 API Endpoints

The backend provides these endpoints:

- `GET /api/health` - Server status
- `GET /api/signals/all` - All 6 leading indicators
- `GET /api/signals/patents` - Patent momentum
- `GET /api/signals/earnings` - Earnings sentiment
- `GET /api/signals/policy` - Policy tailwinds
- `GET /api/signals/hiring` - Hiring velocity
- `GET /api/signals/orders` - Order book strength

## 🌐 Deploy (GitHub Pages)

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` (or re-run the workflow)

**Note**: The deployed version will use cached/simulated data unless you deploy the backend separately (e.g., Railway, Render, Heroku).

## 🔧 Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### Backend (server/.env)
```env
PORT=3001
ALPHA_VANTAGE_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
ADZUNA_APP_ID=your_app_id (optional)
ADZUNA_APP_KEY=your_app_key (optional)
```

## 📊 Data Sources (All FREE)

| Source | API | Registration | Rate Limit |
|--------|-----|--------------|------------|
| Patents | USPTO | No | 10 req/sec |
| Financials | Alpha Vantage | Yes (Email) | 5/min, 100/day |
| News | NewsAPI | Yes | 100/day |
| Jobs | Adzuna | Yes (optional) | 500/month |

## 🏗️ Project Structure

```
Robofutures/
├── src/                  # Frontend React app
│   ├── App.jsx          # Main dashboard component
│   ├── api.js           # Backend API client
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind styles
├── server/              # Backend API server
│   ├── index.js         # Express server
│   ├── routes/          # API routes
│   ├── services/        # API integrations
│   └── README.md        # Backend docs
├── package.json         # Frontend dependencies
└── vite.config.js       # Vite configuration
```

## 🎯 Important: base path

For project pages, Vite needs the correct `base` in `vite.config.js`:

```js
base: '/<REPO_NAME>/'
```

If your repo is not named `Robofutures`, change it.

## 🐛 Troubleshooting

### "Backend offline" indicator
- Make sure backend is running (`cd server && npm run dev`)
- Check backend URL in `.env` matches
- Test backend: `curl http://localhost:3001/api/health`

### Frontend not loading
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Check console for errors
- Verify Vite dev server is running

### No real data showing
- Check if backend is running
- Verify API keys in `server/.env`
- App will fall back to cached data automatically

## 📝 Development

### Add new signal
1. Create service in `server/services/`
2. Add route in `server/routes/signals.js`
3. Update `src/api.js` if needed
4. Frontend will automatically pick it up

### Customize styling
- Edit Tailwind classes in `src/App.jsx`
- Modify `tailwind.config.js` for theme changes

## 📄 License

MIT

