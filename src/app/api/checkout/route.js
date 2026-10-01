import { NextResponse } from "next/server";

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

    // Calcular el total en el servidor para evitar manipulación de precios desde el cliente
    const subtotal = items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );
    const freeShippingThreshold = 200000;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : 7500;
    const total = subtotal + shippingCost;

    // Generar identificador único de orden de compra
    const orderId = `AURA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Simulación de respuesta de pasarela de pago (Mercado Pago / Gateway)
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
