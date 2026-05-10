import { useEffect, useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useNavigate, useLocation } from 'react-router-dom'
import BotonVolver   from '../../components/BotonVolver'
import BotonPrimario from '../../components/BotonPrimario'
import FilaDetalle   from '../../components/FilaDetalle'

interface CitaDetalle {
  especialidad: string
  medico:       string
  fecha:        string
  hora:         string
  rut:          string
  nombre:       string
  email:        string
}

type Filtro = 'todas' | 'proximas' | 'pasadas'

/* ── Badge de estado ─────────────────────────────────────────────────────── */
function BadgeEstado({ fecha }: { fecha: string }) {
  const hoy    = new Date().toISOString().split('T')[0]
  const proxima = fecha >= hoy
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
      proxima
        ? 'bg-[#3aada0]/10 text-[#3aada0]'
        : 'bg-[#a0adb8]/10 text-[#a0adb8]'
    }`}>
      {proxima ? 'Próxima' : 'Pasada'}
    </span>
  )
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function GestionCitas() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Lee filtro inicial desde query param ?filtro=proximas
  const params       = new URLSearchParams(location.search)
  const filtroInicial = (params.get('filtro') as Filtro) || 'todas'

  const [citas,         setCitas]         = useState<Record<string, CitaDetalle>>({})
  const [filtro,        setFiltro]        = useState<Filtro>(filtroInicial)
  const [busqueda,      setBusqueda]      = useState('')
  const [citaExpandida, setCitaExpandida] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  /* ── Cargar citas ──────────────────────────────────────────────────────── */
  const cargarCitas = () => {
    const datos = JSON.parse(localStorage.getItem('citas_agendadas') || '{}')
    setCitas(datos)
  }

  useEffect(() => { cargarCitas() }, [])

  /* ── Cancelar cita desde admin ─────────────────────────────────────────── */
  const handleCancelar = (codigo: string) => {
    const datos = JSON.parse(localStorage.getItem('citas_agendadas') || '{}')
    delete datos[codigo]
    localStorage.setItem('citas_agendadas', JSON.stringify(datos))
    setCitas(datos)
    setConfirmDelete(null)
    setCitaExpandida(null)
  }

  /* ── Filtrar y buscar ──────────────────────────────────────────────────── */
  const hoy = new Date().toISOString().split('T')[0]

  const citasFiltradas = Object.entries(citas).filter(([, c]) => {
    const pasaFiltro =
      filtro === 'todas'    ? true :
      filtro === 'proximas' ? c.fecha >= hoy :
                              c.fecha <  hoy

    const terminoBusqueda = busqueda.toLowerCase()
    const pasaBusqueda =
      busqueda === '' ||
      c.nombre.toLowerCase().includes(terminoBusqueda) ||
      c.rut.toLowerCase().includes(terminoBusqueda) ||
      c.especialidad.toLowerCase().includes(terminoBusqueda) ||
      c.medico.toLowerCase().includes(terminoBusqueda)

    return pasaFiltro && pasaBusqueda
  })

  const formatearFecha = (f: string) =>
    new Date(f + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f4faf9]">
        <div className="min-h-screen flex flex-col font-['DM_Sans',sans-serif]">

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="bg-[#3aada0] px-6 pt-14 pb-6">
            <div className="flex items-center justify-between mb-3">
              <BotonVolver to="/admin" label="Panel" className="!text-white/80 hover:!text-white" />
              <span className="text-[12px] text-white/60 font-mono">
                {citasFiltradas.length} resultado{citasFiltradas.length !== 1 ? 's' : ''}
              </span>
            </div>
            <h1 className="text-[22px] font-semibold text-white tracking-tight mb-4">
              Gestión de Citas
            </h1>

            {/* Buscador */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px]">🔍</span>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, RUT, especialidad..."
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder:text-white/50 text-[14px] outline-none border border-white/20 focus:border-white/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 px-5 py-4 flex flex-col gap-4 max-w-lg mx-auto w-full">

            {/* ── Filtros ──────────────────────────────────────────────── */}
            <div className="flex gap-2">
              {(['todas', 'proximas', 'pasadas'] as Filtro[]).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltro(f)}
                  className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors border ${
                    filtro === f
                      ? 'bg-[#3aada0] text-white border-[#3aada0]'
                      : 'bg-white text-[#7a8a9a] border-[#d5dce6] hover:border-[#3aada0]'
                  }`}
                >
                  {f === 'todas' ? 'Todas' : f === 'proximas' ? 'Próximas' : 'Pasadas'}
                </button>
              ))}
            </div>

            {/* ── Lista de citas ───────────────────────────────────────── */}
            {citasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-[48px]">📭</span>
                <p className="text-[15px] font-medium text-[#1a2332]">Sin resultados</p>
                <p className="text-[13px] text-[#7a8a9a] text-center">
                  {busqueda
                    ? 'No hay citas que coincidan con tu búsqueda.'
                    : 'No hay citas registradas en esta categoría.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {citasFiltradas.map(([codigo, cita]) => (
                  <div
                    key={codigo}
                    className="bg-white rounded-2xl border border-[#d5dce7] overflow-hidden shadow-sm hover:shadow-md transition-shadow "
                  >
                    {/* Cabecera de la tarjeta — click para expandir */}
                    <button
                      type="button"
                      onClick={() => setCitaExpandida(
                        citaExpandida === codigo ? null : codigo
                      )}
                      className="w-full px-6 py-6 flex items-center gap-5 text-left hover:bg-[#f7f9fc] transition-colors"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <div className="flex-1 min-w-0 pl-4 mb-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-[15px] font-semibold text-[#1a2332] truncate">
                            {cita.nombre}
                          </p>
                          <BadgeEstado fecha={cita.fecha} />
                        </div>
                        <p className="text-[12px] text-[#7a8a9a]">
                          {cita.especialidad} · {formatearFecha(cita.fecha)} · {cita.hora}
                        </p>
                        <p className="text-[11px] font-mono text-[#a0adb8] mt-0.5">#{codigo}</p>
                      </div>
                      <svg
                        viewBox="0 0 24 24" fill="none" stroke="#c8d3dc" strokeWidth={2}
                        strokeLinecap="round" strokeLinejoin="round"
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                          citaExpandida === codigo ? 'rotate-90' : ''
                        }`}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>

                    {/* Detalle expandido */}
                    {citaExpandida === codigo && (
                      <div className="border-t border-[#eef4f9]">
                        <div className="px-5 pt-2 pb-1">
                          <FilaDetalle icono="👨‍⚕️" label="Médico"       valor={cita.medico} />
                          <FilaDetalle icono="🪪"  label="RUT"           valor={cita.rut} />
                          <FilaDetalle icono="✉️"  label="Correo"        valor={cita.email} />
                          <FilaDetalle icono="📅"  label="Fecha"         valor={formatearFecha(cita.fecha)} />
                          <FilaDetalle icono="🕐"  label="Hora"          valor={cita.hora} />
                        </div>

                        {/* Acciones del admin */}
                        {confirmDelete === codigo ? (
                          <div className="px-5 pb-5 pt-3 flex flex-col gap-2">
                            <p className="text-[13px] text-red-600 font-medium text-center mb-1">
                              ¿Confirmar cancelación de esta cita?
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => handleCancelar(codigo)}
                                className="py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors"
                              >
                                Sí, cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDelete(null)}
                                className="py-2.5 rounded-xl border border-[#d5dce6] text-[#7a8a9a] text-[13px] font-medium hover:bg-[#f7f9fc] transition-colors"
                              >
                                No, volver
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-5 pb-5 pt-3 grid grid-cols-2 gap-2">
                            <BotonPrimario
                              to={`/modificar/${codigo}`}
                              variante="outline"
                              fullWidth
                            >
                              ✏️ Modificar
                            </BotonPrimario>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(codigo)}
                              className="py-3 rounded-xl border border-red-200 text-red-500 text-[13px] font-medium hover:bg-red-50 transition-colors"
                            >
                              ❌ Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}