const pool = require('../pool')

const getCitasPorUsuario = async (idUsuario) => {
  const result = await pool.query(
    `SELECT 
      c.id,
      c.codigo_referencia,
      c.fecha,
      c.hora,
      c.estado,
      p.nombre AS medico,
      e.nombre AS especialidad
    FROM cita c
    JOIN profesional p ON c.id_medico = p.id
    JOIN especialidad e ON p.id_especialidad = e.id
    WHERE c.id_paciente = $1
    ORDER BY c.fecha DESC, c.hora DESC`,
    [idUsuario]
  )
  return result.rows
}

module.exports = { getCitasPorUsuario }