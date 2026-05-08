import React from 'react'

interface InputTextoProps {
  id: string
  label: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  error?: string
  hint?: string
  disabled?: boolean
  autoComplete?: string
  className?: string
}

export default function InputTexto({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  hint,
  disabled = false,
  autoComplete,
  className = '',
}: InputTextoProps) {
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

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        className={`
          w-full px-4 py-3.5 rounded-xl
          text-[15px] text-[#14302d]
          bg-white border
          placeholder:text-[#a8c5c2]
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-[#3aada0]/30 focus:border-[#3aada0]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-[#e05c5c] focus:ring-[#e05c5c]/20 focus:border-[#e05c5c]'
            : 'border-[#c8e4e1]'
          }
        `}
      />

      {error && (
        <p id={`${id}-error`} role="alert" className="text-[12px] text-[#e05c5c] mt-0.5">
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-[12px] text-[#7aa9a5] mt-0.5">
          {hint}
        </p>
      )}
    </div>
  )
}