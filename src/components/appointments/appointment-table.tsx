"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface AppointmentRecord {
  id: string;
  patientName: string;
  gender: "Male" | "Female";
  age: number;
  date: string;
  time: string;
  diagnosis: string;
  status: "Confirmed" | "Cancelled" | "Pending";
}

const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: "apt-1",
    patientName: "Riko Tanaka",
    gender: "Female",
    age: 21,
    date: "2024.02.19",
    time: "9:30-10:30",
    diagnosis: "Root Canal Treatment",
    status: "Confirmed",
  },
  {
    id: "apt-2",
    patientName: "Akiko Takahashi",
    gender: "Male",
    age: 38,
    date: "2024.02.20",
    time: "13:00-14:00",
    diagnosis: "Scaling",
    status: "Confirmed",
  },
  {
    id: "apt-3",
    patientName: "Hiroki Kimura",
    gender: "Male",
    age: 29,
    date: "2024.02.21",
    time: "11:00-12:00",
    diagnosis: "Consultation",
    status: "Confirmed",
  },
  {
    id: "apt-4",
    patientName: "Asami Kondo",
    gender: "Female",
    age: 36,
    date: "2024.02.22",
    time: "09:00-10:30",
    diagnosis: "Root Canal Treatment",
    status: "Confirmed",
  },
  {
    id: "apt-5",
    patientName: "Miko Suzuki",
    gender: "Female",
    age: 19,
    date: "2024.02.23",
    time: "14:00-15:30",
    diagnosis: "Wisdom Tooth Removal",
    status: "Confirmed",
  },
  {
    id: "apt-6",
    patientName: "Peter Nakamura",
    gender: "Male",
    age: 42,
    date: "2024.02.24",
    time: "10:00-11:00",
    diagnosis: "Consultation",
    status: "Cancelled",
  },
  {
    id: "apt-7",
    patientName: "Izumi Yoshida",
    gender: "Male",
    age: 33,
    date: "2024.02.24",
    time: "14:00-15:00",
    diagnosis: "Consultation",
    status: "Confirmed",
  },
  {
    id: "apt-8",
    patientName: "John Cooper",
    gender: "Male",
    age: 51,
    date: "2024.02.25",
    time: "11:00-12:00",
    diagnosis: "Bleaching",
    status: "Confirmed",
  },
  {
    id: "apt-9",
    patientName: "Kazumi Yamada",
    gender: "Female",
    age: 27,
    date: "2024.02.25",
    time: "15:00-16:00",
    diagnosis: "Scaling",
    status: "Cancelled",
  },
];

export function AppointmentTable() {
  const [data, setData] = useState<AppointmentRecord[]>(INITIAL_APPOINTMENTS);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [activePeriod, setActivePeriod] = useState<"Weekly" | "Monthly" | "Yearly">("Weekly");
  const [dateRangeText, setDateRangeText] = useState("Feb 19 – 25, 2024");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for adding an appointment
  const [newPatient, setNewPatient] = useState({
    patientName: "",
    gender: "Female" as "Male" | "Female",
    age: 25,
    date: "2024.02.26",
    time: "10:00-11:00",
    diagnosis: "Pemeriksaan Rutin",
  });

  const columns = useMemo<ColumnDef<AppointmentRecord>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            aria-label="Pilih semua baris"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            aria-label="Pilih baris"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "patientName",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>Patient Name</span>
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="font-medium text-slate-800">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "gender",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>Gender</span>
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="text-slate-600">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "age",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>Age</span>
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="text-slate-600">{info.getValue() as number}</span>
        ),
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>Date</span>
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="text-slate-600">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "time",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>Time</span>
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="text-slate-600">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "diagnosis",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>Diagnosis</span>
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="text-slate-700">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>Status</span>
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
          </button>
        ),
        cell: (info) => {
          const status = info.getValue() as "Confirmed" | "Cancelled" | "Pending";
          return <StatusBadge status={status} />;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.patientName.trim()) return;

    const newRecord: AppointmentRecord = {
      id: `apt-${Date.now()}`,
      patientName: newPatient.patientName,
      gender: newPatient.gender,
      age: Number(newPatient.age),
      date: newPatient.date,
      time: newPatient.time,
      diagnosis: newPatient.diagnosis,
      status: "Confirmed",
    };

    setData((prev) => [newRecord, ...prev]);
    setIsDialogOpen(false);
    setNewPatient({
      patientName: "",
      gender: "Female",
      age: 25,
      date: "2024.02.26",
      time: "10:00-11:00",
      diagnosis: "Pemeriksaan Rutin",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Toolbar: Date picker, + Add Appointment button, Period Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDateRangeText("Feb 12 – 18, 2024")}
            aria-label="Minggu Sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="px-3 py-1.5 text-sm font-semibold text-slate-800 select-none">
            {dateRangeText}
          </div>
          <button
            onClick={() => setDateRangeText("Feb 26 – Mar 03, 2024")}
            aria-label="Minggu Berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right Action & Period Switcher */}
        <div className="flex items-center space-x-6">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs flex items-center space-x-2"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Appointment</span>
          </Button>

          {/* Period switcher */}
          <div className="flex items-center space-x-4 text-sm font-medium">
            {(["Weekly", "Monthly", "Yearly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`transition-colors py-1 relative ${
                  activePeriod === period
                    ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TanStack Table Card */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-slate-100 bg-white"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-4 px-6 text-slate-700">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Tambah Janji Temu / Registrasi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAppointment} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Nama Pasien <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                placeholder="cth. Riko Tanaka"
                value={newPatient.patientName}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, patientName: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Jenis Kelamin
                </label>
                <select
                  value={newPatient.gender}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      gender: e.target.value as "Male" | "Female",
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Usia
                </label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={newPatient.age}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Tanggal
                </label>
                <Input
                  type="text"
                  placeholder="2024.02.26"
                  value={newPatient.date}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Jam Kunjungan
                </label>
                <Input
                  type="text"
                  placeholder="10:00-11:00"
                  value={newPatient.time}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, time: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Keluhan / Tindakan
              </label>
              <Input
                placeholder="cth. Root Canal Treatment / Konsultasi"
                value={newPatient.diagnosis}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, diagnosis: e.target.value })
                }
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Simpan Janji Temu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
