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
  description: "Sistem Informasi Manajemen Klinik Modular Kompatibel SIMKhanza",
  mainNav: [
    {
      name: "Dashboard",
      href: "/",
      iconName: "LayoutDashboard",
    },
    {
      name: "Schedule",
      href: "/schedule",
      iconName: "Calendar",
      disabled: false,
    },
    {
      name: "Appointments",
      href: "/appointments",
      iconName: "Clock",
      disabled: false,
    },
    {
      name: "Patients",
      href: "/patients",
      iconName: "Users",
      disabled: false,
    },
    {
      name: "Doctors",
      href: "/doctors",
      iconName: "Stethoscope",
      disabled: false,
    },
    {
      name: "Messages",
      href: "/messages",
      iconName: "MessageSquare",
      disabled: true,
    },
    {
      name: "Payments",
      href: "/payments",
      iconName: "CreditCard",
      disabled: true,
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

