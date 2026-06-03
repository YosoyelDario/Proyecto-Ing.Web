const bcrypt = require('bcrypt')
const pool = require('../db/pool')
const { validarRegionComuna } = require('../utils/ubicaciones')

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

  if (!validarRegionComuna(region, comuna)) {
    return res.status(400).json({ error: 'Región o comuna no válida. Selecciona una combinación real de Chile.' })
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

// ── POST /api/usuarios/admin  (crear usuario admin - requiere ser admin) ──
const crearUsuarioAdmin = async (req, res) => {
  const { rut, nombre_completo, email, password, region, comuna } = req.body

  // Validar campos obligatorios
  if (!rut || !nombre_completo || !email || !password || !region || !comuna) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' })
  }

  if (!validarRegionComuna(region, comuna)) {
    return res.status(400).json({ error: 'Región o comuna no válida. Selecciona una combinación real de Chile.' })
  }

  try {
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const result = await pool.query(
      `INSERT INTO usuario (rut, nombre_completo, email, password_hash, region, comuna, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, rut, nombre_completo, email, region, comuna, is_admin`,
      [rut, nombre_completo, email, password_hash, region, comuna]
    )

    res.status(201).json({ mensaje: 'Usuario administrador creado correctamente.', usuario: result.rows[0] })
  } catch (error) {
    if (error.code === '23505') {
      const campo = error.constraint.includes('rut') ? 'RUT' : 'Correo electrónico'
      return res.status(400).json({ error: `El ${campo} ingresado ya se encuentra registrado.` })
    }
    console.error('Error al crear usuario admin:', error)
    res.status(500).json({ error: 'Error interno al crear usuario administrador' })
  }
}

// ── PATCH /api/usuarios/me/password  (cambiar contraseña) ────────────
const cambiarPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const usuarioId = req.usuario?.id

  if (!usuarioId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' })
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' })
  }

  try {
    // Obtener hash actual
    const result = await pool.query('SELECT password_hash FROM usuario WHERE id = $1', [usuarioId])
    const fila = result.rows[0]

    if (!fila) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }

    const passwordValida = await bcrypt.compare(currentPassword, fila.password_hash)
    if (!passwordValida) {
      // No tratar esto como error de autenticación del token; es un error de validación de datos
      return res.status(400).json({ error: 'Contraseña actual incorrecta.' })
    }

    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPassword, salt)

    await pool.query('UPDATE usuario SET password_hash = $1 WHERE id = $2', [newHash, usuarioId])

    res.json({ mensaje: 'Contraseña actualizada correctamente.' })
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    res.status(500).json({ error: 'Error interno al cambiar contraseña' })
  }
}

const eliminarCuenta = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM usuario WHERE id = $1 RETURNING id', [req.usuario.id])
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }
    res.json({ mensaje: 'Cuenta eliminada correctamente.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar la cuenta' })
  }
}

module.exports = { obtenerPerfil, actualizarPerfil, crearUsuarioAdmin, cambiarPassword, eliminarCuenta }
