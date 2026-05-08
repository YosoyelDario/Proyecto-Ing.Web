interface LogoSantoDomingoProps {
  /** Tamaño de la imagen (clase h-*). Default: 'h-20' */
  tamano?: string
  className?: string
}

export default function LogoSantoDomingo({
  tamano = 'h-20',
  className = '',
}: LogoSantoDomingoProps) {
  return (
    <img
      src="/assets/SantoDomingoLogo.png"
      alt="Municipalidad de Santo Domingo"
      className={`${tamano} w-auto object-contain ${className}`}
    />
  )
}