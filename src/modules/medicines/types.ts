export interface Medicine {
  kodeBrng: string;
  namaBrng: string;
  kodeSat: string;
  namaSatuan: string;
  kategori: string;
  namaKategori: string;
  hBeli: number;
  ralan: number;
  status: "0" | "1";
  stok: number;
  marginPercent: number;
}

export interface CreateMedicineDTO {
  kodeBrng: string;
  namaBrng: string;
  kodeSat: string;
  kategori: string;
  hBeli: number;
  ralan: number;
  stokAwal?: number;
  status?: "0" | "1";
}

export interface UpdateMedicineDTO {
  namaBrng: string;
  kodeSat: string;
  kategori: string;
  hBeli: number;
  ralan: number;
  status: "0" | "1";
}

export type StockAdjustmentType = "TAMBAH" | "KURANG" | "OPNAME";

export interface AdjustStockDTO {
  kodeBrng: string;
  jenis: StockAdjustmentType;
  jumlah: number;
  keterangan: string;
}

export interface StockAdjustment {
  id: number;
  kodeBrng: string;
  namaBrng?: string;
  kdBangsal: string;
  stokSebelum: number;
  selisih: number;
  stokSesudah: number;
  jenis: StockAdjustmentType;
  keterangan: string;
  userId?: string | null;
  createdAt: string;
}

export interface CategoryOption {
  kode: string;
  nama: string;
}

export interface SatuanOption {
  kodeSat: string;
  satuan: string;
}

export interface StockSummary {
  totalMedicines: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalAssetValue: number;
}

