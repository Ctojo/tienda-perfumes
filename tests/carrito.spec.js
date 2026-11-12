import { test, expect } from "@playwright/test";

/**
 * Suite E2E: Flujo de Carrito y Pre-Checkout
 * Principios de Clase 12 (Slide 14 y 15):
 * - Locators semánticos: getByRole('button', { name: ... }), getByLabel
 * - Aserciones web-first reactivas
 */
test.describe("Módulo 13 (Clase 12): Flujo de Compra y Carrito AURA", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Esperar a que los productos estén listos antes de interactuar
    await expect(
      page.getByRole("button", { name: /a la bolsa|Comprar/i }).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test("Permite agregar un perfume al carrito y despliega el CartDrawer", async ({ page }) => {
    // 1. Localizar el primer botón de compra
    const firstBuyButton = page.getByRole("button", { name: /a la bolsa|Comprar/i }).first();
    await expect(firstBuyButton).toBeVisible();

    // 2. Hacer clic para agregar
    await firstBuyButton.click();

    // 3. El CartDrawer debe abrirse mostrando 'Tu Bolsa de Compras'
    await expect(page.getByText("Tu Bolsa de Compras")).toBeVisible();

    // 4. Debe mostrar el botón para continuar la compra hacia el checkout
    const checkoutLink = page.getByRole("link", { name: /Continuar compra y pagar/i });
    await expect(checkoutLink).toBeVisible();
  });

  test("Navega hacia la pantalla de Checkout al hacer clic en continuar compra", async ({ page }) => {
    // 1. Agregar producto
    const firstBuyButton = page.getByRole("button", { name: /a la bolsa|Comprar/i }).first();
    await firstBuyButton.click();

    // 2. Esperar a que el CartDrawer esté abierto y hacer clic en continuar compra
    const checkoutLink = page.getByRole("link", { name: /Continuar compra y pagar/i });
    await expect(checkoutLink).toBeVisible({ timeout: 10000 });
    await checkoutLink.click();

    // 3. Verificar que la URL cambió a /checkout y se visualiza el formulario de compra
    await expect(page).toHaveURL(/.*checkout/);
    await expect(page.getByText("Datos del Comprador")).toBeVisible();
  });
});
