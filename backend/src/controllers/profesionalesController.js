const pool = require('../db/pool')

// listarEspecialidades
const listarEspecialidades = async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, nombre FROM especialidad ORDER BY nombre`)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener especialidades.' })
  }
}

// listarMedicosPorEspecialidad
const listarMedicosPorEspecialidad = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre FROM profesional WHERE id_especialidad = $1 ORDER BY nombre`,
      [req.params.id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener profesionales.' })
  }
}

// crearProfesional
const crearProfesional = async (req, res) => {
  const { rut, nombre, id_especialidad } = req.body
  if (!rut || !nombre || !id_especialidad) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: rut, nombre, id_especialidad.' })
  }
  try {
    const result = await pool.query(
      `INSERT INTO profesional (rut, nombre, id_especialidad) VALUES ($1, $2, $3) RETURNING *`,
      [rut, nombre, id_especialidad]
    )
    res.status(201).json({ mensaje: 'Profesional creado.', profesional: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al crear el profesional.' })
  }
}

// actualizarProfesional
const actualizarProfesional = async (req, res) => {
  const { nombre, id_especialidad } = req.body
  try {
    const result = await pool.query(
      `UPDATE profesional SET nombre = $1, id_especialidad = $2 WHERE id = $3 RETURNING *`,
      [nombre, id_especialidad, req.params.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Profesional no encontrado.' })
    res.json({ mensaje: 'Profesional actualizado.', profesional: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar el profesional.' })
  }
}

// eliminarProfesional
const eliminarProfesional = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM profesional WHERE id = $1 RETURNING *`,
      [req.params.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Profesional no encontrado.' })
    res.json({ mensaje: 'Profesional eliminado.', profesional: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar el profesional.' })
  }
}

module.exports = {
  listarEspecialidades,
  listarMedicosPorEspecialidad,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional,
}