import { Router } from "express";
import crypto from "crypto";
import { db, pinSavesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const PEPPER = process.env["PIN_PEPPER"] ?? "change-this-in-replit-secrets";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function rateLimit(
  req: Parameters<Parameters<typeof router.post>[1]>[0],
  res: Parameters<Parameters<typeof router.post>[1]>[1],
  next: Parameters<Parameters<typeof router.post>[1]>[2],
) {
  const ip = req.ip ?? "unknown";
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  if (record.count >= MAX_ATTEMPTS) {
    return void res.status(429).json({ error: "Too many attempts. Try again in a bit." });
  }
  record.count++;
  next();
}

function hashPin(pin: string) {
  return crypto.createHash("sha256").update(pin + PEPPER).digest("hex");
}

function isValidPin(pin: unknown): pin is string {
  return typeof pin === "string" && /^\d{4}$/.test(pin);
}

router.post("/pin/check", async (req, res) => {
  const { pin } = req.body as { pin?: unknown };
  if (!isValidPin(pin)) return void res.status(400).json({ error: "PIN must be exactly 4 digits." });
  const [row] = await db.select().from(pinSavesTable).where(eq(pinSavesTable.pinHash, hashPin(pin)));
  res.json({ available: !row });
});

router.post("/pin/create", async (req, res) => {
  const { pin, data } = req.body as { pin?: unknown; data?: unknown };
  if (!isValidPin(pin)) return void res.status(400).json({ error: "PIN must be exactly 4 digits." });
  const hash = hashPin(pin);
  const [existing] = await db.select().from(pinSavesTable).where(eq(pinSavesTable.pinHash, hash));
  if (existing) return void res.status(409).json({ error: "That PIN is already taken. Please choose another." });
  await db.insert(pinSavesTable).values({ pinHash: hash, data: JSON.stringify(data ?? {}), updatedAt: Date.now() });
  res.json({ ok: true });
});

router.post("/pin/save", rateLimit, async (req, res) => {
  const { pin, data } = req.body as { pin?: unknown; data?: unknown };
  if (!isValidPin(pin)) return void res.status(400).json({ error: "PIN must be exactly 4 digits." });
  const hash = hashPin(pin);
  const [existing] = await db.select().from(pinSavesTable).where(eq(pinSavesTable.pinHash, hash));
  if (!existing) return void res.status(404).json({ error: "No save found for that PIN." });
  await db.update(pinSavesTable).set({ data: JSON.stringify(data ?? {}), updatedAt: Date.now() }).where(eq(pinSavesTable.pinHash, hash));
  res.json({ ok: true });
});

router.post("/pin/restore", rateLimit, async (req, res) => {
  const { pin } = req.body as { pin?: unknown };
  if (!isValidPin(pin)) return void res.status(400).json({ error: "PIN must be exactly 4 digits." });
  const [row] = await db.select().from(pinSavesTable).where(eq(pinSavesTable.pinHash, hashPin(pin)));
  if (!row) return void res.status(404).json({ error: "No save found for that PIN." });
  res.json({ data: JSON.parse(row.data) as unknown, updatedAt: row.updatedAt });
});

router.post("/pin/delete", rateLimit, async (req, res) => {
  const { pin } = req.body as { pin?: unknown };
  if (!isValidPin(pin)) return void res.status(400).json({ error: "PIN must be exactly 4 digits." });
  const hash = hashPin(pin);
  const [existing] = await db.select().from(pinSavesTable).where(eq(pinSavesTable.pinHash, hash));
  if (!existing) return void res.status(404).json({ error: "No save found for that PIN." });
  await db.delete(pinSavesTable).where(eq(pinSavesTable.pinHash, hash));
  res.json({ ok: true });
});

export default router;
