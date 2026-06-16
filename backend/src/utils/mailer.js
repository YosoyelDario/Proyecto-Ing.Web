const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const enviarCorreo = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Municipalidad Santo Domingo" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}

const plantillaConfirmacion = (cita) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4faf9;border-radius:12px">
    <h2 style="color:#3aada0;margin-bottom:8px">✅ Cita Confirmada</h2>
    <p style="color:#5a7e7b;margin-bottom:24px">Tu hora médica fue agendada exitosamente en la Municipalidad de Santo Domingo.</p>
    <div style="background:white;border-radius:8px;padding:24px;border:1px solid #d5dce6">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px">CÓDIGO</td>
            <td style="padding:8px 0;font-weight:600;color:#3aada0;font-family:monospace">${cita.codigo}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">ESPECIALIDAD</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.especialidad}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">MÉDICO</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.medico}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">FECHA</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.fecha}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">HORA</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.hora}</td></tr>
      </table>
    </div>
    <p style="color:#7a8a9a;font-size:13px;margin-top:24px">
      Guarda tu código <strong style="color:#3aada0">${cita.codigo}</strong> — lo necesitarás para modificar o cancelar tu cita.
    </p>
    <p style="color:#a8c5c2;font-size:11px;margin-top:32px">Municipalidad de Santo Domingo · Sistema de Citas Médicas</p>
  </div>
`

const plantillaCancelacion = (cita) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff5f5;border-radius:12px">
    <h2 style="color:#e05c5c;margin-bottom:8px">❌ Cita Cancelada</h2>
    <p style="color:#5a7e7b;margin-bottom:24px">Tu hora médica ha sido cancelada en la Municipalidad de Santo Domingo.</p>
    <div style="background:white;border-radius:8px;padding:24px;border:1px solid #fcd5d5">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px">CÓDIGO</td>
            <td style="padding:8px 0;font-weight:600;color:#e05c5c;font-family:monospace">${cita.codigo}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">FECHA</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.fecha}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">HORA</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.hora}</td></tr>
      </table>
    </div>
    <p style="color:#7a8a9a;font-size:13px;margin-top:24px">
      Si deseas reagendar, visita nuestro sistema de citas.
    </p>
    <p style="color:#a8c5c2;font-size:11px;margin-top:32px">Municipalidad de Santo Domingo · Sistema de Citas Médicas</p>
  </div>
`

const plantillaModificacion = (cita) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4faf9;border-radius:12px">
    <h2 style="color:#3aada0;margin-bottom:8px">⚠️ Cita Reprogramada</h2>
    <p style="color:#5a7e7b;margin-bottom:24px">Te informamos que tu cita médica fue modificada en el sistema.</p>
    <div style="background:white;border-radius:8px;padding:24px;border:1px solid #d5dce6">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px">CÓDIGO</td>
            <td style="padding:8px 0;font-weight:600;color:#3aada0;font-family:monospace">${cita.codigo}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">MÉDICO</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.medico}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">ESPECIALIDAD</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.especialidad}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">NUEVA FECHA</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.fecha}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px;border-top:1px solid #eef4f9">NUEVA HORA</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;border-top:1px solid #eef4f9">${cita.hora}</td></tr>
      </table>
    </div>
    <p style="color:#7a8a9a;font-size:13px;margin-top:24px">
      Si necesitas revisar tu reserva, utiliza tu código <strong style="color:#3aada0">${cita.codigo}</strong>.
    </p>
    <p style="color:#a8c5c2;font-size:11px;margin-top:32px">Municipalidad de Santo Domingo · Sistema de Citas Médicas</p>
  </div>
`
const plantillaRegistro = (nombre) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4faf9;border-radius:12px">
    <h2 style="color:#3aada0;margin-bottom:8px">🎉 Cuenta Creada Exitosamente</h2>
    <p style="color:#5a7e7b;margin-bottom:24px">Hola ${nombre}, tu cuenta en el sistema de agendamiento médico de la Municipalidad de Santo Domingo ha sido creada.</p>
    <p style="color:#7a8a9a;font-size:13px;margin-top:24px">Ya puedes iniciar sesión para agendar, modificar o cancelar tus citas.</p>
    <p style="color:#a8c5c2;font-size:11px;margin-top:32px">Municipalidad de Santo Domingo · Sistema de Citas Médicas</p>
  </div>
`

const plantillaLogin = (nombre, fecha) => `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4faf9;border-radius:12px">
    <h2 style="color:#3aada0;margin-bottom:8px">🔔 Nuevo Inicio de Sesión</h2>
    <p style="color:#5a7e7b;margin-bottom:24px">Hola ${nombre}, hemos detectado un nuevo inicio de sesión en tu cuenta.</p>
    <div style="background:white;border-radius:8px;padding:24px;border:1px solid #d5dce6">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#7a8a9a;font-size:13px">FECHA Y HORA</td>
            <td style="padding:8px 0;font-weight:500;color:#1a2332;">${fecha}</td></tr>
      </table>
    </div>
    <p style="color:#7a8a9a;font-size:13px;margin-top:24px">Si no fuiste tú, te recomendamos cambiar tu contraseña inmediatamente.</p>
    <p style="color:#a8c5c2;font-size:11px;margin-top:32px">Municipalidad de Santo Domingo · Sistema de Citas Médicas</p>
  </div>
`

// Actualizar el module.exports
module.exports = { 
  enviarCorreo, 
  plantillaConfirmacion, 
  plantillaCancelacion, 
  plantillaModificacion,
  plantillaRegistro,
  plantillaLogin
}