import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/gongzuotai/',
  plugins: [react()],
  server: {
    port: 3001,
    open: true
  }
})
