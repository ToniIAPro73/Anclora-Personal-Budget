import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Category, CategoryType } from '@prisma/client';

export const createCategorySchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(50),
  type: z.nativeEnum(CategoryType),
  parentId: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  monthlyBudget: z.number().optional(),
  keywords: z.array(z.string()).optional(),
});

export class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(data: z.infer<typeof createCategorySchema>): Promise<Category> {
    const validated = createCategorySchema.parse(data);
    
    return await prisma.category.create({
      data: validated,
    });
  }

  /**
   * Get all categories for a user (including subcategories)
   */
  async getCategories(userId: string): Promise<Category[]> {
    return await prisma.category.findMany({
      where: { userId },
      include: {
        subcategories: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Seed default categories for a new user
   */
  async seedDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
      { name: 'Sueldo', type: CategoryType.INCOME, color: '#10b981', icon: 'wallet' },
      { name: 'Alquiler/Hipoteca', type: CategoryType.EXPENSE, color: '#3b82f6', icon: 'home' },
      { name: 'Supermercado', type: CategoryType.EXPENSE, color: '#f59e0b', icon: 'shopping-cart' },
      { name: 'Transporte', type: CategoryType.EXPENSE, color: '#6366f1', icon: 'bus' },
      { name: 'Ocio', type: CategoryType.EXPENSE, color: '#ec4899', icon: 'film' },
      { name: 'Salud', type: CategoryType.EXPENSE, color: '#ef4444', icon: 'activity' },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map(cat => ({ ...cat, userId })),
    });
  }
}
