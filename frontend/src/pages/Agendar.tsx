import { useState } from 'react'
import {
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
  IonIcon,
  IonBadge,
} from '@ionic/react'
import {
  chevronBackOutline,
  chevronForwardOutline,
  personOutline,
  calendarOutline,
  timeOutline,
  medkitOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons'
import { Layout } from '../components/Layout'

// ─── Datos hardcodeados ───────────────────────────────────────────────────────

const MEDICOS = [
  { id: 1, nombre: 'Dr. Alejandro Muñoz',    especialidad: 'Medicina General' },
  { id: 2, nombre: 'Dra. Camila Rojas',       especialidad: 'Pediatría' },
  { id: 3, nombre: 'Dr. Felipe Contreras',    especialidad: 'Cardiología' },
  { id: 4, nombre: 'Dra. Valentina Torres',   especialidad: 'Dermatología' },
  { id: 5, nombre: 'Dr. Sebastián Vega',      especialidad: 'Traumatología' },
]

const HORAS_DISPONIBLES = [
  '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00',
]

// Simula horas ya ocupadas
const HORAS_OCUPADAS = ['09:00', '10:30', '14:00', '15:30']

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

// ─── Utilidades de calendario ─────────────────────────────────────────────────

function getDiasEnMes(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getPrimerDiaSemana(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function esDiaDeshabilitado(date: Date) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const dia = date.getDay()
  return date < hoy || dia === 0 || dia === 6 // sin pasado ni fines de semana
}

// ─── Componente Calendario ────────────────────────────────────────────────────

interface CalendarioProps {
  fechaSeleccionada: Date | null
  onSeleccionar: (date: Date) => void
}

function Calendario({ fechaSeleccionada, onSeleccionar }: CalendarioProps) {
  const hoy = new Date()
  const [viewYear, setViewYear]   = useState(hoy.getFullYear())
  const [viewMonth, setViewMonth] = useState(hoy.getMonth())

  const diasEnMes    = getDiasEnMes(viewYear, viewMonth)
  const primerDia    = getPrimerDiaSemana(viewYear, viewMonth)
  const celdas       = primerDia + diasEnMes
  const filas        = Math.ceil(celdas / 7)

  const irAtras = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const irAdelante = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div className="w-full select-none">
      {/* Cabecera mes / año */}
      <div className="flex items-center justify-between mb-4">
        <IonButton fill="clear" size="small" onClick={irAtras}>
          <IonIcon icon={chevronBackOutline} />
        </IonButton>
        <IonText>
          <h3 className="text-base font-bold text-teal-700">
            {MESES[viewMonth]} {viewYear}
          </h3>
        </IonText>
        <IonButton fill="clear" size="small" onClick={irAdelante}>
          <IonIcon icon={chevronForwardOutline} />
        </IonButton>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: filas * 7 }).map((_, i) => {
          const diaNum = i - primerDia + 1

          if (diaNum < 1 || diaNum > diasEnMes) {
            return <div key={i} />
          }

          const fecha     = new Date(viewYear, viewMonth, diaNum)
          const disabled  = esDiaDeshabilitado(fecha)
          const esHoy     = fecha.toDateString() === hoy.toDateString()
          const seleccionado = fechaSeleccionada?.toDateString() === fecha.toDateString()

          let clases = 'mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer '

          if (disabled) {
            clases += 'text-gray-300 cursor-not-allowed'
          } else if (seleccionado) {
            clases += 'bg-teal-600 text-white shadow-md scale-110'
          } else if (esHoy) {
            clases += 'border-2 border-teal-400 text-teal-700 hover:bg-teal-50'
          } else {
            clases += 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
          }

          return (
            <div key={i} className="flex justify-center">
              <button
                className={clases}
                disabled={disabled}
                onClick={() => !disabled && onSeleccionar(fecha)}
              >
                {diaNum}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function Agendar() {
  // Datos del formulario
  const [nombre,         setNombre]         = useState('')
  const [apellido,       setApellido]       = useState('')
  const [rut,            setRut]            = useState('')
  const [fechaNac,       setFechaNac]       = useState('')
  const [medicoId,       setMedicoId]       = useState<number | null>(null)
  const [fechaCita,      setFechaCita]      = useState<Date | null>(null)
  const [horaCita,       setHoraCita]       = useState<string | null>(null)
  const [confirmado,     setConfirmado]     = useState(false)
  const [errorMsg,       setErrorMsg]       = useState('')

  // Formateo de RUT chileno
  const handleRut = (val: string) => {
    let v = val.replace(/[^0-9kK]/g, '').toUpperCase()
    if (v.length > 9) v = v.slice(0, 9)
    if (v.length > 1) v = v.slice(0, -1) + '-' + v.slice(-1)
    setRut(v)
  }

  const medicoSeleccionado = MEDICOS.find(m => m.id === medicoId)

  const handleSubmit = () => {
    if (!nombre || !apellido || !rut || !fechaNac || !medicoId || !fechaCita || !horaCita) {
      setErrorMsg('Por favor completa todos los campos antes de confirmar.')
      return
    }
    setErrorMsg('')
    setConfirmado(true)
  }

  // ── Pantalla de confirmación ──────────────────────────────────────────────
  if (confirmado) {
    return (
      <Layout>
        <section className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            <IonIcon
              icon={checkmarkCircleOutline}
              className="text-teal-500"
              style={{ fontSize: '5rem' }}
            />
            <IonText color="dark">
              <h2 className="mt-4 text-3xl font-extrabold">¡Cita Agendada!</h2>
              <p className="mt-2 text-gray-500 text-base">
                Tu hora médica ha sido registrada con éxito.
              </p>
            </IonText>

            <IonCard className="mt-8 text-left shadow-lg">
              <IonCardContent>
                <div className="space-y-3 text-sm">
                  <Row icon={personOutline}   label="Paciente" value={`${nombre} ${apellido}`} />
                  <Row icon={medkitOutline}   label="Médico"   value={medicoSeleccionado?.nombre ?? ''} />
                  <Row icon={calendarOutline} label="Fecha"    value={fechaCita?.toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) ?? ''} />
                  <Row icon={timeOutline}     label="Hora"     value={horaCita ?? ''} />
                </div>
              </IonCardContent>
            </IonCard>

            <IonButton
              expand="block"
              color="tertiary"
              className="mt-6 font-bold"
              routerLink="/home"
            >
              Volver al Inicio
            </IonButton>
          </div>
        </section>
      </Layout>
    )
  }

  // ── Formulario principal ──────────────────────────────────────────────────
  return (
    <Layout>
      {/* Hero compacto */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-400 px-4 py-10 lg:px-10">
        <div className="mx-auto max-w-[1200px]">
          <IonText color="light">
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl">
              Agenda Tu Cita Médica
            </h1>
            <p className="mt-2 text-teal-100 text-base">
              Completa el formulario y selecciona el día y hora que más te acomode.
            </p>
          </IonText>
        </div>
      </section>

      {/* Contenido */}
      <section className="bg-gray-50 px-4 py-10 lg:px-10">
        <IonGrid className="mx-auto max-w-[1200px] p-0">
          <IonRow className="gap-y-6">

            {/* ── Columna izquierda: datos personales + médico ── */}
            <IonCol size="12" sizeLg="5">
              <IonCard className="shadow-lg m-0">
                <IonCardContent className="p-6">
                  <SectionTitle icon={personOutline} title="Datos del Paciente" />

                  <div className="space-y-1 mt-4">
  <IonItem lines="full" className="rounded-lg">
    <IonInput
      value={nombre}
      onIonInput={e => setNombre(e.detail.value ?? '')}
      placeholder="Nombre (Ej: Juan)"
      clearInput
    />
  </IonItem>

                    <IonItem lines="full" className="rounded-lg">
    <IonInput
      value={apellido}
      onIonInput={e => setApellido(e.detail.value ?? '')}
      placeholder="Apellido (Ej: González)"
      clearInput
    />
  </IonItem>

                    <IonItem lines="full" className="rounded-lg">
    <IonInput
      value={rut}
      onIonInput={e => handleRut(e.detail.value ?? '')}
      placeholder="RUT (Ej: 12345678-9)"
      inputmode="text"
      clearInput
    />
  </IonItem>

                    <IonItem lines="full" className="rounded-lg">
    <IonLabel position="stacked">Fecha de Nacimiento</IonLabel>
    <IonInput
      type="date"
      value={fechaNac}
      onIonInput={e => setFechaNac(e.detail.value ?? '')}
      max={new Date().toISOString().split('T')[0]}
    />
  </IonItem>
</div>

                  {/* Selector de médico */}
                  <SectionTitle icon={medkitOutline} title="Seleccionar Médico" className="mt-8" />

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {MEDICOS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMedicoId(m.id)}
                        className={`
                          flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all
                          ${medicoId === m.id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 bg-white hover:border-teal-300'}
                        `}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100">
                          <IonIcon icon={medkitOutline} className="text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{m.nombre}</p>
                          <p className="text-xs text-gray-500">{m.especialidad}</p>
                        </div>
                        {medicoId === m.id && (
                          <IonBadge color="success" className="ml-auto self-center text-xs">
                            Seleccionado
                          </IonBadge>
                        )}
                      </button>
                    ))}
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* ── Columna derecha: calendario + horas ── */}
            <IonCol size="12" sizeLg="7">
              <IonCard className="shadow-lg m-0">
                <IonCardContent className="p-6">
                  <SectionTitle icon={calendarOutline} title="Seleccionar Fecha" />

                  <div className="mt-4">
                    <Calendario
                      fechaSeleccionada={fechaCita}
                      onSeleccionar={d => { setFechaCita(d); setHoraCita(null) }}
                    />
                  </div>

                  {/* Franja de fecha seleccionada */}
                  {fechaCita && (
                    <div className="mt-4 rounded-xl bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 border border-teal-200">
                      📅 {fechaCita.toLocaleDateString('es-CL', {
                        weekday: 'long', year: 'numeric',
                        month: 'long', day: 'numeric',
                      })}
                    </div>
                  )}

                  {/* Horas disponibles */}
                  {fechaCita && (
                    <>
                      <SectionTitle icon={timeOutline} title="Seleccionar Hora" className="mt-8" />
                      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
                        {HORAS_DISPONIBLES.map(h => {
                          const ocupada     = HORAS_OCUPADAS.includes(h)
                          const seleccionada = horaCita === h
                          return (
                            <button
                              key={h}
                              disabled={ocupada}
                              onClick={() => setHoraCita(h)}
                              className={`
                                rounded-lg py-2 px-1 text-sm font-semibold transition-all
                                ${ocupada
                                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                  : seleccionada
                                    ? 'bg-teal-600 text-white shadow-md scale-105'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-teal-400 hover:text-teal-700'}
                              `}
                            >
                              {h}
                            </button>
                          )
                        })}
                      </div>
                      <p className="mt-3 text-xs text-gray-400">
                        <span className="inline-block w-3 h-3 rounded bg-gray-100 border mr-1 align-middle" />
                        Hora no disponible
                      </p>
                    </>
                  )}
                </IonCardContent>
              </IonCard>

              {/* Resumen + Botón */}
              {fechaCita && horaCita && medicoSeleccionado && (
                <IonCard className="shadow-lg mt-4 m-0 border-l-4 border-teal-500">
                  <IonCardContent className="p-4">
                    <p className="text-xs font-bold uppercase text-teal-600 tracking-widest mb-3">
                      Resumen de tu cita
                    </p>
                    <div className="space-y-2 text-sm">
                      <Row icon={medkitOutline}   label="Médico" value={medicoSeleccionado.nombre} />
                      <Row icon={calendarOutline} label="Fecha"  value={fechaCita.toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long' })} />
                      <Row icon={timeOutline}     label="Hora"   value={horaCita} />
                    </div>
                  </IonCardContent>
                </IonCard>
              )}

              {errorMsg && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  ⚠️ {errorMsg}
                </div>
              )}

              <IonButton
                expand="block"
                color="tertiary"
                size="large"
                className="mt-4 font-bold tracking-wide"
                onClick={handleSubmit}
              >
                Confirmar Cita
              </IonButton>
            </IonCol>

          </IonRow>
        </IonGrid>
      </section>
    </Layout>
  )
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function SectionTitle({ icon, title, className = '' }: { icon: string; title: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IonIcon icon={icon} className="text-teal-500 text-lg" />
      <IonText>
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
      </IonText>
    </div>
  )
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <IonIcon icon={icon} className="text-teal-500 shrink-0" />
      <span className="text-gray-500 w-16 shrink-0">{label}:</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  )
}