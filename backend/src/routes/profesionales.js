const router = require('express').Router()
const { listarEspecialidades, listarMedicosPorEspecialidad } = require('../controllers/profesionalesController')

// GET /api/especialidades
router.get('/especialidades', listarEspecialidades)

// GET /api/especialidades/:id/medicos
router.get('/especialidades/:id/medicos', listarMedicosPorEspecialidad)

module.exports = router
