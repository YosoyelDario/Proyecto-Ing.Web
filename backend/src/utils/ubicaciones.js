const { getRegiones } = require('../db/queries/ubicaciones')

const validarRegionComuna = (region, comuna) => {
  if (!region || !comuna) return false
  const regiones = getRegiones()
  return Array.isArray(regiones[region]) && regiones[region].includes(comuna)
}

module.exports = { validarRegionComuna }
