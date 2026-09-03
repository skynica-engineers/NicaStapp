import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const torneo = await prisma.torneos.findFirst({ orderBy: { created_at: 'desc' } });
  if (!torneo) {
    console.log('No hay torneos. Crea uno desde la app primero.');
    return;
  }
  console.log(`Seeding equipos para torneo: "${torneo.nombre}"`);

  // Buscar municipio y crear comunidad si no existe
  const municipio = await prisma.municipio.findFirst();
  if (!municipio) { console.log('No hay municipios'); return; }

  let comunidad = await prisma.comunidades.findFirst({ where: { municipio_id: municipio.id } });
  if (!comunidad) {
    comunidad = await prisma.comunidades.create({
      data: { nombre: 'Comunidad Central', municipio_id: municipio.id }
    });
  }

  // Buscar administrador (cualquier perfil existente)
  const perfil = await prisma.perfil.findFirst();
  if (!perfil) { console.log('No hay perfiles'); return; }

  const equiposData = [
    { nombre: 'Los Toros de Boaco', estado: 'pendiente' },
    { nombre: 'Águilas de Camoapa', estado: 'pendiente' },
    { nombre: 'Caciques del Norte', estado: 'aprobado' },
  ];

  for (const eq of equiposData) {
    // Crear equipo
    const equipo = await prisma.equipos.create({
      data: {
        nombre: eq.nombre,
        deporte_id: torneo.deporte_id,
        comunidad_id: comunidad.id,
        administrador_id: perfil.id,
      }
    });

    // Inscribir al torneo
    const exists = await prisma.torneo_inscripciones.findFirst({
      where: { torneo_id: torneo.id, equipo_id: equipo.id }
    });
    if (!exists) {
      await prisma.torneo_inscripciones.create({
        data: {
          torneo_id: torneo.id,
          equipo_id: equipo.id,
          estado_inscripcion: eq.estado
        }
      });
      console.log(`  → Equipo "${eq.nombre}" inscrito con estado "${eq.estado}"`);
    }
  }

  console.log('\n✅ Seed de inscripciones completado.');
  console.log('   2 equipos pendientes + 1 equipo aprobado.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
