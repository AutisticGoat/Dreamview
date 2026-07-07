import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year  = parseInt(searchParams.get('year')  || new Date().getFullYear())
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1)

    const inicio = new Date(year, month - 1, 1)
    const fin    = new Date(year, month, 0, 23, 59, 59)

    const dreams = await prisma.dream.findMany({
      where: {
        userId: session.user.id,
        fecha:  { gte: inicio, lte: fin },
      },
      select: {
        id:         true,
        titulo:     true,
        fecha:      true,
        intensidad: true,
      },
      orderBy: { fecha: 'asc' },
    })

    // Agrupar por día
    const porDia = {}
    dreams.forEach(d => {
      const dia = new Date(d.fecha).getDate()
      if (!porDia[dia]) porDia[dia] = { sueños: [], intensidadPromedio: 0 }
      porDia[dia].sueños.push({ id: d.id, titulo: d.titulo, intensidad: d.intensidad })
    })

    // Calcular intensidad promedio por día
    Object.keys(porDia).forEach(dia => {
      const total = porDia[dia].sueños.reduce((sum, s) => sum + s.intensidad, 0)
      porDia[dia].intensidadPromedio = parseFloat((total / porDia[dia].sueños.length).toFixed(1))
    })

    return NextResponse.json({
      year,
      month,
      diasEnMes: new Date(year, month, 0).getDate(),
      primerDia: new Date(year, month - 1, 1).getDay(),
      porDia,
    })

  } catch (error) {
    console.error('Error en calendario:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}