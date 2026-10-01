"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { PERFUMES, CATEGORIES } from "@/data/perfumes";
import { Sparkles, SlidersHorizontal, ArrowDown, Search } from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("destacados");

  // Filtrado y ordenamiento dinámico con JavaScript
  const filteredPerfumes = useMemo(() => {
    return PERFUMES.filter((item) => {
      // Filtro por búsqueda
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.family.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gender.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por categoría o género
      const matchCategory =
        selectedCategory === "Todos" ||
        item.gender === selectedCategory ||
        item.family.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchSearch && matchCategory;
    }).sort((a, b) => {
      if (sortBy === "precio-menor") return a.price - b.price;
      if (sortBy === "precio-mayor") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.featured ? 1 : -1;
    });
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <>
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-neutral-950 text-white py-20 lg:py-28">
          {/* Fondo sutil */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs tracking-wider uppercase font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Colección Exclusiva 2026</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                El arte de la presencia a través del aroma.
              </h1>

              <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                Descubrí nuestra curaduría de fragancias de diseñador y perfumería
                nicho. Piezas originales que definen tu identidad y perduran todo el día.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <a
                  href="#catalogo"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all shadow-lg shadow-amber-600/20 active:scale-95"
                >
                  <span>Explorar Colección</span>
                  <ArrowDown className="w-4 h-4" />
                </a>

                <button
                  onClick={() => {
                    setSelectedCategory("Unisex");
                    const element = document.getElementById("catalogo");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-medium text-sm transition-all cursor-pointer"
                >
                  Perfumería Nicho Unisex
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Catálogo interactivo */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Barra de Filtros y Búsqueda */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-200">
            <div>
              <h2 className="font-serif text-3xl font-bold text-neutral-900 tracking-tight">
                Catálogo de Fragancias
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {filteredPerfumes.length === 1
                  ? "1 perfume encontrado"
                  : `${filteredPerfumes.length} perfumes disponibles`}
              </p>
            </div>

            {/* Ordenar por */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
              <label htmlFor="ordenar" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Ordenar:
              </label>
              <select
                id="ordenar"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-neutral-300 rounded-lg text-xs font-medium px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-2xs"
              >
                <option value="destacados">Destacados</option>
                <option value="precio-menor">Menor precio</option>
                <option value="precio-mayor">Mayor precio</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </div>
          </div>

          {/* Categorías / Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-6 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grilla de Productos */}
          {filteredPerfumes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-300 p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-neutral-800">
                No encontramos perfumes con esos criterios
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Probá cambiando la categoría seleccionada o buscando con otra palabra clave.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("Todos");
                  setSearchTerm("");
                }}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPerfumes.map((perfume) => (
                <ProductCard key={perfume.id} perfume={perfume} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
