'use client'

import { useState } from 'react'
import { exportarSuenosPDF } from '@/lib/exportPDF'

export default function ExportPDF() {
  const [loading, setLoading] = useState(false)
  const [modo, setModo]       = useState('todos')
  const [desde, setDesde]     = useState('')
  const [hasta, setHasta]     = useState('')
  const [error, setError]     = useState('')

  const handleExportar = async () => {
    setError('')
    setLoading(true)

    try {
      let url = '/api/dreams?limit=1000'
      if (modo === 'rango' && desde && hasta) {
        url += `&desde=${desde}&hasta=${hasta}`
      }

      const res  = await fetch(url)
      const data = await res.json()
      const dreams = Array.isArray(data.dreams) ? data.dreams : []

      if (dreams.length === 0) {
        setError('No hay sueños en el rango seleccionado')
        return
      }

      await exportarSuenosPDF({
        dreams,
        desde: modo === 'rango' ? desde : null,
        hasta: modo === 'rango' ? hasta : null,
      })

    } catch {
      setError('Error al generar el PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div className="section-title">Exportar sueños</div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'todos', label: 'Todos los sueños' },
          { key: 'rango', label: 'Por rango de fechas' },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => setModo(m.key)}
            style={{
              background:   modo === m.key ? '#1e1a3a' : 'transparent',
              border:       `0.5px solid ${modo === m.key ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
              borderRadius: '8px',
              color:        modo === m.key ? 'var(--accent-purple)' : 'var(--text-muted)',
              cursor:       'pointer',
              fontSize:     '12px',
              padding:      '6px 14px',
              transition:   'all 0.2s ease',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {modo === 'rango' && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
              Desde
            </label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} style={{ padding: '8px 12px', width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
              Hasta
            </label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} style={{ padding: '8px 12px', width: '100%' }} />
          </div>
        </div>
      )}

      {error && (
        <p style={{ color: '#cc7788', fontSize: '12px', marginBottom: '12px' }}>{error}</p>
      )}

      <button
        onClick={handleExportar}
        disabled={loading || (modo === 'rango' && (!desde || !hasta))}
        className="btn-primary"
        style={{
          fontSize: '12px',
          opacity:  loading || (modo === 'rango' && (!desde || !hasta)) ? 0.5 : 1,
          padding:  '8px 18px',
        }}
      >
        {loading ? 'Generando PDF...' : '↓ Descargar PDF'}
      </button>
    </div>
  )
}