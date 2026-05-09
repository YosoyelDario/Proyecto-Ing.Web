import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import InputTexto     from '../components/InputTexto'
import ContraInput    from '../components/ContraInput'
import BotonPrimario  from '../components/BotonPrimario'
import BotonVolver    from '../components/BotonVolver'    // ← nuevo

const ADMIN_EMAIL = 'tuadmin@gmail.com'

export default function Login() {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos.')
      return
    }
    setError('')
    localStorage.setItem('userEmail', email.toLowerCase())

    if (email.toLowerCase() === ADMIN_EMAIL) {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f4faf9]">

        {/* ── Botón volver — esquina superior izquierda ── */}
        <div className="absolute top-4 left-4 z-10 safe-area-top">
          <BotonVolver to="/" label="Inicio" />
        </div>

        <div
          className="
            min-h-screen flex flex-col items-center justify-center
            px-6 py-12
            font-['DM_Sans',sans-serif]
            bg-[#f4faf9]
          "
        >
          <PageTransition variante="fadeUp" className="w-full max-w-sm">

            {/* ── Logo imagen ── */}
            <div className="mb-8 flex justify-center">
              <img
                src="/assets/SantoDomingoLogo.png"
                alt="Municipalidad de Santo Domingo"
                className="h-28 w-auto object-contain"
              />
            </div>

            {/* ── Encabezado ── */}
            <h1 className="text-[28px] font-semibold text-[#14302d] mb-1">
              Iniciar sesión
            </h1>
            <p className="text-[14px] text-[#7aa9a5] mb-7 font-light">
              Ingresa tus credenciales para continuar
            </p>

            {/* ── Formulario ── */}
            <div className="flex flex-col gap-4">

              <InputTexto
                id="email"
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
              />

              <div className="flex flex-col gap-1.5">
                {/* Label con "¿Olvidaste tu contraseña?" alineado a la derecha */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#2c4a47] tracking-wide">
                    Contraseña <span className="text-[#e05c5c]">*</span>
                  </span>
                  <button
                    type="button"
                    className="text-[12px] text-[#3aada0] font-medium bg-transparent border-none cursor-pointer hover:underline"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <ContraInput
                  id="password"
                  label=""
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Error global */}
              {error && (
                <p role="alert" className="text-[12px] text-[#e05c5c] -mt-1">
                  {error}
                </p>
              )}

              <BotonPrimario
                onClick={handleSubmit}
                variante="solido"
                fullWidth
                type="submit"
                className="py-5! text-base! tracking-wider! mt-2"
              >
                Iniciar sesión
              </BotonPrimario>
            </div>

            {/* ── Footer del form ── */}
            <p className="mt-6 text-[13px] text-center text-[#7aa9a5]">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-[#3aada0] font-medium hover:underline"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Regístrate
              </Link>
            </p>

            <p className="mt-3 text-[13px] text-center text-[#7aa9a5]">
              ¿Prefieres no registrarte?{' '}
              <Link
                to="/agendar"
                className="text-[#3aada0] font-medium hover:underline"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Agendar sin cuenta
              </Link>
            </p>

          </PageTransition>
        </div>
      </IonContent>
    </IonPage>
  )
}