import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works under the GitHub Pages project path (/twister-spinner/)
  base: './',
  plugins: [react()],
})
