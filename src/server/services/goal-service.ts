import prisma from '@/lib/prisma';
import { z } from 'zod';
// Fallback types for missing Prisma members
type FinancialGoal = any;
type GoalType = any;
const GoalType = {} as any;

export const createGoalSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(GoalType),
  targetAmount: z.number().positive(),
  currentAmount: z.number().default(0),
  startDate: z.date(),
  targetDate: z.date(),
});

export class GoalService {
  /**
   * Create a new financial goal
   */
  async createGoal(data: z.infer<typeof createGoalSchema>): Promise<FinancialGoal> {
    const validated = createGoalSchema.parse(data);
    
    return await prisma.financialGoal.create({
      data: validated,
    });
  }

  /**
   * Get goals for a user
   */
  async getGoals(userId: string): Promise<FinancialGoal[]> {
    return await prisma.financialGoal.findMany({
      where: { userId },
      orderBy: { targetDate: 'asc' },
    });
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(id: string, currentAmount: number): Promise<FinancialGoal> {
    const goal = await prisma.financialGoal.findUnique({ where: { id } });
    if (!goal) throw new Error('Goal not found');
    
    const isCompleted = currentAmount >= Number(goal.targetAmount);
    
    return await prisma.financialGoal.update({
      where: { id },
      data: {
        currentAmount,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }
}
