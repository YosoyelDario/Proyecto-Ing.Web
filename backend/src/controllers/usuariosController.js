const pool = require('../db/pool')

// ── GET /api/usuarios/me  (perfil del usuario autenticado) ───────────────
const obtenerPerfil = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, rut, nombre_completo, email, region, comuna, is_admin, created_at FROM usuario WHERE id = $1',
      [req.usuario.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Usuario no encontrado.' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener el perfil' })
  }
}

// ── PATCH /api/usuarios/me  (actualizar región/comuna) ──────────────────
const actualizarPerfil = async (req, res) => {
  const { region, comuna } = req.body
  if (!region || !comuna) {
    return res.status(400).json({ error: 'Se requieren región y comuna.' })
  }
  try {
    const result = await pool.query(
      `UPDATE usuario SET region = $1, comuna = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, rut, nombre_completo, email, region, comuna`,
      [region, comuna, req.usuario.id]
    )
    res.json({ mensaje: 'Perfil actualizado.', usuario: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar el perfil' })
  }
}

module.exports = { obtenerPerfil, actualizarPerfil }
