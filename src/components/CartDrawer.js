"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/format";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingThreshold,
    shippingCost,
    total,
    isHydrated
  } = useCart();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Carrito de compras"
          className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col z-10 border-l border-[#EAE5DC]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#EAE5DC] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#A88B60]" />
              <h2 className="font-serif text-xl font-normal text-stone-900">
                Tu Bolsa de Compras
              </h2>
              {isHydrated && cart.length > 0 && (
                <span className="text-[10px] font-semibold bg-[#F5F2EB] text-[#8C6D40] border border-[#DFD5C6] px-2 py-0.5 rounded-full font-mono">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-800 cursor-pointer"
              aria-label="Cerrar bolsa de compras"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progreso de envío gratis */}
          {cart.length > 0 && (
            <div className="bg-[#FAF6F0] border-b border-[#EFE8DC] p-4">
              <div className="flex justify-between text-xs font-medium text-stone-700 mb-1.5 font-sans">
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Agregá <strong className="text-[#A88B60]">{formatPrice(remainingForFreeShipping)}</strong> para <strong className="uppercase tracking-wider">Envío Gratis</strong>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    ✨ ¡Tenés ENVÍO GRATIS asegurado!
                  </span>
                )}
                <span className="font-mono text-[11px] text-stone-500">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#E8E2D8] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#C5A880] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Items del Carrito */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {!isHydrated || cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center text-[#A88B60]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-serif text-2xl font-normal text-stone-900">
                    Tu bolsa está vacía
                  </p>
                  <p className="text-xs text-stone-500 mt-1.5 max-w-xs leading-relaxed">
                    Descubrí nuestras fragancias exclusivas y sumá tu firma olfativa hoy mismo.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 bg-stone-900 text-[#FAF8F5] rounded-full text-xs font-medium tracking-[0.2em] uppercase hover:bg-[#A88B60] transition-colors cursor-pointer shadow-xs"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl border border-[#EAE5DC] bg-white hover:border-[#D8D1C5] transition-colors shadow-2xs"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg bg-[#FAF8F5] border border-[#EAE5DC]/60 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] tracking-[0.22em] uppercase text-[#A88B60] font-medium">
                          {item.brand}
                        </span>
                        <h4 className="font-serif text-base font-normal text-stone-900 line-clamp-1 leading-snug">
                          {item.name}
                        </h4>
                        <span className="text-xs text-stone-400 font-mono">
                          {item.volume}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-300 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5F2EB]">
                      {/* Controles de Cantidad */}
                      <div className="flex items-center border border-[#EAE5DC] rounded-full bg-[#FAF8F5] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-stone-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-stone-900 font-sans tracking-tight">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer del Carrito con Subtotal y Botón Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#EAE5DC] bg-white space-y-4">
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de envío estimado</span>
                  <span className="font-semibold text-stone-800">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-medium">GRATIS</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2.5 border-t border-[#EAE5DC]">
                  <span>Total estimado</span>
                  <span className="text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-stone-900 hover:bg-[#A88B60] text-white rounded-full font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:shadow-lg active:scale-98"
              >
                <span>Continuar compra y pagar</span>
                <ArrowRight className="w-4 h-4 text-[#E5D2BA]" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Cobro seguro y encriptado con Mercado Pago</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
