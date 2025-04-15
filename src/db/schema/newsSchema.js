import { integer, pgTable, varchar, text } from "drizzle-orm/pg-core";
import { usersTable } from "./userSchema.js";

export const newsTable = pgTable("news", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  user_id: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  image: varchar({ length: 255 }).notNull(),
});
