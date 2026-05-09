import { useState, useMemo, useEffect } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useParams, useNavigate } from 'react-router-dom'
import BotonVolver    from '../components/BotonVolver'
import BotonPrimario  from '../components/BotonPrimario'
import PageTransition from '../components/PageTransition'
import CalendarPicker from '../components/CalendarPicker'
import FilaDetalle    from '../components/FilaDetalle'

/* ── Tipos ────────────────────────────────────────────────────────────────── */
interface CitaDetalle {
  especialidad: string
  medico:       string
  fecha:        string
  hora:         string
  rut:          string
  nombre:       string
  email:        string
}

/* ── Data de horarios ─────────────────────────────────────────────────────── */
const HORARIOS_DISPONIBLES: Record<string, string[]> = {
  'm1_2026-05-10': ['09:00', '09:30', '11:00'],
  'm1_2026-05-11': ['14:00', '15:30'],
  'm3_2026-05-10': ['10:00', '10:30'],
}

const MEDICOS = [
  { id: 'm1', nombre: 'Dr. Roberto Sánchez', especialidad: 'Medicina General' },
  { id: 'm2', nombre: 'Dra. Ana López',      especialidad: 'Medicina General' },
  { id: 'm3', nombre: 'Dr. Carlos Vega',     especialidad: 'Pediatría' },
  { id: 'm4', nombre: 'Dra. María Paz',      especialidad: 'Dermatología' },
]

type Paso = 'editar' | 'exito'

/* ── Componente principal ────────────────────────────────────────────────── */
export default function ModificarCita() {
  // ✅ FIX 1: lee el código desde la URL /modificar/:codigo
  const { codigo } = useParams<{ codigo: string }>()
  const navigate   = useNavigate()

  const [paso,             setPaso]             = useState<Paso>('editar')
  const [citaOriginal,     setCitaOriginal]     = useState<CitaDetalle | null>(null)
  const [nuevaFecha,       setNuevaFecha]       = useState('')
  const [nuevaHora,        setNuevaHora]        = useState('')
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([])
  const [noEncontrada,     setNoEncontrada]     = useState(false)

  const minDate = useMemo(() => {
    const t  = new Date()
    const mm = String(t.getMonth() + 1).padStart(2, '0')
    const dd = String(t.getDate()).padStart(2, '0')
    return `${t.getFullYear()}-${mm}-${dd}`
  }, [])

  // ✅ FIX 1: carga la cita del localStorage usando el código de la URL
  useEffect(() => {
    if (!codigo) { setNoEncontrada(true); return }
    const citas     = JSON.parse(localStorage.getItem('citas_agendadas') || '{}')
    const resultado = citas[codigo]
    if (resultado) {
      setCitaOriginal(resultado)
      setNuevaFecha(resultado.fecha)
    } else {
      setNoEncontrada(true)
    }
  }, [codigo])

  // Actualiza horarios disponibles cuando cambia la fecha
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

  /* ── Guardar modificación ──────────────────────────────────────────────── */
  const handleGuardar = () => {
    if (!citaOriginal || !nuevaFecha || !nuevaHora || !codigo) return

    const citas = JSON.parse(localStorage.getItem('citas_agendadas') || '{}')
    citas[codigo] = {
      ...citaOriginal,
      fecha: nuevaFecha,
      hora:  nuevaHora,
    }
    localStorage.setItem('citas_agendadas', JSON.stringify(citas))

    // ✅ FIX 2: éxito interno, sin redirigir a ConfirmacionCita
    // evita el fallback hardcodeado de Juan Pérez
    setPaso('exito')
  }

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  const formatearFecha = (f: string) =>
    new Date(f + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

  const puedeGuardar =
    nuevaFecha !== '' &&
    nuevaHora  !== '' &&
    (nuevaFecha !== citaOriginal?.fecha || nuevaHora !== citaOriginal?.hora)

  /* ── Pantalla: cita no encontrada ───────────────────────────────────────── */
  if (noEncontrada) {
    return (
      <IonPage>
        <IonContent fullscreen className="bg-[#f4faf9]">
          <div className="absolute top-4 left-4 z-10">
            <BotonVolver to="/consultar" label="Volver" />
          </div>
          <div className="min-h-screen flex flex-col items-center justify-center px-5 font-['DM_Sans',sans-serif]">
            <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] p-8 max-w-md w-full text-center flex flex-col gap-4">
              <span className="text-[48px]">🔍</span>
              <h1 className="text-[20px] font-semibold text-[#1a2332]">Cita no encontrada</h1>
              <p className="text-[13px] text-[#7a8a9a]">
                No existe ninguna cita con el código{' '}
                <span className="font-mono font-semibold text-[#1a2332]">#{codigo}</span>.
              </p>
              <BotonPrimario to="/consultar" fullWidth>
                Consultar otra cita
              </BotonPrimario>
            </div>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  /* ── Render principal ────────────────────────────────────────────────────── */
  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f4faf9]">

        <div className="absolute top-4 left-4 z-10 safe-area-top">
          <BotonVolver to="/consultar" label="Volver" />
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16 font-['DM_Sans',sans-serif]">
          <PageTransition variante="fadeUp" duracion={400} className="w-full max-w-md">

            {/* ══ PASO 1: Editar ═══════════════════════════════════════════ */}
            {paso === 'editar' && citaOriginal && (
              <div className="flex flex-col gap-4">

                {/* Tarjeta datos actuales */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] overflow-hidden">
                  <div className="bg-[#4aa8d8] px-6 py-4 flex items-center gap-3">
                    <span className="text-white text-[18px]">✏️</span>
                    <div>
                      <p className="text-white text-[15px] font-semibold">Modificar cita</p>
                      {/* ✅ muestra el código real leído de la URL */}
                      <p className="text-white/70 text-[12px] font-mono">#{codigo}</p>
                    </div>
                  </div>

                  {/* Datos que NO cambian */}
                  <div className="px-6 pt-2 pb-1">
                    <p className="text-[11px] font-semibold text-[#a0adb8] uppercase tracking-wider pt-3 pb-1">
                      Datos de la cita
                    </p>
                    <FilaDetalle icono="🏥" label="Especialidad" valor={citaOriginal.especialidad} />
                    <FilaDetalle icono="👨‍⚕️" label="Médico"       valor={citaOriginal.medico} />
                    <FilaDetalle icono="👤" label="Nombre"       valor={citaOriginal.nombre} />
                  </div>

                  <div className="mx-6 mb-4 mt-1 border-t border-dashed border-[#d5dce6]" />

                  {/* Fecha y hora actuales */}
                  <div className="px-6 pb-4">
                    <p className="text-[11px] font-semibold text-[#a0adb8] uppercase tracking-wider mb-1">
                      Fecha y hora actuales
                    </p>
                    <FilaDetalle icono="📅" label="Fecha" valor={formatearFecha(citaOriginal.fecha)} />
                    <FilaDetalle icono="🕐" label="Hora"  valor={citaOriginal.hora} />
                  </div>
                </div>

                {/* Tarjeta selección nueva fecha/hora */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] p-6 flex flex-col gap-4">
                  <p className="text-[13px] font-semibold text-[#1a2332]">
                    Selecciona nueva fecha y hora
                  </p>

                  <CalendarPicker
                    value={nuevaFecha}
                    minDate={minDate}
                    onChange={f => { setNuevaFecha(f); setNuevaHora('') }}
                  />

                  {nuevaFecha && (
                    <p className="text-[12px] text-[#7a8a9a] pl-1">
                      Fecha seleccionada:{' '}
                      <span className="font-medium text-[#1a2332]">
                        {formatearFecha(nuevaFecha)}
                      </span>
                    </p>
                  )}

                  {/* Horarios */}
                  <div className={`flex flex-col gap-2 transition-opacity duration-300 ${nuevaFecha ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <p className="text-[13px] font-medium text-[#4aa8d8] uppercase tracking-wider">
                      Horarios disponibles
                    </p>
                    {horasDisponibles.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {horasDisponibles.map(hora => (
                          <button
                            key={hora}
                            type="button"
                            onClick={() => setNuevaHora(hora)}
                            className={`py-3 rounded-xl border text-[14px] font-medium transition-colors ${
                              nuevaHora === hora
                                ? 'bg-[#4aa8d8] text-white border-[#4aa8d8]'
                                : 'bg-white text-[#1a2332] border-[#d5dce6] hover:border-[#4aa8d8]'
                            }`}
                          >
                            {hora}
                          </button>
                        ))}
                      </div>
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
                    >
                      Guardar cambios
                    </BotonPrimario>
                    <BotonPrimario
                      onClick={() => navigate('/consultar')}
                      variante="outline"
                      fullWidth
                    >
                      Cancelar
                    </BotonPrimario>
                  </div>
                </div>
              </div>
            )}

            {/* ══ PASO 2: Éxito interno ═════════════════════════════════════ */}
            {/* ✅ todos los datos vienen de citaOriginal + nuevaFecha/nuevaHora */}
            {paso === 'exito' && citaOriginal && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] overflow-hidden">

                {/* Banda de éxito */}
                <div className="bg-[#3aada0] px-8 py-8 flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4"
                    style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}
                      strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h1 className="text-[22px] font-semibold text-white tracking-tight mb-1">
                    ¡Cita modificada!
                  </h1>
                  <p className="text-[14px] text-white/70 font-light">
                    Tu hora médica fue actualizada exitosamente.
                  </p>
                </div>

                {/* Código */}
                <div className="flex items-center justify-between px-6 py-3.5 bg-[#f0faf9] border-b border-[#d5dce6]">
                  <span className="text-[12px] font-medium text-[#7aa9a5] uppercase tracking-wider">
                    N.º de cita
                  </span>
                  <span className="text-[15px] font-semibold text-[#3aada0] tracking-widest font-mono">
                    #{codigo}
                  </span>
                </div>

                {/* Datos reales */}
                <div className="px-6 pt-2 pb-1">
                  <FilaDetalle icono="🏥" label="Especialidad" valor={citaOriginal.especialidad} />
                  <FilaDetalle icono="👨‍⚕️" label="Médico"       valor={citaOriginal.medico} />
                  <FilaDetalle icono="📅" label="Nueva fecha"  valor={formatearFecha(nuevaFecha)} />
                  <FilaDetalle icono="🕐" label="Nueva hora"   valor={nuevaHora} />
                  <FilaDetalle icono="👤" label="Nombre"       valor={citaOriginal.nombre} />
                  <FilaDetalle icono="✉️" label="Correo"       valor={citaOriginal.email} />
                </div>

                {/* Acciones */}
                <div className="px-6 pb-7 pt-4 flex flex-col gap-3">
                  <BotonPrimario to="/" fullWidth>
                    Volver al inicio
                  </BotonPrimario>
                  <BotonPrimario
                    onClick={() => navigate('/consultar')}
                    variante="outline"
                    fullWidth
                  >
                    Ver mi cita
                  </BotonPrimario>
                </div>
              </div>
            )}

          </PageTransition>
        </div>

        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0); }
            to   { transform: scale(1); }
          }
        `}</style>

      </IonContent>
    </IonPage>
  )
}