import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, customer, paymentMethod } = body;

    // Validación básica de seguridad en el servidor
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No hay productos en el carrito" },
        { status: 400 }
      );
    }

    if (!customer?.name || !customer?.email || !customer?.address) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios de envío" },
        { status: 400 }
      );
    }

    // Calcular el total en el servidor
    const subtotal = items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );
    const freeShippingThreshold = 200000;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : 7500;
    const total = subtotal + shippingCost;

    // Generar identificador único de orden de compra
    const orderId = `AURA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Guardar el pedido y descontar stock en Supabase
    try {
      const supabase = await createClient();

      // 1. Insertar en la tabla "pedidos"
      const { error: insertError } = await supabase.from("pedidos").insert({
        order_id: orderId,
        client_name: customer.name,
        client_email: customer.email,
        client_phone: customer.phone || "",
        client_address: `${customer.address}, ${customer.city || "Buenos Aires"}`,
        total: total,
        payment_method: paymentMethod || "mercadopago",
        status: "approved",
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          brand: i.brand,
          price: i.price,
          quantity: i.quantity
        }))
      });

      if (insertError) {
        console.warn("Aviso al registrar pedido en Supabase:", insertError.message);
      } else {
        // 2. Descontar el stock en la tabla "perfumes"
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

    // Respuesta de la transacción
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
      customer: {
        name: customer.name,
        email: customer.email,
        address: customer.address,
        city: customer.city || "Buenos Aires"
      },
      transactionId: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    return NextResponse.json(paymentResponse, { status: 200 });
  } catch (error) {
    console.error("Error en /api/checkout:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el pago" },
      { status: 500 }
    );
  }
}
