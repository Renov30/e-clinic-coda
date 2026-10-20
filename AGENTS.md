<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aturan Pengembangan AI Agent (e-clinic-coda)

### 1. Struktur Kode Seragam & Komentar Penanda Bagian
- Setiap file komponen (`src/components/**/*.tsx`) wajib menggunakan struktur baku berurutan:
  1. `// 1. IMPORTS & DEPENDENCIES`
  2. `// 2. TYPES & INTERFACES`
  3. `// 3. CONSTANTS & HELPER FUNCTIONS`
  4. `// 4. MAIN COMPONENT` (terbagi atas `4.1 State & Hooks`, `4.2 Derived State`, `4.3 Effects`, `4.4 Handlers`, `4.5 Render UI`).
- Beri komentar pemisah bagian yang rapi dan konsisten.

### 2. Standar Navbar & Judul Halaman
- **Title Halaman Hanya di Navbar**: Judul halaman aktif diletakkan di Navbar (`Header`), terdaftar di `ROUTE_TITLES`.
- **Dilarang Menaruh Title di Halaman**: Kosongkan atau hilangkan judul halaman (`<h1>...</h1>` atau header redundan) di dalam body halaman.
- **Hilangkan Search Bar di Navbar**: Search bar di navbar ditiadakan agar header bersih dan fokus. Pencarian diletakkan kontekstual di dalam card tabel/halaman masing-masing.

### 3. Layout Setiap Halaman Seragam
- Root container dibungkus `<div className="space-y-6">`.
- Header toolbar/sub-navigasi di atas: Tabs di kiri, Tombol Aksi Utama di kanan (`h-10 rounded-xl`).
- Banner notifikasi: rounded alert ber-border dengan tombol tutup.
- KPI cards: `grid grid-cols-2 md:grid-cols-4 (atau 5) gap-3.5` dengan card `rounded-2xl border-slate-200/80 shadow-xs bg-white p-4`.
- Toolbar filter & search: `bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs`.
- Tabel: `bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden`.
- Tombol aksi tabel: Wajib menggunakan *tactile pill buttons* ber-border (`px-2.5 py-1 rounded-lg text-xs font-semibold`).

### 4. Larangan Keras (Strict Constraints)
- **JANGAN PERNAH `git commit`**: Biarkan semua perubahan di working tree untuk ditinjau pengguna.
- **JANGAN BUILD DOCKER**: Aplikasi berjalan lokal dengan `npm run dev`. Docker hanya untuk database MySQL.
- **MINIMALKAN PENGGUNAAN IKON**: Jangan gunakan ikon dekoratif berlebihan; utamakan tipografi bersih dan tombol pill tegas.
