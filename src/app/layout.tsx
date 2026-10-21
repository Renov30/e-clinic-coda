import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { clinicConfigService } from "@/modules/clinic-config/service";
import { getSession } from "@/lib/auth/session";

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
  const [clinicConfig, session, cookieStore] = await Promise.all([
    clinicConfigService.getClinicProfile(),
    getSession(),
    cookies(),
  ]);

  const isSidebarCollapsed =
    cookieStore.get("coda_sidebar_collapsed")?.value === "true";

  return (
    <html lang="id" className="h-full">
      <body className="h-full bg-[#f1f3f6] text-slate-900 antialiased font-sans">
        <AppShell
          appName={clinicConfig.namaSistem || "simitra"}
          clinicName={clinicConfig.namaKlinik || "Smile360"}
          currentUser={session}
          initialSidebarCollapsed={isSidebarCollapsed}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
