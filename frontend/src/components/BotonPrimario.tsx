import React from 'react'
import { Link } from 'react-router-dom'

interface BotonPrimarioProps {
  children: React.ReactNode
  to?: string
  onClick?: (e?: React.FormEvent) => void
  variante?: 'solido' | 'outline' | 'texto'
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  ariaLabel?: string
  className?: string
}

const base = `
  inline-flex items-center justify-center gap-2
  px-6 py-4 rounded-xl
  text-[15px] font-medium tracking-wide
  no-underline
  transition-all duration-200
  active:scale-[0.97]
  focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#3aada0]
  disabled:opacity-50 disabled:pointer-events-none
  cursor-pointer
`

const variantes = {
  solido: `
    bg-[#3aada0] text-white border border-[#3aada0]
    hover:bg-[#2d9187] hover:border-[#2d9187] hover:shadow-md hover:shadow-[#3aada0]/25
    active:bg-[#267d72]
  `,
  outline: `
    bg-white text-[#14302d] border border-[#c8e4e1]
    hover:bg-[#e6f7f5] hover:border-[#3aada0] hover:text-[#3aada0]
    active:bg-[#d0eeeb]
  `,
  texto: `
    bg-transparent border-none
    text-[#14302d]
    underline decoration-[#3aada0] decoration-[1.5px] underline-offset-4
    hover:text-[#3aada0] hover:decoration-[2px]
    active:text-[#2d9187]
    px-0
  `,
}

export default function BotonPrimario({
  children,
  to,
  onClick,
  variante = 'solido',
  fullWidth = false,
  type = 'button',
  disabled = false,
  ariaLabel,
  className = '',
}: BotonPrimarioProps) {
  const clases = [
    base,
    variantes[variante],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ')

  const tapStyle = { WebkitTapHighlightColor: 'transparent' } as React.CSSProperties

  if (to) {
    return (
      <Link
        to={to}
        aria-label={ariaLabel}
        className={clases}
        style={tapStyle}
        // Evita que React Router herede colores de <a> del navegador
        tabIndex={disabled ? -1 : undefined}
        aria-disabled={disabled}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={clases}
      style={tapStyle}
    >
      {children}
    </button>
  )
}