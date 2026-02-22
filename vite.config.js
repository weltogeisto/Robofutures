import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Hardcoded base path for GitHub Pages
// Since the repo is at github.com/weltogeisto/Robofutures, 
// the base must be '/Robofutures/'
export default defineConfig({
  plugins: [react()],
  base: '/Robofutures/'
})
