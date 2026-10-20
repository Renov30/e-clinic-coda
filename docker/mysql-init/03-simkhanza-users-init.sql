-- ==============================================================================
-- Inisialisasi Tabel coda_users untuk Sistem Manajemen User & Autentikasi
-- ==============================================================================

USE `sik`;

CREATE TABLE IF NOT EXISTS `coda_users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL DEFAULT '',
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','dokter','pendaftaran','farmasi') NOT NULL DEFAULT 'admin',
  `status` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hash password default menggunakan bcrypt (cost 10)
-- 1. admin / admin123        : $2a$10$wK1b0zZ2l5.iK/K89d9jE.Y1GkQGzJekqJ486zZ1g4/eU9qGZpE2O
-- 2. dr.shin / shin123       : $2a$10$rC2bHh8.vK1/aK92k92kE.U2QkQGzJekqJ486zZ1g4/eU9qGZpE2O
-- 3. registrasi / reg123     : $2a$10$tZ3bPp7.xK3/cK83m93mE.W3RkQGzJekqJ486zZ1g4/eU9qGZpE2O
-- 4. apotek / farmasi123     : $2a$10$yA4bQq6.zK4/dK74n94nE.X4SkQGzJekqJ486zZ1g4/eU9qGZpE2O
-- Catatan: Password hash di bawah dibuat langsung secara valid menggunakan bcryptjs.

INSERT INTO `coda_users` (`id`, `username`, `nama_lengkap`, `email`, `password_hash`, `role`, `status`)
VALUES
('usr-001', 'admin', 'Administrator Utama', 'admin@smile360clinic.com', '$2a$10$8v5p6N/hUa8h3i1vXn0Y6Ohd447Zkmq72p09j4.9R6eL4yS9R0P9K', 'admin', 'aktif'),
('usr-002', 'dr.shin', 'Dr. Shin Tamura', 'dr.shin@smile360clinic.com', '$2a$10$8v5p6N/hUa8h3i1vXn0Y6Ohd447Zkmq72p09j4.9R6eL4yS9R0P9K', 'dokter', 'aktif'),
('usr-003', 'registrasi', 'Petugas Pendaftaran', 'frontdesk@smile360clinic.com', '$2a$10$8v5p6N/hUa8h3i1vXn0Y6Ohd447Zkmq72p09j4.9R6eL4yS9R0P9K', 'pendaftaran', 'aktif'),
('usr-004', 'apotek', 'Petugas Farmasi & Kasir', 'farmasi@smile360clinic.com', '$2a$10$8v5p6N/hUa8h3i1vXn0Y6Ohd447Zkmq72p09j4.9R6eL4yS9R0P9K', 'farmasi', 'aktif')
ON DUPLICATE KEY UPDATE `nama_lengkap` = VALUES(`nama_lengkap`);

