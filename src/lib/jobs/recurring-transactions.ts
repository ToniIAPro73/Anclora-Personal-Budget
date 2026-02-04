import prisma from '@/lib/prisma';
import { TransactionService } from '@/server/services/transaction-service';
import { addDays, addWeeks, addMonths, addYears, isBefore } from 'date-fns';
// Fallback types if prisma client is not yet generated
type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'YEARLY';

const transactionService = new TransactionService();

export async function processRecurringTransactions() {
  const now = new Date();
  
  // Find active recurring transactions due for processing
  const recurring = await prisma.recurringTransaction.findMany({
    where: {
      isActive: true,
      nextDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ]
    }
  });

  const results = [];

  for (const item of recurring) {
    try {
      // Create the transaction
      await transactionService.createTransaction({
        userId: item.userId,
        accountId: item.accountId,
        categoryId: item.categoryId || undefined,
        amount: Number(item.amount),
        type: item.type,
        description: `${item.description} (Recurrente)`,
        date: item.nextDate,
        recurringId: item.id
      });

      // Calculate next date
      const nextDate = calculateNextOccurrence(item.nextDate, item.frequency, item.interval);
      
      // Update the recurring record
      await prisma.recurringTransaction.update({
        where: { id: item.id },
        data: {
          nextDate,
          isActive: item.endDate ? isBefore(nextDate, item.endDate) : true
        }
      });

      results.push({ id: item.id, status: 'success' });
    } catch (error) {
      console.error(`Error processing recurring transaction ${item.id}:`, error);
      results.push({ id: item.id, status: 'error', error });
    }
  }

  return results;
}

function calculateNextOccurrence(current: Date, frequency: RecurrenceFrequency, interval: number): Date {
  switch (frequency) {
    case 'DAILY': return addDays(current, interval);
    case 'WEEKLY': return addWeeks(current, interval);
    case 'BIWEEKLY': return addWeeks(current, interval * 2);
    case 'MONTHLY': return addMonths(current, interval);
    case 'BIMONTHLY': return addMonths(current, interval * 2);
    case 'QUARTERLY': return addMonths(current, interval * 3);
    case 'YEARLY': return addYears(current, interval);
    default: return addMonths(current, 1);
  }
}
