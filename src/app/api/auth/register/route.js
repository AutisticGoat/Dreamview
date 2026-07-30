import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { z } from 'zod'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const registerSchema = z.object({
  nombre:   z.string().min(2,  'El nombre debe tener al menos 2 caracteres'),
  email:    z.string().email(  'Email inválido'),
  password: z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
  .regex(/[0-9]/, 'La contraseña debe tener al menos un número')
  .regex(/[^a-zA-Z0-9]/, 'La contraseña debe tener al menos un carácter especial'),
})

export async function POST(request) {
  try {
    const body = await request.json()

    const validacion = registerSchema.safeParse(body)
    if (!validacion.success) {
      return NextResponse.json(
        { error: validacion.error.errors[0].message },
        { status: 400 }
      )
    }

    const { nombre, email, password } = validacion.data

    const usuarioExistente = await prisma.user.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese email' },
        { status: 400 }
      )
    }

    const passwordEncriptada = await bcrypt.hash(password, 12)

    const { randomBytes } = await import('crypto')
    const tokenVerificacion = randomBytes(32).toString('hex')

    const nuevoUsuario = await prisma.user.create({
      data: { nombre, email, password: passwordEncriptada, tokenVerificacion, }
    })

    await resend.emails.send({
    from:    'DreamView <onboarding@resend.dev>',
    to:      email,
    subject: 'Verifica tu cuenta en DreamView',
    html:    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6655cc;">Bienvenido a DreamView</h2>
        <p>Hola ${nombre}, gracias por registrarte.</p>
        <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${process.env.NEXTAUTH_URL}/auth/verify/${tokenVerificacion}"
          style="display: inline-block; background: #6655cc; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Verificar cuenta
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Si no creaste esta cuenta puedes ignorar este correo.
        </p>
      </div>
    `,
  })

    return NextResponse.json(
      { mensaje: 'Cuenta creada correctamente', id: nuevoUsuario.id },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}