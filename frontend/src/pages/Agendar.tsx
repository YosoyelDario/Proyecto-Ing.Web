import { useState, useEffect, useMemo } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useNavigate } from 'react-router-dom'
import BotonPrimario from '../components/BotonPrimario'
import CalendarPicker from '../components/CalendarPicker'
import PageTransition from '../components/PageTransition'
import EmailInput from '../components/Emailinput';
import InputTexto from '../components/InputTexto';
import RutInput from '../components/Rutinput';

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

  const minDate = useMemo(() => {
    const t  = new Date()
    const mm = String(t.getMonth() + 1).padStart(2, '0')
    const dd = String(t.getDate()).padStart(2, '0')
    return `${t.getFullYear()}-${mm}-${dd}`
  }, [])

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
    e.preventDefault();
    if (rutError) return;

    const citasGuardadas = JSON.parse(localStorage.getItem('citas_agendadas') || '{}');

    const esDuplicada = Object.values(citasGuardadas).some((c: any) =>
      c.rut === form.rut &&
      c.medicoId === form.medicoId &&
      c.fecha === form.fecha
    );

    if (esDuplicada) {
      alert("Atención: Ya existe una cita agendada para este RUT con el mismo médico en la fecha seleccionada.");
      return;
    }

    const medicoSeleccionado = MEDICOS.find(m => m.id === form.medicoId);

    navigate('/confirmacion', {
      state: {
        cita: {
          ...form,
          medico: medicoSeleccionado?.nombre ?? '',
        },
      },
    });
  };

  const medicosFiltrados = MEDICOS.filter(m => m.especialidad === form.especialidad)
  const isFormComplete   = Object.values(form).every(v => v.trim() !== '') && !rutError

  return (
    <IonPage>
      <IonContent fullscreen className="bg-[#f7f9fc]">
        <PageTransition variante="fadeUp" duracion={500}>
          <div className="min-h-screen flex flex-col items-center py-12 px-6 font-['DM_Sans',sans-serif] text-[#1a2332]">

            <nav className="w-full max-w-150 flex items-center justify-between mb-8">
              <button
                onClick={() => navigate(-1)}
                className="text-[14px] font-medium text-[#7a8a9a] bg-transparent border-none cursor-pointer"
              >
                ← Volver
              </button>
              <span className="text-[15px] font-medium tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3aada0]" /> Municipalidad Santo Domingo
              </span>
            </nav>

            <main className="w-full max-w-150 bg-white rounded-2xl shadow-sm border border-[#d5dce6] p-8 md:p-10">
              <PageTransition variante="fadeIn" duracion={400} delay={150}>
                <h1 className="text-[28px] font-semibold mb-2 tracking-tight text-[#3aada0]!">Agendar Cita</h1>
                <p className="text-[14px] text-[#7a8a9a]! mb-8 font-light">
                  Siga los pasos para programar su atención médica.
                </p>
              </PageTransition>

              <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

                {/* Paso 1 */}
                <PageTransition variante="fadeUp" duracion={400} delay={200}>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="especialidad" className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                        1. Seleccione Especialidad
                      </label>
                      <select
                        id="especialidad" name="especialidad"
                        value={form.especialidad} onChange={handleInputChange} required
                        className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20 appearance-none"
                      >
                        <option value="" disabled>Elegir especialidad...</option>
                        {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                      </select>
                    </div>

                    <div className={`flex flex-col gap-1.5 transition-opacity duration-300 ${form.especialidad ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <label htmlFor="medicoId" className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                        2. Seleccione Médico
                      </label>
                      <select
                        id="medicoId" name="medicoId"
                        value={form.medicoId} onChange={handleInputChange} required disabled={!form.especialidad}
                        className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#3aada0] focus:ring-2 focus:ring-[#3aada0]/20 appearance-none disabled:bg-[#f7f9fc]"
                      >
                        <option value="" disabled>Elegir médico...</option>
                        {medicosFiltrados.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
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
                      <label className="text-[13px] font-medium text-[#3aada0] uppercase tracking-wider">
                        4. Horarios Disponibles
                      </label>
                      {availableHours.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {availableHours.map(hora => (
                            <BotonPrimario
                              key={hora}
                              variante={form.hora === hora ? 'solido' : 'outline'}
                              onClick={() => setForm(prev => ({ ...prev, hora }))}
                              className="py-3! px-2! text-[14px]!"
                            >
                              {hora}
                            </BotonPrimario>
                          ))}
                        </div>
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
    <h2 className="text-[13px] font-medium text-[#3aada0]! uppercase tracking-wider mb-1">
      5. Datos Personales
    </h2>

    <RutInput
      id="rut"
      label="RUT"
      value={form.rut}
      onChange={(valor) => handleInputChange({ target: { name: 'rut', value: valor } } as React.ChangeEvent<HTMLInputElement>)}
      placeholder="Ej: 12.345.678-9"
      required={true}
      disabled={!form.hora}
    />

    <div className="flex flex-col gap-1.5">

                      <label htmlFor="nombre" className="text-[13px] font-medium text-[#3aada0]!">Nombre Completo</label>

                      <input

                        id="nombre" name="nombre" type="text"

                        value={form.nombre} onChange={handleInputChange}

                        placeholder="Juan Pérez" required disabled={!form.hora}

                        className="w-full px-4 py-3.5 rounded-xl border border-[#d5dce6] bg-white text-[15px] outline-none focus:border-[#3aada0] disabled:bg-[#f7f9fc]"

                      />

                    </div>

    <EmailInput
      id="email"
      label="Correo Electrónico"
      value={form.email}
      onChange={handleInputChange}
      placeholder="ejemplo@correo.com"
      required={true}
      disabled={!form.hora}
    />
  </div>
</PageTransition>

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
        </PageTransition>
      </IonContent>
    </IonPage>
  )
}