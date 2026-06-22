import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, adminQuery, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { services } from "../db/schema.js";

// ─── Zod schemas for wizard config ───────────────────────────────────────────

const activityOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const customQuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["text", "single_choice", "multi_choice"]),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  order: z.number(),
});

const wizardStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["activity_type", "activity", "legal_structure", "partners", "lead_capture", "trade_office", "quote"]),
  order: z.number(),
  enabled: z.boolean(),
});

const wizardConfigSchema = z.object({
  steps: z.array(wizardStepSchema),
  activityTypes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    enabled: z.boolean(),
  })),
  activities: z.record(z.string(), z.array(activityOptionSchema)),
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
  customQuestions: z.array(customQuestionSchema).default([]),
});

const pricingConfigSchema = z.object({
  baseCost: z.number(),
  englishNameFee: z.number(),
  investorVisaFee: z.number(),
  employmentVisaFee: z.number(),
  whatsappNumber: z.string().default(""),
});

// ─── Default configs ──────────────────────────────────────────────────────────

export const DEFAULT_WIZARD_CONFIG: z.infer<typeof wizardConfigSchema> = {
  steps: [
    { id: "activity_type", title: "Activity Type",       type: "activity_type",   order: 0, enabled: true },
    { id: "activity",      title: "Activity",            type: "activity",        order: 1, enabled: true },
    { id: "legal",         title: "Legal Structure",     type: "legal_structure", order: 2, enabled: true },
    { id: "partners",      title: "Partners",            type: "partners",        order: 3, enabled: true },
    { id: "lead",          title: "Your Details",        type: "lead_capture",    order: 4, enabled: true },
    { id: "trade_office",  title: "Trade Name & Office", type: "trade_office",    order: 5, enabled: true },
    { id: "quote",         title: "Quote",               type: "quote",           order: 6, enabled: true },
  ],
  activityTypes: [
    { id: "professional", title: "Professional", description: "Consultancies, IT services, marketing, HR, accounting", enabled: true },
    { id: "commercial",   title: "Commercial",   description: "Trading, import/export, retail, e-commerce",           enabled: true },
    { id: "industrial",   title: "Industrial",   description: "Manufacturing, assembly, packaging, processing",        enabled: true },
  ],
  activities: {
    professional: [
      { id: "management_consultancy",  label: "Management Consultancy" },
      { id: "it_services",             label: "IT Services" },
      { id: "marketing_services",      label: "Marketing Services" },
      { id: "hr_consultancy",          label: "HR Consultancy" },
      { id: "accounting_bookkeeping",  label: "Accounting & Bookkeeping" },
      { id: "educational_services",    label: "Educational Services" },
    ],
    commercial: [
      { id: "general_trading",         label: "General Trading" },
      { id: "import_export",           label: "Import & Export" },
      { id: "retail_trading",          label: "Retail Trading" },
      { id: "e_commerce",              label: "E-Commerce" },
      { id: "wholesale_trading",       label: "Wholesale Trading" },
      { id: "foodstuff_trading",       label: "Foodstuff Trading" },
    ],
    industrial: [
      { id: "manufacturing",           label: "Manufacturing" },
      { id: "assembly_production",     label: "Assembly & Production" },
      { id: "packaging",               label: "Packaging" },
      { id: "processing_industries",   label: "Processing Industries" },
      { id: "factory_operations",      label: "Factory Operations" },
    ],
  },
  legalStructures: [
    { id: "llc",                title: "LLC",                description: "Limited Liability Company, most common structure", enabled: true },
    { id: "branch",             title: "Branch",             description: "Branch of an existing foreign company",           enabled: true },
    { id: "sole_establishment", title: "Sole Establishment", description: "Owned by a single individual",                   enabled: true },
  ],
  partnerOptions: [
    { id: "single",    label: "Single Owner", enabled: true },
    { id: "two",       label: "2 Partners",   enabled: true },
    { id: "three",     label: "3 Partners",   enabled: true },
    { id: "four_plus", label: "4+ Partners",  enabled: true },
  ],
  officeTypes: [
    { id: "virtual",  label: "Virtual Office",  desc: "Cost-effective remote solution", enabled: true },
    { id: "physical", label: "Physical Office", desc: "Dedicated office space",          enabled: true },
    { id: "sharing",  label: "Sharing Office",  desc: "Shared workspace",               enabled: true },
  ],
  customQuestions: [],
};

export const DEFAULT_PRICING_CONFIG: z.infer<typeof pricingConfigSchema> = {
  baseCost: 3414,
  englishNameFee: 2000,
  investorVisaFee: 4000,
  employmentVisaFee: 3000,
  whatsappNumber: "971500000000",
};

// ─── Router ───────────────────────────────────────────────────────────────────

export const servicesRouter = createRouter({
  // Public: fetch all services & charges (for the Apply page)
  getPublic: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(services);
    const result: Record<string, { value: string; label: string | null; category: string }> = {};
    for (const row of rows) {
      result[row.key] = { value: row.value, label: row.label, category: row.category };
    }
    return result;
  }),

  // Public: get wizard config (falls back to default if not set)
  getWizardConfig: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(services).where(eq(services.key, "wizard_config"));
    if (rows.length === 0) return DEFAULT_WIZARD_CONFIG;
    try {
      return wizardConfigSchema.parse(JSON.parse(rows[0].value));
    } catch {
      return DEFAULT_WIZARD_CONFIG;
    }
  }),

  // Public: get pricing config (falls back to default if not set)
  getPricingConfig: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(services).where(eq(services.key, "pricing_config"));
    if (rows.length === 0) return DEFAULT_PRICING_CONFIG;
    try {
      return pricingConfigSchema.parse(JSON.parse(rows[0].value));
    } catch {
      return DEFAULT_PRICING_CONFIG;
    }
  }),

  // Admin: list all services & charges
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(services);
  }),

  // Admin: update a service/charge value by key
  update: adminQuery
    .input(z.object({ key: z.string(), value: z.string(), label: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(services).set({
        value: input.value,
        ...(input.label !== undefined ? { label: input.label } : {}),
      }).where(eq(services.key, input.key));
      return { success: true };
    }),

  // Admin: create a new service/charge entry
  create: adminQuery
    .input(z.object({ key: z.string().min(1), value: z.string(), label: z.string().optional(), category: z.enum(["charge", "service"]) }))
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

  // Admin: delete a service/charge entry
  delete: adminQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(services).where(eq(services.key, input.key));
      return { success: true };
    }),

  // Admin: save full wizard config
  saveWizardConfig: adminQuery
    .input(wizardConfigSchema)
    .mutation(async ({ input }) => {
      const db = getDb();
      const value = JSON.stringify(input);
      const existing = await db.select().from(services).where(eq(services.key, "wizard_config"));
      if (existing.length > 0) {
        await db.update(services).set({ value }).where(eq(services.key, "wizard_config"));
      } else {
        await db.insert(services).values({ key: "wizard_config", value, label: "Wizard Configuration", category: "service" });
      }
      return { success: true };
    }),

  // Admin: save pricing config
  savePricingConfig: adminQuery
    .input(pricingConfigSchema)
    .mutation(async ({ input }) => {
      const db = getDb();
      const value = JSON.stringify(input);
      const existing = await db.select().from(services).where(eq(services.key, "pricing_config"));
      if (existing.length > 0) {
        await db.update(services).set({ value }).where(eq(services.key, "pricing_config"));
      } else {
        await db.insert(services).values({ key: "pricing_config", value, label: "Pricing Configuration", category: "charge" });
      }
      return { success: true };
    }),
});
