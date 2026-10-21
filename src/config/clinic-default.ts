export interface ClinicProfile {
  namaKlinik: string;
  namaSistem?: string;
  alamat: string;
  kotaKabupaten: string;
  propinsi: string;
  telepon: string;
  email: string;
  logoUrl?: string;
  izinOperasional?: string;
  catatanKuitansi?: string;
}

export const DEFAULT_CLINIC_PROFILE: ClinicProfile = {
  namaKlinik: "Smile360 Dental & Medical Clinic",
  namaSistem: "simitra",
  alamat: "Jl. Kesehatan Raya No. 108",
  kotaKabupaten: "Jakarta Selatan",
  propinsi: "DKI Jakarta",
  telepon: "(021) 7890-1234",
  email: "care@smile360clinic.com",
  logoUrl: "",
  izinOperasional: "445/092/DINKES/2023",
  catatanKuitansi: "Terima kasih atas kepercayaan Anda. Semoga lekas sembuh.",
};

