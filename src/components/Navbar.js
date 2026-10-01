"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Search, Sparkles } from "lucide-react";

export default function Navbar({ onSearchChange, searchTerm }) {
  const { totalItems, setIsCartOpen, isHydrated } = useCart();

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

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-800 flex items-center gap-2 group cursor-pointer"
              aria-label="Abrir carrito de compras"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6 group-hover:scale-105 transition-transform" />
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
