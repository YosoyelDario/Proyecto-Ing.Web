import type { ReactNode } from 'react'
import './PageTransition.css'

type Variante = 'fadeUp' | 'fadeIn' | 'fadeLeft'

interface PageTransitionProps {
  children: ReactNode
  variante?: Variante
  duracion?: number
  delay?: number
  className?: string
}

const varianteClasses: Record<Variante, string> = {
  fadeUp:   'pt-fadeUp',
  fadeIn:   'pt-fadeIn',
  fadeLeft: 'pt-fadeLeft',
}

export default function PageTransition({
  children,
  variante = 'fadeUp',
  duracion = 400, 
  delay = 0,
  className = '',
}: PageTransitionProps) {
  return (
    <div
      className={`${varianteClasses[variante]} ${className}`}
      style={{
        animationDuration: `${duracion}ms`,
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}