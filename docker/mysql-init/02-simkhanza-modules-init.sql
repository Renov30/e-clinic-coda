-- ==============================================================================
-- Inisialisasi Skema SIMKhanza Modul 2 (Pasien & Registrasi) dan Modul 3 (Farmasi Obat Luar)
-- ==============================================================================

USE `sik`;

-- 1. Penanggung Jawab / Asuransi (penjab)
CREATE TABLE IF NOT EXISTS `penjab` (
  `kd_pj` char(3) NOT NULL,
  `png_jawab` varchar(30) NOT NULL,
  `nama_perusahaan` varchar(60) NOT NULL DEFAULT '',
  `alamat_asuransi` varchar(100) NOT NULL DEFAULT '',
  `no_telp` varchar(40) NOT NULL DEFAULT '',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`kd_pj`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `penjab` (`kd_pj`, `png_jawab`, `nama_perusahaan`, `status`) VALUES
('A01', 'Umum / Mandiri', 'Pembayaran Mandiri', '1'),
('BPJ', 'BPJS Kesehatan', 'BPJS Kesehatan', '1'),
('A09', 'Asuransi Swasta', 'AdMedika / Prudential', '1')
ON DUPLICATE KEY UPDATE `png_jawab` = VALUES(`png_jawab`);

-- 2. Poliklinik (poliklinik)
CREATE TABLE IF NOT EXISTS `poliklinik` (
  `kd_poli` varchar(5) NOT NULL,
  `nm_poli` varchar(50) NOT NULL,
  `registrasi` double NOT NULL DEFAULT 15000,
  `registrasilama` double NOT NULL DEFAULT 10000,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`kd_poli`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `poliklinik` (`kd_poli`, `nm_poli`, `registrasi`, `registrasilama`, `status`) VALUES
('POL01', 'Poli Umum', 25000, 20000, '1'),
('POL02', 'Poli Gigi & Mulut', 35000, 30000, '1'),
('POL03', 'Poli KIA / Kebidanan', 30000, 25000, '1'),
('POL04', 'Poli Spesialis Penyakit Dalam', 50000, 45000, '1')
ON DUPLICATE KEY UPDATE `nm_poli` = VALUES(`nm_poli`);

-- 3. Dokter (dokter)
CREATE TABLE IF NOT EXISTS `dokter` (
  `kd_dokter` varchar(20) NOT NULL,
  `nm_dokter` varchar(50) NOT NULL,
  `jk` enum('L','P') NOT NULL,
  `tmp_lahir` varchar(20) NOT NULL DEFAULT '',
  `tgl_lahir` date NOT NULL DEFAULT '1980-01-01',
  `gol_drh` enum('A','B','AB','O','-') NOT NULL DEFAULT '-',
  `agama` varchar(12) NOT NULL DEFAULT 'Islam',
  `almt_tgl` varchar(60) NOT NULL DEFAULT '',
  `no_telp` varchar(13) NOT NULL DEFAULT '',
  `stts_nikah` enum('BELUM MENIKAH','MENIKAH','JANDA','DUDA') NOT NULL DEFAULT 'MENIKAH',
  `kd_sps` char(5) NOT NULL DEFAULT 'UMUM',
  `alumni` varchar(60) NOT NULL DEFAULT 'Universitas Indonesia',
  `no_ijn_praktek` varchar(120) NOT NULL DEFAULT '446/SIP/2023',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`kd_dokter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `dokter` (`kd_dokter`, `nm_dokter`, `jk`, `almt_tgl`, `no_telp`, `status`) VALUES
('DR001', 'Dr. Shin Tamura', 'L', 'Jl. Sudirman No. 12, Jakarta', '081234567890', '1'),
('DR002', 'drg. Sarah Wijaya, Sp.Ort', 'P', 'Jl. Gatot Subroto No. 45, Jakarta', '081298765432', '1'),
('DR003', 'dr. Budi Santoso, Sp.PD', 'L', 'Jl. Rasuna Said No. 88, Jakarta', '081311223344', '1')
ON DUPLICATE KEY UPDATE `nm_dokter` = VALUES(`nm_dokter`);

-- 4. Pasien (pasien)
CREATE TABLE IF NOT EXISTS `pasien` (
  `no_rkm_medis` varchar(15) NOT NULL,
  `nm_pasien` varchar(40) NOT NULL,
  `no_ktp` varchar(20) NOT NULL DEFAULT '',
  `jk` enum('L','P') NOT NULL,
  `tmp_lahir` varchar(15) NOT NULL DEFAULT '',
  `tgl_lahir` date NOT NULL,
  `nm_ibu` varchar(40) NOT NULL DEFAULT '',
  `alamat` varchar(200) NOT NULL,
  `gol_darah` enum('A','B','AB','O','-') NOT NULL DEFAULT '-',
  `pekerjaan` varchar(60) NOT NULL DEFAULT '-',
  `stts_nikah` enum('BELUM MENIKAH','MENIKAH','JANDA','DUDA') NOT NULL DEFAULT 'BELUM MENIKAH',
  `agama` varchar(12) NOT NULL DEFAULT 'Islam',
  `tgl_daftar` date NOT NULL,
  `no_tlp` varchar(40) NOT NULL DEFAULT '',
  `umur` varchar(30) NOT NULL DEFAULT '',
  `pnd` enum('TS','TK','SD','SMP','SMA','SLTA/SEDERAJAT','D1','D2','D3','D4','S1','S2','S3','-') NOT NULL DEFAULT 'SLTA/SEDERAJAT',
  `keluarga` enum('AYAH','IBU','ISTRI','SUAMI','SAUDARA','ANAK') NOT NULL DEFAULT 'AYAH',
  `namakeluarga` varchar(50) NOT NULL DEFAULT '',
  `kd_pj` char(3) NOT NULL DEFAULT 'A01',
  PRIMARY KEY (`no_rkm_medis`),
  KEY `nm_pasien` (`nm_pasien`),
  KEY `no_ktp` (`no_ktp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pasien` (`no_rkm_medis`, `nm_pasien`, `no_ktp`, `jk`, `tmp_lahir`, `tgl_lahir`, `alamat`, `gol_darah`, `tgl_daftar`, `no_tlp`, `kd_pj`) VALUES
('000001', 'Riko Tanaka', '3171010101010001', 'P', 'Jakarta', '2003-05-14', 'Jl. Senopati No. 45, Jakarta Selatan', 'A', '2024-02-19', '081234000001', 'A01'),
('000002', 'Akiko Takahashi', '3171010101010002', 'L', 'Surabaya', '1986-09-20', 'Jl. Kemang Raya No. 12, Jakarta Selatan', 'B', '2024-02-20', '081234000002', 'BPJ'),
('000003', 'Hiroki Kimura', '3171010101010003', 'L', 'Bandung', '1995-11-08', 'Jl. Tebet Barat No. 8, Jakarta Selatan', 'O', '2024-02-21', '081234000003', 'A01'),
('000004', 'Asami Kondo', '3171010101010004', 'P', 'Semarang', '1988-03-25', 'Jl. Fatmawati No. 19, Jakarta Selatan', 'AB', '2024-02-22', '081234000004', 'A09')
ON DUPLICATE KEY UPDATE `nm_pasien` = VALUES(`nm_pasien`);

-- 5. Registrasi Pemeriksaan (reg_periksa)
CREATE TABLE IF NOT EXISTS `reg_periksa` (
  `no_reg` varchar(8) NOT NULL,
  `no_rawat` varchar(17) NOT NULL,
  `tgl_registrasi` date NOT NULL,
  `jam_reg` time NOT NULL,
  `kd_dokter` varchar(20) NOT NULL,
  `no_rkm_medis` varchar(15) NOT NULL,
  `kd_poli` varchar(5) NOT NULL,
  `p_jawab` varchar(100) NOT NULL DEFAULT '',
  `almt_pj` varchar(200) NOT NULL DEFAULT '',
  `hubunganpj` varchar(20) NOT NULL DEFAULT '',
  `biaya_reg` double NOT NULL DEFAULT 0,
  `stts` enum('Belum','Sudah','Batal','Berkunjung','Dirujuk','Meninggal','Dirawat') NOT NULL DEFAULT 'Belum',
  `stts_daftar` enum('-','Lama','Baru') NOT NULL DEFAULT 'Lama',
  `status_lanjut` enum('Ralan','Ranap') NOT NULL DEFAULT 'Ralan',
  `kd_pj` char(3) NOT NULL DEFAULT 'A01',
  `umurdaftar` int(11) NOT NULL DEFAULT 0,
  `sttsumur` enum('Th','Bl','Hr') NOT NULL DEFAULT 'Th',
  `status_bayar` enum('Sudah Bayar','Belum Bayar') NOT NULL DEFAULT 'Belum Bayar',
  PRIMARY KEY (`no_rawat`),
  KEY `no_rkm_medis` (`no_rkm_medis`),
  KEY `kd_dokter` (`kd_dokter`),
  KEY `kd_poli` (`kd_poli`),
  KEY `tgl_registrasi` (`tgl_registrasi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Satuan Obat & Barang (kodesatuan)
CREATE TABLE IF NOT EXISTS `kodesatuan` (
  `kode_sat` char(4) NOT NULL,
  `satuan` varchar(30) NOT NULL,
  PRIMARY KEY (`kode_sat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kodesatuan` (`kode_sat`, `satuan`) VALUES
('TAB', 'Tablet'),
('KAP', 'Kaplet'),
('STR', 'Strip'),
('BOT', 'Botol'),
('TBN', 'Tube'),
('SACH', 'Sachet')
ON DUPLICATE KEY UPDATE `satuan` = VALUES(`satuan`);

-- 7. Kategori Barang (kategori_barang)
CREATE TABLE IF NOT EXISTS `kategori_barang` (
  `kode` varchar(10) NOT NULL,
  `nama` varchar(30) NOT NULL,
  PRIMARY KEY (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kategori_barang` (`kode`, `nama`) VALUES
('KAT01', 'Obat Bebas & Bebas Terbatas'),
('KAT02', 'Obat Keras & Antibiotik'),
('KAT03', 'Vitamin & Suplemen'),
('KAT04', 'Alat Kesehatan Habis Pakai')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

-- 8. Depo / Bangsal Apotek (bangsal)
CREATE TABLE IF NOT EXISTS `bangsal` (
  `kd_bangsal` char(5) NOT NULL,
  `nm_bangsal` varchar(30) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`kd_bangsal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bangsal` (`kd_bangsal`, `nm_bangsal`, `status`) VALUES
('APT01', 'Depo Farmasi / Apotek', '1')
ON DUPLICATE KEY UPDATE `nm_bangsal` = VALUES(`nm_bangsal`);

-- 9. Master Data Obat & Barang (databarang)
CREATE TABLE IF NOT EXISTS `databarang` (
  `kode_brng` varchar(15) NOT NULL,
  `nama_brng` varchar(80) NOT NULL,
  `kode_sat` char(4) NOT NULL,
  `kategori` varchar(10) NOT NULL DEFAULT 'KAT01',
  `h_beli` double NOT NULL DEFAULT 0,
  `ralan` double NOT NULL DEFAULT 0,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`kode_brng`),
  KEY `nama_brng` (`nama_brng`),
  KEY `kode_sat` (`kode_sat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `databarang` (`kode_brng`, `nama_brng`, `kode_sat`, `kategori`, `h_beli`, `ralan`, `status`) VALUES
('OBT001', 'Paracetamol 500mg', 'TAB', 'KAT01', 500, 1000, '1'),
('OBT002', 'Amoxicillin 500mg', 'KAP', 'KAT02', 800, 1500, '1'),
('OBT003', 'Asam Mefenamat 500mg', 'KAP', 'KAT02', 900, 1800, '1'),
('OBT004', 'Cataflam 50mg (Kalium Diklofenak)', 'TAB', 'KAT02', 4500, 7500, '1'),
('OBT005', 'Betadine Gargle Mouthwash 190ml', 'BOT', 'KAT01', 35000, 48000, '1'),
('OBT006', 'Sensodyne Pasta Gigi Repair 100g', 'TBN', 'KAT04', 32000, 45000, '1'),
('OBT007', 'Enervon-C Multivitamin Strip', 'STR', 'KAT03', 6000, 9500, '1'),
('OBT008', 'Cefixime 100mg Kapsul', 'KAP', 'KAT02', 3000, 5000, '1'),
('OBT009', 'Antasida Doen Tablet Kunyah', 'TAB', 'KAT01', 400, 800, '1'),
('OBT010', 'Dexamethasone 0.5mg', 'TAB', 'KAT02', 300, 600, '1')
ON DUPLICATE KEY UPDATE `nama_brng` = VALUES(`nama_brng`), `ralan` = VALUES(`ralan`);

-- 10. Stok Obat per Depo / Gudang (gudangbarang)
CREATE TABLE IF NOT EXISTS `gudangbarang` (
  `kode_brng` varchar(15) NOT NULL,
  `kd_bangsal` char(5) NOT NULL,
  `stok` double NOT NULL DEFAULT 0,
  PRIMARY KEY (`kode_brng`,`kd_bangsal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `gudangbarang` (`kode_brng`, `kd_bangsal`, `stok`) VALUES
('OBT001', 'APT01', 250),
('OBT002', 'APT01', 120),
('OBT003', 'APT01', 180),
('OBT004', 'APT01', 85),
('OBT005', 'APT01', 30),
('OBT006', 'APT01', 25),
('OBT007', 'APT01', 90),
('OBT008', 'APT01', 60),
('OBT009', 'APT01', 300),
('OBT010', 'APT01', 200)
ON DUPLICATE KEY UPDATE `stok` = VALUES(`stok`);

-- 11. Header Transaksi Penjualan Obat Bebas / Resep Luar (penjualan)
CREATE TABLE IF NOT EXISTS `penjualan` (
  `nota_jual` varchar(20) NOT NULL,
  `tgl_jual` date NOT NULL,
  `nip` varchar(20) NOT NULL DEFAULT 'KASIR01',
  `no_rkm_medis` varchar(15) NOT NULL DEFAULT '-',
  `nm_pasien` varchar(40) NOT NULL,
  `keterangan` varchar(100) NOT NULL DEFAULT 'Penjualan Obat Luar',
  `jns_jual` varchar(30) NOT NULL DEFAULT 'Jual Bebas',
  `ongkir` double NOT NULL DEFAULT 0,
  `status` enum('Sudah Bayar','Belum Bayar') NOT NULL DEFAULT 'Sudah Bayar',
  PRIMARY KEY (`nota_jual`),
  KEY `tgl_jual` (`tgl_jual`),
  KEY `no_rkm_medis` (`no_rkm_medis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Rincian Obat Terjual (detailjual)
CREATE TABLE IF NOT EXISTS `detailjual` (
  `nota_jual` varchar(20) NOT NULL,
  `kode_brng` varchar(15) NOT NULL,
  `kode_sat` char(4) NOT NULL,
  `jumlah` double NOT NULL,
  `h_jual` double NOT NULL,
  `subtotal` double NOT NULL,
  `diskon` double NOT NULL DEFAULT 0,
  `total` double NOT NULL,
  PRIMARY KEY (`nota_jual`,`kode_brng`),
  KEY `kode_brng` (`kode_brng`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

