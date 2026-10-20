"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Edit,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Loader2,
  Lock,
  Stethoscope,
  Pill,
  ClipboardList,
} from "lucide-react";
import { User, UserRole, UserStatus } from "@/modules/users/types";
import {
  createUserAction,
  updateUserAction,
  resetUserPasswordAction,
  toggleUserStatusAction,
} from "@/modules/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserManagementProps {
  initialUsers: User[];
  currentUserId?: string;
}

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; badgeVariant: "default" | "secondary" | "success" | "warning"; icon: React.ElementType }
> = {
  admin: {
    label: "Administrator",
    badgeVariant: "default",
    icon: Shield,
  },
  dokter: {
    label: "Dokter",
    badgeVariant: "secondary",
    icon: Stethoscope,
  },
  pendaftaran: {
    label: "Pendaftaran",
    badgeVariant: "warning",
    icon: ClipboardList,
  },
  farmasi: {
    label: "Farmasi",
    badgeVariant: "success",
    icon: Pill,
  },
};

export function UserManagement({
  initialUsers,
  currentUserId,
}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    namaLengkap: "",
    password: "",
    role: "pendaftaran" as UserRole,
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    namaLengkap: "",
    role: "pendaftaran" as UserRole,
    status: "aktif" as UserStatus,
  });

  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.namaLengkap.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && u.status === "aktif") ||
        (filterStatus === "inactive" && u.status === "nonaktif");
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "aktif").length;
    const doctors = users.filter((u) => u.role === "dokter").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total, active, doctors, admins };
  }, [users]);

  // Handle Create User
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.username || !createForm.namaLengkap || !createForm.password) {
      showNotification("error", "Harap lengkapi semua kolom yang wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await createUserAction(createForm);
      if (res.success && res.data) {
        setUsers((prev) => [res.data!, ...prev]);
        setIsCreateOpen(false);
        setCreateForm({
          username: "",
          namaLengkap: "",
          password: "",
          role: "pendaftaran",
        });
        showNotification("success", `Pengguna "${res.data.namaLengkap}" berhasil ditambahkan.`);
      } else {
        showNotification("error", res.error || "Gagal membuat pengguna baru.");
      }
    });
  };

  // Handle Edit User
  const openEditDialog = (u: User) => {
    setEditingUser(u);
    setEditForm({
      namaLengkap: u.namaLengkap,
      role: u.role,
      status: u.status,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    startTransition(async () => {
      const res = await updateUserAction(editingUser.id, editForm);
      if (res.success && res.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? res.data! : u))
        );
        setEditingUser(null);
        showNotification("success", `Data pengguna "${res.data.namaLengkap}" berhasil diperbarui.`);
      } else {
        showNotification("error", res.error || "Gagal memperbarui data pengguna.");
      }
    });
  };

  // Handle Toggle Status
  const handleToggleStatus = (u: User) => {
    const isCurrentlyActive = u.status === "aktif";
    const actionText = isCurrentlyActive ? "menonaktifkan" : "mengaktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} akun "${u.namaLengkap}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await toggleUserStatusAction(u.id);
      if (res.success) {
        setUsers((prev) =>
          prev.map((item) =>
            item.id === u.id
              ? { ...item, status: item.status === "aktif" ? "nonaktif" : "aktif" }
              : item
          )
        );
        showNotification(
          "success",
          `Status pengguna "${u.namaLengkap}" berhasil diubah.`
        );
      } else {
        showNotification("error", res.error || "Gagal mengubah status pengguna.");
      }
    });
  };

  // Handle Reset Password
  const openResetPassword = (u: User) => {
    setResettingUser(u);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    if (newPassword.length < 6) {
      showNotification("error", "Kata sandi minimal harus 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("error", "Konfirmasi kata sandi tidak cocok.");
      return;
    }

    startTransition(async () => {
      const res = await resetUserPasswordAction(resettingUser.id, newPassword);
      if (res.success) {
        setResettingUser(null);
        showNotification(
          "success",
          `Kata sandi untuk "${resettingUser.namaLengkap}" berhasil diatur ulang.`
        );
      } else {
        showNotification("error", res.error || "Gagal mereset kata sandi.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border text-sm transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Manajemen Pengguna & Hak Akses
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola akun staf medis, dokter, petugas registrasi, dan staf farmasi.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all rounded-xl"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Akun</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{stats.total}</div>
          <span className="text-[11px] text-slate-400">Terdaftar di sistem</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Akun Aktif</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{stats.active}</div>
          <span className="text-[11px] text-slate-400">Dapat melakukan login</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dokter Praktik</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Stethoscope className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{stats.doctors}</div>
          <span className="text-[11px] text-slate-400">Tenaga medis</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Administrator</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{stats.admins}</div>
          <span className="text-[11px] text-slate-400">Akses penuh sistem</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama atau username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Peran:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Semua Peran</option>
              <option value="admin">Administrator</option>
              <option value="dokter">Dokter</option>
              <option value="pendaftaran">Petugas Pendaftaran</option>
              <option value="farmasi">Staf Farmasi</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-5">Pengguna</th>
                <th className="py-3.5 px-5">Peran / Hak Akses</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Terdaftar Sejak</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    Tidak ada pengguna yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleMeta = ROLE_CONFIG[u.role] || {
                    label: u.role,
                    badgeVariant: "secondary",
                    icon: Users,
                  };
                  const RoleIcon = roleMeta.icon;
                  const isCurrentAccount = currentUserId === u.id;
                  const isActive = u.status === "aktif";

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9 border border-slate-200">
                            <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold text-xs">
                              {u.namaLengkap
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-slate-800">
                                {u.namaLengkap}
                              </span>
                              {isCurrentAccount && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <Badge
                          variant={roleMeta.badgeVariant}
                          className="flex items-center w-fit space-x-1.5 px-2.5 py-1"
                        >
                          <RoleIcon className="h-3.5 w-3.5" />
                          <span>{roleMeta.label}</span>
                        </Badge>
                      </td>

                      <td className="py-4 px-5">
                        {isActive ? (
                          <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mr-1.5" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-xs text-slate-500">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => openResetPassword(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Reset Kata Sandi"
                          >
                            <Key className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditDialog(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Data Pengguna"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isCurrentAccount}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrentAccount
                                ? "text-slate-200 cursor-not-allowed"
                                : isActive
                                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={
                              isCurrentAccount
                                ? "Tidak dapat menonaktifkan akun sendiri"
                                : isActive
                                ? "Nonaktifkan Akun"
                                : "Aktifkan Akun"
                            }
                          >
                            {isActive ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG: Tambah Pengguna Baru */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Tambah Pengguna Baru
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Buat kredensial login untuk petugas atau staf medis klinik.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="mis. dr. Budi Santoso, Sp.A"
                  value={createForm.namaLengkap}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, namaLengkap: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="mis. dr.budi atau staf_reg1"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      username: e.target.value.toLowerCase().trim(),
                    })
                  }
                  className="rounded-xl font-mono text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Hanya huruf kecil, angka, titik, atau garis bawah.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Kata Sandi Awal <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Hak Akses / Peran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="pendaftaran">Petugas Pendaftaran & Kasir</option>
                  <option value="dokter">Dokter / Tenaga Medis</option>
                  <option value="farmasi">Staf Farmasi / Apotek</option>
                  <option value="admin">Administrator Sistem</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Pengguna"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Edit Pengguna */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Ubah Data Pengguna
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Perbarui profil dan wewenang akun @{editingUser?.username}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  value={editForm.namaLengkap}
                  onChange={(e) =>
                    setEditForm({ ...editForm, namaLengkap: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Hak Akses / Peran
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="pendaftaran">Petugas Pendaftaran & Kasir</option>
                  <option value="dokter">Dokter / Tenaga Medis</option>
                  <option value="farmasi">Staf Farmasi / Apotek</option>
                  <option value="admin">Administrator Sistem</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.status === "aktif"}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.checked ? "aktif" : "nonaktif",
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Akun Aktif (Dapat Masuk ke Sistem)
                  </span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Perbarui Data"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Reset Kata Sandi */}
      <Dialog open={!!resettingUser} onOpenChange={() => setResettingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleResetPasswordSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Atur Ulang Kata Sandi
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Masukkan kata sandi baru untuk @{resettingUser?.username} (
                {resettingUser?.namaLengkap})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResettingUser(null)}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Reset Kata Sandi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

