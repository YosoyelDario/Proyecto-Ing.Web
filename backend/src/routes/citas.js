const router = require('express').Router()
const {
  listarCitasUsuario,
  listarTodasCitas,
  obtenerCitaPorCodigo,
  obtenerDisponibilidad,
  crearNuevaCita,
  actualizarCita,
  cancelarCitaHandler,
  eliminarCitaHandler,
} = require('../controllers/citasController')
const { verificarToken, tokenOpcional, soloAdmin } = require('../middleware/auth')

// GET  /api/citas/disponibilidad?id_medico=&fecha=   (público)
router.get('/disponibilidad', obtenerDisponibilidad)

// GET  /api/citas/mis-citas                          (autenticado)
router.get('/mis-citas', verificarToken, listarCitasUsuario)

// GET  /api/citas/all                                (solo admin)
router.get('/all', verificarToken, soloAdmin, listarTodasCitas)

// GET  /api/citas/:codigo                            (público, por código)
router.get('/:codigo', obtenerCitaPorCodigo)

// POST /api/citas                                    (autenticado O invitado)
router.post('/', tokenOpcional, crearNuevaCita)

// PATCH /api/citas/:codigo                           (autenticado O invitado con código)
router.patch('/:codigo', tokenOpcional, actualizarCita)

// PATCH /api/citas/:codigo/cancelar                  (autenticado O invitado)
router.patch('/:codigo/cancelar', tokenOpcional, cancelarCitaHandler)

// DELETE /api/citas/:codigo                          (solo admin eliminarCita)
router.delete('/:codigo', verificarToken, soloAdmin, eliminarCitaHandler)

module.exports = router
