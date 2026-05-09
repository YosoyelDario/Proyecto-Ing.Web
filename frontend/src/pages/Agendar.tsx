import { useState, useEffect, useMemo } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useNavigate } from 'react-router-dom'
import BotonPrimario from '../components/BotonPrimario'

interface Medic {
  id: string
  nombre: string
  especialidad: string
}

interface AppointmentForm {
  especialidad: string
  medicoId: string
  fecha: string
  hora: string
  rut: string
  nombre: string
  email: string
}

const ESPECIALIDADES = ['Medicina General', 'Pediatría', 'Dermatología']

const MEDICOS: Medic[] = [
  { id: 'm1', nombre: 'Dr. Roberto Sánchez', especialidad: 'Medicina General' },
  { id: 'm2', nombre: 'Dra. Ana López',      especialidad: 'Medicina General' },
  { id: 'm3', nombre: 'Dr. Carlos Vega',     especialidad: 'Pediatría' },
  { id: 'm4', nombre: 'Dra. María Paz',      especialidad: 'Dermatología' },
]

const HORARIOS_DISPONIBLES: Record<string, string[]> = {
  'm1_2026-05-10': ['09:00', '09:30', '11:00'],
  'm1_2026-05-11': ['14:00', '15:30'],
  'm3_2026-05-10': ['10:00', '10:30'],
}

/* ─── CalendarPicker ────────────────────────────────────────────────────── */

interface CalendarPickerProps {
  value: string       // 'YYYY-MM-DD' o ''
  minDate: string     // 'YYYY-MM-DD'
  onChange: (date: string) => void
  disabled?: boolean
}

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function CalendarPicker({ value, minDate, onChange, disabled }: CalendarPickerProps) {
  const today = new Date()

  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  // Sincronizar vista cuando llega un valor externo
  useEffect(() => {
    if (!value) return

    const [y, m] = value.split('-').map(Number)
    const timer = window.setTimeout(() => {
      setViewYear(y)
      setViewMonth(m - 1)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [value])

  const [minY, minM, minD] = minDate ? minDate.split('-').map(Number) : [0, 0, 0]

  const isDayDisabled = (day: number) => {
    if (viewYear < minY) return true
    if (viewYear === minY && viewMonth + 1 < minM) return true
    if (viewYear === minY && viewMonth + 1 === minM && day < minD) return true
    return false
  }

  const canGoPrev = () => {
    if (viewYear > minY) return true
    if (viewYear === minY && viewMonth + 1 > minM) return true
    return false
  }

  const prevMonth = () => {
    if (!canGoPrev()) return
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (day: number) => {
    if (disabled || isDayDisabled(day)) return
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${viewYear}-${mm}-${dd}`)
  }

  // Primer día del mes en base lunes (0=Lun … 6=Dom)
  const firstWeekDay = ((new Date(viewYear, viewMonth, 1).getDay() + 6) % 7)
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstWeekDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selParts = value ? value.split('-').map(Number) : null
  const isSelected = (day: number) =>
    selParts !== null &&
    selParts[0] === viewYear &&
    selParts[1] === viewMonth + 1 &&
    selParts[2] === day

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth()    === viewMonth &&
    today.getDate()     === day

  return (
    <div className={`rounded-2xl border border-[#d5dce6] bg-white overflow-hidden transition-opacity duration-300 select-none ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>

      {/* Header navegación */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef4f9]">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev()}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[18px] text-[#7a8a9a] hover:bg-[#f7f9fc] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          aria-label="Mes anterior"
        >
          ‹
        </button>

        <span className="text-[14px] font-semibold text-[#1a2332] tracking-wide">
          {MESES[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[18px] text-[#7a8a9a] hover:bg-[#f7f9fc] transition-colors"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      {/* Cabecera días de la semana */}
      <div className="grid grid-cols-7 border-b border-[#eef4f9]">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-widest text-[#a0adb8]">
            {d}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7 gap-y-1 p-3">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} />

          const dis = isDayDisabled(day)
          const sel = isSelected(day)
          const tod = isToday(day)

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              disabled={dis}
              className={`
                mx-auto w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-medium transition-all duration-100
                ${sel
                  ? 'bg-[#4aa8d8] text-white'
                  : tod && !dis
                    ? 'border border-[#4aa8d8] text-[#4aa8d8] hover:bg-[#eaf5fb]'
                    : dis
                      ? 'text-[#c8d3dc] cursor-not-allowed'
                      : 'text-[#1a2332] hover:bg-[#eaf5fb] hover:text-[#4aa8d8]'
                }
              `}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-5 px-4 pb-3 text-[11px] text-[#a0adb8]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#4aa8d8] inline-block" /> Seleccionado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-[#4aa8d8] inline-block" /> Hoy
        </span>
      </div>
    </div>
  )
}

/* ─── Componente principal Agendar ──────────────────────────────────────── */

export default function Agendar() {
  const navigate = useNavigate()

  const [form, setForm] = useState<AppointmentForm>({
    especialidad: '',
    medicoId: '',
    fecha: '',
    hora: '',
    rut: '',
    nombre: '',
    email: '',
  })

  const [rutError, setRutError]             = useState<boolean>(false)
  const [availableHours, setAvailableHours] = useState<string[]>([])

  // FIX 1 — minDate como useMemo, sin ningún setState dentro de useEffect
  const minDate = useMemo(() => {
    const t  = new Date()
    const mm = String(t.getMonth() + 1).padStart(2, '0')
    const dd = String(t.getDate()).padStart(2, '0')
    return `${t.getFullYear()}-${mm}-${dd}`
  }, [])

  // FIX 2 — prefill de sesión con setTimeout para no llamar setState síncronamente
  useEffect(() => {
    const isAuthenticated = false
    if (isAuthenticated) {
      setTimeout(() => {
        setForm(prev => ({
          ...prev,
          rut: '12345678-5',
          nombre: 'Usuario Autenticado',
          email: 'usuario@correo.com',
        }))
      }, 0)
    }
  }, [])

  // FIX 3 — horarios con setTimeout + prev.hora para evitar stale closure
  useEffect(() => {
    setTimeout(() => {
      if (form.medicoId && form.fecha) {
        const key   = `${form.medicoId}_${form.fecha}`
        const horas = HORARIOS_DISPONIBLES[key] || []
        setAvailableHours(horas)
        setForm(prev => ({
          ...prev,
          hora: horas.includes(prev.hora) ? prev.hora : '',
        }))
      } else {
        setAvailableHours([])
        setForm(prev => ({ ...prev, hora: '' }))
      }
    }, 0)
  }, [form.medicoId, form.fecha])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'especialidad') { next.medicoId = ''; next.fecha = ''; next.hora = '' }
      if (name === 'medicoId')     { next.fecha = ''; next.hora = '' }
      return next
    })
  }

  const handleFechaChange = (date: string) => {
    setForm(prev => ({ ...prev, fecha: date, hora: '' }))
  }

  const validateRutModulo11 = (rutCompleto: string): boolean => {
    if (!/^[0-9]+[-]{1}[0-9kK]{1}$/.test(rutCompleto)) return false
    const [cuerpo, dv] = rutCompleto.split('-')
    let suma = 0, multiplo = 2
    for (let i = 1; i <= cuerpo.length; i++) {
      suma += multiplo * parseInt(cuerpo.charAt(cuerpo.length - i), 10)
      multiplo = multiplo < 7 ? multiplo + 1 : 2
    }
    const dvE = 11 - (suma % 11)
    const dvC = dvE === 10 ? 'k' : dvE === 11 ? '0' : dvE.toString()
    return dvC === dv.toLowerCase()
  }

  const handleRutBlur = () => {
    if (form.rut.trim() === '') { setRutError(false); return }
    setRutError(!validateRutModulo11(form.rut))
  }

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (rutError) return

  const medicoSeleccionado = MEDICOS.find(m => m.id === form.medicoId)

  navigate('/confirmacion', {
    state: {
      cita: {
        especialidad: form.especialidad,
        medico:       medicoSeleccionado?.nombre ?? '',
        fecha:        form.fecha,
        hora:         form.hora,
        rut:          form.rut,
        nombre:       form.nombre,
        email:        form.email,
      },
    },
  })
}

  const medicosFiltrados = MEDICOS.filter(m => m.especialidad === form.especialidad)
  const isFormComplete   = Object.values(form).every(v => v.trim() !== '') && !rutError

  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f7f9fc]">
        <div className="min-h-screen flex flex-col items-center py-12 px-6 font-['DM_Sans',sans-serif] text-[#1a2332]">

          <nav className="w-full max-w-150 flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-[14px] font-medium text-[#7a8a9a] bg-transparent border-none cursor-pointer"
            >
              ← Volver
            </button>
            <span className="text-[15px] font-medium tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4aa8d8]" /> MediCita
            </span>
          </nav>

          <main className="w-full max-w-150 bg-white rounded-2xl shadow-sm border border-[#d5dce6] p-8 md:p-10">
            <h1 className="text-[28px] font-semibold mb-2 tracking-tight">Agendar Cita</h1>
            <p className="text-[14px] text-[#7a8a9a] mb-8 font-light">
              Siga los pasos para programar su atención médica.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

              {/* Paso 1 */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="especialidad" className="text-[13px] font-medium text-[#4aa8d8] uppercase tracking-wider">
                    1. Seleccione Especialidad
                  </label>
                  <select
                    id="especialidad" name="especialidad"
                    value={form.especialidad} onChange={handleInputChange} required
                    className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#4aa8d8] focus:ring-2 focus:ring-[#4aa8d8]/20 appearance-none"
                  >
                    <option value="" disabled>Elegir especialidad...</option>
                    {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                  </select>
                </div>

                <div className={`flex flex-col gap-1.5 transition-opacity duration-300 ${form.especialidad ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label htmlFor="medicoId" className="text-[13px] font-medium text-[#4aa8d8] uppercase tracking-wider">
                    2. Seleccione Médico
                  </label>
                  <select
                    id="medicoId" name="medicoId"
                    value={form.medicoId} onChange={handleInputChange} required disabled={!form.especialidad}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#4aa8d8] focus:ring-2 focus:ring-[#4aa8d8]/20 appearance-none disabled:bg-[#f7f9fc]"
                  >
                    <option value="" disabled>Elegir médico...</option>
                    {medicosFiltrados.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Paso 2 — Calendario */}
              <div className={`flex flex-col gap-5 transition-opacity duration-300 ${form.medicoId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[#4aa8d8] uppercase tracking-wider">
                    3. Seleccione Fecha
                  </label>
                  <CalendarPicker
                    value={form.fecha}
                    minDate={minDate}
                    onChange={handleFechaChange}
                    disabled={!form.medicoId}
                  />
                  {form.fecha && (
                    <p className="text-[12px] text-[#7a8a9a] mt-1 pl-1">
                      Fecha seleccionada:{' '}
                      <span className="font-medium text-[#1a2332]">
                        {new Date(form.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                    </p>
                  )}
                </div>

                <div className={`flex flex-col gap-1.5 transition-opacity duration-300 ${form.fecha ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label className="text-[13px] font-medium text-[#4aa8d8] uppercase tracking-wider">
                    4. Horarios Disponibles
                  </label>
                  {availableHours.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {availableHours.map(hora => (
                        <button
                          key={hora} type="button"
                          onClick={() => setForm(prev => ({ ...prev, hora }))}
                          className={`py-3 rounded-xl border text-[14px] font-medium transition-colors ${
                            form.hora === hora
                              ? 'bg-[#4aa8d8] text-white border-[#4aa8d8]'
                              : 'bg-white text-[#1a2332] border-[#d5dce6] hover:border-[#4aa8d8]'
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3.5 rounded-xl border border-dashed border-[#d5dce6] bg-[#f7f9fc] text-[14px] text-[#7a8a9a] text-center">
                      {form.fecha ? 'No hay horarios disponibles para esta fecha.' : 'Seleccione una fecha primero.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Paso 3 — Datos del paciente */}
              <div className={`flex flex-col gap-4 pt-6 border-t border-[#eef4f9] transition-opacity duration-300 ${form.hora ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <h2 className="text-[13px] font-medium text-[#4aa8d8] uppercase tracking-wider mb-1">
                  5. Datos Personales
                </h2>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rut" className="text-[13px] font-medium">RUT</label>
                  <input
                    id="rut" name="rut" type="text"
                    value={form.rut} onChange={handleInputChange} onBlur={handleRutBlur}
                    placeholder="Ej: 12345678-9" required disabled={!form.hora}
                    className={`w-full px-4 py-3.5 rounded-xl border bg-white text-[15px] outline-none disabled:bg-[#f7f9fc] ${
                      rutError ? 'border-red-500' : 'border-[#d5dce6] focus:border-[#4aa8d8]'
                    }`}
                  />
                  {rutError && <span className="text-[12px] text-red-500">RUT inválido.</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre" className="text-[13px] font-medium">Nombre Completo</label>
                  <input
                    id="nombre" name="nombre" type="text"
                    value={form.nombre} onChange={handleInputChange}
                    placeholder="Juan Pérez" required disabled={!form.hora}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#4aa8d8] disabled:bg-[#f7f9fc]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[13px] font-medium">Correo Electrónico</label>
                  <input
                    id="email" name="email" type="email"
                    value={form.email} onChange={handleInputChange}
                    placeholder="ejemplo@correo.com" required disabled={!form.hora}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#4aa8d8] disabled:bg-[#f7f9fc]"
                  />
                </div>
              </div>

              <BotonPrimario
  type="submit"
  disabled={!isFormComplete}
  fullWidth
  className="py-4! [clip-path:inset(0_round_20px)]"
>
  Confirmar Cita
</BotonPrimario> 

            </form>
          </main>
        </div>
      </IonContent>
    </IonPage>
  )
}