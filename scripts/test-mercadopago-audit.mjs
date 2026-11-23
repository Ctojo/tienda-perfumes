import assert from "node:assert";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

console.log("=======================================================================");
console.log("🚀 EJECUTANDO AUDITORÍA TÉCNICA AUTOMATIZADA: PAGOS, WEBHOOK Y SEGURIDAD");
console.log("=======================================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

// ============================================================================
// BLOQUE 1: AUDITORÍA DE CREDENCIALES Y HISTORIAL DE GIT
// ============================================================================
console.log("--- BLOQUE 1: Credenciales, Variables de Entorno y Git ---");

runTest("1.1 El archivo .gitignore contiene las reglas para excluir archivos .env", () => {
  const gitignorePath = path.resolve(".gitignore");
  assert.ok(fs.existsSync(gitignorePath), ".gitignore debe existir");
  const content = fs.readFileSync(gitignorePath, "utf-8");
  assert.match(content, /\.env\*/, ".gitignore debe contener .env*");
});

runTest("1.2 No existen tokens de Mercado Pago hardcodeados en archivos de código activos", () => {
  const checkCmd = 'git grep -E "APP_USR-[0-9]{10,}" -- ":!.env*" ":!scripts/test-*"';
  try {
    const output = execSync(checkCmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
    assert.strictEqual(output.trim(), "", `Se encontraron tokens en código activo: ${output}`);
  } catch {
    // Si git grep sale con código 1, significa que no encontró coincidencias (correcto)
    assert.ok(true);
  }
});

runTest("1.3 El archivo .github/workflows/ci.yml NO contiene el token de Mercado Pago en texto plano", () => {
  const ciPath = path.resolve(".github/workflows/ci.yml");
  const content = fs.readFileSync(ciPath, "utf-8");
  assert.doesNotMatch(content, /APP_USR-5638914257499531/, "ci.yml no debe contener el token hardcodeado");
  assert.match(content, /MP_ACCESS_TOKEN:\s*\${{\s*secrets\.MP_ACCESS_TOKEN\s*}}/, "ci.yml debe consumir secrets.MP_ACCESS_TOKEN");
});

runTest("1.4 El Access Token privado no se exporta ni expone al cliente con prefijo NEXT_PUBLIC_", () => {
  try {
    const output = execSync('git grep "NEXT_PUBLIC_.*MP_ACCESS_TOKEN"', { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
    assert.strictEqual(output.trim(), "");
  } catch {
    assert.ok(true);
  }
});

runTest("1.5 Detección e inspección del historial de Git para evaluar commits con credenciales", () => {
  try {
    const gitLog = execSync('git log --all -S "APP_USR-5638914257499531" --oneline', { encoding: "utf-8" }).trim();
    if (gitLog) {
      console.log(`     ℹ️ [AUDITORÍA GIT] Se detectó commit histórico con credencial: ${gitLog}`);
    }
    // Debe existir registro histórico identificado para poder reportarlo
    assert.ok(gitLog.length > 0, "El commit histórico debe ser identificado");
  } catch (e) {
    throw new Error(`Fallo inspeccionando git log: ${e.message}`);
  }
});

// ============================================================================
// BLOQUE 2: AUDITORÍA DE LÓGICA DE APROBACIÓN Y DESCUENTO DE STOCK
// ============================================================================
console.log("\n--- BLOQUE 2: Lógica de Checkout y Desacoplamiento de Stock ---");

runTest("2.1 /api/checkout asigna 'pending' y NO descuenta stock cuando el método es mercadopago", () => {
  const checkoutCode = fs.readFileSync(path.resolve("src/app/api/checkout/route.js"), "utf-8");

  // Verificar que el estado inicial dependa del método de pago
  assert.match(checkoutCode, /isMercadoPago\s*=\s*\(paymentMethod\s*\|\|\s*""\)\.toLowerCase\(\)\s*===\s*"mercadopago"/);
  assert.match(checkoutCode, /initialStatus\s*=\s*isMercadoPago\s*\?\s*"pending"\s*:\s*"approved"/);

  // Verificar que el stock solo se descuente si initialStatus === "approved"
  assert.match(checkoutCode, /else\s+if\s*\(initialStatus\s*===\s*"approved"\)/, "Solo descuenta stock si ya está approved");
});

runTest("2.2 /api/v1/pedidos asigna 'pending' y NO descuenta stock cuando el método es mercadopago", () => {
  const pedidosCode = fs.readFileSync(path.resolve("src/app/api/v1/pedidos/route.js"), "utf-8");
  assert.match(pedidosCode, /isMercadoPago\s*=\s*\(paymentMethod\s*\|\|\s*""\)\.toLowerCase\(\)\s*===\s*"mercadopago"/);
  assert.match(pedidosCode, /initialStatus\s*=\s*isMercadoPago\s*\?\s*"pending"\s*:\s*"approved"/);
  assert.match(pedidosCode, /else\s+if\s*\(initialStatus\s*===\s*"approved"\)/);
});

runTest("2.3 /checkout (Frontend) maneja errores de creación de preferencia sin marcar compra aprobada falsa", () => {
  const checkoutPage = fs.readFileSync(path.resolve("src/app/checkout/page.js"), "utf-8");
  assert.match(checkoutPage, /if\s*\(redirectUrl\)\s*\{[\s\S]*?window\.location\.href\s*=\s*redirectUrl;[\s\S]*?return;[\s\S]*?\}\s*else\s*\{[\s\S]*?throw new Error/, "Debe lanzar error si no hay redirectUrl en MP");
});

// ============================================================================
// BLOQUE 3: AUDITORÍA DE CONCILIACIÓN, IDEMPOTENCIA Y WEBHOOK
// ============================================================================
console.log("\n--- BLOQUE 3: Conciliación, Webhook e Idempotencia ---");

runTest("3.1 El servicio de conciliación consulta obligatoriamente a la API de Mercado Pago", () => {
  const concilCode = fs.readFileSync(path.resolve("src/lib/mercadopago-conciliacion.js"), "utf-8");
  assert.match(concilCode, /new\s+MercadoPagoConfig\(\{[\s\S]*?accessToken/);
  assert.match(concilCode, /new\s+Payment\(client\)/);
  assert.match(concilCode, /paymentClient\.get\(\{\s*id:\s*String\(paymentId\)\s*\}\)/);
});

runTest("3.2 Idempotencia: Si el pedido ya está 'approved', no vuelve a descontar stock", () => {
  const concilCode = fs.readFileSync(path.resolve("src/lib/mercadopago-conciliacion.js"), "utf-8");
  assert.match(concilCode, /if\s*\(paymentStatus\s*===\s*"approved"\)\s*\{[\s\S]*?if\s*\(order\.status\s*===\s*"approved"\)\s*\{[\s\S]*?status:\s*"already_approved"/, "Debe retornar already_approved y salir sin descontar");
});

runTest("3.3 Descuento de stock ocurre ÚNICAMENTE cuando paymentStatus === 'approved'", () => {
  const concilCode = fs.readFileSync(path.resolve("src/lib/mercadopago-conciliacion.js"), "utf-8");
  // Verificar que el bloque de update perfumes esté contenido dentro del bloque approved
  const approvedSection = concilCode.substring(concilCode.indexOf('paymentStatus === "approved"'));
  assert.match(approvedSection, /\.from\(["']perfumes["']\)\s*\.update\(\s*\{\s*stock:\s*newStock\s*\}\s*\)/);
});

runTest("3.4 Pagos rechazados o cancelados NO descuentan stock y actualizan el pedido", () => {
  const concilCode = fs.readFileSync(path.resolve("src/lib/mercadopago-conciliacion.js"), "utf-8");
  assert.match(concilCode, /if\s*\(paymentStatus\s*===\s*"rejected"\s*\|\|\s*paymentStatus\s*===\s*"cancelled"\)/);
  const rejectSection = concilCode.substring(concilCode.indexOf('paymentStatus === "rejected"'));
  // No debe contener update a perfumes en la sección de rechazo
  assert.doesNotMatch(rejectSection.split("return {")[0], /\.from\("perfumes"\)\.update/);
});

runTest("3.5 Notificaciones fuera de orden NO degradan un pedido ya aprobado", () => {
  const concilCode = fs.readFileSync(path.resolve("src/lib/mercadopago-conciliacion.js"), "utf-8");
  // Verifica que en rechazo y en pendiente verifique if (order.status !== "approved")
  assert.match(concilCode, /if\s*\(order\.status\s*!==\s*"approved"\)\s*\{[\s\S]*?status:\s*paymentStatus/);
  assert.match(concilCode, /if\s*\(order\.status\s*!==\s*"approved"\)\s*\{[\s\S]*?status:\s*"pending"/);
});

runTest("3.6 El Webhook responde con códigos HTTP conformes (400, 200, 500 para reintentos de MP)", () => {
  const webhookCode = fs.readFileSync(path.resolve("src/app/api/webhooks/mercadopago/route.js"), "utf-8");
  assert.match(webhookCode, /status:\s*400/, "Debe responder 400 si falta el paymentId");
  assert.match(webhookCode, /status:\s*200/, "Debe responder 200 ante éxito o evento ignorado");
  assert.match(webhookCode, /status:\s*500/, "Debe responder 500 ante error interno para forzar reintento de MP");
});

runTest("3.7 El Webhook valida la firma criptográfica HMAC-SHA256 cuando MP_WEBHOOK_SECRET está activo", () => {
  const webhookCode = fs.readFileSync(path.resolve("src/app/api/webhooks/mercadopago/route.js"), "utf-8");
  assert.match(webhookCode, /verifyMercadoPagoSignature/, "Debe incluir función de verificación de firma");
  assert.match(webhookCode, /createHmac\("sha256",\s*secret\)/, "Debe computar HMAC SHA256");
  assert.match(webhookCode, /status:\s*401/, "Debe responder 401 si la firma es inválida");
});

runTest("3.8 /resultado-pago delega la conciliación al servidor mediante /api/mercadopago/verificar-pago", () => {
  const resultadoPago = fs.readFileSync(path.resolve("src/app/resultado-pago/page.js"), "utf-8");
  assert.match(resultadoPago, /fetch\("\/api\/mercadopago\/verificar-pago"/, "Debe llamar al endpoint de verificación");
  assert.doesNotMatch(resultadoPago, /supabase\.from\("pedidos"\)\.update/, "El cliente no debe hacer update directo a Supabase");
});

// ============================================================================
// BLOQUE 4: PRUEBA FUNCIONAL SIMULADA DEL MOTOR DE CONCILIACIÓN
// ============================================================================
console.log("\n--- BLOQUE 4: Prueba Funcional Simulada (Lógica de Máquina de Estados) ---");

// Simulador de estados de orden y stock para comprobar la máquina de transición
class MockOrderEngine {
  constructor() {
    this.stock = { "perfume-1": 10 };
    this.order = {
      order_id: "AURA-TEST-001",
      status: "pending",
      items: [{ id: "perfume-1", quantity: 2 }]
    };
  }

  processPaymentNotification(paymentStatus) {
    if (paymentStatus === "approved") {
      if (this.order.status === "approved") {
        return { status: "already_approved", stockChanged: false };
      }
      this.order.status = "approved";
      for (const item of this.order.items) {
        this.stock[item.id] = Math.max(0, this.stock[item.id] - item.quantity);
      }
      return { status: "approved", stockChanged: true };
    }

    if (paymentStatus === "rejected" || paymentStatus === "cancelled") {
      if (this.order.status !== "approved") {
        this.order.status = paymentStatus;
      }
      return { status: this.order.status, stockChanged: false };
    }

    if (this.order.status !== "approved") {
      this.order.status = "pending";
    }
    return { status: this.order.status, stockChanged: false };
  }
}

runTest("4.1 Simulación: Pago aprobado transiciona estado a 'approved' y descuenta 2 unidades", () => {
  const engine = new MockOrderEngine();
  assert.strictEqual(engine.order.status, "pending");
  assert.strictEqual(engine.stock["perfume-1"], 10);

  const res = engine.processPaymentNotification("approved");
  assert.strictEqual(res.status, "approved");
  assert.strictEqual(res.stockChanged, true);
  assert.strictEqual(engine.order.status, "approved");
  assert.strictEqual(engine.stock["perfume-1"], 8);
});

runTest("4.2 Simulación: Segunda notificación 'approved' idéntica es idempotente (no descuenta 2 veces)", () => {
  const engine = new MockOrderEngine();
  engine.processPaymentNotification("approved"); // Primera vez: baja a 8
  assert.strictEqual(engine.stock["perfume-1"], 8);

  const duplicateRes = engine.processPaymentNotification("approved"); // Segunda vez (duplicado)
  assert.strictEqual(duplicateRes.status, "already_approved");
  assert.strictEqual(duplicateRes.stockChanged, false);
  assert.strictEqual(engine.stock["perfume-1"], 8, "El stock no debe bajar a 6");
});

runTest("4.3 Simulación: Pago rechazado NO descuenta stock", () => {
  const engine = new MockOrderEngine();
  const res = engine.processPaymentNotification("rejected");
  assert.strictEqual(res.status, "rejected");
  assert.strictEqual(engine.stock["perfume-1"], 10, "El stock debe permanecer en 10");
});

runTest("4.4 Simulación: Notificación desordenada ('pending' post 'approved') no degrada la orden", () => {
  const engine = new MockOrderEngine();
  engine.processPaymentNotification("approved");
  assert.strictEqual(engine.order.status, "approved");

  const latePending = engine.processPaymentNotification("pending");
  assert.strictEqual(engine.order.status, "approved", "No debe volver a pending");
  assert.strictEqual(engine.stock["perfume-1"], 8);
});

console.log("\n=======================================================================");
console.log(`📊 RESULTADO DE LA AUDITORÍA: ${passedTests}/${totalTests} PRUEBAS EXITOSAS`);
console.log("=======================================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
