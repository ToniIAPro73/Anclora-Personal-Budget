import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Account, AccountType } from '@prisma/client';

export const createAccountSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  type: z.nativeEnum(AccountType),
  currency: z.string().default('EUR'),
  initialBalance: z.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export class AccountService {
  /**
   * Create a new financial account
   */
  async createAccount(data: z.infer<typeof createAccountSchema>): Promise<Account> {
    const validated = createAccountSchema.parse(data);
    
    return await prisma.account.create({
      data: {
        ...validated,
        currentBalance: validated.initialBalance,
      },
    });
  }

  /**
   * Get all active accounts for a user
   */
  async getAccounts(userId: string): Promise<Account[]> {
    return await prisma.account.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Update account details
   */
  async updateAccount(id: string, data: Partial<z.infer<typeof createAccountSchema>> & { balance?: number }): Promise<Account> {
    const { balance, ...rest } = data;
    const updateData: any = { ...rest };
    
    if (balance !== undefined) {
      updateData.currentBalance = balance;
    }

    return await prisma.account.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(id: string): Promise<Account> {
    return await prisma.account.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
