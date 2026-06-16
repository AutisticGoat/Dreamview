import prisma from '@/lib/db'

export async function calcularConexiones(dreamId, userId) {
  // Obtener el sueño recién guardado con todas sus relaciones
  const suenoNuevo = await prisma.dream.findUnique({
    where: { id: dreamId },
    include: {
      emotions: true,
      tags:     true,
      symbols:  true,
    },
  })

  if (!suenoNuevo) return

  // Obtener todos los demás sueños del usuario
  const otrosSuenos = await prisma.dream.findMany({
    where: {
      userId,
      id: { not: dreamId },
    },
    include: {
      emotions: true,
      tags:     true,
      symbols:  true,
    },
  })

  for (const otro of otrosSuenos) {
    let puntuacion = 0

    // +3 por cada etiqueta compartida
    const tagsNuevo = suenoNuevo.tags.map(t => t.tagId)
    const tagsOtro  = otro.tags.map(t => t.tagId)
    const tagsCompartidas = tagsNuevo.filter(id => tagsOtro.includes(id))
    puntuacion += tagsCompartidas.length * 3

    // +2 por cada emoción compartida
    const emotionsNuevo = suenoNuevo.emotions.map(e => e.emotionId)
    const emotionsOtro  = otro.emotions.map(e => e.emotionId)
    const emotionsCompartidas = emotionsNuevo.filter(id => emotionsOtro.includes(id))
    puntuacion += emotionsCompartidas.length * 2

    // +2 por cada símbolo compartido
    const symbolsNuevo = suenoNuevo.symbols.map(s => s.symbolId)
    const symbolsOtro  = otro.symbols.map(s => s.symbolId)
    const symbolsCompartidos = symbolsNuevo.filter(id => symbolsOtro.includes(id))
    puntuacion += symbolsCompartidos.length * 2

    // +1 si están dentro de los mismos 7 días
    const diffDias = Math.abs(
      (new Date(suenoNuevo.fecha) - new Date(otro.fecha)) / (1000 * 60 * 60 * 24)
    )
    if (diffDias <= 7) puntuacion += 1

    // Solo guardar si la puntuación es suficiente
    if (puntuacion >= 4) {
      const [idA, idB] = [dreamId, otro.id].sort((a, b) => a - b)

      await prisma.dreamConnection.upsert({
        where:  { dreamIdA_dreamIdB: { dreamIdA: idA, dreamIdB: idB } },
        update: { puntuacion },
        create: { dreamIdA: idA, dreamIdB: idB, puntuacion },
      })
    }
  }
}