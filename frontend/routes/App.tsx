import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

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
import CambiarPassword from '../src/pages/CambiarPassword'
import RutaProtegida   from '../src/components/RutaProtegida'
import { GestionMedicos } from '../src/pages/admin/GestionMedicos'

function AuthInterceptor() {
  const navigate = useNavigate()
  
  useEffect(() => {
    const handleAuthError = () => {
      navigate('/login', { replace: true })
    }
    window.addEventListener('auth_error', handleAuthError)
    return () => window.removeEventListener('auth_error', handleAuthError)
  }, [navigate])
  
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInterceptor />
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
        <Route path="/cambiar-password" element={
          <RutaProtegida>
            <CambiarPassword />
          </RutaProtegida>
        } />

        {/* ── Solo admin ── */}
        <Route path="/admin/medicos" element={
  <RutaProtegida soloAdmin>
    <GestionMedicos />
  </RutaProtegida>
} />
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