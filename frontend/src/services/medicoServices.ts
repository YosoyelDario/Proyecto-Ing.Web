import { apiClient } from './AuthServices';

export interface HorarioAgenda {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
}

export interface ExcepcionAgenda {
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  tipo: 'Licencia' | 'Feriado';
  motivo?: string;
}

export const crearMedico = async (medico: { rut: string; nombre: string; id_especialidad: number }) => {
  const response = await apiClient.post('/api/profesionales', medico);
  return response.data;
};

export const actualizarMedico = async (id: number, data: { nombre: string; id_especialidad: number }) => {
  const response = await apiClient.patch(`/api/profesionales/${id}`, data);
  return response.data;
};

export const eliminarMedico = async (id: number) => {
  const response = await apiClient.delete(`/api/profesionales/${id}`);
  return response.data;
};

export const obtenerAgenda = async (idMedico: number) => {
  const response = await apiClient.get(`/api/profesionales/${idMedico}/agenda`);
  return response.data;
};

export const guardarAgendaSemanal = async (idMedico: number, horarios: HorarioAgenda[]) => {
  const response = await apiClient.post(`/api/profesionales/${idMedico}/agenda`, { horarios });
  return response.data;
};

export const obtenerExcepciones = async (idMedico: number) => {
  const response = await apiClient.get(`/api/profesionales/${idMedico}/excepciones`);
  return response.data;
};

export const agregarExcepcion = async (idMedico: number, excepcion: ExcepcionAgenda) => {
  const response = await apiClient.post(`/api/profesionales/${idMedico}/excepciones`, excepcion);
  return response.data;
};

export const eliminarExcepcion = async (idExcepcion: number) => {
  const response = await apiClient.delete(`/api/profesionales/excepciones/${idExcepcion}`);
  return response.data;
};