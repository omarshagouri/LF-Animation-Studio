import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: { executablePath: process.env.OMAR_CHROMIUM },
  },
  webServer: {
    command: 'npx expo serve dist/web --port 4173',
    url: 'http://127.0.0.1:4173',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 }, colorScheme: 'light' } },
    { name: 'compact', use: { viewport: { width: 375, height: 750 }, colorScheme: 'dark' } },
  ],
})
