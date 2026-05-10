import { useState } from 'react'
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
} from '@ionic/react'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import EmailInput     from '../components/Emailinput'
import PasswordInput  from '../components/PasswordInput'
import BotonPrimario  from '../components/BotonPrimario'
import BotonVolver    from '../components/BotonVolver'

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

    // Validación básica de email antes de enviar
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Ingresa un correo electrónico válido.')
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

      {/* ── Header Ionic con botón volver ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="bg-[#f4faf9] [--background:#f4faf9]">
          <IonButtons slot="start">
            <BotonVolver to="/" label="Inicio" />
          </IonButtons>
          <IonTitle className="text-[15px] font-medium text-[#14302d] tracking-wide [--color:#14302d]">
            
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-[#f4faf9]">
        <div
          className="
            min-h-full flex flex-col items-center justify-center
            px-6 py-12
            font-['DM_Sans',sans-serif]
            bg-[#f4faf9]
          "
        >
          <PageTransition variante="fadeUp" className="w-full max-w-sm">

            {/* ── Logo ── */}
            <div className="mb-8 flex justify-center">
              <img
                src="/assets/SantoDomingoLogo.png"
                alt="Municipalidad de Santo Domingo"
                className="h-28 w-auto object-contain"
              />
            </div>

            {/* ── Encabezado ── */}
            <h1 className="text-[28px] font-semibold text-[#3aada0]! mb-1">
              Iniciar sesión
            </h1>
            <p className="text-[14px] text-[#7aa9a5] mb-7 font-light">
              Ingresa tus credenciales para continuar
            </p>

            {/* ── Formulario ── */}
            <div className="flex flex-col gap-4">

              <EmailInput
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                {/* Link "¿Olvidaste tu contraseña?" alineado arriba a la derecha */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="text-[12px] text-[#3aada0] font-medium bg-transparent border-none cursor-pointer hover:underline"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <PasswordInput
                  id="login-password"
                  label="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  mostrarFortaleza={false}
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