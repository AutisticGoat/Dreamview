import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  nombre:   z.string().min(2,  'El nombre debe tener al menos 2 caracteres'),
  email:    z.string().email(  'Email inválido'),
  password: z.string().min(6,  'La contraseña debe tener al menos 6 caracteres'),
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

    const nuevoUsuario = await prisma.user.create({
      data: {
        nombre,
        email,
        password: passwordEncriptada,
      }
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