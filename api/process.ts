import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, adminQuery, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { processes } from "../db/schema.js";

// Schema for a single custom question inside a process
const customQuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["text", "single_choice", "multi_choice"]),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(), // for single/multi choice
  order: z.number(),
});

// Full process config — mirrors wizard config but scoped to one process
const processConfigSchema = z.object({
  activityTypes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    enabled: z.boolean(),
  })),
  activities: z.record(z.string(), z.array(z.object({ id: z.string(), label: z.string() }))),
  legalStructures: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    enabled: z.boolean(),
  })),
  partnerOptions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    enabled: z.boolean(),
  })),
  officeTypes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    desc: z.string(),
    enabled: z.boolean(),
  })),
  customQuestions: z.array(customQuestionSchema),
  pricing: z.object({
    baseCost: z.number(),
    englishNameFee: z.number(),
    investorVisaFee: z.number(),
    employmentVisaFee: z.number(),
  }),
});

export type ProcessConfig = z.infer<typeof processConfigSchema>;

export const DEFAULT_PROCESS_CONFIG: ProcessConfig = {
  activityTypes: [
    { id: "professional", title: "Professional", description: "Consultancies, IT, marketing", enabled: true },
    { id: "commercial",   title: "Commercial",   description: "Trading, import/export, retail", enabled: true },
    { id: "industrial",   title: "Industrial",   description: "Manufacturing, assembly, packaging", enabled: true },
  ],
  activities: {
    professional: [
      { id: "management_consultancy", label: "Management Consultancy" },
      { id: "it_services", label: "IT Services" },
    ],
    commercial: [
      { id: "general_trading", label: "General Trading" },
      { id: "import_export", label: "Import & Export" },
    ],
    industrial: [
      { id: "manufacturing", label: "Manufacturing" },
    ],
  },
  legalStructures: [
    { id: "llc", title: "LLC", description: "Limited Liability Company", enabled: true },
    { id: "branch", title: "Branch", description: "Branch of existing company", enabled: true },
    { id: "sole_establishment", title: "Sole Establishment", description: "Single individual", enabled: true },
  ],
  partnerOptions: [
    { id: "single", label: "Single Owner", enabled: true },
    { id: "two", label: "2 Partners", enabled: true },
    { id: "three", label: "3 Partners", enabled: true },
    { id: "four_plus", label: "4+ Partners", enabled: true },
  ],
  officeTypes: [
    { id: "virtual", label: "Virtual Office", desc: "Cost-effective remote solution", enabled: true },
    { id: "physical", label: "Physical Office", desc: "Dedicated office space", enabled: true },
    { id: "sharing", label: "Sharing Office", desc: "Shared workspace", enabled: true },
  ],
  customQuestions: [],
  pricing: {
    baseCost: 3414,
    englishNameFee: 2000,
    investorVisaFee: 4000,
    employmentVisaFee: 3000,
  },
};

export const processRouter = createRouter({
  // Public: list all enabled processes
  listPublic: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select({
      id: processes.id,
      name: processes.name,
      slug: processes.slug,
      description: processes.description,
      enabled: processes.enabled,
    }).from(processes);
    return rows.filter((r) => r.enabled);
  }),

  // Public: get a single process config by slug
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(processes).where(eq(processes.slug, input.slug)).limit(1);
      if (rows.length === 0) return null;
      const row = rows[0];
      try {
        return { ...row, config: processConfigSchema.parse(JSON.parse(row.config)) };
      } catch {
        return { ...row, config: DEFAULT_PROCESS_CONFIG };
      }
    }),

  // Admin: list all processes (including disabled)
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(processes);
  }),

  // Admin: create a new process
  create: adminQuery
    .input(z.object({
      name: z.string().min(2),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
      description: z.string().optional(),
      config: processConfigSchema.optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const config = input.config ?? DEFAULT_PROCESS_CONFIG;
      const result = await db.insert(processes).values({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        config: JSON.stringify(config),
        enabled: true,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Admin: update a process (name, description, enabled, config)
  update: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      enabled: z.boolean().optional(),
      config: processConfigSchema.optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, config, ...rest } = input;
      await db.update(processes).set({
        ...rest,
        ...(config !== undefined ? { config: JSON.stringify(config) } : {}),
      }).where(eq(processes.id, id));
      return { success: true };
    }),

  // Admin: delete a process
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(processes).where(eq(processes.id, input.id));
      return { success: true };
    }),
});
