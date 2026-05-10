import { useState } from 'react'

interface RutInputProps {
  id?: string
  label?: string
  value: string
  onChange: (valor: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Valida el dígito verificador del RUT chileno (módulo 11).
 */
function validarRutModulo11(rutCompleto: string): boolean {
  // Limpiar puntos para validar
  const limpio = rutCompleto.replace(/\./g, '')
  if (!/^[0-9]+-[0-9kK]$/.test(limpio)) return false

  const [cuerpo, dv] = limpio.split('-')
  let suma = 0
  let multiplo = 2

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += multiplo * parseInt(cuerpo.charAt(i), 10)
    multiplo = multiplo < 7 ? multiplo + 1 : 2
  }

  const dvEsperado = 11 - (suma % 11)
  const dvCalculado =
    dvEsperado === 10 ? 'k' : dvEsperado === 11 ? '0' : dvEsperado.toString()

  return dvCalculado === dv.toLowerCase()
}

/**
 * Formatea un RUT limpio (solo dígitos + K) al formato XX.XXX.XXX-X
 */
function formatearRut(valor: string): string {
  // Quitar todo excepto dígitos y K
  let limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase()
  if (limpio.length === 0) return ''

  // Separar cuerpo y dígito verificador
  const dv = limpio.slice(-1)
  const cuerpo = limpio.slice(0, -1)

  if (cuerpo.length === 0) return limpio

  // Agregar puntos al cuerpo
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${cuerpoConPuntos}-${dv}`
}

export default function RutInput({
  id = 'rut',
  label = 'RUT',
  value,
  onChange,
  placeholder = '12.345.678-9',
  required = false,
  disabled = false,
  className = '',
}: RutInputProps) {
  const [error, setError] = useState<string | null>(null)
  const [tocado, setTocado] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value

    // Filtrar: solo números, puntos, guión y K
    const filtrado = raw.replace(/[^0-9.\-kK]/g, '')

    onChange(filtrado)

    // Limpiar error mientras escribe
    if (error) setError(null)
  }

  const handleBlur = () => {
    setTocado(true)

    if (value.trim() === '') {
      if (required) setError('El RUT es obligatorio.')
      else setError(null)
      return
    }

    // Intentar formatear
    const limpio = value.replace(/[^0-9kK]/g, '')
    if (limpio.length < 2) {
      setError('RUT incompleto.')
      return
    }

    const formateado = formatearRut(limpio)
    onChange(formateado)

    // Validar formato
    if (!/^[0-9]{1,2}(\.[0-9]{3}){2}-[0-9kK]$/.test(formateado)) {
      setError('Formato inválido. Ej: 12.345.678-9')
      return
    }

    // Validar módulo 11
    if (!validarRutModulo11(formateado)) {
      setError('RUT inválido.')
      return
    }

    setError(null)
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
        type="text"
        inputMode="text"
        autoComplete="off"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={12}
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