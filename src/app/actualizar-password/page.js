"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowLeft, KeyRound, AlertCircle, CheckCircle, Lock } from "lucide-react";

function ActualizarPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function initSession() {
      // 1. Si viene con código PKCE en la URL, intercambiarlo por sesión
      const code = searchParams?.get("code");
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (e) {
          console.warn("Aviso al intercambiar código:", e);
        }
      }

      // 2. Comprobar si hay sesión activa (por link de recuperación o login previo)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }

      setSessionChecked(true);
    }

    initSession();

    // 3. Escuchar evento de recuperación de contraseña
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" || session) {
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden. Verificalas e intentá nuevamente.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw new Error(error.message);

      setSuccessMsg("¡Contraseña actualizada con éxito! Redirigiendo...");

      // Redirigir según el rol o al login después de 2 segundos
      setTimeout(async () => {
        if (data?.user) {
          const { data: perfil } = await supabase
            .from("perfiles")
            .select("rol")
            .eq("id", data.user.id)
            .single();

          if (perfil?.rol === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        } else {
          router.push("/login");
        }
      }, 1800);
    } catch (err) {
      setErrorMsg(
        err.message.includes("same_password")
          ? "La nueva contraseña debe ser diferente a la anterior."
          : err.message || "Error al actualizar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Volver */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Login</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-full bg-amber-600/20 border border-amber-600/30 text-amber-500 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white">
            AURA
          </h2>
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Establecer Nueva Contraseña
          </p>
        </div>

        <div className="mt-8 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Mensajes */}
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

          {sessionChecked && !isAuthenticated && !successMsg && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Enlace de seguridad requerido</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Para cambiar la contraseña sin haber iniciado sesión, debés solicitar un enlace desde{" "}
                <Link href="/login" className="text-amber-400 underline font-semibold">
                  ¿Olvidaste tu contraseña?
                </Link>{" "}
                en la pantalla de login, o haber iniciado sesión previamente.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la contraseña"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-700 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Guardar Nueva Contraseña</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-800 text-center">
            <Link
              href="/login"
              className="text-xs text-neutral-400 hover:text-amber-400 transition-colors font-medium"
            >
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActualizarPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <ActualizarPasswordForm />
    </Suspense>
  );
}
