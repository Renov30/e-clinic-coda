export interface ClinicConfig {
  namaKlinik: string;
  alamat: string;
  kotaKabupaten: string;
  propinsi: string;
  telepon: string;
  email: string;
  logoUrl?: string;
  izinOperasional?: string;
  catatanKuitansi?: string;
  updatedAt?: string;
}

export interface UpdateClinicConfigDTO {
  namaKlinik: string;
  alamat: string;
  kotaKabupaten?: string;
  propinsi?: string;
  telepon: string;
  email: string;
  logoUrl?: string;
  izinOperasional?: string;
  catatanKuitansi?: string;
}

