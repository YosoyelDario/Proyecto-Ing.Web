const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── Decodifica el payload del JWT sin librerías externas ──────────────────
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// ── Verifica si un token ya expiró (sin llamar al servidor) ───────────────
function tokenHaExpirado(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return true
  // exp es en segundos Unix; Date.now() en milisegundos
  return payload.exp * 1000 < Date.now()
}

export const AuthService = {

  registrarUsuario: async (datosUsuario: unknown) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosUsuario),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al registrar el usuario')
    }
    return response.json()
  },

  loginUsuario: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al iniciar sesión')
    }
    return response.json()
  },

  // Guarda token + usuario + timestamp de expiración en sessionStorage
  // sessionStorage se borra automáticamente al cerrar la pestaña/navegador
  guardarSesion: (token: string, usuario: unknown) => {
    const payload = decodeJwtPayload(token)
    const exp = typeof payload?.exp === 'number' ? payload.exp * 1000 : null

    sessionStorage.setItem('token', token)
    sessionStorage.setItem('usuario', JSON.stringify(usuario))
    if (exp) sessionStorage.setItem('session_exp', String(exp))
  },

  obtenerUsuario: () => {
    // Verificar expiración antes de devolver el usuario
    if (!AuthService.estaAutenticado()) return null
    const raw = sessionStorage.getItem('usuario')
    return raw ? JSON.parse(raw) : null
  },

  obtenerToken: () => {
    const token = sessionStorage.getItem('token')
    if (!token) return null
    // Verificar expiración del lado del cliente
    if (tokenHaExpirado(token)) {
      AuthService.cerrarSesion()
      return null
    }
    return token
  },

  estaAutenticado: (): boolean => {
    const token = sessionStorage.getItem('token')
    if (!token) return false
    if (tokenHaExpirado(token)) {
      AuthService.cerrarSesion()
      return false
    }
    return true
  },

  esAdmin: (): boolean => {
    const usuario = AuthService.obtenerUsuario()
    return usuario?.is_admin === true
  },

  cerrarSesion: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('usuario')
    sessionStorage.removeItem('session_exp')
  },
}

// ── Interceptor centralizado para todas las llamadas a la API ─────────────
export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = AuthService.obtenerToken()

  // Si el token expiró, obtenerToken() ya cerró la sesión y devolvió null
  if (sessionStorage.getItem('token') === null && options.method && options.method !== 'GET') {
    // Solo redirige si intentaba hacer algo que requería auth
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Si el servidor responde con 401 (token expirado o inválido), cerrar sesión
  if (response.status === 401) {
    const body = await response.clone().json().catch(() => ({}))
    AuthService.cerrarSesion()
    // Redirigir al login solo si no estamos ya ahí
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
    // Lanzar error para que el caller lo maneje
    throw new Error(body.error || 'Sesión expirada')
  }

  if (response.status === 403) {
    throw new Error('No tienes permisos para realizar esta acción.')
  }

  return response
}
