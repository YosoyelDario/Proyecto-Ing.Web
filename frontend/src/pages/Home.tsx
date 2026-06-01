import { useEffect, useRef, useState } from 'react'
import { IonPage, IonContent, IonHeader, IonFooter } from '@ionic/react'
import LogoSantoDomingo from '../components/LogoSantoDomingo'
import BotonPrimario from '../components/BotonPrimario'
import { AuthService } from '../services/AuthServices'
import { useNavigate } from 'react-router-dom';

interface Usuario {
  id: number
  rut: string
  nombre_completo: string
  email: string
  region: string
  comuna: string
  is_admin: boolean
}

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap'
    document.head.appendChild(link)
    headingRef.current?.focus()

    const usuarioGuardado = AuthService.obtenerUsuario()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (usuarioGuardado) setUsuario(usuarioGuardado)
  }, [])

  const navigate = useNavigate()
  const handleCerrarSesion = () => {
  AuthService.cerrarSesion()
  setUsuario(null)
  navigate('/')
}

  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f4faf9]">
        <div className="min-h-screen flex flex-col font-['DM_Sans',sans-serif] text-[#14302d] bg-[#f4faf9]">

          {/* ── Navbar ── */}
          <IonHeader
            className="ion-no-border relative bg-transparent shadow-none flex items-start justify-between px-6 pt-8 pb-4 md:px-12 md:pt-10"
            aria-label="Navegación principal"
          >
            <div className="w-28 md:w-36">
              <LogoSantoDomingo />
            </div>
            <div className="flex flex-col items-end gap-1.5 pt-1">
              <span className="flex items-center gap-1.5 text-[20px] font-semibold text-[#e05c5c]">
                <span className="w-2 h-2 rounded-full bg-[#e05c5c]" aria-hidden="true" />
                Principales Contactos
              </span>
              <div className="flex flex-col items-end gap-0.5 text-[13px] text-[#5a7e7b] font-light leading-relaxed">
                <span>Teléfonos Generales: +563 2238 1603 / +563 5220 4200</span>
                <span>Seguridad Ciudadana (24/7): 1458</span>
                <span>
                  Correo Electrónico:{' '}
                  <a href="mailto:contacto@santodomingo.cl" className="text-[#3aada0] no-underline hover:underline">
                    contacto@santodomingo.cl
                  </a>
                </span>
              </div>
            </div>
          </IonHeader>

          {/* ── Hero ── */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16 pt-8 text-center md:pb-24">

            <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#3aada0] mb-5 animate-[fadeUp_0.5s_ease_forwards_0.1s] opacity-0" aria-hidden="true">
              Sistema de citas médicas
            </p>

            <h1
              ref={headingRef} tabIndex={-1}
              aria-label="Tu salud, tu tiempo"
              className="font-['DM_Serif_Display',Georgia,serif] text-[42px] leading-[1.1] tracking-tight text-[#14302d] font-normal mb-4 outline-none md:text-[64px] animate-[fadeUp_0.5s_ease_forwards_0.2s] opacity-0"
            >
              <em className="italic text-[#3aada0]">Tu salud,</em>
              <br />
              <em className="italic text-[#2d8c81]">tu tiempo</em>
            </h1>

            <p className="text-[15px] font-light text-[#5a7e7b] leading-relaxed max-w-75 mb-12 animate-[fadeUp_0.5s_ease_forwards_0.3s] opacity-0">
              Agenda, consulta o modifica tu cita médica en minutos, sin complicaciones.
            </p>

            {/* ── Botones según sesión ── */}
            <div className="flex flex-col gap-3 w-full max-w-75 mb-10 animate-[fadeUp_0.5s_ease_forwards_0.4s] opacity-0" role="group">
              {usuario ? (
                <>
                  <div className="text-center mb-1">
                    <p className="text-[13px] text-[#7aa9a5]">Bienvenido,</p>
                    <p className="text-[17px] font-medium text-[#14302d]">{usuario.nombre_completo}</p>
                  </div>
                  <BotonPrimario to="/dashboard" variante="solido" fullWidth ariaLabel="Ver mi perfil y citas">
                    Mi perfil
                  </BotonPrimario>
                  <BotonPrimario variante="outline" fullWidth onClick={handleCerrarSesion} ariaLabel="Cerrar sesión">
                    Cerrar sesión
                  </BotonPrimario>
                </>
              ) : (
                <>
                  <BotonPrimario to="/register" variante="solido" fullWidth ariaLabel="Crear una cuenta nueva">
                    Registrarse
                  </BotonPrimario>
                  <BotonPrimario to="/login" variante="outline" fullWidth ariaLabel="Iniciar sesión en tu cuenta">
                    Iniciar sesión
                  </BotonPrimario>
                </>
              )}
            </div>

            {/* ── Separador ── */}
            {!usuario && (
              <div className="flex items-center gap-3 w-full max-w-70 mb-8 animate-[fadeUp_0.5s_ease_forwards_0.5s] opacity-0" aria-hidden="true">
                <span className="flex-1 h-px bg-[#c8e4e1]" />
                <span className="text-[12px] text-[#7aa9a5] tracking-wide">o si no tienes cuenta</span>
                <span className="flex-1 h-px bg-[#c8e4e1]" />
              </div>
            )}

            {/* ── Botones secundarios ── */}
            <div className="flex flex-row gap-4 w-full max-w-100 animate-[fadeUp_0.5s_ease_forwards_0.55s] opacity-0" role="group" aria-label="Opciones sin cuenta">
              <BotonPrimario to="/agendar" variante="outline" fullWidth ariaLabel="Agendar cita">
                {usuario ? 'Agendar una cita' : 'Agenda sin una cuenta'}
              </BotonPrimario>
              <BotonPrimario to="/consultar" variante="outline" fullWidth ariaLabel="Consultar el estado de tu cita">
                Consultar mi cita
              </BotonPrimario>
            </div>
          </main>

          {/* ── Footer ── */}
          <IonFooter className="ion-no-border relative bg-transparent shadow-none pb-10 text-center">
            <p className="text-[11px] text-[#a8c5c2] font-light">
              © {new Date().getFullYear()} Municipalidad Santo Domingo · Todos los derechos reservados
            </p>
          </IonFooter>
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </IonContent>
    </IonPage>
  )
}