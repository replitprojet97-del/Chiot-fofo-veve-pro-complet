import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const puppyStatusEnum = pgEnum("puppy_status", ["available", "reserved", "sold"]);
export const puppyColorEnum = pgEnum("puppy_color", ["bleu merle", "rouge merle", "noir tricolore", "rouge tricolore"]);
export const puppySexEnum = pgEnum("puppy_sex", ["Mâle", "Femelle"]);

export const puppiesTable = pgTable("puppies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ageWeeks: integer("age_weeks").notNull(),
  color: puppyColorEnum("color").notNull(),
  sex: puppySexEnum("sex").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull().default(""),
  traits: text("traits").array().notNull().default([]),
  parents: text("parents").notNull().default(""),
  images: text("images").array().notNull().default([]),
  status: puppyStatusEnum("status").notNull().default("available"),
  reservedFor: text("reserved_for"),
  isPremium: boolean("is_premium").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPuppySchema = createInsertSchema(puppiesTable).omit({ id: true, createdAt: true });
export const selectPuppySchema = createSelectSchema(puppiesTable);

export type InsertPuppy = z.infer<typeof insertPuppySchema>;
export type Puppy = typeof puppiesTable.$inferSelect;
