const express = require('express')
const cors    = require('cors')
const helmet = require('helmet');
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const profesionalesRouter = require('./src/routes/profesionales')
const authRouter          = require('./src/routes/auth')
const ubicacionesRouter   = require('./src/routes/ubicaciones')
const citasRouter         = require('./src/routes/citas')
const usuariosRouter      = require('./src/routes/usuarios')

const app = express()
app.use(helmet());

// Configuración estricta de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())

// Prevención de Fuerza Bruta (Login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos. Intente en 15 minutos.' }
})

// Prevención DoS (API General)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Límite de peticiones excedido.' }
})

app.use('/api/auth/login', authLimiter)
app.use('/api/', apiLimiter)

// Rutas
app.use('/api/auth',      authRouter)
app.use('/api',           profesionalesRouter)
app.use('/api',           ubicacionesRouter)
app.use('/api/citas',     citasRouter)
app.use('/api/usuarios',  usuariosRouter)

//checkeo de si funciona
app.get('/', (_req, res) => {
  res.json({ mensaje: 'API Santo Domingo funcionando', version: '2.0' })
})

//error generico
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado.' })
})

//error global
app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err)
  res.status(500).json({ error: 'Error interno del servidor.' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
