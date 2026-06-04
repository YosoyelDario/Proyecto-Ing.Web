const router = require('express').Router()
const {
  listarEspecialidades,
  listarMedicosPorEspecialidad,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional,
} = require('../controllers/profesionalesController')
const { verificarToken, soloAdmin } = require('../middleware/auth')

// GET /api/especialidades (lista todas las especialidades disponibles)
router.get('/especialidades', listarEspecialidades)

// GET /api/especialidades/:id/medicos (lista los médicos de una especialidad)
router.get('/especialidades/:id/medicos', listarMedicosPorEspecialidad)

// POST /api/profesionales (crea un nuevo profesional, solo admin)
router.post('/profesionales', verificarToken, soloAdmin, crearProfesional)

// PATCH /api/profesionales/:id (actualiza datos de un profesional, solo admin)
router.patch('/profesionales/:id', verificarToken, soloAdmin, actualizarProfesional)

// DELETE /api/profesionales/:id (elimina un profesional, solo admin)
router.delete('/profesionales/:id', verificarToken, soloAdmin, eliminarProfesional)

module.exports = router