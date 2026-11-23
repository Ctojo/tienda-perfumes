# AURA | Haute Parfumerie & Fragancias Exclusivas

Plataforma de comercio electrónico full-stack de perfumería de autor, desarrollada con arquitectura moderna en **Next.js (App Router)**, diseño editorial **Lujo Minimalista**, base de datos y autenticación con **Supabase**, pasarela de cobros oficial con **Mercado Pago**, testing automatizado con **Playwright** y pipeline de integración continua con **GitHub Actions**.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16 (App Router) + React 19.
- **Estilos & Diseño:** Tailwind CSS v4 con paleta editorial (*warm cream*, marfil, oro suave y negro carbón).
- **Backend & APIs:** Route Handlers REST v1 (`/api/v1/perfumes`, `/api/v1/pedidos`, `/api/checkout`).
- **Validación:** Zod con esquemas estrictos y sanitización en cliente y servidor.
- **Base de Datos & Auth:** Supabase (PostgreSQL + Auth) con arquitectura resiliente y *fallback local* automático.
- **Pasarela de Pagos:** Mercado Pago SDK Oficial (Checkout Pro con generación de preferencias).
- **Testing:** Playwright E2E y API Testing (12 pruebas automatizadas).
- **CI/CD:** GitHub Actions (verificación automática de build, lint y suite de tests en cada push a `main`).

---

## 🚀 Inicio Rápido (Desarrollo Local)

1. Clonar el repositorio y acceder a la carpeta:
   ```bash
   cd "Proyecto Pagina Web"
   ```

2. Instalar dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

---

## 👨‍🏫 Guía para Evaluación Docente (Pasarela de Pagos)

Para evaluar el flujo de compra y la pasarela de pagos integrada con la API oficial de Mercado Pago:

> [!IMPORTANT]
> **Requisito para probar Mercado Pago:**  
> Por motivos de seguridad de Mercado Pago, una cuenta vendedora no puede comprarse a sí misma.  
> **Abrir la web en una Ventana de Incógnito** (`Ctrl + Shift + N` en Google Chrome) antes de probar el pago para que el navegador no tome una cuenta personal de Mercado Pago que tengas abierta.
> [!TIP]
> **Simulación Directa Alternativa (Sin Login):**  
> En el paso 3 del Checkout también se encuentra disponible la opción **"Tarjeta de Crédito / Débito directa"**. Al seleccionarla y presionar "Confirmar y Pagar", el sistema simula inmediatamente la acreditación bancaria: registra el pedido con ID único, descuenta el stock del inventario, vacía la bolsa y despliega el comprobante fiscal terminado sin necesidad de ingresar a Mercado Pago.

---

## 🧪 Pruebas Automatizadas (Playwright)

El proyecto incluye 12 pruebas automatizadas de integración y extremo a extremo (E2E) distribuidas en 4 suites:
1. `tests/api-v1.spec.js`: Verificación de endpoints REST v1, esquemas Zod, códigos HTTP y 404 semántico.
2. `tests/autenticacion.spec.js`: Formularios de login, mensajes de error ante credenciales inválidas y modo de recuperación.
3. `tests/carrito.spec.js`: Flujo de compra, adición de perfumes, apertura de CartDrawer y transición a Checkout.
4. `tests/catalogo.spec.js`: Carga del catálogo con fotos reales, buscador en vivo y filtros por familia olfativa.

Para ejecutar todas las pruebas en local:
```bash
npm test
```

Para generar la compilación de producción verificada:
```bash
npm run build
```
