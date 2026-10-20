export type UserRole = string;
export type UserStatus = "aktif" | "nonaktif";

export interface User {
  id: string;
  username: string;
  namaLengkap: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export interface CreateUserDTO {
  username: string;
  namaLengkap: string;
  email?: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDTO {
  namaLengkap?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

