import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@/utils/supabase/server";

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

    const topic = body?.type || body?.topic || url.searchParams.get("topic");

    // Si no es un evento de pago o no hay ID, respondemos 200 para evitar reintentos innecesarios
    if (!paymentId || (topic && topic !== "payment")) {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const token =
      process.env.MP_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      console.error("Webhook: Token de Mercado Pago no configurado");
      return NextResponse.json({ error: "Missing MP Token" }, { status: 500 });
    }

    // Consultar la API oficial de Mercado Pago para obtener el estado verídico (Slide 12 y 13)
    const client = new MercadoPagoConfig({ accessToken: token });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: String(paymentId) });

    if (payment) {
      const orderId = payment.external_reference;
      const status = payment.status; // 'approved', 'rejected', 'pending', etc.
      const paymentType = payment.payment_type_id || "mercadopago";

      // Conciliación en Base de Datos Supabase (Slide 15)
      if (orderId) {
        const supabase = await createClient();

        await supabase
          .from("pedidos")
          .update({
            status: status === "approved" ? "approved" : status,
            payment_method: `Mercado Pago (${paymentType})`
          })
          .eq("order_id", orderId);

        console.log(`Webhook MP: Pedido ${orderId} conciliado a estado ${status}`);
      }
    }

    // Responder HTTP 200 de inmediato (Requisito obligatorio de Slide 12)
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error procesando Webhook de Mercado Pago:", error);
    // Respondemos 200 para evitar que Mercado Pago reintente en bucle ante errores no críticos
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}

// Soporte para verificación GET / IPN
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint activo" }, { status: 200 });
}

