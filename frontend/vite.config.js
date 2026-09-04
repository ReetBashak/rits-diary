import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Viva La Vida — Tangerine Diary',
        short_name: 'Viva La Vida',
        description: 'Personal offline-ready memory diary',
        theme_color: '#f57418',
        background_color: '#FFFDF9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://emojicdn.elk.sh/🍊?style=apple',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://emojicdn.elk.sh/🍊?style=apple',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        navigateFallback: '/index.html',
        // Database ya backend requests ko offline cache se touch nahi hone dega
        navigateFallbackDenylist: [/^\/api/]
      }
    })
  ]
});