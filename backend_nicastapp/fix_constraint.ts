import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`ALTER TABLE auth_users DROP CONSTRAINT IF EXISTS auth_users_id_fkey;`;
    console.log('Foreign key constraint eliminada exitosamente.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
