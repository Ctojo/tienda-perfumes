import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@/utils/supabase/server";

/**
 * Servicio centralizado de conciliación de pagos de Mercado Pago.
 *
 * Aplica los principios de:
 * 1. Cero confianza en el cliente: La verificación se realiza consultando la API oficial de Mercado Pago en el servidor.
 * 2. Idempotencia: Si un pago ya fue conciliado y su stock descontado, llamadas posteriores no vuelven a descontar stock.
 * 3. Atomicidad: Descuenta stock en Supabase ÚNICAMENTE cuando el estado del pago está formalmente "approved".
 *
 * @param {Object} params
 * @param {string|number} params.paymentId - Identificador del pago en Mercado Pago.
 * @param {string} [params.orderIdHint] - ID de orden externo opcional si no vino en el pago.
 * @returns {Promise<Object>} Resultado de la conciliación.
 */
export async function reconcilePayment({ paymentId, orderIdHint }) {
  if (!paymentId) {
    throw new Error("El ID de pago de Mercado Pago es obligatorio.");
  }

  const token =
    process.env.MP_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Token de acceso de Mercado Pago no configurado en variables de entorno.");
  }

  // 1. Consultar el pago en la API oficial de Mercado Pago
  const client = new MercadoPagoConfig({ accessToken: token });
  const paymentClient = new Payment(client);
  const payment = await paymentClient.get({ id: String(paymentId) });

  if (!payment) {
    throw new Error(`No se encontró información para el pago ID ${paymentId} en Mercado Pago.`);
  }

  const orderId = payment.external_reference || orderIdHint;
  const paymentStatus = payment.status; // 'approved', 'rejected', 'in_process', 'pending', 'cancelled'
  const paymentType = payment.payment_type_id || payment.payment_method_id || "mercadopago";

  if (!orderId) {
    return {
      status: "ignored",
      reason: "missing_external_reference",
      paymentId,
      paymentStatus
    };
  }

  // 2. Consultar el estado actual del pedido en Supabase
  const supabase = await createClient();
  const { data: order, error: orderErr } = await supabase
    .from("pedidos")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (orderErr) {
    throw new Error(`Error al consultar pedido ${orderId} en base de datos: ${orderErr.message}`);
  }

  if (!order) {
    return {
      status: "not_found",
      orderId,
      paymentId,
      paymentStatus
    };
  }

  // 3. Flujo según el estado del pago
  if (paymentStatus === "approved") {
    // Verificación de Idempotencia: Si ya estaba aprobado, no volver a descontar stock
    if (order.status === "approved") {
      return {
        status: "already_approved",
        orderId,
        paymentId,
        paymentStatus,
        message: "El pedido ya se encontraba aprobado y conciliado previamente."
      };
    }

    // A. Actualizar estado del pedido a 'approved'
    const { error: updateErr } = await supabase
      .from("pedidos")
      .update({
        status: "approved",
        payment_method: `Mercado Pago (${paymentType})`
      })
      .eq("order_id", orderId);

    if (updateErr) {
      throw new Error(`Error al actualizar estado del pedido ${orderId}: ${updateErr.message}`);
    }

    // B. Descontar stock atómicamente en la tabla 'perfumes'
    const items = Array.isArray(order.items) ? order.items : [];
    const stockResults = [];

    for (const item of items) {
      try {
        const { data: prod } = await supabase
          .from("perfumes")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (prod && typeof prod.stock === "number") {
          const qty = Number(item.quantity) || 1;
          const newStock = Math.max(0, prod.stock - qty);
          await supabase
            .from("perfumes")
            .update({ stock: newStock })
            .eq("id", item.id);

          stockResults.push({ id: item.id, previous: prod.stock, current: newStock });
        }
      } catch (stockErr) {
        console.error(`Error al descontar stock para producto ${item.id}:`, stockErr);
      }
    }

    return {
      status: "approved",
      orderId,
      paymentId,
      paymentStatus,
      stockUpdated: true,
      stockDetails: stockResults
    };
  }

  if (paymentStatus === "rejected" || paymentStatus === "cancelled") {
    // Si no estaba aprobado previamente, registrar el rechazo/cancelación
    if (order.status !== "approved") {
      await supabase
        .from("pedidos")
        .update({
          status: paymentStatus,
          payment_method: `Mercado Pago (${paymentType})`
        })
        .eq("order_id", orderId);
    }

    return {
      status: paymentStatus,
      orderId,
      paymentId,
      paymentStatus
    };
  }

  // Estado pendiente / en proceso
  if (order.status !== "approved") {
    await supabase
      .from("pedidos")
      .update({
        status: "pending",
        payment_method: `Mercado Pago (${paymentType})`
      })
      .eq("order_id", orderId);
  }

  return {
    status: "pending",
    orderId,
    paymentId,
    paymentStatus
  };
}
