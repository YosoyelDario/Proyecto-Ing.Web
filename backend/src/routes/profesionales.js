const pool = require('../db/pool')

// ─── Especialidades ───────────────────────────────────────────────────────────

const getEspecialidades = async () => {
  const result = await pool.query('SELECT id, nombre FROM especialidad ORDER BY nombre')
  return result.rows
}

// ─── Profesionales ────────────────────────────────────────────────────────────

/**
 * Devuelve todos los profesionales con el nombre de su especialidad.
 */
const getTodosProfesionales = async () => {
  const result = await pool.query(
    `SELECT p.id, p.rut, p.nombre, p.activo,
            e.id   AS id_especialidad,
            e.nombre AS especialidad
     FROM   profesional p
     JOIN   especialidad e ON p.id_especialidad = e.id
     ORDER  BY e.nombre, p.nombre`
  )
  return result.rows
}

/**
 * Devuelve los profesionales de una especialidad concreta.
 */
const getMedicosPorEspecialidad = async (idEspecialidad) => {
  const result = await pool.query(
    `SELECT p.id, p.rut, p.nombre, p.activo,
            e.nombre AS especialidad
     FROM   profesional p
     JOIN   especialidad e ON p.id_especialidad = e.id
     WHERE  p.id_especialidad = $1
     ORDER  BY p.nombre`,
    [idEspecialidad]
  )
  return result.rows
}

/**
 * Devuelve un profesional por su id, o null si no existe.
 */
const getProfesionalPorId = async (id) => {
  const result = await pool.query(
    `SELECT p.id, p.rut, p.nombre, p.activo,
            e.id   AS id_especialidad,
            e.nombre AS especialidad
     FROM   profesional p
     JOIN   especialidad e ON p.id_especialidad = e.id
     WHERE  p.id = $1`,
    [id]
  )
  return result.rows[0] ?? null
}

/**
 * Inserta un nuevo profesional y retorna la fila creada.
 */
const crearProfesional = async ({ rut, nombre, id_especialidad, activo = true }) => {
  const result = await pool.query(
    `INSERT INTO profesional (rut, nombre, id_especialidad, activo)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [rut, nombre, id_especialidad, activo]
  )
  return result.rows[0]
}

/**
 * Actualiza solo los campos que vienen en `campos` (PATCH parcial).
 * Retorna la fila actualizada, o null si no existe el id.
 */
const actualizarProfesional = async (id, campos) => {
  // Construir SET dinámico: solo los campos presentes en el objeto
  const permitidos = ['nombre', 'rut', 'id_especialidad', 'activo']
  const entradas = Object.entries(campos).filter(([k]) => permitidos.includes(k))

  if (entradas.length === 0) return null   // nada que actualizar

  const sets   = entradas.map(([k], i) => `${k} = $${i + 1}`)
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

/**
 * Elimina un profesional y retorna la fila eliminada, o null si no existía.
 */
const eliminarProfesional = async (id) => {
  const result = await pool.query(
    `DELETE FROM profesional WHERE id = $1 RETURNING *`,
    [id]
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
}