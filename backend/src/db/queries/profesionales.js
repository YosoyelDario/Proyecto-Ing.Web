const pool = require('../pool')

const getEspecialidades = async () => {
  const result = await pool.query('SELECT id, nombre FROM especialidad ORDER BY nombre')
  return result.rows
}

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