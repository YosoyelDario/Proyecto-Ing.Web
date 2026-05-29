/* eslint-disable @typescript-eslint/no-explicit-any */
export const ADMIN_EMAIL = 'tuadmin@gmail.com'

export const AuthService = {
  esAdminValido: (): boolean => {
    const emailGuardado = localStorage.getItem('userEmail')
    return Boolean(emailGuardado && emailGuardado.toLowerCase() === ADMIN_EMAIL)
  },
  cerrarSesion: (): void => {
    localStorage.removeItem('userEmail')
  },
  registrarUsuario: async (datosUsuario: any) => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosUsuario)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al registrar el usuario')
    }
    
    return response.json()
  }
}