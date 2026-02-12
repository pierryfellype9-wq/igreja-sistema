import bcrypt from "bcrypt";
import * as db from "./db";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createUser(
  email: string,
  password: string,
  name?: string,
  role: "admin" | "member" = "member"
) {
  const existingUser = await db.getInternalUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await hashPassword(password);
  return await db.createInternalUser({
    email,
    passwordHash,
    name,
    role,
    isActive: true,
  });
}

export async function authenticateUser(
  email: string,
  password: string
) {
  const user = await db.getInternalUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive");
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  return user;
}

export async function updateUserPassword(
  userId: number,
  newPassword: string
) {
  const passwordHash = await hashPassword(newPassword);
  return await db.updateInternalUser(userId, { passwordHash });
}
