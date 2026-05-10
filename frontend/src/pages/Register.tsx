import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { Link } from 'react-router-dom'
import LogoSantoDomingo from '../components/LogoSantoDomingo'
import InputTexto       from '../components/InputTexto'
import ContraInput      from '../components/ContraInput'
import BotonPrimario    from '../components/BotonPrimario'
import PageTransition   from '../components/PageTransition'
import BotonVolver      from '../components/BotonVolver'   

interface FormState {
  nombre:          string
  email:           string
  password:        string
  confirmPassword: string
}

interface Errores {
  nombre?:          string
  email?:           string
  password?:        string
  confirmPassword?: string
  terminos?:        string
}

function validar(form: FormState): Errores {
  const e: Errores = {}
  if (!form.nombre.trim())
    e.nombre = 'El nombre es obligatorio.'
  if (!form.email.trim())
    e.email = 'El correo es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = 'Ingresa un correo válido.'
  if (form.password.length < 8)
    e.password = 'La contraseña debe tener al menos 8 caracteres.'
  if (form.confirmPassword !== form.password)
    e.confirmPassword = 'Las contraseñas no coinciden.'
  return e
}

export default function Register() {
  const [form, setForm] = useState<FormState>({
    nombre:          '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [errores, setErrores] = useState<Errores>({})
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const nuevosErrores = validar(form)
    if (!aceptaTerminos) nuevosErrores.terminos = 'Debes aceptar los términos y condiciones.'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return
    // TODO: llamar al servicio de registro
    console.log('Registrando:', { ...form, region, comuna, aceptaTerminos })
  }

  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f4faf9]">

        {/* ── Botón volver — posición absoluta esquina superior izquierda ── */}
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
          {/* ── Transición de entrada ── */}
          <PageTransition variante="fadeUp" className="w-full max-w-sm">

            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <LogoSantoDomingo />
            </div>

            {/* Encabezado */}
            <h1 className="text-[28px] font-semibold text-[#14302d] mb-1">
              Crear cuenta
            </h1>
            <p className="text-[14px] text-[#7aa9a5] mb-7 font-light">
              Completa tus datos para registrarte
            </p>

            {/* Formulario */}
            <div className="flex flex-col gap-4">
              <InputTexto
                id="nombre"
                label="Nombre completo"
                type="text"
                autoComplete="name"
                value={form.nombre}
                onChange={set('nombre')}
                placeholder="Juan Pérez"
                required
                error={errores.nombre}
              />

              <InputTexto
                id="reg-email"
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                placeholder="ejemplo@correo.com"
                required
                error={errores.email}
              />

              <ContraInput
                id="reg-password"
                label="Contraseña"
                autoComplete="new-password"
                value={form.password}
                onChange={set('password')}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                error={errores.password}
              />

              <ContraInput
                id="confirm-password"
                label="Confirmar contraseña"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Repite tu contraseña"
                required
                error={errores.confirmPassword}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#4aa8d8] uppercase">
                    Región
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#d5dce6] outline-none focus:border-[#3aada0]"
                    placeholder="Ej: Valparaíso"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#4aa8d8] uppercase">
                    Comuna
                  </label>
                  <input
                    type="text"
                    value={comuna}
                    onChange={(e) => setComuna(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#d5dce6] outline-none focus:border-[#3aada0]"
                    placeholder="Ej: Santo Domingo"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 mt-2">
                <input
                  type="checkbox"
                  id="terminos"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#3aada0]"
                />
                <label htmlFor="terminos" className="text-[13px] text-[#7a8a9a] leading-snug">
                  Acepto los términos y condiciones de uso y el tratamiento de mis datos personales.
                </label>
              </div>

              {errores.terminos && (
                <p className="-mt-2 text-[12px] text-[#e05c5c]" role="alert">
                  {errores.terminos}
                </p>
              )}

              <BotonPrimario
                onClick={handleSubmit}
                variante="solido"
                fullWidth
                type="submit"
                className="py-5! text-base! tracking-wider! mt-2"
              >
                Crear cuenta
              </BotonPrimario>
            </div>

            {/* Link a login */}
            <p className="mt-6 text-[13px] text-center text-[#7aa9a5]">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-[#3aada0] font-medium hover:underline"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Inicia sesión
              </Link>
            </p>

          </PageTransition>
        </div>
      </IonContent>
    </IonPage>
  )
}