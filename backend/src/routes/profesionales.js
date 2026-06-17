const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/profesionalesController')
const { verificarToken, soloAdmin } = require('../middleware/auth')

// ─── Especialidades (públicas) ────────────────────────────────────────────────
router.get('/especialidades',              ctrl.listarEspecialidades)
router.get('/especialidades/:id/medicos',  ctrl.listarMedicosPorEspecialidad)

// ─── Profesionales ────────────────────────────────────────────────────────────
router.get('/profesionales',              ctrl.listarTodosProfesionales)
router.post('/profesionales',             verificarToken, soloAdmin, ctrl.crearProfesional)
router.patch('/profesionales/:id',        verificarToken, soloAdmin, ctrl.actualizarProfesional)
router.delete('/profesionales/:id',       verificarToken, soloAdmin, ctrl.eliminarProfesional)

// ─── Agenda semanal ───────────────────────────────────────────────────────────
router.get('/profesionales/:id/agenda',   ctrl.obtenerAgenda)
router.post('/profesionales/:id/agenda',  verificarToken, soloAdmin, ctrl.guardarAgenda)

// ─── Excepciones (feriados / licencias) ──────────────────────────────────────
router.get('/profesionales/:id/excepciones',    ctrl.obtenerExcepciones)
router.post('/profesionales/:id/excepciones',   verificarToken, soloAdmin, ctrl.agregarExcepcion)
router.delete('/profesionales/excepciones/:id', verificarToken, soloAdmin, ctrl.eliminarExcepcionHandler)

module.exports = router
