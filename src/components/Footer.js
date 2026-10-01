import { Sparkles, Shield, Truck, RefreshCw, CreditCard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 text-sm mt-auto border-t border-neutral-800">
      {/* Ventajas / Badges de confianza */}
      <div className="border-b border-neutral-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-neutral-900 text-amber-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% Originales</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Perfumes importados directos con batch code y sello de autenticidad.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-neutral-900 text-amber-500">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Envíos a Todo el País</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Envío gratis en compras mayores a $200.000 con seguimiento online.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-neutral-900 text-amber-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Pasarela de Pagos Segura</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Aboná con Mercado Pago, tarjetas de crédito, débito o transferencia.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-neutral-900 text-amber-500">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Garantía de Satisfacción</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Embalaje reforzado anti-roturas para que tu fragancia llegue perfecta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-full bg-amber-600 text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-serif tracking-[0.25em] text-xl font-bold text-white">
              AURA
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            Curaduría de perfumería nicho y de diseñador. Las firmas olfativas más
            aclamadas del mundo al alcance de tu mano.
          </p>
          <div className="inline-block bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-[11px] text-amber-400 font-mono">
            Proyecto Universitario • Programación Web 2.0
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">
            Familias Olfativas
          </h4>
          <ul className="space-y-2 text-xs">
            <li>Amaderados & Especiados</li>
            <li>Cítricos & Acuáticos</li>
            <li>Florales de Primavera</li>
            <li>Gourmand & Vainillas</li>
            <li>Orientales Cálidos</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">
            Medios de Pago Integrados
          </h4>
          <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
            Integrado con API de cobro en servidor con Next.js Route Handlers y pasarelas digitales.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              Mercado Pago
            </span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              Visa / Mastercard
            </span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              Transferencia / Débito
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} AURA Haute Parfumerie. Desarrollado con Next.js, React, Tailwind CSS y APIs.
      </div>
    </footer>
  );
}
