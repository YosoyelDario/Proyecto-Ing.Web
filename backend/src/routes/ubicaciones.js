const router = require('express').Router()
const { listarRegiones } = require('../controllers/ubicacionesController')

router.get('/regiones', listarRegiones)

module.exports = router