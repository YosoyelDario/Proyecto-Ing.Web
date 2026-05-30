const pool = require('../pool')

const buscarUsuarioPorEmail = async (email) => {
  const result = await pool.query(
    'SELECT id, rut, nombre_completo, email, password_hash, region, comuna, is_admin FROM usuario WHERE email = $1',
    [email]
  )
  return result.rows[0] || null
}

module.exports = { buscarUsuarioPorEmail }