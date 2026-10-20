export interface Patient {
  noRkmMedis: string;
  nmPasien: string;
  noKtp: string;
  jk: "L" | "P";
  tmpLahir: string;
  tglLahir: string;
  alamat: string;
  golDarah: "A" | "B" | "AB" | "O" | "-";
  tglDaftar: string;
  noTlp: string;
  kdPj: string;
  pngJawab?: string;
}

export interface CreatePatientDTO {
  nmPasien: string;
  noKtp?: string;
  jk: "L" | "P";
  tmpLahir?: string;
  tglLahir: string;
  alamat: string;
  golDarah?: "A" | "B" | "AB" | "O" | "-";
  noTlp?: string;
  kdPj?: string;
}

export interface VisitRegistration {
  noRawat: string;
  noReg: string;
  tglRegistrasi: string;
  jamReg: string;
  kdDokter: string;
  nmDokter: string;
  noRkmMedis: string;
  nmPasien: string;
  kdPoli: string;
  nmPoli: string;
  biayaReg: number;
  stts: "Belum" | "Sudah" | "Batal" | "Berkunjung" | "Dirujuk";
  kdPj: string;
  pngJawab: string;
  statusBayar: "Sudah Bayar" | "Belum Bayar";
}

export interface CreateVisitDTO {
  noRkmMedis: string;
  kdPoli: string;
  kdDokter: string;
  kdPj: string;
  tglRegistrasi?: string;
  biayaReg?: number;
}

export interface DoctorOption {
  kdDokter: string;
  nmDokter: string;
}

export interface PoliOption {
  kdPoli: string;
  nmPoli: string;
  registrasi: number;
}

export interface PenjabOption {
  kdPj: string;
  pngJawab: string;
}

