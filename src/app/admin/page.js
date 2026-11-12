"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { formatPrice } from "@/utils/format";
import { PERFUMES as CATALOG_PERFUMES } from "@/data/perfumes";
import {
  Shield,
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  Lock,
  KeyRound
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const [activeTab, setActiveTab] = useState("pedidos");
  const [pedidos, setPedidos] = useState([]);
  const [perfumes, setPerfumes] = useState(CATALOG_PERFUMES);
  const [updatingStock, setUpdatingStock] = useState({});

  // Cargar datos y verificar sesión de admin
  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // Validar rol en tabla perfiles
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (perfil?.rol !== "admin") {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);
      setUserProfile(perfil);

      // Traer pedidos
      const { data: pedidosData } = await supabase
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending: false });

      setPedidos(pedidosData || []);

      // Traer perfumes
      const { data: perfumesData } = await supabase
        .from("perfumes")
        .select("*")
        .order("name", { ascending: true });

      const hasCurrent = perfumesData && perfumesData.some((p) => CATALOG_PERFUMES.some((cp) => cp.id === p.id));
      if (hasCurrent) {
        setPerfumes(perfumesData);
      } else {
        const stockMap = (perfumesData || []).reduce((acc, p) => { acc[p.id] = p.stock; return acc; }, {});
        setPerfumes(CATALOG_PERFUMES.map(cp => ({ ...cp, stock: typeof stockMap[cp.id] === "number" ? stockMap[cp.id] : (cp.stock ?? 8) })));
      }
    } catch (err) {
      console.error("Error al cargar datos de admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Modificar stock en tiempo real en Supabase
  const handleUpdateStock = async (perfumeId, newStock) => {
    if (newStock < 0) return;
    setUpdatingStock((prev) => ({ ...prev, [perfumeId]: true }));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("perfumes")
        .update({ stock: newStock })
        .eq("id", perfumeId);

      if (!error) {
        setPerfumes((prev) =>
          prev.map((p) => (p.id === perfumeId ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      console.error("Error al actualizar stock:", err);
    } finally {
      setUpdatingStock((prev) => ({ ...prev, [perfumeId]: false }));
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Pantalla de acceso restringido si no es admin
  if (!loading && !authorized) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">
              Acceso Restringido
            </h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Esta sección requiere permisos de <strong>Administrador</strong>.
              Iniciá sesión con la cuenta de administrador para continuar.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Iniciar Sesión como Admin
            </Link>
            <Link
              href="/"
              className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cálculos de métricas
  const totalFacturado = pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalStock = perfumes.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const bajoStock = perfumes.filter((p) => p.stock <= 5).length;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 pb-20">
      {/* Header Admin */}
      <header className="bg-neutral-950 text-white border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-600/20 border border-amber-600/30 text-amber-500">
                <Shield className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl font-bold text-white">
                    AURA Admin Panel
                  </h1>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    ROL ADMIN
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Conectado como: <strong>{userProfile?.email}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ver Tienda</span>
              </Link>
              <Link
                href="/actualizar-password"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-800 transition-colors"
                title="Cambiar contraseña de administrador"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Cambiar Contraseña</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-medium border border-rose-500/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                Total Facturado
              </p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {formatPrice(totalFacturado)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                Pedidos Registrados
              </p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {pedidos.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                Perfumes en Catálogo
              </p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {perfumes.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                Alertas de Stock Bajo
              </p>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {bajoStock} {bajoStock === 1 ? "producto" : "productos"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Selector de pestañas */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("pedidos")}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === "pedidos"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-white text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Registro de Pedidos ({pedidos.length})
            </button>
            <button
              onClick={() => setActiveTab("inventario")}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === "inventario"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-white text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Control de Inventario ({perfumes.length})
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 text-xs font-medium cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* PESTAÑA 1: TABLA DE PEDIDOS */}
        {activeTab === "pedidos" && (
          <section className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Movimientos y Ventas de Clientes
                </h3>
                <p className="text-xs text-neutral-500">
                  Datos sincronizados en vivo desde la tabla <strong>pedidos</strong> de Supabase.
                </p>
              </div>
            </div>

            {pedidos.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-sm">
                Aún no hay compras registradas en la base de datos.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 uppercase tracking-wider text-[11px] border-b border-neutral-200">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Fecha / ID</th>
                      <th className="py-3.5 px-4 font-semibold">Cliente</th>
                      <th className="py-3.5 px-4 font-semibold">Contacto & Dirección</th>
                      <th className="py-3.5 px-4 font-semibold">Perfumes Comprados</th>
                      <th className="py-3.5 px-4 font-semibold">Total</th>
                      <th className="py-3.5 px-4 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {pedidos.map((p) => {
                      const fecha = new Date(p.created_at).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });

                      const items = Array.isArray(p.items) ? p.items : [];

                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-4 px-4 align-top">
                            <span className="font-mono font-bold text-neutral-900 block">
                              {p.order_id}
                            </span>
                            <span className="text-[11px] text-neutral-400">{fecha}</span>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <span className="font-semibold text-neutral-900 block text-sm">
                              {p.client_name}
                            </span>
                            <span className="text-neutral-500">{p.client_email}</span>
                          </td>
                          <td className="py-4 px-4 align-top text-neutral-600">
                            <p>{p.client_phone || "Sin teléfono"}</p>
                            <p className="text-[11px] text-neutral-400">{p.client_address}</p>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1">
                              {items.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-neutral-800">
                                  <span className="font-bold text-amber-700">
                                    {it.quantity}x
                                  </span>
                                  <span>{it.name}</span>
                                  <span className="text-neutral-400 text-[10px]">({it.brand})</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top font-bold text-sm text-neutral-900">
                            {formatPrice(p.total)}
                          </td>
                          <td className="py-4 px-4 align-top">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Acreditado</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* PESTAÑA 2: CONTROL DE INVENTARIO Y STOCK */}
        {activeTab === "inventario" && (
          <section className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Control de Stock e Inventario
                </h3>
                <p className="text-xs text-neutral-500">
                  Podés modificar las unidades directamente con los botones + y -. Los cambios se guardan al instante en Supabase.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 uppercase tracking-wider text-[11px] border-b border-neutral-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Producto</th>
                    <th className="py-3.5 px-4 font-semibold">Marca / Género</th>
                    <th className="py-3.5 px-4 font-semibold">Precio</th>
                    <th className="py-3.5 px-4 font-semibold">Stock Actual</th>
                    <th className="py-3.5 px-4 font-semibold">Modificar Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {perfumes.map((perfume) => {
                    const isSaving = updatingStock[perfume.id];

                    return (
                      <tr key={perfume.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={perfume.image}
                            alt={perfume.name}
                            className="w-12 h-14 object-cover rounded-lg bg-neutral-100"
                          />
                          <div>
                            <span className="font-bold text-sm text-neutral-900 block">
                              {perfume.name}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              {perfume.volume} • {perfume.family}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-neutral-800 block">
                            {perfume.brand}
                          </span>
                          <span className="text-neutral-400">{perfume.gender}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-sm text-neutral-900">
                          {formatPrice(perfume.price)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold px-2 py-1 rounded-md text-xs ${
                              perfume.stock <= 5
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {perfume.stock} unidades
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUpdateStock(perfume.id, perfume.stock - 1)}
                              disabled={isSaving || perfume.stock <= 0}
                              className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 transition-colors cursor-pointer"
                              title="Restar 1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">
                              {perfume.stock}
                            </span>
                            <button
                              onClick={() => handleUpdateStock(perfume.id, perfume.stock + 1)}
                              disabled={isSaving}
                              className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 transition-colors cursor-pointer"
                              title="Sumar 1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            {isSaving && (
                              <span className="text-[10px] text-amber-600 animate-pulse ml-1">
                                Guardando...
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
