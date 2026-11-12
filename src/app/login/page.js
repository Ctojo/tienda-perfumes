"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowLeft, LogIn, UserPlus, AlertCircle, CheckCircle, Mail, KeyRound } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // mode puede ser: "login" | "register" | "forgot"
  const [mode, setMode] = useState("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (searchParams?.get("error") === "enlace-expirado") {
      setErrorMsg("El enlace de recuperación ya expiró o fue utilizado. Por favor solicitá uno nuevo.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const supabase = createClient();

    try {
      if (mode === "register") {
        // Registro de nuevo usuario (siempre rol cliente por seguridad)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre: nombre || "Cliente",
              rol: "cliente"
            }
          }
        });

        if (error) throw new Error(error.message);

        setSuccessMsg("¡Cuenta creada con éxito! Ya podés iniciar sesión.");
        setMode("login");
        setPassword("");
      } else if (mode === "forgot") {
        // Recuperación / cambio de contraseña por correo (apunta al callback oficial)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/actualizar-password`
        });

        if (error) throw new Error(error.message);

        setSuccessMsg(
          "¡Enlace enviado con éxito! Revisá tu casilla de correo (incluida la carpeta de Spam) para restablecer tu contraseña."
        );
      } else {
        // Inicio de sesión normal
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw new Error(error.message);

        if (data?.user) {
          // Consultar el rol en la base de datos
          const { data: perfil } = await supabase
            .from("perfiles")
            .select("rol, nombre")
            .eq("id", data.user.id)
            .single();

          if (perfil?.rol === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      }
    } catch (err) {
      const msg = err.message || "";
      setErrorMsg(
        msg.includes("Invalid login")
          ? "Correo o contraseña incorrectos."
          : msg.includes("User already registered")
          ? "Este correo ya está registrado. Probá iniciar sesión."
          : msg.includes("rate limit")
          ? "Demasiados intentos. Por favor esperá unos minutos e intentá nuevamente."
          : msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("fetch failed")
          ? "No se pudo conectar con el servidor de autenticación (Supabase). Si el proyecto gratuito está en pausa, reactivalo con 'Restore' desde el panel de supabase.com."
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] text-[#FAF8F5] flex flex-col justify-center py-14 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Fondo decorativo editorial */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Volver a la tienda */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-400 hover:text-[#E5D2BA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#A88B60]" />
          <span>Volver a la tienda</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-white/5 border border-white/10 text-[#C5A880] mb-2 shadow-xs">
            {mode === "forgot" ? (
              <KeyRound className="w-5 h-5 text-[#C5A880]" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#C5A880]" />
            )}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-[0.25em] text-[#FAF8F5]">
            AURA
          </h2>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#9E978F] font-sans">
            {mode === "register"
              ? "Crear una nueva cuenta"
              : mode === "forgot"
              ? "Recuperar Contraseña"
              : "Iniciar Sesión en tu cuenta"}
          </p>
        </div>

        <div className="mt-8 bg-[#18181C]/95 border border-[#2A2926] rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-md space-y-6">
          {/* Mensajes de error o éxito */}
          {errorMsg && (
            <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Campo Nombre en Registro */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej: Santiago López"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#101012] border border-[#2A2926] text-sm text-[#FAF8F5] placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880]"
                />
              </div>
            )}

            {/* Campo Correo Electrónico */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#101012] border border-[#2A2926] text-sm text-[#FAF8F5] placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880]"
              />
            </div>

            {/* Campo Contraseña (solo para login o registro) */}
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-stone-300">
                    Contraseña
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-[11px] text-[#C5A880] hover:text-[#E5D2BA] transition-colors font-medium cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#101012] border border-[#2A2926] text-sm text-[#FAF8F5] placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880]"
                />
              </div>
            )}

            {/* Botón Principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#C5A880] hover:bg-[#A88B60] disabled:bg-stone-800 text-stone-950 font-medium text-xs uppercase tracking-[0.2em] rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Procesando...</span>
              ) : mode === "register" ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Cuenta</span>
                </>
              ) : mode === "forgot" ? (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Enviar Enlace de Recuperación</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Links de navegación inferior */}
          <div className="pt-3 border-t border-[#262523] text-center space-y-2">
            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-xs text-stone-400 hover:text-[#E5D2BA] transition-colors font-medium cursor-pointer"
              >
                ← Volver a Iniciar Sesión
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-xs text-stone-400 hover:text-[#E5D2BA] transition-colors font-medium cursor-pointer"
              >
                {mode === "login"
                  ? "¿No tenés cuenta? Registrate como cliente"
                  : "¿Ya tenés una cuenta? Iniciar Sesión"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F12]" />}>
      <LoginForm />
    </Suspense>
  );
}
