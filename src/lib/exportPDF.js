import jsPDF from 'jspdf'

function limpiarTexto(texto) {
  return texto?.replace(/[^\x00-\x7F]/g, c => {
    const map = {
      'á':'a','é':'e','í':'i','ó':'o','ú':'u',
      'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U',
      'ñ':'n','Ñ':'N','ü':'u','Ü':'U',
      '¿':'?','¡':'!','–':'-','—':'-',
    }
    return map[c] ?? ''
  }) ?? ''
}

export async function exportarSuenosPDF({ dreams, desde, hasta }) {
  const doc    = new jsPDF({ unit: 'mm', format: 'a4' })
  const W      = doc.internal.pageSize.getWidth()
  const H      = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxW   = W - margin * 2
  let y        = margin

  const saltoSiNecesario = (alto = 10) => {
    if (y + alto > H - margin) {
      doc.addPage()
      y = margin
    }
  }

  const titulo = (texto, size = 14, color = [180, 170, 240]) => {
    saltoSiNecesario(12)
    doc.setFontSize(size)
    doc.setTextColor(...color)
    doc.text(limpiarTexto(texto), margin, y)
    y += size * 0.5
  }

  const parrafo = (texto, size = 10, color = [150, 150, 180]) => {
    saltoSiNecesario(8)
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lineas = doc.splitTextToSize(limpiarTexto(texto), maxW)
    lineas.forEach(linea => {
      saltoSiNecesario(6)
      doc.text(linea, margin, y)
      y += size * 0.45
    })
  }

  const separador = () => {
    saltoSiNecesario(8)
    doc.setDrawColor(40, 40, 80)
    doc.setLineWidth(0.2)
    doc.line(margin, y, W - margin, y)
    y += 6
  }

  // Portada
  doc.setFillColor(7, 7, 26)
  doc.rect(0, 0, W, H, 'F')

  doc.setFontSize(28)
  doc.setTextColor(180, 170, 240)
  doc.text('DreamView', W / 2, 80, { align: 'center' })

  doc.setFontSize(14)
  doc.setTextColor(100, 100, 160)
  doc.text('Archivo Digital de Suenos', W / 2, 95, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(80, 80, 120)
  const rango = desde && hasta
    ? `${desde} - ${hasta}`
    : `${dreams.length} suenos exportados`
  doc.text(rango, W / 2, 110, { align: 'center' })

  doc.setFontSize(9)
  doc.text(
    new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
    W / 2, 120, { align: 'center' }
  )

  // Páginas de sueños
  dreams.forEach((dream, idx) => {
    doc.addPage()
    doc.setFillColor(7, 7, 26)
    doc.rect(0, 0, W, H, 'F')
    y = margin

    titulo(`${idx + 1}. ${dream.titulo}`, 16)
    y += 2

    const fecha = new Date(dream.fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
    parrafo(`${fecha}  |  Intensidad: ${dream.intensidad}/5`, 9, [120, 110, 180])
    y += 4

    separador()
    parrafo(dream.descripcion, 10, [160, 155, 200])
    y += 4

    if (dream.emotions?.length > 0) {
      separador()
      titulo('Emociones', 11)
      parrafo(
        dream.emotions.map(e => `${e.emotion.nombre} (${e.intensidad}/5)`).join('  |  '),
        9, [140, 130, 200]
      )
    }

    if (dream.tags?.length > 0) {
      separador()
      titulo('Etiquetas', 11)
      parrafo(dream.tags.map(t => `#${t.tag.nombre}`).join('  '), 9, [100, 100, 180])
    }

    if (dream.symbols?.length > 0) {
      separador()
      titulo('Simbolos', 11)
      parrafo(dream.symbols.map(s => s.symbol.nombre).join('  |  '), 9, [100, 120, 180])
    }

    if (dream.interpretacion) {
      separador()
      titulo('Interpretacion', 11)
      parrafo(dream.interpretacion, 9, [140, 120, 200])
    }
  })

  const nombreArchivo = desde && hasta
    ? `dreamview_${desde}_${hasta}.pdf`
    : `dreamview_${new Date().toISOString().split('T')[0]}.pdf`

  doc.save(nombreArchivo)
}