# Aturan Standar Pengembangan AI Agent (e-clinic-coda)

Dokumen ini berisi aturan wajib bagi setiap AI Agent yang berkontribusi dalam pengembangan aplikasi web **e-clinic-coda**. Seluruh aturan di bawah ini harus dipatuhi secara konsisten tanpa pengecualian.

---

## 1. Struktur Kode Seragam & Komentar Penanda Bagian

Setiap file kode (khususnya komponen React/Next.js dan modul backend) harus ditulis menggunakan struktur hierarki yang seragam dan wajib menyertakan komentar pembatas yang jelas untuk menandai setiap bagian/seksi.

### A. Format Komponen React (`src/components/**/*.tsx`)
Setiap komponen harus disusun dengan urutan berikut:

```tsx
// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
// React, Next.js, UI primitives, icons, types, actions...

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
// Props interface, form values, local state types...

// ==========================================
// 3. CONSTANTS & HELPER FUNCTIONS
// ==========================================
// Formatters, lookup tables, utility functions...

// ==========================================
// 4. MAIN COMPONENT
// ==========================================
export function ComponentName(props: Props) {
  // ----------------------------------------
  // 4.1 State & Hooks
  // ----------------------------------------

  // ----------------------------------------
  // 4.2 Derived State & Calculations (Memos)
  // ----------------------------------------

  // ----------------------------------------
  // 4.3 Effects & Lifecycle
  // ----------------------------------------

  // ----------------------------------------
  // 4.4 Event Handlers & Server Actions
  // ----------------------------------------

  // ----------------------------------------
  // 4.5 Render UI
  // ----------------------------------------
  return (
    <div className="space-y-6">
      {/* Top Bar / Sub-Navigation & Actions */}
      {/* Notifications / Alerts */}
      {/* Metric Cards (jika ada) */}
      {/* Search & Filter Bar (jika ada) */}
      {/* Main Content / Table */}
      {/* Dialogs / Modals */}
    </div>
  );
}
```

### B. Format Modul Domain (`src/modules/<nama-modul>/`)
Setiap fitur baru harus memisahkan tanggung jawab ke dalam berkas standar:
- `types.ts`: Khusus tipe data domain, DTO, dan enum.
- `repository.ts`: Khusus query SQL dan interaksi database SIMKhanza/MySQL.
- `service.ts`: Khusus business logic, validasi input, dan logging.
- `actions.ts`: Khusus Next.js Server Actions (`"use server"`) dengan otorisasi sesi dan `revalidatePath`.

---

## 2. Standar Navbar & Judul Halaman

1. **Title Halaman Hanya di Navbar**:
   - Judul halaman aktif (**Page Title**) hanya ditampilkan secara terpusat pada Navbar (`Header` di [`src/components/layout/header.tsx`](file:///Users/renov/Code/e-clinic-coda/src/components/layout/header.tsx)).
   - Setiap rute baru wajib didaftarkan pada pemetaan `ROUTE_TITLES` di `header.tsx`.

2. **Dilarang Menaruh Title Halaman di Konten Halaman**:
   - Di dalam berkas halaman (`page.tsx`) maupun komponen halaman, **KOSONGKAN / JANGAN MENARUH JUDUL HALAMAN** (misalnya `<h1>Judul Halaman</h1>`, judul banner ganda, atau sub-header yang mengulang judul navbar).
   - Area atas halaman langsung digunakan untuk **Sub-Navigation / Tabs** atau **Action Toolbar**.

3. **Hilangkan Search Bar di Navbar**:
   - Navbar (`Header`) tidak boleh memiliki search bar global agar tampilan bersih, lapang, dan fokus.
   - Fitur pencarian diletakkan secara kontekstual di dalam card toolbar halaman terkait (misal di atas tabel data).

---

## 3. Standar Keseragaman Layout Setiap Halaman

Seluruh halaman aplikasi harus memiliki layout dan ritme visual yang konsisten:

1. **Root Container**:
   - Selalu dibungkus dengan `<div className="space-y-6">` untuk menjaga jarak vertikal yang seragam.

2. **Top Bar / Toolbar Halaman**:
   - Jika halaman memiliki tab/sub-navigasi, letakkan di sebelah kiri dengan styling konsisten:
     - Tab aktif: `bg-blue-600 text-white shadow-xs font-semibold px-4 py-2 rounded-xl text-xs`.
     - Tab tidak aktif: `text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-semibold`.
     - Atau link tab bergaris bawah (`border-b-2 border-blue-600 text-blue-600`).
   - Tombol aksi utama (misal `+ Tambah ...`, `Buka ...`) diletakkan di sebelah kanan dengan tinggi `h-10` dan `rounded-xl text-xs font-semibold`.

3. **Banner Notifikasi / Alert**:
   - Notifikasi sukses: `bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl p-3.5 border text-xs sm:text-sm font-medium`.
   - Notifikasi error: `bg-rose-50 border-rose-200 text-rose-800 rounded-xl p-3.5 border text-xs sm:text-sm font-medium`.
   - Selalu sediakan tombol tutup (*Dismiss*).

4. **Kartu Ringkasan / KPI Metric Cards**:
   - Gunakan format grid: `grid grid-cols-2 md:grid-cols-4 (atau col-5) gap-3.5`.
   - Card styling: `rounded-2xl border-slate-200/80 shadow-xs bg-white p-4`.

5. **Toolbar Filter & Pencarian Tabel**:
   - Card styling: `bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3`.
   - Input pencarian di sebelah kiri (`h-9 rounded-xl text-xs`).
   - Combobox filter di sebelah kanan (`h-9 px-3 rounded-xl border-slate-200 text-xs`).

6. **Tabel Data**:
   - Container: `bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden`.
   - Header tabel: `bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase tracking-wider text-slate-500 font-semibold`.
   - Baris tabel: `hover:bg-slate-50/60 transition-colors`.

7. **Tombol Aksi Tabel (*Tactile Pill Buttons*)**:
   - Wajib menggunakan tombol pill ber-border dengan warna semantik:
     - **Edit / Ubah**: `px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs`
     - **Reset Sandi**: `px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs`
     - **Opname**: `px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs`
     - **Nonaktifkan / Hapus**: `px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs`
     - **Aktifkan**: `px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs`
     - **Disabled State**: `px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60 shadow-none`

---

## 4. Standar Tipografi & Skala Ukuran Font Seragam

Untuk memastikan antarmuka tidak berantakan dan memiliki konsistensi visual di seluruh halaman, seluruh pengembang/agen **wajib mematuhi skala tipografi baku** berikut:

### A. Font Family
- **Font Utama UI (`font-sans`)**: Digunakan untuk seluruh elemen teks aplikasi (label, tombol, judul, paragraf, input).
- **Font Monospace (`font-mono`)**: Khusus digunakan untuk nomor registrasi/rekam medis (`no_rkm_medis`), kode barang/obat (`kode_brng`), nota penjualan (`nota_jual`), jam/waktu (`HH:mm`), dan nominal angka uang Rupiah.

### B. Matriks Skala Ukuran Font & Styling Baku

| Elemen UI | Class Tailwind Baku | Warna / Styling Standar | Keterangan & Penggunaan |
| :--- | :--- | :--- | :--- |
| **Navbar Page Title** | `text-2xl font-bold tracking-tight` | `text-slate-800` | Judul aktif di Navbar Header kiri |
| **Card / Section Title** | `text-base font-bold` | `text-slate-800` / `text-slate-900` | Judul Card utama, Dialog Title |
| **Card / Section Subtitle** | `text-xs font-normal` | `text-slate-500` | Deskripsi card atau modal |
| **KPI Metric Value** | `text-2xl font-bold` | `text-slate-900` / `text-blue-600` | Angka metrik statistik KPI |
| **KPI Metric Label** | `text-xs font-medium` | `text-slate-500` | Label nama metrik di atas angka |
| **KPI Metric Footnote** | `text-[11px] font-normal` | `text-slate-400` | Keterangan kecil di bawah angka |
| **Tab / Sub-Nav Buttons** | `text-xs font-semibold` | Aktif: `text-white bg-blue-600`, Non-aktif: `text-slate-600` | Pilihan tab di top bar |
| **Primary Action Button** | `text-xs font-semibold` | `text-white bg-blue-600 h-10 px-4 rounded-xl` | Tombol `+ Tambah ...`, `Simpan` |
| **Secondary Button** | `text-xs font-semibold` | `bg-white text-slate-700 border border-slate-200 h-10 px-4 rounded-xl` | Tombol batal atau navigasi luar |
| **Table Action Pills** | `text-xs font-semibold` | `px-2.5 py-1 rounded-lg border shadow-2xs` | Tombol aksi per baris tabel |
| **Table Header (`<th>`)** | `text-xs font-semibold uppercase tracking-wider` | `text-slate-500 bg-slate-50/80` | Header setiap kolom tabel data |
| **Table Row Title (Nama)**| `text-sm font-semibold` | `text-slate-800` | Nama Pasien, Nama Obat, Pengguna |
| **Table Row Meta / Sub** | `text-xs font-normal` | `text-slate-500` | Kategori, Spesialis, Alamat |
| **Table Code / ID / Waktu**| `text-xs font-mono font-medium` | `text-slate-600` / `text-blue-600 font-bold` | No. RM, Kode Obat, Waktu Reg |
| **Table Currency (Harga)** | `text-xs font-mono font-bold` | `text-slate-800` / `text-blue-600` | Nilai Rupiah di tabel |
| **Status Badge / Pill** | `text-xs font-semibold` | `px-2.5 py-0.5 rounded-full border` | Status: Aktif, Nonaktif, Selesai |
| **Form Input Label** | `text-xs font-semibold` | `text-slate-700 block mb-1` | Label field formulir |
| **Form Input / Select Text**| `text-xs font-normal` | `text-slate-800 bg-white h-9 rounded-xl` | Teks di dalam input formulir |
| **Form Helper / Error** | `text-xs font-medium` | Error: `text-rose-500`, Helper: `text-slate-400` | Pesan validasi di bawah input |

### C. Larangan Ketat Tipografi
1. **Dilarang Menggunakan Ukuran Font Beragam untuk Komponen Serupa**:
   - Dilarang membuat tab dengan `text-sm` di satu halaman dan `text-xs` di halaman lain. Seluruh tab wajib `text-xs font-semibold`.
   - Dilarang membuat angka KPI dengan `text-xl` di satu halaman dan `text-2xl` di halaman lain. Seluruh nilai KPI wajib `text-2xl font-bold`.
2. **Dilarang Menggunakan Ukuran Lebih Besar dari `text-2xl`**:
   - Jangan menggunakan `text-3xl` atau `text-4xl` di dalam konten halaman. Hirarki paling tinggi di halaman adalah `text-2xl font-bold` (pada angka KPI) dan `text-base font-bold` (pada judul card).
3. **Warna Teks Harus Konsisten Sesuai Slate Palette**:
   - Judul & teks utama: `text-slate-900` atau `text-slate-800`.
   - Label & teks form: `text-slate-700`.
   - Deskripsi & teks sekunder: `text-slate-500`.
   - Keterangan non-kritis: `text-slate-400`.

---

## 5. Batasan & Larangan Keras (Strict Constraints)

1. **JANGAN PERNAH MENJALANKAN `git commit`**:
   - Seluruh perubahan kode harus tetap berada dalam *working tree* (unstaged/uncommitted) agar pengguna dapat memeriksa seluruh diff secara mandiri.
2. **JANGAN BUILD DOCKER PADA PERUBAHAN KODE**:
   - Aplikasi dijalankan secara lokal oleh user menggunakan `npm run dev`. Docker hanya digunakan untuk kontainer database MySQL (`e-clinic-coda-db` pada port 3306).
3. **MINIMALISASI PENGGUNAAN IKON**:
   - Jangan menambahkan ikon dekoratif yang berlebihan. Utamakan tipografi yang bersih, hierarki teks yang jelas, dan tombol pill bertekstur.
