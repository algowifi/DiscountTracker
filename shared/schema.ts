import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  originalPrice: integer("original_price").notNull(),
  discountPercentage: integer("discount_percentage").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  isActive: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export const categories = [
  "Sports",
  "Education",
  "Entertainment",
  "Dining",
  "Wellness",
  "Adventure",
  "Arts",
  "Travel"
] as const;
