import { apiFetch } from './AuthServices'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface Especialidad {
  id: number
  nombre: string
}

export interface Medico {
  id: number
  nombre: string
  especialidad: string
}

export interface Cita {
  id: number
  codigo_referencia: string
  fecha: string
  hora: string
  estado: string
  medico: string
  especialidad: string
  // Datos paciente
  id_paciente?: number | null // ID de la tabla usuario si está registrado
  rut?: string
  nombre?: string
  email?: string
}

export interface NuevaCita {
  id_medico: number
  fecha: string
  hora: string
  // Solo para invitados
  rut?: string
  nombre?: string
  email?: string
}

// ── Especialidades ────────────────────────────────────────────────────────
export async function getEspecialidades(): Promise<Especialidad[]> {
  const res = await fetch(`${API_URL}/api/especialidades`)
  if (!res.ok) throw new Error('Error al cargar especialidades')
  return res.json()
}

// ── Médicos por especialidad ──────────────────────────────────────────────
export async function getMedicosPorEspecialidad(idEspecialidad: number): Promise<Medico[]> {
  const res = await fetch(`${API_URL}/api/especialidades/${idEspecialidad}/medicos`)
  if (!res.ok) throw new Error('Error al cargar médicos')
  return res.json()
}

// ── Horarios disponibles ──────────────────────────────────────────────────
export async function getHorariosDisponibles(idMedico: number, fecha: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/citas/disponibilidad?id_medico=${idMedico}&fecha=${fecha}`)
  if (!res.ok) throw new Error('Error al cargar horarios')
  const data = await res.json()
  return data.horarios
}

// ── Crear cita (autenticado o invitado) ───────────────────────────────────
export async function crearCita(datos: NuevaCita, autenticado: boolean): Promise<{ codigo_referencia: string }> {
  let res: Response

  if (autenticado) {
    // Usuario con sesión: apiFetch incluye el token automáticamente
    res = await apiFetch('/api/citas', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  } else {
    // Invitado: fetch sin token
    res = await fetch(`${API_URL}/api/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al agendar la cita')
  }
  return res.json()
}

// ── Consultar cita por código (público) ───────────────────────────────────
export async function consultarCitaPorCodigo(codigo: string): Promise<Cita | null> {
  const res = await fetch(`${API_URL}/api/citas/${codigo.trim().toUpperCase()}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Error al consultar la cita')
  return res.json()
}

// ── Modificar fecha/hora de una cita ─────────────────────────────────────
export async function modificarCita(
  codigo: string,
  nuevaFecha: string,
  nuevaHora: string,
  autenticado: boolean
): Promise<boolean> {
  let res: Response
  const body = JSON.stringify({ fecha: nuevaFecha, hora: nuevaHora })

  if (autenticado) {
    res = await apiFetch(`/api/citas/${codigo}`, {
      method: 'PATCH',
      body,
    })
  } else {
    res = await fetch(`${API_URL}/api/citas/${codigo}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al modificar la cita')
  }
  return true
}

// ── Cancelar una cita ─────────────────────────────────────────────────────
export async function cancelarCita(codigo: string, autenticado: boolean): Promise<boolean> {
  let res: Response

  if (autenticado) {
    res = await apiFetch(`/api/citas/${codigo}/cancelar`, { method: 'PATCH' })
  } else {
    res = await fetch(`${API_URL}/api/citas/${codigo}/cancelar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al cancelar la cita')
  }
  return true
}

// ── Mis citas (usuario autenticado) ───────────────────────────────────────
export async function getMisCitas(): Promise<Cita[]> {
  const res = await apiFetch('/api/citas/mis-citas')
  if (!res.ok) throw new Error('Error al obtener las citas')
  return res.json()
}

// ── Todas las citas (solo admin) ──────────────────────────────────────────
export async function getAllCitas(): Promise<Cita[]> {
  const res = await apiFetch('/api/citas/all')
  if (!res.ok) throw new Error('Error al obtener todas las citas')
  return res.json()
}

// ── Helper de formato de fecha ────────────────────────────────────────────
export function formatearFecha(fecha: string): string {
  if (!fecha) return ''
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}
