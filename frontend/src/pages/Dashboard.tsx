import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IonPage, IonContent, IonHeader, IonToolbar,
  IonCard, IonCardContent, IonText, IonNote
} from '@ionic/react'
import BotonVolver from '../components/BotonVolver'
import BotonPrimario from '../components/BotonPrimario'
import PageTransition from '../components/PageTransition'
import { AuthService, apiFetch } from '../services/AuthServices'

interface Usuario {
  id: number
  rut: string
  nombre_completo: string
  email: string
  region: string
  comuna: string
  is_admin: boolean
}

interface Cita {
  id: number
  codigo_referencia: string
  fecha: string
  hora: string
  estado: string
  medico: string
  especialidad: string
}

const ESTADO_COLORS: Record<string, string> = {
  Agendada:   'bg-[#e1f5ee] text-[#085041]',
  Completada: 'bg-[#e6f1fb] text-[#0c447c]',
  Cancelada:  'bg-[#fde8e8] text-[#a32d2d]',
  NoAsiste:   'bg-[#faeeda] text-[#633806]',
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [citas,   setCitas]   = useState<Cita[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const usuarioGuardado = AuthService.obtenerUsuario()
    if (!usuarioGuardado) {
      navigate('/login')
      return
    }
    setUsuario(usuarioGuardado)

    // Obtener citas del usuario
    apiFetch('/api/citas/mis-citas')
      .then(res => res.json())
      .then(data => {
        setCitas(data)
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [navigate])

  const formatearFecha = (f: string) => {
  if (!f) return 'Sin fecha'
  
  // Cortar para usar solo YYYY-MM-DD
  const limpio = f.split('T')[0]
  const partes = limpio.split('-')
  
  if (partes.length !== 3) return f

  const anio = parseInt(partes[0], 10)
  const mes  = parseInt(partes[1], 10) - 1 // En JS los meses van de 0 a 11
  const dia  = parseInt(partes[2], 10)

  // Creamos la fecha usando enteros locales (evita desfases y errores de "Invalid Date")
  const fechaObjeto = new Date(anio, mes, dia)

  return fechaObjeto.toLocaleDateString('es-CL', {
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
  })
}

  const formatearHora = (hora: string) => hora.slice(0, 5)

  if (!usuario) return null

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="absolute top-4 left-4 z-10">
            <BotonVolver to="/" label="Inicio" />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f4faf9' } as React.CSSProperties}>
        <PageTransition variante="fadeUp" duracion={500}>
          <div className="min-h-screen px-6 py-10 font-['DM_Sans',sans-serif] max-w-2xl mx-auto">

            {/* ── Encabezado ── */}
            <IonText>
              <h1 className="text-[26px] font-semibold text-[#3aada0]! mb-1">Mi perfil </h1>
            </IonText>
            <IonNote className="text-[20px] text-[#7a8a9a] block mb-8">
              Bienvenido, {usuario.nombre_completo}
            </IonNote>

            {/* ── Datos personales ── */}
            <IonCard className="mb-6 rounded-2xl shadow-sm">
              <IonCardContent>
                <p className="text-[11px] font-medium tracking-widest uppercase text-[#3aada0] mb-4">
                  Datos personales
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Nombre',  valor: usuario.nombre_completo },
                    { label: 'RUT',     valor: usuario.rut },
                    { label: 'Email',   valor: usuario.email },
                    { label: 'Región',  valor: usuario.region },
                    { label: 'Comuna',  valor: usuario.comuna },
                  ].map(({ label, valor }) => (
                    <div key={label} className="flex justify-between items-center border-b border-[#eef4f9] pb-2 last:border-0 last:pb-0">
                      <span className="text-[13px] text-[#7a8a9a]">{label}</span>
                      <span className="text-[14px] font-medium text-[#1a2332]">{valor}</span>
                    </div>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>

            {/* ── Botón cambiar contraseña ── */}
            <BotonPrimario to="/cambiar-password" variante="solido" fullWidth className="mb-4">
              Cambiar contraseña
            </BotonPrimario>

            {/* ── Botón agendar ── */}
            <BotonPrimario to="/agendar" variante="solido" fullWidth className="mb-8">
              Agendar nueva cita
            </BotonPrimario>

            {/* ── Mis citas ── */}
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#3aada0] mb-4">
              Mis citas
            </p>

            {cargando ? (
              <p className="text-center text-[14px] text-[#7a8a9a] py-8">Cargando citas...</p>
            ) : citas.length === 0 ? (
              <IonCard className="rounded-2xl shadow-sm">
                <IonCardContent className="text-center py-8">
                  <p className="text-[14px] text-[#7a8a9a]">No tienes citas agendadas.</p>
                </IonCardContent>
              </IonCard>
            ) : (
              <div className="flex flex-col gap-4">
                {citas.map(cita => (
                  <IonCard key={cita.id} className="rounded-2xl shadow-sm">
                    <IonCardContent>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[15px] font-medium text-[#1a2332]">{cita.medico}</p>
                          <p className="text-[13px] text-[#7a8a9a]">{cita.especialidad}</p>
                        </div>
                        <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${ESTADO_COLORS[cita.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                          {cita.estado}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-[13px] text-[#5a7e7b]">
                        <span>📅 {formatearFecha(cita.fecha)}</span>
                        <span>🕐 {formatearHora(cita.hora)}</span>
                        <span className="text-[12px] text-[#a8c5c2] mt-1">
                          Código: {cita.codigo_referencia}
                        </span>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            )}

          </div>
        </PageTransition>
      </IonContent>
    </IonPage>
  )
}