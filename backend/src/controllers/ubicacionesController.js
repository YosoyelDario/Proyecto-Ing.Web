const { getRegiones } = require('../db/queries/ubicaciones')

const listarRegiones = (req, res) => {
  try {
    const data = getRegiones()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener regiones' })
  }
}

module.exports = { listarRegiones }