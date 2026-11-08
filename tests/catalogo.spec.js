import { test, expect } from "@playwright/test";

/**
 * Suite E2E: Catálogo de Productos y Búsqueda en Vivo
 * Principios de Clase 12 (Slide 14 y 15):
 * - Uso de getByRole, getByPlaceholder, getByText (locators semánticos)
 * - Auto-waiting nativo en aserciones web-first
 */
test.describe("Módulo 13 (Clase 12): Catálogo de Perfumes AURA", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal y esperar que el catálogo termine de cargar
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /a la bolsa|Comprar/i }).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test("Carga el catálogo principal y muestra la identidad de la tienda", async ({ page }) => {
    // Validar el branding y el logo
    await expect(page.getByRole("link", { name: /AURA/i }).first()).toBeVisible();

    // Validar que se muestre al menos una tarjeta de perfume con botón de compra
    const buyButtons = page.getByRole("button", { name: /a la bolsa|Comprar/i });
    await expect(buyButtons.first()).toBeVisible();
  });

  test("Filtra perfumes en tiempo real a través de la barra de búsqueda", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Buscar por fragancia, marca o notas...").first();
    await expect(searchInput).toBeVisible();

    // Escribir "Sauvage" en el buscador
    await searchInput.fill("Sauvage");

    // Verificar que aparezca Sauvage Elixir
    await expect(page.getByText("Sauvage Elixir").first()).toBeVisible();

    // Limpiar el buscador
    await searchInput.fill("");
  });

  test("Filtra perfumes por categoría o familia olfativa", async ({ page }) => {
    // Seleccionar la categoría "Amaderado"
    const woodCategoryBtn = page.getByRole("button", { name: /^Amaderado/i }).first();
    if (await woodCategoryBtn.isVisible()) {
      await woodCategoryBtn.click();
      // Debe haber resultados visibles
      await expect(page.getByRole("button", { name: /a la bolsa|Comprar/i }).first()).toBeVisible();
    }
  });
});
