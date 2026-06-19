import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, localUsers } from "@db/schema";

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
