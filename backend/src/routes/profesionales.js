const express = require('express');
const router = express.Router();
const profesionalesController = require('../controllers/profesionalesController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// Especialidades
router.get('/especialidades', profesionalesController.listarEspecialidades);
router.get('/especialidades/:id/medicos', profesionalesController.listarMedicosPorEspecialidad);

// Profesionales
router.get('/profesionales', profesionalesController.listarTodosProfesionales);
router.post('/profesionales', verificarToken, soloAdmin, profesionalesController.crearProfesional);
router.patch('/profesionales/:id', verificarToken, soloAdmin, profesionalesController.actualizarProfesional);
router.delete('/profesionales/:id', verificarToken, soloAdmin, profesionalesController.eliminarProfesional);

// Nota: Rutas de agenda y excepciones requerirán que se implementen e importen sus funciones respectivas en el controlador para evitar errores de callback indefinido.
// router.get('/profesionales/:id/agenda', profesionalesController.obtenerAgenda);
// router.post('/profesionales/:id/agenda', verificarToken, soloAdmin, profesionalesController.guardarAgenda);
// router.get('/profesionales/:id/excepciones', profesionalesController.obtenerExcepciones);
// router.post('/profesionales/:id/excepciones', verificarToken, soloAdmin, profesionalesController.agregarExcepcion);
// router.delete('/profesionales/excepciones/:id', verificarToken, soloAdmin, profesionalesController.eliminarExcepcion);

module.exports = router;