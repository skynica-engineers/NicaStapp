-- CreateTable
CREATE TABLE "auth_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles" (
    "id" UUID NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "avatar_url" TEXT,
    "municipio_id" INTEGER NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipios" (
    "id" SERIAL NOT NULL,
    "departamento_id" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acreditaciones_mesa" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "perfil_id" UUID NOT NULL,
    "organizacion_id" UUID NOT NULL,
    "torneo_id" UUID,
    "deporte_id" INTEGER NOT NULL,
    "rol_acreditacion" VARCHAR(30) NOT NULL DEFAULT 'anotador',
    "estado_aprobacion" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "fecha_emision" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acreditaciones_mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atletas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre_completo" VARCHAR(150) NOT NULL,
    "identificacion" VARCHAR(50),
    "equipo_id" UUID,
    "perfil_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atletas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competidores_encuentro" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "encuentro_id" UUID NOT NULL,
    "equipo_id" UUID,
    "atleta_id" UUID,
    "rol_posicion_etiqueta" VARCHAR(50),
    "puntuacion_final" DECIMAL(10,2) DEFAULT 0,
    "es_ganador" BOOLEAN DEFAULT false,

    CONSTRAINT "competidores_encuentro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunicados" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizacion_id" UUID NOT NULL,
    "torneo_id" UUID,
    "titulo" VARCHAR(200) NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo_aviso" VARCHAR(50) NOT NULL,
    "fecha_publicacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunicados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunidades" (
    "id" SERIAL NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deportes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "codigo_clave" VARCHAR(20) NOT NULL,
    "tipo_competencia" VARCHAR(30) NOT NULL,

    CONSTRAINT "deportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuentros" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "torneo_id" UUID NOT NULL,
    "anotador_id" UUID NOT NULL,
    "fecha_hora" TIMESTAMP(6) NOT NULL,
    "sede_instalacion" VARCHAR(150) NOT NULL,
    "estado_encuentro" VARCHAR(30) NOT NULL DEFAULT 'programado',
    "transmision_url" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encuentros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "deporte_id" INTEGER NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "administrador_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metricas_catalogo" (
    "id" SERIAL NOT NULL,
    "deporte_id" INTEGER NOT NULL,
    "clave_metrica" VARCHAR(30) NOT NULL,
    "nombre_visible" VARCHAR(100) NOT NULL,
    "tipo_dato" VARCHAR(20) NOT NULL,
    "ambito" VARCHAR(30) NOT NULL,

    CONSTRAINT "metricas_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizacion_miembros" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizacion_id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,
    "rol_interno" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizacion_miembros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizaciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(150) NOT NULL,
    "tipo_institucion" VARCHAR(50) NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "creador_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participantes_acta" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "competidor_encuentro_id" UUID NOT NULL,
    "atleta_id" UUID NOT NULL,
    "posicion_rol" VARCHAR(50),
    "es_titular" BOOLEAN DEFAULT true,

    CONSTRAINT "participantes_acta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos_marcador" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "competidor_encuentro_id" UUID NOT NULL,
    "numero_periodo" INTEGER NOT NULL,
    "puntos_acumulados" DECIMAL(10,2) DEFAULT 0,

    CONSTRAINT "periodos_marcador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "torneo_inscripciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "torneo_id" UUID NOT NULL,
    "equipo_id" UUID,
    "atleta_id" UUID,
    "estado_inscripcion" VARCHAR(20) NOT NULL DEFAULT 'aprobado',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "torneo_inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "torneos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(150) NOT NULL,
    "categoria_territorial" VARCHAR(50) NOT NULL,
    "deporte_id" INTEGER NOT NULL,
    "organizacion_id" UUID NOT NULL,
    "temporada" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'en_curso',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "torneos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valores_metricas_encuentro" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "encuentro_id" UUID NOT NULL,
    "atleta_id" UUID NOT NULL,
    "metrica_id" INTEGER NOT NULL,
    "valor_registrado" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valores_metricas_encuentro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_vinculacion_atleta" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "atleta_id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,
    "estado_solicitud" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_vinculacion_atleta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_email_key" ON "auth_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nombre_key" ON "departamentos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "atletas_perfil_id_key" ON "atletas"("perfil_id");

-- CreateIndex
CREATE UNIQUE INDEX "deportes_nombre_key" ON "deportes"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "deportes_codigo_clave_key" ON "deportes"("codigo_clave");

-- AddForeignKey
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "municipios" ADD CONSTRAINT "municipios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "acreditaciones_mesa" ADD CONSTRAINT "acreditaciones_mesa_deporte_id_fkey" FOREIGN KEY ("deporte_id") REFERENCES "deportes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "acreditaciones_mesa" ADD CONSTRAINT "acreditaciones_mesa_organizacion_id_fkey" FOREIGN KEY ("organizacion_id") REFERENCES "organizaciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "acreditaciones_mesa" ADD CONSTRAINT "acreditaciones_mesa_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "acreditaciones_mesa" ADD CONSTRAINT "acreditaciones_mesa_torneo_id_fkey" FOREIGN KEY ("torneo_id") REFERENCES "torneos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "atletas" ADD CONSTRAINT "atletas_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "competidores_encuentro" ADD CONSTRAINT "competidores_encuentro_atleta_id_fkey" FOREIGN KEY ("atleta_id") REFERENCES "atletas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "competidores_encuentro" ADD CONSTRAINT "competidores_encuentro_encuentro_id_fkey" FOREIGN KEY ("encuentro_id") REFERENCES "encuentros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "competidores_encuentro" ADD CONSTRAINT "competidores_encuentro_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_organizacion_id_fkey" FOREIGN KEY ("organizacion_id") REFERENCES "organizaciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_torneo_id_fkey" FOREIGN KEY ("torneo_id") REFERENCES "torneos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comunidades" ADD CONSTRAINT "comunidades_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "encuentros" ADD CONSTRAINT "encuentros_anotador_id_fkey" FOREIGN KEY ("anotador_id") REFERENCES "perfiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "encuentros" ADD CONSTRAINT "encuentros_torneo_id_fkey" FOREIGN KEY ("torneo_id") REFERENCES "torneos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_administrador_id_fkey" FOREIGN KEY ("administrador_id") REFERENCES "perfiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_deporte_id_fkey" FOREIGN KEY ("deporte_id") REFERENCES "deportes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "metricas_catalogo" ADD CONSTRAINT "metricas_catalogo_deporte_id_fkey" FOREIGN KEY ("deporte_id") REFERENCES "deportes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organizacion_miembros" ADD CONSTRAINT "organizacion_miembros_organizacion_id_fkey" FOREIGN KEY ("organizacion_id") REFERENCES "organizaciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organizacion_miembros" ADD CONSTRAINT "organizacion_miembros_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organizaciones" ADD CONSTRAINT "organizaciones_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "perfiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organizaciones" ADD CONSTRAINT "organizaciones_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participantes_acta" ADD CONSTRAINT "participantes_acta_atleta_id_fkey" FOREIGN KEY ("atleta_id") REFERENCES "atletas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participantes_acta" ADD CONSTRAINT "participantes_acta_competidor_encuentro_id_fkey" FOREIGN KEY ("competidor_encuentro_id") REFERENCES "competidores_encuentro"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "periodos_marcador" ADD CONSTRAINT "periodos_marcador_competidor_encuentro_id_fkey" FOREIGN KEY ("competidor_encuentro_id") REFERENCES "competidores_encuentro"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "torneo_inscripciones" ADD CONSTRAINT "torneo_inscripciones_atleta_id_fkey" FOREIGN KEY ("atleta_id") REFERENCES "atletas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "torneo_inscripciones" ADD CONSTRAINT "torneo_inscripciones_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "torneo_inscripciones" ADD CONSTRAINT "torneo_inscripciones_torneo_id_fkey" FOREIGN KEY ("torneo_id") REFERENCES "torneos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_deporte_id_fkey" FOREIGN KEY ("deporte_id") REFERENCES "deportes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_organizacion_id_fkey" FOREIGN KEY ("organizacion_id") REFERENCES "organizaciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "valores_metricas_encuentro" ADD CONSTRAINT "valores_metricas_encuentro_atleta_id_fkey" FOREIGN KEY ("atleta_id") REFERENCES "atletas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "valores_metricas_encuentro" ADD CONSTRAINT "valores_metricas_encuentro_encuentro_id_fkey" FOREIGN KEY ("encuentro_id") REFERENCES "encuentros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "valores_metricas_encuentro" ADD CONSTRAINT "valores_metricas_encuentro_metrica_id_fkey" FOREIGN KEY ("metrica_id") REFERENCES "metricas_catalogo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudes_vinculacion_atleta" ADD CONSTRAINT "solicitudes_vinculacion_atleta_atleta_id_fkey" FOREIGN KEY ("atleta_id") REFERENCES "atletas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_vinculacion_atleta" ADD CONSTRAINT "solicitudes_vinculacion_atleta_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

