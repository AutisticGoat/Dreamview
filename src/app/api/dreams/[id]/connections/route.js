import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const dreamId = parseInt(id)

    // Verificar que el sueño pertenece al usuario
    const dream = await prisma.dream.findFirst({
      where: { id: dreamId, userId: session.user.id }
    })

    if (!dream) {
      return NextResponse.json({ error: 'Sueño no encontrado' }, { status: 404 })
    }

    // Buscar conexiones donde el sueño aparece como A o como B
    const conexiones = await prisma.dreamconnection.findMany({
      where: {
        OR: [
          { dreamIdA: dreamId },
          { dreamIdB: dreamId },
        ]
      },
      orderBy: { puntuacion: 'desc' },
    })

    // Para cada conexión, obtener los datos del sueño conectado
    const resultado = await Promise.all(
      conexiones.map(async (conexion) => {
        const idConectado = conexion.dreamIdA === dreamId
          ? conexion.dreamIdB
          : conexion.dreamIdA

        const suenoConectado = await prisma.dream.findUnique({
          where: { id: idConectado },
          include: {
            emotions: { include: { emotion: true } },
            tags:     { include: { tag: true } },
            symbols:  { include: { symbol: true } },
          },
        })

        return {
          puntuacion:     conexion.puntuacion,
          suenoConectado,
        }
      })
    )

    return NextResponse.json(resultado)

  } catch (error) {
    console.error('Error al obtener conexiones:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}