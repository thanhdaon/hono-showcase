import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const todos = mysqlTable("todos", {
  id: int("id", { unsigned: true }).primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  done: boolean("done").notNull().default(false),
});

export const statuses = ["todo", "in-progress", "done", "canceled"] as const;
export const priorities = ["low", "medium", "high"] as const;
export const labels = [
  "bug",
  "feature",
  "enhancement",
  "documentation",
] as const;

export const tasks = mysqlTable("tasks", {
  id: int("id", { unsigned: true }).primaryKey().autoincrement(),
  code: varchar("code", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 128 }),
  status: varchar("status", { length: 30, enum: statuses })
    .notNull()
    .default("todo"),
  label: varchar("label", { length: 30, enum: labels })
    .notNull()
    .default("bug"),
  priority: varchar("priority", { length: 30, enum: priorities })
    .notNull()
    .default("low"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
