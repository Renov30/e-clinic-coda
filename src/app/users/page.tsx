import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/modules/users/service";
import { roleService } from "@/modules/roles/service";
import { UserManagement } from "@/components/users/user-management";

export const metadata = {
  title: "Manajemen Pengguna & Akses | e-clinic-coda",
  description: "Pengelolaan akun petugas, dokter, dan staf klinik",
};

export default async function UsersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Hanya role admin yang berhak mengakses halaman manajemen pengguna
  if (session.role !== "admin") {
    redirect("/");
  }

  const [users, roles] = await Promise.all([
    userService.getUsers(),
    roleService.getRoles(),
  ]);

  return (
    <div className="w-full">
      <UserManagement
        initialUsers={users}
        availableRoles={roles}
        currentUserId={session.userId}
      />
    </div>
  );
}

