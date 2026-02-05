import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const categoriesCount = await prisma.category.count({
      where: { userId: user.id }
    });
    
    if (categoriesCount === 0) {
      console.log(`Seeding categories for user: ${user.email}`);
      const defaultCategories = [
        { name: 'Sueldo', type: CategoryType.INCOME, color: '#10b981', icon: 'wallet' },
        { name: 'Alquiler/Hipoteca', type: CategoryType.EXPENSE, color: '#3b82f6', icon: 'home' },
        { name: 'Supermercado', type: CategoryType.EXPENSE, color: '#f59e0b', icon: 'shopping-cart' },
        { name: 'Transporte', type: CategoryType.EXPENSE, color: '#6366f1', icon: 'bus' },
        { name: 'Ocio', type: CategoryType.EXPENSE, color: '#ec4899', icon: 'film' },
        { name: 'Salud', type: CategoryType.EXPENSE, color: '#ef4444', icon: 'activity' },
      ];

      await prisma.category.createMany({
        data: defaultCategories.map(cat => ({ ...cat, userId: user.id })),
      });
    } else {
      console.log(`User ${user.email} already has categories.`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
