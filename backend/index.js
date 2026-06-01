const express = require('express')
const cors    = require('cors')
require('dotenv').config()

const profesionalesRouter = require('./src/routes/profesionales')
const authRouter          = require('./src/routes/auth')
const ubicacionesRouter   = require('./src/routes/ubicaciones')
const citasRouter         = require('./src/routes/citas')
const usuariosRouter      = require('./src/routes/usuarios')

const app = express()

app.use(cors())
app.use(express.json())

// ── Rutas ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRouter)
app.use('/api',           profesionalesRouter)
app.use('/api',           ubicacionesRouter)
app.use('/api/citas',     citasRouter)
app.use('/api/usuarios',  usuariosRouter)

// ── Health check ─────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ mensaje: 'API Santo Domingo funcionando', version: '2.0' })
})

// ── 404 genérico ─────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado.' })
})

// ── Error handler global ─────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err)
  res.status(500).json({ error: 'Error interno del servidor.' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
