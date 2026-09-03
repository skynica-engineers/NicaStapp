import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.perfil.findMany();
  fs.writeFileSync('perfiles_dump.json', JSON.stringify(p, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
