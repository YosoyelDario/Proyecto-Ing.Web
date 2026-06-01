const pool = require('../pool')

const getEspecialidades = async () => {
  const result = await pool.query('SELECT id, nombre FROM especialidad ORDER BY nombre')
  return result.rows
}

const getMedicosPorEspecialidad = async (idEspecialidad) => {
  const result = await pool.query(
    `SELECT p.id, p.nombre, e.nombre AS especialidad
     FROM profesional p
     JOIN especialidad e ON p.id_especialidad = e.id
     WHERE p.id_especialidad = $1
     ORDER BY p.nombre`,
    [idEspecialidad]
  )
  return result.rows
}

module.exports = { getEspecialidades, getMedicosPorEspecialidad }
