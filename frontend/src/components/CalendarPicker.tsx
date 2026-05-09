import { useState, useEffect } from 'react'

interface CalendarPickerProps {
  value: string       // Formato: 'YYYY-MM-DD'
  minDate: string     // Formato: 'YYYY-MM-DD'
  onChange: (date: string) => void
  disabled?: boolean
}

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

export default function CalendarPicker({ value, minDate, onChange, disabled }: CalendarPickerProps) {
  const today = new Date()

  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  // Sincroniza la vista del calendario si el valor cambia externamente (útil para ModificarCita)
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
    if (viewMonth === 0) { 
      setViewMonth(11)
      setViewYear(y => y - 1) 
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) { 
      setViewMonth(0)
      setViewYear(y => y + 1) 
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const handleDayClick = (day: number) => {
    if (disabled || isDayDisabled(day)) return
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${viewYear}-${mm}-${dd}`)
  }

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
    <div className={`rounded-2xl border border-[#d5dce6] bg-white overflow-hidden select-none ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Navegación */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef4f9]">
        <button type="button" onClick={prevMonth} disabled={!canGoPrev()} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7a8a9a] hover:bg-[#f7f9fc] disabled:opacity-25 transition-colors">‹</button>
        <span className="text-[14px] font-semibold text-[#1a2332]">{MESES[viewMonth]} {viewYear}</span>
        <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7a8a9a] hover:bg-[#f7f9fc] transition-colors">›</button>
      </div>

      {/* Días Semana */}
      <div className="grid grid-cols-7 border-b border-[#eef4f9]">
        {DIAS_SEMANA.map(d => <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase text-[#a0adb8]">{d}</div>)}
      </div>

      {/* Cuadrícula */}
      <div className="grid grid-cols-7 gap-y-1 p-3">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} />
          const dis = isDayDisabled(day)
          const sel = isSelected(day)
          const tod = isToday(day)
          return (
            <button
              key={day} type="button" onClick={() => handleDayClick(day)} disabled={dis}
              className={`mx-auto w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-medium transition-all
                ${sel ? 'bg-[#4aa8d8] text-white' : tod && !dis ? 'border border-[#4aa8d8] text-[#4aa8d8] hover:bg-[#eaf5fb]' : dis ? 'text-[#c8d3dc] cursor-not-allowed' : 'text-[#1a2332] hover:bg-[#eaf5fb] hover:text-[#4aa8d8]'}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}