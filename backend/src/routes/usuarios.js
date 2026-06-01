const router = require('express').Router()
const { obtenerPerfil, actualizarPerfil } = require('../controllers/usuariosController')
const { verificarToken } = require('../middleware/auth')

// GET   /api/usuarios/me
router.get('/me', verificarToken, obtenerPerfil)

// PATCH /api/usuarios/me
router.patch('/me', verificarToken, actualizarPerfil)

module.exports = router
