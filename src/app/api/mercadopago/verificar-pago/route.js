import { NextResponse } from "next/server";
import { reconcilePayment } from "@/lib/mercadopago-conciliacion";

/**
 * POST /api/mercadopago/verificar-pago
 *
 * Endpoint del servidor para verificar el estado de un pago al regresar de Mercado Pago.
 * Ejecuta la conciliación server-side de manera idéntica al webhook, garantizando que:
 * 1. El cliente jamás modifique directamente la base de datos desde el navegador.
 * 2. El stock solo se descuente si Mercado Pago confirma el estado 'approved'.
 * 3. Es idempotente frente a llamadas repetidas o concurrentes con el webhook.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { paymentId, orderId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "El paymentId es requerido para verificar el pago" },
        { status: 400 }
      );
    }

    const result = await reconcilePayment({
      paymentId: String(paymentId),
      orderIdHint: orderId
    });

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error("Error al verificar pago en el servidor:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al verificar el pago"
      },
      { status: 500 }
    );
  }
}
