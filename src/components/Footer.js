import { Sparkles, Shield, Truck, RefreshCw, CreditCard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F0F12] text-stone-400 text-sm mt-auto border-t border-[#23211F]">
      {/* Ventajas / Badges de confianza Editorial */}
      <div className="border-b border-[#23211F] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 text-[#C5A880]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#FAF8F5] font-serif text-base tracking-wide font-normal">100% Originales</h4>
              <p className="text-xs text-[#9E978F] mt-1.5 leading-relaxed font-light">
                Perfumes importados directos con batch code verificado y sello de autenticidad.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 text-[#C5A880]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#FAF8F5] font-serif text-base tracking-wide font-normal">Envíos a Todo el País</h4>
              <p className="text-xs text-[#9E978F] mt-1.5 leading-relaxed font-light">
                Envío de cortesía asegurado en compras mayores a $200.000 con tracking en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 text-[#C5A880]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#FAF8F5] font-serif text-base tracking-wide font-normal">Pasarela Segura</h4>
              <p className="text-xs text-[#9E978F] mt-1.5 leading-relaxed font-light">
                Transacciones protegidas con Mercado Pago, tarjetas de crédito, débito y transferencias.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 text-[#C5A880]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#FAF8F5] font-serif text-base tracking-wide font-normal">Embalaje de Alta Gama</h4>
              <p className="text-xs text-[#9E978F] mt-1.5 leading-relaxed font-light">
                Empaque reforzado térmico y anti-impacto para preservar la fragancia intacta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-full bg-[#C5A880] text-stone-950">
              <Sparkles className="w-4 h-4 text-stone-950" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif tracking-[0.3em] text-xl font-bold text-[#FAF8F5]">
                AURA
              </span>
              <span className="text-[9px] tracking-[0.35em] text-[#A88B60] uppercase -mt-0.5">
                Haute Parfumerie
              </span>
            </div>
          </div>
          <p className="text-xs text-[#9E978F] leading-relaxed max-w-sm font-light">
            Curaduría distinguida de perfumería nicho y de diseñador. Las firmas olfativas más
            aclamadas del mundo al alcance de tu mano.
          </p>
          <div className="inline-block bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[10px] text-[#E5D2BA] font-mono tracking-wider">
            Proyecto Universitario • Programación Web 2.0
          </div>
        </div>

        <div>
          <h4 className="text-[#FAF8F5] font-serif text-sm tracking-[0.18em] uppercase mb-4 font-normal">
            Familias Olfativas
          </h4>
          <ul className="space-y-2.5 text-xs text-[#9E978F] font-light">
            <li className="hover:text-[#E5D2BA] transition-colors cursor-pointer">• Amaderados & Especiados de Autor</li>
            <li className="hover:text-[#E5D2BA] transition-colors cursor-pointer">• Cítricos & Acuáticos Mediterráneos</li>
            <li className="hover:text-[#E5D2BA] transition-colors cursor-pointer">• Florales Blancos & Rosas Nobles</li>
            <li className="hover:text-[#E5D2BA] transition-colors cursor-pointer">• Gourmand & Vainillas de Madagascar</li>
            <li className="hover:text-[#E5D2BA] transition-colors cursor-pointer">• Orientales Cálidos & Ámbar Resinoso</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#FAF8F5] font-serif text-sm tracking-[0.18em] uppercase mb-4 font-normal">
            Medios de Pago Integrados
          </h4>
          <p className="text-xs text-[#9E978F] mb-4 leading-relaxed font-light">
            Integrado con API oficial de cobro en servidor con Next.js Route Handlers y pasarelas digitales.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FAF8F5] text-[11px] font-medium">
              Mercado Pago
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FAF8F5] text-[11px] font-medium">
              Visa / Mastercard
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FAF8F5] text-[11px] font-medium">
              Transferencia Bancaria
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1C1B19] py-6 text-center text-[11px] text-[#78716C] tracking-wide">
        © {new Date().getFullYear()} AURA Haute Parfumerie. Desarrollado con Next.js, React, Tailwind CSS y Supabase.
      </div>
    </footer>
  );
}
