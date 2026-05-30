import { Navigate } from 'react-router-dom'
import { AuthService } from '../services/AuthServices'

interface Props {
  children: React.ReactNode
  soloAdmin?: boolean
}

export default function RutaProtegida({ children, soloAdmin = false }: Props) {
  const autenticado = AuthService.estaAutenticado()
  const esAdmin     = AuthService.esAdmin()

  if (!autenticado) return <Navigate to="/login" replace />
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}