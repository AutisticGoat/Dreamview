import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { calcularConexiones } from '@/lib/connections'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db'
import { z } from 'zod'

const dreamSchema = z.object({
  titulo:      z.string().min(1, 'El título es obligatorio'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  intensidad:  z.number().min(1).max(5),
  fecha:       z.string(),
  emociones:   z.array(z.object({
    emotionId:  z.number(),
    intensidad: z.number().min(1).max(5),
  })).optional(),
  etiquetas: z.array(z.string()).optional(),
  simbolos:  z.array(z.string()).optional(),
})

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const busqueda  = searchParams.get('q')         || ''
    const emocion   = searchParams.get('emocion')   || ''
    const etiqueta  = searchParams.get('etiqueta')  || ''
    const simbolo   = searchParams.get('simbolo')   || ''
    const fechaDesde = searchParams.get('desde')    || ''
    const fechaHasta = searchParams.get('hasta')    || ''
    const page  = parseInt(searchParams.get('page')  || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip  = (page - 1) * limit

    const where = {
      userId: session.user.id,
      ...(busqueda && {
        OR: [
          { titulo:      { contains: busqueda } },
          { descripcion: { contains: busqueda } },
        ]
      }),
      ...(emocion  && { emotions: { some: { emotion: { nombre: emocion } } } }),
      ...(etiqueta && { tags:     { some: { tag:     { nombre: etiqueta } } } }),
      ...(simbolo  && { symbols:  { some: { symbol:  { nombre: simbolo  } } } }),
      ...(fechaDesde || fechaHasta ? {
        fecha: {
          ...(fechaDesde && { gte: new Date(fechaDesde) }),
          ...(fechaHasta && { lte: new Date(fechaHasta) }),
        }
      } : {}),
    }

    const [dreams, total] = await Promise.all([
      prisma.dream.findMany({
        where,
        include: {
          emotions: { include: { emotion: true } },
          tags:     { include: { tag: true } },
          symbols:  { include: { symbol: true } },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dream.count({ where }),
    ])

    return NextResponse.json({
      dreams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })

  } catch (error) {
    console.error('Error al obtener sueños:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear un nuevo sueño
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const validacion = dreamSchema.safeParse(body)
    if (!validacion.success) {
      return NextResponse.json(
        { error: validacion.error.errors[0].message },
        { status: 400 }
      )
    }

    const { titulo, descripcion, intensidad, fecha, emociones, etiquetas, simbolos } = validacion.data

    const dream = await prisma.dream.create({
      data: {
        titulo,
        descripcion,
        intensidad,
        fecha:  new Date(fecha),
        userId: session.user.id,

        // Conectar emociones
        emotions: emociones?.length ? {
          create: emociones.map(e => ({
            intensidad: e.intensidad,
            emotion:    { connect: { id: e.emotionId } },
          }))
        } : undefined,

        // Crear o reutilizar etiquetas
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

        // Crear o reutilizar símbolos
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

    await calcularConexiones(dream.id, session.user.id)

    return NextResponse.json(dream, { status: 201 })

  } catch (error) {
    console.error('Error al crear sueño:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}