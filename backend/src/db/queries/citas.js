const pool = require('../pool')

// ── GET: citas de un usuario autenticado ──────────────────────────────────
const getCitasPorUsuario = async (idUsuario) => {
  const result = await pool.query(
    `SELECT
      c.id,
      c.codigo_referencia,
      c.fecha,
      c.hora,
      c.estado,
      p.nombre     AS medico,
      e.nombre     AS especialidad,
      p.id         AS id_medico
    FROM cita c
    JOIN profesional p ON c.id_medico = p.id
    JOIN especialidad e ON p.id_especialidad = e.id
    WHERE c.id_paciente = $1
    ORDER BY c.fecha DESC, c.hora DESC`,
    [idUsuario]
  )
  return result.rows
}

// ── GET: cita por código de referencia (para invitados o admin ) ──────────
  // -- Si rut_paciente es null (registrado), extrae automáticamente el RUT de la tabla usuario.
  // -- Si no, usa el rut_paciente directo (invitado).
const getCitaPorCodigo = async (codigo) => {
  const result = await pool.query(
    `SELECT
      c.id,
      c.codigo_referencia,
      c.fecha,
      c.hora,
      c.estado,
      c.id_paciente,
      c.id_medico,
      p.nombre     AS medico,
      e.nombre     AS especialidad,

      COALESCE(c.rut_paciente, u.rut) AS rut,
      COALESCE(c.nombre_paciente, u.nombre_completo) AS nombre,
      COALESCE(c.email_paciente, u.email) AS email
    FROM cita c
    LEFT JOIN usuario u ON c.id_paciente = u.id
    INNER JOIN profesional p ON c.id_medico = p.id
    INNER JOIN especialidad e ON p.id_especialidad = e.id
    WHERE c.codigo_referencia = $1`,
    [codigo]
  )
  return result.rows[0] || null
}

// ── GET: todas las citas (solo admin) ────────────────────────────────────
const getAllCitas = async () => {
  const result = await pool.query(
    `SELECT
      c.id,
      c.codigo_referencia,
      c.fecha,
      c.hora,
      c.estado,
      COALESCE(u.nombre_completo, c.nombre_paciente) AS nombre,
      COALESCE(u.rut, c.rut_paciente)                AS rut,
      COALESCE(u.email, c.email_paciente)             AS email,
      p.nombre     AS medico,
      e.nombre     AS especialidad
    FROM cita c
    LEFT JOIN usuario u ON c.id_paciente = u.id
    JOIN profesional p ON c.id_medico = p.id
    JOIN especialidad e ON p.id_especialidad = e.id
    ORDER BY c.fecha DESC, c.hora DESC`
  )
  return result.rows
}

// ── GET: horarios disponibles de un médico en una fecha ─────────────────
const getHorariosDisponibles = async (idMedico, fecha) => {
  // día de la semana: PostgreSQL EXTRACT dow => 0=domingo, ajustar a 0=lunes
  const result = await pool.query(
    `SELECT
      dl.hora_inicio,
      dl.hora_fin,
      dl.duracion_minutos
    FROM dia_laboral dl
    WHERE dl.id_medico = $1
      AND dl.dia_semana = (
        EXTRACT(DOW FROM $2::date)::int + 6
      ) % 7
      AND NOT EXISTS (
        SELECT 1 FROM excepcion_dia_laboral ex
        WHERE ex.id_medico = $1 AND ex.fecha = $2::date
      )`,
    [idMedico, fecha]
  )
  if (result.rows.length === 0) return []

  const { hora_inicio, hora_fin, duracion_minutos } = result.rows[0]

  // Generar slots
  const slots = []
  let current = new Date(`1970-01-01T${hora_inicio}`)
  const end   = new Date(`1970-01-01T${hora_fin}`)
  while (current < end) {
    const hh = String(current.getHours()).padStart(2, '0')
    const mm = String(current.getMinutes()).padStart(2, '0')
    slots.push(`${hh}:${mm}`)
    current = new Date(current.getTime() + duracion_minutos * 60000)
  }

  // Quitar slots ya ocupados
  const ocupados = await pool.query(
    `SELECT hora FROM cita
     WHERE id_medico = $1 AND fecha = $2 AND estado NOT IN ('Cancelada')`,
    [idMedico, fecha]
  )
  const ocupadosSet = new Set(ocupados.rows.map(r => r.hora.slice(0, 5)))

  return slots.filter(s => !ocupadosSet.has(s))
}

// ── POST: crear cita ─────────────────────────────────────────────────────
const crearCita = async ({ id_paciente, rut_paciente, nombre_paciente, email_paciente, id_medico, fecha, hora }) => {
  const codigo = generarCodigo()
  const result = await pool.query(
    `INSERT INTO cita
      (codigo_referencia, id_paciente, rut_paciente, nombre_paciente, email_paciente, id_medico, fecha, hora)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [codigo, id_paciente || null, rut_paciente || null, nombre_paciente || null, email_paciente || null, id_medico, fecha, hora]
  )
  return result.rows[0]
}

// ── PATCH: modificar fecha/hora de cita ──────────────────────────────────
const modificarCita = async (id, nuevaFecha, nuevaHora, idUsuarioEditor) => {
  const result = await pool.query(
    `UPDATE cita SET fecha = $1, hora = $2, updated_at = NOW()
     WHERE id = $3 AND estado = 'Agendada'
     RETURNING *`,
    [nuevaFecha, nuevaHora, id]
  )
  // Auditoría
  if (result.rows[0]) {
    await pool.query(
      `INSERT INTO cambios_cita (id_cita, id_usuario, accion, cambios)
       VALUES ($1, $2, 'Modificacion', $3::jsonb)`,
      [id, idUsuarioEditor || null, JSON.stringify({ fecha: nuevaFecha, hora: nuevaHora })]
    )
  }
  return result.rows[0] || null
}

// ── DELETE / PATCH: cancelar cita ────────────────────────────────────────
const cancelarCita = async (id, idUsuarioEditor) => {
  const result = await pool.query(
    `UPDATE cita SET estado = 'Cancelada', updated_at = NOW()
     WHERE id = $1 AND estado != 'Cancelada'
     RETURNING *`,
    [id]
  )
  if (result.rows[0]) {
    await pool.query(
      `INSERT INTO cambios_cita (id_cita, id_usuario, accion, cambios)
       VALUES ($1, $2, 'Cancelacion', '{}')`,
      [id, idUsuarioEditor || null]
    )
  }
  return result.rows[0] || null
}

// ── DELETE: eliminar cita permanentemente (solo admin) ───────────────────
const eliminarCita = async (id) => {
  const result = await pool.query(
    `DELETE FROM cita WHERE id = $1 RETURNING *`,
    [id]
  )
  return result.rows[0] || null
}

// ── Helper: genera código alfanumérico de 8 chars ────────────────────────
function generarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

module.exports = {
  getCitasPorUsuario,
  getCitaPorCodigo,
  getAllCitas,
  getHorariosDisponibles,
  crearCita,
  modificarCita,
  cancelarCita,
  eliminarCita,
}
