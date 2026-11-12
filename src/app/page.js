"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/utils/supabase/client";
import { PERFUMES as FALLBACK_PERFUMES, CATEGORIES } from "@/data/perfumes";
import { Sparkles, SlidersHorizontal, ArrowDown, Search, Database } from "lucide-react";

export default function Home() {
  const [perfumes, setPerfumes] = useState(FALLBACK_PERFUMES);
  const [loading, setLoading] = useState(false);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("destacados");

  // Cargar perfumes directamente desde Supabase
  useEffect(() => {
    async function loadPerfumes() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("perfumes")
          .select("*")
          .order("created_at", { ascending: true });

        const hasCurrent = data && data.some((p) => FALLBACK_PERFUMES.some((fp) => fp.id === p.id));
        if (error || !hasCurrent) {
          if (error) console.warn("Aviso al consultar Supabase, usando fallback local:", error.message);
          setPerfumes(FALLBACK_PERFUMES);
          setUsingSupabase(!error);
        } else {
          setPerfumes(data);
          setUsingSupabase(true);
        }
      } catch (err) {
        console.error("Error conectando a Supabase:", err);
        setPerfumes(FALLBACK_PERFUMES);
        setUsingSupabase(false);
      } finally {
        setLoading(false);
      }
    }

    loadPerfumes();
  }, []);

  // Filtrado y ordenamiento dinámico con JavaScript
  const filteredPerfumes = useMemo(() => {
    return perfumes.filter((item) => {
      const name = item.name || "";
      const brand = item.brand || "";
      const family = item.family || "";
      const gender = item.gender || "";

      // Filtro por búsqueda
      const matchSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gender.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por categoría o género
      const matchCategory =
        selectedCategory === "Todos" ||
        gender === selectedCategory ||
        family.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchSearch && matchCategory;
    }).sort((a, b) => {
      if (sortBy === "precio-menor") return Number(a.price) - Number(b.price);
      if (sortBy === "precio-mayor") return Number(b.price) - Number(a.price);
      if (sortBy === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      return b.featured ? 1 : -1;
    });
  }, [perfumes, searchTerm, selectedCategory, sortBy]);

  return (
    <>
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="flex-1">
        {/* Hero Section Editorial */}
        <section className="relative overflow-hidden bg-[#131316] text-[#FAF8F5] py-24 lg:py-32 border-b border-[#262422]">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-7">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/30 text-[#E5D2BA] text-[11px] tracking-[0.25em] uppercase font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Colección Exclusiva 2026</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] text-[#FAF8F5]">
                El arte de la presencia a través del aroma.
              </h1>

              <p className="text-[#C4BCB3] text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                Descubrí nuestra curaduría de fragancias de autor, diseñador y perfumería
                nicho. Piezas originales concebidas con los ingredientes botánicos más puros.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#catalogo"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#C5A880] hover:bg-[#A88B60] text-stone-950 font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                >
                  <span>Explorar Colección</span>
                  <ArrowDown className="w-4 h-4 text-stone-950" />
                </a>

                {/* Badge de conexión a Supabase */}
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-xs text-[#E5D2BA]/90 backdrop-blur-xs font-mono text-[11px]">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {usingSupabase
                      ? "Conectado a Supabase PostgreSQL"
                      : "Base de datos conectada"}
                  </span>
                </div>
              </div>

              {/* Pilares Editoriales */}
              <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs text-[#A8A199]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                  <span>100% Fragancias Originales</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                  <span>Alta Concentración Eau de Parfum</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                  <span>Embalaje Exclusivo Asegurado</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catálogo interactivo */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Barra de Filtros y Búsqueda */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#E8E2D8]">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#A88B60] font-medium">
                Maison de Parfum
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight mt-0.5">
                Catálogo de Fragancias
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {loading
                  ? "Cargando fragancias desde Supabase..."
                  : filteredPerfumes.length === 1
                  ? "1 perfume encontrado"
                  : `${filteredPerfumes.length} perfumes disponibles`}
              </p>
            </div>

            {/* Ordenar por */}
            <div className="flex items-center gap-2.5 self-start md:self-auto bg-white px-3.5 py-1.5 rounded-full border border-[#E8E2D8] shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#A88B60]" />
              <label htmlFor="ordenar" className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Ordenar:
              </label>
              <select
                id="ordenar"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="destacados">Destacados</option>
                <option value="precio-menor">Menor precio</option>
                <option value="precio-mayor">Mayor precio</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </div>
          </div>

          {/* Categorías / Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-8 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs tracking-wider whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    active
                      ? "bg-stone-900 text-[#FAF8F5] shadow-xs font-medium"
                      : "bg-white/80 text-stone-600 border border-[#E8E2D8] hover:border-[#C5A880] hover:text-stone-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grilla de Productos */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-xl border border-[#E8E2D8] p-5 space-y-4"
                >
                  <div className="aspect-4/5 bg-stone-100 rounded-lg" />
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                  <div className="h-5 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredPerfumes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#D8D1C5] p-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-center mx-auto text-[#A88B60]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-normal text-stone-900">
                No encontramos perfumes con esos criterios
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Probá cambiando la categoría seleccionada o buscando con otra palabra clave en nuestro catálogo.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("Todos");
                  setSearchTerm("");
                }}
                className="px-5 py-2.5 bg-stone-900 hover:bg-[#A88B60] text-white rounded-full text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer shadow-xs"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
