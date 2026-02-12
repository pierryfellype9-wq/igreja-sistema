import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, visitors, prayerRequests, raffles, raffleParticipants, announcements, schedules, files, accessPasswords, internalUsers } from "../drizzle/schema";
import { InsertVisitor, InsertPrayerRequest, InsertRaffle, InsertRaffleParticipant, InsertAnnouncement, InsertSchedule, InsertFile, InsertInternalUser } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Visitantes
export async function createVisitor(visitor: InsertVisitor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(visitors).values(visitor);
  return result;
}

export async function getVisitors() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(visitors).orderBy((v) => v.createdAt);
}

// Pedidos de Oração
export async function createPrayerRequest(request: InsertPrayerRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(prayerRequests).values(request);
}

export async function getPrayerRequests() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(prayerRequests).orderBy((p) => p.createdAt);
}

// Sorteios
export async function createRaffle(raffle: InsertRaffle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(raffles).values(raffle);
}

export async function getRaffles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(raffles).orderBy((r) => r.createdAt);
}

export async function getRaffleById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(raffles).where(eq(raffles.id, id)).limit(1);
  return result[0];
}

export async function createRaffleParticipant(participant: InsertRaffleParticipant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(raffleParticipants).values(participant);
}

export async function getRaffleParticipants(raffleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(raffleParticipants).where(eq(raffleParticipants.raffleId, raffleId)).orderBy((p) => p.createdAt);
}

// Avisos
export async function createAnnouncement(announcement: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(announcements).values(announcement);
}

export async function getAnnouncements() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(announcements).orderBy((a) => a.createdAt);
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(announcements).where(eq(announcements.id, id));
}

// Escalas
export async function createSchedule(schedule: InsertSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(schedules).values(schedule);
}

export async function getSchedules() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(schedules).orderBy((s) => s.createdAt);
}

export async function deleteSchedule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(schedules).where(eq(schedules.id, id));
}

// Arquivos
export async function createFile(file: InsertFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(files).values(file);
}

export async function getFiles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(files).orderBy((f) => f.createdAt);
}

export async function deleteFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(files).where(eq(files.id, id));
}

// Senhas de Acesso
export async function getAccessPassword(panelType: 'visitors' | 'prayers' | 'raffles') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(accessPasswords).where(eq(accessPasswords.panelType, panelType)).limit(1);
  return result[0];
}

export async function setAccessPassword(panelType: 'visitors' | 'prayers' | 'raffles', password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getAccessPassword(panelType);
  if (existing) {
    return await db.update(accessPasswords).set({ password }).where(eq(accessPasswords.panelType, panelType));
  } else {
    return await db.insert(accessPasswords).values({ panelType, password });
  }
}



// Usuarios Internos
export async function createInternalUser(user: InsertInternalUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(internalUsers).values(user);
}

export async function getInternalUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(internalUsers).where(eq(internalUsers.email, email)).limit(1);
  return result[0];
}

export async function getInternalUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(internalUsers).orderBy((u) => u.createdAt);
}

export async function updateInternalUser(id: number, updates: Partial<InsertInternalUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(internalUsers).set(updates).where(eq(internalUsers.id, id));
}

export async function deleteInternalUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(internalUsers).where(eq(internalUsers.id, id));
}
