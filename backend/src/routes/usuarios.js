const router = require('express').Router()
const { obtenerPerfil, actualizarPerfil, crearUsuarioAdmin, cambiarPassword, eliminarCuenta } = require('../controllers/usuariosController')
const { verificarToken, soloAdmin } = require('../middleware/auth')

// GET   /api/usuarios/me   
router.get('/me', verificarToken, obtenerPerfil)

// PATCH /api/usuarios/me
router.patch('/me', verificarToken, actualizarPerfil)

// PATCH /api/usuarios/me/password  (cambiar contraseña propia)
router.patch('/me/password', verificarToken, cambiarPassword)

// POST  /api/usuarios/admin  (solo admin)
router.post('/admin', verificarToken, soloAdmin, crearUsuarioAdmin)

// DELETE /api/usuarios/me  (autenticado cuenta propia)
router.delete('/me', verificarToken, eliminarCuenta)

module.exports = router
