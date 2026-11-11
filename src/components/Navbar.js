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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF8F5]/90 border-b border-[#E8E2D8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Editorial */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="p-2 rounded-full bg-stone-900 text-[#FAF8F5] group-hover:bg-[#A88B60] transition-colors duration-300 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#E5D2BA]" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif tracking-[0.3em] text-2xl font-bold text-stone-900 group-hover:text-[#A88B60] transition-colors">
                AURA
              </span>
              <span className="text-[9px] tracking-[0.4em] text-stone-400 uppercase font-sans -mt-0.5">
                Haute Parfumerie
              </span>
            </div>
          </Link>

          {/* Search bar desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por fragancia, marca o notas..."
                value={searchTerm || ""}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-white/80 border border-[#E8E2D8] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:bg-white transition-all text-stone-900 placeholder:text-stone-400 shadow-2xs"
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] border border-[#DDCBB5] text-[#8C6D40] hover:bg-[#F3EBE0] text-xs font-semibold tracking-wider transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#A88B60]" />
                    <span>Panel Admin</span>
                  </Link>
                ) : (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E2D8] text-stone-700 text-xs font-medium">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>{userProfile.nombre || "Cliente"}</span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 text-[#FAF8F5] hover:bg-[#A88B60] text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-[#E5D2BA]" />
                <span>Ingresar</span>
              </Link>
            )}

            {/* Botón Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-stone-100/80 transition-colors text-stone-800 flex items-center gap-2 group cursor-pointer"
              aria-label="Abrir carrito de compras"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform text-stone-800 group-hover:text-[#A88B60]" />
                {isHydrated && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C5A880] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-medium uppercase tracking-[0.18em] text-stone-700 group-hover:text-stone-900">
                Bolsa
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por fragancia, marca o notas..."
              value={searchTerm || ""}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-white border border-[#E8E2D8] focus:outline-none focus:ring-1 focus:ring-[#C5A880] text-stone-900 placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
