import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/actualizar-password";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      // Redirigir a la pantalla destino con la sesión ya establecida
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Error al intercambiar código en /auth/callback:", error?.message);
    }
  }

  // Si el código ya expiró o es inválido, volver al login
  return NextResponse.redirect(`${origin}/login?error=enlace-expirado`);
}

