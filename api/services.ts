import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, adminQuery, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { services } from "../db/schema.js";

export const servicesRouter = createRouter({
  // Public: fetch all services & charges (for the Apply page)
  getPublic: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(services);
    // Convert to a convenient key-value map
    const result: Record<string, { value: string; label: string | null; category: string }> = {};
    for (const row of rows) {
      result[row.key] = { value: row.value, label: row.label, category: row.category };
    }
    return result;
  }),

  // Admin: list all services & charges (with full details)
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(services);
  }),

  // Admin: update a service/charge value by key
  update: adminQuery
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(services)
        .set({
          value: input.value,
          ...(input.label !== undefined ? { label: input.label } : {}),
        })
        .where(eq(services.key, input.key));
      return { success: true };
    }),

  // Admin: create a new service/charge entry
  create: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string(),
        label: z.string().optional(),
        category: z.enum(["charge", "service"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(services).values({
        key: input.key,
        value: input.value,
        label: input.label || input.key,
        category: input.category,
      });
      return { success: true };
    }),

  // Admin: delete a service/charge entry by key
  delete: adminQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(services).where(eq(services.key, input.key));
      return { success: true };
    }),
});
