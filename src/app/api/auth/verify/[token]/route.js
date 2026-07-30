import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request, { params }) {
  try {
    const { token } = await params

    const user = await prisma.user.findUnique({
      where: { tokenVerificacion: token }
    })

    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificado:   true,
        tokenVerificacion: null,
      }
    })

    return NextResponse.json({ mensaje: 'Cuenta verificada correctamente' })

  } catch (error) {
    console.error('Error al verificar:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}