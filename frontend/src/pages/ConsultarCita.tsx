import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import BotonPrimario    from '../components/BotonPrimario'
import BotonVolver      from '../components/BotonVolver'
import PageTransition   from '../components/PageTransition'
import { consultarCitaPorCodigo, type Cita } from '../services/citaServices'

export default function ConsultarCita() {
  const [codigo,  setCodigo]  = useState('')
  const [rut,     setRut]     = useState('')
  const [cita,    setCita]    = useState<Cita | null>(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleBuscar = async () => {
    if (!codigo.trim() || !rut.trim()) return
    setLoading(true)
    setError('')
    setCita(null)

    try {
      const resultado = await consultarCitaPorCodigo(codigo.trim().toUpperCase())

      if (!resultado) {
        setError('No se encontró ninguna cita con ese código.')
        return
      }

      // Verificar RUT (comparar sin puntos ni guión para mayor tolerancia)
      const rutLimpio = (s: string) => s.replace(/[.\-]/g, '').trim().toLowerCase()
      const rutCita = resultado.rut_paciente || resultado.rut || ''
      
      if (rutLimpio(rutCita) !== rutLimpio(rut)) {
        setError('El RUT ingresado no coincide con el registrado para esta cita.')
        return
      }

      setCita(resultado)
    } catch {
      setError('Error al consultar la cita. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const fechaFormateada = cita?.fecha
    ? new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  const horaFormateada = cita?.hora
    ? (() => {
        const [h, m] = cita.hora.split(':')
        const hr = parseInt(h, 10)
        return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
      })()
    : ''

  const ESTADO_COLORS: Record<string, string> = {
    Agendada:   'bg-[#e1f5ee] text-[#085041]',
    Completada: 'bg-[#e6f1fb] text-[#0c447c]',
    Cancelada:  'bg-[#fde8e8] text-[#a32d2d]',
    NoAsiste:   'bg-[#faeeda] text-[#633806]',
  }

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
                  <h1 className="text-[22px] font-semibold text-[#3aada0]! tracking-tight mb-1">Consultar Cita</h1>
                  <p className="text-[13px] text-[#7a8a9a] font-light">
                    Ingresa tu código de cita y RUT para ver los detalles.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="codigo" className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                    Código de Cita
                  </label>
                  <input
                    id="codigo" type="text" value={codigo}
                    onChange={e => { setCodigo(e.target.value.toUpperCase()); setError('') }}
                    placeholder="Ej: A3BX7YZQ"
                    className="w-full px-4 py-3 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none font-mono focus:ring-2 focus:ring-[#3aada0]/20 focus:border-[#3aada0]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rut" className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                    RUT de verificación
                  </label>
                  <input
                    id="rut" type="text" value={rut}
                    onChange={e => { setRut(e.target.value); setError('') }}
                    placeholder="Ej: 12345678-9"
                    className="w-full px-4 py-3 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:ring-2 focus:ring-[#3aada0]/20 focus:border-[#3aada0]"
                  />
                </div>

                {error && (
                  <p className="text-[12px] text-[#e05c5c]">{error}</p>
                )}

                <BotonPrimario
                  onClick={handleBuscar}
                  disabled={!codigo.trim() || !rut.trim() || loading}
                  fullWidth
                  className="py-5! text-base! tracking-wider! mt-2 rounded-xl!"
                >
                  {loading ? 'Buscando...' : 'Buscar cita'}
                </BotonPrimario>
              </div>

              {/* Resultado */}
              {cita && (
                <PageTransition variante="fadeUp" duracion={300} delay={100}>
                  <div className="bg-white rounded-2xl shadow-sm border border-[#d5dce6] overflow-hidden">
                    <div className="bg-[#3aada0] px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                          <rect x="9" y="3" width="6" height="4" rx="1" />
                          <path d="M9 14l2 2 4-4" />
                        </svg>
                        <div>
                          <p className="text-white text-[15px] font-semibold">Cita encontrada</p>
                          <p className="text-white/70 text-[12px] font-mono">{cita.codigo_referencia}</p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${ESTADO_COLORS[cita.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                        {cita.estado}
                      </span>
                    </div>

                    <div className="px-6 py-5 flex flex-col gap-4">
                      {[
                        { label: 'Especialidad', valor: cita.especialidad },
                        { label: 'Médico',       valor: cita.medico },
                        { label: 'Fecha',        valor: fechaFormateada },
                        { label: 'Hora',         valor: horaFormateada },
                      ].map(({ label, valor }) => (
                        <div key={label} className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">{label}</span>
                          <span className="text-[15px] font-medium text-[#1a2332] capitalize">{valor}</span>
                        </div>
                      ))}
                    </div>

                    {cita.estado === 'Agendada' && (
                      <div className="px-6 pb-6 pt-3 flex flex-col gap-3">
                        <BotonPrimario to={`/modificar/${cita.codigo_referencia}`} variante="solido" fullWidth>
                          Modificar mi cita
                        </BotonPrimario>
                        <BotonPrimario
                          to={`/cancelar/${cita.codigo_referencia}`}
                          variante="outline"
                          fullWidth
                          className="border-[#e05c5c]/30! text-[#e05c5c]! hover:bg-red-50!"
                        >
                          Cancelar cita
                        </BotonPrimario>
                      </div>
                    )}
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
