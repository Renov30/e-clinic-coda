export interface NavigationItem {
  name: string;
  href: string;
  iconName: string;
  badge?: string;
  disabled?: boolean;
}

export const APP_CONFIG = {
  name: "e-clinic-coda",
  version: "0.1.0",
  description: "Sistem Informasi Manajemen Klinik Terpadu",
  mainNav: [
    {
      name: "Dashboard",
      href: "/",
      iconName: "LayoutDashboard",
    },
    {
      name: "Registrasi Pasien",
      href: "/patients",
      iconName: "Users",
      disabled: false,
    },
    {
      name: "Antrean & Jadwal",
      href: "/appointments",
      iconName: "Clock",
      disabled: false,
    },
    {
      name: "Penjualan Obat Luar",
      href: "/pharmacy",
      iconName: "Pill",
      badge: "Farmasi",
      disabled: false,
    },
    {
      name: "Dokter & Poliklinik",
      href: "/doctors",
      iconName: "Stethoscope",
      disabled: false,
    },
  ] as NavigationItem[],
  bottomNav: [
    {
      name: "Settings",
      href: "/settings",
      iconName: "Settings",
    },
    {
      name: "Support",
      href: "/support",
      iconName: "HelpCircle",
    },
  ] as NavigationItem[],
};
