import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Obtener todos los sueños del usuario
    const dreams = await prisma.dream.findMany({
      where:   { userId },
      include: {
        emotions: { include: { emotion: true } },
        tags:     { include: { tag: true } },
        symbols:  { include: { symbol: true } },
      },
    })

    // Obtener todas las conexiones
    const dreamIds = dreams.map(d => d.id)

    const conexiones = dreamIds.length === 0 ? [] : await prisma.dreamConnection.findMany({
      where: {
        OR: [
          { dreamIdA: { in: dreamIds } },
          { dreamIdB: { in: dreamIds } },
        ]
      }
    })

    // Construir nodos
    const nodos = dreams.map(dream => ({
      id:         dream.id,
      titulo:     dream.titulo,
      intensidad: dream.intensidad,
      fecha:      dream.fecha,
      emocion:    dream.emotions[0]?.emotion ?? null,
      }))

    // Construir enlaces
    const enlaces = conexiones.map(c => ({
      source:     c.dreamIdA,
      target:     c.dreamIdB,
      puntuacion: c.puntuacion,
    }))

    return NextResponse.json({ nodos, enlaces })

  } catch (error) {
    console.error('Error al obtener grafo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}