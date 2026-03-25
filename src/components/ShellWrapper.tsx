"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import CartSidebar from "./CartSidebar";

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith("/checkout");
  const isAdmin = pathname.startsWith("/admin");

  if (isCheckout || isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F2F6F8]">{children}</main>
      <Footer />
      <CartSidebar />
    </>
  );
}
