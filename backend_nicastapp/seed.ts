import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`INSERT INTO departamentos (nombre) VALUES ('Managua') ON CONFLICT DO NOTHING`;
    await prisma.$executeRaw`INSERT INTO municipios (departamento_id, nombre) VALUES (1, 'Managua') ON CONFLICT DO NOTHING`;
    console.log('Seed exitoso: Departamento y Municipio base creados (ID 1).');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
