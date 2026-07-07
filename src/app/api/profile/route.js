import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const profileSchema = z.object({
  nombre:          z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email:           z.string().email('Email inválido'),
  passwordActual:  z.string().optional(),
  passwordNueva: z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
  .regex(/[0-9]/, 'La contraseña debe tener al menos un número')
  .regex(/[^a-zA-Z0-9]/, 'La contraseña debe tener al menos un carácter especial')
  .optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { id: true, nombre: true, email: true, creadoEn: true },
    })

    return NextResponse.json(user)

  } catch (error) {
    console.error('Error al obtener perfil:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const validacion = profileSchema.safeParse(body)
    if (!validacion.success) {
      return NextResponse.json(
        { error: validacion.error.errors[0].message },
        { status: 400 }
      )
    }

    const { nombre, email, passwordActual, passwordNueva } = validacion.data

    // Verificar si el email ya está en uso por otro usuario
    const emailExistente = await prisma.user.findFirst({
      where: { email, id: { not: session.user.id } }
    })

    if (emailExistente) {
      return NextResponse.json(
        { error: 'Ese email ya está en uso por otra cuenta' },
        { status: 400 }
      )
    }

    // Si quiere cambiar contraseña
    if (passwordNueva) {
      if (!passwordActual) {
        return NextResponse.json(
          { error: 'Debes ingresar tu contraseña actual para cambiarla' },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      const passwordCorrecta = await bcrypt.compare(passwordActual, user.password)
      if (!passwordCorrecta) {
        return NextResponse.json(
          { error: 'La contraseña actual es incorrecta' },
          { status: 400 }
        )
      }
    }

    const data = { nombre, email }

    if (passwordNueva) {
      data.password = await bcrypt.hash(passwordNueva, 12)
    }

    const userActualizado = await prisma.user.update({
      where:  { id: session.user.id },
      data,
      select: { id: true, nombre: true, email: true },
    })

    return NextResponse.json({
      mensaje: 'Perfil actualizado correctamente',
      user:    userActualizado,
    })

  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: session.user.id }
    })

    return NextResponse.json({ mensaje: 'Cuenta eliminada correctamente' })

  } catch (error) {
    console.error('Error al eliminar cuenta:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}