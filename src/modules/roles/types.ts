export interface PermissionDefinition {
  key: string;
  label: string;
  category: "Navigasi Menu" | "Tindakan & Aksi";
  description: string;
  route?: string;
}

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  // Navigasi Menu
  {
    key: "access:dashboard",
    label: "Dashboard",
    category: "Navigasi Menu",
    description: "Melihat statistik dan ringkasan klinik",
    route: "/",
  },
  {
    key: "access:patients",
    label: "Registrasi & Data Pasien",
    category: "Navigasi Menu",
    description: "Melihat modul rekam medis dan data pasien",
    route: "/patients",
  },
  {
    key: "access:appointments",
    label: "Antrean & Janji Temu",
    category: "Navigasi Menu",
    description: "Melihat antrean poliklinik dan janji temu pasien",
    route: "/appointments",
  },
  {
    key: "access:pharmacy",
    label: "Penjualan Obat Luar",
    category: "Navigasi Menu",
    description: "Melihat modul kasir penjualan obat apotek",
    route: "/pharmacy",
  },
  {
    key: "access:medicines",
    label: "Data Obat & Stok",
    category: "Navigasi Menu",
    description: "Mengelola katalog obat, harga, dan stok depo apotek",
    route: "/medicines",
  },
  {
    key: "access:doctors",
    label: "Dokter & Poliklinik",
    category: "Navigasi Menu",
    description: "Melihat daftar dokter dan poliklinik",
    route: "/doctors",
  },
  {
    key: "access:schedule",
    label: "Jadwal Praktik Dokter",
    category: "Navigasi Menu",
    description: "Melihat jadwal jam praktik dokter",
    route: "/schedule",
  },
  {
    key: "access:users",
    label: "Manajemen Pengguna",
    category: "Navigasi Menu",
    description: "Mengelola akun pengguna sistem",
    route: "/users",
  },
  {
    key: "access:roles",
    label: "Hak Akses & Peran",
    category: "Navigasi Menu",
    description: "Mengonfigurasi peran dan wewenang pengguna",
    route: "/roles",
  },
  {
    key: "access:settings",
    label: "Pengaturan Instansi",
    category: "Navigasi Menu",
    description: "Mengubah identitas dan profil klinik",
    route: "/settings",
  },
  {
    key: "access:support",
    label: "Bantuan & Sistem",
    category: "Navigasi Menu",
    description: "Melihat panduan dan status sistem",
    route: "/support",
  },

  // Tindakan & Aksi
  {
    key: "patient:create",
    label: "Daftar Pasien Baru",
    category: "Tindakan & Aksi",
    description: "Membuat nomor rekam medis baru di sistem",
  },
  {
    key: "visit:create",
    label: "Daftar Kunjungan Poli",
    category: "Tindakan & Aksi",
    description: "Mendaftarkan pasien ke antrean rawat jalan",
  },
  {
    key: "pharmacy:sell",
    label: "Proses Transaksi Obat",
    category: "Tindakan & Aksi",
    description: "Melakukan checkout penjualan obat di kasir",
  },
  {
    key: "medicine:manage",
    label: "Kelola Stok & Data Obat",
    category: "Tindakan & Aksi",
    description: "Menambah, mengubah data obat, dan melakukan penyesuaian stok",
  },
  {
    key: "user:manage",
    label: "Kelola Akun Staf",
    category: "Tindakan & Aksi",
    description: "Menambah, mengubah, dan mereset password akun",
  },
  {
    key: "setting:manage",
    label: "Kelola Konfigurasi",
    category: "Tindakan & Aksi",
    description: "Mengubah logo, nama klinik, dan catatan kuitansi",
  },
];

export interface RoleWithPermissions {
  id: string;
  name: string;
  label: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRoleDTO {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDTO {
  label: string;
  description?: string;
  permissions: string[];
}

