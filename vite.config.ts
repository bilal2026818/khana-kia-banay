import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}']
          },
          devOptions: {
            enabled: true
          },
          manifest: {
            "short_name": "KhanaBanay",
            "name": "Khana Kia Banay: Smart Meal Planner",
            "description": "The ultimate kitchen companion to help you decide what to cook using AI suggestions and your personal dish library.",
            "icons": [
              {
                "src": "https://picsum.photos/seed/foodapp/192/192",
                "type": "image/png",
                "sizes": "192x192",
                "purpose": "any maskable"
              },
              {
                "src": "https://picsum.photos/seed/foodapp/512/512",
                "type": "image/png",
                "sizes": "512x512",
                "purpose": "any maskable"
              }
            ],
            "start_url": ".",
            "background_color": "#fcfcfc",
            "display": "standalone",
            "scope": "/",
            "theme_color": "#ea580c",
            "orientation": "portrait",
            "categories": ["food", "lifestyle", "utilities"],
            "shortcuts": [
              {
                "name": "What to cook?",
                "url": "/suggest",
                "description": "Get an AI suggestion immediately"
              },
              {
                "name": "Weekly Plan",
                "url": "/planner",
                "description": "View your meal schedule"
              }
            ],
            "screenshots": [
              {
                "src": "https://picsum.photos/seed/screenshot1/540/720",
                "sizes": "540x720",
                "type": "image/png",
                "form_factor": "narrow",
                "label": "App Home Screen"
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
