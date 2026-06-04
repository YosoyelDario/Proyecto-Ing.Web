import { apiClient } from './AuthServices'
import axios from 'axios'

// ── Tipos ─────────────────────────────────────────────────────────────────

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
  id_medico: number
  medico: string
  especialidad: string
  id_paciente?: number | null
  rut?: string
  nombre?: string
  email?: string
}

export interface NuevaCita {
  id_medico: number
  fecha: string
  hora: string
  rut?: string
  nombre?: string
  email?: string
}

// ── Rutas públicas ────────────────────────────────────────────────────────

// GET /api/especialidades
export async function getEspecialidades(): Promise<Especialidad[]> {
  const { data } = await apiClient.get('/api/especialidades')
  return data
}

// GET /api/especialidades/:id/medicos
export async function getMedicosPorEspecialidad(idEspecialidad: number): Promise<Medico[]> {
  const { data } = await apiClient.get(`/api/especialidades/${idEspecialidad}/medicos`)
  return data
}

// GET /api/citas/disponibilidad?id_medico=&fecha=
export async function getHorariosDisponibles(idMedico: number, fecha: string): Promise<string[]> {
  const { data } = await apiClient.get('/api/citas/disponibilidad', {
    params: { id_medico: idMedico, fecha },
  })
  return data.horarios
}

// GET /api/citas/:codigo
export async function consultarCitaPorCodigo(codigo: string): Promise<Cita | null> {
  try {
    const { data } = await apiClient.get(`/api/citas/${codigo.trim().toUpperCase()}`)
    return data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

// ── Rutas con token opcional ──────────────────────────────────────────────
// El parámetro _autenticado se mantiene solo para compatibilidad con Agendar.tsx.
// apiClient adjunta el JWT automáticamente si existe, sin necesidad de bifurcar.

// POST /api/citas
export async function crearCita(
  datos: NuevaCita,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _autenticado?: boolean
): Promise<{ codigo_referencia: string }> {
  const { data } = await apiClient.post('/api/citas', datos)
  return data
}

// PATCH /api/citas/:codigo
export async function modificarCita(
  codigo: string,
  nuevaFecha: string,
  nuevaHora: string,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _autenticado?: boolean
): Promise<boolean> {
  await apiClient.patch(`/api/citas/${codigo}`, { fecha: nuevaFecha, hora: nuevaHora })
  return true
}

// PATCH /api/citas/:codigo/cancelar
export async function cancelarCita(
  codigo: string,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _autenticado?: boolean
): Promise<boolean> {
  await apiClient.patch(`/api/citas/${codigo}/cancelar`)
  return true
}

// ── Rutas protegidas ─────────────────────────────────────────────────────

// GET /api/citas/mis-citas  (usuario autenticado)
export async function getMisCitas(): Promise<Cita[]> {
  const { data } = await apiClient.get('/api/citas/mis-citas')
  return data
}

// GET /api/citas/all  (solo admin)
export async function getAllCitas(): Promise<Cita[]> {
  const { data } = await apiClient.get('/api/citas/all')
  return data
}

// DELETE /api/citas/:codigo  (solo admin)
export async function eliminarCita(codigo: string): Promise<boolean> {
  await apiClient.delete(`/api/citas/${codigo}`)
  return true
}

// ── Utilidades ────────────────────────────────────────────────────────────

export function formatearFecha(fecha: string): string {
  if (!fecha) return ''
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}