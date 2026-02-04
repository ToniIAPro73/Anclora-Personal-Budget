import prisma from '@/lib/prisma';
import { z } from 'zod';
// Fallback types for missing Prisma members
type Budget = any;
type BudgetType = any;
const BudgetType = {} as any;
import { validateBudgetPeriod } from '@/lib/finance/calculation-rules';

export const createBudgetSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  type: z.nativeEnum(BudgetType),
  startDate: z.date(),
  endDate: z.date(),
  totalAmount: z.number().positive(),
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
          startDate: validated.startDate,
          endDate: validated.endDate,
          totalAmount: validated.totalAmount,
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
        allocations: {
          include: { category: true },
        },
      },
    });
  }
}
