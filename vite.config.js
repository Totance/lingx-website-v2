import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glsl', '**/*.svg'],
  base: '/lingx-website-v2/',
  build: {
    outDir: 'docs',
  },
})