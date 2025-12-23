import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import sitemap from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    base: '/',
    plugins: [
      react(),
      sitemap({
        hostname: 'https://wolvesville-tools.pages.dev',
        robots: [{ userAgent: '*', allow: '/' }],
        priority: 1.0,
        dynamicRoutes: [
          '/clans',
          '/clan-rankings',
          '/players',
          '/items/shop',
          '/items/skins'
        ]
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})