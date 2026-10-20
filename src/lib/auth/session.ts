import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface UserSessionPayload {
  userId: string;
  username: string;
  namaLengkap: string;
  role: "admin" | "dokter" | "pendaftaran" | "farmasi";
}

export const SESSION_COOKIE_NAME = "coda_session";
const SESSION_SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "e-clinic-coda-super-secure-jwt-secret-key-32chars"
);

export async function createSessionToken(payload: UserSessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SESSION_SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET_KEY);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      namaLengkap: payload.namaLengkap as string,
      role: payload.role as "admin" | "dokter" | "pendaftaran" | "farmasi",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

