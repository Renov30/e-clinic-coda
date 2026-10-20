import { pharmacyRepository, PharmacyRepository } from "./repository";
import { MedicineItem, CreateSaleDTO, SaleReceipt, SaleHistoryItem } from "./types";
import { checkoutSaleSchema } from "@/lib/validations/pharmacy";
import { recordAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";

export class PharmacyService {
  constructor(private repo: PharmacyRepository = pharmacyRepository) {}

  async searchMedicines(keyword?: string): Promise<MedicineItem[]> {
    return await this.repo.searchMedicines(keyword);
  }

  async getRecentSales(limit = 30): Promise<SaleHistoryItem[]> {
    return await this.repo.getRecentSales(limit);
  }

  async processDrugSale(data: CreateSaleDTO): Promise<{
    success: boolean;
    data?: SaleReceipt;
    error?: string;
  }> {
    const validation = checkoutSaleSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg };
    }

    try {
      const receipt = await this.repo.createExternalDrugSale(validation.data);

      await recordAuditEvent({
        action: "SALE_EXTERNAL_DRUG",
        resource: "PENJUALAN",
        resourceId: receipt.notaJual,
        status: "SUCCESS",
        details: {
          notaJual: receipt.notaJual,
          totalTagihan: receipt.totalTagihan,
          itemCount: receipt.items.length,
          nmPasien: receipt.nmPasien,
        },
      });

      return { success: true, data: receipt };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gagal memproses transaksi penjualan obat";
      logger.error("Error processing external drug sale", { error: errorMsg });

      await recordAuditEvent({
        action: "SALE_EXTERNAL_DRUG",
        resource: "PENJUALAN",
        status: "FAILURE",
        details: { error: errorMsg },
      });

      return { success: false, error: errorMsg };
    }
  }
}

export const pharmacyService = new PharmacyService();
