"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/format";
import { ShoppingBag, Star, Check } from "lucide-react";

export default function ProductCard({ perfume }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (perfume.stock !== undefined && perfume.stock <= 0) return;
    addToCart(perfume, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const genderBadgeColor = {
    Hombre: "bg-[#F3EFEA] text-stone-700 border-[#DFD6CA]",
    Mujer: "bg-[#FAF2ED] text-[#8C5E48] border-[#EADACF]",
    Unisex: "bg-[#F5F2EB] text-[#8C6D40] border-[#DFD5C6]"
  }[perfume.gender] || "bg-[#F5F2EB] text-stone-700 border-[#DFD5C6]";

  const isOutOfStock = perfume.stock !== undefined && perfume.stock <= 0;

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl border border-[#EAE5DC] overflow-hidden shadow-xs hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 hover:-translate-y-1.5">
      {/* Imagen del perfume */}
      <div className="relative aspect-4/5 overflow-hidden bg-[#FAF8F5]">
        <img
          src={perfume.image}
          alt={perfume.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Badges superiores */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          <span className={`text-[10px] font-medium tracking-[0.15em] uppercase px-3 py-1 rounded-full border ${genderBadgeColor} backdrop-blur-xs`}>
            {perfume.gender}
          </span>
          {perfume.featured && (
            <span className="text-[10px] font-medium tracking-[0.18em] uppercase px-3 py-1 rounded-full bg-stone-900 text-[#E5D2BA] shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        {/* Volumen */}
        <div className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-xs text-[10px] tracking-wider font-medium px-2.5 py-1 rounded-full text-stone-600 border border-[#E8E2D8] shadow-2xs font-mono">
          {perfume.volume}
        </div>
      </div>

      {/* Detalles del producto */}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#A88B60]">
            {perfume.brand}
          </span>
          <div className="flex items-center gap-1 text-[#A88B60] font-medium text-xs">
            <Star className="w-3.5 h-3.5 fill-[#C5A880] text-[#C5A880]" />
            <span>{perfume.rating ? Number(perfume.rating).toFixed(1) : "5.0"}</span>
          </div>
        </div>

        <h3 className="font-serif text-xl font-normal text-stone-900 line-clamp-1 group-hover:text-[#A88B60] transition-colors leading-snug">
          {perfume.name}
        </h3>

        <p className="text-xs text-stone-400 mt-0.5 mb-2 line-clamp-1 italic font-serif">
          {perfume.family}
        </p>

        <p className="text-xs text-stone-500 line-clamp-2 mb-5 leading-relaxed font-light">
          {perfume.description}
        </p>

        {/* Precios y botón de compra */}
        <div className="mt-auto pt-4 border-t border-[#F2ECE4] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-medium">
                Precio
              </span>
              {perfume.stock !== undefined && (
                <span
                  className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                    isOutOfStock
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : perfume.stock <= 5
                      ? "bg-[#FFF9F2] text-[#8C6D40] border border-[#F0DFCD]"
                      : "bg-[#F3FAF5] text-emerald-800 border border-emerald-200/60"
                  }`}
                >
                  {isOutOfStock ? "Agotado" : `Stock: ${perfume.stock}`}
                </span>
              )}
            </div>
            <span className="text-xl font-bold text-stone-900 font-sans tracking-tight">
              {formatPrice(perfume.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full font-medium text-xs tracking-wider uppercase transition-all duration-300 active:scale-95 shadow-xs cursor-pointer ${
              isOutOfStock
                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                : added
                ? "bg-emerald-700 text-white"
                : "bg-stone-900 text-[#FAF8F5] hover:bg-[#A88B60] hover:shadow-md"
            }`}
            aria-label={`Añadir ${perfume.name} a la bolsa`}
          >
            {isOutOfStock ? (
              <span>Sin stock</span>
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Agregado</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#E5D2BA]" />
                <span>Comprar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
