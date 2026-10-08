"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { ShoppingBag, Search, Sparkles, User, Shield, LogOut } from "lucide-react";

export default function Navbar({ onSearchChange, searchTerm }) {
  const { totalItems, setIsCartOpen, isHydrated } = useCart();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    // Consultar sesión actual
    async function checkUser() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data: perfil } = await supabase
          .from("perfiles")
          .select("rol, nombre, email")
          .eq("id", user.id)
          .single();

        setUserProfile(perfil || { rol: "cliente", email: user.email });
      } else {
        setUserProfile(null);
      }
    }

    checkUser();

    // Escuchar cambios de sesión (login / logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          checkUser();
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="p-2 rounded-full bg-neutral-950 text-white group-hover:bg-amber-600 transition-colors duration-300">
              <Sparkles className="w-5 h-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif tracking-[0.25em] text-2xl font-bold text-neutral-900 group-hover:text-amber-800 transition-colors">
                AURA
              </span>
              <span className="text-[10px] tracking-[0.35em] text-neutral-500 uppercase -mt-1">
                Haute Parfumerie
              </span>
            </div>
          </Link>

          {/* Search bar desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por fragancia, marca o notas..."
                value={searchTerm || ""}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-neutral-100/80 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Estado de Usuario / Auth */}
            {userProfile ? (
              <div className="flex items-center gap-2">
                {userProfile.rol === "admin" ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 hover:bg-amber-500/20 text-xs font-semibold tracking-wider transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Panel Admin</span>
                  </Link>
                ) : (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium">
                    <User className="w-3.5 h-3.5" />
                    <span>{userProfile.nombre || "Cliente"}</span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-400 hover:text-rose-600 transition-colors"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white hover:bg-amber-600 text-xs font-semibold tracking-wider transition-colors shadow-2xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </Link>
            )}

            {/* Botón Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-800 flex items-center gap-2 group cursor-pointer"
              aria-label="Abrir carrito de compras"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {isHydrated && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Bolsa
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar perfume, marca..."
              value={searchTerm || ""}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-neutral-100 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
