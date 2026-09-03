import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deportes = [
    { nombre: 'Béisbol', codigo_clave: 'BSB', tipo_competencia: 'equipo' },
    { nombre: 'Fútbol', codigo_clave: 'FUT', tipo_competencia: 'equipo' },
    { nombre: 'Baloncesto', codigo_clave: 'BKT', tipo_competencia: 'equipo' }
  ];

  for (const d of deportes) {
    await prisma.deportes.upsert({
      where: { nombre: d.nombre },
      update: {},
      create: d,
    });
  }
  console.log('Deportes seed completado.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
