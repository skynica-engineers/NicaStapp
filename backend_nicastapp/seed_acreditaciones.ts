import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const organizacion = await prisma.organizaciones.findFirst();
  if (!organizacion) {
    console.log('No hay organizaciones.');
    return;
  }

  const torneo = await prisma.torneos.findFirst({
    where: { organizacion_id: organizacion.id },
    orderBy: { created_at: 'desc' }
  });

  if (!torneo) {
    console.log('No hay torneos para la organizacion. Crea uno primero desde la app.');
    return;
  }

  console.log(`Generando solicitudes para el torneo: "${torneo.nombre}"`);

  // Crear 4 perfiles dummy (jueces y anotadores)
  const personas = [
    { id: '00000000-0000-0000-0001-000000000001', nombre: 'Carlos López Ruiz', rol: 'anotador' },
    { id: '00000000-0000-0000-0001-000000000002', nombre: 'María García Torres', rol: 'juez' },
    { id: '00000000-0000-0000-0001-000000000003', nombre: 'José Martínez Pérez', rol: 'anotador' },
    { id: '00000000-0000-0000-0001-000000000004', nombre: 'Ana Rodríguez Vega', rol: 'juez' },
  ];

  let municipio = await prisma.municipio.findFirst();
  if (!municipio) return;

  for (const p of personas) {
    await prisma.perfil.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, nombreCompleto: p.nombre, municipioId: municipio.id }
    });

    const exists = await prisma.acreditaciones_mesa.findFirst({
      where: { perfil_id: p.id, torneo_id: torneo.id }
    });

    if (!exists) {
      await prisma.acreditaciones_mesa.create({
        data: {
          perfil_id: p.id,
          organizacion_id: organizacion.id,
          torneo_id: torneo.id,
          deporte_id: torneo.deporte_id,
          rol_acreditacion: p.rol,
          estado_aprobacion: 'pendiente'
        }
      });
      console.log(`  → Solicitud creada: ${p.nombre} como ${p.rol}`);
    } else {
      console.log(`  → Ya existe solicitud para ${p.nombre}`);
    }
  }

  console.log('\n✅ Seed de acreditaciones completado.');
  console.log(`   4 solicitudes (2 Anotadores + 2 Jueces) asignadas al torneo "${torneo.nombre}"`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
