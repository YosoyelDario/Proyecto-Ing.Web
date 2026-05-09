import { useEffect, useRef } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import LogoSantoDomingo from '../components/LogoSantoDomingo'
import BotonPrimario from '../components/BotonPrimario'

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap'
    document.head.appendChild(link)
    headingRef.current?.focus()
  }, [])

  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f4faf9]">

        <div
          className="
            min-h-screen flex flex-col
            font-['DM_Sans',sans-serif]
            text-[#14302d]
            bg-[#f4faf9]
          "
        >

          {/* ── Navbar ── */}
          <nav
            className="flex items-center justify-between px-6 pt-14 pb-4 md:px-12 md:pt-10"
            aria-label="Navegación principal"
          >
            <LogoSantoDomingo />

            {/* Teléfonos de contacto */}
            <div className="flex flex-col items-end gap-0.5">
              <a
                href="tel:1458"
                className="flex items-center gap-1.5 text-[12px] font-medium text-[#e05c5c] no-underline"
                aria-label="Teléfono de emergencia 1458"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#e05c5c]" aria-hidden="true" />
                Emergencia: 1458
              </a>
              <span className="text-[11px] text-[#7aa9a5] font-light">
                +563 2238 1603 · +563 5220 4200
              </span>
            </div>
          </nav>

          {/* ── Hero ── */}
          <main
            className="
              flex-1 flex flex-col items-center justify-center
              px-6 pb-16 pt-8
              text-center
              md:pb-24
            "
          >

            {/* Eyebrow */}
            <p
              className="
                text-[10px] font-medium tracking-[0.16em] uppercase
                text-[#3aada0] mb-5
                animate-[fadeUp_0.5s_ease_forwards_0.1s] opacity-0
              "
              aria-hidden="true"
            >
              Sistema de citas médicas
            </p>

            {/* Heading */}
            <h1
              ref={headingRef}
              tabIndex={-1}
              aria-label="Tu salud, tu tiempo"
              className="
                font-['DM_Serif_Display',Georgia,serif]
                text-[42px] leading-[1.1] tracking-tight
                text-[#14302d] font-normal
                mb-4 outline-none
                md:text-[64px]
                animate-[fadeUp_0.5s_ease_forwards_0.2s] opacity-0
              "
            >
              <em className="italic text-[#3aada0]">Tu salud,</em>
              <br />
              <em className="italic text-[#2d8c81]">tu tiempo</em>
            </h1>

            {/* Subtítulo */}
            <p
              className="
                text-[15px] font-light text-[#5a7e7b] leading-relaxed
                max-w-75 mb-12
                animate-[fadeUp_0.5s_ease_forwards_0.3s] opacity-0
              "
            >
              Agenda, consulta o modifica tu cita médica en minutos, sin complicaciones.
            </p>

            {/* ── Botones principales ── */}
            <div
              className="
                flex flex-col gap-3 w-full max-w-75 mb-10
                animate-[fadeUp_0.5s_ease_forwards_0.4s] opacity-0
              "
              role="group"
              aria-label="Opciones de acceso"
            >
              <BotonPrimario
                to="/register"
                variante="solido"
                fullWidth
                ariaLabel="Crear una cuenta nueva"
              >
                Registrarse
              </BotonPrimario>

              <BotonPrimario
                to="/login"
                variante="outline"
                fullWidth
                ariaLabel="Iniciar sesión en tu cuenta"
              >
                Iniciar sesión
              </BotonPrimario>
            </div>

            {/* ── Separador ── */}
            <div
              className="flex items-center gap-3 w-full max-w-70 mb-8 animate-[fadeUp_0.5s_ease_forwards_0.5s] opacity-0"
              aria-hidden="true"
            >
              <span className="flex-1 h-px bg-[#c8e4e1]" />
              <span className="text-[12px] text-[#7aa9a5] tracking-wide">o si no tienes cuenta</span>
              <span className="flex-1 h-px bg-[#c8e4e1]" />
            </div>

            {/* ── Agendar sin cuenta ── */}
            {/* ── Agendar sin cuenta ── */}
<BotonPrimario
  to="/agendar"
  variante="texto"
  ariaLabel="Agendar cita sin crear cuenta"
  fullWidth
  className="py-4!" rounded-xl
>
  Agendar sin crear cuenta
</BotonPrimario>


<BotonPrimario
  to="/consultar"
  variante="outline"
  fullWidth
  ariaLabel="Consultar el estado de tu cita"
  className="animate-[fadeUp_0.5s_ease_forwards_0.45s] opacity-0"
>
  Consultar mi cita
</BotonPrimario>

          </main>

          {/* ── Footer ── */}
          <footer className="pb-10 text-center">
            <p className="text-[11px] text-[#a8c5c2] font-light">
              © {new Date().getFullYear()} Municipalidad Santo Domingo · Todos los derechos reservados
            </p>
          </footer>

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