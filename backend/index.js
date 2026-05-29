const express = require('express')
const cors    = require('cors')
require('dotenv').config()

const profesionalesRouter = require('./src/routes/profesionales') 

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', profesionalesRouter)

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Santo Domingo funcionando' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})