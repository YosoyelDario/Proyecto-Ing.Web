const pool = require('../pool')

const getEspecialidades = async () => {
  const result = await pool.query('SELECT id, nombre FROM especialidad ORDER BY nombre')
  return result.rows
}

module.exports = { getEspecialidades }