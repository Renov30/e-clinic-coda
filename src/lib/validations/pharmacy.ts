import { z } from "zod";

export const saleItemSchema = z.object({
  kodeBrng: z.string().min(1, "Kode obat wajib diisi"),
  namaBrng: z.string().min(1, "Nama obat wajib diisi"),
  satuan: z.string().default("TAB"),
  hargaJual: z.number().min(0, "Harga jual minimal 0"),
  jumlah: z.number().min(1, "Jumlah minimal 1"),
  diskonPersen: z.number().min(0).max(100).default(0),
  subtotal: z.number().min(0),
  total: z.number().min(0),
  stokTersedia: z.number().min(0),
});

export const checkoutSaleSchema = z.object({
  nmPasien: z.string().min(2, "Nama pembeli / pasien minimal 2 karakter"),
  keterangan: z.string().max(100).default("Penjualan Obat Bebas"),
  jnsJual: z.string().default("Jual Bebas"),
  items: z.array(saleItemSchema).min(1, "Keranjang belanja obat tidak boleh kosong"),
  totalTagihan: z.number().min(0),
  uangDiterima: z.number().min(0, "Nominal uang diterima harus diisi"),
  kembalian: z.number().min(0, "Uang pembayaran kurang"),
});

export type CheckoutSaleFormValues = z.infer<typeof checkoutSaleSchema>;

