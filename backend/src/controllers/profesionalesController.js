// Modificar la primera línea de profesionalesController.js:
const profesionalesModel = require('../db/queries/profesionales');

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

/**
 * GET /api/profesionales
 * Devuelve todos los profesionales (admin).
 */
const listarTodosProfesionales = async (req, res) => {
  try {
    const rows = await profesionalesModel.getTodosProfesionales()
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener profesionales.' })
  }
}

/**
 * GET /api/especialidades/:id/medicos
 * Devuelve los profesionales de una especialidad.
 */
const listarMedicosPorEspecialidad = async (req, res) => {
  try {
    const rows = await profesionalesModel.getMedicosPorEspecialidad(req.params.id)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener profesionales.' })
  }
}

/**
 * POST /api/profesionales
 * Crea un nuevo profesional. Requiere: rut, nombre, id_especialidad.
 */
const crearProfesional = async (req, res) => {
  const { rut, nombre, id_especialidad, activo } = req.body

  if (!rut || !nombre || !id_especialidad) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: rut, nombre, id_especialidad.',
    })
  }

  try {
    const profesional = await profesionalesModel.crearProfesional({
      rut,
      nombre,
      id_especialidad,
      activo,
    })
    res.status(201).json({ mensaje: 'Profesional creado.', profesional })
  } catch (err) {
    console.error(err)
    // RUT duplicado u otra violación de unicidad
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un profesional con ese RUT.' })
    }
    // FK inválida (especialidad inexistente)
    if (err.code === '23503') {
      return res.status(400).json({ error: 'La especialidad indicada no existe.' })
    }
    res.status(500).json({ error: 'Error al crear el profesional.' })
  }
}

/**
 * PATCH /api/profesionales/:id
 * Actualiza parcialmente un profesional. Solo se modifican los campos enviados.
 */
const actualizarProfesional = async (req, res) => {
  const { nombre, rut, id_especialidad, activo } = req.body

  // Construir objeto solo con los campos que llegaron
  const campos = {}
  if (nombre        !== undefined) campos.nombre        = nombre
  if (rut           !== undefined) campos.rut           = rut
  if (id_especialidad !== undefined) campos.id_especialidad = id_especialidad
  if (activo        !== undefined) campos.activo        = activo

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar.' })
  }

  try {
    const profesional = await profesionalesModel.actualizarProfesional(req.params.id, campos)
    if (!profesional) {
      return res.status(404).json({ error: 'Profesional no encontrado.' })
    }
    res.json({ mensaje: 'Profesional actualizado.', profesional })
  } catch (err) {
    console.error(err)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un profesional con ese RUT.' })
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: 'La especialidad indicada no existe.' })
    }
    res.status(500).json({ error: 'Error al actualizar el profesional.' })
  }
}

/**
 * DELETE /api/profesionales/:id
 * Elimina un profesional.
 */
const eliminarProfesional = async (req, res) => {
  try {
    const profesional = await profesionalesModel.eliminarProfesional(req.params.id)
    if (!profesional) {
      return res.status(404).json({ error: 'Profesional no encontrado.' })
    }
    res.json({ mensaje: 'Profesional eliminado.', profesional })
  } catch (err) {
    console.error(err)
    // FK: el profesional tiene citas asociadas
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'No se puede eliminar: el profesional tiene citas asociadas.',
      })
    }
    res.status(500).json({ error: 'Error al eliminar el profesional.' })
  }
}

module.exports = {
  listarEspecialidades,
  listarTodosProfesionales,
  listarMedicosPorEspecialidad,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional,
}