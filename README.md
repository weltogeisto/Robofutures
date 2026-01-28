# Robofuture Dashboard (Vite + React + Tailwind)

This repo is set up to deploy automatically to **GitHub Pages** on every push to `main`.

## Local run
```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)
1. Go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` (or re-run the workflow)

## Important: base path
For project pages, Vite needs the correct `base` in `vite.config.js`.
This repo derives it from the `GITHUB_REPOSITORY` environment variable during
the GitHub Actions build so the deployed site matches the repo name.
