import { z } from "zod";

// ============================================================================
// ACCOUNT SCHEMAS
// ============================================================================

export const accountSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.enum(["CHECKING", "SAVINGS", "CASH", "INVESTMENT"]),
  balance: z.number().min(0, "El balance no puede ser negativo"),
  currency: z.enum(["EUR", "USD"]).default("EUR"),
  color: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

// ============================================================================
// TRANSACTION SCHEMAS
// ============================================================================

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  date: z.date(),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  accountId: z.string().min(1, "Selecciona una cuenta"),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// ============================================================================
// SUBSCRIPTION SCHEMAS
// ============================================================================

export const subscriptionSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "BIANNUAL", "YEARLY"]),
  nextBillingDate: z.date().refine((date) => date >= new Date(), {
    message: "La fecha debe ser hoy o posterior",
  }),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  accountId: z.string().min(1, "Selecciona una cuenta"),
  status: z.enum(["ACTIVE", "PAUSED"]).default("ACTIVE"),
  notes: z.string().optional(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

// ============================================================================
// BUDGET SCHEMAS
// ============================================================================

export const budgetAllocationSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
});

export const budgetSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  startDate: z.date(),
  endDate: z.date(),
  totalAmount: z.number().positive("El monto total debe ser mayor a 0"),
  allocations: z.array(budgetAllocationSchema).min(1, "Agrega al menos una categoría"),
}).refine((data) => data.endDate > data.startDate, {
  message: "La fecha de fin debe ser posterior a la de inicio",
  path: ["endDate"],
}).refine((data) => {
  const totalAllocated = data.allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  return totalAllocated <= data.totalAmount;
}, {
  message: "La suma de asignaciones no puede exceder el monto total",
  path: ["allocations"],
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
export type BudgetAllocationFormData = z.infer<typeof budgetAllocationSchema>;
