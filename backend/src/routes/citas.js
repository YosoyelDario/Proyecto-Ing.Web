const router = require('express').Router()
const { listarCitasUsuario } = require('../controllers/citasController')
const { verificarToken } = require('../middleware/auth')

router.get('/mis-citas', verificarToken, listarCitasUsuario)

module.exports = router