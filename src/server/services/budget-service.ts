import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Budget, BudgetType } from '@prisma/client';
// Fallback for stale prisma client
type BudgetPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
import { validateBudgetPeriod } from '@/lib/finance/calculation-rules';

export const createBudgetSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  type: z.nativeEnum(BudgetType).default(BudgetType.CUSTOM),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).default('MONTHLY'),
  startDate: z.date(),
  endDate: z.date(),
  totalAmount: z.number().positive(),
  alertThreshold: z.number().optional(),
  categoryId: z.string().optional(),
  rollover: z.boolean().default(false),
  allocations: z.array(z.object({
    categoryId: z.string(),
    amount: z.number().nonnegative(),
    percentage: z.number().optional(),
  })),
});

export class BudgetService {
  /**
   * Create a new budget with allocations
   */
  async createBudget(data: z.infer<typeof createBudgetSchema>): Promise<Budget> {
    const validated = createBudgetSchema.parse(data);
    
    // Validate period rules from SDD
    const periodValidation = validateBudgetPeriod(validated.startDate, validated.endDate);
    if (!periodValidation.valid) {
      throw new Error(periodValidation.error);
    }
    
    return await prisma.$transaction(async (tx: any) => {
      const budget = await tx.budget.create({
        data: {
          userId: validated.userId,
          name: validated.name,
          type: validated.type,
          period: validated.period,
          startDate: validated.startDate,
          endDate: validated.endDate,
          totalAmount: validated.totalAmount,
          alertThreshold: validated.alertThreshold,
          categoryId: validated.categoryId,
          rollover: validated.rollover,
        },
      });
      
      // Create allocations
      if (validated.allocations.length > 0) {
        await tx.budgetAllocation.createMany({
          data: validated.allocations.map(alloc => ({
            budgetId: budget.id,
            categoryId: alloc.categoryId,
            amount: alloc.amount,
            percentage: alloc.percentage,
          })),
        });
      }
      
      return budget;
    });
  }

  /**
   * Get active accounts for a user
   */
  async getActiveBudgets(userId: string): Promise<Budget[]> {
    return await prisma.budget.findMany({
      where: {
        userId,
        isActive: true,
        endDate: { gte: new Date() },
      },
      include: {
        // @ts-expect-error - category field exists in schema but type lock prevents update in IDE
        category: true,
        allocations: {
          include: { category: true },
        },
      },
    });
  }

  /**
   * Check budget thresholds and generate alerts if needed
   */
  async checkThresholds(userId: string, categoryId: string, date: Date): Promise<void> {
    const budget = await (prisma.budget.findFirst({
      where: {
        userId,
        isActive: true,
        startDate: { lte: date },
        endDate: { gte: date },
      },
      include: {
        allocations: {
          where: { categoryId },
        },
      },
    }) as any);

    if (!budget || budget.allocations.length === 0) return;

    const allocation = budget.allocations[0];
    const spent = Number(allocation.spent);
    const limit = Number(allocation.amount);
    const threshold = budget.alertThreshold ? Number(budget.alertThreshold) : null;

    const remaining = limit - spent;
    
    // Alert logic
    if (spent >= limit) {
      await this.createThresholdAlert(userId, budget.name, `Has superado tu presupuesto para ${budget.name}. Gastado: ${spent}€ / Límite: ${limit}€`, 'critical');
    } else if (threshold !== null && remaining <= threshold) {
      await this.createThresholdAlert(userId, budget.name, `Te queda poco presupuesto para ${budget.name}. Restante: ${remaining.toFixed(2)}€`, 'high');
    } else if (spent >= limit * 0.9) {
      await this.createThresholdAlert(userId, budget.name, `Has gastado el 90% de tu presupuesto para ${budget.name}.`, 'medium');
    }
  }

  private async createThresholdAlert(userId: string, budgetName: string, message: string, priority: string) {
    // Check if similar unread alert already exists to avoid spam
    const existing = await (prisma as any).alert.findFirst({
      where: {
        userId,
        title: `Alerta: ${budgetName}`,
        isRead: false,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
      }
    }) as any;

    if (!existing) {
      await (prisma as any).alert.create({
        data: {
          userId,
          title: `Alerta: ${budgetName}`,
          message,
          type: 'BUDGET_THRESHOLD',
          priority,
        }
      } as any);
    }
  }
}
