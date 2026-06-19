import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  decimal,
  bigint,
} from "drizzle-orm/mysql-core";

// OAuth users (managed by Kimi SDK)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Local auth users (username/password)
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// License applications
export const applications = mysqlTable("applications", {
  id: serial("id").primaryKey(),
  quoteId: varchar("quote_id", { length: 20 }).notNull().unique(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  localUserId: bigint("local_user_id", { mode: "number", unsigned: true }),
  activityType: mysqlEnum("activity_type", ["professional", "commercial", "industrial"]).notNull(),
  activity: varchar("activity", { length: 255 }).notNull(),
  legalStructure: mysqlEnum("legal_structure", ["llc", "branch", "sole_establishment"]).notNull(),
  partnerCount: mysqlEnum("partner_count", ["single", "two", "three", "four_plus"]).notNull(),
  tradeName: varchar("trade_name", { length: 255 }),
  tradeNameLanguage: mysqlEnum("trade_name_language", ["english", "arabic"]).default("english"),
  officeType: mysqlEnum("office_type", ["virtual", "physical", "sharing"]).notNull(),
  investorVisa: boolean("investor_visa").default(false),
  employmentVisaCount: int("employment_visa_count").default(0),
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "approved", "rejected"]).default("draft"),
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).default("3414.00"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// Contact form submissions
export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// Messages (comment stream between users and admins)
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  applicationId: bigint("application_id", { mode: "number", unsigned: true }).notNull(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true }),
  senderLocalId: bigint("sender_local_id", { mode: "number", unsigned: true }),
  senderRole: mysqlEnum("sender_role", ["user", "admin"]).notNull(),
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Admin-manageable services & charges (key-value config store)
export const services = mysqlTable("services", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(), // JSON string (number, string[], or object)
  label: varchar("label", { length: 255 }),
  category: mysqlEnum("category", ["charge", "service"]).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

