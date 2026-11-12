import { test, expect } from "@playwright/test";

/**
 * Suite E2E: Autenticación, Seguridad y Recuperación de Contraseña
 * Principios de Clase 12 (Slide 15):
 * - getByRole('button'), getByPlaceholder, getByText
 * - Validación de mensajes de error de seguridad (401 / credenciales erróneas)
 */
test.describe("Módulo 13 (Clase 12): Autenticación y Recuperación AURA", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
  });

  test("Carga el formulario de inicio de sesión con branding", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "AURA", exact: true })).toBeVisible();
    await expect(page.getByText("Iniciar Sesión en tu cuenta")).toBeVisible();
    await expect(page.getByPlaceholder("tu@email.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Iniciar Sesión" })).toBeVisible();
  });

  test("Muestra mensaje de error semántico ante credenciales incorrectas", async ({ page }) => {
    test.setTimeout(45000);
    // 1. Ingresar credenciales inválidas
    await page.getByPlaceholder("tu@email.com").fill("usuario_inexistente@itba.edu.ar");
    await page.getByPlaceholder("••••••••").fill("clave_invalida_123");

    // 2. Enviar formulario
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();

    // 3. Validar que la alerta de error se haga visible (error de credenciales o red)
    const errorAlert = page.locator(".text-rose-400, [role='alert']");
    await expect(errorAlert).toBeVisible({ timeout: 30000 });
  });

  test("Permite alternar hacia el modo de recuperación de contraseña", async ({ page }) => {
    // 1. Hacer clic en ¿Olvidaste tu contraseña?
    const forgotBtn = page.getByRole("button", { name: /¿Olvidaste tu contraseña\?/i });
    await expect(forgotBtn).toBeVisible();
    await forgotBtn.click();

    // 2. Verificar que el título y el botón cambian al modo de recuperación
    await expect(page.getByText(/Recuperar Contraseña/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Enviar Enlace de Recuperación/i })
    ).toBeVisible();
  });
});
