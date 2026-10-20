-- ==============================================================================
-- Inisialisasi Tabel coda_users, coda_roles, dan coda_role_permissions
-- ==============================================================================

USE `sik`;

CREATE TABLE IF NOT EXISTS `coda_roles` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT '',
  `is_system` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `coda_role_permissions` (
  `role_id` varchar(36) NOT NULL,
  `permission_key` varchar(100) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_key`),
  KEY `role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `coda_users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL DEFAULT '',
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `status` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeding Default Roles
INSERT IGNORE INTO `coda_roles` (`id`, `name`, `label`, `description`, `is_system`) VALUES
('role-admin', 'admin', 'Administrator', 'Memiliki akses penuh ke seluruh modul, pengaturan, dan hak akses sistem.', 1),
('role-dokter', 'dokter', 'Dokter', 'Tenaga medis praktik yang melayani pemeriksaan, rekam medis, dan antrean poli.', 1),
('role-pendaftaran', 'pendaftaran', 'Petugas Pendaftaran', 'Petugas loket depan untuk registrasi pasien baru dan antrean poli rawat jalan.', 1),
('role-farmasi', 'farmasi', 'Staf Farmasi', 'Staf pengelola apotek, kasir obat luar, stok obat, dan rekap kuitansi penjualan.', 1);

-- Seeding Default Permissions
INSERT IGNORE INTO `coda_role_permissions` (`role_id`, `permission_key`) VALUES
('role-admin', 'access:dashboard'),
('role-admin', 'access:patients'),
('role-admin', 'access:appointments'),
('role-admin', 'access:pharmacy'),
('role-admin', 'access:doctors'),
('role-admin', 'access:schedule'),
('role-admin', 'access:users'),
('role-admin', 'access:roles'),
('role-admin', 'access:settings'),
('role-admin', 'access:support'),
('role-admin', 'patient:create'),
('role-admin', 'visit:create'),
('role-admin', 'pharmacy:sell'),
('role-admin', 'user:manage'),
('role-admin', 'setting:manage'),

('role-dokter', 'access:dashboard'),
('role-dokter', 'access:patients'),
('role-dokter', 'access:appointments'),
('role-dokter', 'access:doctors'),
('role-dokter', 'access:schedule'),
('role-dokter', 'access:support'),

('role-pendaftaran', 'access:dashboard'),
('role-pendaftaran', 'access:patients'),
('role-pendaftaran', 'access:appointments'),
('role-pendaftaran', 'access:doctors'),
('role-pendaftaran', 'access:schedule'),
('role-pendaftaran', 'access:support'),
('role-pendaftaran', 'patient:create'),
('role-pendaftaran', 'visit:create'),

('role-farmasi', 'access:dashboard'),
('role-farmasi', 'access:pharmacy'),
('role-farmasi', 'access:support'),
('role-farmasi', 'pharmacy:sell');

-- Seeding Default Users
INSERT INTO `coda_users` (`id`, `username`, `nama_lengkap`, `email`, `password_hash`, `role`, `status`)
VALUES
('usr-001', 'admin', 'Administrator Utama', 'admin@smile360clinic.com', '$2a$10$8v5p6N/hUa8h3i1vXn0Y6Ohd447Zkmq72p09j4.9R6eL4yS9R0P9K', 'admin', 'aktif'),
('usr-002', 'dr.shin', 'Dr. Shin Tamura', 'dr.shin@smile360clinic.com', '$2a$10$8v5p6N/hUa8h3i1vXn0Y6Ohd447Zkmq72p09j4.9R6eL4yS9R0P9K', 'dokter', 'aktif'),
('usr-003', 'registrasi', 'Petugas Pendaftaran', 'frontdesk@smile360clinic.com', '$2a$10$8v5p6N/hUa8h3i1vXn0Y6Ohd447Zkmq72p09j4.9R6eL4yS9R0P9K', 'pendaftaran', 'aktif'),
('usr-004', 'apotek', 'Petugas Farmasi & Kasir', 'farmasi@smile360clinic.com', '$2a$10$8v5p6N/hUa8h3i1vXn0Y6Ohd447Zkmq72p09j4.9R6eL4yS9R0P9K', 'farmasi', 'aktif')
ON DUPLICATE KEY UPDATE `nama_lengkap` = VALUES(`nama_lengkap`);
