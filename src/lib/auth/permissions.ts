export type UserRole = string;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  dokter: "Dokter Penanggung Jawab",
  pendaftaran: "Petugas Pendaftaran",
  farmasi: "Staf Farmasi",
};

export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  "/": "access:dashboard",
  "/patients": "access:patients",
  "/appointments": "access:appointments",
  "/pharmacy": "access:pharmacy",
  "/medicines": "access:medicines",
  "/doctors": "access:doctors",
  "/schedule": "access:schedule",
  "/users": "access:users",
  "/roles": "access:roles",
  "/settings": "access:settings",
  "/support": "access:support",
};

/**
 * Matriks Rute Default sebagai cadangan
 */
export const DEFAULT_ROLE_ROUTE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "/",
    "/patients",
    "/appointments",
    "/pharmacy",
    "/medicines",
    "/doctors",
    "/schedule",
    "/users",
    "/roles",
    "/settings",
    "/support",
  ],
  dokter: [
    "/",
    "/patients",
    "/appointments",
    "/doctors",
    "/schedule",
    "/support",
  ],
  pendaftaran: [
    "/",
    "/patients",
    "/appointments",
    "/doctors",
    "/schedule",
    "/support",
  ],
  farmasi: [
    "/",
    "/pharmacy",
    "/medicines",
    "/support",
  ],
};

/**
 * Memeriksa apakah role atau permissions tertentu diizinkan mengakses rute tertentu.
 */
export function isRouteAllowed(
  role: string | undefined | null,
  pathname: string,
  permissions?: string[] | null
): boolean {
  if (!role) return false;
  if (role === "admin") return true;

  // 1. Gunakan permissions dinamis jika tersedia
  if (permissions && Array.isArray(permissions)) {
    let requiredKey: string | undefined;
    if (pathname === "/") {
      requiredKey = "access:dashboard";
    } else {
      for (const [routePrefix, permKey] of Object.entries(ROUTE_PERMISSION_MAP)) {
        if (routePrefix === "/") continue;
        if (pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)) {
          requiredKey = permKey;
          break;
        }
      }
    }

    if (requiredKey) {
      return permissions.includes(requiredKey);
    }
  }

  // 2. Fallback ke matriks default jika permissions dinamis kosong
  const defaultRoutes = DEFAULT_ROLE_ROUTE_PERMISSIONS[role] || [];
  if (pathname === "/") {
    return defaultRoutes.includes("/");
  }

  return defaultRoutes.some((route) => {
    if (route === "/") return false;
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * Perizinan aksi operasional granular
 */
export function canManageUsers(role?: string | null, permissions?: string[] | null): boolean {
  if (role === "admin") return true;
  return permissions?.includes("user:manage") || permissions?.includes("access:users") || false;
}

export function canManageRoles(role?: string | null, permissions?: string[] | null): boolean {
  if (role === "admin") return true;
  return permissions?.includes("access:roles") || false;
}

export function canManageSettings(role?: string | null, permissions?: string[] | null): boolean {
  if (role === "admin") return true;
  return permissions?.includes("setting:manage") || permissions?.includes("access:settings") || false;
}

export function canRegisterPatients(role?: string | null, permissions?: string[] | null): boolean {
  if (role === "admin" || role === "pendaftaran") return true;
  return permissions?.includes("patient:create") || permissions?.includes("visit:create") || false;
}

export function canProcessPharmacySales(role?: string | null, permissions?: string[] | null): boolean {
  if (role === "admin" || role === "farmasi") return true;
  return permissions?.includes("pharmacy:sell") || permissions?.includes("access:pharmacy") || false;
}

export function canManageMedicines(role?: string | null, permissions?: string[] | null): boolean {
  if (role === "admin" || role === "farmasi") return true;
  return permissions?.includes("medicine:manage") || permissions?.includes("access:medicines") || false;
}
