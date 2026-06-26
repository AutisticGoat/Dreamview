'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

export default function DreamGraph({ nodos, enlaces, onNodeClick, filtroEmocion, umbral }) {
  const svgRef       = useRef(null)
  const simRef       = useRef(null)
  const hoverTimer   = useRef(null)
  const [menu, setMenu]       = useState({ visible: false, x: 0, y: 0, data: null })
  const [anclados, setAnclados] = useState(new Set())
  const nodosRef     = useRef({})

  const nodosFiltrados = filtroEmocion
    ? nodos.filter(n => n.emocion?.nombre === filtroEmocion)
    : nodos

  const idsFiltrados = new Set(nodosFiltrados.map(n => n.id))

  const enlacesFiltrados = enlaces.filter(e =>
    e.puntuacion >= umbral &&
    idsFiltrados.has(e.source?.id ?? e.source) &&
    idsFiltrados.has(e.target?.id ?? e.target)
  )

  useEffect(() => {
    if (!nodosFiltrados?.length || !svgRef.current) return

    const el     = svgRef.current
    const width  = el.clientWidth  || 800
    const height = el.clientHeight || 500

    d3.select(el).selectAll('*').remove()

    const svg       = d3.select(el).attr('width', width).attr('height', height)
    const zoomGroup = svg.append('g')

    const zoomBehavior = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => zoomGroup.attr('transform', event.transform))

    svg.call(zoomBehavior)

    // Guardar referencia al zoom para centrar nodos
    simRef.current = { zoomBehavior, svg, zoomGroup, width, height }

    const nodosClone   = nodosFiltrados.map(n => ({ ...n }))
    const enlacesClone = enlacesFiltrados.map(e => ({ ...e }))

    const simulation = d3.forceSimulation(nodosClone)
      .force('link',      d3.forceLink(enlacesClone).id(d => d.id).distance(d => 180 - d.puntuacion * 10))
      .force('charge',    d3.forceManyBody().strength(-200))
      .force('center',    d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    const link = zoomGroup.append('g')
      .selectAll('line')
      .data(enlacesClone)
      .join('line')
      .attr('stroke',         '#6655cc')
      .attr('stroke-opacity', d => Math.min(0.05 + d.puntuacion * 0.04, 0.35))
      .attr('stroke-width',   d => Math.min(d.puntuacion * 0.3, 2))

    const node = zoomGroup.append('g')
      .selectAll('g')
      .data(nodosClone)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            if (!anclados.has(d.id)) {
              d.fx = null
              d.fy = null
            }
          })
      )

    // Halo exterior
    node.append('circle')
      .attr('r',              d => 10 + d.intensidad * 2.5)
      .attr('fill',           d => d.emocion ? d.emocion.colorHex + '15' : '#6655cc15')
      .attr('stroke',         d => d.emocion ? d.emocion.colorHex : '#6655cc')
      .attr('stroke-width',   0.5)
      .attr('stroke-opacity', 0.3)

    // Círculo interior
    node.append('circle')
      .attr('r',            d => 6 + d.intensidad * 1.5)
      .attr('fill',         d => d.emocion ? d.emocion.colorHex + '33' : '#6655cc33')
      .attr('stroke',       d => d.emocion ? d.emocion.colorHex : '#6655cc')
      .attr('stroke-width', 0.8)

    // Punto central
    node.append('circle')
      .attr('r',       3)
      .attr('fill',    d => d.emocion ? d.emocion.colorHex : '#6655cc')
      .attr('opacity', 0.8)

    // Indicador de anclado
    node.append('circle')
      .attr('class',        'anchor-ring')
      .attr('r',            d => anclados.has(d.id) ? 14 : 0)
      .attr('fill',         'transparent')
      .attr('stroke',       '#ffffff55')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')

    // Etiqueta
    node.append('text')
      .text(d => d.titulo.length > 16 ? d.titulo.slice(0, 16) + '…' : d.titulo)
      .attr('text-anchor', 'middle')
      .attr('dy',          d => 16 + d.intensidad * 2.5)
      .attr('fill',        '#7777aa')
      .attr('font-size',   '10px')
      .attr('font-family', 'var(--font-inter), sans-serif')
      .style('pointer-events', 'none')

    // Eventos
    node
      .on('mouseenter', (event, d) => {
        clearTimeout(hoverTimer.current)
        hoverTimer.current = setTimeout(() => {
          const rect = svgRef.current.getBoundingClientRect()
          setMenu({ visible: true, x: event.clientX - rect.left, y: event.clientY - rect.top, data: d })
        }, 600)

        d3.select(event.currentTarget).select('circle:nth-child(2)')
          .transition().duration(200)
          .attr('r', (6 + d.intensidad * 1.5) * 1.3)
      })
      .on('mouseleave', () => {
        clearTimeout(hoverTimer.current)
        d3.selectAll('circle:nth-child(2)')
          .transition().duration(200)
          .attr('r', function(d) { return d ? 6 + d.intensidad * 1.5 : 0 })
      })
      .on('click', (event, d) => {
        clearTimeout(hoverTimer.current)
        setMenu({ visible: false, x: 0, y: 0, data: null })
        if (onNodeClick) onNodeClick(d.id)
      })

    // Guardar referencia a nodos para centrado
    simulation.on('tick', () => {
      nodosClone.forEach(d => { nodosRef.current[d.id] = { x: d.x, y: d.y } })
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
      clearTimeout(hoverTimer.current)
    }

  }, [nodosFiltrados.length, enlacesFiltrados.length, anclados, filtroEmocion, umbral])

  const handleAnclar = (id) => {
    setAnclados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setMenu({ visible: false, x: 0, y: 0, data: null })
  }

  const handleCentrar = (id) => {
    const pos = nodosRef.current[id]
    if (!pos || !simRef.current) return
    const { zoomBehavior, svg, width, height } = simRef.current
    svg.transition().duration(600).call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(width / 2 - pos.x, height / 2 - pos.y)
    )
    setMenu({ visible: false, x: 0, y: 0, data: null })
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onMouseLeave={() => {
        hoverTimer.current = setTimeout(() => {
          setMenu({ visible: false, x: 0, y: 0, data: null })
        }, 800)
      }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />

      {/* Menú contextual */}
      {menu.visible && menu.data && (
        <div
          onMouseEnter={() => clearTimeout(hoverTimer.current)}
          onMouseLeave={() => setMenu({ visible: false, x: 0, y: 0, data: null })}
          style={{
            background:    '#0c0c22',
            border:        '0.5px solid #2a2a50',
            borderRadius:  '12px',
            left:          menu.x + 12,
            padding:       '12px',
            position:      'absolute',
            top:           menu.y - 10,
            zIndex:        20,
            minWidth:      '180px',
            boxShadow:     '0 8px 32px #00000066',
          }}
        >
          {/* Header del nodo */}
          <div style={{ borderBottom: '0.5px solid #1e1e3a', marginBottom: '10px', paddingBottom: '10px' }}>
            <div style={{ color: '#c0b8f0', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
              {menu.data.titulo}
            </div>
            {menu.data.emocion && (
              <div style={{ alignItems: 'center', display: 'flex', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: menu.data.emocion.colorHex }} />
                <span style={{ color: menu.data.emocion.colorHex, fontSize: '11px' }}>{menu.data.emocion.nombre}</span>
              </div>
            )}
          </div>

          {/* Opciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => onNodeClick && onNodeClick(menu.data.id)}
              style={{ alignItems: 'center', background: 'transparent', border: 'none', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', fontSize: '12px', gap: '8px', padding: '7px 10px', textAlign: 'left', transition: 'background 0.15s', width: '100%' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e1a3a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>◉</span> Ver sueño
            </button>

            <button
              onClick={() => handleCentrar(menu.data.id)}
              style={{ alignItems: 'center', background: 'transparent', border: 'none', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', fontSize: '12px', gap: '8px', padding: '7px 10px', textAlign: 'left', transition: 'background 0.15s', width: '100%' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e1a3a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>◎</span> Centrar en grafo
            </button>

            <button
              onClick={() => handleAnclar(menu.data.id)}
              style={{ alignItems: 'center', background: anclados.has(menu.data.id) ? '#1e1535' : 'transparent', border: 'none', borderRadius: '8px', color: anclados.has(menu.data.id) ? 'var(--accent-purple)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', fontSize: '12px', gap: '8px', padding: '7px 10px', textAlign: 'left', transition: 'background 0.15s', width: '100%' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e1535'}
              onMouseLeave={e => e.currentTarget.style.background = anclados.has(menu.data.id) ? '#1e1535' : 'transparent'}
            >
              <span>⚓</span> {anclados.has(menu.data.id) ? 'Desanclar nodo' : 'Anclar nodo'}
            </button>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div style={{ bottom: '16px', left: '50%', position: 'absolute', transform: 'translateX(-50%)' }}>
        <div style={{ background: '#0c0c2299', border: '0.5px solid #1e1e3a', borderRadius: '20px', color: '#33334a', fontSize: '10px', letterSpacing: '0.06em', padding: '5px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
          Arrastra · Zoom con scroll · Clic para abrir · Hover para opciones
        </div>
      </div>
    </div>
  )
}