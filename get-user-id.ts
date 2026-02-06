import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'pmi140979@gmail.com' } 
  })
  if (user) {
    console.log('USER_ID_FOUND:', user.id)
  } else {
    console.log('USER_NOT_FOUND')
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
