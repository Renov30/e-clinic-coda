"use client";

// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import React, { useState, useTransition } from "react";
import {
  Users,
  UserPlus,
  ClipboardList,
  CalendarCheck,
  Search,
  Plus,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Patient,
  VisitRegistration,
  DoctorOption,
  PoliOption,
  PenjabOption,
} from "@/modules/patient-registration/types";
import {
  registerPatientAction,
  registerVisitAction,
  searchPatientsAction,
} from "@/modules/patient-registration/actions";
import { formatCurrency } from "@/lib/utils";

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
interface PatientManagementProps {
  initialPatients: Patient[];
  initialVisits: VisitRegistration[];
  doctors: DoctorOption[];
  poliklinik: PoliOption[];
  penjab: PenjabOption[];
  nextNoRm: string;
}

// ==========================================
// 3. MAIN COMPONENT (PatientManagement)
// ==========================================
export function PatientManagement({
  initialPatients,
  initialVisits,
  doctors,
  poliklinik,
  penjab,
  nextNoRm,
}: PatientManagementProps) {
  // ----------------------------------------
  // 3.1 State & Hooks
  // ----------------------------------------
  const [activeTab, setActiveTab] = useState<
    "visits_today" | "register_visit" | "patient_list" | "new_patient"
  >("visits_today");

  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [visits, setVisits] = useState<VisitRegistration[]>(initialVisits);
  const [patientSearch, setPatientSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Registration Modal Ticket State
  const [lastRegisteredVisit, setLastRegisteredVisit] = useState<VisitRegistration | null>(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  // Success & Error feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State: Registrasi Kunjungan
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    initialPatients.length > 0 ? initialPatients[0] : null
  );
  const [selectedPoli, setSelectedPoli] = useState<string>(
    poliklinik.length > 0 ? poliklinik[0].kdPoli : ""
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    doctors.length > 0 ? doctors[0].kdDokter : ""
  );
  const [selectedPenjab, setSelectedPenjab] = useState<string>(
    penjab.length > 0 ? penjab[0].kdPj : "A01"
  );

  // Form State: Pasien Baru
  const [newPatientForm, setNewPatientForm] = useState({
    nmPasien: "",
    noKtp: "",
    jk: "L" as "L" | "P",
    tmpLahir: "",
    tglLahir: "1990-01-01",
    alamat: "",
    golDarah: "-" as "A" | "B" | "AB" | "O" | "-",
    noTlp: "",
    kdPj: "A01",
  });

  // Search patients dynamically
  const handleSearchPatient = (query: string) => {
    setPatientSearch(query);
    startTransition(async () => {
      const results = await searchPatientsAction(query);
      setPatients(results);
    });
  };

  // Submit Registrasi Kunjungan
  const handleRegisterVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setErrorMsg("Silakan pilih pasien yang akan didaftarkan kunjungan.");
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetPoli = poliklinik.find((p) => p.kdPoli === selectedPoli);
    const biaya = targetPoli ? targetPoli.registrasi : 25000;

    startTransition(async () => {
      const res = await registerVisitAction({
        noRkmMedis: selectedPatient.noRkmMedis,
        kdPoli: selectedPoli,
        kdDokter: selectedDoctor,
        kdPj: selectedPenjab,
        biayaReg: biaya,
      });

      if (res.success && res.data) {
        setVisits((prev) => [res.data!, ...prev]);
        setLastRegisteredVisit(res.data);
        setIsTicketOpen(true);
        setSuccessMsg(`Pasien ${res.data.nmPasien} berhasil didaftarkan ke ${res.data.nmPoli}!`);
        setActiveTab("visits_today");
      } else {
        setErrorMsg(res.error || "Gagal mendaftarkan kunjungan.");
      }
    });
  };

  // Submit Pasien Baru
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await registerPatientAction(newPatientForm);
      if (res.success && res.data) {
        setPatients((prev) => [res.data!, ...prev]);
        setSelectedPatient(res.data);
        setSuccessMsg(`Pasien baru ${res.data.nmPasien} (No. RM: ${res.data.noRkmMedis}) berhasil terdaftar!`);
        // Reset form
        setNewPatientForm({
          nmPasien: "",
          noKtp: "",
          jk: "L",
          tmpLahir: "",
          tglLahir: "1990-01-01",
          alamat: "",
          golDarah: "-",
          noTlp: "",
          kdPj: "A01",
        });
        setActiveTab("register_visit");
      } else {
        setErrorMsg(res.error || "Gagal mendaftarkan pasien baru.");
      }
    });
  };

  const selectedPoliData = poliklinik.find((p) => p.kdPoli === selectedPoli);

  return (
    <div className="space-y-6">
      {/* Tab Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("visits_today");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "visits_today"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Kunjungan Hari Ini</span>
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                activeTab === "visits_today"
                  ? "bg-blue-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {visits.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("register_visit");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "register_visit"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Registrasi Rawat Jalan</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("patient_list");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "patient_list"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Database Pasien</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("new_patient");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "new_patient"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Pasien Baru (RM)</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: Kunjungan Hari Ini */}
      {activeTab === "visits_today" && (
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Antrean & Kunjungan Rawat Jalan Hari Ini</CardTitle>
              <CardDescription>
                Daftar antrean dan jadwal kunjungan pasien klinik hari ini.
              </CardDescription>
            </div>
            <Button
              onClick={() => setActiveTab("register_visit")}
              className="rounded-xl flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Daftarkan Pasien Baru</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {visits.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada pendaftaran pasien rawat jalan untuk hari ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-y border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5">Antrean</th>
                      <th className="py-3 px-5">No. Rawat</th>
                      <th className="py-3 px-5">Pasien (No. RM)</th>
                      <th className="py-3 px-5">Poli Tujuan</th>
                      <th className="py-3 px-5">Dokter DPJP</th>
                      <th className="py-3 px-5">Penjamin</th>
                      <th className="py-3 px-5">Jam Reg</th>
                      <th className="py-3 px-5">Status Periksa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visits.map((v) => (
                      <tr key={v.noRawat} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-blue-600 text-base">
                          {v.noReg}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                          {v.noRawat}
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-slate-800">{v.nmPasien}</p>
                          <p className="text-xs text-slate-400 font-mono">RM: {v.noRkmMedis}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-medium text-slate-700">{v.nmPoli}</span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-700">{v.nmDokter}</td>
                        <td className="py-3.5 px-5 text-xs text-slate-600">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                            {v.pngJawab}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-slate-500 font-mono">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{v.jamReg}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusBadge status={v.stts} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Form Registrasi Rawat Jalan */}
      {activeTab === "register_visit" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sisi Kiri: Pencarian & Pemilihan Pasien */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. Pilih Pasien</CardTitle>
              <CardDescription>Cari pasien lama berdasarkan Nama, No. RM, atau NIK</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ketik nama / RM / NIK..."
                  value={patientSearch}
                  onChange={(e) => handleSearchPatient(e.target.value)}
                  className="pl-10 h-10 rounded-xl"
                />
              </div>

              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                {patients.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Pasien tidak ditemukan.</p>
                ) : (
                  patients.map((p) => {
                    const isSelected = selectedPatient?.noRkmMedis === p.noRkmMedis;
                    return (
                      <div
                        key={p.noRkmMedis}
                        onClick={() => setSelectedPatient(p)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60"
                            : "border-transparent hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-slate-800">{p.nmPasien}</p>
                          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            RM: {p.noRkmMedis}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {p.jk === "L" ? "Laki-laki" : "Perempuan"} • Lahir: {p.tglLahir}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{p.alamat}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("new_patient")}
                  className="w-full rounded-xl text-xs flex items-center justify-center space-x-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Pasien Belum Terdaftar? Buat RM Baru</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sisi Kanan: Form Detail Kunjungan */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2. Form Pendaftaran Kunjungan & Poli</CardTitle>
              <CardDescription>
                Pilih poliklinik, dokter yang bertugas, dan skema pembayaran pasien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <form onSubmit={handleRegisterVisit} className="space-y-5">
                  {/* Selected Patient Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        Pasien Terpilih
                      </span>
                      <h4 className="text-base font-bold text-slate-800">{selectedPatient.nmPasien}</h4>
                      <p className="text-xs text-slate-500">
                        No. RM: <b className="font-mono">{selectedPatient.noRkmMedis}</b> | NIK:{" "}
                        {selectedPatient.noKtp || "-"} | Kontak: {selectedPatient.noTlp || "-"}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      Terverifikasi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Poliklinik Tujuan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedPoli}
                        onChange={(e) => setSelectedPoli(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {poliklinik.map((pol) => (
                          <option key={pol.kdPoli} value={pol.kdPoli}>
                            {pol.nmPoli} (Biaya: {formatCurrency(pol.registrasi)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Dokter Penanggung Jawab (DPJP) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {doctors.map((doc) => (
                          <option key={doc.kdDokter} value={doc.kdDokter}>
                            {doc.nmDokter}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Metode Pembayaran / Asuransi <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedPenjab}
                        onChange={(e) => setSelectedPenjab(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {penjab.map((pj) => (
                          <option key={pj.kdPj} value={pj.kdPj}>
                            {pj.pngJawab}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Biaya Registrasi
                      </label>
                      <div className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center text-sm font-semibold text-slate-700">
                        {formatCurrency(selectedPoliData?.registrasi || 25000)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center space-x-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{isPending ? "Mendaftarkan..." : "Daftarkan & Buat Tiket Antrean"}</span>
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  Silakan pilih salah satu pasien di kolom sebelah kiri terlebih dahulu.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Database Pasien */}
      {activeTab === "patient_list" && (
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-lg">Database Rekam Medis Pasien</CardTitle>
              <CardDescription>
                Daftar data rekam medis pasien terdaftar di klinik.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari pasien / NIK..."
                  value={patientSearch}
                  onChange={(e) => handleSearchPatient(e.target.value)}
                  className="pl-9 h-9 rounded-xl text-xs"
                />
              </div>
              <Button
                onClick={() => setActiveTab("new_patient")}
                className="h-9 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                + Pasien Baru
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-y border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">No. RM</th>
                    <th className="py-3 px-5">Nama Pasien</th>
                    <th className="py-3 px-5">NIK / KTP</th>
                    <th className="py-3 px-5">JK</th>
                    <th className="py-3 px-5">Tgl Lahir</th>
                    <th className="py-3 px-5">No. Telepon</th>
                    <th className="py-3 px-5">Alamat</th>
                    <th className="py-3 px-5">Penjamin</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p.noRkmMedis} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-5 font-mono font-bold text-blue-600 text-xs">
                        {p.noRkmMedis}
                      </td>
                      <td className="py-3 px-5 font-semibold text-slate-800">{p.nmPasien}</td>
                      <td className="py-3 px-5 font-mono text-xs text-slate-500">
                        {p.noKtp || "-"}
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-600">
                        {p.jk === "L" ? "Laki-laki" : "Perempuan"}
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-600">{p.tglLahir}</td>
                      <td className="py-3 px-5 text-xs text-slate-600">{p.noTlp || "-"}</td>
                      <td className="py-3 px-5 text-xs text-slate-600 max-w-[200px] truncate">
                        {p.alamat}
                      </td>
                      <td className="py-3 px-5 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {p.pngJawab || "Umum"}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPatient(p);
                            setActiveTab("register_visit");
                          }}
                          className="h-8 px-3 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-colors shadow-2xs"
                        >
                          Daftar Kunjungan
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: Registrasi Pasien Baru */}
      {activeTab === "new_patient" && (
        <Card className="max-w-3xl rounded-2xl border-slate-200/80 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Formulir Rekam Medis Pasien Baru</CardTitle>
                <CardDescription>
                  Lengkapi data pasien untuk pendaftaran nomor rekam medis baru.
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">No. RM Berikutnya</span>
                <span className="text-base font-bold font-mono text-blue-600">{nextNoRm}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nama Lengkap Pasien <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="cth. Riko Tanaka"
                  value={newPatientForm.nmPasien}
                  onChange={(e) =>
                    setNewPatientForm({ ...newPatientForm, nmPasien: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Nomor NIK / KTP (16 Digit)
                  </label>
                  <Input
                    maxLength={16}
                    placeholder="3171xxxxxxxxxxxx"
                    value={newPatientForm.noKtp}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, noKtp: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newPatientForm.jk}
                    onChange={(e) =>
                      setNewPatientForm({
                        ...newPatientForm,
                        jk: e.target.value as "L" | "P",
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Tempat Lahir
                  </label>
                  <Input
                    placeholder="cth. Jakarta"
                    value={newPatientForm.tmpLahir}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, tmpLahir: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Tanggal Lahir <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="date"
                    required
                    value={newPatientForm.tglLahir}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, tglLahir: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    No. Telepon / WhatsApp
                  </label>
                  <Input
                    placeholder="cth. 081234567890"
                    value={newPatientForm.noTlp}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, noTlp: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Golongan Darah
                  </label>
                  <select
                    value={newPatientForm.golDarah}
                    onChange={(e) =>
                      setNewPatientForm({
                        ...newPatientForm,
                        golDarah: e.target.value as "A" | "B" | "AB" | "O" | "-",
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="-">- Tidak Tahu -</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Alamat Lengkap <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan"
                  value={newPatientForm.alamat}
                  onChange={(e) =>
                    setNewPatientForm({ ...newPatientForm, alamat: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("visits_today")}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isPending ? "Menyimpan..." : "Simpan Pasien & Buat Rekam Medis"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modal Tiket Antrean Kunjungan */}
      <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-bold">Bukti Registrasi & Nomor Antrean</DialogTitle>
          </DialogHeader>
          {lastRegisteredVisit && (
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 space-y-4 text-center">
              <div>
                <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                  Nomor Antrean
                </span>
                <div className="text-4xl font-extrabold text-blue-600 my-1">
                  {lastRegisteredVisit.noReg}
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {lastRegisteredVisit.nmPoli}
                </span>
              </div>

              <div className="text-left text-xs space-y-1.5 border-t border-b border-slate-200 py-3 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Rawat:</span>
                  <span className="font-bold text-slate-800">{lastRegisteredVisit.noRawat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pasien:</span>
                  <span className="font-bold text-slate-800">
                    {lastRegisteredVisit.nmPasien} ({lastRegisteredVisit.noRkmMedis})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dokter DPJP:</span>
                  <span className="text-slate-800">{lastRegisteredVisit.nmDokter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penjamin:</span>
                  <span className="text-slate-800">{lastRegisteredVisit.pngJawab}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Biaya Reg:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(lastRegisteredVisit.biayaReg)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Harap menunggu di ruang tunggu poliklinik hingga nomor antrean Anda dipanggil.
              </p>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
              className="flex items-center space-x-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Tiket</span>
            </Button>
            <Button
              type="button"
              onClick={() => setIsTicketOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
