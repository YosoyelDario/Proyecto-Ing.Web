const pool = require('../pool')

// ─── Especialidades ───────────────────────────────────────────────────────────

const getEspecialidades = async () => {
  const result = await pool.query('SELECT id, nombre FROM especialidad ORDER BY nombre')
  return result.rows
}

// ─── Profesionales ────────────────────────────────────────────────────────────

const getTodosProfesionales = async () => {
  const result = await pool.query(
    `SELECT p.id, p.rut, p.nombre,
            e.id   AS id_especialidad,
            e.nombre AS especialidad
     FROM   profesional p
     JOIN   especialidad e ON p.id_especialidad = e.id
     ORDER  BY e.nombre, p.nombre`
  )
  return result.rows
}

const getMedicosPorEspecialidad = async (idEspecialidad) => {
  const result = await pool.query(
    `SELECT p.id, p.rut, p.nombre,
            e.nombre AS especialidad
     FROM   profesional p
     JOIN   especialidad e ON p.id_especialidad = e.id
     WHERE  p.id_especialidad = $1
     ORDER  BY p.nombre`,
    [idEspecialidad]
  )
  return result.rows
}

const getProfesionalPorId = async (id) => {
  const result = await pool.query(
    `SELECT p.id, p.rut, p.nombre,
            e.id   AS id_especialidad,
            e.nombre AS especialidad
     FROM   profesional p
     JOIN   especialidad e ON p.id_especialidad = e.id
     WHERE  p.id = $1`,
    [id]
  )
  return result.rows[0] ?? null
}

const crearProfesional = async ({ rut, nombre, id_especialidad }) => {
  const result = await pool.query(
    `INSERT INTO profesional (rut, nombre, id_especialidad)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [rut, nombre, id_especialidad]
  )
  return result.rows[0]
}

const actualizarProfesional = async (id, campos) => {
  const permitidos = ['nombre', 'rut', 'id_especialidad']
  const entradas = Object.entries(campos).filter(([k]) => permitidos.includes(k))

  if (entradas.length === 0) return null

  const sets    = entradas.map(([k], i) => `${k} = $${i + 1}`)
  const valores = entradas.map(([, v]) => v)

  const result = await pool.query(
    `UPDATE profesional
     SET    ${sets.join(', ')}
     WHERE  id = $${entradas.length + 1}
     RETURNING *`,
    [...valores, id]
  )
  return result.rows[0] ?? null
}

const eliminarProfesional = async (id) => {
  const result = await pool.query(
    `DELETE FROM profesional WHERE id = $1 RETURNING *`,
    [id]
  )
  return result.rows[0] ?? null
}

// ─── Agenda semanal (dia_laboral) ─────────────────────────────────────────────

const getAgendaMedico = async (idMedico) => {
  const result = await pool.query(
    `SELECT id, dia_semana, hora_inicio, hora_fin, duracion_minutos
     FROM   dia_laboral
     WHERE  id_medico = $1
     ORDER  BY dia_semana`,
    [idMedico]
  )
  return result.rows
}

/**
 * Reemplaza completamente la agenda semanal de un médico:
 * elimina todos sus dia_laboral actuales e inserta los nuevos.
 */
const guardarAgendaSemanal = async (idMedico, horarios) => {
  await pool.query('DELETE FROM dia_laboral WHERE id_medico = $1', [idMedico])

  if (!horarios || horarios.length === 0) return []

  const insertados = []
  for (const h of horarios) {
    const result = await pool.query(
      `INSERT INTO dia_laboral (id_medico, dia_semana, hora_inicio, hora_fin, duracion_minutos)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id_medico, dia_semana) DO UPDATE
         SET hora_inicio = EXCLUDED.hora_inicio,
             hora_fin    = EXCLUDED.hora_fin,
             duracion_minutos = EXCLUDED.duracion_minutos
       RETURNING *`,
      [idMedico, h.dia_semana, h.hora_inicio, h.hora_fin, h.duracion_minutos]
    )
    insertados.push(result.rows[0])
  }
  return insertados
}

// ─── Excepciones (feriados / licencias) ──────────────────────────────────────

const getExcepcionesMedico = async (idMedico) => {
  const result = await pool.query(
    `SELECT id, fecha, hora_inicio, hora_fin, duracion_minutos, tipo, motivo
     FROM   excepcion_dia_laboral
     WHERE  id_medico = $1
     ORDER  BY fecha DESC`,
    [idMedico]
  )
  return result.rows
}

const crearExcepcion = async (idMedico, { fecha, hora_inicio, hora_fin, duracion_minutos, tipo, motivo }) => {
  const result = await pool.query(
    `INSERT INTO excepcion_dia_laboral
       (id_medico, fecha, hora_inicio, hora_fin, duracion_minutos, tipo, motivo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [idMedico, fecha, hora_inicio || null, hora_fin || null, duracion_minutos || null, tipo, motivo || null]
  )
  return result.rows[0]
}

const eliminarExcepcion = async (idExcepcion) => {
  const result = await pool.query(
    `DELETE FROM excepcion_dia_laboral WHERE id = $1 RETURNING *`,
    [idExcepcion]
  )
  return result.rows[0] ?? null
}

module.exports = {
  getEspecialidades,
  getTodosProfesionales,
  getMedicosPorEspecialidad,
  getProfesionalPorId,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional,
  getAgendaMedico,
  guardarAgendaSemanal,
  getExcepcionesMedico,
  crearExcepcion,
  eliminarExcepcion,
}
