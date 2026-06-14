const {
  getCitasPorUsuario,
  getCitaPorCodigo,
  getAllCitas,
  getHorariosDisponibles,
  crearCita,
  modificarCita,
  cancelarCita,
  eliminarCita,
} = require('../db/queries/citas')

const pool = require('../db/pool');
const { enviarCorreo, plantillaConfirmacion, plantillaCancelacion, plantillaModificacion } = require('../utils/mailer');

// ── GET /api/citas/mis-citas  (usuario autenticado) ──────────────────────
const listarCitasUsuario = async (req, res) => {
  try {
    const citas = await getCitasPorUsuario(req.usuario.id)
    res.json(citas)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener las citas' })
  }
}

// ── GET /api/citas/all  (solo admin) ─────────────────────────────────────
const listarTodasCitas = async (req, res) => {
  try {
    if (!req.usuario.is_admin) {
      return res.status(403).json({ error: 'Acceso denegado.' })
    }
    const citas = await getAllCitas()
    res.json(citas)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener citas' })
  }
}

// ── GET /api/citas/:codigo  (por código, público para invitados) ─────────
const obtenerCitaPorCodigo = async (req, res) => {
  try {
    const cita = await getCitaPorCodigo(req.params.codigo)
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada.' })
    res.json(cita)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener la cita' })
  }
}

// ── GET /api/citas/disponibilidad?id_medico=&fecha= ──────────────────────
const obtenerDisponibilidad = async (req, res) => {
  const { id_medico, fecha } = req.query
  if (!id_medico || !fecha) {
    return res.status(400).json({ error: 'Se requieren id_medico y fecha.' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD.' })
  }
  try {
    const horarios = await getHorariosDisponibles(id_medico, fecha)
    res.json({ horarios })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener disponibilidad' })
  }
}

// ── POST /api/citas  (crear cita) ────────────────────────────────────────
const crearNuevaCita = async (req, res) => {
  const { id_medico, fecha, hora, rut, nombre, email } = req.body

  if (!id_medico || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: id_medico, fecha, hora.' })
  }

  const esAutenticado = !!req.usuario

  if (!esAutenticado && (!rut || !nombre || !email)) {
    return res.status(400).json({ error: 'Pacientes sin cuenta deben proporcionar rut, nombre y email.' })
  }

  try {
    // CORRECCIÓN AQUÍ: Si tiene cuenta, los campos de invitado DEBEN viajar como null
    const payload = esAutenticado
      ? { 
          id_paciente:     req.usuario.id,
          rut_paciente:    null,
          nombre_paciente: null,
          email_paciente:  null,
          id_medico, 
          fecha, 
          hora 
        }
      : { 
          id_paciente:     null,
          rut_paciente:    rut, 
          nombre_paciente: nombre, 
          email_paciente:  email, 
          id_medico, 
          fecha, 
          hora 
        }

    const cita = await crearCita(payload)

    // OBTENER INFORMACIÓN DEL MÉDICO Y ESPECIALIDAD PARA EL CORREO ELECTRONICO
    const { rows } = await pool.query(
      `SELECT p.nombre AS medico, e.nombre AS especialidad 
       FROM profesional p 
       JOIN especialidad e ON p.id_especialidad = e.id 
       WHERE p.id = $1`,
      [id_medico]
    )
    const infoMedico = rows[0] || { medico: 'Profesional', especialidad: 'General' }

    // DETERMINAR DESTINATARIO DEL CORREO
    const emailDestino = esAutenticado ? req.usuario.email : email
    let estadoNotif = 'Fallido'

    // LOGICA DE ENVÍO EXTERNO DE EMAIL
    try {
      if (emailDestino) {
        const fechaFormateada = typeof cita.fecha === 'object' 
          ? cita.fecha.toISOString().split('T')[0] 
          : cita.fecha;

        await enviarCorreo(
          emailDestino,
          `Confirmación de Reserva Médica - Cód: ${cita.codigo_referencia}`,
          plantillaConfirmacion({
            codigo: cita.codigo_referencia,
            medico: infoMedico.medico,
            especialidad: infoMedico.especialidad,
            fecha: fechaFormateada,
            hora: String(hora).slice(0, 5)
          })
        );
        estadoNotif = 'Enviado';
      }
    } catch (mailErr) {
      console.error('Error enviando correo SMTP Confirmación:', mailErr.message);
    }

    // REGISTRAR EN LA TABLA DE NOTIFICACIONES (REQUISITO EF 1)
    try {
      await pool.query(
        `INSERT INTO notificacion (id_cita, motivo, mensaje, estado) 
         VALUES ($1, 'Confirmacion', $2, $3)`,
        [
          cita.id,
          `Notificación de confirmación procesada para ${emailDestino}`,
          estadoNotif
        ]
      );
    } catch (dbErr) {
      console.error('Error al poblar entidad notificacion en creación:', dbErr.message);
    }

    res.status(201).json({
      mensaje: 'Cita agendada exitosamente.',
      codigo_referencia: cita.codigo_referencia,
      cita,
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese horario ya fue tomado. Por favor elija otro.' })
    }
    console.error(err)
    res.status(500).json({ error: 'Error al crear la cita' })
  }
}

// ── PATCH /api/citas/:codigo  (modificar fecha/hora) ─────────────────────
const actualizarCita = async (req, res) => {
  const { fecha, hora } = req.body
  const { codigo } = req.params

  if (!fecha || !hora) {
    return res.status(400).json({ error: 'Se requieren fecha y hora nuevas.' })
  }

  try {
    const citaActual = await getCitaPorCodigo(codigo)
    if (!citaActual) {
      return res.status(404).json({ error: 'Cita no encontrada.' })
    }

    if (citaActual.estado !== 'Agendada') {
      return res.status(409).json({
        error: 'La cita no puede modificarse porque ya está cancelada o cerrada.',
      })
    }

    const idEditor = req.usuario?.id || null
    const actualizada = await modificarCita(citaActual.id, fecha, hora, idEditor)

    if (!actualizada) {
      return res.status(409).json({
        error: 'La cita no puede modificarse porque ya está cancelada o cerrada.',
      })
    }

    const emailDestino = citaActual.email
    let estadoNotif = 'Fallido'

    try {
      if (emailDestino) {
        const fechaFormateada = typeof actualizada.fecha === 'object'
          ? actualizada.fecha.toISOString().split('T')[0]
          : actualizada.fecha

        await enviarCorreo(
          emailDestino,
          `Modificación de Hora Médica - Cód: ${citaActual.codigo_referencia}`,
          plantillaModificacion({
            codigo: citaActual.codigo_referencia,
            medico: citaActual.medico || 'Profesional',
            especialidad: citaActual.especialidad || 'Medicina General',
            fecha: fechaFormateada,
            hora: String(actualizada.hora || hora).slice(0, 5),
          })
        )
        estadoNotif = 'Enviado'
      }
    } catch (mailErr) {
      console.error('Error enviando correo SMTP Modificación:', mailErr.message)
    }

    try {
      await pool.query(
        `INSERT INTO notificacion (id_cita, motivo, mensaje, estado) 
         VALUES ($1, 'Modificacion', $2, $3)`,
        [
          citaActual.id,
          `Notificación de reprogramación procesada para ${emailDestino}`,
          estadoNotif,
        ]
      )
    } catch (dbErr) {
      console.error('Error al poblar entidad notificacion en modificación:', dbErr.message)
    }

    res.json({ mensaje: 'Cita modificada exitosamente.', cita: actualizada })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese horario ya fue tomado. Por favor elija otro.' })
    }
    console.error('Error interno al actualizar cita:', err)
    res.status(500).json({ error: 'Error interno al modificar la cita.' })
  }
}

// ── PATCH /api/citas/:codigo/cancelar  (cancelar) ────────────────────────
const cancelarCitaHandler = async (req, res) => {
  try {
    const cita = await getCitaPorCodigo(req.params.codigo)
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada.' })

    if (cita.estado === 'Cancelada') {
      return res.status(409).json({ error: 'La cita ya está cancelada.' })
    }

    const usuario = req.usuario
    if (usuario && !usuario.is_admin && cita.id_paciente !== usuario.id) {
      return res.status(403).json({ error: 'No tiene permiso para cancelar esta cita.' })
    }

    const cancelada = await cancelarCita(cita.id, usuario?.id || null)

    // GRACIAS A TU COALESCE: Extraemos directamente 'email' de forma segura
    const emailDestino = cita.email; 
    let estadoNotif = 'Fallido'

    // LÓGICA DE ENVÍO EXTERNO DE EMAIL (CANCELACIÓN)
    try {
      if (emailDestino) {
        const fechaFormateada = typeof cita.fecha === 'object' 
          ? cita.fecha.toISOString().split('T')[0] 
          : cita.fecha;

        await enviarCorreo(
          emailDestino,
          `Cancelación de Hora Médica - Cód: ${cita.codigo_referencia}`,
          plantillaCancelacion({
            codigo: cita.codigo_referencia,
            fecha: fechaFormateada,
            hora: String(cita.hora).slice(0, 5)
          })
        );
        estadoNotif = 'Enviado';
      }
    } catch (mailErr) {
      console.error('Error enviando correo SMTP Cancelación:', mailErr.message);
    }

    // REGISTRAR EN LA TABLA DE NOTIFICACIONES (REQUISITO EF 1)
    try {
      await pool.query(
        `INSERT INTO notificacion (id_cita, motivo, mensaje, estado) 
         VALUES ($1, 'Cancelacion', $2, $3)`,
        [
          cita.id,
          `Notificación de cancelación procesada para ${emailDestino}`,
          estadoNotif
        ]
      );
    } catch (dbErr) {
      console.error('Error al poblar entidad notificacion en cancelación:', dbErr.message);
    }

    res.json({ mensaje: 'Cita cancelada exitosamente.', cita: cancelada })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cancelar la cita' })
  }
}

// ── DELETE /api/citas/:codigo  (solo admin) ──────────────────────────────
const eliminarCitaHandler = async (req, res) => {
  try {
    const cita = await getCitaPorCodigo(req.params.codigo)
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada.' })

    const eliminada = await eliminarCita(cita.id)
    res.json({ mensaje: 'Cita eliminada permanentemente.', cita: eliminada })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar la cita.' })
  }
}

module.exports = {
  listarCitasUsuario,
  listarTodasCitas,
  obtenerCitaPorCodigo,
  obtenerDisponibilidad,
  crearNuevaCita,
  actualizarCita,
  cancelarCitaHandler,
  eliminarCitaHandler,
}