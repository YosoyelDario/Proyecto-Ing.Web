const bcrypt = require('bcrypt')
const pool = require('../db/pool')

const registrarUsuario = async (req, res) => {
  const { rut, nombre_completo, email, password, region, comuna } = req.body

  try {
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const query = `
      INSERT INTO usuario (rut, nombre_completo, email, password_hash, region, comuna)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, rut, email
    `
    const values = [rut, nombre_completo, email, password_hash, region, comuna]
    const result = await pool.query(query, values)

    res.status(201).json({ mensaje: 'Usuario registrado', usuario: result.rows[0] })
  } catch (error) {
    if (error.code === '23505') {
      const campo = error.constraint.includes('rut') ? 'RUT' : 'Correo electrónico'
      return res.status(400).json({ error: `El ${campo} ingresado ya se encuentra registrado.` })
    }
    console.error('Error en registro:', error)
    res.status(500).json({ error: 'Error interno al registrar usuario' })
  }
}

module.exports = { registrarUsuario }