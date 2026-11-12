import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: "AURA | Haute Parfumerie & Fragancias Exclusivas",
  description:
    "Tienda online de perfumes de autor y diseñador. Catálogo interactivo con pagos seguros.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-stone-900 font-sans selection:bg-[#C5A880] selection:text-white">
        <CartProvider>
          <div className="flex-1 flex flex-col">{children}</div>
          <CartDrawer />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
