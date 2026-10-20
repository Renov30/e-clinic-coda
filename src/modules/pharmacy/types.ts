export interface MedicineItem {
  kodeBrng: string;
  namaBrng: string;
  kodeSat: string;
  satuan: string;
  kategori: string;
  hargaJual: number;
  stok: number;
}

export interface CartItem {
  kodeBrng: string;
  namaBrng: string;
  kodeSat?: string;
  satuan: string;
  hargaJual: number;
  jumlah: number;
  diskonPersen: number;
  subtotal: number;
  total: number;
  stokTersedia: number;
}

export interface CreateSaleDTO {
  nmPasien: string;
  keterangan?: string;
  jnsJual?: string;
  items: CartItem[];
  totalTagihan: number;
  uangDiterima: number;
  kembalian: number;
}

export interface SaleHistoryItem {
  notaJual: string;
  tglJual: string;
  nmPasien: string;
  keterangan: string;
  totalItem: number;
  totalBiaya: number;
  status: "Sudah Bayar" | "Belum Bayar";
}

export interface SaleReceipt {
  notaJual: string;
  tglJual: string;
  jamJual: string;
  nmPasien: string;
  keterangan: string;
  items: CartItem[];
  totalTagihan: number;
  uangDiterima: number;
  kembalian: number;
}

