export const ADMIN_EMAIL = 'tuadmin@gmail.com'

export const AuthService = {
  esAdminValido: (): boolean => {
    const emailGuardado = localStorage.getItem('userEmail')
    return Boolean(emailGuardado && emailGuardado.toLowerCase() === ADMIN_EMAIL)
  },
  cerrarSesion: (): void => {
    localStorage.removeItem('userEmail')
  }
}