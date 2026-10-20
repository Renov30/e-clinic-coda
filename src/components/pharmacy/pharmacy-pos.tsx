"use client";

import React, { useState, useTransition } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  History,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MedicineItem,
  CartItem,
  SaleHistoryItem,
  SaleReceipt,
} from "@/modules/pharmacy/types";
import {
  searchMedicinesAction,
  processDrugSaleAction,
  getRecentSalesAction,
} from "@/modules/pharmacy/actions";
import { formatCurrency } from "@/lib/utils";
import { ClinicConfig } from "@/modules/clinic-config/types";

interface PharmacyPosProps {
  initialMedicines: MedicineItem[];
  initialSales: SaleHistoryItem[];
  clinicConfig: ClinicConfig;
}

export function PharmacyPos({
  initialMedicines,
  initialSales,
  clinicConfig,
}: PharmacyPosProps) {
  const [activeTab, setActiveTab] = useState<"pos" | "history">("pos");
  const [medicines, setMedicines] = useState<MedicineItem[]>(initialMedicines);
  const [salesHistory, setSalesHistory] = useState<SaleHistoryItem[]>(initialSales);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyerName, setBuyerName] = useState("Pasien Umum / Resep Luar");
  const [saleNote, setSaleNote] = useState("Penjualan Obat Luar Bebas");
  const [cashReceived, setCashReceived] = useState<number>(0);

  // Receipt Modal State
  const [currentReceipt, setCurrentReceipt] = useState<SaleReceipt | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Status feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search medicines
  const handleSearch = (keyword: string) => {
    setSearchQuery(keyword);
    startTransition(async () => {
      const results = await searchMedicinesAction(keyword);
      setMedicines(results);
    });
  };

  // Add medicine to cart
  const addToCart = (med: MedicineItem) => {
    if (med.stok <= 0) {
      setErrorMsg(`Obat ${med.namaBrng} saat ini stoknya habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.kodeBrng === med.kodeBrng);
      if (existing) {
        if (existing.jumlah + 1 > med.stok) {
          setErrorMsg(`Tidak dapat melebihi stok yang tersedia (${med.stok})`);
          return prev;
        }
        return prev.map((item) =>
          item.kodeBrng === med.kodeBrng
            ? {
                ...item,
                jumlah: item.jumlah + 1,
                subtotal: (item.jumlah + 1) * item.hargaJual,
                total: (item.jumlah + 1) * item.hargaJual,
              }
            : item
        );
      } else {
        const newItem: CartItem = {
          kodeBrng: med.kodeBrng,
          namaBrng: med.namaBrng,
          satuan: med.satuan,
          hargaJual: med.hargaJual,
          jumlah: 1,
          diskonPersen: 0,
          subtotal: med.hargaJual,
          total: med.hargaJual,
          stokTersedia: med.stok,
        };
        return [...prev, newItem];
      }
    });
    setErrorMsg(null);
  };

  // Update item quantity
  const updateQuantity = (kodeBrng: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.kodeBrng === kodeBrng) {
            const newQty = item.jumlah + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stokTersedia) {
              setErrorMsg(`Stok tidak mencukupi (Maks: ${item.stokTersedia})`);
              return item;
            }
            return {
              ...item,
              jumlah: newQty,
              subtotal: newQty * item.hargaJual,
              total: newQty * item.hargaJual,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove from cart
  const removeFromCart = (kodeBrng: string) => {
    setCart((prev) => prev.filter((item) => item.kodeBrng !== kodeBrng));
  };

  // Total Calculation
  const totalTagihan = cart.reduce((acc, item) => acc + item.total, 0);
  const kembalian = cashReceived >= totalTagihan ? cashReceived - totalTagihan : 0;

  // Checkout sale
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMsg("Keranjang obat masih kosong.");
      return;
    }
    if (cashReceived < totalTagihan) {
      setErrorMsg("Uang pembayaran kurang dari total tagihan.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await processDrugSaleAction({
        nmPasien: buyerName,
        keterangan: saleNote,
        jnsJual: "Jual Bebas",
        items: cart,
        totalTagihan,
        uangDiterima: cashReceived,
        kembalian,
      });

      if (res.success && res.data) {
        setCurrentReceipt(res.data);
        setIsReceiptOpen(true);
        setSuccessMsg(`Transaksi nota ${res.data.notaJual} berhasil diproses!`);
        // Refresh catalog medicines & history
        const [updatedMeds, updatedSales] = await Promise.all([
          searchMedicinesAction(searchQuery),
          getRecentSalesAction(),
        ]);
        setMedicines(updatedMeds);
        setSalesHistory(updatedSales);
        // Clear cart
        setCart([]);
        setCashReceived(0);
        setBuyerName("Pasien Umum / Resep Luar");
      } else {
        setErrorMsg(res.error || "Gagal memproses transaksi penjualan obat.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("pos")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "pos"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Kasir Penjualan Obat Bebas</span>
            {cart.length > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-bold">
                {cart.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Riwayat Penjualan Hari Ini</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {salesHistory.length}
            </span>
          </button>
        </div>

        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          SIMKhanza: <code className="text-blue-700 font-mono">databarang</code> &{" "}
          <code className="text-blue-700 font-mono">penjualan</code>
        </span>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: POS / Kasir Obat Luar */}
      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Katalog & Pencarian Obat (7 Kolom) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="rounded-2xl border-slate-200/80 shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Katalog & Stok Obat Apotek</CardTitle>
                    <CardDescription>Pilih obat untuk ditambahkan ke keranjang penjualan</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Cari obat / kode..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 h-10 rounded-xl"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {medicines.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      Obat tidak ditemukan.
                    </div>
                  ) : (
                    medicines.map((med) => {
                      const isOutOfStock = med.stok <= 0;
                      return (
                        <div
                          key={med.kodeBrng}
                          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-sm text-slate-800">
                                {med.namaBrng}
                              </h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {med.kodeBrng}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {med.kategori} • Satuan: {med.satuan}
                            </p>
                            <div className="flex items-center space-x-3 pt-1">
                              <span className="text-sm font-bold text-blue-600">
                                {formatCurrency(med.hargaJual)}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  isOutOfStock
                                    ? "bg-rose-100 text-rose-700"
                                    : med.stok < 20
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                Stok: {med.stok} {med.satuan}
                              </span>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => addToCart(med)}
                            className="rounded-xl flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Pilih</span>
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Kasir & Keranjang Belanja (5 Kolom) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="rounded-2xl border-slate-200/80 shadow-xs sticky top-4">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base">Keranjang & Pembayaran</CardTitle>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-rose-600 hover:underline flex items-center space-x-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Kosongkan</span>
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Form Data Pembeli */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nama Pembeli / Pasien Luar <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="cth. Ibu Siti / Pasien Umum"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Keterangan Transaksi
                    </label>
                    <Input
                      placeholder="cth. Resep dr. Spesialis Luar / Obat Bebas"
                      value={saleNote}
                      onChange={(e) => setSaleNote(e.target.value)}
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Items in Cart */}
                <div className="border-t border-b border-slate-100 py-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Daftar Obat ({cart.length} item)
                  </span>

                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Keranjang masih kosong. Klik tombol &quot;Pilih&quot; pada katalog obat.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={item.kodeBrng}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="flex-1 mr-2">
                            <p className="font-semibold text-slate-800">{item.namaBrng}</p>
                            <p className="text-slate-500">
                              {formatCurrency(item.hargaJual)} / {item.satuan}
                            </p>
                          </div>

                          {/* Counter Quantity */}
                          <div className="flex items-center space-x-1.5 mr-3">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.kodeBrng, -1)}
                              className="h-6 w-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-slate-800">
                              {item.jumlah}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.kodeBrng, 1)}
                              className="h-6 w-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <p className="font-bold text-slate-800">
                              {formatCurrency(item.total)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.kodeBrng)}
                            className="ml-2 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ringkasan & Kalkulator Pembayaran */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-600">Total Tagihan:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(totalTagihan)}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nominal Uang Diterima (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={cashReceived || ""}
                      onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="h-10 text-base font-bold text-slate-800 rounded-xl"
                    />

                    {/* Quick Cash Buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setCashReceived(totalTagihan)}
                        className="px-2 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                      >
                        Uang Pas
                      </button>
                      {[50000, 100000, 200000, 500000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashReceived(amt)}
                          className="px-2 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                        >
                          {amt / 1000}rb
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Uang Kembalian:</span>
                    <span
                      className={`text-sm font-bold ${
                        cashReceived < totalTagihan && totalTagihan > 0
                          ? "text-rose-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {cashReceived < totalTagihan && totalTagihan > 0
                        ? `Kurang ${formatCurrency(totalTagihan - cashReceived)}`
                        : formatCurrency(kembalian)}
                    </span>
                  </div>

                  <Button
                    type="button"
                    disabled={
                      cart.length === 0 ||
                      cashReceived < totalTagihan ||
                      isPending ||
                      totalTagihan === 0
                    }
                    onClick={handleCheckout}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {isPending
                        ? "Memproses Transaksi..."
                        : `Proses & Simpan (${formatCurrency(totalTagihan)})`}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Riwayat Penjualan Hari Ini */}
      {activeTab === "history" && (
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Penjualan Obat Bebas Hari Ini</CardTitle>
            <CardDescription>
              Transaksi tersimpan di tabel <code className="font-mono text-blue-600">penjualan</code> &{" "}
              <code className="font-mono text-blue-600">detailjual</code> SIMKhanza.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {salesHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Belum ada transaksi penjualan obat hari ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-y border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5">No. Nota</th>
                      <th className="py-3 px-5">Tanggal</th>
                      <th className="py-3 px-5">Nama Pembeli</th>
                      <th className="py-3 px-5">Keterangan</th>
                      <th className="py-3 px-5">Total Item</th>
                      <th className="py-3 px-5">Total Bayar</th>
                      <th className="py-3 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesHistory.map((s) => (
                      <tr key={s.notaJual} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-blue-600 text-xs">
                          {s.notaJual}
                        </td>
                        <td className="py-3.5 px-5 text-xs text-slate-600">{s.tglJual}</td>
                        <td className="py-3.5 px-5 font-semibold text-slate-800">{s.nmPasien}</td>
                        <td className="py-3.5 px-5 text-xs text-slate-500">{s.keterangan}</td>
                        <td className="py-3.5 px-5 text-xs text-slate-700">
                          {s.totalItem} jenis obat
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-800">
                          {formatCurrency(s.totalBiaya)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal Cetak Struk Kuitansi Resmi */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md font-sans">
          <DialogHeader>
            <DialogTitle className="text-center font-bold">Struk Kuitansi Penjualan Obat</DialogTitle>
          </DialogHeader>

          {currentReceipt && (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-white space-y-3 font-mono text-xs">
              {/* Header Struk (Identitas Klinik Dinamis) */}
              <div className="text-center pb-2 border-b border-slate-200 space-y-0.5">
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  {clinicConfig.namaKlinik}
                </h3>
                <p className="text-[11px] text-slate-600">{clinicConfig.alamat}</p>
                <p className="text-[11px] text-slate-500">
                  Telp: {clinicConfig.telepon} • Izin: {clinicConfig.izinOperasional || "-"}
                </p>
              </div>

              {/* Detail Transaksi */}
              <div className="space-y-1 text-slate-700 py-1">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold text-slate-900">{currentReceipt.notaJual}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>
                    {currentReceipt.tglJual} {currentReceipt.jamJual}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pembeli:</span>
                  <span>{currentReceipt.nmPasien}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>FARMASI / KASIR01</span>
                </div>
              </div>

              {/* Rincian Obat */}
              <div className="border-t border-b border-slate-200 py-2 space-y-1.5">
                {currentReceipt.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="font-semibold text-slate-800">{item.namaBrng}</p>
                    <div className="flex justify-between text-slate-500">
                      <span>
                        {item.jumlah} {item.satuan} x {formatCurrency(item.hargaJual)}
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Kembalian */}
              <div className="space-y-1 pt-1 font-bold">
                <div className="flex justify-between text-slate-800">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(currentReceipt.totalTagihan)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>BAYAR (TUNAI):</span>
                  <span>{formatCurrency(currentReceipt.uangDiterima)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>KEMBALIAN:</span>
                  <span>{formatCurrency(currentReceipt.kembalian)}</span>
                </div>
              </div>

              {/* Footer Kuitansi Dinamis */}
              <div className="pt-2 text-center text-[10px] text-slate-500 italic border-t border-slate-200">
                <p>{clinicConfig.catatanKuitansi || "Semoga lekas sembuh. Terima kasih."}</p>
                <p className="mt-0.5">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
              className="flex items-center space-x-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Struk Thermal</span>
            </Button>
            <Button
              type="button"
              onClick={() => setIsReceiptOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
