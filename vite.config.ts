import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages project site: https://<user>.github.io/route-127-trailer-nc/
// Allow overriding via BASE_PATH env var (e.g. for local dev or custom domains).
const base = process.env.BASE_PATH ?? '/route-127-trailer-nc/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
