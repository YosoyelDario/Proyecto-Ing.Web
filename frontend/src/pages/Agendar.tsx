import { useState, useEffect, useMemo } from 'react'
import {
  IonPage, IonContent, IonHeader, IonToolbar,
  IonCard, IonCardContent, IonGrid, IonRow, IonCol,
  IonText, IonNote,
} from '@ionic/react'
import { useNavigate } from 'react-router-dom'
import BotonVolver from '../components/BotonVolver'
import BotonPrimario  from '../components/BotonPrimario'
import CalendarPicker from '../components/CalendarPicker'
import PageTransition from '../components/PageTransition'
import EmailInput     from '../components/Emailinput'
import RutInput       from '../components/Rutinput'
import '../styles/Agendar.css'
import { AuthService } from '../services/AuthServices'
import {
  getEspecialidades,
  getMedicosPorEspecialidad,
  getHorariosDisponibles,
  crearCita,
  type Especialidad,
  type Medico,
} from '../services/citaServices'

interface AppointmentForm {
  especialidadId: string
  medicoId: string
  fecha: string
  hora: string
  rut: string
  nombre: string
  email: string
}

export default function Agendar() {
  const navigate   = useNavigate()
  const autenticado = AuthService.estaAutenticado()

  const [form, setForm] = useState<AppointmentForm>({
    especialidadId: '', medicoId: '', fecha: '', hora: '',
    rut: '', nombre: '', email: '',
  })

  const [especialidades,   setEspecialidades]   = useState<Especialidad[]>([])
  const [medicos,          setMedicos]          = useState<Medico[]>([])
  const [availableHours,   setAvailableHours]   = useState<string[]>([])
  const [rutError,         setRutError]         = useState(false)
  const [loadingMedicos,   setLoadingMedicos]   = useState(false)
  const [loadingHorarios,  setLoadingHorarios]  = useState(false)
  const [submitting,       setSubmitting]       = useState(false)
  const [errorGlobal,      setErrorGlobal]      = useState('')

  const minDate = useMemo(() => {
    const t  = new Date()
    const mm = String(t.getMonth() + 1).padStart(2, '0')
    const dd = String(t.getDate()).padStart(2, '0')
    return `${t.getFullYear()}-${mm}-${dd}`
  }, [])

  // Precargar datos del usuario autenticado
  useEffect(() => {
    const usuario = AuthService.obtenerUsuario()
    if (usuario) {
      setForm(prev => ({
        ...prev,
        rut:    usuario.rut    ?? '',
        nombre: usuario.nombre_completo ?? '',
        email:  usuario.email  ?? '',
      }))
    }
  }, [])

  // Cargar especialidades desde la API
  useEffect(() => {
    getEspecialidades()
      .then(setEspecialidades)
      .catch(() => setErrorGlobal('No se pudieron cargar las especialidades.'))
  }, [])

  // Cargar médicos al cambiar especialidad
  useEffect(() => {
    if (!form.especialidadId) { setMedicos([]); return }
    setLoadingMedicos(true)
    setMedicos([])
    setForm(prev => ({ ...prev, medicoId: '', fecha: '', hora: '' }))
    getMedicosPorEspecialidad(Number(form.especialidadId))
      .then(setMedicos)
      .catch(() => setErrorGlobal('No se pudieron cargar los médicos.'))
      .finally(() => setLoadingMedicos(false))
  }, [form.especialidadId])

  // Cargar horarios disponibles al cambiar médico + fecha
  useEffect(() => {
    if (!form.medicoId || !form.fecha) { setAvailableHours([]); return }
    setLoadingHorarios(true)
    setAvailableHours([])
    setForm(prev => ({ ...prev, hora: '' }))
    getHorariosDisponibles(Number(form.medicoId), form.fecha)
      .then(setAvailableHours)
      .catch(() => setAvailableHours([]))
      .finally(() => setLoadingHorarios(false))
  }, [form.medicoId, form.fecha])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setErrorGlobal('')
    setForm(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'especialidadId') { next.medicoId = ''; next.fecha = ''; next.hora = '' }
      if (name === 'medicoId')       { next.fecha = '';   next.hora = '' }
      return next
    })
  }

  const handleFechaChange = (date: string) =>
    setForm(prev => ({ ...prev, fecha: date, hora: '' }))

  const validateRut = (rutCompleto: string): boolean => {
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
    setRutError(!validateRut(form.rut))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rutError || submitting) return
    setSubmitting(true)
    setErrorGlobal('')

    try {
      const medicoSeleccionado = medicos.find(m => String(m.id) === form.medicoId)
      const especialidadNombre = especialidades.find(e => String(e.id) === form.especialidadId)?.nombre ?? ''

      const resultado = await crearCita(
        {
          id_medico: Number(form.medicoId),
          fecha:     form.fecha,
          hora:      form.hora,
          rut:       form.rut,
          nombre:    form.nombre,
          email:     form.email,
        },
        autenticado
      )

      navigate('/confirmacion', {
        state: {
          cita: {
            codigo_referencia: resultado.codigo_referencia,
            especialidad:      especialidadNombre,
            medico:            medicoSeleccionado?.nombre ?? '',
            fecha:             form.fecha,
            hora:              form.hora,
            rut:               form.rut,
            nombre:            form.nombre,
            email:             form.email,
          },
        },
      })
    } catch (err: unknown) {
      setErrorGlobal(err instanceof Error ? err.message : 'Error al agendar la cita')
    } finally {
      setSubmitting(false)
    }
  }

  const isFormComplete = form.especialidadId && form.medicoId && form.fecha &&
    form.hora && form.rut && form.nombre && form.email && !rutError

  return (
    <IonPage className="agendar-page">
      <IonHeader className="ion-no-border agendar-header">
        <IonToolbar>
          <div className="absolute top-4 left-4 z-10">
            <BotonVolver to="/" label="Inicio" />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f7f9fc' } as React.CSSProperties}>
        <PageTransition variante="fadeUp" duracion={500}>
          <div className="min-h-screen flex flex-col items-center py-12 px-6 font-['DM_Sans',sans-serif] text-[#1a2332]">
            <div className="w-full max-w-150 flex justify-end mb-4 px-1">
              <span className="text-[15px] font-medium tracking-wide flex items-center gap-2 text-[#1a2332]">
                <span className="w-2 h-2 rounded-full bg-[#3aada0]" />
                Municipalidad Santo Domingo
              </span>
            </div>

            <IonCard className="agendar-card w-full max-w-150">
              <IonCardContent>
                <PageTransition variante="fadeIn" duracion={400} delay={150}>
                  <IonText>
                    <h1 className="text-[28px] font-semibold mb-2 tracking-tight text-[#3aada0]!">Agendar Cita</h1>
                  </IonText>
                  <IonNote className="text-[14px] text-[#7a8a9a]! mb-8 font-light block">
                    Siga los pasos para programar su atención médica.
                  </IonNote>
                </PageTransition>

                {errorGlobal && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
                    {errorGlobal}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

                  {/* Paso 1 — Especialidad y médico */}
                  <PageTransition variante="fadeUp" duracion={400} delay={200}>
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="especialidadId" className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                          1. Seleccione Especialidad
                        </label>
                        <select
                          id="especialidadId" name="especialidadId"
                          value={form.especialidadId} onChange={handleInputChange} required
                          className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20 appearance-none"
                        >
                          <option value="" disabled>
                            {especialidades.length === 0 ? 'Cargando...' : 'Elegir especialidad...'}
                          </option>
                          {especialidades.map(esp => (
                            <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div className={`flex flex-col gap-1.5 transition-opacity duration-300 ${form.especialidadId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <label htmlFor="medicoId" className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                          2. Seleccione Médico
                        </label>
                        <select
                          id="medicoId" name="medicoId"
                          value={form.medicoId} onChange={handleInputChange} required
                          disabled={!form.especialidadId}
                          className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20 appearance-none disabled:bg-[#f7f9fc]"
                        >
                          <option value="" disabled>
                            {loadingMedicos ? 'Cargando...' : 'Elegir médico...'}
                          </option>
                          {medicos.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </PageTransition>

                  {/* Paso 2 — Calendario */}
                  <PageTransition variante="fadeUp" duracion={400} delay={300}>
                    <div className={`flex flex-col gap-5 transition-opacity duration-300 ${form.medicoId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                          3. Seleccione Fecha
                        </label>
                        <CalendarPicker
                          value={form.fecha}
                          minDate={minDate}
                          onChange={handleFechaChange}
                          disabled={!form.medicoId}
                        />
                        {form.fecha && (
                          <IonNote className="text-[12px] text-[#7a8a9a] mt-1 pl-1 block">
                            Fecha seleccionada:{' '}
                            <span className="font-medium text-[#1a2332]">
                              {new Date(form.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                              })}
                            </span>
                          </IonNote>
                        )}
                      </div>

                      <div className={`flex flex-col gap-1.5 transition-opacity duration-300 ${form.fecha ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <label className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                          4. Horarios Disponibles
                        </label>
                        {loadingHorarios ? (
                          <div className="px-4 py-3.5 rounded-xl border border-dashed border-[#d5dce6] bg-[#f7f9fc] text-[14px] text-[#7a8a9a] text-center">
                            Cargando horarios...
                          </div>
                        ) : availableHours.length > 0 ? (
                          <IonGrid className="agendar-grid">
                            <IonRow>
                              {availableHours.map(hora => (
                                <IonCol size="4" key={hora}>
                                  <BotonPrimario
                                    variante={form.hora === hora ? 'solido' : 'outline'}
                                    onClick={() => setForm(prev => ({ ...prev, hora }))}
                                    className="py-3! px-2! text-[14px]!"
                                  >
                                    {hora}
                                  </BotonPrimario>
                                </IonCol>
                              ))}
                            </IonRow>
                          </IonGrid>
                        ) : (
                          <div className="px-4 py-3.5 rounded-xl border border-dashed border-[#d5dce6] bg-[#f7f9fc] text-[14px] text-[#7a8a9a] text-center">
                            {form.fecha ? 'No hay horarios disponibles para esta fecha.' : 'Seleccione una fecha primero.'}
                          </div>
                        )}
                      </div>
                    </div>
                  </PageTransition>

                  {/* Paso 3 — Datos del paciente */}
                  <PageTransition variante="fadeUp" duracion={400} delay={400}>
                    <div className={`flex flex-col gap-4 pt-6 border-t border-[#eef4f9] transition-opacity duration-300 ${form.hora ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <IonText>
                        <h2 className="text-[13px] font-medium text-[#3aada0]! uppercase tracking-wider mb-1">
                          5. Datos Personales
                        </h2>
                      </IonText>

                      <RutInput
                        id="rut"
                        label="RUT"
                        value={form.rut}
                        onChange={(valor) => handleInputChange({ target: { name: 'rut', value: valor } } as React.ChangeEvent<HTMLInputElement>)}
                        onBlur={handleRutBlur}
                        placeholder="Ej: 12345678-9"
                        required
                        disabled={!form.hora || autenticado}
                      />

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="nombre" className="text-[13px] font-medium text-[#3aada0]!">Nombre Completo</label>
                        <input
                          id="nombre" name="nombre" type="text"
                          value={form.nombre} onChange={handleInputChange}
                          placeholder="Juan Pérez" required disabled={!form.hora || autenticado}
                          className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#3aada0] disabled:bg-[#f7f9fc]"
                        />
                      </div>

                      <EmailInput
                        id="email" label="Correo Electrónico"
                        value={form.email} onChange={handleInputChange}
                        placeholder="ejemplo@correo.com" required
                        disabled={!form.hora || autenticado}
                      />

                      {autenticado && (
                        <p className="text-[12px] text-[#7a8a9a] mt-1">
                          ✓ Datos tomados de tu cuenta. La cita quedará asociada a tu perfil.
                        </p>
                      )}
                    </div>
                  </PageTransition>

                  <BotonPrimario
                    type="submit"
                    disabled={!isFormComplete || submitting}
                    fullWidth
                    className="py-4! [clip-path:inset(0_round_20px)]"
                  >
                    {submitting ? 'Agendando...' : 'Confirmar Cita'}
                  </BotonPrimario>

                </form>
              </IonCardContent>
            </IonCard>
          </div>
        </PageTransition>
      </IonContent>
    </IonPage>
  )
}
