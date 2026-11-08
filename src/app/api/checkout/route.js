import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createPedidoSchema, sanitizeString } from "@/lib/validations";
import { handleApiError } from "@/lib/api-response";

/**
 * POST /api/checkout
 *
 * Endpoint de checkout que ahora implementa validación con esquemas Zod (Clase 10 - Slides 12 y 13)
 * y manejo centralizado de errores manteniendo retrocompatibilidad completa con el frontend existente.
 */
export async function POST(request) {
  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody) {
      return NextResponse.json(
        { error: "Cuerpo de la petición vacío o JSON inválido" },
        { status: 400 }
      );
    }

    // 1. Validación estricta con esquema Zod (Slide 12 y 13)
    const validation = createPedidoSchema.safeParse(rawBody);
    if (!validation.success) {
      const errorDetails = validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json(
        {
          error: "Datos obligatorios de envío o carrito inválidos",
          details: errorDetails
        },
        { status: 400 }
      );
    }

    const { items, customer, paymentMethod } = validation.data;

    // 2. Sanitización de datos
    const sanitizedCustomer = {
      name: sanitizeString(customer.name),
      email: customer.email.toLowerCase().trim(),
      phone: sanitizeString(customer.phone || ""),
      address: sanitizeString(customer.address),
      city: sanitizeString(customer.city || "Buenos Aires")
    };

    // 3. Cálculo de costos en el servidor
    const subtotal = items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );
    const freeShippingThreshold = 200000;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : 7500;
    const total = subtotal + shippingCost;

    // Generar identificador único de orden de compra
    const orderId = `AURA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Guardar pedido y descontar stock en Supabase
    try {
      const supabase = await createClient();

      const { error: insertError } = await supabase.from("pedidos").insert({
        order_id: orderId,
        client_name: sanitizedCustomer.name,
        client_email: sanitizedCustomer.email,
        client_phone: sanitizedCustomer.phone,
        client_address: `${sanitizedCustomer.address}, ${sanitizedCustomer.city}`,
        total: total,
        payment_method: paymentMethod || "mercadopago",
        status: "approved",
        items: items.map((i) => ({
          id: i.id,
          name: sanitizeString(i.name),
          brand: sanitizeString(i.brand || ""),
          price: i.price,
          quantity: i.quantity
        }))
      });

      if (insertError) {
        console.warn("Aviso al registrar pedido en Supabase:", insertError.message);
      } else {
        // Descontar stock
        for (const item of items) {
          const { data: prod } = await supabase
            .from("perfumes")
            .select("stock")
            .eq("id", item.id)
            .single();

          if (prod && typeof prod.stock === "number") {
            const newStock = Math.max(0, prod.stock - item.quantity);
            await supabase
              .from("perfumes")
              .update({ stock: newStock })
              .eq("id", item.id);
          }
        }
      }
    } catch (dbErr) {
      console.error("Error al interactuar con Supabase:", dbErr);
    }

    // 5. Respuesta exitosa con código HTTP 201 Created
    const paymentResponse = {
      success: true,
      orderId,
      status: "approved",
      statusDetail: "accredited",
      dateCreated: new Date().toISOString(),
      paymentMethod: paymentMethod || "mercadopago",
      summary: {
        itemsCount: items.reduce((acc, i) => acc + i.quantity, 0),
        subtotal,
        shippingCost,
        total
      },
      customer: sanitizedCustomer,
      transactionId: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    return NextResponse.json(paymentResponse, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Error interno al procesar el pago");
  }
}
