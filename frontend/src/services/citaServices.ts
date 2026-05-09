export interface Cita {
  codigo: string;
  fecha: string;
  hora: string;
  medico: string;
  especialidad: string;
  rut: string;
  nombre: string;
  email: string;
}

const STORAGE_KEY = 'citas_agendadas';

export async function consultarCitaPorCodigo(codigo: string): Promise<Cita | null> {
  const citas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return citas[codigo.trim()] || null;
}

// Guarda los cambios en el navegador
export async function actualizarCita(codigo: string, nuevaFecha: string, nuevaHora: string): Promise<boolean> {
  try {
    const citas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (citas[codigo]) {
      // Mantenemos los datos del usuario (nombre, rut, etc) y solo cambiamos fecha/hora
      citas[codigo] = {
        ...citas[codigo],
        fecha: nuevaFecha,
        hora: nuevaHora
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error al actualizar:", error);
    return false;
  }
}

export function formatearFecha(fecha: string) {
  if (!fecha) return '';
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}