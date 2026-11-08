# DevOps y Despliegue Continuo (Clase 13 / Módulo 14)

Este documento describe la arquitectura de infraestructura, el pipeline de Integración Continua (CI), Despliegue Continuo (CD) y las prácticas de observabilidad implementadas en **AURA (Haute Parfumerie)**.

---

## 1. Paradigma Serverless y Vercel (Slide 3 y 4)

* **Abstracción de Servidores:** La aplicación no utiliza servidores dedicados (VPS/Nginx) sino una arquitectura **Serverless / Edge**, eliminando la sobrecarga operativa de parches de seguridad, balanceo de carga manual y mantenimiento de sistemas operativos.
* **Pipeline de Despliegue Continuo (CD):** Conectado directamente al repositorio oficial de GitHub (`https://github.com/Ctojo/tienda-perfumes.git` en la rama `main`).
* **Optimización en Edge Network:**
  * Páginas estáticas cacheadas globalmente en la CDN de Vercel (SSG).
  * Funciones Serverless bajo demanda para Route Handlers (`/api/v1/perfumes`, `/api/v1/pedidos`, `/api/mercadopago/crear-preferencia`).
  * Compresión automática de imágenes y activos estáticos.

---

## 2. Gestión Segura de Variables de Entorno (Slide 5 y 6)

El proyecto sigue el estándar de los doce factores (*12-Factor App*) separando estrictamente el código fuente de la configuración confidencial:

* **Aislamiento en Git:** Todos los archivos `.env*` están explícitamente ignorados en `.gitignore` para evitar filtraciones en repositorios públicos.
* **Prefijo `NEXT_PUBLIC_`:**
  * `NEXT_PUBLIC_SUPABASE_URL`: Expuesta al cliente para inicializar el SDK del navegador.
  * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Clave pública de acceso a Supabase con políticas RLS activas.
* **Secretos de Servidor (Sin prefijo público):**
  * `MP_ACCESS_TOKEN`: Token de autenticación de Mercado Pago. Permanece **exclusivamente en el entorno Node.js del servidor** y nunca se expone al bundle de JavaScript del navegador.
* **Inyección en Producción:** Todas las variables de entorno están cargadas y cifradas en reposo dentro del panel de administración de Vercel (*Project Settings → Environment Variables*).

---

## 3. Dominios, DNS y Certificados SSL/TLS (Slide 7 y 8)

* **URL de Producción:** [`https://tienda-perfumes-rust.vercel.app`](https://tienda-perfumes-rust.vercel.app)
* **Certificado SSL/TLS Automático:** Provisionado y renovado automáticamente sin intervención manual mediante la entidad certificadora **Let's Encrypt**.
* **Cifrado en Tránsito:** Tráfico forzado sobre **HTTPS** (puerto 443 con TLS 1.3). Las conexiones inseguras en HTTP plano (puerto 80) son redirigidas de forma transparente con código HTTP 308 Permanent Redirect.

---

## 4. Observabilidad y Monitoreo (Slide 9, 10 y 11)

* **Build Logs:** Auditoría paso a paso de cada proceso de compilación, empaquetado de Turbopack y recolección de rutas estáticas.
* **Runtime Logs:** Registro de eventos en tiempo real para las funciones Serverless:
  * Inspección de llamadas al webhook de Mercado Pago (`/api/webhooks/mercadopago`).
  * Auditoría de errores y alertas en el manejador centralizado de APIs (`handleApiError`).
* **Core Web Vitals:** Monitoreo del rendimiento de cara al usuario final (LCP - Largest Contentful Paint, INP - Interaction to Next Paint, CLS - Cumulative Layout Shift).

---

## 5. Pipeline de Integración Continua (CI) con GitHub Actions (Slide 12 a 16)

El flujo de trabajo automatizado está definido en [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

```yaml
name: CI/CD Pipeline - Calidad y Despliegue Continuo (AURA)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Ciclo Completo del Pipeline:
1. **Trigger:** Se activa automáticamente ante cualquier `push` o `pull_request` a `main`.
2. **Runner:** Corre en una máquina virtual limpia con Ubuntu LTS (`ubuntu-latest`).
3. **Instalación limpia (`npm ci`):** Garantiza que las dependencias instaladas coincidan exactamente con el árbol de `package-lock.json`.
4. **Validación de Compilación (`npm run build`):** Verifica que todo el proyecto compile sin errores de sintaxis, tipos o rutas dinámicas.
5. **Verificación de Calidad (`npm test`):** Ejecuta las 12 pruebas E2E y de API de Playwright. Si una sola prueba falla, el pipeline se detiene y bloquea el despliegue a producción.
6. **Despliegue Continuo (CD):** Si el pipeline pasa en verde, Vercel distribuye automáticamente la nueva versión a la Edge Network global.
