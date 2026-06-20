import { pgTable, text, integer, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const treatments = pgTable("treatments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  interval: integer("interval").notNull(),
  medicine: jsonb("medicine").notNull(),
  slug: text("slug").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Medicine = {
  name: string;
  dosage: string;
  quantity: string;
};
