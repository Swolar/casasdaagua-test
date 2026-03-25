import type { Metadata, Viewport } from "next";
import "./globals.css";
import ShellWrapper from "@/components/ShellWrapper";
import { CartProvider } from "@/contexts/CartContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Casas da Água - Tudo para sua casa em um só lugar",
  description: "A maior loja de materiais de construção, acabamento, decoração e eletrodomésticos de Santa Catarina. Compre online com entrega rápida.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <CartProvider>
          <ShellWrapper>{children}</ShellWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
