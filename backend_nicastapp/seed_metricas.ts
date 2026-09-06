import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const deportes = await prisma.deportes.findMany();
  console.log('Deportes:', deportes.map(d => d.nombre));

  for (const deporte of deportes) {
    const dName = deporte.nombre.toLowerCase();
    const metricas = [];

    if (dName.includes('futbol') || dName.includes('fútbol')) {
      metricas.push(
        { clave_metrica: 'goles', nombre_visible: 'Goles', tipo_dato: 'numero', ambito: 'equipo' },
        { clave_metrica: 'goles_contra', nombre_visible: 'Goles en Contra', tipo_dato: 'numero', ambito: 'equipo' },
        { clave_metrica: 'tarjetas_amarillas', nombre_visible: 'T. Amarillas', tipo_dato: 'numero', ambito: 'equipo' },
        { clave_metrica: 'tarjetas_rojas', nombre_visible: 'T. Rojas', tipo_dato: 'numero', ambito: 'equipo' }
      );
    } else if (dName.includes('beisbol') || dName.includes('béisbol') || dName.includes('softbol') || dName.includes('softball') || dName.includes('kickball')) {
      metricas.push(
        { clave_metrica: 'carreras', nombre_visible: 'Carreras', tipo_dato: 'numero', ambito: 'equipo' },
        { clave_metrica: 'hits', nombre_visible: 'Hits', tipo_dato: 'numero', ambito: 'equipo' },
        { clave_metrica: 'errores', nombre_visible: 'Errores', tipo_dato: 'numero', ambito: 'equipo' }
      );
    } else {
      // Default
      metricas.push(
        { clave_metrica: 'puntos', nombre_visible: 'Puntos', tipo_dato: 'numero', ambito: 'equipo' }
      );
    }

    for (const metrica of metricas) {
      const exists = await prisma.metricas_catalogo.findFirst({
        where: { deporte_id: deporte.id, clave_metrica: metrica.clave_metrica }
      });
      if (!exists) {
        await prisma.metricas_catalogo.create({
          data: { ...metrica, deporte_id: deporte.id }
        });
        console.log(`Created ${metrica.clave_metrica} for ${deporte.nombre}`);
      } else {
        console.log(`${metrica.clave_metrica} already exists for ${deporte.nombre}`);
      }
    }
  }
}

seed().catch(console.error).finally(() => prisma.$disconnect());
