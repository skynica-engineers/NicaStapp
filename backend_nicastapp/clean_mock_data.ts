import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanAll() {
  console.log('Limpiando encuentros y competidores...');
  await prisma.valores_metricas_encuentro.deleteMany();
  await prisma.participantes_acta.deleteMany();
  await prisma.periodos_marcador.deleteMany();
  await prisma.competidores_encuentro.deleteMany();
  await prisma.encuentros.deleteMany();

  console.log('Limpiando inscripciones y equipos...');
  await prisma.torneo_inscripciones.deleteMany();
  await prisma.equipos.deleteMany();

  // Acreditaciones (keep the one he just created, delete everything else... wait, we already did this!)
  // So we just clean the teams and matches.
  
  console.log('Limpieza completada.');
}

cleanAll().catch(console.error).finally(() => prisma.$disconnect());
