import { useState } from 'react'

interface EmailInputProps {
  id?: string
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Valida que el email tenga formato válido con dominio real:
 * usuario@dominio.ext  (ext = com, cl, org, net, etc.)
 */
function validarEmail(email: string): string | null {
  if (email.trim() === '') return null

  // Debe tener @
  if (!email.includes('@')) return 'Debe incluir @. Ej: ejemplo@correo.com'

  const partes = email.split('@')
  if (partes.length !== 2) return 'Formato inválido.'

  const [usuario, dominio] = partes

  if (!usuario.trim()) return 'Falta el nombre de usuario antes del @.'
  if (!dominio.trim()) return 'Falta el dominio después del @.'

  // Dominio debe tener al menos un punto con extensión
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(dominio)) {
    return 'Dominio inválido. Ej: correo.com, mail.cl'
  }

  // Validación general del formato completo
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return 'Correo electrónico inválido.'
  }

  return null
}

export default function EmailInput({
  id = 'email',
  label = 'Correo electrónico',
  value,
  onChange,
  placeholder = 'ejemplo@correo.com',
  required = false,
  disabled = false,
  className = '',
}: EmailInputProps) {
  const [error, setError] = useState<string | null>(null)
  const [tocado, setTocado] = useState(false)

  const handleBlur = () => {
    setTocado(true)

    if (value.trim() === '') {
      if (required) setError('El correo es obligatorio.')
      else setError(null)
      return
    }

    setError(validarEmail(value))
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
      <input
        id={id}
        name={id}
        type="email"
        autoComplete="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl border bg-white text-[15px] outline-none
          transition-colors duration-200
          disabled:bg-[#f7f9fc] disabled:text-[#a0a0a0]
          ${tieneError
            ? 'border-[#e05c5c] focus:border-[#e05c5c]'
            : 'border-[#d5dce6] focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20'
          }
        `}
      />
      {tieneError && (
        <p className="text-[12px] text-[#e05c5c]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}