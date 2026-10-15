import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, customer, orderId } = body;

    const token =
      process.env.MP_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Token de Mercado Pago no configurado en variables de entorno" },
        { status: 500 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No hay productos para procesar el pago" },
        { status: 400 }
      );
    }

    // Inicializar cliente oficial de Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);

    // Obtener la URL base dinámica (localhost o dominio de Vercel)
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";

    // Mapear los perfumes a la estructura de Mercado Pago
    const mpItems = items.map((it) => ({
      id: String(it.id),
      title: `${it.name} (${it.brand})`,
      description: it.family || "Perfumería de autor",
      picture_url: it.image,
      quantity: Number(it.quantity),
      unit_price: Number(it.price),
      currency_id: "ARS"
    }));

    // Calcular costo de envío y sumarlo a la preferencia si corresponde
    const subtotal = items.reduce(
      (acc, i) => acc + Number(i.price) * Number(i.quantity),
      0
    );
    const shippingCost = subtotal >= 200000 ? 0 : 7500;
    if (shippingCost > 0) {
      mpItems.push({
        id: "costo-envio",
        title: "Costo de Envío a Domicilio",
        description: "Envío con seguimiento online",
        quantity: 1,
        unit_price: shippingCost,
        currency_id: "ARS"
      });
    }

    // Crear la preferencia oficial con URLs de retorno
    const preferenceBody = {
      items: mpItems,
      payer: {
        name: customer?.name || "Cliente",
        email: customer?.email || "cliente@aura.com",
        phone: {
          number: customer?.phone ? String(customer.phone) : "1123456789"
        },
        address: {
          street_name: customer?.address || "Dirección de entrega"
        }
      },
      back_urls: {
        success: `${origin}/resultado-pago`,
        failure: `${origin}/resultado-pago`,
        pending: `${origin}/resultado-pago`
      },
      external_reference: orderId || `AURA-${Date.now()}`,
      statement_descriptor: "AURA PARFUMS"
    };

    // Mercado Pago solo permite auto_return en URLs HTTPS públicas
    if (origin.startsWith("https://")) {
      preferenceBody.auto_return = "approved";
    }

    const response = await preference.create({ body: preferenceBody });

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });
  } catch (error) {
    console.error("Error al crear preferencia en Mercado Pago:", error);
    return NextResponse.json(
      {
        error:
          error?.message || "Ocurrió un error al generar la preferencia de Mercado Pago"
      },
      { status: 500 }
    );
  }
}
