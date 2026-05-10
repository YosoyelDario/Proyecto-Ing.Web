import { useEffect, useState } from 'react'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonIcon
} from '@ionic/react'
import { chevronForwardOutline, createOutline, closeCircleOutline } from 'ionicons/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import BotonVolver    from '../../components/BotonVolver'
import BotonPrimario  from '../../components/BotonPrimario'
import PageTransition from '../../components/PageTransition'

const ADMIN_EMAIL = 'tuadmin@gmail.com'

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
  const hoy     = new Date().toISOString().split('T')[0]
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

  const params        = new URLSearchParams(location.search)
  const filtroInicial = (params.get('filtro') as Filtro) || 'todas'

  const [autenticado, setAutenticado]     = useState(false)
  const [cargando, setCargando]           = useState(true)
  const [citas, setCitas]                 = useState<Record<string, CitaDetalle>>({})
  const [filtro, setFiltro]               = useState<Filtro>(filtroInicial)
  const [busqueda, setBusqueda]           = useState('')
  const [citaExpandida, setCitaExpandida] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  /* ── Guard de autenticación ──────────────────────────────────────────── */
  useEffect(() => {
    const emailGuardado = localStorage.getItem('userEmail')
    if (!emailGuardado || emailGuardado.toLowerCase() !== ADMIN_EMAIL) {
      navigate('/', { replace: true })
      return
    }
    setAutenticado(true)
    setCargando(false)
  }, [navigate])

  /* ── Cargar citas ──────────────────────────────────────────────────────── */
  const cargarCitas = () => {
    const datos = JSON.parse(localStorage.getItem('citas_agendadas') || '{}')
    setCitas(datos)
  }

  useEffect(() => { if (autenticado) cargarCitas() }, [autenticado])

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

  if (cargando || !autenticado) return null

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <IonPage>
      {/* ── Header ───────────────────────────────────────────────── */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#3aada0', '--color': 'white', '--padding-top': '16px' }}>
          <IonButtons slot="start" className="pl-4">
            <BotonVolver to="/admin" label="Panel" className="!text-white/80 hover:!text-white" />
          </IonButtons>
          <IonButtons slot="end" className="pr-4">
            <span className="text-[12px] text-white/60 font-mono">
              {citasFiltradas.length} resultado{citasFiltradas.length !== 1 ? 's' : ''}
            </span>
          </IonButtons>
        </IonToolbar>

        <IonToolbar style={{ '--background': '#3aada0', '--color': 'white' }}>
          <IonTitle className="px-6 mb-2">
            <PageTransition variante="fadeUp" duracion={400}>
              <span className="text-[22px] font-semibold text-white tracking-tight">
                Gestión de Citas
              </span>
            </PageTransition>
          </IonTitle>
        </IonToolbar>

        <IonToolbar style={{ '--background': '#3aada0', '--padding-bottom': '16px' }}>
          <div className="px-6">
            <IonSearchbar
              value={busqueda}
              onIonInput={e => setBusqueda(e.detail.value!)}
              placeholder="Buscar por nombre, RUT, especialidad..."
              style={{
                '--background': 'rgba(255,255,255,0.2)',
                '--color': 'white',
                '--placeholder-color': 'rgba(255,255,255,0.5)',
                '--icon-color': 'rgba(255,255,255,0.6)',
                '--border-radius': '12px',
                '--box-shadow': 'none',
                padding: 0
              }}
            />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-[#f4faf9]">
        <div className="flex-1 px-5 py-4 flex flex-col gap-4 max-w-lg mx-auto w-full font-['DM_Sans',sans-serif]">

          {/* ── Filtros ──────────────────────────────────────────────── */}
          <PageTransition variante="fadeUp" duracion={300} delay={100}>
            <IonSegment 
              value={filtro} 
              onIonChange={e => setFiltro(e.detail.value as Filtro)}
              mode="ios"
              className="bg-white/50 border border-[#d5dce7] rounded-xl"
            >
              <IonSegmentButton value="todas">
                <IonLabel className="text-[13px]">Todas</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="proximas">
                <IonLabel className="text-[13px]">Próximas</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="pasadas">
                <IonLabel className="text-[13px]">Pasadas</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </PageTransition>

          {/* ── Lista de citas ───────────────────────────────────────── */}
          {citasFiltradas.length === 0 ? (
            <PageTransition variante="fadeIn" duracion={400} delay={200}>
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a0adb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="18" rx="2" />
                  <path d="M8 7h8M8 11h5" />
                  <path d="M9 17l2-2 2 2" opacity="0.5" />
                </svg>
                <p className="text-[15px] font-medium text-[#1a2332]">Sin resultados</p>
                <p className="text-[13px] text-[#7a8a9a] text-center">
                  {busqueda
                    ? 'No hay citas que coincidan con tu búsqueda.'
                    : 'No hay citas registradas en esta categoría.'}
                </p>
              </div>
            </PageTransition>
          ) : (
            <IonList lines="none" className="bg-transparent p-0 flex flex-col gap-4">
              {citasFiltradas.map(([codigo, cita], idx) => (
                <PageTransition key={codigo} variante="fadeUp" duracion={300} delay={150 + idx * 80}>
                  <div className="bg-white rounded-2xl border border-[#d5dce7] overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                    {/* Cabecera — click para expandir */}
                    <IonItem
                      button
                      detail={false}
                      onClick={() => {
                        setCitaExpandida(citaExpandida === codigo ? null : codigo)
                        setConfirmDelete(null)
                      }}
                      className="py-1 [--background-hover:#f7f9fc]"
                    >
                      <div className="flex-1 min-w-0 py-3">
                        <div className="flex items-center gap-2.5 mb-2">
                          <p className="text-[17px] font-semibold text-[#1a2332] truncate m-0">
                            {cita.nombre}
                          </p>
                          <BadgeEstado fecha={cita.fecha} />
                        </div>
                        <p className="text-[14px] text-[#7a8a9a] leading-relaxed m-0">
                          {cita.especialidad} · {formatearFecha(cita.fecha)} · {cita.hora}
                        </p>
                        <p className="text-[12px] font-mono text-[#a0adb8] mt-1.5 m-0">#{codigo}</p>
                      </div>
                      <IonIcon
                        icon={chevronForwardOutline}
                        className={`w-5 h-5 flex-shrink-0 text-[#c8d3dc] transition-transform duration-200 ${
                          citaExpandida === codigo ? 'rotate-90' : ''
                        }`}
                      />
                    </IonItem>

                    {/* Detalle expandido */}
                    {citaExpandida === codigo && (
                      <div className="border-t border-[#eef4f9]">
                        <div className="px-6 py-4 flex flex-col gap-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">Médico</span>
                            <span className="text-[15px] font-medium text-[#1a2332]">{cita.medico}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">RUT</span>
                            <span className="text-[15px] font-medium text-[#1a2332]">{cita.rut}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-semibold text-[#7a8a9a] uppercase tracking-wider">Correo</span>
                            <span className="text-[15px] font-medium text-[#1a2332]">{cita.email}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-semibold text-[#3aada0] uppercase tracking-wider">Fecha</span>
                            <span className="text-[15px] font-medium text-[#1a2332]">{formatearFecha(cita.fecha)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-semibold text-[#3aada0] uppercase tracking-wider">Hora</span>
                            <span className="text-[15px] font-medium text-[#1a2332]">{cita.hora}</span>
                          </div>
                        </div>

                        {/* Acciones */}
                        {confirmDelete === codigo ? (
                          <div className="px-6 pb-5 pt-2 flex flex-col gap-3">
                            <p className="text-[13px] text-[#e05c5c] font-medium text-center m-0">
                              ¿Confirmar cancelación de esta cita?
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <BotonPrimario
                                onClick={() => handleCancelar(codigo)}
                                fullWidth
                                className="!bg-[#e05c5c] !border-[#e05c5c] hover:!bg-[#c94a4a] hover:!border-[#c94a4a] py-3! text-[13px]! rounded-xl!"
                              >
                                Sí, cancelar
                              </BotonPrimario>
                              <BotonPrimario
                                onClick={() => setConfirmDelete(null)}
                                variante="outline"
                                fullWidth
                                className="py-3! text-[13px]! rounded-xl!"
                              >
                                No, volver
                              </BotonPrimario>
                            </div>
                          </div>
                        ) : (
                          <div className="px-6 pb-5 pt-2 grid grid-cols-2 gap-3">
                            <BotonPrimario
                              to={`/modificar/${codigo}?origen=admin`}
                              variante="outline"
                              fullWidth
                              className="py-3! text-[13px]! rounded-xl!"
                            >
                              <span className="flex items-center justify-center gap-1.5">
                                <IonIcon icon={createOutline} className="w-[14px] h-[14px]" />
                                Modificar
                              </span>
                            </BotonPrimario>
                            <BotonPrimario
                              onClick={() => setConfirmDelete(codigo)}
                              variante="outline"
                              fullWidth
                              className="!border-[#e05c5c]/30 !text-[#e05c5c] hover:!bg-red-50 py-3! text-[13px]! rounded-xl!"
                            >
                              <span className="flex items-center justify-center gap-1.5">
                                <IonIcon icon={closeCircleOutline} className="w-[14px] h-[14px]" />
                                Cancelar
                              </span>
                            </BotonPrimario>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </PageTransition>
              ))}
            </IonList>
          )}

        </div>
      </IonContent>
    </IonPage>
  )
}