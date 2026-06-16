import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db'

// GET - Obtener un sueño específico
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const dream = await prisma.dream.findFirst({
      where: {
        id:     parseInt(id),
        userId: session.user.id,
      },
      include: {
        emotions: { include: { emotion: true } },
        tags:     { include: { tag: true } },
        symbols:  { include: { symbol: true } },
      },
    })

    if (!dream) {
      return NextResponse.json({ error: 'Sueño no encontrado' }, { status: 404 })
    }

    return NextResponse.json(dream)

  } catch (error) {
    console.error('Error al obtener sueño:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT - Editar un sueño
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const dream = await prisma.dream.findFirst({
      where: { id: parseInt(id), userId: session.user.id }
    })

    if (!dream) {
      return NextResponse.json({ error: 'Sueño no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { titulo, descripcion, intensidad, fecha, emociones, etiquetas, simbolos } = body

    // Eliminar relaciones anteriores
    await prisma.dreamEmotion.deleteMany({ where: { dreamId: parseInt(id) } })
    await prisma.dreamTag.deleteMany({     where: { dreamId: parseInt(id) } })
    await prisma.dreamSymbol.deleteMany({  where: { dreamId: parseInt(id) } })

    // Actualizar campos base y recrear relaciones
    const dreamActualizado = await prisma.dream.update({
      where: { id: parseInt(id) },
      data: {
        titulo,
        descripcion,
        intensidad: parseInt(intensidad),
        fecha:      new Date(fecha),

        emotions: emociones?.length ? {
          create: emociones.map(e => ({
            intensidad: e.intensidad,
            emotion:    { connect: { id: e.emotionId } },
          }))
        } : undefined,

        tags: etiquetas?.length ? {
          create: await Promise.all(etiquetas.map(async (nombre) => {
            const tag = await prisma.tag.upsert({
              where:  { nombre_userId: { nombre, userId: session.user.id } },
              update: {},
              create: { nombre, userId: session.user.id },
            })
            return { tag: { connect: { id: tag.id } } }
          }))
        } : undefined,

        symbols: simbolos?.length ? {
          create: await Promise.all(simbolos.map(async (nombre) => {
            const symbol = await prisma.symbol.upsert({
              where:  { nombre_userId: { nombre, userId: session.user.id } },
              update: { frecuencia: { increment: 1 } },
              create: { nombre, userId: session.user.id },
            })
            return { symbol: { connect: { id: symbol.id } } }
          }))
        } : undefined,
      },
      include: {
        emotions: { include: { emotion: true } },
        tags:     { include: { tag: true } },
        symbols:  { include: { symbol: true } },
      },
    })

    // Recalcular conexiones
    const { calcularConexiones } = await import('@/lib/connections')
    await calcularConexiones(parseInt(id), session.user.id)

    return NextResponse.json(dreamActualizado)

  } catch (error) {
    console.error('Error al editar sueño:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar un sueño
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const dream = await prisma.dream.findFirst({
      where: { id: parseInt(id), userId: session.user.id }
    })

    if (!dream) {
      return NextResponse.json({ error: 'Sueño no encontrado' }, { status: 404 })
    }

    await prisma.dream.delete({
      where: { id: parseInt(id)  }
    })

    return NextResponse.json({ mensaje: 'Sueño eliminado correctamente' })

  } catch (error) {
    console.error('Error al eliminar sueño:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}