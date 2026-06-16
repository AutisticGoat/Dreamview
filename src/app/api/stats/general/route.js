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

    const dreams = await prisma.dream.findMany({
      where:   { userId },
      include: {
        emotions: { include: { emotion: true } },
        tags:     { include: { tag: true } },
        symbols:  { include: { symbol: true } },
      },
      orderBy: { fecha: 'desc' },
    })

    const total = dreams.length

    if (total === 0) {
      return NextResponse.json({ total: 0 })
    }

    // Intensidad promedio
    const intensidadPromedio = parseFloat(
      (dreams.reduce((sum, d) => sum + d.intensidad, 0) / total).toFixed(1)
    )

    // Emoción más frecuente
    const conteoEmociones = {}
    dreams.forEach(d => {
      d.emotions.forEach(e => {
        const nombre = e.emotion.nombre
        const color  = e.emotion.colorHex
        if (!conteoEmociones[nombre]) conteoEmociones[nombre] = { count: 0, color }
        conteoEmociones[nombre].count++
      })
    })
    const topEmocion = Object.entries(conteoEmociones)
      .sort((a, b) => b[1].count - a[1].count)[0]

    // Símbolo más frecuente
    const conteoSimbolos = {}
    dreams.forEach(d => {
      d.symbols.forEach(s => {
        const nombre = s.symbol.nombre
        if (!conteoSimbolos[nombre]) conteoSimbolos[nombre] = 0
        conteoSimbolos[nombre]++
      })
    })
    const topSimbolo = Object.entries(conteoSimbolos)
      .sort((a, b) => b[1] - a[1])[0]

    // Etiqueta más frecuente
    const conteoEtiquetas = {}
    dreams.forEach(d => {
      d.tags.forEach(t => {
        const nombre = t.tag.nombre
        if (!conteoEtiquetas[nombre]) conteoEtiquetas[nombre] = 0
        conteoEtiquetas[nombre]++
      })
    })
    const topEtiqueta = Object.entries(conteoEtiquetas)
      .sort((a, b) => b[1] - a[1])[0]

    // Mes con más sueños
    const conteoMeses = {}
    dreams.forEach(d => {
      const fecha = new Date(d.fecha)
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      if (!conteoMeses[clave]) conteoMeses[clave] = 0
      conteoMeses[clave]++
    })
    const topMes = Object.entries(conteoMeses)
      .sort((a, b) => b[1] - a[1])[0]

    // Top 5 emociones
    const topEmociones = Object.entries(conteoEmociones)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([nombre, data]) => ({ nombre, count: data.count, color: data.color }))

    // Top 5 símbolos
    const topSimbolos = Object.entries(conteoSimbolos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, count]) => ({ nombre, count }))

    // Top 5 etiquetas
    const topEtiquetas = Object.entries(conteoEtiquetas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, count]) => ({ nombre, count }))

    // Conexiones totales
    const dreamIds = dreams.map(d => d.id)
    const conexiones = dreamIds.length === 0 ? 0 : await prisma.dreamConnection.count({
    where: {
        OR: [
        { dreamIdA: { in: dreamIds } },
        { dreamIdB: { in: dreamIds } },
        ]
    }
    })

    return NextResponse.json({
      total,
      intensidadPromedio,
      topEmocion:  topEmocion  ? { nombre: topEmocion[0],  ...topEmocion[1]  } : null,
      topSimbolo:  topSimbolo  ? { nombre: topSimbolo[0],  count: topSimbolo[1]  } : null,
      topEtiqueta: topEtiqueta ? { nombre: topEtiqueta[0], count: topEtiqueta[1] } : null,
      topMes:      topMes      ? { mes: topMes[0], count: topMes[1] } : null,
      topEmociones,
      topSimbolos,
      topEtiquetas,
      conexiones,
    })

  } catch (error) {
    console.error('Error en estadísticas generales:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}1