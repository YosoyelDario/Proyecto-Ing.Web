const router = require('express').Router()
const { listarEspecialidades } = require('../controllers/profesionalesController')

router.get('/especialidades', listarEspecialidades)

module.exports = router