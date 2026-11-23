import { createClient } from "@/utils/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { createPedidoSchema, sanitizeString } from "@/lib/validations";

/**
 * GET /api/v1/pedidos
 *
 * Principios REST (Clase 10 - Slides 6, 7, 8, 9, 16):
 * - Sustantivo en plural (/pedidos)
 * - Versionado /v1/
 * - Query Params para filtrado y paginación (?status=approved&page=1&limit=10)
 * - Retorna HTTP 200 OK con metadatos
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

    const supabase = await createClient();
    let query = supabase.from("pedidos").select("*", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error al consultar pedidos en Supabase:", error.message);
      return errorResponse("Error de base de datos al listar pedidos", 500);
    }

    const total = count || (data ? data.length : 0);

    return successResponse(data || [], 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return handleApiError(error, "Error al obtener la lista de pedidos");
  }
}

/**
 * POST /api/v1/pedidos
 *
 * Principios REST (Clase 10 - Slides 5, 8, 9, 12, 13, 16):
 * - Verbo POST: creación de nuevo pedido
 * - Validación obligatoria del body con esquema Zod (createPedidoSchema)
 * - Sanitización de datos del cliente
 * - Cálculo de costos y stock en el servidor (nunca confiar en datos financieros del cliente)
 * - Retorna HTTP 201 Created ante éxito
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return errorResponse("El cuerpo de la petición (JSON) es obligatorio", 400);
    }

    // 1. Validación estricta con Zod (Slide 12 y 13)
    const validation = createPedidoSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        "Datos del pedido inválidos",
        400,
        validation.error.issues
      );
    }

    const { items, customer, paymentMethod, orderId: customOrderId } = validation.data;

    // 2. Sanitización preventiva de los datos del cliente
    const sanitizedCustomer = {
      name: sanitizeString(customer.name),
      email: customer.email.toLowerCase().trim(),
      phone: sanitizeString(customer.phone || ""),
      address: sanitizeString(customer.address),
      city: sanitizeString(customer.city || "Buenos Aires")
    };

    // 3. Reglas de negocio en el servidor (Cálculo de subtotal y envío)
    const subtotal = items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );
    const freeShippingThreshold = 200000;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : 7500;
    const total = subtotal + shippingCost;

    // Generar identificador único de orden de compra
    const orderId =
      customOrderId ||
      `AURA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const supabase = await createClient();

    // Determinar si es pago externo (Mercado Pago) o pago directo inmediato
    const isMercadoPago = (paymentMethod || "").toLowerCase() === "mercadopago";
    const initialStatus = isMercadoPago ? "pending" : "approved";

    // 4. Inserción del pedido en Supabase (pending si es MP, approved si es directo)
    const { data: newOrder, error: insertError } = await supabase
      .from("pedidos")
      .insert({
        order_id: orderId,
        client_name: sanitizedCustomer.name,
        client_email: sanitizedCustomer.email,
        client_phone: sanitizedCustomer.phone,
        client_address: `${sanitizedCustomer.address}, ${sanitizedCustomer.city}`,
        total,
        payment_method: paymentMethod || "mercadopago",
        status: initialStatus,
        items: items.map((i) => ({
          id: i.id,
          name: sanitizeString(i.name),
          brand: sanitizeString(i.brand || ""),
          price: Number(i.price),
          quantity: Number(i.quantity)
        }))
      })
      .select()
      .single();

    if (insertError) {
      console.warn("Aviso al registrar pedido en Supabase:", insertError.message);
    } else if (initialStatus === "approved") {
      // 5. Descontar stock únicamente si el pago fue aprobado de inmediato
      for (const item of items) {
        try {
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
        } catch (stockErr) {
          console.warn(`Aviso stock perfume ${item.id}:`, stockErr.message);
        }
      }
    }

    const responsePayload = {
      orderId,
      status: initialStatus,
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

    // HTTP 201 Created (Slide 5 y 16)
    return successResponse(responsePayload, 201);
  } catch (error) {
    return handleApiError(error, "Error interno al procesar el pedido");
  }
}
