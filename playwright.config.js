import { defineConfig, devices } from "@playwright/test";
import os from "os";
import path from "path";

/**
 * Configuración de Playwright según los estándares de la Clase 12 (Slide 14, 15 y 16).
 *
 * Características clave:
 * - Multi-navegador y emulación de dispositivos (Desktop Chrome).
 * - BaseURL apuntando a la aplicación Next.js local.
 * - Auto-waiting inteligente en locators.
 * - Trace Viewer habilitado en fallos (Slide 16) para auditoría remota.
 * - Reportes HTML con capturas de pantalla de fallos.
 * - WebServer automático para levantar el proyecto antes de ejecutar las pruebas.
 * - Almacenamiento de artefactos en directorio temporal para evitar bloqueos de OneDrive en Windows.
 */
export default defineConfig({
  testDir: "./tests",
  outputDir: path.join(os.tmpdir(), "aura-playwright-artifacts"),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],

  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],

  // Levanta automáticamente el servidor de Next.js si no está corriendo (producción optimizada)
  webServer: {
    command: "npx next start -p 3000 -H 0.0.0.0",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});
