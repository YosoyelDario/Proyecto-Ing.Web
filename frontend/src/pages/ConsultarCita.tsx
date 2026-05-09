import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import BotonPrimario from '../components/BotonPrimario'
import BotonVolver from '../components/BotonVolver'
import PageTransition from '../components/PageTransition'

interface CitaDetalle {
  especialidad: string
  medico:       string
  fecha:        string
  hora:         string
  rut:          string
  nombre:       string
  email:        string
}

function FilaDetalle({ icono, label, valor }: { icono: string; label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#eef4f9] last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-[18px] leading-none w-7 text-center">{icono}</span>
        <span className="text-[13px] font-medium text-[#7a8a9a] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-[14px] font-medium text-[#1a2332] text-right max-w-[55%] leading-snug">{valor}</span>
    </div>
  )
}

export default function ConsultarCita() {
  const [rut, setRut]         = useState('')
  const [codigo, setCodigo]   = useState('')
  const [cita, setCita]       = useState<CitaDetalle | null>(null)
  const [error, setError]     = useState(false)
  const [buscado, setBuscado] = useState(false)

  const handleBuscar = () => {
    const citas = JSON.parse(localStorage.getItem('citas_agendadas') || '{}')
    const resultado = citas[codigo.trim()]
    setBuscado(true)

    if (resultado && resultado.rut === rut.trim()) {
      setCita(resultado)
      setError(false)
    } else {
      setCita(null)
      setError(true)
    }
  }

  const fechaFormateada = cita
    ? new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  const detalles = cita ? [
    { icono: '🏥', label: 'Especialidad', valor: cita.especialidad },
    { icono: '👨‍⚕️', label: 'Médico',       valor: cita.medico },
    { icono: '📅', label: 'Fecha',         valor: fechaFormateada },
    { icono: '🕐', label: 'Hora',          valor: cita.hora },
    { icono: '🪪', label: 'RUT',           valor: cita.rut },
    { icono: '👤', label: 'Nombre',        valor: cita.nombre },
    { icono: '✉️', label: 'Correo',        valor: cita.email },
  ] : []

  const inputError = `w-full px-4 py-3.5 rounded-xl border bg-white text-[15px] outline-none transition-colors ${
    buscado && error
      ? 'border-red-400 focus:border-red-400'
      : 'border-[#d5dce6] focus:border-[#3aada0]'
  }`

  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f4faf9]">

        <div className="absolute top-4 left-4 z-10">
          <BotonVolver to="/" label="Inicio" />
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16 font-['DM_Sans',sans-serif]">
          <PageTransition variante="fadeUp" duracion={400}>
            <div className="w-full max-w-md flex flex-col gap-4">

              {/* Buscador */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] p-6 flex flex-col gap-4">
                <div>
                  <h1 className="text-[22px] font-semibold text-[#1a2332] tracking-tight mb-1">
                    Consultar Cita
                  </h1>
                  <p className="text-[13px] text-[#7a8a9a] font-light">
                    Ingresa tu código de confirmación y RUT para ver los detalles de tu cita.
                  </p>
                </div>

                {/* Código */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="codigo" className="text-[13px] font-medium text-[#4aa8d8] uppercase tracking-wider">
                    Código de Cita
                  </label>
                  <input
                    id="codigo"
                    type="text"
                    value={codigo}
                    onChange={e => { setCodigo(e.target.value); setBuscado(false) }}
                    placeholder="Ej: 847293"
                    maxLength={6}
                    className={`${inputError} font-mono`}
                  />
                </div>

                {/* RUT */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rut" className="text-[13px] font-medium text-[#4aa8d8] uppercase tracking-wider">
                    RUT
                  </label>
                  <input
                    id="rut"
                    type="text"
                    value={rut}
                    onChange={e => { setRut(e.target.value); setBuscado(false) }}
                    placeholder="Ej: 12345678-9"
                    className={inputError}
                  />
                </div>

                {buscado && error && (
                  <span className="text-[12px] text-red-500">
                    No se encontró ninguna cita con ese código y RUT.
                  </span>
                )}

                <BotonPrimario
                  onClick={handleBuscar}
                  disabled={codigo.trim().length !== 6 || rut.trim() === ''}
                  fullWidth
                  className="py-4! [clip-path:inset(0_round_20px)]"
                  
                >
                  Buscar cita
                </BotonPrimario>
              </div>

              {/* Resultado */}
              {cita && (
                <PageTransition variante="fadeUp" duracion={300} delay={100}>
                  <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] overflow-hidden">
                    
                    {/* Cabecera del resultado */}
                    <div className="bg-[#3aada0] px-6 py-4 flex items-center gap-3">
                      <span className="text-white text-[18px]">📋</span>
                      <div>
                        <p className="text-white text-[15px] font-semibold">Cita encontrada</p>
                        <p className="text-white/70 text-[12px] font-mono">#{codigo}</p>
                      </div>
                    </div>

                    {/* Detalles de la cita */}
                    <div className="px-6 pt-2 pb-1">
                      {detalles.map(d => <FilaDetalle key={d.label} {...d} />)}
                    </div>

                    {/* ─── BLOQUE DE ACCIONES (MODIFICAR Y CANCELAR) ─── */}
                    <div className="px-6 pb-6 pt-3 flex flex-col gap-3">
                      
                      {/* BOTÓN MODIFICAR (RF3) */}
                      {/* Este botón envía al usuario a la nueva página pasando el código */}
                      <BotonPrimario to={`/modificar/${codigo}`} variante="solido" fullWidth>
                        📝 Modificar mi cita
                      </BotonPrimario>

                      <div className="grid grid-cols-2 gap-3">
                        {/* BOTÓN CANCELAR (RF4) */}
                        <BotonPrimario to={`/cancelar/${codigo}`} variante="outline" fullWidth className="!border-red-200 !text-red-500 hover:!bg-red-50">
                          ❌ Cancelar
                        </BotonPrimario>

                        {/* BOTÓN AGENDAR OTRA */}
                        <BotonPrimario to="/agendar" variante="outline" fullWidth>
                          🔄 Otra cita
                        </BotonPrimario>
                      </div>
                      
                    </div>
                    {/* ─────────────────────────────────────────────── */}

                  </div>
                </PageTransition>
              )}

            </div>
          </PageTransition>
        </div>

      </IonContent>
    </IonPage>
  )
}