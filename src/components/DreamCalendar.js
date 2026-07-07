'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

function intensidadAColor(intensidad) {
  if (!intensidad) return '#0e0e22'
  if (intensidad <= 1) return '#1e1535'
  if (intensidad <= 2) return '#2d1f55'
  if (intensidad <= 3) return '#3d2d8a'
  if (intensidad <= 4) return '#5544bb'
  return '#6655cc'
}

export default function DreamCalendar() {
  const hoy     = new Date()
  const [year,  setYear]  = useState(hoy.getFullYear())
  const [month, setMonth] = useState(hoy.getMonth() + 1)
  const [data,  setData]  = useState(null)
  const [loading, setLoading]   = useState(true)
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)

  useEffect(() => {
    setLoading(true)
    setDiaSeleccionado(null)
    fetch(`/api/stats/calendar?year=${year}&month=${month}`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
  }, [year, month])

  const irMesAnterior = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const irMesSiguiente = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const esFuturo = year > hoy.getFullYear() || (year === hoy.getFullYear() && month > hoy.getMonth() + 1)

  return (
    <div className="card" style={{ padding: '20px' }}>

      {/* Header */}
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={irMesAnterior}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}
        >
          ←
        </button>
        <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
          {MESES[month - 1]} {year}
        </span>
        <button
          onClick={irMesSiguiente}
          disabled={esFuturo}
          style={{ background: 'transparent', border: 'none', color: esFuturo ? 'var(--border-subtle)' : 'var(--text-muted)', cursor: esFuturo ? 'default' : 'pointer', fontSize: '16px', padding: '4px 8px' }}
        >
          →
        </button>
      </div>

      {/* Días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
        {DIAS.map(d => (
          <div key={d} style={{ color: 'var(--text-muted)', fontSize: '10px', textAlign: 'center', letterSpacing: '0.06em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid del calendario */}
      {loading ? (
        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-purple)', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {/* Celdas vacías antes del primer día */}
          {Array.from({ length: data.primerDia }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Días del mes */}
          {Array.from({ length: data.diasEnMes }, (_, i) => i + 1).map(dia => {
            const info        = data.porDia[dia]
            const tienesSueños = !!info
            const esHoy       = dia === hoy.getDate() && month === hoy.getMonth() + 1 && year === hoy.getFullYear()
            const seleccionado = diaSeleccionado === dia

            return (
              <div
                key={dia}
                onClick={() => tienesSueños && setDiaSeleccionado(seleccionado ? null : dia)}
                style={{
                  alignItems:    'center',
                  background:    intensidadAColor(info?.intensidadPromedio),
                  border:        esHoy ? '0.5px solid var(--accent-purple)' : seleccionado ? '0.5px solid #9977dd' : '0.5px solid transparent',
                  borderRadius:  '6px',
                  color:         tienesSueños ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor:        tienesSueños ? 'pointer' : 'default',
                  display:       'flex',
                  fontSize:      '11px',
                  height:        '32px',
                  justifyContent:'center',
                  opacity:       tienesSueños ? 1 : 0.4,
                  transition:    'all 0.15s ease',
                }}
              >
                {dia}
              </div>
            )
          })}
        </div>
      )}

      {/* Detalle del día seleccionado */}
      {diaSeleccionado && data?.porDia[diaSeleccionado] && (
        <div style={{ borderTop: '0.5px solid var(--border-subtle)', marginTop: '16px', paddingTop: '16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '10px' }}>
            {diaSeleccionado} de {MESES[month - 1]}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.porDia[diaSeleccionado].sueños.map(s => (
              <Link
                key={s.id}
                href={`/dreams/${s.id}`}
                style={{
                  alignItems:     'center',
                  background:     '#1e1535',
                  border:         '0.5px solid #3d2a6a',
                  borderRadius:   '8px',
                  color:          'var(--text-primary)',
                  display:        'flex',
                  fontSize:       '12px',
                  justifyContent: 'space-between',
                  padding:        '8px 12px',
                  textDecoration: 'none',
                }}
              >
                <span>{s.titulo}</span>
                <span style={{ color: 'var(--accent-purple)', fontSize: '10px' }}>
                  {s.intensidad}/5
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div style={{ alignItems: 'center', display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Intensidad:</span>
        {[1,2,3,4,5].map(n => (
          <div key={n} style={{ width: '12px', height: '12px', borderRadius: '3px', background: intensidadAColor(n) }} />
        ))}
      </div>

    </div>
  )
}