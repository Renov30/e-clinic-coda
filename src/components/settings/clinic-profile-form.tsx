"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clinicProfileSchema,
  ClinicProfileFormValues,
} from "@/lib/validations/clinic-config";
import { updateClinicConfigAction } from "@/modules/clinic-config/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Save, RotateCcw } from "lucide-react";
import { ClinicConfig } from "@/modules/clinic-config/types";

interface ClinicProfileFormProps {
  initialConfig: ClinicConfig;
}

export function ClinicProfileForm({ initialConfig }: ClinicProfileFormProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClinicProfileFormValues>({
    resolver: zodResolver(clinicProfileSchema),
    defaultValues: {
      namaKlinik: initialConfig.namaKlinik || "",
      alamat: initialConfig.alamat || "",
      kotaKabupaten: initialConfig.kotaKabupaten || "",
      propinsi: initialConfig.propinsi || "",
      telepon: initialConfig.telepon || "",
      email: initialConfig.email || "",
      logoUrl: initialConfig.logoUrl || "",
      izinOperasional: initialConfig.izinOperasional || "",
      catatanKuitansi: initialConfig.catatanKuitansi || "",
    },
  });

  const onSubmit = async (values: ClinicProfileFormValues) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await updateClinicConfigAction(values);
      if (res.success) {
        setSuccessMessage("Pengaturan profil instansi klinik berhasil diperbarui.");
        reset(values); // reset form dirty state with new values
      } else {
        setErrorMessage(res.error || "Gagal menyimpan perubahan profil klinik.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan jaringan atau server saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl rounded-2xl border-slate-100 shadow-xs">
      <CardHeader>
        <CardTitle>Identitas & Pengaturan Instansi</CardTitle>
        <CardDescription>
          Informasi ini akan muncul pada header aplikasi, kartu berobat, laporan medis,
          struk pembayaran, dan kuitansi pasien. Konfigurasi tersimpan dinamis dan tidak di-hardcode.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Notification alerts */}
          {successMessage && (
            <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Nama Klinik / Instansi <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register("namaKlinik")}
                placeholder="cth. Smile360 Dental & Medical Clinic"
              />
              {errors.namaKlinik && (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  {errors.namaKlinik.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Alamat Lengkap <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register("alamat")}
                placeholder="cth. Jl. Kesehatan Raya No. 108"
              />
              {errors.alamat && (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  {errors.alamat.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Kota / Kabupaten
                </label>
                <Input
                  {...register("kotaKabupaten")}
                  placeholder="cth. Jakarta Selatan"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Provinsi
                </label>
                <Input
                  {...register("propinsi")}
                  placeholder="cth. DKI Jakarta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nomor Telepon / Kontak <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("telepon")}
                  placeholder="cth. (021) 7890-1234"
                />
                {errors.telepon && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">
                    {errors.telepon.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Email Resmi <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("email")}
                  placeholder="cth. care@smile360clinic.com"
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nomor Izin Operasional
                </label>
                <Input
                  {...register("izinOperasional")}
                  placeholder="cth. 445/092/DINKES/2023"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  URL / Path Logo Instansi (Opsional)
                </label>
                <Input
                  {...register("logoUrl")}
                  placeholder="cth. /logo-klinik.png"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Catatan Footer Kuitansi / Struk Resep
              </label>
              <textarea
                {...register("catatanKuitansi")}
                rows={3}
                placeholder="cth. Terima kasih atas kepercayaan Anda. Semoga lekas sembuh."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-5">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || isSubmitting}
            onClick={() => reset()}
            className="rounded-xl flex items-center space-x-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Perubahan</span>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

