import { createClient } from "@/utils/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { perfumeQuerySchema, createPerfumeSchema, sanitizeString } from "@/lib/validations";
import { PERFUMES as FALLBACK_PERFUMES } from "@/data/perfumes";

/**
 * GET /api/v1/perfumes
 *
 * Principios REST (Clase 10 - Slides 6, 7, 8, 9):
 * - Sustantivo en plural (/perfumes)
 * - Versionado en la URL (/v1/)
 * - Extracción de Query Params con validación Zod: ?categoria=...&search=...&sort=...&page=...&limit=...
 * - Paginación, ordenamiento y filtrado
 * - Respuestas estructuradas con códigos de estado HTTP semánticos (200 OK)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Extraer y validar Query Params con Zod (Slide 9 y 12)
    const rawParams = {
      categoria: searchParams.get("categoria") || undefined,
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined
    };

    const parsedQuery = perfumeQuerySchema.safeParse(rawParams);
    if (!parsedQuery.success) {
      return errorResponse("Parámetros de búsqueda inválidos", 400, parsedQuery.error.issues);
    }

    const { categoria, search, sort, page, limit } = parsedQuery.data;

    // 2. Intentar consultar la base de datos Supabase
    try {
      const supabase = await createClient();
      let query = supabase.from("perfumes").select("*", { count: "exact" });

      if (categoria && categoria !== "Todos") {
        query = query.or(`family.ilike.%${categoria}%,brand.ilike.%${categoria}%`);
      }

      if (search) {
        const cleanSearch = sanitizeString(search);
        query = query.or(`name.ilike.%${cleanSearch}%,brand.ilike.%${cleanSearch}%,family.ilike.%${cleanSearch}%`);
      }

      // Ordenamiento
      if (sort === "precio_asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "precio_desc") {
        query = query.order("price", { ascending: false });
      } else if (sort === "rating_desc") {
        query = query.order("rating", { ascending: false });
      } else if (sort === "nombre_asc") {
        query = query.order("name", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: true });
      }

      // Paginación (Slide 9)
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        const total = count || data.length;
        return successResponse(data, 200, {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        });
      }
    } catch (dbErr) {
      console.warn("API v1 perfumes: usando catálogo local por fallback:", dbErr.message);
    }

    // 3. Fallback de datos locales en memoria si Supabase no está disponible
    let filtered = [...FALLBACK_PERFUMES];

    if (categoria && categoria !== "Todos") {
      filtered = filtered.filter(
        (p) =>
          p.family?.toLowerCase().includes(categoria.toLowerCase()) ||
          p.brand?.toLowerCase().includes(categoria.toLowerCase())
      );
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.brand?.toLowerCase().includes(s) ||
          p.family?.toLowerCase().includes(s)
      );
    }

    if (sort === "precio_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "precio_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "rating_desc") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === "nombre_asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return successResponse(paginated, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return handleApiError(error, "Error al obtener la lista de perfumes");
  }
}

/**
 * POST /api/v1/perfumes
 *
 * Principios REST (Clase 10 - Slides 5, 8, 9, 12, 13):
 * - Verbo POST: creación de nuevo registro (no idempotente)
 * - Extracción y parseo de Request Body (JSON)
 * - Validación obligatoria del esquema con Zod (createPerfumeSchema)
 * - Retorna HTTP 201 Created ante éxito o HTTP 400 Bad Request si fallan los datos
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return errorResponse("El cuerpo de la petición (JSON) es obligatorio", 400);
    }

    // 1. Validación estricta con Zod (Slide 12 y 13)
    const validation = createPerfumeSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        "Datos de entrada inválidos para crear el perfume",
        400,
        validation.error.issues
      );
    }

    const validatedData = validation.data;

    // 2. Sanitización preventiva de campos de texto
    const sanitizedRecord = {
      ...validatedData,
      name: sanitizeString(validatedData.name),
      brand: sanitizeString(validatedData.brand),
      family: sanitizeString(validatedData.family),
      description: sanitizeString(validatedData.description)
    };

    // 3. Inserción en Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("perfumes")
      .insert(sanitizedRecord)
      .select()
      .single();

    if (error) {
      console.error("Error Supabase al insertar perfume:", error.message);
      return errorResponse("Error de base de datos al guardar el perfume", 500);
    }

    // HTTP 201 Created (Slide 5 y 16)
    return successResponse(data, 201);
  } catch (error) {
    return handleApiError(error, "Error interno al crear el perfume");
  }
}
