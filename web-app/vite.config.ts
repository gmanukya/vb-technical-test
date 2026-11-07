import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const api = 'http://localhost:3002'

const proxy = {
  '/ping': api,
  '/pokemons': api,
  '/contents': api,
  '/battles': api,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { cors: false, proxy },
  preview: { cors: false, proxy },
})
