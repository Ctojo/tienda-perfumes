"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/format";
import { ShoppingBag, Star, Check } from "lucide-react";

export default function ProductCard({ perfume }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(perfume, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const genderBadgeColor = {
    Hombre: "bg-blue-50 text-blue-700 border-blue-200",
    Mujer: "bg-rose-50 text-rose-700 border-rose-200",
    Unisex: "bg-amber-50 text-amber-800 border-amber-200"
  }[perfume.gender] || "bg-neutral-100 text-neutral-800 border-neutral-200";

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Imagen del perfume */}
      <div className="relative aspect-4/5 overflow-hidden bg-neutral-100">
        <img
          src={perfume.image}
          alt={perfume.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${genderBadgeColor}`}>
            {perfume.gender}
          </span>
          {perfume.featured && (
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-neutral-900 text-white shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        {/* Volumen */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[11px] font-medium px-2 py-0.5 rounded-md text-neutral-700 border border-neutral-200 shadow-2xs">
          {perfume.volume}
        </div>
      </div>

      {/* Detalles del producto */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
          <span className="font-semibold tracking-widest uppercase text-neutral-600">
            {perfume.brand}
          </span>
          <div className="flex items-center gap-1 text-amber-600 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{perfume.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-serif text-lg font-bold text-neutral-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
          {perfume.name}
        </h3>

        <p className="text-xs text-neutral-500 mt-1 mb-2 line-clamp-1">
          {perfume.family}
        </p>

        <p className="text-xs text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
          {perfume.description}
        </p>

        {/* Precios y botón de compra */}
        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
              Precio contado
            </span>
            <span className="text-lg font-extrabold text-neutral-900 font-sans">
              {formatPrice(perfume.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs tracking-wider transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
              added
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-neutral-900 text-white hover:bg-amber-600 hover:shadow-md"
            }`}
            aria-label={`Añadir ${perfume.name} a la bolsa`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Agregado</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Comprar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
