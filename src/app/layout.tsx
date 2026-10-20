import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "e-clinic-coda | Sistem Informasi Klinik Terpadu",
  description:
    "Sistem Informasi Manajemen Klinik Modular Kompatibel SIMKhanza - e-clinic-coda",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="h-full bg-[#f1f3f6] text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
