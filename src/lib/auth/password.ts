import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function comparePassword(
  plainText: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainText, hashedPassword);
}

