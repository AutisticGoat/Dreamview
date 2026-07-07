'use client'

import { useState, useEffect } from 'react'

export default function DreamFilters({ onFilter }) {
  const [busqueda,  setBusqueda]  = useState('')
  const [emocion,   setEmocion]   = useState('')
  const [etiqueta,  setEtiqueta]  = useState('')
  const [desde,     setDesde]     = useState('')
  const [hasta,     setHasta]     = useState('')
  const [simbolo, setSimbolo] = useState('')
  const [emociones, setEmociones] = useState([])

  useEffect(() => {
    fetch('/api/emotions')
      .then(res => res.json())
      .then(data => setEmociones(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()

      if (busqueda) params.set('q', busqueda)
      if (emocion)  params.set('emocion', emocion)
      if (etiqueta) params.set('etiqueta', etiqueta)
      if (desde)    params.set('desde', desde)
      if (hasta)    params.set('hasta', hasta)
      if (simbolo) params.set('simbolo', simbolo)

      onFilter(params.toString())
    }, 400)

    return () => clearTimeout(timer)
  }, [busqueda, emocion, etiqueta, desde, hasta, onFilter])

  const limpiar = () => {
    setBusqueda('')
    setEmocion('')
    setEtiqueta('')
    setDesde('')
    setHasta('')
    setSimbolo('')
  }

  const hayFiltros = busqueda || emocion || etiqueta || simbolo || desde || hasta

  return (
    <div style={{ marginBottom: '20px' }}>

      {/* Búsqueda principal */}
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '14px', left: '12px', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>◎</span>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por título o descripción..."
          style={{ padding: '10px 14px 10px 34px' }}
        />
      </div>

      {/* Filtros secundarios */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select
          value={emocion}
          onChange={e => setEmocion(e.target.value)}
          style={{ padding: '7px 12px', flex: 1, minWidth: '140px', background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: '8px', color: emocion ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '12px' }}
        >
          <option value="">Todas las emociones</option>
          {emociones.map(e => (
            <option key={e.id} value={e.nombre}>{e.nombre}</option>
          ))}
        </select>

        <input
          type="text"
          value={etiqueta}
          onChange={e => setEtiqueta(e.target.value)}
          placeholder="Filtrar por etiqueta..."
          style={{ padding: '7px 12px', flex: 1, minWidth: '140px', fontSize: '12px' }}
        />

        <input
          type="text"
          value={simbolo}
          onChange={e => setSimbolo(e.target.value)}
          placeholder="Filtrar por símbolo..."
          style={{ padding: '7px 12px', flex: 1, minWidth: '140px', fontSize: '12px' }}
        />

        <input
          type="date"
          value={desde}
          onChange={e => setDesde(e.target.value)}
          style={{ padding: '7px 12px', fontSize: '12px' }}
        />

        <input
          type="date"
          value={hasta}
          onChange={e => setHasta(e.target.value)}
          style={{ padding: '7px 12px', fontSize: '12px' }}
        />

        {hayFiltros && (
          <button
            onClick={limpiar}
            style={{ background: 'transparent', border: '0.5px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', padding: '7px 14px', whiteSpace: 'nowrap' }}
          >
            Limpiar
          </button>
        )}
      </div>

    </div>
  )
}