import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Páginas universales
import Home     from '../src/pages/Home'
import Login    from '../src/pages/Login'
import Register from '../src/pages/Register'

// RF1 — Agendar cita
import Agendar from '../src/pages/Agendar'

// RF2 — Consultar cita por código referido
import ConsultarCita from '../src/pages/ConsultarCita'

// RF3 — Modificar cita
import ModificarCita from '../src/pages/ModificarCita'

// RF4 — Cancelar cita
import CancelarCita from '../src/pages/CancelarCita'

// RF5 — Confirmación de cita (post-acción)
import ConfirmacionCita from '../src/pages/ConfirmacionCita'

// RF6 — Panel administrativo
import AdminRuta    from '../src/components/AdminRuta'
import AdminPanel   from '../src/pages/admin/AdminPanel'
import GestionCitas from '../src/pages/admin/GestionCitas'
import RegisterSuccess from '../src/pages/RegisterSuccess';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Públicas ── */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} /> {/* Nueva ruta */}

        {/* ── RF1: Agendar ── */}
        <Route path="/agendar" element={<Agendar />} />

        {/* ── RF2: Consultar cita ── */}
        <Route path="/consultar" element={<ConsultarCita />} />

        {/* ── RF3: Modificar cita ── */}
        {/*
          Recibe el código referido como parámetro para precargar los datos.
          Ejemplo: /modificar/ABC-1234
        */}
        <Route path="/modificar/:codigo" element={<ModificarCita />} />

        {/* ── RF4: Cancelar cita ── */}
        <Route path="/cancelar/:codigo" element={<CancelarCita />} />

        {/* ── RF5: Confirmación post-acción ── */}
        {/*
          Recibe el tipo de acción para mostrar el mensaje correcto:
          /confirmacion?accion=agendada | cancelada | modificada
        */}
        <Route path="/confirmacion" element={<ConfirmacionCita />} />

        {/* ── RF6: Admin (protegido por AdminRuta) ── */}
        <Route
          path="/admin"
          element={
            <AdminRuta>
              <AdminPanel />
            </AdminRuta>
          }
        />
        <Route
          path="/admin/gestion/:codigo?"
          element={
            <AdminRuta>
              <GestionCitas />
            </AdminRuta>
          }
        />
      </Routes>
    </BrowserRouter>
  )
} 