import { medicineRepository } from "./repository";
import {
  Medicine,
  CreateMedicineDTO,
  UpdateMedicineDTO,
  AdjustStockDTO,
  StockAdjustment,
  CategoryOption,
  SatuanOption,
  StockSummary,
} from "./types";
import { logger } from "@/lib/logger";

export class MedicineService {
  async getMedicines(filter?: {
    keyword?: string;
    kategori?: string;
    stockStatus?: "all" | "safe" | "low" | "out";
    status?: "all" | "active" | "inactive";
  }): Promise<Medicine[]> {
    return await medicineRepository.getAllMedicines(filter);
  }

  async getMedicineByCode(kodeBrng: string): Promise<Medicine | null> {
    if (!kodeBrng || kodeBrng.trim().length === 0) return null;
    return await medicineRepository.getMedicineByCode(kodeBrng.trim());
  }

  async getNextKodeBrng(): Promise<string> {
    return await medicineRepository.getNextKodeBrng();
  }

  async createMedicine(
    dto: CreateMedicineDTO,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!dto.kodeBrng || dto.kodeBrng.trim().length === 0) {
      return { success: false, error: "Kode obat wajib diisi." };
    }
    if (!dto.namaBrng || dto.namaBrng.trim().length === 0) {
      return { success: false, error: "Nama obat wajib diisi." };
    }
    if (!dto.kodeSat || dto.kodeSat.trim().length === 0) {
      return { success: false, error: "Satuan obat wajib dipilih." };
    }
    if (!dto.kategori || dto.kategori.trim().length === 0) {
      return { success: false, error: "Kategori obat wajib dipilih." };
    }
    if (Number(dto.hBeli) < 0 || Number(dto.ralan) < 0) {
      return { success: false, error: "Harga beli dan harga jual tidak boleh negatif." };
    }

    logger.info("Mendaftarkan obat baru", {
      kodeBrng: dto.kodeBrng,
      namaBrng: dto.namaBrng,
      userId,
    });

    return await medicineRepository.createMedicine(dto, userId);
  }

  async updateMedicine(
    kodeBrng: string,
    dto: UpdateMedicineDTO
  ): Promise<{ success: boolean; error?: string }> {
    if (!kodeBrng || kodeBrng.trim().length === 0) {
      return { success: false, error: "Kode obat tidak valid." };
    }
    if (!dto.namaBrng || dto.namaBrng.trim().length === 0) {
      return { success: false, error: "Nama obat tidak boleh kosong." };
    }
    if (!dto.kodeSat || dto.kodeSat.trim().length === 0) {
      return { success: false, error: "Satuan obat wajib dipilih." };
    }
    if (!dto.kategori || dto.kategori.trim().length === 0) {
      return { success: false, error: "Kategori obat wajib dipilih." };
    }
    if (Number(dto.hBeli) < 0 || Number(dto.ralan) < 0) {
      return { success: false, error: "Harga beli dan harga jual tidak boleh negatif." };
    }

    return await medicineRepository.updateMedicine(kodeBrng, dto);
  }

  async toggleStatus(
    kodeBrng: string,
    newStatus: "0" | "1"
  ): Promise<{ success: boolean; error?: string }> {
    if (!kodeBrng) return { success: false, error: "Kode obat tidak valid." };
    return await medicineRepository.toggleMedicineStatus(kodeBrng, newStatus);
  }

  async adjustStock(
    dto: AdjustStockDTO,
    userId?: string
  ): Promise<{ success: boolean; error?: string; newStock?: number }> {
    if (!dto.kodeBrng) {
      return { success: false, error: "Obat belum dipilih." };
    }
    if (!["TAMBAH", "KURANG", "OPNAME"].includes(dto.jenis)) {
      return { success: false, error: "Jenis penyesuaian stok tidak valid." };
    }
    if (Number(dto.jumlah) < 0) {
      return { success: false, error: "Jumlah penyesuaian tidak boleh bernilai negatif." };
    }

    logger.info("Melakukan penyesuaian stok obat", {
      kodeBrng: dto.kodeBrng,
      jenis: dto.jenis,
      jumlah: dto.jumlah,
      userId,
    });

    return await medicineRepository.adjustStock(dto, userId);
  }

  async getCategories(): Promise<CategoryOption[]> {
    return await medicineRepository.getCategories();
  }

  async getUnits(): Promise<SatuanOption[]> {
    return await medicineRepository.getUnits();
  }

  async createUnit(
    kodeSat: string,
    satuan: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!kodeSat || !satuan) {
      return { success: false, error: "Kode satuan dan nama satuan wajib diisi." };
    }
    return await medicineRepository.createUnit(kodeSat, satuan);
  }

  async getStockAdjustments(
    kodeBrng?: string,
    limit = 50
  ): Promise<StockAdjustment[]> {
    return await medicineRepository.getStockAdjustments(kodeBrng, limit);
  }

  async getStockSummary(): Promise<StockSummary> {
    return await medicineRepository.getStockSummary();
  }
}

export const medicineService = new MedicineService();

