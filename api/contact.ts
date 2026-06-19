import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { contacts } from "../db/schema.js";

export const contactRouter = createRouter({
  submit: publicQuery
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional(),
        message: z.string().min(10, "Message must be at least 10 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(contacts).values({
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        message: input.message,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(contacts).where(eq(contacts.id, input.id));
      return { success: true };
    }),
});
