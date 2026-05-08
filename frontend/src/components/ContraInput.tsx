import { useState } from 'react'

interface ContraInputProps {
  id: string
  label: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  autoComplete?: string
  minLength?: number
  error?: string
  className?: string
}

export default function ContraInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  minLength,
  error,
  className = '',
}: ContraInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="text-[13px] font-medium text-[#2c4a47] tracking-wide"
      >
        {label}
        {required && (
          <span className="ml-1 text-[#e05c5c]" aria-hidden="true">*</span>
        )}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          className={`
            w-full px-4 py-3.5 pr-12 rounded-xl
            text-[15px] text-[#14302d]
            bg-white border
            placeholder:text-[#a8c5c2]
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-[#3aada0]/30 focus:border-[#3aada0]
            ${error
              ? 'border-[#e05c5c] focus:ring-[#e05c5c]/20 focus:border-[#e05c5c]'
              : 'border-[#c8e4e1]'
            }
          `}
        />

        {/* Botón mostrar/ocultar */}
        <button
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible(v => !v)}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-[#7aa9a5] hover:text-[#3aada0]
            transition-colors duration-150
            focus-visible:outline focus-visible:outline-[#3aada0] focus-visible:rounded
            p-1
          "
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {visible ? (
            /* Ojo tachado */
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            /* Ojo abierto */
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-[12px] text-[#e05c5c] mt-0.5">
          {error}
        </p>
      )}
    </div>
  )
}