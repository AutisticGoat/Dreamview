import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function enviarCorreoVerificacion({ nombre, email, token }) {
  const url = `${process.env.NEXTAUTH_URL}/auth/verify/${token}`

  await transporter.sendMail({
    from:    `"DreamView" <${process.env.GMAIL_USER}>`,
    to:      email,
    subject: 'Verifica tu cuenta en DreamView',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6655cc;">Bienvenido a DreamView</h2>
        <p>Hola ${escaparHtml(nombre)}, gracias por registrarte.</p>
        <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${url}"
           style="display: inline-block; background: #6655cc; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Verificar cuenta
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Si no creaste esta cuenta puedes ignorar este correo.
        </p>
      </div>
    `,
  })
}