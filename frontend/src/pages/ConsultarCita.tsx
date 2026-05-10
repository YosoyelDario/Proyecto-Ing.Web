import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import BotonPrimario  from '../components/BotonPrimario'
import BotonVolver    from '../components/BotonVolver'
import PageTransition from '../components/PageTransition'
import RutInput       from '../components/Rutinput'

interface CitaDetalle {
  especialidad: string
  medico:       string
  fecha:        string
  hora:         string
  rut:          string
  nombre:       string
  email:        string
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

    // Comparar limpiando puntos del RUT formateado
    if (resultado && resultado.rut === rut.replace(/\./g, '').trim()) {
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

  const horaFormateada = cita
    ? (() => {
        const [h, m] = cita.hora.split(':')
        const hr = parseInt(h, 10)
        const ampm = hr >= 12 ? 'PM' : 'AM'
        const hr12 = hr % 12 || 12
        return `${hr12}:${m} ${ampm}`
      })()
    : ''

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
                  <h1 className="text-[22px] font-semibold text-[#3aada0]! tracking-tight mb-1">
                    Consultar Cita
                  </h1>
                  <p className="text-[13px] text-[#7a8a9a] font-light">
                    Ingresa tu código de confirmación y RUT para ver los detalles de tu cita.
                  </p>
                </div>

                {/* Código */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="codigo" className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                    Código de Cita
                  </label>
                  <input
                    id="codigo"
                    type="text"
                    value={codigo}
                    onChange={e => { setCodigo(e.target.value); setBuscado(false) }}
                    placeholder="Ej: 847293"
                    maxLength={6}
                    className={`
                      w-full px-4 py-3 rounded-xl border bg-white text-[15px] outline-none
                      font-mono transition-colors duration-200
                      focus:ring-2 focus:ring-[#3aada0]/20 focus:border-[#3aada0]
                      ${buscado && error
                        ? 'border-[#e05c5c] focus:border-[#e05c5c]'
                        : 'border-[#d5dce6]'
                      }
                    `}
                  />
                </div>

                {/* RUT — componente reutilizable */}
                <RutInput
                  id="rut-consultar"
                  label="RUT de verificación"
                  value={rut}
                  onChange={(valor) => { setRut(valor); setBuscado(false) }}
                  required
                />

                {buscado && error && (
                  <p className="text-[12px] text-[#e05c5c] -mt-1">
                    No se encontró ninguna cita con ese código y RUT.
                  </p>
                )}

                <BotonPrimario
                  onClick={handleBuscar}
                  disabled={codigo.trim().length !== 6 || rut.trim() === ''}
                  fullWidth
                  className="py-5! text-base! tracking-wider! mt-2 rounded-xl!"
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                        <path d="M9 14l2 2 4-4" />
                      </svg>
                      <div>
                        <p className="text-white text-[15px] font-semibold">Cita encontrada</p>
                        <p className="text-white/70 text-[12px] font-mono">#{codigo}</p>
                      </div>
                    </div>

                    {/* Detalles de la cita */}
                    <div className="px-6 py-5 flex flex-col gap-4">

                      {/* Especialidad */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">Especialidad</span>
                        <span className="text-[15px] font-medium text-[#1a2332]">{cita.especialidad}</span>
                      </div>

                      {/* Médico */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">Médico</span>
                        <span className="text-[15px] font-medium text-[#1a2332]">{cita.medico}</span>
                      </div>

                      {/* Fecha y Hora — lado a lado */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">Fecha</span>
                          <span className="text-[15px] font-medium text-[#1a2332] capitalize">{fechaFormateada}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">Hora</span>
                          <span className="text-[15px] font-medium text-[#1a2332]">{horaFormateada}</span>
                        </div>
                      </div>

                      {/* RUT */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">RUT</span>
                        <span className="text-[15px] font-medium text-[#1a2332]">{cita.rut}</span>
                      </div>

                      {/* Nombre */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">Nombre</span>
                        <span className="text-[15px] font-medium text-[#1a2332]">{cita.nombre}</span>
                      </div>

                    </div>

                    {/* Acciones */}
                    <div className="px-6 pb-6 pt-3 flex flex-col gap-3">
                      <BotonPrimario to={`/modificar/${codigo}`} variante="solido" fullWidth>
                        Modificar mi cita
                      </BotonPrimario>

                      <div className="grid grid-cols-2 gap-3">
                        <BotonPrimario
                          to={`/cancelar/${codigo}`}
                          variante="outline"
                          fullWidth
                          className="!border-[#e05c5c]/30 !text-[#e05c5c] hover:!bg-red-50"
                        >
                          Cancelar
                        </BotonPrimario>
                        <BotonPrimario to="/agendar" variante="outline" fullWidth>
                          Otra cita
                        </BotonPrimario>
                      </div>
                    </div>

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