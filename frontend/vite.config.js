import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Viva La Vida — Tangerine Diary',
        short_name: 'Viva La Vida',
        description: 'Personal memory diary',
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
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Jab net on ho, hamesha live site khulegi (NetworkFirst)
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'viva-pages-cache',
              networkTimeoutSeconds: 3
            }
          },
          {
            // Images aur static assets
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'viva-static-assets'
            }
          }
        ]
      }
    })
  ]
});