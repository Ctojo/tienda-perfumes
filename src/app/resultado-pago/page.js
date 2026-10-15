"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck
} from "lucide-react";

function ResultadoPagoContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const status =
    searchParams.get("collection_status") ||
    searchParams.get("status") ||
    "pending";
  const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("collection_id") ||
    "N/A";
  const orderId =
    searchParams.get("external_reference") || "AURA-PEDIDO";
  const paymentType = searchParams.get("payment_type") || "Mercado Pago";

  const [dbUpdated, setDbUpdated] = useState(false);

  useEffect(() => {
    // Si el pago fue aprobado, vaciamos el carrito y actualizamos el pedido en Supabase
    if (status === "approved" || status === "success") {
      clearCart();

      async function syncWithSupabase() {
        try {
          const supabase = createClient();
          if (orderId && orderId !== "AURA-PEDIDO") {
            await supabase
              .from("pedidos")
              .update({
                status: "approved",
                payment_method: `Mercado Pago (${paymentType})`
              })
              .eq("order_id", orderId);
          }
          setDbUpdated(true);
        } catch (e) {
          console.error("Error al actualizar pedido en Supabase:", e);
        }
      }

      syncWithSupabase();
    }
  }, [status, orderId, paymentType]);

  const isApproved = status === "approved" || status === "success";
  const isPending = status === "pending" || status === "in_process";
  const isRejected = !isApproved && !isPending;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-lg w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md space-y-6 relative z-10">
        
        {/* ESTADO 1: APROBADO */}
        {isApproved && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400">
                Pago Acreditado en Mercado Pago
              </span>
              <h1 className="font-serif text-3xl font-bold text-white">
                ¡Gracias por tu compra!
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Tu pago fue procesado correctamente a través de Mercado Pago Checkout Pro.
              </p>
            </div>

            <div className="bg-neutral-950 rounded-2xl p-5 border border-neutral-800 space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">Nº de Orden:</span>
                <span className="font-mono font-bold text-amber-400">{orderId}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">ID de Operación MP:</span>
                <span className="font-mono text-neutral-300">{paymentId}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">Medio de Pago:</span>
                <span className="capitalize text-neutral-200">
                  Mercado Pago ({paymentType})
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-white">
                <span>Estado de Pago:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Aprobado
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
              <Truck className="w-5 h-5 flex-shrink-0" />
              <span>
                Tu perfume ya fue asignado y será preparado para su despacho dentro de las próximas 24 horas.
              </span>
            </div>
          </>
        )}

        {/* ESTADO 2: PENDIENTE */}
        {isPending && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-amber-400">
                Pago en Proceso
              </span>
              <h1 className="font-serif text-3xl font-bold text-white">
                Esperando Acreditación
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Mercado Pago está procesando tu pago. Si abonaste en efectivo o con cupón, se acreditará en cuanto se confirme.
              </p>
            </div>

            <div className="bg-neutral-950 rounded-2xl p-5 border border-neutral-800 space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">Nº de Orden:</span>
                <span className="font-mono font-bold text-amber-400">{orderId}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">ID de Pago MP:</span>
                <span className="font-mono text-neutral-300">{paymentId}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-white">
                <span>Estado:</span>
                <span className="text-amber-400">En revisión / Pendiente</span>
              </div>
            </div>
          </>
        )}

        {/* ESTADO 3: RECHAZADO / FALLIDO */}
        {isRejected && (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-rose-400">
                Operación no completada
              </span>
              <h1 className="font-serif text-3xl font-bold text-white">
                Pago Rechazado
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                No pudimos procesar el cobro a través de Mercado Pago. Podés intentar nuevamente con otro medio de pago.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>Reintentar compra</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}

        <div className="pt-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultadoPagoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
          <p className="text-sm text-neutral-400">Cargando estado del pago...</p>
        </div>
      }
    >
      <ResultadoPagoContent />
    </Suspense>
  );
}
