const {
  getCitasPorUsuario,
  getCitaPorCodigo,
  getAllCitas,
  getHorariosDisponibles,
  crearCita,
  modificarCita,
  cancelarCita,
} = require('../db/queries/citas')

// ── GET /api/citas/mis-citas  (usuario autenticado) ──────────────────────
const listarCitasUsuario = async (req, res) => {
  try {
    const citas = await getCitasPorUsuario(req.usuario.id)
    res.json(citas)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener las citas' })
  }
}

// ── GET /api/citas/all  (solo admin) ─────────────────────────────────────
const listarTodasCitas = async (req, res) => {
  try {
    if (!req.usuario.is_admin) {
      return res.status(403).json({ error: 'Acceso denegado.' })
    }
    const citas = await getAllCitas()
    res.json(citas)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener citas' })
  }
}

// ── GET /api/citas/:codigo  (por código, público para invitados) ─────────
const obtenerCitaPorCodigo = async (req, res) => {
  try {
    const cita = await getCitaPorCodigo(req.params.codigo)
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada.' })
    res.json(cita)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener la cita' })
  }
}

// ── GET /api/citas/disponibilidad?id_medico=&fecha= ──────────────────────
const obtenerDisponibilidad = async (req, res) => {
  const { id_medico, fecha } = req.query
  if (!id_medico || !fecha) {
    return res.status(400).json({ error: 'Se requieren id_medico y fecha.' })
  }
  // Validar formato de fecha
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD.' })
  }
  try {
    const horarios = await getHorariosDisponibles(id_medico, fecha)
    res.json({ horarios })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener disponibilidad' })
  }
}

// ── POST /api/citas  (crear cita) ────────────────────────────────────────
const crearNuevaCita = async (req, res) => {
  const { id_medico, fecha, hora, rut, nombre, email } = req.body

  if (!id_medico || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: id_medico, fecha, hora.' })
  }

  // Determinar si es usuario autenticado o invitado
  const esAutenticado = !!req.usuario

  if (!esAutenticado && (!rut || !nombre || !email)) {
    return res.status(400).json({ error: 'Pacientes sin cuenta deben proporcionar rut, nombre y email.' })
  }

  try {
    const payload = esAutenticado
      ? { id_paciente: req.usuario.id, id_medico, fecha, hora }
      : { rut_paciente: rut, nombre_paciente: nombre, email_paciente: email, id_medico, fecha, hora }

    const cita = await crearCita(payload)
    res.status(201).json({
      mensaje: 'Cita agendada exitosamente.',
      codigo_referencia: cita.codigo_referencia,
      cita,
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese horario ya fue tomado. Por favor elija otro.' })
    }
    console.error(err)
    res.status(500).json({ error: 'Error al crear la cita' })
  }
}

// ── PATCH /api/citas/:codigo  (modificar fecha/hora) ─────────────────────────
const actualizarCita = async (req, res) => {
  const { fecha, hora } = req.body
  const { codigo } = req.params

  if (!fecha || !hora) {
    return res.status(400).json({ error: 'Se requieren fecha y hora nuevas.' })
  }

  try {
    //Buscamos la cita usando el parámetro correcto de la URL
    const citaActual = await getCitaPorCodigo(codigo)

    if (!citaActual) {
      return res.status(404).json({ error: 'Cita no encontrada.' })
    }

    const idEditor = req.usuario?.id || null
    
    // Ejecutamos la query de actualización real en PostgreSQL
    const actualizada = await modificarCita(citaActual.id, fecha, hora, idEditor)
    
    // Respondemos con éxito (200 OK)
    res.json({ mensaje: 'Cita modificada exitosamente.', cita: actualizada })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese horario ya fue tomado. Por favor elija otro.' })
    }
    console.error('Error interno al actualizar cita:', err)
    res.status(500).json({ error: 'Error interno al modificar la cita.' })
  }
}

// ── PATCH /api/citas/:codigo/cancelar  (cancelar) ────────────────────────
const cancelarCitaHandler = async (req, res) => {
  try {
    const cita = await getCitaPorCodigo(req.params.codigo)
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada.' })

    if (cita.estado === 'Cancelada') {
      return res.status(409).json({ error: 'La cita ya está cancelada.' })
    }

    // Verificar que el usuario tenga permisos
    const usuario = req.usuario
    if (usuario && !usuario.is_admin && cita.id_paciente !== usuario.id) {
      return res.status(403).json({ error: 'No tiene permiso para cancelar esta cita.' })
    }

    const cancelada = await cancelarCita(cita.id, usuario?.id || null)
    res.json({ mensaje: 'Cita cancelada exitosamente.', cita: cancelada })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cancelar la cita' })
  }
}

module.exports = {
  listarCitasUsuario,
  listarTodasCitas,
  obtenerCitaPorCodigo,
  obtenerDisponibilidad,
  crearNuevaCita,
  actualizarCita,
  cancelarCitaHandler,
}
