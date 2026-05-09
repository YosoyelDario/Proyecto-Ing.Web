import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useParams } from 'react-router-dom'
import BotonVolver    from '../components/BotonVolver'
import BotonPrimario  from '../components/BotonPrimario'
import PageTransition from '../components/PageTransition'
import FilaDetalle    from '../components/FilaDetalle'
import { formatearFecha, type Cita } from '../services/citaServices'

/* ── Pasos del flujo ─────────────────────────────────────────────────────── */
type Paso = 'verificar' | 'confirmar' | 'exito'

/* ── Componente principal ────────────────────────────────────────────────── */
export default function CancelarCita() {
  const { codigo } = useParams<{ codigo: string }>()

  const [paso,      setPaso]      = useState<Paso>('verificar')
  const [rut,       setRut]       = useState('')
  const [errorRut,  setErrorRut]  = useState(false)
  const [buscado,   setBuscado]   = useState(false)
  const [cita,      setCita]      = useState<Cita | null>(null)

  /* ── Verificar RUT ───────────────────────────────────────────────────── */
  const handleVerificar = () => {
    const citas = JSON.parse(localStorage.getItem('citas_agendadas') || '{}')
    const resultado = citas[codigo ?? '']
    setBuscado(true)

    if (resultado && resultado.rut === rut.trim()) {
      setCita(resultado)
      setErrorRut(false)
      setPaso('confirmar')
    } else {
      setErrorRut(true)
    }
  }

  /* ── Confirmar cancelación ───────────────────────────────────────────── */
  const handleCancelar = () => {
    const citas = JSON.parse(localStorage.getItem('citas_agendadas') || '{}')
    delete citas[codigo ?? '']
    localStorage.setItem('citas_agendadas', JSON.stringify(citas))
    setPaso('exito')
  }

  const inputClase = (conError: boolean) =>
    `w-full px-4 py-3.5 rounded-xl border bg-white text-[15px] outline-none transition-colors ${
      conError
        ? 'border-red-400 focus:border-red-400'
        : 'border-[#d5dce6] focus:border-[#3aada0]'
    }`

  /* ── Render ──────────────────────────────────────────────────────────── */
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[20px]">❌</span>
                    <h1 className="text-[22px] font-semibold text-[#1a2332] tracking-tight">
                      Cancelar Cita
                    </h1>
                  </div>
                  <p className="text-[13px] text-[#7a8a9a] font-light">
                    Ingresa tu RUT para verificar tu identidad antes de cancelar la cita{' '}
                    <span className="font-mono font-medium text-[#1a2332]">#{codigo}</span>.
                  </p>
                </div>

                {/* Código (solo lectura, referencia visual) */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#f7f9fc] border border-[#d5dce6]">
                  <span className="text-[13px] text-[#7a8a9a] font-medium">Código de cita</span>
                  <span className="font-mono text-[14px] font-semibold text-[#1a2332]">#{codigo}</span>
                </div>

                {/* RUT */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rut" className="text-[13px] font-medium text-[#e05c5c] uppercase tracking-wider">
                    RUT de verificación
                  </label>
                  <input
                    id="rut"
                    type="text"
                    value={rut}
                    onChange={e => { setRut(e.target.value); setBuscado(false) }}
                    placeholder="Ej: 12345678-9"
                    className={inputClase(buscado && errorRut)}
                    onKeyDown={e => e.key === 'Enter' && handleVerificar()}
                  />
                  {buscado && errorRut && (
                    <span className="text-[12px] text-red-500">
                      El RUT no coincide con el código ingresado.
                    </span>
                  )}
                </div>

                {/* Aviso */}
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                  <span className="text-[16px] mt-0.5">⚠️</span>
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
                    className="!bg-red-500 !border-red-500 hover:!bg-red-600 hover:!border-red-600"
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

                {/* Tarjeta con datos de la cita */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] overflow-hidden">
                  <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
                    <span className="text-white text-[18px]">⚠️</span>
                    <div>
                      <p className="text-white text-[15px] font-semibold">¿Confirmar cancelación?</p>
                      <p className="text-white/70 text-[12px] font-mono">#{codigo}</p>
                    </div>
                  </div>

                  <div className="px-6 pt-2 pb-1">
                    <p className="text-[11px] font-semibold text-[#a0adb8] uppercase tracking-wider pt-3 pb-1">
                      Se cancelará la siguiente cita
                    </p>
                    <FilaDetalle icono="🏥" label="Especialidad" valor={cita.especialidad} />
                    <FilaDetalle icono="👨‍⚕️" label="Médico"       valor={cita.medico} />
                    <FilaDetalle icono="📅" label="Fecha"         valor={formatearFecha(cita.fecha)} />
                    <FilaDetalle icono="🕐" label="Hora"          valor={cita.hora} />
                    <FilaDetalle icono="👤" label="Nombre"        valor={cita.nombre} />
                  </div>

                  {/* Aviso final */}
                  <div className="mx-6 mb-4 mt-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
                    <span className="text-[14px] mt-0.5">❌</span>
                    <p className="text-[12px] text-red-600 leading-relaxed">
                      Esta acción no se puede deshacer. ¿Estás seguro de que deseas cancelar tu cita?
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="px-6 pb-6 flex flex-col gap-3">
                    <BotonPrimario
                      onClick={handleCancelar}
                      fullWidth
                      className="!bg-red-500 !border-red-500 hover:!bg-red-600 hover:!border-red-600"
                    >
                      Sí, cancelar mi cita
                    </BotonPrimario>
                    <BotonPrimario
                      onClick={() => setPaso('verificar')}
                      variante="outline"
                      fullWidth
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}
                      strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
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
                  <span className="text-[16px] mt-0.5">📩</span>
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