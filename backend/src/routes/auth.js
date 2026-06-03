const express = require('express')
const router  = express.Router()
const { registrarUsuario, loginUsuario, logoutUsuario } = require('../controllers/authController')
const { verificarToken } = require('../middleware/auth')

// POST /api/auth/register
router.post('/register', registrarUsuario)

// POST /api/auth/login
router.post('/login', loginUsuario)

// POST /api/auth/logout
router.post('/logout', verificarToken, logoutUsuario)

module.exports = router