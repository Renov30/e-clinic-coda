import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const metadata: Metadata = {
  title: "e-clinic-coda | Sistem Informasi Klinik Terpadu",
  description:
    "Sistem Informasi Manajemen Klinik Terpadu - e-clinic-coda",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clinicConfig = await clinicConfigService.getClinicProfile();

  return (
    <html lang="id" className="h-full">
      <body className="h-full bg-[#f1f3f6] text-slate-900 antialiased font-sans">
        <AppShell clinicName={clinicConfig.namaKlinik || "Smile360"}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
