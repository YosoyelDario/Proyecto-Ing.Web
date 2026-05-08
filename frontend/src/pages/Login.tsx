import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useNavigate } from 'react-router-dom'

//Email del admin, hardcodeado.
const ADMIN_EMAIL = "tuadmin@gmail.com" 

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // lógica de login aquí
    localStorage.setItem('userEmail', email.toLowerCase())
    
    if (email.toLowerCase() == ADMIN_EMAIL){
      navigate('/admin')
    } else{
      navigate('/home')
    }
  }
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-screen flex font-['DM_Sans',sans-serif]">

          {/* ── Panel izquierdo: formulario ── */}
          <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white md:px-16 md:max-w-130">

            {/* Logo */}
            <div className="mb-10 ml-35">
              <img
                src="/assets/SantoDomingoLogo.png"
                alt="MediCita logo"
                className="h-40 w-auto object-contain"
              />
            </div>

            {/* Encabezado */}
            <h1 className="text-[28px] font-semibold text-[#1a2332] mb-1 tracking-tight">
              Iniciar sesión
            </h1>
            <p className="text-[14px] text-[#7a8a9a] mb-8 font-light">
              Ingresa tus credenciales para continuar
            </p>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-[13px] font-medium text-[#1a2332]"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  className="
                    w-full px-4 py-3.5 rounded-xl
                    border border-[#d5dce6]
                    bg-white text-[#1a2332] text-[15px]
                    placeholder:text-[#aab4be]
                    outline-none
                    transition-colors duration-150
                    focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20
                  "
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-medium text-[#1a2332]"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="text-[12px] text-[#3aada0] font-medium bg-transparent border-none cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="
                      w-full px-4 py-3.5 pr-16 rounded-xl
                      border border-[#d5dce6]
                      bg-white text-[#1a2332] text-[15px]
                      placeholder:text-[#aab4be]
                      outline-none
                      transition-colors duration-150
                      focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20
                    "
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a8a9a] bg-transparent border-none cursor-pointer text-[12px] font-medium uppercase"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              {/* Botón principal */}
              <button
                type="submit"
                className="
                  w-full py-10 mt-0 rounded-lg
                  bg-[#3aada0] text-white
                  text-[30px] font-medium tracking-wide
                  border-none cursor-pointer
                  transition-all duration-150
                  shadow-md shadow-[#3aada0]/30 hover:shadow-lg
                  active:scale-[0.97] active:bg-[#2e968a] focus-visible:outline-2 focus-visible:outline-[#3aada0] focus-visible:outline-offset-2
                "
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Iniciar sesión
              </button>

            </form>

            {/* Footer del form */}
            <p className="mt-6 text-[13px] text-center text-[#7a8a9a]">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-[#3aada0] font-medium bg-transparent border-none cursor-pointer"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Regístrate
              </button>
            </p>

            <p className="mt-3 text-[13px] text-center text-[#7a8a9a]">
              ¿Prefieres no registrarte?{' '}
              <button
                onClick={() => navigate('/agendar')}
                className="text-[#3aada0] font-medium bg-transparent border-none cursor-pointer"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Agendar sin cuenta
              </button>
            </p>

          </div>

          {/* ── Panel derecho: imagen decorativa (solo desktop) ── */}
          <div
            className="hidden md:flex flex-1 relative overflow-hidden"
            style={{ backgroundColor: '#3aada0' }}
            aria-hidden="true"
          >
            {/* Círculos decorativos */}
            <div className="absolute top-12 right-12 w-16 h-16 rounded-full border border-white/20" />
            <div className="absolute bottom-16 right-24 w-10 h-10 rounded-full border border-white/20" />
            <div className="absolute top-1/3 left-8 w-6 h-6 rounded-full border border-white/20" />

            {/* Imagen principal */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <img
                src="/assets/hero.png"
                alt=""
                className="w-full max-w-105 h-auto object-cover rounded-2xl"
                style={{ aspectRatio: '4/5' }}
              />
            </div>
          </div>

        </div>
      </IonContent>
    </IonPage>
  )
  
}