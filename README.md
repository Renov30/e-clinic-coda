# e-clinic-coda

> **Sistem Informasi Manajemen Klinik Modular Kompatibel SIMKhanza**

Aplikasi web **e-clinic-coda** dirancang untuk menggantikan SIMKhanza secara bertahap (*strangler fig pattern*) tanpa mengganggu operasional klinik yang sedang berjalan.

---

## 1. Roadmap Pengembangan Modular

Pengembangan dilakukan secara bertahap dan terisolasi:

1. ✅ **Fondasi Proyek, Konfigurasi Instansi & Dashboard Klinik** (Fase saat ini)
2. ⏳ **Registrasi Pasien & Kunjungan (Rawat Jalan / Poliklinik)** (Tahap 2)
3. ⏳ **Penjualan Obat Luar / Farmasi & Kasir** (Tahap 3)

---

## 2. Arsitektur & Prinsip Desain

- **Next.js App Router** (React Server Components + Client Components yang terpisah dengan rapi).
- **TypeScript Strict Mode** untuk seluruh modul domain, types, service, dan repository.
- **Desain UI/UX Minimalis & Bersih**: Mengadopsi visual klinik modern (referensi *Smile360 / Clean White Card & Blue Accent*), bebas gradient berlebihan, tipografi kontras tinggi, dan responsif desktop-first.
- **Lapisan Kode Terisolasi (Separation of Concerns)**:
  - `src/components/ui/`: Komponen primitif shadcn-style (`button`, `card`, `input`, `table`, `dialog`, `badge`, `avatar`, `dropdown-menu`).
  - `src/components/layout/`: Shell navigasi (`sidebar`, `header`, `app-shell`).
  - `src/components/common/`: Loading, empty, error states, and status badges.
  - `src/modules/clinic-config/`: Modul pengaturan instansi (types, repository, service, server actions).
  - `src/lib/db/`: MySQL connection pooling (`mysql2/promise`), safe parameterized queries, dan transaksi konsisten.
  - `src/lib/logger/`: Structured JSON logging dengan otomatisasi sensor/redaksi data medis dan kredensial sensitif.
  - `src/lib/audit/`: Jejak audit (*audit trail*) untuk aksi penting pengguna.

---

## 3. Kompatibilitas SIMKhanza

1. **Non-Destructive**: Tidak menjalankan migrasi otomatis, `db push`, atau alter table destruktif ke database SIMKhanza.
2. **Pemetaan Skema**:
   - `setting`: Konfigurasi instansi (nama klinik, kontak, alamat, izin PPK).
   - `pasien`: Master data pasien & rekam medis (Tahap 2).
   - `reg_periksa`: Registrasi kunjungan dan antrean poli (Tahap 2).
   - `dokter` & `poliklinik`: Jadwal dan tenaga medis (Tahap 2).
   - `databarang`, `gudangbarang`, `penjualan`: Master obat & penjualan obat luar (Tahap 3).
3. **Penyimpanan Konfigurasi Dinamis**: Identitas klinik (nama klinik, alamat, kontak, email, izin operasional, catatan kuitansi) dikonfigurasi melalui antarmuka Pengaturan (`/settings`) dan disimpan ke tabel `setting`, bukan di-hardcode di kode program.

---

## 4. Menjalankan dengan Docker Compose (Direkomendasikan)

### Persyaratan:
- Docker Engine 24+ & Docker Compose v2+

### Menjalankan Lingkungan:
```bash
# 1. Salin konfigurasi environment
cp .env.example .env

# 2. Jalankan container app dan database MySQL
docker compose up -d --build

# 3. Pantau status container
docker compose ps

# 4. Pantau log aplikasi
docker compose logs -f app
```

Buka peramban ke: `http://localhost:3000`

### Menghentikan Lingkungan:
```bash
# Hentikan container
docker compose down

# Hentikan dan hapus volume database (reset data lokal)
docker compose down -v
```

---

## 5. Menjalankan untuk Pengembangan Lokal (Tanpa Docker)

```bash
# 1. Instal dependensi
npm install

# 2. Jalankan server dev lokal
npm run dev
```

Buka: `http://localhost:3000`

### Verifikasi Kesehatan Sistem:
- Dashboard: `http://localhost:3000/`
- Janji Temu / Appointments: `http://localhost:3000/appointments`
- Pengaturan Instansi: `http://localhost:3000/settings`
- Health Check API: `http://localhost:3000/api/health`

---

## 6. Struktur Direktori Proyek

```
e-clinic-coda/
├── docker/
│   └── mysql-init/
│       └── 01-simkhanza-init.sql   # Skema inisialisasi tabel setting SIMKhanza
├── src/
│   ├── app/                        # App Router Pages & API Routes
│   │   ├── page.tsx                # Dashboard Utama
│   │   ├── appointments/           # Halaman Janji Temu (TanStack Table)
│   │   ├── settings/               # Pengaturan Identitas Instansi
│   │   ├── schedule/               # Placeholder Jadwal
│   │   ├── patients/               # Placeholder Pasien
│   │   ├── doctors/                # Placeholder Dokter
│   │   ├── messages/               # Placeholder Pesan
│   │   ├── payments/               # Placeholder Kasir
│   │   ├── support/                # Panduan Sistem
│   │   ├── api/health/             # Health check endpoint
│   │   └── api/clinic-config/      # Endpoint profil instansi
│   ├── components/
│   │   ├── ui/                     # Primitif UI (Button, Card, Input, Table, etc.)
│   │   ├── layout/                 # Sidebar, Header, AppShell
│   │   ├── common/                 # EmptyState, LoadingState, ErrorState, StatusBadge
│   │   ├── appointments/           # AppointmentTable (TanStack Table + Add Modal)
│   │   └── settings/               # ClinicProfileForm (React Hook Form + Zod)
│   ├── config/                     # Default Clinic Config & Navigation
│   ├── lib/
│   │   ├── db/                     # MySQL Connection Pool & SIMKhanza Mapping
│   │   ├── logger/                 # Sanitized Structured Logger
│   │   ├── audit/                  # Audit Trail Helper
│   │   ├── validations/            # Zod Validation Schemas
│   │   └── utils.ts                # Helper cn, formatter
│   └── modules/
│       └── clinic-config/          # Domain Config (DTO, Service, Repository, Actions)
├── Dockerfile                      # Multi-stage lightweight production runner
├── docker-compose.yml              # Local compose (Next.js + MySQL 8.0)
└── README.md
```

---

## 7. Troubleshooting

| Masalah | Solusi |
|---|---|
| `connect ECONNREFUSED 127.0.0.1:3306` saat dev lokal | Pastikan container MySQL berjalan dengan `docker compose up -d db` atau biarkan app menggunakan *fallback in-memory* otomatis. |
| Port 3306 sudah dipakai di host | Ubah nilai `DB_PORT` di `.env` (misalnya `DB_PORT=3307`). |
| Ingin mereset data instansi ke awal | Jalankan `docker compose down -v` lalu `docker compose up -d`. |
