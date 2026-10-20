-- Inisialisasi Skema Kompatibilitas SIMKhanza (Pengembangan Lokal)
-- CATATAN: File ini hanya untuk docker container lokal pengembangan e-clinic-coda.
-- JANGAN PERNAH MENJALANKAN SCRIPT INI KE DATABASE SIMKHANZA PRODUKSI.

CREATE DATABASE IF NOT EXISTS `sik` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sik`;

-- Tabel setting identitas instansi / klinik (sesuai struktur standar SIMKhanza)
CREATE TABLE IF NOT EXISTS `setting` (
  `nama_instansi` varchar(120) NOT NULL DEFAULT '',
  `alamat_instansi` varchar(255) NOT NULL DEFAULT '',
  `kabupaten` varchar(80) NOT NULL DEFAULT '',
  `propinsi` varchar(80) NOT NULL DEFAULT '',
  `kontak` varchar(50) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  `aktifkan` enum('Yes','No') NOT NULL DEFAULT 'Yes',
  `kode_ppk` varchar(50) NOT NULL DEFAULT '',
  `kode_ppkkemenkes` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`nama_instansi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default setting jika tabel masih kosong
INSERT INTO `setting` (`nama_instansi`, `alamat_instansi`, `kabupaten`, `propinsi`, `kontak`, `email`, `aktifkan`, `kode_ppk`)
SELECT 'Smile360 Dental & Medical Clinic', 'Jl. Kesehatan Raya No. 108', 'Jakarta Selatan', 'DKI Jakarta', '(021) 7890-1234', 'care@smile360clinic.com', 'Yes', '445/092/DINKES/2023'
WHERE NOT EXISTS (SELECT 1 FROM `setting` LIMIT 1);

