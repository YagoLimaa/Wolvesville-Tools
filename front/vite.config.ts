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
        robots: [{ userAgent: '*', allow: '/' }]
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})