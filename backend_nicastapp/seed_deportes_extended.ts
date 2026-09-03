import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deportes = [
    { nombre: 'Béisbol', codigo_clave: 'BSB', tipo_competencia: 'equipo' },
    { nombre: 'Fútbol', codigo_clave: 'FUT', tipo_competencia: 'equipo' },
    { nombre: 'Softbol', codigo_clave: 'SFT', tipo_competencia: 'equipo' },
    { nombre: 'Kickball', codigo_clave: 'KCK', tipo_competencia: 'equipo' },
    { nombre: 'Boxeo', codigo_clave: 'BOX', tipo_competencia: 'individual' }
  ];

  for (const d of deportes) {
    await prisma.deportes.upsert({
      where: { nombre: d.nombre },
      update: {},
      create: d,
    });
  }
  console.log('Nuevos deportes agregados a la BD.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
