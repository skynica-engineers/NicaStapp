import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const result = await prisma.perfil.update({
    where: { id: "2a31dd7e-5507-4df5-9ed7-d797ae0703bd" },
    data: { verificado: true }
  });
  console.log('Update result:', result);
}
run().catch(console.error).finally(() => prisma.$disconnect());
