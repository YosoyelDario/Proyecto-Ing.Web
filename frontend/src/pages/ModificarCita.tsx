import { useState, useMemo, useEffect } from 'react'
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
} from '@ionic/react'
import { arrowBack, mailOutline } from 'ionicons/icons'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import CalendarPicker from '../components/CalendarPicker'
import BotonPrimario  from '../components/BotonPrimario'
import { consultarCitaPorCodigo } from '../services/citaServices'
import { apiFetch } from '../services/AuthServices'
import '../styles/ModificarCita.css'

// Tipos 
interface CitaDetalle {
  especialidad: string
  medico:       string
  fecha:        string
  hora:         string
  rut:          string
  nombre:       string
  email:        string
}

// Data de horarios 
const HORARIOS_DISPONIBLES: Record<string, string[]> = {
  'm1_2026-05-10': ['09:00', '09:30', '11:00'],
  'm1_2026-05-11': ['14:00', '15:30'],
  'm3_2026-05-10': ['10:00', '10:30'],
  'm2_2026-06-15': ['10:00', '11:30', '15:00'],
  'm3_2026-06-10': ['09:00', '11:30', '14:30', '16:00'],
  'm3_2026-06-11': ['10:00', '15:00']
}

const MEDICOS = [
  { id: 'm1', nombre: 'Dr. Roberto Sánchez', especialidad: 'Medicina General' },
  { id: 'm2', nombre: 'Dra. Ana López',      especialidad: 'Medicina General' },
  { id: 'm3', nombre: 'Dr. Carlos Vega',     especialidad: 'Pediatría' },
  { id: 'm4', nombre: 'Dra. María Paz',      especialidad: 'Dermatología' },
]

type Paso = 'editar' | 'exito'

// Helpers 
const formatearFecha = (f: string) => {
  if (!f) return 'Sin fecha'
  const partes = f.split('T')[0].split('-')
  if (partes.length !== 3) return f
  const anio = parseInt(partes[0], 10)
  const mes  = parseInt(partes[1], 10) - 1
  const dia  = parseInt(partes[2], 10)
  return new Date(anio, mes, dia).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

const formatearHora12 = (hora: string) => {
  const [h, m] = hora.split(':')
  const hr = parseInt(h, 10)
  const ampm = hr >= 12 ? 'PM' : 'AM'
  const hr12 = hr % 12 || 12
  return `${hr12}:${m} ${ampm}`
}

// Componente principal
export default function ModificarCita() {
  const { codigo } = useParams<{ codigo: string }>()
  const navigate   = useNavigate()
  const location   = useLocation()

  const esAdmin     = new URLSearchParams(location.search).get('origen') === 'admin'
  const rutaVolver  = esAdmin ? '/admin/gestion' : '/consultar'
  const labelVolver = esAdmin ? 'Gestión' : 'Volver'

  const [paso,             setPaso]             = useState<Paso>('editar')
  const [citaOriginal,     setCitaOriginal]     = useState<CitaDetalle | null>(null)
  const [nuevaFecha,       setNuevaFecha]       = useState('')
  const [nuevaHora,        setNuevaHora]        = useState('')
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([])
  const [noEncontrada,     setNoEncontrada]     = useState(false)
  const [loading,          setLoading]          = useState(true)

  const minDate = useMemo(() => {
    const t  = new Date()
    const mm = String(t.getMonth() + 1).padStart(2, '0')
    const dd = String(t.getDate()).padStart(2, '0')
    return `${t.getFullYear()}-${mm}-${dd}`
  }, [])

  // Cargar datos iniciales desde la base de datos
  useEffect(() => {
    async function cargarCita() {
      if (!codigo) { setNoEncontrada(true); setLoading(false); return }
      
      try {
        setLoading(true)
        const resultado = await consultarCitaPorCodigo(codigo.toUpperCase())
        
        if (resultado) {
          // Adaptamos la respuesta de la API a la interfaz CitaDetalle del formulario
          const citaMapeada: CitaDetalle = {
            especialidad: resultado.especialidad,
            medico:       resultado.medico,
            fecha:        resultado.fecha.split('T')[0], // Limpiamos marcas ISO de Postgres
            hora:         resultado.hora.slice(0, 5),    // Tomamos HH:MM
            rut:          resultado.rut || '',
            nombre:       resultado.nombre || '',
            email:        resultado.email || ''
          }
          setCitaOriginal(citaMapeada)
          setNuevaFecha(citaMapeada.fecha)
          setNoEncontrada(false)
        } else {
          setNoEncontrada(true)
        }
      } catch (err) {
        console.error('Error cargando cita:', err)
        setNoEncontrada(true)
      } finally {
        setLoading(false)
      }
    }
    
    cargarCita()
  }, [codigo])

  // Buscar bloques horarios disponibles según el médico elegido
  useEffect(() => {
    if (!citaOriginal || !nuevaFecha) {
      setHorasDisponibles([])
      setNuevaHora('')
      return
    }
    const medico = MEDICOS.find(m => m.nombre === citaOriginal.medico)
    if (!medico) { setHorasDisponibles([]); setNuevaHora(''); return }

    const key   = `${medico.id}_${nuevaFecha}`
    const horas = HORARIOS_DISPONIBLES[key] || []
    setHorasDisponibles(horas)
    setNuevaHora(prev => horas.includes(prev) ? prev : '')
  }, [nuevaFecha, citaOriginal])

  // Guardar modificación (se envia la peticion al backend) 
  // Guardar modificación (se envia la peticion al backend) 
  const handleGuardar = async () => {
    if (!citaOriginal || !nuevaFecha || !nuevaHora || !codigo) return

    try {
      // 🚀 LLAMADA CORREGIDA AL PATCH DEL BACKEND
      const respuesta = await apiFetch(`/api/citas/${codigo.toUpperCase()}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fecha: nuevaFecha, // Sincronizado: el backend espera 'fecha'
          hora:  nuevaHora   // Sincronizado: el backend espera 'hora'
        })
      })

      // Si el servidor responde con un código de error (400, 404, 500, etc.)
      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => null)
        console.error('Detalle del error del servidor:', data) // Esto te dirá el error real en la consola F12
        alert(data?.error || data?.message || 'No se pudo reagendar la hora médica.')
        return
      }

      // Si todo salió bien (200 OK), avanzamos al paso de éxito
      setPaso('exito')
    } catch (err) {
      console.error('Error al guardar cambios de la cita:', err)
      alert('Error de conexión con el servidor. Reintente.')
    }
  }

  const puedeGuardar =
    nuevaFecha !== '' &&
    nuevaHora  !== '' &&
    (nuevaFecha !== citaOriginal?.fecha || nuevaHora !== citaOriginal?.hora)

  //Estado de Carga Inicial 
  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding bg-[#f4faf9] text-center flex items-center justify-center">
          <p className="mt-20 text-[#7a8a9a] font-medium">Cargando detalles de la cita...</p>
        </IonContent>
      </IonPage>
    )
  }
    
  //Pantalla: cita no encontrada 
  if (noEncontrada) {
    return (
      <IonPage className="mc-page">
        <IonHeader className="ion-no-border mc-header" translucent>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton className="mc-btn-volver" onClick={() => navigate(rutaVolver)}>
                <IonIcon slot="start" icon={arrowBack} />
                {labelVolver}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen style={{ '--background': '#f4faf9' } as React.CSSProperties}>
          <div className="min-h-screen flex flex-col items-center justify-center px-5 font-['DM_Sans',sans-serif]">
            <IonCard className="mc-card max-w-md w-full">
              <IonCardContent>
                <div className="p-8 text-center flex flex-col gap-4">
                  <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7a8a9a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <IonText>
                    <h1 className="text-[20px] font-semibold text-[#1a2332]">Cita no encontrada</h1>
                  </IonText>
                  <IonText color="medium">
                    <p className="text-[13px]">
                      No existe ninguna cita con el código{' '}
                      <span className="font-mono font-semibold text-[#1a2332]">#{codigo}</span>.
                    </p>
                  </IonText>
                  <BotonPrimario to={rutaVolver} fullWidth className="py-5! text-base! tracking-wider! mt-2 rounded-xl!">
                    {esAdmin ? 'Volver a gestión' : 'Consultar otra cita'}
                  </BotonPrimario>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  //Render principal 
  return (
    <IonPage className="mc-page">
      <IonHeader className="ion-no-border mc-header" translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="mc-btn-volver" onClick={() => navigate(rutaVolver)}>
              <IonIcon slot="start" icon={arrowBack} />
              {labelVolver}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f4faf9' } as React.CSSProperties}>
        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16 font-['DM_Sans',sans-serif]">
          <PageTransition variante="fadeUp" duracion={400} className="w-full max-w-md">

            {/* ══ PASO 1: Editar ═══════════════════════════════════════════ */}
            {paso === 'editar' && citaOriginal && (
              <div className="flex flex-col gap-4">

                {/* Tarjeta datos actuales */}
                <IonCard className="mc-card">
                  <IonCardContent>

                    {/* Header */}
                    <div className="bg-[#3aada0] px-6 py-4 flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <div>
                        <IonText color="light">
                          <p className="text-[15px] font-semibold m-0">Modificar cita</p>
                        </IonText>
                        <p className="text-white/70 text-[12px] font-mono m-0">#{codigo}</p>
                      </div>
                    </div>

                    {/* Datos que NO cambian */}
                    <div className="px-6 py-5 flex flex-col gap-4">
                      <span className="text-[11px] font-semibold text-[#a0adb8] uppercase tracking-wider">
                        Datos de la cita
                      </span>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">Especialidad</span>
                        <IonText>
                          <span className="text-[15px] font-medium text-[#1a2332]">{citaOriginal.especialidad}</span>
                        </IonText>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-[#3aada0] uppercase tracking-wider">Médico</span>
                        <IonText>
                          <span className="text-[15px] font-medium text-[#1a2332]">{citaOriginal.medico}</span>
                        </IonText>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">Nombre</span>
                        <IonText>
                          <span className="text-[15px] font-medium text-[#1a2332]">{citaOriginal.nombre}</span>
                        </IonText>
                      </div>
                    </div>

                    <div className="mx-6 border-t border-dashed border-[#d5dce6]" />

                    {/* Fecha y hora actuales */}
                    <div className="px-6 py-5 flex flex-col gap-3">
                      <span className="text-[11px] font-semibold text-[#a0adb8] uppercase tracking-wider">
                        Fecha y hora actuales
                      </span>
                      <IonGrid className="mc-grid">
                        <IonRow>
                          <IonCol>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-semibold text-[#3aada0] uppercase tracking-wider">Fecha</span>
                              <IonText>
                                <span className="text-[15px] font-medium text-[#1a2332] capitalize">{formatearFecha(citaOriginal.fecha)}</span>
                              </IonText>
                            </div>
                          </IonCol>
                          <IonCol>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-semibold text-[#3aada0] uppercase tracking-wider">Hora</span>
                              <IonText>
                                <span className="text-[15px] font-medium text-[#1a2332]">{formatearHora12(citaOriginal.hora)}</span>
                              </IonText>
                            </div>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </div>
                  </IonCardContent>
                </IonCard>

                {/* Tarjeta selección nueva fecha/hora */}
                <IonCard className="mc-card">
                  <IonCardContent>
                    <div className="p-6 flex flex-col gap-4">
                      <IonText>
                        <p className="text-[13px] font-semibold text-[#1a2332] m-0">
                          Selecciona nueva fecha y hora
                        </p>
                      </IonText>

                      <CalendarPicker
                        value={nuevaFecha}
                        minDate={minDate}
                        onChange={f => { setNuevaFecha(f); setNuevaHora('') }}
                      />

                      {nuevaFecha && (
                        <IonText color="medium">
                          <p className="text-[12px] pl-1 m-0">
                            Fecha seleccionada:{' '}
                            <span className="font-medium text-[#1a2332] capitalize">
                              {formatearFecha(nuevaFecha)}
                            </span>
                          </p>
                        </IonText>
                      )}

                      {/* Horarios */}
                      <div className={`flex flex-col gap-2 transition-opacity duration-300 ${nuevaFecha ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <p className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider m-0">
                          Horarios disponibles
                        </p>
                        {horasDisponibles.length > 0 ? (
                          <IonGrid className="mc-grid">
                            <IonRow>
                              {horasDisponibles.map(hora => (
                                <IonCol size="4" key={hora}>
                                  <BotonPrimario
                                    variante={nuevaHora === hora ? 'solido' : 'outline'}
                                    onClick={() => setNuevaHora(hora)}
                                    className="py-3! px-2! text-[14px]!"
                                  >
                                    {hora}
                                  </BotonPrimario>
                                </IonCol>
                              ))}
                            </IonRow>
                          </IonGrid>
                        ) : (
                          <div className="px-4 py-3.5 rounded-xl border border-dashed border-[#d5dce6] bg-[#f7f9fc] text-[14px] text-[#7a8a9a] text-center">
                            {nuevaFecha
                              ? 'No hay horarios disponibles para esta fecha.'
                              : 'Selecciona una fecha primero.'}
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-3 pt-2">
                        <BotonPrimario
                          onClick={handleGuardar}
                          disabled={!puedeGuardar}
                          fullWidth
                          className="py-5! text-base! tracking-wider! mt-2 rounded-xl!"
                        >
                          Guardar cambios
                        </BotonPrimario>
                        <BotonPrimario
                          onClick={() => navigate(rutaVolver)}
                          variante="outline"
                          fullWidth
                          className="py-5! text-base! tracking-wider! rounded-xl!"
                        >
                          Cancelar
                        </BotonPrimario>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </div>
            )}

            {/* ══ PASO 2: Éxito ═════════════════════════════════════════════ */}
            {paso === 'exito' && citaOriginal && (
              <IonCard className="mc-card">
                <IonCardContent>

                  {/* Banda de éxito */}
                  <div className="bg-[#3aada0] px-8 pt-10 pb-8 flex flex-col items-center text-center">
                    <div className="mc-success-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}
                        strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <IonText color="light">
                      <h1 className="text-[26px] font-bold tracking-tight mb-1">¡Cita Modificada!</h1>
                    </IonText>
                    <p className="text-[14px] text-white/70 font-light m-0">
                      Tu hora médica fue reestructurada exitosamente.
                    </p>
                  </div>

                  {/* Código */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#d5dce6]">
                    <span className="text-[12px] font-medium text-[#7aa9a5] uppercase tracking-wider">
                      N.º de cita
                    </span>
                    <span className="text-[15px] font-semibold text-[#3aada0] tracking-widest font-mono">
                      #{codigo}
                    </span>
                  </div>

                  {/* Datos */}
                  <div className="divide-y divide-[#eef4f9]">
                    {[
                      { label: 'Especialidad', value: citaOriginal.especialidad },
                      { label: 'Médico',       value: citaOriginal.medico },
                      { label: 'Fecha',        value: formatearFecha(nuevaFecha), capitalize: true },
                      { label: 'Hora',         value: formatearHora12(nuevaHora) },
                      { label: 'RUT',          value: citaOriginal.rut },
                      { label: 'Nombre',       value: citaOriginal.nombre },
                      { label: 'Correo',       value: citaOriginal.email },
                    ].map(({ label, value, capitalize }) => (
                      <div key={label} className="px-6 py-4 flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">{label}</span>
                        <IonText>
                          <span className={`text-[15px] font-medium text-[#1a2332] ${capitalize ? 'capitalize' : ''}`}>{value}</span>
                        </IonText>
                      </div>
                    ))}
                  </div>

                  {/* Nota de confirmación por correo */}
                  <div className="mx-6 mt-2 mb-4 px-4 py-3.5 rounded-xl bg-[#f0faf9] border border-[#b5ddd9] flex items-start gap-3">
                    <IonIcon icon={mailOutline} className="mt-0.5 shrink-0" style={{ fontSize: '18px', color: '#3aada0' }} />
                    <IonText>
                      <p className="text-[12px] text-[#5a9a95] leading-relaxed m-0">
                        Recibirás un correo de confirmación en{' '}
                        <span className="font-semibold text-[#3aada0]">{citaOriginal.email}</span>{' '}
                        con todos los detalles.
                      </p>
                    </IonText>
                  </div>

                  {/* Acciones */}
                  <div className="px-6 pb-7 pt-2 flex flex-col gap-3">
                    <BotonPrimario to={esAdmin ? '/admin/gestion' : '/'} fullWidth className="py-5! text-base! tracking-wider! rounded-xl!">
                      {esAdmin ? 'Volver a gestión' : 'Volver al inicio'}
                    </BotonPrimario>
                    <BotonPrimario
                      to={esAdmin ? '/admin' : '/agendar'}
                      variante="outline"
                      fullWidth
                      className="py-5! text-base! tracking-wider! rounded-xl!"
                    >
                      {esAdmin ? 'Panel administrativo' : 'Agendar otra cita'}
                    </BotonPrimario>
                  </div>
                </IonCardContent>
              </IonCard>
            )}

          </PageTransition>
        </div>
      </IonContent>
    </IonPage>
  )
}