import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos ficticios...');

  // 1. Departamentos y Municipios
  const dep1 = await prisma.departamento.upsert({
    where: { nombre: 'Managua' },
    update: {},
    create: { nombre: 'Managua' },
  });
  const dep2 = await prisma.departamento.upsert({
    where: { nombre: 'Estelí' },
    update: {},
    create: { nombre: 'Estelí' },
  });

  const mun1 = await prisma.municipio.create({ data: { nombre: 'Managua', departamentoId: dep1.id } }).catch(e => prisma.municipio.findFirst({where:{nombre:'Managua'}}));
  const mun2 = await prisma.municipio.create({ data: { nombre: 'Estelí', departamentoId: dep2.id } }).catch(e => prisma.municipio.findFirst({where:{nombre:'Estelí'}}));

  const munId = mun1!.id;

  // 2. AuthUsers y Perfiles (Usuarios Ficticios)
  const perfilesData = [
    { email: 'admin1@nicastapp.com', passwordHash: '123456', nombreCompleto: 'Carlos Admin', municipioId: munId, verificado: true },
    { email: 'coach@nicastapp.com', passwordHash: '123456', nombreCompleto: 'Julio Entrenador', municipioId: munId, verificado: true },
    { email: 'jugador1@nicastapp.com', passwordHash: '123456', nombreCompleto: 'Juan Pérez', municipioId: munId, verificado: true },
    { email: 'jugador2@nicastapp.com', passwordHash: '123456', nombreCompleto: 'Marcos López', municipioId: munId, verificado: true },
  ];
  
  const perfiles = [];
  for (const p of perfilesData) {
    let authUser = await prisma.authUser.findUnique({ where: { email: p.email } });
    if (!authUser) {
      authUser = await prisma.authUser.create({ data: { email: p.email, passwordHash: p.passwordHash } });
    }
    let perfil = await prisma.perfil.findUnique({ where: { id: authUser.id } });
    if (!perfil) {
      perfil = await prisma.perfil.create({ 
        data: { 
          id: authUser.id, 
          nombreCompleto: p.nombreCompleto, 
          municipioId: p.municipioId, 
          verificado: p.verificado 
        } 
      });
    }
    perfiles.push(perfil);
  }

  // 3. Deportes
  const deportesData = [
    { nombre: 'Fútbol Sala', codigo_clave: 'FUTSAL', tipo_competencia: 'equipos' },
    { nombre: 'Baloncesto', codigo_clave: 'BKB', tipo_competencia: 'equipos' },
    { nombre: 'Voleibol', codigo_clave: 'VOLEY', tipo_competencia: 'equipos' },
    { nombre: 'Béisbol', codigo_clave: 'BSB', tipo_competencia: 'equipos' }
  ];
  const deportes = [];
  for (const d of deportesData) {
    let dep = await prisma.deportes.findUnique({ where: { codigo_clave: d.codigo_clave } });
    if (!dep) dep = await prisma.deportes.create({ data: d });
    deportes.push(dep);
  }

  // 4. Métricas Catálogo (Ej. Fútbol Sala)
  const metricasData = [
    { deporte_id: deportes[0].id, clave_metrica: 'Goles', nombre_visible: 'Goles Anotados', tipo_dato: 'entero', ambito: 'ofensiva' },
    { deporte_id: deportes[0].id, clave_metrica: 'Asist', nombre_visible: 'Asistencias', tipo_dato: 'entero', ambito: 'ofensiva' },
    { deporte_id: deportes[0].id, clave_metrica: 'TA', nombre_visible: 'Tarjetas Amarillas', tipo_dato: 'entero', ambito: 'disciplina' },
    { deporte_id: deportes[0].id, clave_metrica: 'TR', nombre_visible: 'Tarjetas Rojas', tipo_dato: 'entero', ambito: 'disciplina' },
  ];
  const metricas = [];
  for (const m of metricasData) {
    let met = await prisma.metricas_catalogo.findFirst({ where: { clave_metrica: m.clave_metrica, deporte_id: m.deporte_id } });
    if (!met) met = await prisma.metricas_catalogo.create({ data: m });
    metricas.push(met);
  }

  // 5. Organizaciones (Ligas)
  let org = await prisma.organizaciones.findFirst({ where: { nombre: 'Liga Primera Nacional' } });
  if (!org) {
    org = await prisma.organizaciones.create({
      data: {
        nombre: 'Liga Primera Nacional',
        tipo_institucion: 'Asociación',
        municipio_id: munId,
        creador_id: perfiles[0].id
      }
    });
  }

  // 6. Equipos
  const equiposData = [
    { nombre: 'Real Estelí Futsal', deporte_id: deportes[0].id, municipio_id: mun2!.id, administrador_id: perfiles[1].id },
    { nombre: 'Managua FC', deporte_id: deportes[0].id, municipio_id: mun1!.id, administrador_id: perfiles[1].id },
    { nombre: 'Diriangén Futsal', deporte_id: deportes[0].id, municipio_id: mun1!.id, administrador_id: perfiles[1].id },
  ];
  const equipos = [];
  for (const eq of equiposData) {
    let e = await prisma.equipos.findFirst({ where: { nombre: eq.nombre } });
    if (!e) e = await prisma.equipos.create({ data: eq });
    equipos.push(e);
  }

  // 7. Atletas
  const atletasData = [
    { nombre_completo: 'Juan Pérez', identificacion: '001-000000-0000A', equipo_id: equipos[0].id, perfil_id: perfiles[2].id },
    { nombre_completo: 'Marcos López', identificacion: '001-000000-0000B', equipo_id: equipos[0].id, perfil_id: perfiles[3].id },
    { nombre_completo: 'Carlos Sánchez', identificacion: '001-000000-0000C', equipo_id: equipos[1].id },
    { nombre_completo: 'Luis Martínez', identificacion: '001-000000-0000D', equipo_id: equipos[1].id },
    { nombre_completo: 'Pedro Gómez', identificacion: '001-000000-0000E', equipo_id: equipos[2].id },
    { nombre_completo: 'Mario Ruiz', identificacion: '001-000000-0000F', equipo_id: equipos[2].id },
  ];
  const atletas = [];
  for (const atl of atletasData) {
    let a = await prisma.atletas.findFirst({ where: { identificacion: atl.identificacion } });
    if (!a) a = await prisma.atletas.create({ data: atl });
    atletas.push(a);
  }

  // 8. Torneos
  let torneo = await prisma.torneos.findFirst({ where: { nombre: 'Torneo Apertura 2026' } });
  if (!torneo) {
    torneo = await prisma.torneos.create({
      data: {
        nombre: 'Torneo Apertura 2026',
        categoria_territorial: 'Mayor',
        deporte_id: deportes[0].id,
        organizacion_id: org.id,
        temporada: '2026'
      }
    });
  }

  // 9. Inscripciones Torneo
  for (const eq of equipos) {
    let ins = await prisma.torneo_inscripciones.findFirst({ where: { equipo_id: eq.id, torneo_id: torneo.id } });
    if (!ins) await prisma.torneo_inscripciones.create({ data: { equipo_id: eq.id, torneo_id: torneo.id, estado_inscripcion: 'aprobado' } });
  }

  // Limpiar encuentros anteriores para evitar duplicados en cada ejecución
  await prisma.valores_metricas_encuentro.deleteMany({});
  await prisma.competidores_encuentro.deleteMany({});
  await prisma.encuentros.deleteMany({});

  // 10. Encuentros (Calendario)
  const fechasBase = [
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace 1 semana (finalizado)
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días (finalizado)
    new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Mañana (programado)
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // En 5 días (programado)
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // En 10 días (programado)
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // En 15 días (programado)
  ];
  
  const sedes = ['Polideportivo España', 'Cancha de Luis Alfonso', 'Gimnasio Nacional', 'Cancha del parque central'];

  const encuentrosArr = [];
  for (let i = 0; i < fechasBase.length; i++) {
    const isPast = fechasBase[i].getTime() < Date.now();
    let enc = await prisma.encuentros.create({
      data: {
        torneo_id: torneo.id,
        anotador_id: perfiles[0].id,
        fecha_hora: fechasBase[i],
        sede_instalacion: sedes[i % sedes.length],
        estado_encuentro: isPast ? 'finalizado' : 'programado'
      }
    });
    encuentrosArr.push(enc);

    // Asignar 2 equipos al azar al encuentro (Local y Visitante)
    const eq1 = equipos[i % equipos.length];
    const eq2 = equipos[(i + 1) % equipos.length];

    await prisma.competidores_encuentro.createMany({
      data: [
        { encuentro_id: enc.id, equipo_id: eq1.id, rol_posicion_etiqueta: 'Local' },
        { encuentro_id: enc.id, equipo_id: eq2.id, rol_posicion_etiqueta: 'Visitante' },
      ]
    });

    // 11. Valores de Métricas solo si finalizó
    if (isPast) {
      for (const atleta of atletas) {
        // Solo simular para los atletas que pertenecen a eq1 o eq2
        if (atleta.equipo_id === eq1.id || atleta.equipo_id === eq2.id) {
          for (const metrica of metricas) {
             await prisma.valores_metricas_encuentro.create({
                data: {
                  atleta_id: atleta.id,
                  encuentro_id: enc.id,
                  metrica_id: metrica.id,
                  valor_registrado: Math.floor(Math.random() * 5)
                }
             });
          }
        }
      }
    }
  }

  console.log('Datos ficticios cargados exitosamente.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
