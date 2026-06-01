const { getEspecialidades, getMedicosPorEspecialidad } = require('../db/queries/profesionales')

const listarEspecialidades = async (req, res) => {
  try {
    const especialidades = await getEspecialidades()
    res.json(especialidades)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener especialidades' })
  }
}

const listarMedicosPorEspecialidad = async (req, res) => {
  const { id } = req.params
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID de especialidad inválido.' })
  }
  try {
    const medicos = await getMedicosPorEspecialidad(id)
    res.json(medicos)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener médicos' })
  }
}

module.exports = { listarEspecialidades, listarMedicosPorEspecialidad }
