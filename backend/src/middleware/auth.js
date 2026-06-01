const jwt = require('jsonwebtoken')

// ── Middleware: token requerido ───────────────────────────────────────────
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sesión expirada. Por favor inicia sesión nuevamente.', expired: true })
    }
    return res.status(403).json({ error: 'Token inválido.' })
  }
}

// ── Middleware: token opcional (para rutas públicas que también sirven autenticados) ──
const tokenOpcional = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.usuario = null
    return next()
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    req.usuario = null
  }
  next()
}

// ── Middleware: solo admin ────────────────────────────────────────────────
const soloAdmin = (req, res, next) => {
  if (!req.usuario?.is_admin) {
    return res.status(403).json({ error: 'Acceso restringido a administradores.' })
  }
  next()
}

module.exports = { verificarToken, tokenOpcional, soloAdmin }
