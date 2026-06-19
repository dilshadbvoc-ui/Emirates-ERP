import { z } from "zod";
import { eq, and, like, desc } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { applications } from "../db/schema.js";
import { TRPCError } from "@trpc/server";

function generateQuoteId(): string {
  const now = new Date();
  const datePart = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = String(Math.floor(Math.random() * 900) + 100);
  return `Q-${datePart}-${randomPart}`;
}

function calculateTotalCost(
  baseCost: number,
  tradeNameLanguage: string,
  investorVisa: boolean,
  employmentVisaCount: number
): number {
  let total = baseCost;
  if (tradeNameLanguage === "english") total += 2000;
  if (investorVisa) total += 4000;
  total += employmentVisaCount * 3000;
  return total;
}

export const applicationRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        activityType: z.enum(["professional", "commercial", "industrial"]),
        activity: z.string().min(1),
        legalStructure: z.enum(["llc", "branch", "sole_establishment"]),
        partnerCount: z.enum(["single", "two", "three", "four_plus"]),
        tradeName: z.string().optional(),
        tradeNameLanguage: z.enum(["english", "arabic"]).optional(),
        officeType: z.enum(["virtual", "physical", "sharing"]),
        investorVisa: z.boolean().optional(),
        employmentVisaCount: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const quoteId = generateQuoteId();
      const baseCost = 3414;
      const totalCost = calculateTotalCost(
        baseCost,
        input.tradeNameLanguage || "english",
        input.investorVisa || false,
        input.employmentVisaCount || 0
      );

      const userId = ctx.unifiedUser?.authType === "oauth" ? ctx.unifiedUser.id : null;
      const localUserId = ctx.unifiedUser?.authType === "local" ? ctx.unifiedUser.id : null;

      const result = await db.insert(applications).values({
        quoteId,
        userId,
        localUserId,
        activityType: input.activityType,
        activity: input.activity,
        legalStructure: input.legalStructure,
        partnerCount: input.partnerCount,
        tradeName: input.tradeName || null,
        tradeNameLanguage: input.tradeNameLanguage || "english",
        officeType: input.officeType,
        investorVisa: input.investorVisa || false,
        employmentVisaCount: input.employmentVisaCount || 0,
        status: "submitted",
        baseCost: String(baseCost),
        totalCost: String(totalCost),
      });

      return { id: Number(result[0].insertId), quoteId };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.unifiedUser?.id;
    const authType = ctx.unifiedUser?.authType;

    if (authType === "oauth") {
      return db.select().from(applications).where(eq(applications.userId, userId!)).orderBy(desc(applications.createdAt));
    } else {
      return db.select().from(applications).where(eq(applications.localUserId, userId!)).orderBy(desc(applications.createdAt));
    }
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const app = await db.select().from(applications).where(eq(applications.id, input.id)).limit(1);
      if (app.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }
      return app[0];
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "submitted", "under_review", "approved", "rejected"]).optional(),
        tradeName: z.string().optional(),
        investorVisa: z.boolean().optional(),
        employmentVisaCount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      await db.update(applications).set(updates).where(eq(applications.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(applications).where(eq(applications.id, input.id));
      return { success: true };
    }),

  // Admin procedures
  listAll: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.status) {
        conditions.push(eq(applications.status, input.status as "draft" | "submitted" | "under_review" | "approved" | "rejected"));
      }
      if (input?.search) {
        conditions.push(like(applications.quoteId, `%${input.search}%`));
      }

      if (conditions.length > 0) {
        return db.select().from(applications).where(and(...conditions)).orderBy(desc(applications.createdAt));
      }

      return db.select().from(applications).orderBy(desc(applications.createdAt));
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "submitted", "under_review", "approved", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(applications).set({ status: input.status }).where(eq(applications.id, input.id));
      return { success: true };
    }),
});
