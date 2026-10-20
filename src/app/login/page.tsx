import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { clinicConfigService } from "@/modules/clinic-config/service";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "Masuk ke Sistem | e-clinic-coda",
  description: "Halaman autentikasi dan masuk pengguna klinik terpadu",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const config = await clinicConfigService.getClinicProfile();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <LoginForm clinicName={config.namaKlinik || "Smile360 Clinic"} />
    </div>
  );
}

