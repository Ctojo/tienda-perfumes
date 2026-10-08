"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, Shield, User, ArrowLeft, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      // Consultar el rol del usuario en la tabla perfiles
      if (data?.user) {
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
    } catch (err) {
      setErrorMsg(
        err.message.includes("Invalid login")
          ? "Email o contraseña incorrectos. Verificá los datos ingresados."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Ayudante para autocompletar credenciales en la demo
  const fillCredentials = (type) => {
    if (type === "admin") {
      setEmail("ctojo@itba.edu.ar");
      setPassword("admin123456");
    } else {
      setEmail("cliente@gmail.com");
      setPassword("cliente123");
    }
    setErrorMsg("");
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
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white">
            AURA Access
          </h2>
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Autenticación con Supabase Auth & Roles
          </p>
        </div>

        <div className="mt-8 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Botones de prueba rápida para la entrega de la facultad */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Cuentas demo para la facultad:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials("admin")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/30 transition-all font-medium text-center"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Rol Administrador</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("cliente")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 transition-all font-medium text-center"
              >
                <User className="w-3.5 h-3.5" />
                <span>Rol Cliente</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej: ctojo@itba.edu.ar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-700 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
