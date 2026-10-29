"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowLeft, LogIn, UserPlus, AlertCircle, CheckCircle, Mail, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  // mode puede ser: "login" | "register" | "forgot"
  const [mode, setMode] = useState("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
        // Recuperación / cambio de contraseña por correo
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/actualizar-password`
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
      setErrorMsg(
        err.message.includes("Invalid login")
          ? "Correo o contraseña incorrectos."
          : err.message.includes("User already registered")
          ? "Este correo ya está registrado. Probá iniciar sesión."
          : err.message.includes("rate limit")
          ? "Demasiados intentos. Por favor esperá unos minutos e intentá nuevamente."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Volver a la tienda */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-full bg-amber-600/20 border border-amber-600/30 text-amber-500 mb-2">
            {mode === "forgot" ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white">
            AURA
          </h2>
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            {mode === "register"
              ? "Crear una nueva cuenta"
              : mode === "forgot"
              ? "Recuperar Contraseña"
              : "Iniciar Sesión en tu cuenta"}
          </p>
        </div>

        <div className="mt-8 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Mensajes de error o éxito */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
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
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej: Santiago López"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            )}

            {/* Campo Correo Electrónico */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            {/* Campo Contraseña (solo para login o registro) */}
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-300">
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
                      className="text-[11px] text-amber-500 hover:text-amber-400 transition-colors font-medium cursor-pointer"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            )}

            {/* Botón Principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-700 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="pt-2 border-t border-neutral-800 text-center space-y-2">
            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-xs text-neutral-400 hover:text-amber-400 transition-colors font-medium cursor-pointer"
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
                className="text-xs text-neutral-400 hover:text-amber-400 transition-colors font-medium cursor-pointer"
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
