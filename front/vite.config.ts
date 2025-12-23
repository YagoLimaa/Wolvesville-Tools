import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import sitemap from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    sitemap({
      hostname: 'https://wolvesville-tools.pages.dev',
      urls: [
        { path: '/', changefreq: 'daily', priority: 1.0 },
        { path: '/clans', changefreq: 'daily', priority: 0.8 },
        { path: '/clan-rankings', changefreq: 'daily', priority: 0.8 },
        { path: '/players', changefreq: 'daily', priority: 0.8 },
        { path: '/items/shop', changefreq: 'daily', priority: 0.8 },
        { path: '/items/skins', changefreq: 'daily', priority: 0.8 }
      ],
      robots: [
        {
          userAgent: '*',
          allow: '/',
        },
      ],
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
