const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')
const pool   = require('../db/pool')
const { buscarUsuarioPorEmail, buscarUsuarioPorId } = require('../db/queries/usuarios')
const { validarRegionComuna } = require('../utils/ubicaciones')
const { enviarCorreo, plantillaRegistro, plantillaLogin } = require('../utils/mailer')

const registrarUsuario = async (req, res) => {
  const { rut, nombre_completo, email, password, region, comuna } = req.body

  if (!validarRegionComuna(region, comuna)) {
    return res.status(400).json({ error: 'Región o comuna no válida. Selecciona una combinación real de Chile.' })
  }

  try {
    const salt          = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const result = await pool.query(
      `INSERT INTO usuario (rut, nombre_completo, email, password_hash, region, comuna)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, rut, email`,
      [rut, nombre_completo, email, password_hash, region, comuna]
    )

    try {
      await enviarCorreo(
        email,
        'Bienvenido al Sistema de Citas - Municipalidad de Santo Domingo',
        plantillaRegistro(nombre_completo)
      )
    } catch (mailErr) {
      console.error('Error enviando correo SMTP Registro:', mailErr.message)
    }

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

const loginUsuario = async (req, res) => {
  const { email, password } = req.body

  try {
    const usuario = await buscarUsuarioPorEmail(email)

    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash)

    if (!passwordValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
    }

    const token = jwt.sign(
      {
        id:             usuario.id,
        rut:            usuario.rut,
        nombre_completo: usuario.nombre_completo,
        email:          usuario.email,
        is_admin:       usuario.is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    try {
      const fechaActual = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })
      await enviarCorreo(
        usuario.email,
        'Nuevo inicio de sesión detectado',
        plantillaLogin(usuario.nombre_completo, fechaActual)
      )
    } catch (mailErr) {
      console.error('Error enviando correo SMTP Login:', mailErr.message)
    }

    res.json({
      token,
      usuario: {
        id:              usuario.id,
        rut:             usuario.rut,
        nombre_completo: usuario.nombre_completo,
        email:           usuario.email,
        region:          usuario.region,
        comuna:          usuario.comuna,
        is_admin:        usuario.is_admin,
      }
    })

  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno al iniciar sesión' })
  }
}

const logoutUsuario = async (req, res) => {
  res.json({ mensaje: 'Sesión cerrada' })
}

module.exports = { registrarUsuario, loginUsuario, logoutUsuario }