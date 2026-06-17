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
-- INSERT INTO especialidad (nombre) VALUES
--   ('Medicina General'),
--  ('Pediatría'),
--  ('Dermatología');

-- =============================================================================
-- POBLAMIENTO DE DATOS (INSERT INTO)
-- =============================================================================

-- 1. Especialidades
INSERT INTO public.especialidad VALUES (1, 'Medicina General');
INSERT INTO public.especialidad VALUES (2, 'Pediatría');
INSERT INTO public.especialidad VALUES (3, 'Dermatología');

-- 2. Usuarios
INSERT INTO public.usuario VALUES (1, '21.862.824-9', 'Dario Joaquin Fuentes Ponce', 'dariofp123@gmail.com', '$2b$10$GtHgPz01jyikDnjmZ251f.dpSCvznM1W/E5W6lK7v3lzCMcTv3D9O', 'Valparaíso', 'Limache', false, '2026-06-01 18:31:18.289693', '2026-06-01 18:31:18.289693');
INSERT INTO public.usuario VALUES (2, '14.693.252-5', 'juan perez', 'tuadmin@gmail.com', '$2b$10$d4FVbGIg.2F4ubM.JRXi5.BHYUsFBDFVUUpigiVv1P7.5UHUrOcFy', 'Magallanes', 'Torres del Paine', true, '2026-06-01 18:59:23.908878', '2026-06-01 18:59:23.908878');
INSERT INTO public.usuario VALUES (3, '13.988.081-1', 'pepe gonzales', 'pepe@gmail.com', '$2b$10$NPkyDQ3qSO3W0qr7kuRk3O88AGJFxk.jw87Rc.EUMlPCs04cQ7g42', 'Magallanes', 'Timaukel', false, '2026-06-02 21:10:46.484965', '2026-06-02 21:10:46.484965');

-- 3. Profesionales
INSERT INTO public.profesional VALUES (1, '11.111.111-1', 'Dr. Roberto Sánchez', 1);
INSERT INTO public.profesional VALUES (2, '22.222.222-2', 'Dra. Ana López', 1);
INSERT INTO public.profesional VALUES (3, '33.333.333-3', 'Dr. Carlos Vega', 2);
INSERT INTO public.profesional VALUES (4, '44.444.444-4', 'Dra. María Paz', 3);
INSERT INTO public.profesional VALUES (5, '12.345.678-9', 'Dr. René Favaloro', 2);

-- 4. Días Laborales
INSERT INTO public.dia_laboral VALUES (1, 1, 0, '09:00:00', '13:00:00', 30);
INSERT INTO public.dia_laboral VALUES (2, 1, 2, '09:00:00', '13:00:00', 30);
INSERT INTO public.dia_laboral VALUES (3, 1, 4, '09:00:00', '13:00:00', 30);
INSERT INTO public.dia_laboral VALUES (4, 2, 1, '09:00:00', '13:00:00', 30);
INSERT INTO public.dia_laboral VALUES (5, 2, 3, '09:00:00', '13:00:00', 30);
INSERT INTO public.dia_laboral VALUES (6, 3, 0, '14:00:00', '17:00:00', 20);
INSERT INTO public.dia_laboral VALUES (7, 3, 1, '14:00:00', '17:00:00', 20);
INSERT INTO public.dia_laboral VALUES (8, 3, 2, '14:00:00', '17:00:00', 20);
INSERT INTO public.dia_laboral VALUES (9, 3, 3, '14:00:00', '17:00:00', 20);
INSERT INTO public.dia_laboral VALUES (11, 5, 1, '09:00:00', '13:00:00', 30);
INSERT INTO public.dia_laboral VALUES (12, 4, 1, '09:00:00', '13:00:00', 30);
INSERT INTO public.dia_laboral VALUES (13, 5, 3, '09:00:00', '13:00:00', 30);
INSERT INTO public.dia_laboral VALUES (14, 5, 2, '09:00:00', '13:00:00', 30);
INSERT INTO public.dia_laboral VALUES (17, 5, 4, '15:00:00', '17:00:00', 20);

-- 5. Citas
INSERT INTO public.cita VALUES (3, 'SD-1102', 1, NULL, NULL, NULL, 4, '2026-05-10', '11:00:00', 'Completada', '2026-06-01 19:30:04.631098', '2026-06-01 19:30:04.631098');
INSERT INTO public.cita VALUES (5, 'SD-3319', NULL, '16.666.666-6', 'Camila Soto', 'camila.soto@outlook.com', 1, '2026-06-20', '11:30:00', 'Cancelada', '2026-06-01 19:30:45.25393', '2026-06-01 19:30:45.25393');
INSERT INTO public.cita VALUES (6, 'SD-2204', NULL, '17.777.777-7', 'Andrés Morales', 'andres.mo@gmail.com', 1, '2026-05-02', '09:00:00', 'Completada', '2026-06-01 19:30:45.25393', '2026-06-01 19:30:45.25393');
INSERT INTO public.cita VALUES (4, 'SD-5581', NULL, '15.555.555-5', 'Diego Valenzuela', 'diego@gmail.com', 2, '2026-06-18', '10:00:00', 'Cancelada', '2026-06-01 19:30:45.25393', '2026-06-01 21:25:14.213135');
INSERT INTO public.cita VALUES (9, 'QJQBFYRB', NULL, '21.058.463-3', 'prueba agendar sin registrar', 'prueba@hotmail.com', 3, '2026-06-08', '16:00:00', 'Agendada', '2026-06-01 22:25:56.25809', '2026-06-01 22:25:56.25809');
INSERT INTO public.cita VALUES (7, 'BUWZ7AXG', 2, NULL, NULL, NULL, 3, '2026-06-10', '09:00:00', 'Cancelada', '2026-06-01 19:39:49.738948', '2026-06-02 01:03:24.835621');
INSERT INTO public.cita VALUES (10, 'R3XSAACD', 2, NULL, NULL, NULL, 1, '2026-06-12', '11:00:00', 'Agendada', '2026-06-02 01:19:03.449935', '2026-06-02 01:19:03.449935');
INSERT INTO public.cita VALUES (11, 'VB79JR3P', 2, NULL, NULL, NULL, 3, '2026-06-16', '16:40:00', 'Agendada', '2026-06-02 01:19:16.966299', '2026-06-02 01:19:16.966299');
INSERT INTO public.cita VALUES (12, 'U5XG6356', 2, NULL, NULL, NULL, 5, '2026-06-09', '09:30:00', 'Agendada', '2026-06-02 01:35:29.205306', '2026-06-02 01:35:29.205306');
INSERT INTO public.cita VALUES (14, 'RN2WSRV4', 2, NULL, NULL, NULL, 5, '2026-06-11', '12:30:00', 'Agendada', '2026-06-02 01:52:13.327366', '2026-06-02 01:52:13.327366');
INSERT INTO public.cita VALUES (2, 'SD-4412', 1, NULL, NULL, NULL, 3, '2026-06-10', '11:30:00', 'Cancelada', '2026-06-01 19:30:04.631098', '2026-06-02 02:02:46.892994');
INSERT INTO public.cita VALUES (13, 'QEP4X56A', 2, NULL, NULL, NULL, 4, '2026-06-23', '12:30:00', 'Cancelada', '2026-06-02 01:36:59.155001', '2026-06-02 21:16:19.097897');
INSERT INTO public.cita VALUES (8, '7K5VCRVW', 2, NULL, NULL, NULL, 2, '2026-06-25', '09:30:00', 'Agendada', '2026-06-01 19:41:21.757344', '2026-06-02 21:17:28.767308');
INSERT INTO public.cita VALUES (21, '2MU5UG4B', 1, NULL, NULL, NULL, 3, '2026-06-23', '16:20:00', 'Cancelada', '2026-06-14 15:48:52.241084', '2026-06-14 16:09:01.642492');
INSERT INTO public.cita VALUES (1, 'SD-9041', 1, NULL, NULL, NULL, 1, '2026-06-15', '09:30:00', 'Cancelada', '2026-06-01 19:26:21.553442', '2026-06-14 16:10:04.408778');
INSERT INTO public.cita VALUES (22, '67HXT6U5', 1, NULL, NULL, NULL, 4, '2026-06-16', '12:30:00', 'Cancelada', '2026-06-14 16:31:56.191128', '2026-06-14 16:32:14.557852');
INSERT INTO public.cita VALUES (23, 'TPRHLE87', 1, NULL, NULL, NULL, 1, '2026-06-24', '12:30:00', 'Cancelada', '2026-06-14 16:32:41.941613', '2026-06-14 16:33:02.182629');
INSERT INTO public.cita VALUES (24, 'KSUP2DNS', 1, NULL, NULL, NULL, 1, '2026-06-17', '09:00:00', 'Agendada', '2026-06-14 18:27:13.035962', '2026-06-14 18:37:20.948201');

-- 6. Cambios Cita
INSERT INTO public.cambios_cita VALUES (1, 4, 2, 'Cancelacion', '{}', '2026-06-01 21:25:14.221682');
INSERT INTO public.cambios_cita VALUES (2, 2, 2, 'Modificacion', '{"hora": "11:30", "fecha": "2026-06-10"}', '2026-06-02 00:40:11.418221');
INSERT INTO public.cambios_cita VALUES (3, 7, 2, 'Modificacion', '{"hora": "09:00", "fecha": "2026-06-10"}', '2026-06-02 00:42:09.674295');
INSERT INTO public.cambios_cita VALUES (4, 7, 2, 'Cancelacion', '{}', '2026-06-02 01:03:24.839174');
INSERT INTO public.cambios_cita VALUES (5, 2, 2, 'Cancelacion', '{}', '2026-06-02 02:02:46.902743');
INSERT INTO public.cambios_cita VALUES (6, 8, 2, 'Modificacion', '{"hora": "12:30", "fecha": "2026-06-23"}', '2026-06-02 02:03:44.432446');
INSERT INTO public.cambios_cita VALUES (7, 13, 2, 'Cancelacion', '{}', '2026-06-02 21:16:19.122195');
INSERT INTO public.cambios_cita VALUES (8, 8, 2, 'Modificacion', '{"hora": "09:30", "fecha": "2026-06-25"}', '2026-06-02 21:17:28.778918');
INSERT INTO public.cambios_cita VALUES (9, 21, 1, 'Cancelacion', '{}', '2026-06-14 16:09:01.667629');
INSERT INTO public.cambios_cita VALUES (10, 1, 1, 'Cancelacion', '{}', '2026-06-14 16:10:04.411337');
INSERT INTO public.cambios_cita VALUES (11, 22, 1, 'Cancelacion', '{}', '2026-06-14 16:32:14.561387');
INSERT INTO public.cambios_cita VALUES (12, 23, 1, 'Cancelacion', '{}', '2026-06-14 16:33:02.192512');
INSERT INTO public.cambios_cita VALUES (13, 24, 1, 'Modificacion', '{"hora": "12:00", "fecha": "2026-06-17"}', '2026-06-14 18:27:29.379333');
INSERT INTO public.cambios_cita VALUES (14, 24, 2, 'Modificacion', '{"hora": "10:30", "fecha": "2026-06-17"}', '2026-06-14 18:28:45.020995');
INSERT INTO public.cambios_cita VALUES (15, 24, 2, 'Modificacion', '{"hora": "09:00", "fecha": "2026-06-17"}', '2026-06-14 18:37:20.976008');

-- 7. Notificaciones
INSERT INTO public.notificacion VALUES (1, 21, 'Confirmacion', 'Notificación de confirmación procesada para dariofp123@gmail.com', 'Enviado');
INSERT INTO public.notificacion VALUES (2, 21, 'Cancelacion', 'Notificación de cancelación procesada para dariofp123@gmail.com', 'Enviado');
INSERT INTO public.notificacion VALUES (3, 1, 'Cancelacion', 'Notificación de cancelación procesada para dariofp123@gmail.com', 'Enviado');
INSERT INTO public.notificacion VALUES (4, 22, 'Confirmacion', 'Notificación de confirmación procesada para dariofp123@gmail.com', 'Enviado');
INSERT INTO public.notificacion VALUES (5, 22, 'Cancelacion', 'Notificación de cancelación procesada para dariofp123@gmail.com', 'Enviado');
INSERT INTO public.notificacion VALUES (6, 23, 'Confirmacion', 'Notificación de confirmación procesada para dariofp123@gmail.com', 'Enviado');
INSERT INTO public.notificacion VALUES (7, 23, 'Cancelacion', 'Notificación de cancelación procesada para dariofp123@gmail.com', 'Enviado');
INSERT INTO public.notificacion VALUES (8, 24, 'Confirmacion', 'Notificación de confirmación procesada para dariofp123@gmail.com', 'Enviado');
INSERT INTO public.notificacion VALUES (9, 24, 'Modificacion', 'Notificación de reprogramación procesada para dariofp123@gmail.com', 'Enviado');

-- =============================================================================
-- SINCRONIZACIÓN DE SECUENCIAS
-- Permite que los próximos INSERTS automáticos desde el frontend no fallen.
-- =============================================================================
SELECT pg_catalog.setval('public.especialidad_id_seq', 3, true);
SELECT pg_catalog.setval('public.usuario_id_seq', 3, true);
SELECT pg_catalog.setval('public.profesional_id_seq', 5, true);
SELECT pg_catalog.setval('public.dia_laboral_id_seq', 17, true);
SELECT pg_catalog.setval('public.cita_id_seq', 24, true);
SELECT pg_catalog.setval('public.cambios_cita_id_seq', 15, true);
SELECT pg_catalog.setval('public.notificacion_id_seq', 9, true);