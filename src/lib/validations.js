import { z } from "zod";

/**
 * Sanitiza una cadena de texto eliminando etiquetas HTML peligrosas y espacios sobrantes (Slide 12).
 *
 * @param {string} str - Texto a limpiar.
 * @returns {string} - Texto sanitizado.
 */
export function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "") // Remueve tags HTML (prevención básica XSS)
    .replace(/[<>'"&]/g, (char) => {
      // Escapa caracteres conflictivos
      const entities = {
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
        "&": "&amp;"
      };
      return entities[char] || char;
    })
    .trim();
}

/**
 * Esquema de validación para Parámetros de Consulta (Query Params) en el listado de perfumes (Slide 9 y 12).
 * Valida: ?categoria=nicho&search=sauvage&sort=precio_desc&page=1&limit=20
 */
export const perfumeQuerySchema = z.object({
  categoria: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  sort: z
    .enum(["destacados", "precio_asc", "precio_desc", "rating_desc", "nombre_asc"])
    .optional()
    .default("destacados"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20)
});

/**
 * Esquema de validación para Notas Olfativas (Salida, Corazón, Fondo).
 */
export const fragranceNotesSchema = z.object({
  salida: z.string().max(255).optional(),
  corazon: z.string().max(255).optional(),
  fondo: z.string().max(255).optional()
}).optional();

/**
 * Esquema de validación con Zod para Creación de Perfumes (POST /api/v1/perfumes) (Slide 12 y 13).
 */
export const createPerfumeSchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  brand: z
    .string({ required_error: "La marca es obligatoria" })
    .min(2, "La marca debe tener al menos 2 caracteres")
    .max(80, "La marca no puede superar los 80 caracteres"),
  gender: z
    .enum(["Hombre", "Mujer", "Unisex"], {
      invalid_type_error: "El género debe ser Hombre, Mujer o Unisex"
    })
    .optional()
    .default("Unisex"),
  family: z
    .string({ required_error: "La familia olfativa es obligatoria" })
    .min(2, "La familia debe tener al menos 2 caracteres")
    .max(80, "La familia no puede superar los 80 caracteres"),
  price: z
    .number({ required_error: "El precio es obligatorio" })
    .positive("El precio debe ser un número positivo mayor a 0"),
  volume: z.string().max(30).optional().default("100 ml"),
  rating: z.number().min(0).max(5).optional().default(5.0),
  reviewsCount: z.number().int().min(0).optional().default(0),
  image: z
    .string({ required_error: "La imagen es obligatoria" })
    .min(5, "La URL de la imagen debe ser válida"),
  description: z
    .string({ required_error: "La descripción es obligatoria" })
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede superar los 2000 caracteres"),
  notes: fragranceNotesSchema,
  stock: z.number().int().min(0, "El stock no puede ser negativo").optional().default(10),
  featured: z.boolean().optional().default(false),
  inStock: z.boolean().optional().default(true)
});

/**
 * Esquema de validación para Actualización de Perfumes (PUT / PATCH /api/v1/perfumes/:id).
 */
export const updatePerfumeSchema = createPerfumeSchema.partial();

/**
 * Esquema para validar un Ítem individual de compra en el Carrito.
 */
export const cartItemSchema = z.object({
  id: z.union([z.string(), z.number()], {
    required_error: "El ID del producto es obligatorio"
  }),
  name: z.string().min(1, "El nombre del producto es obligatorio"),
  brand: z.string().optional(),
  price: z.number().positive("El precio unitario debe ser mayor a 0"),
  quantity: z
    .number()
    .int()
    .min(1, "La cantidad mínima por producto es 1")
    .max(100, "La cantidad máxima por producto es 100"),
  image: z.string().optional()
});

/**
 * Esquema para validar los Datos del Cliente / Envío.
 */
export const customerSchema = z.object({
  name: z
    .string({ required_error: "El nombre del cliente es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  email: z
    .string({ required_error: "El correo electrónico es obligatorio" })
    .email("El formato del correo electrónico no es válido"),
  phone: z.string().max(40).optional().default(""),
  address: z
    .string({ required_error: "La dirección de entrega es obligatoria" })
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(255, "La dirección no puede superar los 255 caracteres"),
  city: z.string().max(100).optional().default("Buenos Aires"),
  postalCode: z.string().max(20).optional()
});

/**
 * Esquema de validación con Zod para Creación de Pedidos (POST /api/v1/pedidos y /api/checkout).
 */
export const createPedidoSchema = z.object({
  items: z
    .array(cartItemSchema, { required_error: "El carrito no puede estar vacío" })
    .min(1, "Debes incluir al menos un producto en el pedido"),
  customer: customerSchema,
  paymentMethod: z
    .enum(["mercadopago", "tarjeta", "transferencia", "efectivo", "credit-card", "transfer"])
    .optional()
    .default("mercadopago"),
  orderId: z.string().optional()
});
