"use client";

// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  RoleWithPermissions,
  CreateRoleDTO,
  UpdateRoleDTO,
  AVAILABLE_PERMISSIONS,
} from "@/modules/roles/types";
import {
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from "@/modules/roles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
interface RoleManagementProps {
  initialRoles: RoleWithPermissions[];
}

// ==========================================
// 3. MAIN COMPONENT (RoleManagement)
// ==========================================
export function RoleManagement({ initialRoles }: RoleManagementProps) {
  // ----------------------------------------
  // 3.1 State & Hooks
  // ----------------------------------------
  const [roles, setRoles] = useState<RoleWithPermissions[]>(initialRoles);
  const [isPending, startTransition] = useTransition();

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal Create State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRoleDTO>({
    name: "",
    label: "",
    description: "",
    permissions: ["access:dashboard"],
  });

  // Modal Edit State
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [editForm, setEditForm] = useState<UpdateRoleDTO>({
    label: "",
    description: "",
    permissions: [],
  });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const navPermissions = AVAILABLE_PERMISSIONS.filter(
    (p) => p.category === "Navigasi Menu"
  );
  const actionPermissions = AVAILABLE_PERMISSIONS.filter(
    (p) => p.category === "Tindakan & Aksi"
  );

  // Handle Create
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.label) {
      showNotification("error", "Harap lengkapi kode dan nama peran.");
      return;
    }

    startTransition(async () => {
      const res = await createRoleAction(createForm);
      if (res.success && res.data) {
        setRoles((prev) => [...prev, res.data!]);
        setIsCreateOpen(false);
        setCreateForm({
          name: "",
          label: "",
          description: "",
          permissions: ["access:dashboard"],
        });
        showNotification("success", `Peran "${res.data.label}" berhasil ditambahkan.`);
      } else {
        showNotification("error", res.error || "Gagal membuat peran baru.");
      }
    });
  };

  // Open Edit
  const openEditModal = (role: RoleWithPermissions) => {
    setEditingRole(role);
    setEditForm({
      label: role.label,
      description: role.description,
      permissions: [...role.permissions],
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    startTransition(async () => {
      const res = await updateRoleAction(editingRole.id, editForm);
      if (res.success && res.data) {
        setRoles((prev) =>
          prev.map((r) => (r.id === editingRole.id ? res.data! : r))
        );
        setEditingRole(null);
        showNotification(
          "success",
          `Hak akses peran "${res.data.label}" berhasil diperbarui.`
        );
      } else {
        showNotification("error", res.error || "Gagal memperbarui peran.");
      }
    });
  };

  // Handle Delete
  const handleDeleteRole = (role: RoleWithPermissions) => {
    if (role.isSystem) {
      showNotification("error", "Peran bawaan sistem tidak dapat dihapus.");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus peran "${role.label}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteRoleAction(role.id);
      if (res.success) {
        setRoles((prev) => prev.filter((r) => r.id !== role.id));
        showNotification("success", `Peran "${role.label}" berhasil dihapus.`);
      } else {
        showNotification("error", res.error || "Gagal menghapus peran.");
      }
    });
  };

  // Toggle permission helpers
  const togglePermissionInCreate = (key: string) => {
    setCreateForm((prev) => {
      const exists = prev.permissions.includes(key);
      const next = exists
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: next };
    });
  };

  const togglePermissionInEdit = (key: string) => {
    setEditForm((prev) => {
      const exists = prev.permissions.includes(key);
      const next = exists
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: next };
    });
  };

  // ----------------------------------------
  // 3.4 Render UI
  // ----------------------------------------
  return (
    <div className="space-y-6">
      {/* 3.4.1 Top Bar & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Link
            href="/users"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Daftar Pengguna
          </Link>
          <Link
            href="/roles"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-xs transition-colors"
          >
            Peran & Hak Akses ({roles.length})
          </Link>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs rounded-xl h-10 px-4 text-xs"
        >
          + Tambah Peran Baru
        </Button>
      </div>

      {/* 3.4.2 Banner Notifications */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span className="font-medium text-xs sm:text-sm">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-semibold ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 3.4.3 Roles Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-5">Peran</th>
                <th className="py-3.5 px-5">Deskripsi</th>
                <th className="py-3.5 px-5">Pengguna</th>
                <th className="py-3.5 px-5">Hak Akses Terpilih</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">
                          {role.label}
                        </span>
                        {role.isSystem && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            Sistem
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {role.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-5 text-xs text-slate-500 max-w-xs">
                    {role.description || "-"}
                  </td>

                  <td className="py-4 px-5 text-xs text-slate-700 font-medium">
                    {role.userCount} akun
                  </td>

                  <td className="py-4 px-5">
                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-medium">
                      {role.permissions.length} wewenang
                    </Badge>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end space-x-2 text-xs">
                      <button
                        type="button"
                        onClick={() => openEditModal(role)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
                      >
                        Ubah Wewenang
                      </button>

                      {!role.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role)}
                          disabled={role.userCount > 0}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shadow-2xs ${
                            role.userCount > 0
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60 font-medium shadow-none"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          }`}
                          title={
                            role.userCount > 0
                              ? "Peran masih digunakan oleh pengguna"
                              : "Hapus peran"
                          }
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG: Tambah Peran Baru */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Tambah Peran Baru
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Tentukan kode, nama kelompok peran, dan pilih izin akses modul.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Nama Peran <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="mis. Perawat Rawat Jalan"
                    value={createForm.label}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, label: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Kode Teknis <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="mis. perawat"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        name: e.target.value.toLowerCase().trim(),
                      })
                    }
                    className="rounded-xl font-mono text-sm"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Huruf kecil tanpa spasi.
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Deskripsi Tanggung Jawab
                </label>
                <Input
                  placeholder="Deskripsi singkat wewenang peran ini di klinik"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              {/* Checklist Hak Akses Modul Navigasi */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Navigasi & Akses Halaman
                  </span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          permissions: Array.from(
                            new Set([
                              ...prev.permissions,
                              ...navPermissions.map((p) => p.key),
                            ])
                          ),
                        }))
                      }
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          permissions: prev.permissions.filter(
                            (k) => !navPermissions.some((np) => np.key === k)
                          ),
                        }))
                      }
                      className="text-[11px] text-slate-500 hover:underline font-medium"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {navPermissions.map((perm) => {
                    const isChecked = createForm.permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-blue-50/50 border-blue-200"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermissionInCreate(perm.key)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {perm.label}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {perm.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Checklist Hak Akses Tindakan */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Wewenang & Tindakan Khusus
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {actionPermissions.map((perm) => {
                    const isChecked = createForm.permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-blue-50/50 border-blue-200"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermissionInCreate(perm.key)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {perm.label}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {perm.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
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
                  "Simpan Peran"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Ubah Wewenang Peran */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Ubah Wewenang Peran: {editingRole?.label}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Sesuaikan nama, deskripsi, dan daftar izin modul untuk peran ini.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nama Tampilan Peran <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  value={editForm.label}
                  onChange={(e) =>
                    setEditForm({ ...editForm, label: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Deskripsi
                </label>
                <Input
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              {/* Checklist Hak Akses Modul Navigasi */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Navigasi & Akses Halaman
                  </span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          permissions: Array.from(
                            new Set([
                              ...prev.permissions,
                              ...navPermissions.map((p) => p.key),
                            ])
                          ),
                        }))
                      }
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          permissions: prev.permissions.filter(
                            (k) => !navPermissions.some((np) => np.key === k)
                          ),
                        }))
                      }
                      className="text-[11px] text-slate-500 hover:underline font-medium"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {navPermissions.map((perm) => {
                    const isChecked = editForm.permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-blue-50/50 border-blue-200"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermissionInEdit(perm.key)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {perm.label}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {perm.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Checklist Hak Akses Tindakan */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Wewenang & Tindakan Khusus
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {actionPermissions.map((perm) => {
                    const isChecked = editForm.permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-blue-50/50 border-blue-200"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermissionInEdit(perm.key)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {perm.label}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {perm.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRole(null)}
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
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

