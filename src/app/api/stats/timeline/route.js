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

    const dreams = await prisma.dream.findMany({
      where:   { userId: session.user.id },
      include: { emotions: { include: { emotion: true } } },
      orderBy: { fecha: 'asc' },
    })

    // Agrupar por mes
    const porMes = {}

    dreams.forEach(dream => {
      const fecha = new Date(dream.fecha)
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`

      if (!porMes[clave]) {
        porMes[clave] = {
          mes:        clave,
          total:      0,
          intensidad: 0,
          emociones:  {},
        }
      }

      porMes[clave].total      += 1
      porMes[clave].intensidad += dream.intensidad

      dream.emotions.forEach(e => {
        const nombre = e.emotion.nombre
        const color  = e.emotion.colorHex
        if (!porMes[clave].emociones[nombre]) {
          porMes[clave].emociones[nombre] = { count: 0, color }
        }
        porMes[clave].emociones[nombre].count += e.intensidad
      })
    })

    // Convertir a array para Recharts
    const resultado = Object.values(porMes).map(mes => {
      const emocionesPrincipales = Object.entries(mes.emociones)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)

      const entry = {
        mes:        mes.mes,
        total:      mes.total,
        intensidad: parseFloat((mes.intensidad / mes.total).toFixed(1)),
      }

      emocionesPrincipales.forEach(([nombre, data]) => {
        entry[nombre] = data.count
      })

      return entry
    })

    // Obtener todas las emociones únicas con sus colores
    const todasEmociones = {}
    dreams.forEach(dream => {
      dream.emotions.forEach(e => {
        todasEmociones[e.emotion.nombre] = e.emotion.colorHex
      })
    })

    return NextResponse.json({ timeline: resultado, emociones: todasEmociones })

  } catch (error) {
    console.error('Error al obtener timeline:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}