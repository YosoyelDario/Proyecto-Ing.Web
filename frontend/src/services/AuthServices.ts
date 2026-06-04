import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'


export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Utilidades JWT

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function tokenHaExpirado(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return true
  return payload.exp * 1000 < Date.now()
}


apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthService.obtenerToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)


apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const body = error.response?.data as Record<string, unknown> | undefined

    if (status === 401) {
      AuthService.cerrarSesion()
      window.dispatchEvent(new CustomEvent('auth_error'))
      return Promise.reject(
        new Error((body?.error as string) || 'Sesión expirada. Por favor inicia sesión nuevamente.')
      )
    }

    if (status === 403) {
      return Promise.reject(
        new Error((body?.error as string) || 'No tienes permisos para realizar esta acción.')
      )
    }

    const mensaje =
      (body?.error as string) ||
      error.message ||
      'Error inesperado en la solicitud'
    return Promise.reject(new Error(mensaje))
  }
)


export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method ?? 'GET') as string

  let data: unknown = undefined
  if (options.body) {
    try {
      data = JSON.parse(options.body as string)
    } catch {
      data = options.body
    }
  }

  const axiosResponse = await apiClient.request({
    url,
    method,
    data,
  })

  // Construye una Response estándar para que .ok y .json() funcionen igual
  const blob = new Blob([JSON.stringify(axiosResponse.data)], {
    type: 'application/json',
  })
  return new Response(blob, {
    status: axiosResponse.status,
    statusText: axiosResponse.statusText,
  })
}

// ── Servicio de autenticación ─────────────────────────────────────────────
export const AuthService = {

  // POST /api/auth/register
  registrarUsuario: async (datosUsuario: unknown) => {
    const { data } = await apiClient.post('/api/auth/register', datosUsuario)
    return data
  },

  // POST /api/auth/login
  loginUsuario: async (email: string, password: string) => {
    const { data } = await apiClient.post('/api/auth/login', { email, password })
    return data
  },


  logoutUsuario: async () => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch {
      // Ignorar errores de red al hacer logout; la sesión local se limpia igualmente
    } finally {
      AuthService.cerrarSesion()
    }
  },

  
  guardarSesion: (token: string, usuario: unknown) => {
    const payload = decodeJwtPayload(token)
    const exp = typeof payload?.exp === 'number' ? payload.exp * 1000 : null

    sessionStorage.setItem('token', token)
    sessionStorage.setItem('usuario', JSON.stringify(usuario))
    if (exp) sessionStorage.setItem('session_exp', String(exp))
  },

  obtenerToken: (): string | null => {
    const token = sessionStorage.getItem('token')
    if (!token) return null
    if (tokenHaExpirado(token)) {
      AuthService.cerrarSesion()
      return null
    }
    return token
  },

  obtenerUsuario: () => {
    if (!AuthService.estaAutenticado()) return null
    const raw = sessionStorage.getItem('usuario')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      // Dato corrupto en storage: limpiar para evitar bucles
      AuthService.cerrarSesion()
      return null
    }
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