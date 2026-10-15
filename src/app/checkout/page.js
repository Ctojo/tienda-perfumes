"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/format";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Truck
} from "lucide-react";

export default function CheckoutPage() {
  const { cart, subtotal, shippingCost, total, clearCart, isHydrated } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "4532 •••• •••• 8892",
    cardExp: "12/28",
    cardCvc: "741"
  });

  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg("");

    try {
      const customerData = {
        name: `${formData.name} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city
      };

      // 1. Guardar la orden en Supabase
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customer: customerData,
          paymentMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo registrar la orden");
      }

      // 2. Si eligió Mercado Pago, crear la Preferencia oficial y redirigir a Checkout Pro
      if (paymentMethod === "mercadopago") {
        const mpResponse = await fetch("/api/mercadopago/crear-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart,
            customer: customerData,
            orderId: data.orderId
          })
        });

        const mpData = await mpResponse.json();

        if (mpData.init_point || mpData.sandbox_init_point) {
          // Redirección oficial al Checkout de Mercado Pago
          window.location.href = mpData.sandbox_init_point || mpData.init_point;
          return;
        } else {
          throw new Error(mpData.error || "No se pudo conectar con Mercado Pago");
        }
      }

      // Para otros métodos (transferencia / tarjeta directa)
      setOrderCompleted(data);
      clearCart();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Pantalla de confirmación de compra exitosa
  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4 py-16">
        <div className="max-w-lg w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400">
              Pago Acreditado con Éxito
            </span>
            <h1 className="font-serif text-3xl font-bold text-white">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Enviamos el comprobante fiscal y los detalles del envío a{" "}
              <strong className="text-white">{orderCompleted.customer.email}</strong>.
            </p>
          </div>

          <div className="bg-neutral-900/90 rounded-2xl p-5 border border-neutral-800 space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">Nº de Pedido:</span>
              <span className="font-mono font-bold text-amber-400">
                {orderCompleted.orderId}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">ID Transacción API:</span>
              <span className="font-mono text-neutral-300">
                {orderCompleted.transactionId}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">Método de Cobro:</span>
              <span className="capitalize text-neutral-200">
                {orderCompleted.paymentMethod} (Sandbox Aprobado)
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">Destinatario:</span>
              <span className="text-neutral-200">{orderCompleted.customer.name}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">Dirección:</span>
              <span className="text-neutral-200">
                {orderCompleted.customer.address}, {orderCompleted.customer.city}
              </span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold text-white">
              <span>Total Abonado:</span>
              <span className="text-emerald-400">
                {formatPrice(orderCompleted.summary.total)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
            <Truck className="w-5 h-5 flex-shrink-0" />
            <span>
              Tu fragancia será despachada en las próximas 24 horas con embalaje especial de alta protección.
            </span>
          </div>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>Volver a la tienda</span>
          </Link>
        </div>
      </div>
    );
  }

  // Carrito vacío
  if (isHydrated && cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-neutral-500 text-sm mb-6 max-w-sm">
          No podés avanzar al pago sin antes seleccionar al menos un perfume de nuestro catálogo.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ver perfumes disponibles</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/60 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Barra superior con volver */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la tienda</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Checkout seguro SSL 256-bit</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Formulario de Checkout (Columna Izquierda) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Sección 1: Datos de Contacto */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center">
                    1
                  </span>
                  Datos del Comprador
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Juan"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Pérez"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email (para el recibo) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="juanperez@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+54 9 11 2345-6789"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Dirección de Envío */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center">
                    2
                  </span>
                  Dirección de Entrega
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Calle, Número y Piso/Depto *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Av. Santa Fe 1234, Piso 4 B"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Ciudad / Localidad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Buenos Aires"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      placeholder="C1059"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Medio de Pago */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center">
                    3
                  </span>
                  Pasarela de Pago (Requisito de la Materia)
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {/* Opción Mercado Pago */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "mercadopago"
                        ? "border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mercadopago"
                        checked={paymentMethod === "mercadopago"}
                        onChange={() => setPaymentMethod("mercadopago")}
                        className="text-sky-600 focus:ring-sky-500"
                      />
                      <div>
                        <p className="font-semibold text-sm text-neutral-900">
                          Mercado Pago
                        </p>
                        <p className="text-xs text-neutral-500">
                          Tarjetas de débito, crédito o dinero en cuenta
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded">
                      Recomendado
                    </span>
                  </label>

                  {/* Opción Tarjeta Directa */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "credit-card"
                        ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit-card"
                        checked={paymentMethod === "credit-card"}
                        onChange={() => setPaymentMethod("credit-card")}
                        className="text-amber-600 focus:ring-amber-600"
                      />
                      <div>
                        <p className="font-semibold text-sm text-neutral-900">
                          Tarjeta de Crédito / Débito directa
                        </p>
                        <p className="text-xs text-neutral-500">
                          Visa, Mastercard, American Express
                        </p>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-neutral-400" />
                  </label>

                  {/* Opción Transferencia */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "transfer"
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={paymentMethod === "transfer"}
                        onChange={() => setPaymentMethod("transfer")}
                        className="text-emerald-600 focus:ring-emerald-600"
                      />
                      <div>
                        <p className="font-semibold text-sm text-neutral-900">
                          Transferencia Bancaria
                        </p>
                        <p className="text-xs text-neutral-500">
                          CBU / Alias bancario con confirmación inmediata
                        </p>
                      </div>
                    </div>
                    <Building className="w-5 h-5 text-neutral-400" />
                  </label>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 bg-neutral-900 hover:bg-amber-600 disabled:bg-neutral-400 text-white rounded-xl font-semibold text-sm tracking-wider uppercase transition-all duration-200 shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Conectando con la API de Pagos...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirmar y Pagar {formatPrice(total)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Resumen de la Orden (Columna Derecha) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
              <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Resumen del Pedido ({cart.reduce((a, b) => a + b.quantity, 0)} items)
              </h3>

              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-md bg-neutral-100 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-neutral-500">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-bold text-neutral-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-800">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="font-semibold text-neutral-800">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600">¡Gratis!</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                  <span>Total final</span>
                  <span className="text-amber-800">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
