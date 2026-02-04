import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Database Connection...');
  console.log('URL:', process.env.DATABASE_URL);
  
  try {
    await prisma.$connect();
    console.log('✅ Connection Successful!');
    const count = await prisma.user.count();
    console.log('User count:', count);
    await prisma.$disconnect();
  } catch (e: any) {
    console.error('❌ Connection Failed:', e.message);
    process.exit(1);
  }
}

main();
