interface FilaDetalleProps {
  icono: string
  label: string
  valor: string
}

/**
 * Fila de detalle reutilizable para mostrar datos de una cita.
 * Usada en ConfirmacionCita, ConsultarCita y ModificarCita.
 */
export default function FilaDetalle({ icono, label, valor }: FilaDetalleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#eef4f9] last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-[18px] leading-none w-7 text-center">{icono}</span>
        <span className="text-[13px] font-medium text-[#7a8a9a] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-[14px] font-medium text-[#1a2332] text-right max-w-[55%] leading-snug">
        {valor}
      </span>
    </div>
  )
}