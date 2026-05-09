import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  IonSpinner, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonText 
} from '@ionic/react'

import { AuthLayout } from '../components/AuthLayout'
import PageTransition from '../components/PageTransition'
import FilaDetalle from '../components/FilaDetalle'
import CalendarPicker from '../components/CalendarPicker'
import BotonPrimario from '../components/BotonPrimario'
import BotonVolver from '../components/BotonVolver'

import { actualizarCita, consultarCitaPorCodigo, formatearFecha, type Cita } from '../services/citaServices'

const HORAS_DISPONIBLES = ['09:00', '10:00', '11:30', '15:00', '16:30']

export default function ModificarCita() {
  const { codigo } = useParams<{ codigo: string }>()
  const navigate = useNavigate()

  const [cita, setCita] = useState<Cita | null>(null)
  const [cargando, setCargando] = useState(true)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')

  // Efecto para cargar la cita al entrar a la página
  useEffect(() => {
    async function obtenerDatos() {
      if (codigo) {
        const datos = await consultarCitaPorCodigo(codigo)
        if (datos) {
          setCita(datos)
          setNuevaFecha(datos.fecha)
          setNuevaHora(datos.hora)
        }
      }
      setCargando(false)
    }
    obtenerDatos()
  }, [codigo])

  const finalizarModificacion = async () => {
    if (codigo) {
      // Llamamos al servicio para guardar los cambios en el localStorage
      const exito = await actualizarCita(codigo, nuevaFecha, nuevaHora);
      
      if (exito) {
        // Solo si se guardó correctamente, redirigimos a la pantalla de éxito
        navigate(`/confirmacion?accion=modificada&codigo=${codigo}`);
      } else {
        console.error("No se pudo actualizar la cita");
      }
    }
  }

  // Estado de carga responsivo
  if (cargando) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <IonSpinner name="crescent" color="primary" />
          <p className="mt-4 text-[#7aa9a5] font-medium animate-pulse">Obteniendo información...</p>
        </div>
      </AuthLayout>
    )
  }

  // Si no hay cita (error de código)
  if (!cita) {
    return (
      <AuthLayout>
        <div className="text-center">
          <IonText color="danger">
            <h2 className="text-lg font-bold mb-2">Error de acceso</h2>
            <p className="text-[14px] mb-6">No pudimos encontrar una cita válida con el código <b>{codigo}</b>.</p>
          </IonText>
          <BotonPrimario to="/consultar" variante="outline" fullWidth>
            Intentar con otro código
          </BotonPrimario>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <PageTransition>
        {/* Encabezado de la sección */}
        <header className="mb-8">
          <BotonVolver />
          <h1 className="text-[26px] font-bold text-[#002463] mt-4 leading-tight">
            Modificar tu Cita
          </h1>
          <p className="text-[#7aa9a5] text-[15px] mt-1">
            Actualiza los detalles de tu atención en la Municipalidad.
          </p>
        </header>

        <IonGrid className="ion-no-padding">
          <IonRow>
            {/* Resumen de cita actual - Estilo "Card" */}
            <IonCol size="12" className="mb-8">
              <div className="bg-[#f8fcfb] p-6 rounded-2xl border border-[#d1e8e5]">
                <span className="inline-block px-3 py-1 bg-[#3aada0]/10 text-[#3aada0] text-[11px] font-bold uppercase tracking-widest rounded-full mb-4">
                  Estado Actual
                </span>
                <FilaDetalle icono="🆔" label="Referencia" valor={cita.codigo} />
                <FilaDetalle icono="👨‍⚕️" label="Médico Asignado" valor={cita.medico} />
                <FilaDetalle icono="📅" label="Fecha original" valor={formatearFecha(cita.fecha)} />
                <FilaDetalle icono="⏰" label="Hora actual" valor={`${cita.hora} hrs`} />
              </div>
            </IonCol>

            {/* Selector de Nueva Fecha */}
            <IonCol size="12" className="mb-6">
              <label className="block text-[14px] font-bold text-[#14302d] mb-4">
                1. Selecciona el nuevo día
              </label>
              <CalendarPicker 
                value={nuevaFecha} 
                minDate={new Date().toISOString().split('T')[0]} 
                onChange={setNuevaFecha} 
              />
            </IonCol>

            {/* Selector de Nueva Hora */}
            <IonCol size="12" className="mb-10">
              <label className="block text-[14px] font-bold text-[#14302d] mb-4">
                2. Selecciona el nuevo horario
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HORAS_DISPONIBLES.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setNuevaHora(h)}
                    className={`py-4 rounded-xl border text-[14px] font-semibold transition-all
                      ${nuevaHora === h 
                        ? 'bg-[#3aada0] border-[#3aada0] text-white shadow-lg shadow-[#3aada0]/20' 
                        : 'bg-white border-[#c8e4e1] text-[#14302d] hover:border-[#3aada0]'}
                    `}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </IonCol>

            {/* Acción Final */}
            <IonCol size="12">
              <BotonPrimario 
                fullWidth 
                onClick={finalizarModificacion}
                disabled={nuevaFecha === cita.fecha && nuevaHora === cita.hora}
              >
                Confirmar y Guardar
              </BotonPrimario>
              <p className="text-center text-[12px] text-[#7aa9a5] mt-4">
                Al confirmar, se liberará tu horario anterior automáticamente.
              </p>
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageTransition>
    </AuthLayout>
  )
}