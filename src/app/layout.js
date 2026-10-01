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
    <html lang="es" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-amber-600 selection:text-white">
        <CartProvider>
          <div className="flex-1 flex flex-col">{children}</div>
          <CartDrawer />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
