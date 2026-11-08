# Estrategia de Testing, Depuración y Calidad de Software (Clase 12 / Módulo 13)

Este documento detalla la estrategia integral de calidad de software implementada en **AURA (Haute Parfumerie)**, cubriendo tanto los fundamentos teóricos de aseguramiento de calidad (QA) y control de calidad (QC), como la ejecución práctica de pruebas automatizadas End-to-End (E2E) con **Playwright**.

---

## 1. Fundamentos: QA vs QC (Slide 3 y 4)

* **Control de Calidad (QC - Quality Control):** Enfoque reactivo centrado en examinar el producto final para detectar defectos existentes antes de su entrega al usuario final (ejecución de pruebas manuales y validación de aceptación).
* **Aseguramiento de Calidad (QA - Quality Assurance):** Enfoque proactivo orientado a mejorar los procesos de ingeniería de software para prevenir la aparición de defectos desde las fases iniciales del ciclo de vida (estándares de código con ESLint, validación de esquemas con Zod en backend y pipelines automatizados de CI/CD).

---

## 2. Casos de Prueba Formales (Test Cases) (Slide 5)

| ID | Nombre | Precondición | Pasos de Ejecución | Datos de Entrada | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-001** | Búsqueda y filtrado dinámico de fragancias | Catálogo cargado en `/` | 1. Ingresar texto en la barra de búsqueda.<br>2. Observar la actualización de la grilla de productos. | Query: `"Sauvage"` | La grilla muestra únicamente *Sauvage Elixir* y oculta los demás perfumes. | **PASS** |
| **TC-002** | Incorporación al carrito y umbral de envío | Usuario en `/` con carrito vacío | 1. Hacer clic en "Añadir al carrito" de un perfume.<br>2. Abrir el drawer lateral de compra.<br>3. Verificar subtotal y cálculo de envío. | Producto: *Bleu de Chanel* ($210.000 ARS) | El drawer se abre, el producto figura con cantidad 1 y el envío figura como **GRATIS** por superar el umbral de $200.000 ARS. | **PASS** |
| **TC-003** | Manejo semántico de error en Login | Usuario no autenticado en `/login` | 1. Ingresar correo no registrado.<br>2. Ingresar contraseña errónea.<br>3. Presionar "Iniciar Sesión". | Email: `inexistente@test.com`<br>Pass: `123456` | El sistema bloquea el acceso y muestra la alerta: *"Correo o contraseña incorrectos."* | **PASS** |
| **TC-004** | Validación con Zod en API REST v1 | Endpoint disponible en `/api/v1/perfumes` | 1. Enviar petición HTTP POST sin los campos requeridos (`brand`, `price`, etc.). | Body: `{"name": "Incompleto"}` | El servidor responde con código **HTTP 400 Bad Request** y un arreglo `details` con los campos observados. | **PASS** |

---

## 3. Plantilla Profesional de Reporte de Bug (Slide 6)

Cuando se detecta una discrepancia entre el comportamiento esperado y el obtenido, se documenta bajo el siguiente estándar:

```markdown
### [BUG-001] Falla de sesión al abrir enlace de restablecimiento de contraseña directo

* **Título:** Error "Auth session missing!" al intentar cambiar contraseña sin token previo
* **Severidad:** Media (afecta flujo de autenticación pero tiene mensaje preventivo)
* **Prioridad:** Alta (debe resolverse antes de la entrega final)
* **Entorno:** Google Chrome 124, Windows 11, Next.js 16 (App Router)
* **Pasos para Reproducir:**
  1. Ingresar manualmente por barra de direcciones a `http://localhost:3000/actualizar-password`.
  2. Escribir una nueva contraseña en ambos casilleros.
  3. Presionar "Guardar Nueva Contraseña".
* **Comportamiento Esperado:** La interfaz debe advertir claramente que se requiere un enlace de seguridad enviado al correo para identificar la cuenta.
* **Comportamiento Obtenido:** Supabase Auth rechazaba con error 401 "Auth session missing!".
* **Solución Implementada:** Se integró un route handler de intercambio PKCE en `/auth/callback` y una tarjeta informativa amarilla que bloquea el envío si no hay sesión activa.
```

---

## 4. Pruebas Automatizadas E2E con Playwright (Slides 14, 15 y 16)

Playwright automatiza la interacción real del usuario controlando Chromium de forma nativa sin drivers externos.

### Suites Implementadas en el Proyecto (`tests/`):
1. **`tests/catalogo.spec.js`:** Valida la carga inicial del home, el branding de AURA, el filtrado en vivo por texto en la barra de búsqueda y el filtrado por familias olfativas.
2. **`tests/carrito.spec.js`:** Valida la interacción al presionar "Añadir al carrito", la apertura del componente `CartDrawer` con roles accesibles (`aria-label="Carrito de compras"`) y la navegación hacia `/checkout`.
3. **`tests/autenticacion.spec.js`:** Valida el formulario de login, el manejo de credenciales erróneas y la transición hacia el modo de recuperación de contraseña.
4. **`tests/api-v1.spec.js`:** Valida los endpoints REST v1 (`GET` y `POST`) verificando códigos HTTP semánticos (200 OK, 400 Bad Request, 404 Not Found) y las aserciones de esquemas Zod.

---

## 5. Comandos de Ejecución

Desde la terminal del proyecto podés ejecutar:

```bash
# Ejecutar todas las pruebas E2E en modo headless (consola)
npm test

# Ejecutar pruebas con la interfaz interactiva gráfica (Playwright UI Mode)
npm run test:ui

# Abrir el grabador interactivo de pruebas en vivo (Codegen - Slide 16)
npm run test:codegen

# Visualizar el reporte HTML completo de la última ejecución
npm run test:report

# Inspeccionar trazas paso a paso en caso de fallo (Trace Viewer - Slide 16)
npx playwright show-trace test-results/.../trace.zip
```
