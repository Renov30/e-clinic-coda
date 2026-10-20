import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { roleService } from "@/modules/roles/service";
import { RoleManagement } from "@/components/roles/role-management";

export const metadata = {
  title: "Peran & Hak Akses | e-clinic-coda",
  description: "Kelola peran staf, wewenang modul, dan hak akses sistem",
};

export default async function RolesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Hanya Administrator yang berhak mengonfigurasi peran dan wewenang
  if (session.role !== "admin") {
    redirect("/");
  }

  const roles = await roleService.getRoles();

  return (
    <div className="w-full">
      <RoleManagement initialRoles={roles} />
    </div>
  );
}

