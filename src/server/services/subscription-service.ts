import prisma from '@/lib/prisma';
import { z } from 'zod';
import { RecurringTransaction, RecurrenceFrequency, TransactionType } from '@prisma/client';

export const createSubscriptionSchema = z.object({
  userId: z.string(),
  name: z.string().min(2),
  amount: z.number().positive(),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'YEARLY']),
  nextBillingDate: z.date(),
  categoryId: z.string().min(1),
  accountId: z.string().min(1),
  status: z.enum(['ACTIVE', 'PAUSED']).default('ACTIVE'),
  notes: z.string().optional(),
});

export class SubscriptionService {
  async createSubscription(data: z.infer<typeof createSubscriptionSchema>): Promise<any> {
    const validated = createSubscriptionSchema.parse(data);
    
    return await (prisma as any).recurringTransaction.create({
      data: {
        userId: validated.userId,
        description: validated.name,
        amount: validated.amount,
        type: 'EXPENSE',
        frequency: validated.frequency as any,
        startDate: new Date(),
        nextDate: validated.nextBillingDate,
        accountId: validated.accountId,
        categoryId: validated.categoryId,
        isActive: validated.status === 'ACTIVE',
        notes: validated.notes,
      }
    });
  }

  async updateSubscription(id: string, data: any): Promise<any> {
    return await (prisma as any).recurringTransaction.update({
      where: { id },
      data: {
        description: data.name,
        amount: data.amount ? Number(data.amount) : undefined,
        frequency: data.frequency as any,
        nextDate: data.nextBillingDate ? new Date(data.nextBillingDate) : undefined,
        accountId: data.accountId,
        categoryId: data.categoryId,
        isActive: data.status === 'ACTIVE' ? true : data.status === 'PAUSED' ? false : undefined,
        notes: data.notes,
      }
    });
  }

  async deleteSubscription(id: string): Promise<void> {
    await (prisma as any).recurringTransaction.delete({
      where: { id }
    });
  }

  async getSubscriptions(userId: string): Promise<any[]> {
    return await (prisma as any).recurringTransaction.findMany({
      where: { userId },
      include: {
        category: true,
        account: true,
      },
      orderBy: { nextDate: 'asc' }
    });
  }
}
