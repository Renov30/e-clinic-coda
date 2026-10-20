"use server";

import { userService } from "./service";
import { CreateUserDTO, UpdateUserDTO } from "./types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(formData: { username: string; password: string }) {
  const result = await userService.login(formData.username, formData.password);
  if (result.success) {
    revalidatePath("/", "layout");
  }
  return result;
}

export async function logoutAction() {
  await userService.logout();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUsersAction() {
  return await userService.getUsers();
}

export async function createUserAction(dto: CreateUserDTO) {
  const result = await userService.createUser(dto);
  if (result.success) {
    revalidatePath("/users");
  }
  return result;
}

export async function updateUserAction(id: string, dto: UpdateUserDTO) {
  const result = await userService.updateUser(id, dto);
  if (result.success) {
    revalidatePath("/users");
  }
  return result;
}

export async function toggleUserStatusAction(id: string) {
  const result = await userService.toggleStatus(id);
  if (result.success) {
    revalidatePath("/users");
  }
  return result;
}

export async function resetUserPasswordAction(id: string, newPass: string) {
  const result = await userService.resetPassword(id, newPass);
  if (result.success) {
    revalidatePath("/users");
  }
  return result;
}

export async function deleteUserAction(id: string) {
  const result = await userService.deleteUser(id);
  if (result.success) {
    revalidatePath("/users");
  }
  return result;
}

