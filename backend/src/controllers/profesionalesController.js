const profesionalesModel = require('../db/queries/profesionales')

// ─── Especialidades ───────────────────────────────────────────────────────────

const listarEspecialidades = async (req, res) => {
  try {
    const rows = await profesionalesModel.getEspecialidades()
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener especialidades.' })
  }
}

// ─── Profesionales ────────────────────────────────────────────────────────────

const listarTodosProfesionales = async (req, res) => {
  try {
    const rows = await profesionalesModel.getTodosProfesionales()
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener profesionales.' })
  }
}

const listarMedicosPorEspecialidad = async (req, res) => {
  try {
    const rows = await profesionalesModel.getMedicosPorEspecialidad(req.params.id)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener profesionales.' })
  }
}

const crearProfesional = async (req, res) => {
  const { rut, nombre, id_especialidad } = req.body

  if (!rut || !nombre || !id_especialidad) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: rut, nombre, id_especialidad.',
    })
  }

  try {
    const profesional = await profesionalesModel.crearProfesional({ rut, nombre, id_especialidad })
    res.status(201).json({ mensaje: 'Profesional creado.', profesional })
  } catch (err) {
    console.error(err)
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe un profesional con ese RUT.' })
    if (err.code === '23503') return res.status(400).json({ error: 'La especialidad indicada no existe.' })
    res.status(500).json({ error: 'Error al crear el profesional.' })
  }
}

const actualizarProfesional = async (req, res) => {
  const { nombre, rut, id_especialidad } = req.body

  const campos = {}
  if (nombre          !== undefined) campos.nombre          = nombre
  if (rut             !== undefined) campos.rut             = rut
  if (id_especialidad !== undefined) campos.id_especialidad = id_especialidad

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar.' })
  }

  try {
    const profesional = await profesionalesModel.actualizarProfesional(req.params.id, campos)
    if (!profesional) return res.status(404).json({ error: 'Profesional no encontrado.' })
    res.json({ mensaje: 'Profesional actualizado.', profesional })
  } catch (err) {
    console.error(err)
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe un profesional con ese RUT.' })
    if (err.code === '23503') return res.status(400).json({ error: 'La especialidad indicada no existe.' })
    res.status(500).json({ error: 'Error al actualizar el profesional.' })
  }
}

const eliminarProfesional = async (req, res) => {
  try {
    const profesional = await profesionalesModel.eliminarProfesional(req.params.id)
    if (!profesional) return res.status(404).json({ error: 'Profesional no encontrado.' })
    res.json({ mensaje: 'Profesional eliminado.', profesional })
  } catch (err) {
    console.error(err)
    if (err.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar: el profesional tiene citas asociadas.' })
    }
    res.status(500).json({ error: 'Error al eliminar el profesional.' })
  }
}

// ─── Agenda semanal ───────────────────────────────────────────────────────────

const obtenerAgenda = async (req, res) => {
  try {
    const horarios = await profesionalesModel.getAgendaMedico(req.params.id)
    res.json(horarios)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener la agenda.' })
  }
}

const guardarAgenda = async (req, res) => {
  const { horarios } = req.body

  if (!Array.isArray(horarios)) {
    return res.status(400).json({ error: 'Se esperaba un array de horarios.' })
  }

  try {
    const resultado = await profesionalesModel.guardarAgendaSemanal(req.params.id, horarios)
    res.json({ mensaje: 'Agenda guardada.', horarios: resultado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al guardar la agenda.' })
  }
}

// ─── Excepciones (feriados / licencias) ──────────────────────────────────────

const obtenerExcepciones = async (req, res) => {
  try {
    const excepciones = await profesionalesModel.getExcepcionesMedico(req.params.id)
    res.json(excepciones)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener excepciones.' })
  }
}

const agregarExcepcion = async (req, res) => {
  const { fecha, hora_inicio, hora_fin, duracion_minutos, tipo, motivo } = req.body

  if (!fecha || !tipo) {
    return res.status(400).json({ error: 'Se requieren fecha y tipo.' })
  }
  if (!['Feriado', 'Licencia'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo debe ser "Feriado" o "Licencia".' })
  }

  try {
    const excepcion = await profesionalesModel.crearExcepcion(req.params.id, {
      fecha, hora_inicio, hora_fin, duracion_minutos, tipo, motivo
    })
    res.status(201).json({ mensaje: 'Excepción registrada.', excepcion })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al registrar la excepción.' })
  }
}

const eliminarExcepcionHandler = async (req, res) => {
  try {
    const excepcion = await profesionalesModel.eliminarExcepcion(req.params.id)
    if (!excepcion) return res.status(404).json({ error: 'Excepción no encontrada.' })
    res.json({ mensaje: 'Excepción eliminada.', excepcion })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar la excepción.' })
  }
}

module.exports = {
  listarEspecialidades,
  listarTodosProfesionales,
  listarMedicosPorEspecialidad,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional,
  obtenerAgenda,
  guardarAgenda,
  obtenerExcepciones,
  agregarExcepcion,
  eliminarExcepcionHandler,
}
