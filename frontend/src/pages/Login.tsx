/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonCard,
  IonCardContent,
  IonText,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import EmailInput     from '../components/Emailinput'
import PasswordInput  from '../components/PasswordInput'
import BotonVolver from '../components/BotonVolver'
import BotonPrimario  from '../components/BotonPrimario'
import '../styles/Login.css'
import { AuthService } from '../services/AuthServices'


export default function Login() {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')

  const handleSubmit = async () => {
  if (!email.trim() || !password.trim()) {
    setError('Completa todos los campos.')
    return
  }

  try {
    const data = await AuthService.loginUsuario(email, password)
    AuthService.guardarSesion(data.token, data.usuario)

    if (data.usuario.is_admin) {
      navigate('/admin')
    } else {
      navigate('/')
    }
  } catch (error: any) {
    setError(error.message)
  }
}

  return (
    <IonPage className="login-page">

      {/* ── Header Ionic con botón volver ── */}
      <IonHeader className="ion-no-border login-header">
        <IonToolbar>
          <div className="absolute top-4 left-4 z-10">
            <BotonVolver to="/" label="Inicio" />
          </div>
          <IonTitle className="text-[15px] font-medium tracking-wide">
            
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f4faf9' } as React.CSSProperties}>
        <div
          className="
            min-h-full flex flex-col items-center justify-center
            px-6 py-12
            font-['DM_Sans',sans-serif]
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
            <IonText>
              <h1 className="text-[28px] font-semibold text-[#3aada0]! mb-1">
                Iniciar sesión
              </h1>
            </IonText>
            <IonNote className="login-subtitle">
              Ingresa tus credenciales para continuar
            </IonNote>

            {/* ── Formulario dentro de IonCard ── */}
            <IonCard className="login-card">
              <IonCardContent>
                <div className="flex flex-col gap-4">

                  <EmailInput
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    {/* Link "¿Olvidaste tu contraseña?" */}
                    <div className="flex items-center justify-end">
                      <IonButton fill="clear" size="small" className="login-forgot">
                        ¿Olvidaste tu contraseña?
                      </IonButton>
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
                    <IonText color="danger">
                      <p role="alert" className="text-[12px] -mt-1 m-0">
                        {error}
                      </p>
                    </IonText>
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
              </IonCardContent>
            </IonCard>

            {/* ── Footer del form ── */}
            <IonGrid className="login-footer-grid">
              <IonRow>
                <IonCol className="text-center">
                  <IonNote className="login-footer-text">
                    ¿No tienes cuenta?{' '}
                    <Link
                      to="/register"
                      className="text-[#3aada0] font-medium hover:underline"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      Regístrate
                    </Link>
                  </IonNote>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol className="text-center">
                  <IonNote className="login-footer-text">
                    ¿Prefieres no registrarte?{' '}
                    <Link
                      to="/agendar"
                      className="text-[#3aada0] font-medium hover:underline"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      Agendar sin cuenta
                    </Link>
                  </IonNote>
                </IonCol>
              </IonRow>
            </IonGrid>

          </PageTransition>
        </div>
      </IonContent>
    </IonPage>
  )
}