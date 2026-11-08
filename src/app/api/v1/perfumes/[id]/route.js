import { createClient } from "@/utils/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { updatePerfumeSchema, sanitizeString } from "@/lib/validations";
import { PERFUMES as FALLBACK_PERFUMES } from "@/data/perfumes";

/**
 * GET /api/v1/perfumes/:id
 *
 * Principios REST (Clase 10 - Slides 7, 8, 9, 16):
 * - Identificador dinámico para recursos específicos (/perfumes/:id)
 * - Extracción de Route Params (params.id)
 * - Retorna HTTP 200 OK si existe o HTTP 404 Not Found si no existe
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return errorResponse("El identificador del perfume es obligatorio", 400);
    }

    // 1. Buscar en Supabase
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("perfumes")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return successResponse(data, 200);
      }
    } catch (dbErr) {
      console.warn("API v1 perfumes/[id]: error consultando base:", dbErr.message);
    }

    // 2. Fallback de datos locales
    const localMatch = FALLBACK_PERFUMES.find(
      (p) => String(p.id) === String(id) || String(p.id) === String(id).toLowerCase()
    );

    if (localMatch) {
      return successResponse(localMatch, 200);
    }

    // HTTP 404 Not Found (Slide 16)
    return errorResponse(`No se encontró ningún perfume con ID '${id}'`, 404);
  } catch (error) {
    return handleApiError(error, "Error al obtener el perfume solicitado");
  }
}

/**
 * PUT / PATCH /api/v1/perfumes/:id
 *
 * Principios REST (Clase 10 - Slides 5, 8, 9, 12, 13, 16):
 * - Verbos PUT/PATCH: modificación de recurso existente
 * - Extracción combinada: Route Param (id) + Request Body (JSON)
 * - Validación con esquema Zod (updatePerfumeSchema)
 * - Códigos: 200 OK, 400 Bad Request, 404 Not Found, 500 Server Error
 */
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return errorResponse("El identificador del perfume es obligatorio", 400);
    }

    const body = await request.json().catch(() => null);
    if (!body || Object.keys(body).length === 0) {
      return errorResponse("Debes enviar al menos un campo para actualizar", 400);
    }

    // 1. Validación del esquema con Zod
    const validation = updatePerfumeSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        "Datos de actualización inválidos",
        400,
        validation.error.issues
      );
    }

    const updateData = validation.data;

    // 2. Sanitización de textos si están presentes
    if (updateData.name) updateData.name = sanitizeString(updateData.name);
    if (updateData.brand) updateData.brand = sanitizeString(updateData.brand);
    if (updateData.family) updateData.family = sanitizeString(updateData.family);
    if (updateData.description) updateData.description = sanitizeString(updateData.description);

    // 3. Actualizar en Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("perfumes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse(`No se encontró el perfume con ID '${id}' para actualizar`, 404);
      }
      return errorResponse("Error de base de datos al actualizar el perfume", 500);
    }

    return successResponse(data, 200);
  } catch (error) {
    return handleApiError(error, "Error al actualizar el perfume");
  }
}

export async function PATCH(request, context) {
  return PUT(request, context);
}

/**
 * DELETE /api/v1/perfumes/:id
 *
 * Principios REST (Clase 10 - Slides 5, 7, 16):
 * - Verbo DELETE: eliminación de un recurso (Idempotente)
 * - Delegar la acción al verbo HTTP y NO a la URL (no usar /api/deletePerfume)
 * - Retorna HTTP 200 OK con confirmación o HTTP 404 Not Found
 */
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return errorResponse("El identificador del perfume es obligatorio", 400);
    }

    const supabase = await createClient();
    const { error, count } = await supabase
      .from("perfumes")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      return errorResponse("Error al eliminar el perfume de la base de datos", 500);
    }

    if (count === 0) {
      return errorResponse(`No se encontró ningún perfume con ID '${id}'`, 404);
    }

    return successResponse(
      { id, deleted: true, message: `Perfume '${id}' eliminado con éxito` },
      200
    );
  } catch (error) {
    return handleApiError(error, "Error al procesar la eliminación del perfume");
  }
}
