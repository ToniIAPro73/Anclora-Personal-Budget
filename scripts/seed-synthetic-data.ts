import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Synthetic Financial Dataset Generator
 * 
 * User Profile:
 * - Monthly Income: €2,600 (Nómina)
 * - Rent: €820/month
 * - Lifestyle: Austere (no car, minimal expenses)
 * - AI Tool Subscriptions (Monthly):
 *   - ChatGPT Pro: €20
 *   - Perplexity Pro: €20
 *   - Claude Pro: €20
 *   - Gemini Pro: €19.99
 *   - Canva Pro: €11.99
 * - Period: 01/01/2024 to 05/02/2026
 */

const USER_ID = 'synthetic-user-001'; // Replace with actual user ID
const START_DATE = new Date('2024-01-01');
const END_DATE = new Date('2026-02-05');

// AI Subscriptions
const AI_SUBSCRIPTIONS = [
  { name: 'ChatGPT Pro', amount: 20, day: 5 },
  { name: 'Perplexity Pro', amount: 20, day: 8 },
  { name: 'Claude Pro', amount: 20, day: 12 },
  { name: 'Gemini Pro', amount: 19.99, day: 15 },
  { name: 'Canva Pro', amount: 11.99, day: 20 },
];

// Monthly fixed expenses
const MONTHLY_RENT = 820;
const MONTHLY_INCOME = 2600;

// Austere lifestyle expense ranges (weekly)
const GROCERIES_RANGE = [40, 60]; // €40-60/week
const UTILITIES_RANGE = [30, 50]; // €30-50/month
const TRANSPORT_RANGE = [15, 25]; // €15-25/week (public transport)
const MISC_RANGE = [10, 30]; // €10-30/week (misc small expenses)

async function main() {
  console.log('🚀 Starting synthetic dataset generation...\n');

  // 1. Create or get user
  console.log('👤 Creating user...');
  const user = await prisma.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: {
      id: USER_ID,
      email: 'usuario@anclora.com',
      name: 'Usuario',
      defaultCurrency: 'EUR',
      locale: 'es-ES',
      timezone: 'Europe/Madrid',
    },
  });
  console.log(`✅ User created: ${user.email}\n`);

  // 2. Create account
  console.log('🏦 Creating bank account...');
  const account = await prisma.account.upsert({
    where: { id: 'account-checking-001' },
    update: {},
    create: {
      id: 'account-checking-001',
      userId: user.id,
      name: 'Cuenta Corriente Principal',
      type: 'CHECKING',
      currency: 'EUR',
      currentBalance: 0, // Will be calculated
      initialBalance: 1000, // Starting balance
      color: '#3B82F6',
      icon: 'bank',
      isActive: true,
    },
  });
  console.log(`✅ Account created: ${account.name}\n`);

  // 3. Create categories
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    // Income
    prisma.category.upsert({
      where: { id: 'cat-income-salary' },
      update: {},
      create: {
        id: 'cat-income-salary',
        userId: user.id,
        name: 'Nómina',
        type: 'INCOME',
        color: '#10B981',
        icon: 'trending-up',
        keywords: ['nómina', 'salario', 'sueldo'],
      },
    }),
    // Expenses
    prisma.category.upsert({
      where: { id: 'cat-expense-rent' },
      update: {},
      create: {
        id: 'cat-expense-rent',
        userId: user.id,
        name: 'Alquiler',
        type: 'EXPENSE',
        color: '#EF4444',
        icon: 'home',
        keywords: ['alquiler', 'renta', 'vivienda'],
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-expense-groceries' },
      update: {},
      create: {
        id: 'cat-expense-groceries',
        userId: user.id,
        name: 'Comida',
        type: 'EXPENSE',
        color: '#F59E0B',
        icon: 'shopping-cart',
        keywords: ['supermercado', 'comida', 'alimentación'],
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-expense-subscriptions' },
      update: {},
      create: {
        id: 'cat-expense-subscriptions',
        userId: user.id,
        name: 'Suscripciones IA',
        type: 'EXPENSE',
        color: '#8B5CF6',
        icon: 'sparkles',
        keywords: ['chatgpt', 'claude', 'gemini', 'perplexity', 'canva', 'ia', 'ai'],
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-expense-utilities' },
      update: {},
      create: {
        id: 'cat-expense-utilities',
        userId: user.id,
        name: 'Servicios',
        type: 'EXPENSE',
        color: '#6366F1',
        icon: 'zap',
        keywords: ['luz', 'agua', 'internet', 'móvil'],
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-expense-transport' },
      update: {},
      create: {
        id: 'cat-expense-transport',
        userId: user.id,
        name: 'Transporte',
        type: 'EXPENSE',
        color: '#14B8A6',
        icon: 'bus',
        keywords: ['metro', 'bus', 'transporte', 'público'],
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-expense-misc' },
      update: {},
      create: {
        id: 'cat-expense-misc',
        userId: user.id,
        name: 'Otros',
        type: 'EXPENSE',
        color: '#64748B',
        icon: 'more-horizontal',
        keywords: ['varios', 'otros', 'misc'],
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories\n`);

  // 4. Generate transactions
  console.log('💸 Generating transactions...');
  const transactions: Prisma.TransactionCreateManyInput[] = [];
  let currentDate = new Date(START_DATE);
  let runningBalance = Number(account.initialBalance);

  while (currentDate <= END_DATE) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Monthly income (day 1 of each month)
    if (currentDate.getDate() === 1) {
      transactions.push({
        id: `txn-income-${year}-${month + 1}`,
        userId: user.id,
        accountId: account.id,
        categoryId: 'cat-income-salary',
        amount: MONTHLY_INCOME,
        type: 'INCOME' as const,
        description: `Nómina ${currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
        date: new Date(currentDate),
        isReconciled: true,
        reconciledAt: new Date(currentDate),
      });
      runningBalance += MONTHLY_INCOME;
    }

    // Monthly rent (day 5 of each month)
    if (currentDate.getDate() === 5) {
      transactions.push({
        id: `txn-rent-${year}-${month + 1}`,
        userId: user.id,
        accountId: account.id,
        categoryId: 'cat-expense-rent',
        amount: MONTHLY_RENT,
        type: 'EXPENSE' as const,
        description: 'Alquiler mensual',
        date: new Date(currentDate),
        isReconciled: true,
        reconciledAt: new Date(currentDate),
      });
      runningBalance -= MONTHLY_RENT;
    }

    // AI Subscriptions
    for (const sub of AI_SUBSCRIPTIONS) {
      if (currentDate.getDate() === sub.day) {
        transactions.push({
          id: `txn-sub-${sub.name.toLowerCase().replace(/\s+/g, '-')}-${year}-${month + 1}`,
          userId: user.id,
          accountId: account.id,
          categoryId: 'cat-expense-subscriptions',
          amount: sub.amount,
          type: 'EXPENSE' as const,
          description: `Suscripción ${sub.name}`,
          date: new Date(currentDate),
          isReconciled: true,
          reconciledAt: new Date(currentDate),
          isRecurring: true,
        });
        runningBalance -= sub.amount;
      }
    }

    // Weekly groceries (Sundays)
    if (currentDate.getDay() === 0) {
      const amount = Math.random() * (GROCERIES_RANGE[1] - GROCERIES_RANGE[0]) + GROCERIES_RANGE[0];
      transactions.push({
        id: `txn-groceries-${currentDate.getTime()}`,
        userId: user.id,
        accountId: account.id,
        categoryId: 'cat-expense-groceries',
        amount: Math.round(amount * 100) / 100,
        type: 'EXPENSE' as const,
        description: 'Compra supermercado',
        date: new Date(currentDate),
        merchant: ['Mercadona', 'Carrefour', 'Lidl'][Math.floor(Math.random() * 3)],
        isReconciled: true,
        reconciledAt: new Date(currentDate),
      });
      runningBalance -= amount;
    }

    // Monthly utilities (day 10)
    if (currentDate.getDate() === 10) {
      const amount = Math.random() * (UTILITIES_RANGE[1] - UTILITIES_RANGE[0]) + UTILITIES_RANGE[0];
      transactions.push({
        id: `txn-utilities-${year}-${month + 1}`,
        userId: user.id,
        accountId: account.id,
        categoryId: 'cat-expense-utilities',
        amount: Math.round(amount * 100) / 100,
        type: 'EXPENSE' as const,
        description: 'Servicios (luz, agua, internet)',
        date: new Date(currentDate),
        isReconciled: true,
        reconciledAt: new Date(currentDate),
      });
      runningBalance -= amount;
    }

    // Weekly transport (Mondays)
    if (currentDate.getDay() === 1) {
      const amount = Math.random() * (TRANSPORT_RANGE[1] - TRANSPORT_RANGE[0]) + TRANSPORT_RANGE[0];
      transactions.push({
        id: `txn-transport-${currentDate.getTime()}`,
        userId: user.id,
        accountId: account.id,
        categoryId: 'cat-expense-transport',
        amount: Math.round(amount * 100) / 100,
        type: 'EXPENSE' as const,
        description: 'Recarga transporte público',
        date: new Date(currentDate),
        isReconciled: true,
        reconciledAt: new Date(currentDate),
      });
      runningBalance -= amount;
    }

    // Random misc expenses (2-3 times per week)
    if (Math.random() > 0.6) {
      const amount = Math.random() * (MISC_RANGE[1] - MISC_RANGE[0]) + MISC_RANGE[0];
      transactions.push({
        id: `txn-misc-${currentDate.getTime()}-${Math.random()}`,
        userId: user.id,
        accountId: account.id,
        categoryId: 'cat-expense-misc',
        amount: Math.round(amount * 100) / 100,
        type: 'EXPENSE' as const,
        description: ['Café', 'Farmacia', 'Papelería', 'Otros gastos'][Math.floor(Math.random() * 4)],
        date: new Date(currentDate),
        isReconciled: true,
        reconciledAt: new Date(currentDate),
      });
      runningBalance -= amount;
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`📊 Generated ${transactions.length} transactions`);
  console.log(`💰 Final balance: €${runningBalance.toFixed(2)}\n`);

  // 5. Insert transactions in batches
  console.log('💾 Inserting transactions into database...');
  const BATCH_SIZE = 100;
  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);
    await prisma.transaction.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`  ✓ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(transactions.length / BATCH_SIZE)}`);
  }

  // 6. Update account balance
  await prisma.account.update({
    where: { id: account.id },
    data: { currentBalance: runningBalance },
  });

  console.log('\n✅ Dataset generation completed successfully!');
  console.log(`\n📈 Summary:`);
  console.log(`   - User: ${user.email}`);
  console.log(`   - Account: ${account.name}`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Transactions: ${transactions.length}`);
  console.log(`   - Period: ${START_DATE.toLocaleDateString('es-ES')} - ${END_DATE.toLocaleDateString('es-ES')}`);
  console.log(`   - Final Balance: €${runningBalance.toFixed(2)}`);
}

main()
  .catch((e) => {
    console.error('❌ Error generating dataset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
