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
      }
    })
  ]
});