import { z } from "zod";
import { eq, sql, desc } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { applications, users, localUsers } from "../db/schema.js";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();

    const allApps = await db.select({ count: sql<number>`count(*)` }).from(applications);
    const pendingApps = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "submitted"));
    const approvedApps = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "approved"));
    const oauthUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const localUsersCount = await db.select({ count: sql<number>`count(*)` }).from(localUsers);

    return {
      totalApplications: Number(allApps[0].count),
      pendingReview: Number(pendingApps[0].count),
      approved: Number(approvedApps[0].count),
      totalUsers: Number(oauthUsers[0].count) + Number(localUsersCount[0].count),
    };
  }),

  recentApplications: adminQuery
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit || 10;
      return db.select().from(applications).orderBy(desc(applications.createdAt)).limit(limit);
    }),
});
