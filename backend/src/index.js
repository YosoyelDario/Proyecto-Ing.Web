// backend/src/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware (Funcion de la asignatura, En teoria se puede reemplazar instalando Morgan)
const registrarPeticion = (req, res, next) => {
  const fecha = new Date().toLocaleTimeString();
  console.log(`[${fecha}] ${req.method} a la ruta: ${req.url}`);
  next(); // Permite que la ejecución continúe hacia el endpoint
};

// Middlewares Base Obligatorios 
app.use(cors({ origin: 'http://localhost:5173' })); // Permite la conexión con Ionic
app.use(express.json());                            // Permite leer cuerpos JSON (req.body)
app.use(registrarPeticion);                         // Logger de consola

// Ruta de Health Check 
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    ok: true,
    data: null,
    message: "Servidor corriendo perfectamente en la Municipalidad de Santo Domingo"
  });
});

// Middleware Global de Manejo de Errores 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    ok: false,
    data: null,
    message: "Error interno del servidor"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP v1 corriendo en http://localhost:${PORT}`);
});