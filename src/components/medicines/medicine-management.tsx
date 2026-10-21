"use client";

// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Medicine,
  StockAdjustment,
  CategoryOption,
  SatuanOption,
  StockAdjustmentType,
} from "@/modules/medicines/types";
import {
  createMedicineAction,
  updateMedicineAction,
  toggleMedicineStatusAction,
  adjustStockAction,
  createUnitAction,
  getNextKodeBrngAction,
} from "@/modules/medicines/actions";

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
interface MedicineManagementProps {
  initialMedicines: Medicine[];
  categories: CategoryOption[];
  units: SatuanOption[];
  initialAdjustments: StockAdjustment[];
}

// ==========================================
// 3. CONSTANTS & HELPER FUNCTIONS
// ==========================================
function formatCurrency(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

// ==========================================
// 4. MAIN COMPONENT (MedicineManagement)
// ==========================================
export function MedicineManagement({
  initialMedicines,
  categories,
  units,
  initialAdjustments,
}: MedicineManagementProps) {
  // ----------------------------------------
  // 4.1 State & Hooks
  // ----------------------------------------
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [unitList, setUnitList] = useState<SatuanOption[]>(units);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(initialAdjustments);
  const [activeTab, setActiveTab] = useState<"catalog" | "history">("catalog");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState<"all" | "safe" | "low" | "out">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Loading transition
  const [isPending, startTransition] = useTransition();

  // Dialog State: Tambah Obat Baru
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    kodeBrng: "",
    namaBrng: "",
    kodeSat: units[0]?.kodeSat || "TAB",
    kategori: categories[0]?.kode || "KAT01",
    hBeli: "",
    ralan: "",
    stokAwal: "0",
  });

  // Dialog State: Edit Data Obat
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [editForm, setEditForm] = useState({
    namaBrng: "",
    kodeSat: "",
    kategori: "",
    hBeli: "",
    ralan: "",
    status: "1" as "0" | "1",
  });

  // Dialog State: Opname Stok
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustingMedicine, setAdjustingMedicine] = useState<Medicine | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    jenis: "TAMBAH" as StockAdjustmentType,
    jumlah: "",
    keterangan: "",
  });

  // Dialog State: Tambah Satuan Baru
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [newUnitForm, setNewUnitForm] = useState({
    kodeSat: "",
    satuan: "",
  });

  // ----------------------------------------
  // 4.2 Derived State & Calculations (Memos)
  // ----------------------------------------
  const summary = useMemo(() => {
    const active = medicines.filter((m) => m.status === "1");
    const totalMedicines = active.length;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalAssetValue = 0;

    for (const m of active) {
      totalStock += m.stok;
      totalAssetValue += m.stok * m.hBeli;
      if (m.stok <= 0) {
        outOfStockCount++;
      } else if (m.stok <= 20) {
        lowStockCount++;
      }
    }

    return {
      totalMedicines,
      totalStock,
      lowStockCount,
      outOfStockCount,
      totalAssetValue,
    };
  }, [medicines]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = med.namaBrng.toLowerCase().includes(query);
        const matchesCode = med.kodeBrng.toLowerCase().includes(query);
        if (!matchesName && !matchesCode) return false;
      }

      if (selectedCategory !== "all" && med.kategori !== selectedCategory) {
        return false;
      }

      if (selectedStatus === "active" && med.status !== "1") return false;
      if (selectedStatus === "inactive" && med.status !== "0") return false;

      if (selectedStockStatus === "out" && med.stok > 0) return false;
      if (selectedStockStatus === "low" && (med.stok <= 0 || med.stok > 20)) return false;
      if (selectedStockStatus === "safe" && med.stok <= 20) return false;

      return true;
    });
  }, [medicines, searchQuery, selectedCategory, selectedStockStatus, selectedStatus]);

  // Kalkulasi preview stok sesudah penyesuaian
  const calculatedNextStock = useMemo(() => {
    if (!adjustingMedicine) return 0;
    const current = adjustingMedicine.stok;
    const qty = Math.abs(Number(adjustForm.jumlah) || 0);

    if (adjustForm.jenis === "TAMBAH") {
      return current + qty;
    } else if (adjustForm.jenis === "KURANG") {
      return Math.max(0, current - qty);
    } else if (adjustForm.jenis === "OPNAME") {
      return Math.max(0, Number(adjustForm.jumlah) || 0);
    }
    return current;
  }, [adjustingMedicine, adjustForm.jenis, adjustForm.jumlah]);

  // ----------------------------------------
  // 4.3 Handlers & Actions
  // ----------------------------------------
  const handleOpenCreateModal = async () => {
    const nextKode = await getNextKodeBrngAction();
    setCreateForm({
      kodeBrng: nextKode,
      namaBrng: "",
      kodeSat: unitList[0]?.kodeSat || "TAB",
      kategori: categories[0]?.kode || "KAT01",
      hBeli: "",
      ralan: "",
      stokAwal: "0",
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    startTransition(async () => {
      const res = await createMedicineAction({
        kodeBrng: createForm.kodeBrng.trim().toUpperCase(),
        namaBrng: createForm.namaBrng.trim(),
        kodeSat: createForm.kodeSat,
        kategori: createForm.kategori,
        hBeli: Number(createForm.hBeli) || 0,
        ralan: Number(createForm.ralan) || 0,
        stokAwal: Number(createForm.stokAwal) || 0,
        status: "1",
      });

      if (res.success) {
        const satObj = unitList.find((u) => u.kodeSat === createForm.kodeSat);
        const katObj = categories.find((k) => k.kode === createForm.kategori);
        const hBeli = Number(createForm.hBeli) || 0;
        const ralan = Number(createForm.ralan) || 0;
        const stokAwal = Number(createForm.stokAwal) || 0;

        const newMed: Medicine = {
          kodeBrng: createForm.kodeBrng.trim().toUpperCase(),
          namaBrng: createForm.namaBrng.trim(),
          kodeSat: createForm.kodeSat,
          namaSatuan: satObj?.satuan || createForm.kodeSat,
          kategori: createForm.kategori,
          namaKategori: katObj?.nama || createForm.kategori,
          hBeli,
          ralan,
          status: "1",
          stok: stokAwal,
          marginPercent: hBeli > 0 ? Math.round(((ralan - hBeli) / hBeli) * 100) : 0,
        };

        setMedicines((prev) => [newMed, ...prev]);
        setIsCreateOpen(false);
        setNotification({
          type: "success",
          message: `Obat "${newMed.namaBrng}" (${newMed.kodeBrng}) berhasil ditambahkan ke master farmasi.`,
        });
      } else {
        setNotification({
          type: "error",
          message: res.error || "Gagal menyimpan obat baru.",
        });
      }
    });
  };

  const handleOpenEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setEditForm({
      namaBrng: med.namaBrng,
      kodeSat: med.kodeSat,
      kategori: med.kategori,
      hBeli: String(med.hBeli),
      ralan: String(med.ralan),
      status: med.status,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;
    setNotification(null);

    startTransition(async () => {
      const res = await updateMedicineAction(editingMedicine.kodeBrng, {
        namaBrng: editForm.namaBrng.trim(),
        kodeSat: editForm.kodeSat,
        kategori: editForm.kategori,
        hBeli: Number(editForm.hBeli) || 0,
        ralan: Number(editForm.ralan) || 0,
        status: editForm.status,
      });

      if (res.success) {
        const satObj = unitList.find((u) => u.kodeSat === editForm.kodeSat);
        const katObj = categories.find((k) => k.kode === editForm.kategori);
        const hBeli = Number(editForm.hBeli) || 0;
        const ralan = Number(editForm.ralan) || 0;

        setMedicines((prev) =>
          prev.map((m) =>
            m.kodeBrng === editingMedicine.kodeBrng
              ? {
                  ...m,
                  namaBrng: editForm.namaBrng.trim(),
                  kodeSat: editForm.kodeSat,
                  namaSatuan: satObj?.satuan || editForm.kodeSat,
                  kategori: editForm.kategori,
                  namaKategori: katObj?.nama || editForm.kategori,
                  hBeli,
                  ralan,
                  status: editForm.status,
                  marginPercent: hBeli > 0 ? Math.round(((ralan - hBeli) / hBeli) * 100) : 0,
                }
              : m
          )
        );
        setIsEditOpen(false);
        setNotification({
          type: "success",
          message: `Data obat "${editForm.namaBrng}" berhasil diperbarui.`,
        });
      } else {
        setNotification({
          type: "error",
          message: res.error || "Gagal memperbarui data obat.",
        });
      }
    });
  };

  const handleToggleStatus = (med: Medicine) => {
    setNotification(null);
    const nextStatus: "0" | "1" = med.status === "1" ? "0" : "1";
    const label = nextStatus === "1" ? "mengaktifkan" : "menonaktifkan";

    startTransition(async () => {
      const res = await toggleMedicineStatusAction(med.kodeBrng, nextStatus);
      if (res.success) {
        setMedicines((prev) =>
          prev.map((m) =>
            m.kodeBrng === med.kodeBrng ? { ...m, status: nextStatus } : m
          )
        );
        setNotification({
          type: "success",
          message: `Status obat "${med.namaBrng}" berhasil diubah menjadi ${
            nextStatus === "1" ? "Aktif" : "Nonaktif"
          }.`,
        });
      } else {
        setNotification({
          type: "error",
          message: res.error || `Gagal ${label} obat.`,
        });
      }
    });
  };

  const handleOpenAdjustModal = (med: Medicine) => {
    setAdjustingMedicine(med);
    setAdjustForm({
      jenis: "TAMBAH",
      jumlah: "",
      keterangan: "",
    });
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingMedicine) return;
    setNotification(null);

    const qty = Number(adjustForm.jumlah);
    if (isNaN(qty) || qty < 0) {
      setNotification({
        type: "error",
        message: "Masukkan jumlah penyesuaian stok yang valid.",
      });
      return;
    }

    startTransition(async () => {
      const res = await adjustStockAction({
        kodeBrng: adjustingMedicine.kodeBrng,
        jenis: adjustForm.jenis,
        jumlah: qty,
        keterangan: adjustForm.keterangan.trim() || `Penyesuaian stok (${adjustForm.jenis})`,
      });

      if (res.success && typeof res.newStock === "number") {
        const updatedStock = res.newStock;

        setMedicines((prev) =>
          prev.map((m) =>
            m.kodeBrng === adjustingMedicine.kodeBrng
              ? { ...m, stok: updatedStock }
              : m
          )
        );

        const newHist: StockAdjustment = {
          id: Date.now(),
          kodeBrng: adjustingMedicine.kodeBrng,
          namaBrng: adjustingMedicine.namaBrng,
          kdBangsal: "APT01",
          stokSebelum: adjustingMedicine.stok,
          selisih: updatedStock - adjustingMedicine.stok,
          stokSesudah: updatedStock,
          jenis: adjustForm.jenis,
          keterangan: adjustForm.keterangan.trim() || `Penyesuaian stok (${adjustForm.jenis})`,
          createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        };
        setAdjustments((prev) => [newHist, ...prev]);

        setIsAdjustOpen(false);
        setNotification({
          type: "success",
          message: `Stok obat "${adjustingMedicine.namaBrng}" berhasil diperbarui dari ${adjustingMedicine.stok} menjadi ${updatedStock} ${adjustingMedicine.namaSatuan}.`,
        });
      } else {
        setNotification({
          type: "error",
          message: res.error || "Gagal menyesuaikan stok obat.",
        });
      }
    });
  };

  const handleCreateUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKode = newUnitForm.kodeSat.trim().toUpperCase().slice(0, 4);
    const cleanSatuan = newUnitForm.satuan.trim();

    if (!cleanKode || !cleanSatuan) return;

    startTransition(async () => {
      const res = await createUnitAction(cleanKode, cleanSatuan);
      if (res.success) {
        setUnitList((prev) => [...prev, { kodeSat: cleanKode, satuan: cleanSatuan }]);
        if (isCreateOpen) {
          setCreateForm((prev) => ({ ...prev, kodeSat: cleanKode }));
        } else if (isEditOpen) {
          setEditForm((prev) => ({ ...prev, kodeSat: cleanKode }));
        }
        setIsUnitModalOpen(false);
        setNewUnitForm({ kodeSat: "", satuan: "" });
      } else {
        setNotification({
          type: "error",
          message: res.error || "Gagal menambah satuan baru.",
        });
      }
    });
  };

  // ----------------------------------------
  // 4.4 Render UI
  // ----------------------------------------
  return (
    <div className="space-y-6">
      {/* 4.4.1 Top Bar & Navigation Actions (No redundant title inside page) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "catalog"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Katalog & Stok Obat ({filteredMedicines.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Riwayat Opname & Mutasi ({adjustments.length})
          </button>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link href="/pharmacy">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl text-xs font-semibold bg-white text-slate-700 border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Buka Kasir Penjualan
            </Button>
          </Link>

          <Button
            onClick={handleOpenCreateModal}
            className="h-10 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            + Tambah Obat Baru
          </Button>
        </div>
      </div>

      {/* 4.4.2 Banner Notifications */}
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

      {/* 4.4.3 Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs p-4">
          <span className="text-xs font-medium text-slate-500 block">Total Jenis Obat</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalMedicines}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Katalog aktif</span>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs p-4">
          <span className="text-xs font-medium text-slate-500 block">Total Stok Fisik</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {summary.totalStock.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Depo Apotek (APT01)</span>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs p-4">
          <span className="text-xs font-medium text-slate-500 block">Stok Kritis / Menipis</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{summary.lowStockCount}</p>
          <span className="text-[11px] text-amber-700/80 mt-0.5 block">Stok &le; 20 unit</span>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs p-4">
          <span className="text-xs font-medium text-slate-500 block">Stok Habis</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{summary.outOfStockCount}</p>
          <span className="text-[11px] text-rose-700/80 mt-0.5 block">0 unit tersedia</span>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs p-4 col-span-2 md:col-span-1">
          <span className="text-xs font-medium text-slate-500 block">Nilai Aset Modal</span>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 truncate">
            {formatCurrency(summary.totalAssetValue)}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Estimasi harga modal</span>
        </Card>
      </div>

      {/* 4.4.4 Tab View 1: Katalog & Stok Obat */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Cari nama obat atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.kode} value={c.kode}>
                      {c.nama}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                  ▼
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedStockStatus}
                  onChange={(e) =>
                    setSelectedStockStatus(e.target.value as "all" | "safe" | "low" | "out")
                  }
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">Semua Stok</option>
                  <option value="safe">Stok Aman (&gt; 20)</option>
                  <option value="low">Stok Menipis (&le; 20)</option>
                  <option value="out">Stok Habis (0)</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                  ▼
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as "all" | "active" | "inactive")
                  }
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-5">Kode</th>
                    <th className="py-3.5 px-5">Nama Obat</th>
                    <th className="py-3.5 px-5">Kategori</th>
                    <th className="py-3.5 px-5">Satuan</th>
                    <th className="py-3.5 px-5 text-right">Harga Beli</th>
                    <th className="py-3.5 px-5 text-right">Harga Jual</th>
                    <th className="py-3.5 px-5 text-right">Margin</th>
                    <th className="py-3.5 px-5 text-center">Stok (APT01)</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                        Tidak ada data obat yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredMedicines.map((m) => {
                      const isOutOfStock = m.stok <= 0;
                      const isLowStock = m.stok > 0 && m.stok <= 20;

                      return (
                        <tr key={m.kodeBrng} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-5 font-mono font-bold text-blue-600 text-xs">
                            {m.kodeBrng}
                          </td>

                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-slate-900 block">
                              {m.namaBrng}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-xs text-slate-600">
                            {m.namaKategori}
                          </td>

                          <td className="py-3.5 px-5 text-xs text-slate-600">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                              {m.namaSatuan}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-right font-mono text-xs text-slate-600">
                            {formatCurrency(m.hBeli)}
                          </td>

                          <td className="py-3.5 px-5 text-right font-mono text-xs font-bold text-slate-800">
                            {formatCurrency(m.ralan)}
                          </td>

                          <td className="py-3.5 px-5 text-right text-xs">
                            <span
                              className={`font-semibold ${
                                m.marginPercent > 0 ? "text-emerald-700" : "text-slate-500"
                              }`}
                            >
                              +{m.marginPercent}%
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold font-mono border ${
                                isOutOfStock
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : isLowStock
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {m.stok}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                m.status === "1"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {m.status === "1" ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end space-x-2 text-xs">
                              <button
                                type="button"
                                onClick={() => handleOpenAdjustModal(m)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
                              >
                                Opname
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(m)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(m)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shadow-2xs ${
                                  m.status === "1"
                                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                }`}
                              >
                                {m.status === "1" ? "Nonaktifkan" : "Aktifkan"}
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
        </div>
      )}

      {/* 4.4.5 Tab View 2: Riwayat Penyesuaian Stok */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-800">
              Riwayat Mutasi & Penyesuaian Stok Apotek
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan audit stok masuk, pengurangan kerusakan/kedaluwarsa, dan hasil stok opname fisik.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-5">Waktu</th>
                  <th className="py-3 px-5">Kode</th>
                  <th className="py-3 px-5">Nama Obat</th>
                  <th className="py-3 px-5 text-center">Jenis</th>
                  <th className="py-3 px-5 text-right">Stok Awal</th>
                  <th className="py-3 px-5 text-right">Perubahan</th>
                  <th className="py-3 px-5 text-right">Stok Akhir</th>
                  <th className="py-3 px-5">Keterangan / Alasan</th>
                  <th className="py-3 px-5">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                      Belum ada catatan riwayat penyesuaian stok.
                    </td>
                  </tr>
                ) : (
                  adjustments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors text-xs">
                      <td className="py-3 px-5 text-slate-500 font-mono">{a.createdAt}</td>
                      <td className="py-3 px-5 font-mono font-semibold text-blue-600">
                        {a.kodeBrng}
                      </td>
                      <td className="py-3 px-5 font-medium text-slate-800">{a.namaBrng}</td>
                      <td className="py-3 px-5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            a.jenis === "TAMBAH"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : a.jenis === "KURANG"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {a.jenis}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right font-mono text-slate-600">
                        {a.stokSebelum}
                      </td>
                      <td
                        className={`py-3 px-5 text-right font-mono font-bold ${
                          a.selisih > 0
                            ? "text-emerald-700"
                            : a.selisih < 0
                            ? "text-rose-700"
                            : "text-slate-600"
                        }`}
                      >
                        {a.selisih > 0 ? `+${a.selisih}` : a.selisih}
                      </td>
                      <td className="py-3 px-5 text-right font-mono font-bold text-slate-900">
                        {a.stokSesudah}
                      </td>
                      <td className="py-3 px-5 text-slate-600">{a.keterangan}</td>
                      <td className="py-3 px-5 text-slate-500 font-medium">
                        {a.userId || "Sistem"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.4.6 Dialog: Tambah Obat Baru */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Tambah Obat Baru ke Master Farmasi
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Daftarkan kode obat, nama, kategori, harga, dan stok awal depo apotek.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kode Obat <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={createForm.kodeBrng}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        kodeBrng: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="cth. OBT011"
                    className="h-9 rounded-xl font-mono text-xs uppercase"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Obat <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={createForm.namaBrng}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, namaBrng: e.target.value })
                    }
                    placeholder="cth. Ibuprofen 400mg Tablet"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={createForm.kategori}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, kategori: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700"
                  >
                    {categories.map((c) => (
                      <option key={c.kode} value={c.kode}>
                        {c.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Satuan <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsUnitModalOpen(true)}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      + Tambah Satuan
                    </button>
                  </div>
                  <select
                    value={createForm.kodeSat}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, kodeSat: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700"
                  >
                    {unitList.map((u) => (
                      <option key={u.kodeSat} value={u.kodeSat}>
                        {u.satuan} ({u.kodeSat})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Harga Modal / Beli (Rp)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={createForm.hBeli}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, hBeli: e.target.value })
                    }
                    placeholder="0"
                    className="h-9 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Harga Jual / Ralan (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    type="number"
                    min="0"
                    value={createForm.ralan}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, ralan: e.target.value })
                    }
                    placeholder="0"
                    className="h-9 rounded-xl font-mono text-xs font-semibold text-blue-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Stok Awal Depo
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={createForm.stokAwal}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, stokAwal: e.target.value })
                    }
                    placeholder="0"
                    className="h-9 rounded-xl font-mono text-xs font-semibold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="h-9 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isPending ? "Menyimpan..." : "Simpan Obat"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4.4.7 Dialog: Edit Data Obat */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Ubah Data Obat ({editingMedicine?.kodeBrng})
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Perbarui nama obat, kategori, satuan, harga beli, dan harga jual.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Obat <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  value={editForm.namaBrng}
                  onChange={(e) =>
                    setEditForm({ ...editForm, namaBrng: e.target.value })
                  }
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editForm.kategori}
                    onChange={(e) =>
                      setEditForm({ ...editForm, kategori: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700"
                  >
                    {categories.map((c) => (
                      <option key={c.kode} value={c.kode}>
                        {c.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Satuan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editForm.kodeSat}
                    onChange={(e) =>
                      setEditForm({ ...editForm, kodeSat: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700"
                  >
                    {unitList.map((u) => (
                      <option key={u.kodeSat} value={u.kodeSat}>
                        {u.satuan} ({u.kodeSat})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Harga Modal / Beli (Rp)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.hBeli}
                    onChange={(e) =>
                      setEditForm({ ...editForm, hBeli: e.target.value })
                    }
                    className="h-9 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Harga Jual / Ralan (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    type="number"
                    min="0"
                    value={editForm.ralan}
                    onChange={(e) =>
                      setEditForm({ ...editForm, ralan: e.target.value })
                    }
                    className="h-9 rounded-xl font-mono text-xs font-semibold text-blue-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Status Obat
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as "0" | "1",
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-semibold"
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
                className="h-9 rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="h-9 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4.4.8 Dialog: Opname & Penyesuaian Stok */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAdjustSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Opname & Penyesuaian Stok Apotek
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Catat hasil stok opname fisik, penerimaan obat baru, atau pengurangan obat kedaluwarsa/rusak.
              </DialogDescription>
            </DialogHeader>

            {adjustingMedicine && (
              <div className="space-y-4 py-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {adjustingMedicine.namaBrng}
                    </span>
                    <span className="font-mono text-blue-600 font-bold">
                      {adjustingMedicine.kodeBrng}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-1">
                    <span>Stok Saat Ini (APT01):</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {adjustingMedicine.stok} {adjustingMedicine.namaSatuan}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Jenis Penyesuaian <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustForm({ ...adjustForm, jenis: "TAMBAH" })}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                        adjustForm.jenis === "TAMBAH"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      + Tambah Stok
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        Penerimaan baru
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdjustForm({ ...adjustForm, jenis: "KURANG" })}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                        adjustForm.jenis === "KURANG"
                          ? "bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      - Kurangi Stok
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        Rusak / Kedaluwarsa
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdjustForm({ ...adjustForm, jenis: "OPNAME" })}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                        adjustForm.jenis === "OPNAME"
                          ? "bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      = Stok Opname
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        Set stok fisik riil
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {adjustForm.jenis === "TAMBAH" && "Jumlah Stok yang Ditambahkan"}
                    {adjustForm.jenis === "KURANG" && "Jumlah Stok yang Dikurangkan"}
                    {adjustForm.jenis === "OPNAME" && "Jumlah Stok Fisik Nyata Sekarang"}
                    {" "}<span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      required
                      type="number"
                      min="0"
                      value={adjustForm.jumlah}
                      onChange={(e) =>
                        setAdjustForm({ ...adjustForm, jumlah: e.target.value })
                      }
                      placeholder="0"
                      className="h-10 rounded-xl font-mono text-sm font-bold"
                    />
                    <span className="font-semibold text-slate-600 text-xs px-2 py-1 bg-slate-100 rounded-lg">
                      {adjustingMedicine.namaSatuan}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Stok Setelah Penyesuaian:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-mono line-through">
                      {adjustingMedicine.stok}
                    </span>
                    <span className="text-blue-700 font-bold font-mono text-sm">
                      {calculatedNextStock} {adjustingMedicine.namaSatuan}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Catatan / Alasan Penyesuaian <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={adjustForm.keterangan}
                    onChange={(e) =>
                      setAdjustForm({ ...adjustForm, keterangan: e.target.value })
                    }
                    placeholder={
                      adjustForm.jenis === "TAMBAH"
                        ? "cth. Pembelian faktur PBF Kimia Farma"
                        : adjustForm.jenis === "KURANG"
                        ? "cth. Kemasan pecah / kedaluwarsa batch A1"
                        : "cth. Hasil stok opname fisik bulanan"
                    }
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdjustOpen(false)}
                className="h-9 rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="h-9 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isPending ? "Memproses..." : "Terapkan Penyesuaian"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4.4.9 Dialog: Tambah Satuan Baru */}
      <Dialog open={isUnitModalOpen} onOpenChange={setIsUnitModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleCreateUnitSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Tambah Satuan Obat Baru
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Daftarkan kode dan nama satuan baru untuk master barang farmasi.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Kode Satuan (maks. 4 huruf) <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  maxLength={4}
                  value={newUnitForm.kodeSat}
                  onChange={(e) =>
                    setNewUnitForm({
                      ...newUnitForm,
                      kodeSat: e.target.value.toUpperCase().slice(0, 4),
                    })
                  }
                  placeholder="cth. VIAL, AMP, BOX"
                  className="h-9 rounded-xl font-mono uppercase text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Satuan Lengkap <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  value={newUnitForm.satuan}
                  onChange={(e) =>
                    setNewUnitForm({ ...newUnitForm, satuan: e.target.value })
                  }
                  placeholder="cth. Ampul / Vial / Kotak"
                  className="h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUnitModalOpen(false)}
                className="h-9 rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="h-9 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isPending ? "Menyimpan..." : "Simpan Satuan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
