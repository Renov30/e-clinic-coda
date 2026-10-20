import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/modules/users/service";
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

  const users = await userService.getUsers();

  return (
    <div className="w-full">
      <UserManagement
        initialUsers={users}
        currentUserId={session.userId}
      />
    </div>
  );
}

