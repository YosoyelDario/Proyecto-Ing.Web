import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home            from '../src/pages/Home'
import Login           from '../src/pages/Login'
import Register        from '../src/pages/Register'
import RegisterSuccess from '../src/pages/RegisterSuccess'
import Agendar         from '../src/pages/Agendar'
import ConsultarCita   from '../src/pages/ConsultarCita'
import ModificarCita   from '../src/pages/ModificarCita'
import CancelarCita    from '../src/pages/CancelarCita'
import ConfirmacionCita from '../src/pages/ConfirmacionCita'
import AdminPanel      from '../src/pages/admin/AdminPanel'
import GestionCitas    from '../src/pages/admin/GestionCitas'
import Dashboard       from '../src/pages/Dashboard'
import RutaProtegida   from '../src/components/RutaProtegida'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Públicas ── */}
        <Route path="/"                 element={<Home />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/agendar"          element={<Agendar />} />
        <Route path="/consultar"        element={<ConsultarCita />} />
        <Route path="/confirmacion"     element={<ConfirmacionCita />} />
        <Route path="/modificar/:codigo" element={<ModificarCita />} />
        <Route path="/cancelar/:codigo"  element={<CancelarCita />} />

        {/* ── Protegidas (requieren sesión) ── */}
        <Route path="/dashboard" element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        } />

        {/* ── Solo admin ── */}
        <Route path="/admin" element={
          <RutaProtegida soloAdmin>
            <AdminPanel />
          </RutaProtegida>
        } />
        <Route path="/admin/gestion/:codigo?" element={
          <RutaProtegida soloAdmin>
            <GestionCitas />
          </RutaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  )
}