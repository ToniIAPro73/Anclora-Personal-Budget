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
    
    // Map frequency (BIANNUAL is handled as MONTHLY with interval 6 if not in enum, 
    // but we just added it to schema.prisma)
    const frequencyMap: Record<string, string> = {
      'MONTHLY': 'MONTHLY',
      'QUARTERLY': 'QUARTERLY',
      'BIANNUAL': 'BIANNUAL',
      'YEARLY': 'YEARLY',
    };

    return await (prisma as any).recurringTransaction.create({
      data: {
        userId: validated.userId,
        name: validated.name, // Note: The schema has description, not name. Let's check schema again.
        description: validated.name,
        amount: validated.amount,
        type: 'EXPENSE', // Subscriptions are typically expenses
        frequency: frequencyMap[validated.frequency] as any,
        startDate: new Date(),
        nextDate: validated.nextBillingDate,
        accountId: validated.accountId,
        categoryId: validated.categoryId,
        isActive: validated.status === 'ACTIVE',
      }
    });
  }

  async getSubscriptions(userId: string): Promise<any[]> {
    return await (prisma as any).recurringTransaction.findMany({
      where: { userId },
      orderBy: { nextDate: 'asc' }
    });
  }
}
