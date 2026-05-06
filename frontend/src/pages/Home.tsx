import { useEffect, useRef } from 'react'
import {
  IonPage,
  IonContent,
} from '@ionic/react'
import { Link } from 'react-router-dom'

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap'
    document.head.appendChild(link)

    headingRef.current?.focus()
  }, [])

  return (
    <IonPage>
      {/*
        IonContent maneja scroll nativo, safe-areas (notch, home bar)
        y overscroll de iOS automáticamente.
        fullscreen=true permite que el contenido vaya detrás del status bar.
      */}
      <IonContent fullscreen className="bg-[#f7f9fc]">

        <div
          className="
            min-h-screen flex flex-col
            font-['DM_Sans',sans-serif]
            text-[#1a2332]
            bg-[#f7f9fc]
          "
        >

          {/* ── Navbar ── */}
          <nav
            className="flex items-center justify-between px-6 pt-14 pb-4 md:px-12 md:pt-10"
            aria-label="Navegación principal"
          >
            <a
              href="/"
              className="flex items-center gap-2 text-[15px] font-medium tracking-wide text-[#1a2332] no-underline"
              aria-label="MediCita — inicio"
            >
              <span className="w-2 h-2 rounded-full bg-[#409dcc]" aria-hidden="true" />
              MediCita
            </a>
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
                text-[10px] font-medium tracking-[0.14em] uppercase
                text-[#4aa8d8] mb-5
                animate-[fadeUp_0.5s_ease_forwards_0.1s] opacity-0
              "
              aria-hidden="true"
            >
              Sistema de citas médicas
            </p>

            {/* Heading principal */}
            <h1
              ref={headingRef}
              tabIndex={-1}
              aria-label="Tu salud, tu tiempo"
              className="
                font-['DM_Serif_Display',Georgia,serif]
                text-[42px] leading-[1.1] tracking-tight
                text-[#002463] font-normal
                mb-4 outline-none
                md:text-[64px]
                animate-[fadeUp_0.5s_ease_forwards_0.2s] opacity-0
              "
            >
              Tu salud,
              <br />
              <em className="italic text-[#4aa8d8]">tu tiempo.</em>
            </h1>

            {/* Subtítulo */}
            <p
              className="
                text-[15px] font-light text-[#5a6a7e] leading-relaxed
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
              {/* Registrarse — primario azul */}
              <Link
                to="/register"
                aria-label="Crear una cuenta nueva"
                className="
                  w-full py-4 rounded-xl
                  bg-[#4aa8d8] text-white
                  text-[15px] font-medium tracking-wide
                  border border-[#4aa8d8]
                  transition-all duration-150
                  active:scale-[0.97] active:bg-[#3797c8]
                  focus-visible:outline focus-visible:outline-[#4aa8d8] focus-visible:outline-offset-2
                "
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Registrarse
              </Link>

              {/* Iniciar sesión — outline */}
              <Link
                to="/login"
                aria-label="Iniciar sesión en tu cuenta"
                className="
                  w-full py-4 rounded-xl
                  bg-white text-[#1a2332]
                  text-[15px] font-medium tracking-wide
                  border border-[#d5dce6]
                  transition-all duration-150
                  active:scale-[0.97] active:bg-[#eef4f9]
                  focus-visible:outline focus-visible:outline-[#4aa8d8] focus-visible:outline-offset-2
                "
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Iniciar sesión
              </Link>
            </div>s

            {/* ── Separador ── */}
            <div
              className="flex items-center gap-3 w-full max-w-70 mb-8 animate-[fadeUp_0.5s_ease_forwards_0.5s] opacity-0"
              aria-hidden="true"
            >
              <span className="flex-1 h-px bg-[#d5dce6]" />
              <span className="text-[12px] text-[#8a99ab] tracking-wide">o si prefieres</span>
              <span className="flex-1 h-px bg-[#d5dce6]" />
            </div>

            {/* ── Agendar sin cuenta — texto-enlace grande ── */}
            <Link
              to="/agendar"
              aria-label="Agendar una cita médica sin necesidad de crear una cuenta"
              className="
                font-['DM_Serif_Display',Georgia,serif]
                italic text-[22px] text-[#1a2332]
                bg-transparent border-none
                underline decoration-[#4aa8d8] decoration-[1.5px] underline-offset-4
                transition-colors duration-200
                active:text-[#4aa8d8]
                focus-visible:outline focus-visible:outline-[#4aa8d8] focus-visible:outline-offset-4 focus-visible:rounded
                cursor-pointer
                animate-[fadeUp_0.5s_ease_forwards_0.55s] opacity-0
                md:text-[26px]
              "
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Agendar sin crear cuenta →
            </Link>

          </main>

          {/* ── Footer ── */}
          <footer className="pb-10 text-center">
            <p className="text-[11px] text-[#a0adb8] font-light">
              © {new Date().getFullYear()} MediCita · Todos los derechos reservados
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