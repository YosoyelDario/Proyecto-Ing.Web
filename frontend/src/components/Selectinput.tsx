import { useState } from 'react'

interface Opcion {
  value: string
  label: string
}

interface SelectInputProps {
  id: string
  label: string
  value: string
  onChange: (valor: string) => void
  opciones: Opcion[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function SelectInput({
  id,
  label,
  value,
  onChange,
  opciones,
  placeholder = 'Seleccionar...',
  required = false,
  disabled = false,
  className = '',
}: SelectInputProps) {
  const [tocado, setTocado] = useState(false)

  const tieneError = tocado && required && !value

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            if (tieneError) setTocado(true)
          }}
          onBlur={() => setTocado(true)}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-10 rounded-xl
            text-[15px] appearance-none
            bg-white border outline-none
            transition-colors duration-200
            focus:ring-2 focus:ring-[#3aada0]/20 focus:border-[#3aada0]
            disabled:bg-[#f7f9fc] disabled:text-[#a0a0a0] disabled:cursor-not-allowed
            ${!value ? 'text-[#a8c5c2]' : 'text-[#14302d]'}
            ${tieneError
              ? 'border-[#e05c5c] focus:border-[#e05c5c]'
              : 'border-[#d5dce6]'
            }
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {opciones.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#7aa9a5]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {tieneError && (
        <p className="text-[12px] text-[#e05c5c]" role="alert">
          Este campo es obligatorio.
        </p>
      )}
    </div>
  )
}