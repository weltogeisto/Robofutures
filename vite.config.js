import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT:
// For GitHub Pages project sites, base must be "/<REPO_NAME>/"
// Your screenshot shows the repo URL path as "Robofuture" (no "s").
// If your repo name is different, change it below.
export default defineConfig({
  plugins: [react()],
  base: '/Robofuture/'
})
