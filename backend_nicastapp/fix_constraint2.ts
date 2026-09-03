import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_id_fkey;`;
    console.log('Foreign key de perfiles eliminada exitosamente.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
