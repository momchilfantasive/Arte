// Visual & Motion QA harness for Arte del Lusso (Fantasive Project Standard v2.1).
// Scene IDs (S01…S13) refer to the choreography map in ../CREATIVE.md.
import { defineConfig } from '@playwright/test';

const viewports = [
  { id: 'ipad-1180', use: { viewport: { width: 1180, height: 820 }, hasTouch: true } },
  { id: 'ipad-1366', use: { viewport: { width: 1366, height: 1024 }, hasTouch: true } },
  { id: 'phone-390', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } },
  { id: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
];
const engines = ['chromium', 'webkit'];

export default defineConfig({
  testDir: './specs',
  outputDir: './artifacts/test-results',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.QA_WORKERS ? Number(process.env.QA_WORKERS) : 3,
  reporter: [['list'], ['json', { outputFile: 'artifacts/results.json' }]],
  use: {
    baseURL: process.env.QA_BASE_URL || 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    ...engines.flatMap((engine) =>
      viewports.map((v) => ({
        name: `${engine}-${v.id}`,
        testIgnore: /reduced-motion/,
        use: { browserName: engine, ...v.use },
      }))
    ),
    // Reduced-motion pass (iPad landscape size) for each engine
    ...engines.map((engine) => ({
      name: `${engine}-reduced-1180`,
      testMatch: /reduced-motion/,
      use: { browserName: engine, viewport: { width: 1180, height: 820 }, hasTouch: true, reducedMotion: 'reduce' },
    })),
  ],
  webServer: process.env.QA_BASE_URL ? undefined : {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    cwd: '..',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
