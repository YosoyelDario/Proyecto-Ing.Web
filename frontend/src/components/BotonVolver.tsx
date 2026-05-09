import { useNavigate } from 'react-router-dom'

interface BotonVolverProps {
  /** Ruta destino. Si no se pasa, usa history.goBack() */
  to?: string
  /** Texto opcional junto al ícono */
  label?: string
  /** Clases extra */
  className?: string
}

/**
 * Botón "volver" para la esquina superior izquierda.
 * Usa el mismo lenguaje visual que el resto de la app
 * (paleta teal, DM Sans, tap-highlight limpio).
 */
export default function BotonVolver({
  to,
  label,
  className = '',
}: BotonVolverProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Volver"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      className={`
        group
        flex items-center gap-1.5
        text-[#3aada0]
        font-['DM_Sans',sans-serif] font-medium text-[15px]
        transition-opacity duration-150 active:opacity-60
        select-none
        ${className}
      `}
    >
      {/* Flecha SVG — sin dependencia de librerías de íconos */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="
          w-5.5 h-5.5
          transition-transform duration-150
          group-hover:-translate-x-0.5
        "
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>

      {label && <span>{label}</span>}
    </button>
  )
}