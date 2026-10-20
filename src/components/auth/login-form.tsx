"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { loginAction } from "@/modules/users/actions";

interface LoginFormProps {
  clinicName: string;
}

export function LoginForm({ clinicName }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await loginAction({ username, password });
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal masuk ke sistem.");
      }
    });
  };

  const fillQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-2">
            <HeartPulse className="h-8 w-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            {clinicName}
          </h1>
          <p className="text-sm text-slate-500">
            Masuk ke portal operasional manajemen klinik terpadu
          </p>
        </div>

        {/* Login Card */}
        <Card className="rounded-3xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center space-x-2 mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Access Card */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Shield className="h-3.5 w-3.5 text-blue-600" />
                <span>Pilih Akun Cepat (Akses Peran)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillQuickLogin("admin", "admin123")}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition-all"
                >
                  <p className="font-bold text-slate-800">Admin</p>
                  <p className="text-[11px] text-slate-500 font-mono">admin / admin123</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickLogin("dr.shin", "shin123")}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition-all"
                >
                  <p className="font-bold text-slate-800">Dokter DPJP</p>
                  <p className="text-[11px] text-slate-500 font-mono">dr.shin / shin123</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickLogin("registrasi", "reg123")}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition-all"
                >
                  <p className="font-bold text-slate-800">Pendaftaran</p>
                  <p className="text-[11px] text-slate-500 font-mono">registrasi / reg123</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickLogin("apotek", "farmasi123")}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition-all"
                >
                  <p className="font-bold text-slate-800">Farmasi / Kasir</p>
                  <p className="text-[11px] text-slate-500 font-mono">apotek / farmasi123</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Sistem Informasi Klinik e-clinic-coda • Akses Terautentikasi & Aman
        </p>
      </div>
    </div>
  );
}

