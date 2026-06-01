import { IonPage, IonContent, IonCard } from '@ionic/react'
import { useLocation } from 'react-router-dom'
import BotonVolver    from '../components/BotonVolver'
import BotonPrimario  from '../components/BotonPrimario'
import FilaDetalle    from '../components/FilaDetalle'

interface CitaDetalle {
  codigo_referencia: string
  especialidad:      string
  medico:            string
  fecha:             string
  hora:              string
  rut:               string
  nombre:            string
  email:             string
}

export default function ConfirmacionCita() {
  const location = useLocation()
  const state    = location.state as { cita?: CitaDetalle } | null

  // Si llegó por navigate con state correcto, usarlo; si no, datos de ejemplo
  const cita: CitaDetalle = state?.cita ?? {
    codigo_referencia: '--------',
    especialidad:      'Medicina General',
    medico:            'Dr. Roberto Sánchez',
    fecha:             '2026-01-01',
    hora:              '09:00',
    rut:               '--------',
    nombre:            '--------',
    email:             '--------',
  }

  const fechaFormateada = new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const detalles = [
    { label: 'Código',      valor: cita.codigo_referencia, icono: '' },
    { label: 'Especialidad', valor: cita.especialidad,     icono: '' },
    { label: 'Médico',       valor: cita.medico,           icono: '' },
    { label: 'Fecha',        valor: fechaFormateada,        icono: '' },
    { label: 'Hora',         valor: cita.hora,              icono: '' },
    { label: 'RUT',          valor: cita.rut,               icono: '' },
    { label: 'Nombre',       valor: cita.nombre,            icono: '' },
    { label: 'Correo',       valor: cita.email,             icono: '' },
  ]

  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f4faf9]">
        <div className="absolute top-4 left-4 z-10 safe-area-top">
          <BotonVolver to="/" label="Inicio" />
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16 font-['DM_Sans',sans-serif]"
          style={{ animation: 'fadeUp 0.4s ease both' }}>
          <div className="w-full max-w-md">
            <IonCard className="m-0 bg-white rounded-2xl shadow-sm border border-[#d5dce6] overflow-hidden">

              <div className="bg-[#3aada0] px-8 py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4"
                  style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}
                    strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h1 className="text-[22px] font-semibold text-white! tracking-tight mb-1">
                  ¡Cita confirmada!
                </h1>
                <p className="text-[14px] text-white/70 font-light">
                  Tu hora médica fue agendada exitosamente.
                </p>
              </div>

              <div className="flex items-center justify-between px-6 py-3.5 bg-[#f0faf9] border-b border-[#d5dce6]">
                <span className="text-[12px] font-medium text-[#7aa9a5] uppercase tracking-wider">
                  Código de cita
                </span>
                <span className="text-[15px] font-semibold text-[#3aada0] tracking-widest font-mono">
                  {cita.codigo_referencia}
                </span>
              </div>

              <div className="px-6 pt-2 pb-1">
                {detalles.map(d => (
                  <FilaDetalle key={d.label} {...d} />
                ))}
              </div>

              <div className="mx-6 mb-6 mt-3 px-4 py-3.5 rounded-xl bg-[#f0faf9] border border-[#b5ddd9] flex items-start gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#a4c9c6" strokeWidth={2}
                  strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mt-0.5 shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <p className="text-[12px] text-[#5a9a95] leading-relaxed">
                  Guarda tu código de cita:{' '}
                  <span className="font-semibold text-[#3aada0]">{cita.codigo_referencia}</span>.
                  Lo necesitarás para consultar, modificar o cancelar tu hora.
                </p>
              </div>

              <div className="px-6 pb-7 flex flex-col gap-3">
                <BotonPrimario to="/" fullWidth>Volver al inicio</BotonPrimario>
                <BotonPrimario to="/consultar" variante="outline" fullWidth>Consultar mi cita</BotonPrimario>
              </div>

            </IonCard>
          </div>
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0); }
            to   { transform: scale(1); }
          }
        `}</style>
      </IonContent>
    </IonPage>
  )
}
