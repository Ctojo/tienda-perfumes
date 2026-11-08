import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Genera una respuesta JSON exitosa uniforme según los principios REST (Clase 10).
 *
 * @param {any} data - Carga útil de la respuesta.
 * @param {number} status - Código de estado HTTP (200 OK, 201 Created, etc.).
 * @param {object|null} meta - Metadatos opcionales (paginación, filtros).
 * @returns {NextResponse}
 */
export function successResponse(data, status = 200, meta = null) {
  const payload = {
    success: true,
    data
  };

  if (meta) {
    payload.meta = meta;
  }

  return NextResponse.json(payload, { status });
}

/**
 * Genera una respuesta JSON de error uniforme según los principios REST (Clase 10).
 *
 * @param {string} message - Mensaje descriptivo del error.
 * @param {number} status - Código de estado HTTP (400, 401, 403, 404, 500).
 * @param {any} details - Información detallada (ej: errores de campos de Zod).
 * @returns {NextResponse}
 */
export function errorResponse(message, status = 500, details = null) {
  const payload = {
    success: false,
    error: message
  };

  if (details) {
    payload.details = details;
  }

  return NextResponse.json(payload, { status });
}

/**
 * Manejador centralizado de errores para Route Handlers (Clase 10 - Slides 14, 15 y 16).
 * Oculta stack traces y datos de infraestructura en producción pero formatea
 * con el código de estado semántico correspondiente.
 *
 * @param {Error|unknown} error - Error capturado en el bloque try/catch.
 * @param {string} defaultMessage - Mensaje genérico para el cliente.
 * @returns {NextResponse}
 */
export function handleApiError(error, defaultMessage = "Error interno del servidor") {
  // 1. Error de validación de esquema con Zod (HTTP 400 Bad Request)
  if (error instanceof ZodError) {
    const formattedIssues = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code
    }));

    return errorResponse("Datos de entrada inválidos", 400, formattedIssues);
  }

  // 2. Registro del error en consola del servidor (Winston / Logs internos)
  console.error("[API Error Handler]:", error);

  // 3. Errores con código de estado HTTP explícito
  if (error?.status && typeof error.status === "number") {
    return errorResponse(error.message || defaultMessage, error.status);
  }

  // 4. Error no previsto (HTTP 500 Internal Server Error)
  // Ocultamos stack trace en producción para evitar fugas de seguridad (Slide 14)
  const isDev = process.env.NODE_ENV === "development";
  return errorResponse(
    isDev ? error?.message || defaultMessage : defaultMessage,
    500,
    isDev ? { stack: error?.stack } : undefined
  );
}
