import { useEffect, useState } from 'react'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonSearchbar,
  IonList,
  IonItem,
  IonIcon,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption
} from '@ionic/react'
import {
  chevronForwardOutline,
  createOutline,
  trashOutline,
  timeOutline,
  calendarClearOutline,
  closeOutline
} from 'ionicons/icons'
import { useNavigate } from 'react-router-dom'
import BotonVolver from '../../components/BotonVolver'
import BotonPrimario from '../../components/BotonPrimario'
import PageTransition from '../../components/PageTransition'
import { apiClient, AuthService } from '../../services/AuthServices'
import {
  crearMedico,
  actualizarMedico,
  eliminarMedico,
  obtenerAgenda,
  guardarAgendaSemanal,
  obtenerExcepciones,
  agregarExcepcion,
  eliminarExcepcion,
  type HorarioAgenda,
  type ExcepcionAgenda
} from '../../services/medicoServices'

interface Medico {
  id: number
  rut: string
  nombre: string
  id_especialidad: number
  especialidad?: string
}

interface Especialidad {
  id: number
  nombre: string
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const GestionMedicos = () => {
  const navigate = useNavigate()
  const esAdmin = AuthService.esAdmin()

  const [medicos, setMedicos] = useState<Medico[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [medicoExpandido, setMedicoExpandido] = useState<number | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<number | null>(null)

  const [modalFormulario, setModalFormulario] = useState(false)
  const [modalAgenda, setModalAgenda] = useState(false)
  const [modalExcepciones, setModalExcepciones] = useState(false)
  
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<Medico | null>(null)

  const [formMedico, setFormMedico] = useState({ rut: '', nombre: '', id_especialidad: 1 })
  const [horarios, setHorarios] = useState<HorarioAgenda[]>([])
  const [nuevoHorario, setNuevoHorario] = useState<HorarioAgenda>({ dia_semana: 0, hora_inicio: '08:00', hora_fin: '17:00', duracion_minutos: 30 })
  const [excepciones, setExcepciones] = useState<(ExcepcionAgenda & { id?: number })[]>([])
  const [nuevaExc, setNuevaExc] = useState<ExcepcionAgenda>({ fecha: '', tipo: 'Feriado', motivo: '' })

  const cargarDatos = async () => {
    try {
      const [resMed, resEsp] = await Promise.all([
        apiClient.get('/api/profesionales'),
        apiClient.get('/api/especialidades')
      ])
      
      const espMap = new Map(resEsp.data.map((e: Especialidad) => [e.id, e.nombre]))
      const medicosConEsp = resMed.data.map((m: Medico) => ({
        ...m,
        especialidad: espMap.get(m.id_especialidad) || 'Sin asignar'
      }))

      setMedicos(medicosConEsp)
      setEspecialidades(resEsp.data)
    } catch {
      console.error('Error cargando datos:')
    }
  }

  useEffect(() => {
    if (!esAdmin) {
      navigate('/', { replace: true })
      return
    }
    cargarDatos().catch((error) => console.error('Error en cargarDatos:', error))
  }, [esAdmin, navigate])

  const medicosFiltrados = medicos.filter(m => {
    const term = busqueda.toLowerCase()
    return (
      busqueda === '' ||
      m.nombre.toLowerCase().includes(term) ||
      m.rut.toLowerCase().includes(term) ||
      m.especialidad?.toLowerCase().includes(term)
    )
  })

  const abrirModalCrear = () => {
    setMedicoSeleccionado(null)
    setFormMedico({ rut: '', nombre: '', id_especialidad: especialidades[0]?.id || 1 })
    setModalFormulario(true)
  }

  const abrirModalEditar = (medico: Medico) => {
    setMedicoSeleccionado(medico)
    setFormMedico({ rut: medico.rut, nombre: medico.nombre, id_especialidad: medico.id_especialidad })
    setModalFormulario(true)
  }

  const guardarMedico = async () => {
    // Validación básica antes de enviar
    if (!formMedico.rut.trim() || !formMedico.nombre.trim()) {
      alert('Por favor completa el RUT y el nombre del profesional.')
      return
    }

    // Verificar sesión activa antes de intentar la operación
    if (!AuthService.estaAutenticado()) {
      alert('Tu sesión expiró. Por favor inicia sesión nuevamente.')
      return
    }

    try {
      if (medicoSeleccionado) {
        await actualizarMedico(medicoSeleccionado.id, { 
          nombre: formMedico.nombre, 
          id_especialidad: formMedico.id_especialidad 
        })
      } else {
        await crearMedico(formMedico)
      }
      setModalFormulario(false)
      await cargarDatos()
    } catch (error: any) {
      console.error('Error guardando médico:', error)
      const mensaje = error.message || error.response?.data?.error || 'Error al guardar el profesional. Verifica los datos.'
      alert(mensaje)
    }
  }

  const handleEliminarMedico = async (id: number) => {
    try {
      await eliminarMedico(id)
      setConfirmEliminar(null)
      await cargarDatos()
    } catch (error: any) {
      console.error('Error eliminando médico:', error)
      const mensaje = error.message || error.response?.data?.error || 'No se puede eliminar: el profesional tiene citas asociadas.'
      alert(mensaje)
    }
  }

  const abrirAgenda = async (medico: Medico) => {
    setMedicoSeleccionado(medico)
    try {
      const data = await obtenerAgenda(medico.id)
      setHorarios(data)
      setModalAgenda(true)
    } catch {
      setHorarios([])
      setModalAgenda(true)
    }
  }

  const agregarHorario = () => {
    setHorarios([...horarios, { ...nuevoHorario }])
  }

  const removerHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index))
  }

  const guardarAgenda = async () => {
    if (!medicoSeleccionado) return
    try {
      await guardarAgendaSemanal(medicoSeleccionado.id, horarios)
      setModalAgenda(false)
    } catch (error) {
      console.error('Error guardando agenda:', error)
    }
  }

  const abrirExcepciones = async (medico: Medico) => {
    setMedicoSeleccionado(medico)
    try {
      const data = await obtenerExcepciones(medico.id)
      setExcepciones(data)
      setModalExcepciones(true)
    } catch (error) {
      setExcepciones([])
      setModalExcepciones(true)
    }
  }

  const handleAgregarExcepcion = async () => {
    if (!medicoSeleccionado || !nuevaExc.fecha) return
    try {
      await agregarExcepcion(medicoSeleccionado.id, nuevaExc)
      const data = await obtenerExcepciones(medicoSeleccionado.id)
      setExcepciones(data)
      setNuevaExc({ fecha: '', tipo: 'Feriado', motivo: '' })
    } catch (error) {
      console.error('Error agregando excepción:', error)
    }
  }

  const handleEliminarExcepcion = async (idExc: number) => {
    if (!medicoSeleccionado) return
    try {
      await eliminarExcepcion(idExc)
      const data = await obtenerExcepciones(medicoSeleccionado.id)
      setExcepciones(data)
    } catch (_error) {
      console.error('Error eliminando excepción:', _error)
    }
  }

  if (!esAdmin) return null

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#3aada0', '--color': 'white', '--padding-top': '16px' }}>
          <IonButtons slot="start" className="pl-4">
            <BotonVolver to="/admin" label="Panel" className="text-white/80! hover:text-white!" />
          </IonButtons>
          <IonButtons slot="end" className="pr-4">
            <BotonPrimario 
              onClick={abrirModalCrear}
              className="bg-white! text-[#3aada0]! py-1! px-3! rounded-lg! font-semibold! text-[13px]!"
            >
              + Nuevo Médico
            </BotonPrimario>
          </IonButtons>
        </IonToolbar>

        <IonToolbar style={{ '--background': '#3aada0', '--color': 'white' }}>
          <IonTitle className="px-6 mb-2">
            <PageTransition variante="fadeUp" duracion={400}>
              <span className="text-[22px] font-semibold text-white tracking-tight">
                Gestión de Médicos
              </span>
            </PageTransition>
          </IonTitle>
        </IonToolbar>

        <IonToolbar style={{ '--background': '#3aada0', '--padding-bottom': '16px' }}>
          <div className="px-6">
            <IonSearchbar
              value={busqueda}
              onIonInput={e => setBusqueda(e.detail.value!)}
              placeholder="Buscar por nombre, RUT, especialidad..."
              style={{
                '--background': 'rgba(255,255,255,0.2)',
                '--color': 'white',
                '--placeholder-color': 'rgba(255,255,255,0.5)',
                '--icon-color': 'rgba(255,255,255,0.6)',
                '--border-radius': '12px',
                '--box-shadow': 'none',
                padding: 0
              }}
            />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-[#f4faf9]">
        <div className="flex-1 px-5 py-6 flex flex-col gap-4 max-w-lg mx-auto w-full font-['DM_Sans',sans-serif]">
          {medicosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-[15px] font-medium text-[#1a2332]">Sin resultados</p>
            </div>
          ) : (
            <IonList lines="none" className="bg-transparent p-0 flex flex-col gap-4">
              {medicosFiltrados.map((medico, idx) => (
                <PageTransition key={medico.id} variante="fadeUp" duracion={300} delay={100 + idx * 50}>
                  <div className="bg-white rounded-2xl border border-[#d5dce7] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    
                    <IonItem
                      button
                      detail={false}
                      onClick={() => {
                        setMedicoExpandido(medicoExpandido === medico.id ? null : medico.id)
                        setConfirmEliminar(null)
                      }}
                      className="py-1 [--background-hover:#f7f9fc]"
                    >
                      <div className="flex-1 min-w-0 py-3">
                        <p className="text-[17px] font-semibold text-[#1a2332] truncate m-0 mb-1">
                          {medico.nombre}
                        </p>
                        <p className="text-[14px] text-[#7a8a9a] leading-relaxed m-0">
                          {medico.especialidad} · {medico.rut}
                        </p>
                      </div>
                      <IonIcon
                        icon={chevronForwardOutline}
                        className={`w-5 h-5 shrink-0 text-[#c8d3dc] transition-transform duration-200 ${
                          medicoExpandido === medico.id ? 'rotate-90' : ''
                        }`}
                      />
                    </IonItem>

                    {medicoExpandido === medico.id && (
                      <div className="border-t border-[#eef4f9]">
                        {confirmEliminar === medico.id ? (
                          <div className="px-6 pb-5 pt-4 flex flex-col gap-3">
                            <p className="text-[13px] text-[#e05c5c] font-medium text-center m-0">
                              ¿Eliminar permanentemente a este profesional?
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <BotonPrimario
                                onClick={() => handleEliminarMedico(medico.id)}
                                fullWidth
                                className="bg-[#e05c5c]! border-[#e05c5c]! py-3! text-[13px]! rounded-xl!"
                              >
                                Sí, eliminar
                              </BotonPrimario>
                              <BotonPrimario
                                onClick={() => setConfirmEliminar(null)}
                                variante="outline"
                                fullWidth
                                className="py-3! text-[13px]! rounded-xl!"
                              >
                                Cancelar
                              </BotonPrimario>
                            </div>
                          </div>
                        ) : (
                          <div className="px-6 pb-5 pt-4 grid grid-cols-2 gap-3">
                            <BotonPrimario onClick={() => abrirAgenda(medico)} variante="outline" className="py-2.5! text-[13px]! rounded-xl!">
                              <IonIcon icon={timeOutline} className="mr-1.5" /> Agenda
                            </BotonPrimario>
                            <BotonPrimario onClick={() => abrirExcepciones(medico)} variante="outline" className="py-2.5! text-[13px]! rounded-xl!">
                              <IonIcon icon={calendarClearOutline} className="mr-1.5" /> Feriados
                            </BotonPrimario>
                            <BotonPrimario onClick={() => abrirModalEditar(medico)} variante="outline" className="py-2.5! text-[13px]! rounded-xl!">
                              <IonIcon icon={createOutline} className="mr-1.5" /> Editar
                            </BotonPrimario>
                            <BotonPrimario 
                              onClick={() => setConfirmEliminar(medico.id)} 
                              variante="outline" 
                              className="border-[#e05c5c]/30! text-[#e05c5c]! hover:bg-red-50! py-2.5! text-[13px]! rounded-xl!"
                            >
                              <IonIcon icon={trashOutline} className="mr-1.5" /> Eliminar
                            </BotonPrimario>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </PageTransition>
              ))}
            </IonList>
          )}
        </div>
      </IonContent>

      <IonModal isOpen={modalFormulario} onDidDismiss={() => setModalFormulario(false)}>
        <IonHeader className="ion-no-border">
          <IonToolbar className="bg-white px-2 pt-2 border-b border-[#eef4f9]">
            <IonTitle className="text-[18px] font-semibold text-[#1a2332]">
              {medicoSeleccionado ? 'Editar Médico' : 'Nuevo Médico'}
            </IonTitle>
            <IonButtons slot="end">
              <IonIcon icon={closeOutline} className="w-6 h-6 text-[#7a8a9a] mr-2" onClick={() => setModalFormulario(false)} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="bg-[#f4faf9]">
          <div className="p-6 flex flex-col gap-4 font-['DM_Sans',sans-serif]">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#1a2332]">RUT</label>
              <input
                type="text"
                value={formMedico.rut}
                onChange={e => setFormMedico({ ...formMedico, rut: e.target.value })}
                disabled={!!medicoSeleccionado}
                placeholder="12345678-9"
                style={{
                  background: 'white',
                  border: '1px solid #d5dce7',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: medicoSeleccionado ? 0.6 : 1,
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#1a2332]">Nombre Completo</label>
              <input
                type="text"
                value={formMedico.nombre}
                onChange={e => setFormMedico({ ...formMedico, nombre: e.target.value })}
                placeholder="Dr. Juan Pérez"
                style={{
                  background: 'white',
                  border: '1px solid #d5dce7',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#1a2332]">Especialidad</label>
              <select
                value={formMedico.id_especialidad}
                onChange={e => setFormMedico({ ...formMedico, id_especialidad: Number(e.target.value) })}
                style={{
                  background: 'white',
                  border: '1px solid #d5dce7',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                {especialidades.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
            <BotonPrimario onClick={guardarMedico} className="mt-4 py-3! rounded-xl!">Guardar Profesional</BotonPrimario>
          </div>
        </IonContent>
      </IonModal>

      <IonModal isOpen={modalAgenda} onDidDismiss={() => setModalAgenda(false)}>
        <IonHeader className="ion-no-border">
          <IonToolbar className="bg-white px-2 pt-2 border-b border-[#eef4f9]">
            <IonTitle className="text-[18px] font-semibold text-[#1a2332]">Horario Semanal</IonTitle>
            <IonButtons slot="end">
              <IonIcon icon={closeOutline} className="w-6 h-6 text-[#7a8a9a] mr-2" onClick={() => setModalAgenda(false)} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="bg-[#f4faf9]">
          <div className="p-6 flex flex-col gap-6 font-['DM_Sans',sans-serif]">
            
            <div className="bg-white border border-[#d5dce7] rounded-2xl overflow-hidden">
              <div className="bg-[#f7f9fc] px-4 py-3 border-b border-[#eef4f9]">
                <h3 className="text-[14px] font-semibold text-[#1a2332] m-0">Bloques Actuales</h3>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {horarios.length === 0 ? (
                  <p className="text-[13px] text-[#7a8a9a] text-center py-4">Sin horarios definidos.</p>
                ) : (
                  horarios.map((h, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#f4faf9] rounded-lg">
                      <div>
                        <p className="text-[14px] font-medium text-[#1a2332] m-0">{DIAS_SEMANA[h.dia_semana]}</p>
                        <p className="text-[12px] text-[#7a8a9a] m-0">{h.hora_inicio.slice(0,5)} - {h.hora_fin.slice(0,5)} ({h.duracion_minutos} min)</p>
                      </div>
                      <IonIcon icon={closeOutline} className="w-5 h-5 text-[#e05c5c]" onClick={() => removerHorario(i)} />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-[14px] font-semibold text-[#1a2332] m-0">Agregar Bloque</h3>
              <div className="grid grid-cols-2 gap-3">
                <IonSelect value={nuevoHorario.dia_semana} onIonChange={e => setNuevoHorario({...nuevoHorario, dia_semana: e.detail.value})} className="bg-white border border-[#d5dce7] rounded-xl px-3 py-2 text-[13px] col-span-2">
                  {DIAS_SEMANA.map((d, i) => <IonSelectOption key={i} value={i}>{d}</IonSelectOption>)}
                </IonSelect>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#7a8a9a]">Inicio</label>
                  <IonInput type="time" value={nuevoHorario.hora_inicio} onIonInput={e => setNuevoHorario({...nuevoHorario, hora_inicio: e.detail.value!})} className="bg-white border border-[#d5dce7] rounded-xl px-3 py-1.5 text-[13px]"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#7a8a9a]">Fin</label>
                  <IonInput type="time" value={nuevoHorario.hora_fin} onIonInput={e => setNuevoHorario({...nuevoHorario, hora_fin: e.detail.value!})} className="bg-white border border-[#d5dce7] rounded-xl px-3 py-1.5 text-[13px]"/>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[11px] text-[#7a8a9a]">Duración (minutos)</label>
                  <IonInput type="number" value={nuevoHorario.duracion_minutos} onIonInput={e => setNuevoHorario({...nuevoHorario, duracion_minutos: parseInt(e.detail.value!)})} className="bg-white border border-[#d5dce7] rounded-xl px-3 py-1.5 text-[13px]"/>
                </div>
              </div>
              <BotonPrimario onClick={agregarHorario} variante="outline" className="py-2!">Añadir a lista</BotonPrimario>
            </div>

            <BotonPrimario onClick={guardarAgenda} className="mt-2 py-3! rounded-xl!">Guardar Cambios</BotonPrimario>
          </div>
        </IonContent>
      </IonModal>

      <IonModal isOpen={modalExcepciones} onDidDismiss={() => setModalExcepciones(false)}>
        <IonHeader className="ion-no-border">
          <IonToolbar className="bg-white px-2 pt-2 border-b border-[#eef4f9]">
            <IonTitle className="text-[18px] font-semibold text-[#1a2332]">Feriados y Licencias</IonTitle>
            <IonButtons slot="end">
              <IonIcon icon={closeOutline} className="w-6 h-6 text-[#7a8a9a] mr-2" onClick={() => setModalExcepciones(false)} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="bg-[#f4faf9]">
          <div className="p-6 flex flex-col gap-6 font-['DM_Sans',sans-serif]">
            
            <div className="flex flex-col gap-3">
              <h3 className="text-[14px] font-semibold text-[#1a2332] m-0">Registrar Excepción</h3>
              <div className="flex flex-col gap-2">
                <IonInput type="date" value={nuevaExc.fecha} onIonInput={e => setNuevaExc({...nuevaExc, fecha: e.detail.value!})} className="bg-white border border-[#d5dce7] rounded-xl px-3 py-2 text-[13px]"/>
                <IonSelect value={nuevaExc.tipo} onIonChange={e => setNuevaExc({...nuevaExc, tipo: e.detail.value})} className="bg-white border border-[#d5dce7] rounded-xl px-3 py-2 text-[13px]">
                  <IonSelectOption value="Feriado">Feriado</IonSelectOption>
                  <IonSelectOption value="Licencia">Licencia Médica</IonSelectOption>
                </IonSelect>
                <IonInput value={nuevaExc.motivo} placeholder="Motivo (Opcional)" onIonInput={e => setNuevaExc({...nuevaExc, motivo: e.detail.value!})} className="bg-white border border-[#d5dce7] rounded-xl px-3 py-2 text-[13px]"/>
              </div>
              <BotonPrimario onClick={handleAgregarExcepcion} className="py-2.5! rounded-xl!">Registrar</BotonPrimario>
            </div>

            <div className="bg-white border border-[#d5dce7] rounded-2xl overflow-hidden mt-2">
              <div className="bg-[#f7f9fc] px-4 py-3 border-b border-[#eef4f9]">
                <h3 className="text-[14px] font-semibold text-[#1a2332] m-0">Excepciones Activas</h3>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {excepciones.length === 0 ? (
                  <p className="text-[13px] text-[#7a8a9a] text-center py-4">No hay registros.</p>
                ) : (
                  excepciones.map((exc) => (
                    <div key={exc.id} className="flex items-center justify-between px-3 py-2 bg-[#f4faf9] rounded-lg">
                      <div>
                        <p className="text-[14px] font-medium text-[#1a2332] m-0">{exc.fecha.split('T')[0]}</p>
                        <p className="text-[12px] text-[#7a8a9a] m-0">{exc.tipo} {exc.motivo ? `- ${exc.motivo}` : ''}</p>
                      </div>
                      <IonIcon icon={trashOutline} className="w-5 h-5 text-[#e05c5c]" onClick={() => exc.id && handleEliminarExcepcion(exc.id)} />
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </IonContent>
      </IonModal>
    </IonPage>
  )
}