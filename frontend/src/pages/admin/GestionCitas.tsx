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
import { chevronForwardOutline, createOutline, closeCircleOutline, trashOutline } from 'ionicons/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import BotonVolver    from '../../components/BotonVolver'
import BotonPrimario  from '../../components/BotonPrimario'
import PageTransition from '../../components/PageTransition'
import { AuthService, apiFetch } from '../../services/AuthServices'


interface CitaDetalle {
  id: number
  codigo_referencia: string
  especialidad: string
  medico:       string
  fecha:        string
  hora:         string
  rut:          string
  nombre:       string
  email:        string
  estado:       'Agendada' | 'Completada' | 'Cancelada' | 'NoAsiste'
}

type Filtro = 'todas' | 'proximas' | 'pasadas'

function BadgeEstado({ estado, fecha }: { estado: string, fecha: string }) {
  const hoy = new Date().toISOString().split('T')[0]

  if (estado === 'Cancelada') {
    return <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">Cancelada</span>
  }

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

export default function GestionCitas() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const params        = new URLSearchParams(location.search)
  const filtroInicial = (params.get('filtro') as Filtro) || 'todas'

  // esAdmin se calcula una vez, sin useState, evita setCargando en el efecto
  const esAdmin = AuthService.esAdmin()

  const [citas, setCitas]                   = useState<CitaDetalle[]>([])
  const [filtro, setFiltro]                 = useState<Filtro>(filtroInicial)
  const [busqueda, setBusqueda]             = useState('')
  const [citaExpandida, setCitaExpandida]   = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete]   = useState<string | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null)

  const cargarCitas = async () => {
    try {
      const response = await apiFetch('/api/citas/all')
      if (response.ok) {
        const datos: CitaDetalle[] = await response.json()
        setCitas(datos)
      }
    } catch (error) {
      console.error('Error al cargar la lista de citas:', error)
    }
  }

  // Sin setCargando dentro del efecto — solo navega o carga datos
  useEffect(() => {
    if (!esAdmin) {
      navigate('/', { replace: true })
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarCitas()
  }, [navigate, esAdmin])

  const handleCancelar = async (codigo: string) => {
    try {
      const response = await apiFetch(`/api/citas/${codigo}/cancelar`, {
        method: 'PATCH'
      })
      if (response.ok) {
        await cargarCitas()
        setConfirmDelete(null)
        setCitaExpandida(null)
      }
    } catch (error) {
      console.error('Error al cancelar la cita en el servidor:', error)
    }
  }

  const handleEliminar = async (codigo: string) => {
    try {
      const response = await apiFetch(`/api/citas/${codigo}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await cargarCitas()
        setConfirmEliminar(null)
        setCitaExpandida(null)
      }
    } catch (error) {
      console.error('Error al eliminar la cita en el servidor:', error)
    }
  }

  const hoy = new Date().toISOString().split('T')[0]

  const citasFiltradas = citas.filter((c) => {
    const pasaFiltro =
      filtro === 'todas'    ? true :
      filtro === 'proximas' ? c.fecha >= hoy && c.estado !== 'Cancelada' :
                              c.fecha <  hoy || c.estado === 'Cancelada'

    const terminoBusqueda = busqueda.toLowerCase()
    const pasaBusqueda =
      busqueda === '' ||
      (c.nombre && c.nombre.toLowerCase().includes(terminoBusqueda)) ||
      (c.rut && c.rut.toLowerCase().includes(terminoBusqueda)) ||
      (c.especialidad && c.especialidad.toLowerCase().includes(terminoBusqueda)) ||
      (c.medico && c.medico.toLowerCase().includes(terminoBusqueda)) ||
      (c.codigo_referencia && c.codigo_referencia.toLowerCase().includes(terminoBusqueda))

    return pasaFiltro && pasaBusqueda
  })

  const formatearFecha = (f: string) => {
    if (!f) return 'Sin fecha'
    const limpio = f.split('T')[0]
    const partes = limpio.split('-')
    if (partes.length !== 3) return f
    const anio = parseInt(partes[0], 10)
    const mes  = parseInt(partes[1], 10) - 1
    const dia  = parseInt(partes[2], 10)
    const fechaObjeto = new Date(anio, mes, dia)
    return fechaObjeto.toLocaleDateString('es-CL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Si no es admin, no renderizar nada (la redirección ya está en el efecto)
  if (!esAdmin) return null

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#3aada0', '--color': 'white', '--padding-top': '16px' }}>
          <IonButtons slot="start" className="pl-4">
            <BotonVolver to="/admin" label="Panel" className="text-white/80! hover:text-white!" />
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
              {citasFiltradas.map((cita, idx) => {
                const codigo = cita.codigo_referencia
                return (
                  <PageTransition key={codigo} variante="fadeUp" duracion={300} delay={150 + idx * 80}>
                    <div className="bg-white rounded-2xl border border-[#d5dce7] overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                      <IonItem
                        button
                        detail={false}
                        onClick={() => {
                          setCitaExpandida(citaExpandida === codigo ? null : codigo)
                          setConfirmDelete(null)
                          setConfirmEliminar(null)
                        }}
                        className="py-1 [--background-hover:#f7f9fc]"
                      >
                        <div className="flex-1 min-w-0 py-3">
                          <div className="flex items-center gap-2.5 mb-2">
                            <p className="text-[17px] font-semibold text-[#1a2332] truncate m-0">
                              {cita.nombre}
                            </p>
                            <BadgeEstado estado={cita.estado} fecha={cita.fecha} />
                          </div>
                          <p className="text-[14px] text-[#7a8a9a] leading-relaxed m-0">
                            {cita.especialidad} · {formatearFecha(cita.fecha)} · {cita.hora.slice(0, 5)}
                          </p>
                          <p className="text-[12px] font-mono text-[#a0adb8] mt-1.5 m-0">#{codigo}</p>
                        </div>
                        <IonIcon
                          icon={chevronForwardOutline}
                          className={`w-5 h-5 shrink-0 text-[#c8d3dc] transition-transform duration-200 ${
                            citaExpandida === codigo ? 'rotate-90' : ''
                          }`}
                        />
                      </IonItem>

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
                              <span className="text-[15px] font-medium text-[#1a2332]">{cita.hora.slice(0, 5)} hrs</span>
                            </div>
                          </div>

                          {confirmDelete === codigo ? (
                            <div className="px-6 pb-5 pt-2 flex flex-col gap-3">
                              <p className="text-[13px] text-[#e05c5c] font-medium text-center m-0">
                                ¿Confirmar cancelación de esta cita?
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                <BotonPrimario
                                  onClick={() => handleCancelar(codigo)}
                                  fullWidth
                                  className="bg-[#e05c5c]! border-[#e05c5c]! hover:bg-[#c94a4a]! hover:border-[#c94a4a]! py-3! text-[13px]! rounded-xl!"
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

                          ) : confirmEliminar === codigo ? (
                            <div className="px-6 pb-5 pt-2 flex flex-col gap-3">
                              <p className="text-[13px] text-[#e05c5c] font-medium text-center m-0">
                                ¿Eliminar permanentemente esta cita? Esta acción no se puede deshacer.
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                <BotonPrimario
                                  onClick={() => handleEliminar(codigo)}
                                  fullWidth
                                  className="bg-[#e05c5c]! border-[#e05c5c]! hover:bg-[#c94a4a]! hover:border-[#c94a4a]! py-3! text-[13px]! rounded-xl!"
                                >
                                  Sí, eliminar
                                </BotonPrimario>
                                <BotonPrimario
                                  onClick={() => setConfirmEliminar(null)}
                                  variante="outline"
                                  fullWidth
                                  className="py-3! text-[13px]! rounded-xl!"
                                >
                                  No, volver
                                </BotonPrimario>
                              </div>
                            </div>

                          ) : (
                            <div className="px-6 pb-5 pt-2 grid grid-cols-3 gap-3">
                              {cita.estado === 'Agendada' && (
                                <>
                                  <BotonPrimario
                                    to={`/modificar/${codigo}?origen=admin`}
                                    variante="outline"
                                    fullWidth
                                    className="py-3! text-[13px]! rounded-xl!"
                                  >
                                    <span className="flex items-center justify-center gap-1.5">
                                      <IonIcon icon={createOutline} className="w-3.5 h-3.5" />
                                      Modificar
                                    </span>
                                  </BotonPrimario>
                                  <BotonPrimario
                                    onClick={() => setConfirmDelete(codigo)}
                                    variante="outline"
                                    fullWidth
                                    className="border-[#e05c5c]/30! text-[#e05c5c]! hover:bg-red-50! py-3! text-[13px]! rounded-xl!"
                                  >
                                    <span className="flex items-center justify-center gap-1.5">
                                      <IonIcon icon={closeCircleOutline} className="w-3.5 h-3.5" />
                                      Cancelar
                                    </span>
                                  </BotonPrimario>
                                </>
                              )}
                              <BotonPrimario
                                onClick={() => setConfirmEliminar(codigo)}
                                variante="outline"
                                fullWidth
                                className="border-[#e05c5c]/30! text-[#e05c5c]! hover:bg-red-50! py-3! text-[13px]! rounded-xl!"
                              >
                                <span className="flex items-center justify-center gap-1.5">
                                  <IonIcon icon={trashOutline} className="w-3.5 h-3.5" />
                                  Eliminar
                                </span>
                              </BotonPrimario>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </PageTransition>
                )
              })}
            </IonList>
          )}

        </div>
      </IonContent>
    </IonPage>
  )
}