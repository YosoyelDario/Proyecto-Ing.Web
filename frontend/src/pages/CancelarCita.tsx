import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useParams } from 'react-router-dom'
import BotonVolver    from '../components/BotonVolver'
import BotonPrimario  from '../components/BotonPrimario'
import PageTransition from '../components/PageTransition'
import FilaDetalle    from '../components/FilaDetalle'
import RutInput       from '../components/Rutinput'
import { formatearFecha, type Cita } from '../services/citaServices'
import { consultarCitaPorCodigo } from '../services/citaServices'
import { apiFetch } from '../services/AuthServices'

/* ── Iconos SVG inline ───────────────────────────────────────────────────── */
const IconoCancelar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e05c5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const IconoAlerta = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e05c5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const IconoCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}
    strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const IconoSobre = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5a9a95" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4L12 13 2 4" />
  </svg>
)

// Pasos del flujo 
type Paso = 'verificar' | 'confirmar' | 'exito'

//Componente principal 
export default function CancelarCita() {
  const { codigo } = useParams<{ codigo: string }>()

  const [paso,      setPaso]      = useState<Paso>('verificar')
  const [rut,       setRut]       = useState('')
  const [errorRut,  setErrorRut]  = useState(false)
  const [buscado,   setBuscado]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [cita,      setCita]      = useState<Cita | null>(null)

  // Limpiar formato de rut
  const limpiarRut = (s: string) => s.replace(/[.\-]/g, '').trim().toLowerCase()

  // Verificar cita y RUT
  const handleVerificar = async () => {
    if (!codigo || !rut.trim()) return
    setLoading(true)
    setErrorRut(false)
    setBuscado(false)

    try {
      // Consultar cita real a postgre mediante la api
      const resultado = await consultarCitaPorCodigo(codigo.toUpperCase())

      if (!resultado) {
        setErrorRut(true)
        setBuscado(true)
        return
      }

      // Comparamos los RUTs saneados (el unificado de la base de datos contra el input)
      const rutCitaBD = resultado.rut || ''
      if (limpiarRut(rutCitaBD) !== limpiarRut(rut)) {
        setErrorRut(true)
        setBuscado(true)
        return
      }

      // Si calzan, guardamos temporalmente el objeto en el estado y avanzamos
      setCita(resultado)
      setErrorRut(false)
      setBuscado(true)
      setPaso('confirmar')
    } catch (err) {
      console.error('Error al verificar identidad para cancelar:', err)
      alert('Error de comunicación con el servidor. Reintente.')
    } finally {
      setLoading(false)
    }
  }

  // Confirmar cancelación
  const handleCancelar = async () => {
    if (!codigo) return
    setLoading(true)

    try {
      // Apuntamos al endpoint PATCH de cancelacion
      const respuesta = await apiFetch(`/api/citas/${codigo.toUpperCase()}/cancelar`, {
        method: 'PATCH'
      })

      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => null)
        alert(data?.error || 'No se pudo cancelar la hora médica.')
        return
      }

      setPaso('exito')
    } catch (err) {
      console.error('Error al ejecutar cancelación:', err)
      alert('Error en el servidor al intentar procesar la cancelación.')
    } finally {
      setLoading(false)
    }
  }

  // Render 
  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f4faf9]">

        <div className="absolute top-4 left-4 z-10 safe-area-top">
          <BotonVolver to="/consultar" label="Volver" />
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16 font-['DM_Sans',sans-serif]">
          <PageTransition variante="fadeUp" duracion={400} className="w-full max-w-md">

            {/* ══ PASO 1: Verificar RUT ═════════════════════════════════ */}
            {paso === 'verificar' && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] p-6 flex flex-col gap-4">

                {/* Encabezado */}
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <IconoCancelar />
                    <h1 className="text-[22px] font-semibold text-[#3aada0]! tracking-tight">
                      Cancelar Cita
                    </h1>
                  </div>
                  <p className="text-[13px] text-[#7a8a9a] font-light">
                    Ingresa tu RUT para verificar tu identidad antes de cancelar la cita{' '}
                    <span className="font-mono font-medium text-[#1a2332]">#{codigo}</span>.
                  </p>
                </div>

                {/* Código (solo lectura) */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#f7f9fc] border border-[#d5dce6]">
                  <span className="text-[13px] text-[#7a8a9a] font-medium">Código de cita</span>
                  <span className="font-mono text-[14px] font-semibold text-[#1a2332]">#{codigo}</span>
                </div>

                {/* RUT — componente reutilizable */}
                <RutInput
                  id="rut-cancelar"
                  label="RUT de verificación"
                  value={rut}
                  onChange={(valor) => { setRut(valor); setBuscado(false) }}
                  required
                />
                {buscado && errorRut && (
                  <p className="text-[12px] text-[#e05c5c] -mt-2">
                    El RUT no coincide con el código ingresado.
                  </p>
                )}

                {/* Aviso */}
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                  <span className="mt-0.5 shrink-0"><IconoAlerta /></span>
                  <p className="text-[12px] text-red-600 leading-relaxed">
                    Esta acción es irreversible. Una vez cancelada, deberás agendar una nueva cita.
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-3 pt-1">
                  <BotonPrimario
                    onClick={handleVerificar}
                    disabled={rut.trim() === ''}
                    fullWidth
                    className="py-5! text-base! tracking-wider! mt-2 rounded-xl bg-red-500! border-red-500! hover:bg-red-600! hover:border-red-600!"
                  >
                    Verificar y continuar
                  </BotonPrimario>
                  <BotonPrimario
                    to="/consultar"
                    variante="outline"
                    fullWidth
                  >
                    Volver sin cancelar
                  </BotonPrimario>
                </div>
              </div>
            )}

            {/* ══ PASO 2: Confirmar cancelación ════════════════════════ */}
            {paso === 'confirmar' && cita && (
              <div className="flex flex-col gap-4">

                <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] overflow-hidden">
                  {/* Banda superior */}
                  <div className="bg-[#e05c5c] px-6 py-4 flex items-center gap-3">
                    <IconoAlerta />
                    <div>
                      <p className="text-white text-[15px] font-semibold">¿Confirmar cancelación?</p>
                      <p className="text-white/70 text-[12px] font-mono">#{codigo}</p>
                    </div>
                  </div>

                  <div className="px-6 pt-2 pb-1">
                    <p className="text-[11px] font-semibold text-[#a0adb8] uppercase tracking-wider pt-3 pb-1">
                      Se cancelará la siguiente cita
                    </p>
                    <FilaDetalle icono="" label="Especialidad" valor={cita.especialidad ?? ''} />
                    <FilaDetalle icono="" label="Médico" valor={cita.medico ?? ''} />
                    <FilaDetalle icono="" label="Fecha" valor={cita.fecha ? formatearFecha(cita.fecha.split('T')[0]) : ''} />
                    <FilaDetalle icono="" label="Hora" valor={cita.hora ?? ''} />
                    <FilaDetalle icono="" label="Nombre" valor={cita.nombre ?? ''} />
                  </div>

                  {/* Aviso final */}
                  <div className="mx-6 mb-4 mt-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0"><IconoCancelar /></span>
                    <p className="text-[12px] text-red-600 leading-relaxed">
                      Esta acción no se puede deshacer. ¿Estás seguro de que deseas cancelar tu cita?
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="px-6 pb-6 flex flex-col gap-3">
                    <BotonPrimario
                      onClick={handleCancelar}
                      fullWidth
                      className="bg-[#e05c5c]! border-[#e05c5c]! hover:bg-[#c94a4a]! hover:border-[#c94a4a]! py-5! text-base! tracking-wider! mt-2 rounded-xl"
                    >
                      Sí, cancelar mi cita
                    </BotonPrimario>
                    <BotonPrimario
                      onClick={() => setPaso('verificar')}
                      variante="outline"
                      fullWidth
                      className="py-5! text-base! tracking-wider! mt-2"
                    >
                      No, mantener mi cita
                    </BotonPrimario>
                  </div>
                </div>
              </div>
            )}

            {/* ══ PASO 3: Éxito ════════════════════════════════════════ */}
            {paso === 'exito' && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] overflow-hidden">

                {/* Banda de éxito */}
                <div className="bg-[#3aada0] px-8 py-8 flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4"
                    style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
                  >
                    <IconoCheck />
                  </div>
                  <h1 className="text-[22px] font-semibold text-white tracking-tight mb-1">
                    Cita cancelada
                  </h1>
                  <p className="text-[14px] text-white/70 font-light">
                    Tu cita <span className="font-mono font-semibold">#{codigo}</span> fue cancelada exitosamente.
                  </p>
                </div>

                {/* Mensaje informativo */}
                <div className="mx-6 mt-6 mb-4 px-4 py-3.5 rounded-xl bg-[#f0faf9] border border-[#b5ddd9] flex items-start gap-3">
                  <span className="mt-0.5 shrink-0"><IconoSobre /></span>
                  <p className="text-[12px] text-[#5a9a95] leading-relaxed">
                    Si proporcionaste un correo electrónico, recibirás una confirmación de cancelación.
                  </p>
                </div>

                {/* Acciones */}
                <div className="px-6 pb-7 pt-2 flex flex-col gap-3">
                  <BotonPrimario to="/" fullWidth>
                    Volver al inicio
                  </BotonPrimario>
                  <BotonPrimario to="/agendar" variante="outline" fullWidth>
                    Agendar una nueva cita
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