import { useState } from 'react'

interface PasswordInputProps {
  id?: string
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  minLength?: number
  /** Si se pasa, valida que coincida con este valor (modo "confirmar contraseña") */
  confirmar?: string
  /** Mostrar indicador de fortaleza (default: true, se desactiva automáticamente en modo confirmar) */
  mostrarFortaleza?: boolean
  className?: string
}

function evaluarFortaleza(password: string): { nivel: number; texto: string; color: string } {
  if (password.length === 0) return { nivel: 0, texto: '', color: '' }
  if (password.length < 8) return { nivel: 1, texto: 'Muy corta', color: '#e05c5c' }

  let puntos = 0
  if (/[a-z]/.test(password)) puntos++
  if (/[A-Z]/.test(password)) puntos++
  if (/[0-9]/.test(password)) puntos++
  if (/[^a-zA-Z0-9]/.test(password)) puntos++
  if (password.length >= 12) puntos++

  if (puntos <= 2) return { nivel: 2, texto: 'Débil', color: '#e8a838' }
  if (puntos <= 3) return { nivel: 3, texto: 'Aceptable', color: '#3aada0' }
  return { nivel: 4, texto: 'Fuerte', color: '#2d8c81' }
}

export default function PasswordInput({
  id = 'password',
  label = 'Contraseña',
  value,
  onChange,
  placeholder = 'Mínimo 8 caracteres',
  required = false,
  disabled = false,
  minLength = 8,
  confirmar,
  mostrarFortaleza,
  className = '',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tocado, setTocado] = useState(false)

  const esConfirmacion = confirmar !== undefined
  const debeMotrarFortaleza = mostrarFortaleza ?? (!esConfirmacion)
  const fortaleza = debeMotrarFortaleza ? evaluarFortaleza(value) : null

  const handleBlur = () => {
    setTocado(true)

    if (value.trim() === '') {
      if (required) setError(esConfirmacion ? 'Confirma tu contraseña.' : 'La contraseña es obligatoria.')
      else setError(null)
      return
    }

    if (!esConfirmacion && value.length < minLength) {
      setError(`Debe tener al menos ${minLength} caracteres.`)
      return
    }

    if (esConfirmacion && value !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setError(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e)
    if (error) setError(null)
  }

  const tieneError = tocado && !!error

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete={esConfirmacion ? 'new-password' : 'new-password'}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          minLength={minLength}
          className={`
            w-full px-4 py-3 pr-12 rounded-xl border bg-white text-[15px] outline-none
            transition-colors duration-200
            disabled:bg-[#f7f9fc] disabled:text-[#a0a0a0]
            ${tieneError
              ? 'border-[#e05c5c] focus:border-[#e05c5c]'
              : 'border-[#d5dce6] focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20'
            }
          `}
        />

        {/* Botón mostrar/ocultar */}
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-[#7aa9a5] hover:text-[#3aada0]
            bg-transparent border-none cursor-pointer
            p-1 transition-colors
          "
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {visible ? (
            /* Ojo abierto */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            /* Ojo cerrado */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>
      </div>

      {/* Indicador de fortaleza */}
      {debeMotrarFortaleza && value.length > 0 && fortaleza && (
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex gap-1 flex-1">
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: n <= fortaleza.nivel ? fortaleza.color : '#e0e7ed',
                }}
              />
            ))}
          </div>
          <span
            className="text-[11px] font-medium whitespace-nowrap"
            style={{ color: fortaleza.color }}
          >
            {fortaleza.texto}
          </span>
        </div>
      )}

      {tieneError && (
        <p className="text-[12px] text-[#e05c5c]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}