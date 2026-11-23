import { NextResponse } from "next/server";
import crypto from "crypto";
import { reconcilePayment } from "@/lib/mercadopago-conciliacion";

/**
 * Valida la firma criptográfica HMAC-SHA256 del webhook si se ha configurado MP_WEBHOOK_SECRET.
 * Si no está configurada, la autenticidad se garantiza mediante consulta server-to-server a la API de MP.
 */
function verifyMercadoPagoSignature(request, paymentId) {
  const secret = process.env.MP_WEBHOOK_SECRET || process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    // Sin secreto configurado, la autenticación se delega a la consulta obligatoria a la API oficial de MP
    return { verified: true, method: "server_api_query" };
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!xSignature) {
    return { verified: false, reason: "Cabecera x-signature ausente" };
  }

  const parts = xSignature.split(",").reduce((acc, part) => {
    const [key, val] = part.split("=");
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
  }, {});

  const ts = parts.ts;
  const hash = parts.v1;

  if (!ts || !hash) {
    return { verified: false, reason: "Formato de x-signature inválido" };
  }

  const manifest = `id:${paymentId};request-id:${xRequestId || ""};ts:${ts};`;
  const computedHash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  if (computedHash !== hash) {
    return { verified: false, reason: "Firma criptográfica HMAC no coincide" };
  }

  return { verified: true, method: "hmac_sha256" };
}

/**
 * Webhook oficial de Mercado Pago para Notificaciones de Pagos (IPN / Webhooks v2).
 *
 * Principios de conciliación segura:
 * 1. Filtro estricto de eventos: Ignora notificaciones ajenas a pagos.
 * 2. Validación de autenticidad criptográfica (HMAC-SHA256) cuando esté configurada.
 * 3. Consulta al servidor de Mercado Pago (Cero confianza en el payload recibido).
 * 4. Actualización de estado en Supabase y descuento de stock SOLO ante estado 'approved'.
 * 5. Idempotencia: Múltiples entregas del mismo evento no duplican el descuento de stock.
 * 6. Manejo de errores:
 *    - 200 OK para eventos exitosos o eventos ignorados intencionalmente.
 *    - 400 Bad Request para peticiones sin ID de pago.
 *    - 401 Unauthorized si la firma criptográfica es inválida.
 *    - 500 Internal Server Error para fallos recuperables (DB o red), forzando reintento de MP.
 */
export async function POST(request) {
  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    // El ID del pago puede venir en el body (Webhooks v2) o en query param (IPN)
    const paymentId =
      body?.data?.id ||
      body?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    const topic = body?.type || body?.topic || url.searchParams.get("topic") || url.searchParams.get("type");

    // 1. Ignorar eventos que no sean de tipo pago
    if (topic && topic !== "payment") {
      return NextResponse.json(
        { status: "ignored", reason: `Tipo de evento no relevante: ${topic}` },
        { status: 200 }
      );
    }

    // 2. Si no hay ID de pago en la petición, rechazar con 400
    if (!paymentId) {
      return NextResponse.json(
        { error: "Identificador de pago ausente en la notificación" },
        { status: 400 }
      );
    }

    // 3. Validación de autenticidad criptográfica cuando corresponda
    const sigCheck = verifyMercadoPagoSignature(request, paymentId);
    if (!sigCheck.verified) {
      console.warn(`[Webhook Mercado Pago] Notificación rechazada por firma inválida: ${sigCheck.reason}`);
      return NextResponse.json(
        { error: "Autenticación de notificación fallida", reason: sigCheck.reason },
        { status: 401 }
      );
    }

    // 4. Ejecutar la conciliación segura en el servidor
    const result = await reconcilePayment({ paymentId });

    console.log(`[Webhook Mercado Pago] Pago ${paymentId} procesado con éxito:`, result);

    return NextResponse.json(
      { status: "success", result },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Webhook Mercado Pago] Error crítico procesando webhook:", error);

    // Ante errores de base de datos o fallo de API externa, responder 500 para que Mercado Pago reintente
    return NextResponse.json(
      {
        error: "Error interno al conciliar el pago en el webhook",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Soporte para verificación GET / Health Check
export async function GET() {
  return NextResponse.json(
    { status: "Webhook de Mercado Pago activo y escuchando eventos" },
    { status: 200 }
  );
}
