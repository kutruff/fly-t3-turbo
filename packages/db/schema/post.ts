import { sql } from "drizzle-orm";
import { serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { myPgTable } from "./_table";

export const post = myPgTable("post", {
  id: serial("id").primaryKey(),
  title: varchar("name", { length: 256 }).notNull(),
  content: varchar("content", { length: 256 }).notNull(),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
