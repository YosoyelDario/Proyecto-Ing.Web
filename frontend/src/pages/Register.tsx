import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPass, setShowPass] = useState(false)

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // lógica de registro aquí
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-screen flex font-['DM_Sans',sans-serif]">

          {/* ── Panel derecho: imagen (solo desktop, va primero en DOM para orden visual) ── */}
          <div
            className="hidden md:flex flex-1 relative overflow-hidden"
            style={{ backgroundColor: '#3aada0' }}
            aria-hidden="true"
          >
            <div className="absolute top-16 left-12 w-16 h-16 rounded-full border border-white/20" />
            <div className="absolute bottom-20 left-20 w-10 h-10 rounded-full border border-white/20" />
            <div className="absolute top-1/2 right-8 w-6 h-6 rounded-full border border-white/20" />

            <div className="absolute inset-0 flex items-center justify-center p-12">
              <img
                src="/assets/hero.png"
                alt=""
                className="w-full max-w-105 h-auto object-cover rounded-2xl"
                style={{ aspectRatio: '4/5' }}
              />
            </div>
          </div>

          {/* ── Panel derecho: formulario ── */}
          <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white md:px-16 md:max-w-130">

            {/* Logo */}
            <div className="mb-8">
              <img
                src="/assets/logo.png"
                alt="MediCita logo"
                className="h-16 w-auto object-contain"
              />
            </div>

            <h1 className="text-[28px] font-semibold text-[#1a2332] mb-1 tracking-tight">
              Crear cuenta
            </h1>
            <p className="text-[14px] text-[#7a8a9a] mb-7 font-light">
              Completa tus datos para registrarte
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nombre" className="text-[13px] font-medium text-[#1a2332]">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  autoComplete="name"
                  value={form.nombre}
                  onChange={set('nombre')}
                  placeholder="Juan Pérez"
                  required
                  className="
                    w-full px-4 py-3.5 rounded-xl
                    border border-[#d5dce6]
                    bg-white text-[#1a2332] text-[15px]
                    placeholder:text-[#aab4be] outline-none
                    transition-colors duration-150
                    focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20
                  "
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-email" className="text-[13px] font-medium text-[#1a2332]">
                  Correo electrónico
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="ejemplo@correo.com"
                  required
                  className="
                    w-full px-4 py-3.5 rounded-xl
                    border border-[#d5dce6]
                    bg-white text-[#1a2332] text-[15px]
                    placeholder:text-[#aab4be] outline-none
                    transition-colors duration-150
                    focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20
                  "
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-password" className="text-[13px] font-medium text-[#1a2332]">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    className="
                      w-full px-4 py-3.5 pr-16 rounded-xl
                      border border-[#d5dce6]
                      bg-white text-[#1a2332] text-[15px]
                      placeholder:text-[#aab4be] outline-none
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

              {/* Confirmar contraseña */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-password" className="text-[13px] font-medium text-[#1a2332]">
                  Confirmar contraseña
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Repite tu contraseña"
                  required
                  className="
                    w-full px-4 py-3.5 rounded-xl
                    border border-[#d5dce6]
                    bg-white text-[#1a2332] text-[15px]
                    placeholder:text-[#aab4be] outline-none
                    transition-colors duration-150
                    focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20
                  "
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                className="
                  w-full py-4 mt-1 rounded-xl
                  bg-[#3aada0] text-white
                  text-[15px] font-medium tracking-wide
                  border-none cursor-pointer
                  transition-all duration-150
                  active:scale-[0.97] active:bg-[#2e968a]
                  focus-visible:outline focus-visible:outline-[#3aada0] focus-visible:outline-offset-2
                "
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Crear cuenta
              </button>

            </form>

            <p className="mt-5 text-[13px] text-center text-[#7a8a9a]">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#3aada0] font-medium bg-transparent border-none cursor-pointer"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Inicia sesión
              </button>
            </p>

          </div>

        </div>
      </IonContent>
    </IonPage>
  )
}