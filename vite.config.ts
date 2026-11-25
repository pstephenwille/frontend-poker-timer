/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const DEV_STAGE_ORIGIN = 'https://d3qe36cyda6430.cloudfront.net'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3333,
    proxy: {
      '/api': { target: process.env.API_ORIGIN ?? DEV_STAGE_ORIGIN, changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
