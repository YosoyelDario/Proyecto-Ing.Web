-- =============================================================================
-- santo_domingo — creación de tablas
-- Correr en psql: \i init.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. especialidad
-- -----------------------------------------------------------------------------
SET client_encoding = 'UTF8';


CREATE TABLE especialidad (
  id     SERIAL       PRIMARY KEY,
  nombre VARCHAR(64)  NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- 2. profesional
-- -----------------------------------------------------------------------------
CREATE TABLE profesional (
  id               SERIAL      PRIMARY KEY,
  rut              VARCHAR(12) NOT NULL UNIQUE,
  nombre           VARCHAR(64) NOT NULL,
  id_especialidad  INTEGER     NOT NULL,

  CONSTRAINT fk_profesional_especialidad
    FOREIGN KEY (id_especialidad) REFERENCES especialidad(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------------------------------
-- 3. dia_laboral
--    duracion_minutos: duración de cada slot en minutos (ej: 30)
--    UNIQUE (id_medico, dia_semana): un médico no puede tener dos agendas
--    para el mismo día de la semana
-- -----------------------------------------------------------------------------
CREATE TABLE dia_laboral (
  id                SERIAL   PRIMARY KEY,
  id_medico         INTEGER  NOT NULL,
  dia_semana        SMALLINT NOT NULL, -- 0=Lunes … 6=Domingo
  hora_inicio       TIME     NOT NULL,
  hora_fin          TIME     NOT NULL,
  duracion_minutos  SMALLINT NOT NULL,

  CONSTRAINT fk_dia_laboral_profesional
    FOREIGN KEY (id_medico) REFERENCES profesional(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT uq_dia_laboral_medico_dia
    UNIQUE (id_medico, dia_semana)
);

-- -----------------------------------------------------------------------------
-- 4. excepcion_dia_laboral
--    Para feriados o licencias. hora_inicio/fin nullable porque un feriado
--    completo no tiene rango horario.
-- -----------------------------------------------------------------------------
CREATE TABLE excepcion_dia_laboral (
  id                SERIAL       PRIMARY KEY,
  id_medico         INTEGER      NOT NULL,
  fecha             DATE         NOT NULL,
  hora_inicio       TIME,
  hora_fin          TIME,
  duracion_minutos  SMALLINT,
  tipo              VARCHAR(16)  NOT NULL, -- 'Licencia' | 'Feriado'
  motivo            VARCHAR(128),

  CONSTRAINT fk_excepcion_profesional
    FOREIGN KEY (id_medico) REFERENCES profesional(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT chk_excepcion_tipo
    CHECK (tipo IN ('Licencia', 'Feriado'))
);

-- -----------------------------------------------------------------------------
-- 5. usuario
--    region y comuna NOT NULL — el formulario de registro las exige siempre
--    password_hash VARCHAR(72) — bcrypt produce hasta 72 caracteres
-- -----------------------------------------------------------------------------
CREATE TABLE usuario (
  id              SERIAL       PRIMARY KEY,
  rut             VARCHAR(12)  NOT NULL UNIQUE,
  nombre_completo VARCHAR(64)  NOT NULL,
  email           VARCHAR(128) NOT NULL UNIQUE,
  password_hash   VARCHAR(72)  NOT NULL,
  region          VARCHAR(64)  NOT NULL,
  comuna          VARCHAR(64)  NOT NULL,
  is_admin        BOOLEAN      NOT NULL DEFAULT false,
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. cita
--    Modelo mixto autenticado/invitado:
--    - Paciente con cuenta:  id_paciente NOT NULL, rut/nombre/email_paciente NULL
--    - Paciente invitado:    id_paciente NULL,     rut/nombre/email_paciente NOT NULL
--    El CHECK garantiza que siempre sea uno u otro, nunca ambos ni ninguno.
--
--    codigo_referencia VARCHAR(8): alfanumérico generado por el backend
--    UNIQUE (id_medico, fecha, hora): evita doble reserva del mismo slot
-- -----------------------------------------------------------------------------
CREATE TABLE cita (
  id                  SERIAL       PRIMARY KEY,
  codigo_referencia   VARCHAR(8)   NOT NULL UNIQUE,

  -- paciente con cuenta
  id_paciente         INTEGER,

  -- paciente invitado
  rut_paciente        VARCHAR(12),
  nombre_paciente     VARCHAR(64),
  email_paciente      VARCHAR(128),

  id_medico           INTEGER      NOT NULL,
  fecha               DATE         NOT NULL,
  hora                TIME         NOT NULL,
  estado              VARCHAR(16)  NOT NULL DEFAULT 'Agendada',
  created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP    NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_cita_usuario
    FOREIGN KEY (id_paciente) REFERENCES usuario(id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  CONSTRAINT fk_cita_profesional
    FOREIGN KEY (id_medico) REFERENCES profesional(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- un médico no puede tener dos citas el mismo día a la misma hora
  CONSTRAINT uq_cita_medico_fecha_hora
    UNIQUE (id_medico, fecha, hora),

  -- modelo mixto: o tiene cuenta o es invitado, nunca los dos
  CONSTRAINT chk_cita_paciente CHECK (
  id_paciente IS NOT NULL
  OR
  (rut_paciente IS NOT NULL AND nombre_paciente IS NOT NULL AND email_paciente IS NOT NULL)
),

  CONSTRAINT chk_cita_estado
    CHECK (estado IN ('Agendada', 'Completada', 'Cancelada', 'NoAsiste'))
);

-- índice para calcular disponibilidad: citas por médico y fecha
CREATE INDEX idx_cita_medico_fecha ON cita (id_medico, fecha);

-- índice para ConsultarCita y CancelarCita: busca por código + rut invitado
CREATE INDEX idx_cita_codigo_rut ON cita (codigo_referencia, rut_paciente);

-- -----------------------------------------------------------------------------
-- 7. cambios_cita  (auditoría)
--    id_usuario nullable: el paciente invitado no tiene sesión
-- -----------------------------------------------------------------------------
CREATE TABLE cambios_cita (
  id          SERIAL      PRIMARY KEY,
  id_cita     INTEGER     NOT NULL,
  id_usuario  INTEGER,
  accion      VARCHAR(16) NOT NULL,
  cambios     JSONB       NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_cambios_cita
    FOREIGN KEY (id_cita) REFERENCES cita(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT fk_cambios_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  CONSTRAINT chk_cambios_accion
    CHECK (accion IN ('Creacion', 'Modificacion', 'Cancelacion'))
);

-- -----------------------------------------------------------------------------
-- 8. notificacion
-- -----------------------------------------------------------------------------
CREATE TABLE notificacion (
  id       SERIAL      PRIMARY KEY,
  id_cita  INTEGER     NOT NULL,
  motivo   VARCHAR(16) NOT NULL,
  mensaje  TEXT        NOT NULL,
  estado   VARCHAR(16) NOT NULL,

  CONSTRAINT fk_notificacion_cita
    FOREIGN KEY (id_cita) REFERENCES cita(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT chk_notificacion_motivo
    CHECK (motivo IN ('Confirmacion', 'Cancelacion', 'Modificacion')),

  CONSTRAINT chk_notificacion_estado
    CHECK (estado IN ('Enviado', 'Fallido'))
);

-- =============================================================================
-- Seed: especialidades que usa el frontend
-- =============================================================================
INSERT INTO especialidad (nombre) VALUES
  ('Medicina General'),
  ('Pediatría'),
  ('Dermatología');
