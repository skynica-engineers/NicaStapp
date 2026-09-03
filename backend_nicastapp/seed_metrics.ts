import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deportes = await prisma.deportes.findMany();
  if (deportes.length === 0) {
    console.log('No hay deportes en la BD. Crea deportes primero.');
    return;
  }

  const beisbol = deportes.find(d => d.nombre.toLowerCase().includes('beisbol'));
  const futbol = deportes.find(d => d.nombre.toLowerCase().includes('futbol') || d.nombre.toLowerCase().includes('fútbol'));

  if (beisbol) {
    await prisma.metricas_catalogo.createMany({
      data: [
        { deporte_id: beisbol.id, clave_metrica: 'C', nombre_visible: 'Carreras', tipo_dato: 'integer', ambito: 'equipo' },
        { deporte_id: beisbol.id, clave_metrica: 'H', nombre_visible: 'Hits', tipo_dato: 'integer', ambito: 'equipo' },
        { deporte_id: beisbol.id, clave_metrica: 'E', nombre_visible: 'Errores', tipo_dato: 'integer', ambito: 'equipo' },
      ],
      skipDuplicates: true,
    });
  }

  if (futbol) {
    await prisma.metricas_catalogo.createMany({
      data: [
        { deporte_id: futbol.id, clave_metrica: 'G', nombre_visible: 'Goles', tipo_dato: 'integer', ambito: 'equipo' },
        { deporte_id: futbol.id, clave_metrica: 'TA', nombre_visible: 'Tarjetas Amarillas', tipo_dato: 'integer', ambito: 'equipo' },
        { deporte_id: futbol.id, clave_metrica: 'TR', nombre_visible: 'Tarjetas Rojas', tipo_dato: 'integer', ambito: 'equipo' },
      ],
      skipDuplicates: true,
    });
  }

  console.log('Seed de métricas completado');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
