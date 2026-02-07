import prisma from '@/lib/prisma';
import { validateTransactionAmount } from '@/lib/finance/calculation-rules';
import { z } from 'zod';
import { BudgetService } from './budget-service';

const budgetService = new BudgetService();

export const createTransactionSchema = z.object({
  userId: z.string(),
  accountId: z.string(),
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  description: z.string().min(1).max(255),
  date: z.date(),
  categoryId: z.string().optional(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurringId: z.string().optional(),
});

export class TransactionService {
  /**
   * Create a new transaction
   * RESTRICTION: Must validate amount and update account balance atomically
   */
  async createTransaction(
    data: z.infer<typeof createTransactionSchema>
  ): Promise<any> {
    // Validate input
    const validated = createTransactionSchema.parse(data);
    
    // Validate amount rules from SDD
    const amountValidation = validateTransactionAmount(validated.amount);
    if (!amountValidation.valid) {
      throw new Error(amountValidation.error);
    }
    
    // Create transaction and update account balance atomically
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: validated,
      });
      
      // Update account balance
      const balanceChange = validated.type === 'INCOME'
        ? validated.amount
        : -validated.amount;
      
      await tx.account.update({
        where: { id: validated.accountId },
        data: {
          currentBalance: {
            increment: balanceChange,
          },
        },
      });
      
      // Update budget allocation if it's an expense and has a category
      if (validated.type === 'EXPENSE' && validated.categoryId) {
        await this.updateBudgetAllocation(
          tx,
          validated.userId,
          validated.categoryId,
          validated.amount,
          validated.date
        );
      }
      
      return transaction;
    });

    // Check thresholds after transaction is committed (optional: could be inside transaction but might be slow)
    if (validated.type === 'EXPENSE' && validated.categoryId) {
      // We don't await this to keep transaction fast, or we could await if we want consistency
      budgetService.checkThresholds(validated.userId, validated.categoryId, validated.date).catch(console.error);
    }
    
    return result;
  }
  
  /**
   * Update budget allocation when expense is created
   */
  private async updateBudgetAllocation(
    tx: any,
    userId: string,
    categoryId: string,
    amount: number,
    date: Date
  ): Promise<void> {
    // Find active budget covering this date
    const budget = await tx.budget.findFirst({
      where: {
        userId,
        isActive: true,
        startDate: { lte: date },
        endDate: { gte: date },
        OR: [
          { categoryId },
          { allocations: { some: { categoryId } } }
        ]
      },
      include: {
        allocations: {
          where: { categoryId },
        },
      },
    });
    
    if (!budget) return;

    if (budget.allocations.length > 0) {
      await tx.budgetAllocation.update({
        where: { id: budget.allocations[0].id },
        data: {
          spent: {
            increment: amount,
          },
        },
      });
    }
  }

  /**
   * Soft delete transaction
   * RESTRICTION: Never hard delete transactions
   */
  async deleteTransaction(id: string): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
      // Get transaction
      const transaction = await tx.transaction.findUnique({
        where: { id },
      });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      if (transaction.isDeleted) return; // Already deleted

      // Soft delete
      await tx.transaction.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
      
      // Reverse account balance change
      const balanceChange = transaction.type === 'INCOME'
        ? -Number(transaction.amount) // Was an income, now decrease balance
        : Number(transaction.amount); // Was an expense, now increase balance
      
      await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          currentBalance: {
            increment: balanceChange,
          },
        },
      });
      
      // Reverse budget allocation if applicable
      if (transaction.type === 'EXPENSE' && transaction.categoryId) {
        const budget = await tx.budget.findFirst({
          where: {
            userId: transaction.userId,
            isActive: true,
            startDate: { lte: transaction.date },
            endDate: { gte: transaction.date },
          },
          include: {
            allocations: {
              where: { categoryId: transaction.categoryId },
            },
          },
        });
        
        if (budget && budget.allocations.length > 0) {
          await tx.budgetAllocation.update({
            where: { id: budget.allocations[0].id },
            data: {
              spent: {
                decrement: Number(transaction.amount),
              },
            },
          });
        }
      }
    });
  }

  async updateTransaction(
    id: string,
    data: any
  ): Promise<any> {
    return await prisma.$transaction(async (tx: any) => {
      // Get old transaction
      const old = await tx.transaction.findUnique({ where: { id } });
      if (!old) throw new Error('Transaction not found');

      // Update account balance if amount or account changed
      if (data.amount !== undefined || data.type !== undefined || data.accountId !== undefined) {
        // Reverse old balance change
        const oldBalanceChange = old.type === 'INCOME' ? -Number(old.amount) : Number(old.amount);
        await tx.account.update({
          where: { id: old.accountId },
          data: { currentBalance: { increment: oldBalanceChange } }
        });

        // Apply new balance change
        const finalAmount = data.amount ?? Number(old.amount);
        const finalType = data.type ?? old.type;
        const finalAccountId = data.accountId ?? old.accountId;
        const newBalanceChange = finalType === 'INCOME' ? finalAmount : -finalAmount;
        await tx.account.update({
          where: { id: finalAccountId },
          data: { currentBalance: { increment: newBalanceChange } }
        });
      }

      return await tx.transaction.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
          amount: data.amount ? Number(data.amount) : undefined,
        },
      });
    });
  }
}
