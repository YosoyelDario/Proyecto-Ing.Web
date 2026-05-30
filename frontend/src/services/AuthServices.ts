export const AuthService = {

  registrarUsuario: async (datosUsuario: unknown) => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosUsuario)
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al registrar el usuario')
    }
    return response.json()
  },

  loginUsuario: async (email: string, password: string) => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al iniciar sesión')
    }
    return response.json()
  },

  guardarSesion: (token: string, usuario: unknown) => {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
  },

  obtenerUsuario: () => {
    const usuario = localStorage.getItem('usuario')
    return usuario ? JSON.parse(usuario) : null
  },

  obtenerToken: () => localStorage.getItem('token'),

  estaAutenticado: () => !!localStorage.getItem('token'),

  esAdmin: () => {
    const usuario = AuthService.obtenerUsuario()
    return usuario?.is_admin === true
  },

  cerrarSesion: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }
}

// ── Interceptor centralizado para todas las llamadas a la API ──
const API_URL = 'http://localhost:3000'

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = AuthService.obtenerToken()

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }
  })

  // Token expirado o inválido — cierra sesión y redirige
  if (response.status === 401 || response.status === 403) {
    AuthService.cerrarSesion()
    window.location.href = '/'
  }

  return response
}