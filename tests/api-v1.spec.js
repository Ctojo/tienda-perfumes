import { test, expect } from "@playwright/test";

/**
 * Suite E2E / API Testing: Verificación de Endpoints REST v1 con Zod
 * Integración de Clase 10 (APIs) y Clase 12 (Testing Automatizado)
 */
test.describe("Módulo 13 (Clase 12): Pruebas de API REST v1", () => {
  test("GET /api/v1/perfumes devuelve 200 OK con estructura uniforme y paginación", async ({
    request
  }) => {
    const response = await request.get("/api/v1/perfumes?page=1&limit=4");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.meta).toBeDefined();
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(4);
  });

  test("GET /api/v1/perfumes rechaza parámetros inválidos con HTTP 400 Bad Request", async ({
    request
  }) => {
    // page no puede ser menor a 1
    const response = await request.get("/api/v1/perfumes?page=0");
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test("POST /api/v1/perfumes rechaza payload sin campos obligatorios con HTTP 400", async ({
    request
  }) => {
    const response = await request.post("/api/v1/perfumes", {
      data: {
        name: "Perfume Incompleto"
      }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Datos de entrada inválidos");
    expect(Array.isArray(body.details)).toBe(true);
    expect(body.details.length).toBeGreaterThan(0);
  });

  test("GET /api/v1/perfumes/[id] responde 404 ante un ID inexistente", async ({ request }) => {
    const response = await request.get("/api/v1/perfumes/id-totalmente-inexistente-xyz");
    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });
});
