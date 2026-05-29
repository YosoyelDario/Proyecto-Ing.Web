const { getEspecialidades } = require('../db/queries/profesionales')

const listarEspecialidades = async (req, res) => {
  try {
    const especialidades = await getEspecialidades()
    res.json(especialidades)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener especialidades' })
  }
}

module.exports = { listarEspecialidades }