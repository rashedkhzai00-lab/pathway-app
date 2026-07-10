import { pgTable, text, bigint } from "drizzle-orm/pg-core";

export const pinSavesTable = pgTable("pin_saves", {
  pinHash: text("pin_hash").primaryKey(),
  data: text("data").notNull().default("{}"),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
