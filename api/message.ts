import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages } from "@db/schema";

export const messageRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        applicationId: z.number(),
        content: z.string().min(1, "Message cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.unifiedUser!;

      const senderId = user.authType === "oauth" ? user.id : null;
      const senderLocalId = user.authType === "local" ? user.id : null;

      const result = await db.insert(messages).values({
        applicationId: input.applicationId,
        senderId,
        senderLocalId,
        senderRole: user.role as "user" | "admin",
        senderName: user.name,
        content: input.content,
      });

      return {
        id: Number(result[0].insertId),
        content: input.content,
        senderName: user.name,
        senderRole: user.role,
        createdAt: new Date(),
      };
    }),

  listByApplication: authedQuery
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(messages)
        .where(eq(messages.applicationId, input.applicationId))
        .orderBy(desc(messages.createdAt));
    }),
});
