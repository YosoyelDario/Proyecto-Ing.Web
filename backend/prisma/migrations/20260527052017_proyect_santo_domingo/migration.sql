-- CreateTable
CREATE TABLE "especialidad" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(64) NOT NULL,

    CONSTRAINT "especialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profesional" (
    "id" SERIAL NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "nombre" VARCHAR(64) NOT NULL,
    "id_especialidad" INTEGER NOT NULL,

    CONSTRAINT "profesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dia_laboral" (
    "id" SERIAL NOT NULL,
    "id_medico" INTEGER NOT NULL,
    "diaSemana" SMALLINT NOT NULL,
    "horaInicio" TIME NOT NULL,
    "horaFin" TIME NOT NULL,
    "duracionHora" TIME NOT NULL,

    CONSTRAINT "dia_laboral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "excepcion_dia_laboral" (
    "id" SERIAL NOT NULL,
    "id_medico" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "horaInicio" TIME NOT NULL,
    "horaFin" TIME NOT NULL,
    "duracionAtencion" SMALLINT NOT NULL,
    "tipo" VARCHAR(16) NOT NULL,
    "motivo" VARCHAR(128),

    CONSTRAINT "excepcion_dia_laboral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "nombreCompleto" VARCHAR(64) NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "passwordHash" VARCHAR(60) NOT NULL,
    "region" VARCHAR(64),
    "comuna" VARCHAR(64) NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cita" (
    "id" SERIAL NOT NULL,
    "codigoReferencia" VARCHAR(9) NOT NULL,
    "id_paciente" INTEGER,
    "id_medico" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME NOT NULL,
    "estado" VARCHAR(16) NOT NULL DEFAULT 'Agendada',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambios_cita" (
    "id" SERIAL NOT NULL,
    "id_cita" INTEGER NOT NULL,
    "id_usuario" INTEGER,
    "accion" VARCHAR(16) NOT NULL,
    "cambios" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambios_cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id" SERIAL NOT NULL,
    "id_cita" INTEGER NOT NULL,
    "motivo" VARCHAR(16) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" VARCHAR(16) NOT NULL,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profesional_rut_key" ON "profesional"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_rut_key" ON "usuario"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cita_codigoReferencia_key" ON "cita"("codigoReferencia");

-- AddForeignKey
ALTER TABLE "profesional" ADD CONSTRAINT "profesional_id_especialidad_fkey" FOREIGN KEY ("id_especialidad") REFERENCES "especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dia_laboral" ADD CONSTRAINT "dia_laboral_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excepcion_dia_laboral" ADD CONSTRAINT "excepcion_dia_laboral_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cita" ADD CONSTRAINT "cita_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_cita" ADD CONSTRAINT "cambios_cita_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "cita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_cita" ADD CONSTRAINT "cambios_cita_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "cita"("id") ON DELETE CASCADE ON UPDATE CASCADE;
