import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createRouter, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { users, localUsers } from "../db/schema.js";

export const userRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    const oauthUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      authType: sql<string>`'oauth'`,
    }).from(users).orderBy(desc(users.createdAt));

    const local = await db.select({
      id: localUsers.id,
      name: localUsers.fullName,
      email: localUsers.email,
      role: localUsers.role,
      createdAt: localUsers.createdAt,
      authType: sql<string>`'local'`,
    }).from(localUsers).orderBy(desc(localUsers.createdAt));

    return [...oauthUsers, ...local];
  }),

  create: adminQuery
    .input(
      z.object({
        fullName: z.string().min(2),
        email: z.string().email(),
        username: z.string().min(3),
        password: z.string().min(6),
        role: z.enum(["user", "admin"]).default("user"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const hashed = await bcrypt.hash(input.password, 10);
      const result = await db.insert(localUsers).values({
        fullName: input.fullName,
        email: input.email,
        username: input.username,
        password: hashed,
        role: input.role,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number(), authType: z.enum(["oauth", "local"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      if (input.authType === "oauth") {
        await db.delete(users).where(eq(users.id, input.id));
      } else {
        await db.delete(localUsers).where(eq(localUsers.id, input.id));
      }
      return { success: true };
    }),

  updateRole: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]),
        authType: z.enum(["oauth", "local"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      if (input.authType === "oauth") {
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
      } else {
        await db.update(localUsers).set({ role: input.role }).where(eq(localUsers.id, input.id));
      }
      return { success: true };
    }),
});
