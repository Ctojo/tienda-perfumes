import { createClient } from "@/utils/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/pedidos/:id
 *
 * Principios REST (Clase 10 - Slides 7, 8, 9, 16):
 * - Identificador único de pedido (order_id o id numérico)
 * - Retorna HTTP 200 OK con el pedido o HTTP 404 Not Found
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return errorResponse("El identificador del pedido es obligatorio", 400);
    }

    const supabase = await createClient();

    // Buscar por order_id (ej: AURA-123456-7890) o id numérico
    const isNumeric = /^\d+$/.test(id);
    let query = supabase.from("pedidos").select("*");

    if (isNumeric) {
      query = query.or(`id.eq.${id},order_id.eq.${id}`);
    } else {
      query = query.eq("order_id", id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return errorResponse(`No se encontró ningún pedido con identificador '${id}'`, 404);
    }

    return successResponse(data, 200);
  } catch (error) {
    return handleApiError(error, "Error al obtener el detalle del pedido");
  }
}
