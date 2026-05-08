import { z } from "zod";

export const appSettingsSchema = z.object({
  currency: z.string().trim().min(3).max(3).optional(),
  locale: z.string().trim().min(2).max(12).optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
  monthlyBudget: z.number().nonnegative().nullable().optional(),
  alertEmail: z.boolean().optional(),
  alertPush: z.boolean().optional(),
  dataSharing: z.boolean().optional()
});

export const financialGoalSchema = z.object({
  name: z.string().trim().min(2),
  targetAmount: z.number().positive(),
  currentAmount: z.number().nonnegative().optional(),
  category: z.string().trim().min(1).nullable().optional(),
  deadline: z.string().datetime({ offset: true }).nullable().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "DONE"]).optional()
});

export const alertRuleSchema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(["BUDGET", "CATEGORY", "BALANCE", "CARD_DUE", "GOAL"]),
  threshold: z.number().nonnegative().nullable().optional(),
  category: z.string().trim().min(1).nullable().optional(),
  channel: z.enum(["IN_APP", "EMAIL", "PUSH"]).optional(),
  isActive: z.boolean().optional()
});

export const investmentPositionSchema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(["FIXED_INCOME", "STOCK", "FUND", "CRYPTO", "PENSION", "OTHER"]),
  institution: z.string().trim().min(1).nullable().optional(),
  investedAmount: z.number().nonnegative(),
  currentAmount: z.number().nonnegative().nullable().optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).nullable().optional(),
  liquidity: z.string().trim().min(1).nullable().optional()
});
