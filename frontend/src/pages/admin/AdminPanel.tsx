import { useEffect, useState } from 'react'
import { IonPage, IonContent, IonHeader, IonToolbar } from '@ionic/react'
import { useNavigate } from 'react-router-dom'
import BotonPrimario   from '../../components/BotonPrimario'
import BotonVolver     from '../../components/BotonVolver'
import PageTransition  from '../../components/PageTransition'
import { AuthService } from '../../services/AuthServices'

interface CitaDetalle {
  especialidad: string
  medico:       string
  fecha:        string
  hora:         string
  rut:          string
  nombre:       string
  email:        string
}

interface Estadisticas {
  total:            number
  proximas:         number
  pasadas:          number
  porEspecialidad:  Record<string, number>
}

const IconoGestion = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3aada0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 14l2 2 4-4" />
  </svg>
)

function TarjetaAcceso({ icono, titulo, descripcion, onClick }: {
  icono: React.ReactNode
  titulo: string
  descripcion: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-[#d5dce6] p-5 flex items-center gap-4 hover:shadow-md hover:border-[#3aada0] transition-all duration-200 active:scale-[0.98]"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#3aada0]/10">
        {icono}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[#1a2332] mb-0.5">{titulo}</p>
        <p className="text-[12px] text-[#7a8a9a] font-light leading-snug">{descripcion}</p>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="#c8d3dc" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

function ChipStat({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-[#d5dce6] py-4 px-3 gap-1">
      <span className="text-[26px] font-bold" style={{ color }}>{valor}</span>
      <span className="text-[11px] text-[#7a8a9a] text-center font-medium leading-tight">{label}</span>
    </div>
  )
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [autenticado, setAutenticado] = useState(false)
  const [cargando, setCargando]       = useState(true)
  const [stats, setStats] = useState<Estadisticas>({
    total: 0, proximas: 0, pasadas: 0, porEspecialidad: {},
  })

  useEffect(() => {
    if (!AuthService.esAdminValido()) {
      navigate('/', { replace: true })
      return
    }
    setAutenticado(true)
    setCargando(false)
  }, [navigate])

  useEffect(() => {
    if (!autenticado) return
    const citas = JSON.parse(localStorage.getItem('citas_agendadas') || '{}') as Record<string, CitaDetalle>
    const hoy   = new Date().toISOString().split('T')[0]
    const valores = Object.values(citas)

    const porEspecialidad: Record<string, number> = {}
    let proximas = 0
    let pasadas  = 0

    for (const c of valores) {
      if (c.fecha >= hoy) proximas++
      else pasadas++
      porEspecialidad[c.especialidad] = (porEspecialidad[c.especialidad] || 0) + 1
    }

    setStats({ total: valores.length, proximas, pasadas, porEspecialidad })
  }, [autenticado])

  if (cargando || !autenticado) return null

  return (
    <IonPage>
    <IonHeader className="ion-no-border">
      <IonToolbar style={{ '--background': '#3aada0', '--color': 'white' }}>
        <div slot="start" className="ml-4">
          <BotonVolver to="/" label="Inicio" className="text-white/80! hover:text-white!" />
        </div>
      </IonToolbar>
    </IonHeader>

    <IonContent fullscreen className="bg-[#f4faf9]">
      <div className="min-h-screen flex flex-col font-['DM_Sans',sans-serif]">
        <div className="bg-[#3aada0] px-6 pb-10 pt-2 flex flex-col items-center justify-center gap-1  shadow-sm">
          <PageTransition variante="fadeUp" duracion={400}>
            <p className="text-[30px]! text-white/90 font-light text-center mt-2 m-0">
              Panel Administrativo
            </p>
            <p className="text-[13px] text-white/70 font-light text-center m-0">
              Municipalidad de Santo Domingo
            </p>
          </PageTransition>
        </div>

          <div className="flex-1 px-5 py-6 flex flex-col gap-6 max-w-lg mx-auto w-full -mt-6">
            <PageTransition variante="fadeUp" duracion={400} delay={100}>
              <section>
                <p className="text-[11px] font-semibold text-[#a0adb8] uppercase tracking-wider mb-3">
                  Resumen general
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <ChipStat label="Total citas"  valor={stats.total}    color="#3aada0" />
                  <ChipStat label="Próximas"     valor={stats.proximas} color="#4aa8d8" />
                  <ChipStat label="Pasadas"      valor={stats.pasadas}  color="#a0adb8" />
                </div>
              </section>
            </PageTransition>

            <PageTransition variante="fadeUp" duracion={400} delay={200}>
              <section>
                <p className="text-[11px] font-semibold text-[#a0adb8] uppercase tracking-wider mb-3">
                  Gestión
                </p>
                <div className="flex flex-col gap-3">
                  <TarjetaAcceso
                    icono={<IconoGestion />}
                    titulo="Gestión de Citas"
                    descripcion="Ver, modificar y cancelar citas de pacientes"
                    onClick={() => navigate('/admin/gestion')}
                  />
                </div>
              </section>
            </PageTransition>

            {Object.keys(stats.porEspecialidad).length > 0 && (
              <PageTransition variante="fadeUp" duracion={400} delay={300}>
                <section>
                  <p className="text-[11px] font-semibold text-[#a0adb8] uppercase tracking-wider mb-3">
                    Citas por especialidad
                  </p>
                  <div className="bg-white rounded-2xl border border-[#d5dce6] overflow-hidden">
                    {Object.entries(stats.porEspecialidad).map(([esp, cantidad], idx, arr) => (
                      <div
                        key={esp}
                        className={`flex items-center justify-between px-5 py-3.5 ${
                          idx < arr.length - 1 ? 'border-b border-[#eef4f9]' : ''
                        }`}
                      >
                        <span className="text-[14px] text-[#1a2332] font-medium">{esp}</span>
                        <span className="text-[13px] font-semibold text-[#3aada0]">
                          {cantidad} {cantidad === 1 ? 'cita' : 'citas'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </PageTransition>
            )}

            <PageTransition variante="fadeIn" duracion={400} delay={400}>
              <div className="pt-2 pb-4">
                <BotonPrimario
                  onClick={() => {
                    AuthService.cerrarSesion()
                    navigate('/')
                  }}
                  variante="outline"
                  fullWidth
                  className="!border-[#e05c5c]/30 !text-[#e05c5c] hover:!bg-red-50 py-5! text-base! tracking-wider! rounded-xl!"
                >
                  Cerrar sesión
                </BotonPrimario>
              </div>
            </PageTransition>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}