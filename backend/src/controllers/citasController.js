const { getCitasPorUsuario } = require('../db/queries/citas')

const listarCitasUsuario = async (req, res) => {
  try {
    const idUsuario = req.usuario.id  // viene del token JWT
    const citas = await getCitasPorUsuario(idUsuario)
    res.json(citas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener las citas' })
  }
}

module.exports = { listarCitasUsuario }