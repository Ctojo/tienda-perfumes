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
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Carrito de compras"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-800" />
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                Tu Bolsa de Compras
              </h2>
              {isHydrated && cart.length > 0 && (
                <span className="text-xs bg-neutral-200 text-neutral-800 font-semibold px-2 py-0.5 rounded-full">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-neutral-200/80 transition-colors text-neutral-500 hover:text-neutral-800 cursor-pointer"
              aria-label="Cerrar bolsa de compras"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progreso de envío gratis */}
          {cart.length > 0 && (
            <div className="bg-amber-50/60 border-b border-amber-100 p-3.5">
              <div className="flex justify-between text-xs font-medium text-amber-900 mb-1.5">
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Agregá <strong>{formatPrice(remainingForFreeShipping)}</strong> para <strong>Envío Gratis</strong>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    ✨ ¡Tenés ENVÍO GRATIS asegurado!
                  </span>
                )}
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Items del Carrito */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!isHydrated || cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-neutral-800">
                    Tu bolsa está vacía
                  </p>
                  <p className="text-sm text-neutral-500 mt-1 max-w-xs">
                    Descubrí nuestras fragancias exclusivas y sumá tu firma olfativa hoy mismo.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:border-neutral-200 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg bg-neutral-100 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-semibold">
                          {item.brand}
                        </span>
                        <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <span className="text-xs text-neutral-500">
                          {item.volume}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Controles de Cantidad */}
                      <div className="flex items-center border border-neutral-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-neutral-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-neutral-900">
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
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/70 space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-800">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de envío estimado</span>
                  <span className="font-semibold text-neutral-800">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600">GRATIS</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total estimado</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-neutral-900 hover:bg-amber-600 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
              >
                <span>Continuar compra y pagar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cobro seguro y encriptado con Mercado Pago / Stripe</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
