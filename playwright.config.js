import { defineConfig, devices } from '@playwright/test';

// Needs Node 20+.  npx playwright install chromium  &&  npm run e2e
export default defineConfig({
  testDir: 'e2e',
  timeout: 300000,
  use: { baseURL: 'http://localhost:5174', browserName: 'chromium' },
  webServer: { command: 'npx vite --port 5174 --strictPort', port: 5174, reuseExistingServer: true },
  projects: [
    { name: 'big-screen', testMatch: /demo\.spec/, use: { viewport: { width: 1600, height: 900 }, contextOptions: { reducedMotion: 'reduce' } } },
    { name: 'iphone-se', testMatch: /phone\.spec/, use: { ...devices['iPhone SE'], browserName: 'chromium' } },
    { name: 'pixel-5', testMatch: /phone\.spec/, use: { ...devices['Pixel 5'] } },
    { name: 'landscape', testMatch: /phone\.spec/, use: { ...devices['Pixel 5 landscape'] } },
  ],
});
