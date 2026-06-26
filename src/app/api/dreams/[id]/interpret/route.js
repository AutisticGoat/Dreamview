import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const dreamId = parseInt(id)

    const dream = await prisma.dream.findFirst({
      where: { id: dreamId, userId: session.user.id },
      include: {
        emotions: { include: { emotion: true } },
        tags:     { include: { tag: true } },
        symbols:  { include: { symbol: true } },
      },
    })

    if (!dream) {
      return NextResponse.json({ error: 'Sueño no encontrado' }, { status: 404 })
    }

    // Si ya tiene interpretación, devolverla sin llamar a Gemini
    if (dream.interpretacion) {
      return NextResponse.json({ interpretacion: dream.interpretacion })
    }

    // Obtener los 3 sueños más conectados
    const conexiones = await prisma.dreamConnection.findMany({
      where: {
        OR: [
          { dreamIdA: dreamId },
          { dreamIdB: dreamId },
        ]
      },
      orderBy: { puntuacion: 'desc' },
      take: 3,
    })

    const suenosConectados = await Promise.all(
      conexiones.map(async (c) => {
        const idConectado = c.dreamIdA === dreamId ? c.dreamIdB : c.dreamIdA
        const sueno = await prisma.dream.findUnique({
          where:  { id: idConectado },
          select: { titulo: true },
        })
        return { titulo: sueno?.titulo ?? '', puntuacion: c.puntuacion }
      })
    )

    // Construir prompt
    const descripcionTruncada = dream.descripcion.slice(0, 500)
    const emociones  = dream.emotions.map(e => `${e.emotion.nombre} (intensidad ${e.intensidad}/5)`).join(', ')
    const simbolos   = dream.symbols.map(s => s.symbol.nombre).join(', ')
    const etiquetas  = dream.tags.map(t => t.tag.nombre).join(', ')
    const conectados = suenosConectados.map(s => `"${s.titulo}" (conexión: ${s.puntuacion} pts)`).join(', ')

    const prompt = `Eres un analista de sueños con conocimientos en psicología. Analiza el siguiente sueño y proporciona una interpretación concisa en español.

SUEÑO: ${dream.titulo}
DESCRIPCIÓN: ${descripcionTruncada}
INTENSIDAD: ${dream.intensidad}/5
EMOCIONES: ${emociones  || 'ninguna'}
SÍMBOLOS:  ${simbolos   || 'ninguno'}
ETIQUETAS: ${etiquetas  || 'ninguna'}
${conectados ? `SUEÑOS RELACIONADOS: ${conectados}` : ''}

Responde en este formato exacto:
INTERPRETACIÓN GENERAL: (2-3 oraciones)
SÍMBOLOS: (1-2 oraciones sobre los símbolos presentes)
ANÁLISIS EMOCIONAL: (1-2 oraciones)
${conectados ? 'PATRONES RECURRENTES: (1-2 oraciones considerando los sueños relacionados)' : ''}`

    // Llamar a Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents:         [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400 },
        }),
      }
    )

    const geminiData    = await response.json()
    const interpretacion = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!interpretacion) {
      return NextResponse.json({ error: 'No se pudo generar la interpretación' }, { status: 500 })
    }

    // Guardar en base de datos
    await prisma.dream.update({
      where: { id: dreamId },
      data:  { interpretacion, interpretadoEn: new Date() },
    })

    return NextResponse.json({ interpretacion })

  } catch (error) {
    console.error('Error completo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    await prisma.dream.update({
      where: { id: parseInt(id) },
      data:  { interpretacion: null, interpretadoEn: null },
    })

    return NextResponse.json({ mensaje: 'Interpretación eliminada' })

  } catch (error) {
    console.error('Error al eliminar interpretación:', error.message)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}