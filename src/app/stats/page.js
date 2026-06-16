'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:   '#0c0c22',
      border:       '0.5px solid #2a2a50',
      borderRadius: '10px',
      padding:      '12px 16px',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '8px' }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} style={{ alignItems: 'center', display: 'flex', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
          <span style={{ color: entry.color, fontSize: '12px' }}>{entry.name}: {entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function StatsPage() {
  const { status }              = useSession()
  const router                  = useRouter()
  const [timeline, setTimeline] = useState(null)
  const [general, setGeneral]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [vista, setVista]       = useState('emociones')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/stats/timeline').then(res => res.json()),
        fetch('/api/stats/general').then(res => res.json()),
      ]).then(([t, g]) => {
        setTimeline(t)
        setGeneral(g)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [status])

  if (loading) {
    return (
      <main style={{ alignItems: 'center', background: 'var(--bg-base)', display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)', boxShadow: '0 0 10px var(--glow-purple)', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.1em' }}>CARGANDO</span>
        </div>
      </main>
    )
  }

  const tieneData = general?.total > 0

  return (
    <main style={{ background: 'var(--bg-base)', display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Orbes */}
      <div className="glow-orb pulse" style={{ width: '300px', height: '300px', background: '#3d2d8a18', top: '-60px', right: '80px' }} />
      <div className="glow-orb pulse" style={{ width: '200px', height: '200px', background: '#1a3a6a12', bottom: '40px', left: '-20px', animationDelay: '2s' }} />

      {/* Sidebar */}
      <aside style={{
        background:    '#050512',
        borderRight:   '0.5px solid var(--border-subtle)',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        padding:       '20px 0',
        gap:           '6px',
        width:         '56px',
        position:      'relative',
        zIndex:        10,
      }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-purple)', boxShadow: '0 0 8px var(--glow-purple)', marginBottom: '16px' }} />
        {[
          { icon: '⊞', label: 'Dashboard',    active: false, href: '/dashboard' },
          { icon: '◎', label: 'Explorar',     active: false, href: '/explore' },
          { icon: '◈', label: 'Estadísticas', active: true,  href: '/stats' },
        ].map((item, i) => (
          <Link key={i} href={item.href} title={item.label} style={{
            alignItems:     'center',
            background:     item.active ? '#1e1a3a' : 'transparent',
            borderRadius:   '8px',
            color:          item.active ? 'var(--accent-purple)' : 'var(--text-muted)',
            display:        'flex',
            fontSize:       '16px',
            height:         '36px',
            justifyContent: 'center',
            textDecoration: 'none',
            width:          '36px',
          }}>
            {item.icon}
          </Link>
        ))}
      </aside>

      {/* Contenido */}
      <div style={{ flex: 1, padding: '32px', position: 'relative', zIndex: 2, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>
            Estadísticas
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Patrones emocionales y datos de tu archivo de sueños
          </p>
        </div>

        {!tieneData ? (
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '16px', padding: '80px 0', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '28px', opacity: 0.4 }}>◈</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aún no hay suficientes datos para mostrar estadísticas</p>
            <Link href="/dreams/new" className="btn-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
              Registra tu primer sueño
            </Link>
          </div>
        ) : (
          <>
            {/* Stats generales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '32px' }}>
              {[
                { label: 'Sueños totales',    value: general.total,                          glow: '#6655cc', color: 'var(--text-primary)' },
                { label: 'Intensidad promedio', value: `${general.intensidadPromedio} / 5`,  glow: '#3a7fc1', color: '#6699bb' },
                { label: 'Conexiones',         value: general.conexiones,                    glow: '#4a2d8a', color: '#9977dd' },
                { label: 'Mes más activo',     value: general.topMes?.mes ?? '—',            glow: '#335588', color: '#6699bb' },
              ].map((stat, i) => (
                <div key={i} className="card" style={{ padding: '16px' }}>
                  <div className="glow-orb" style={{ width: '50px', height: '50px', background: stat.glow, top: '-10px', right: '-10px', filter: 'blur(24px)', opacity: 0.4 }} />
                  <div style={{ width: '18px', height: '1.5px', background: stat.glow, borderRadius: '1px', marginBottom: '10px' }} />
                  <div style={{ color: stat.color, fontSize: '18px', fontWeight: 500 }}>{stat.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', marginTop: '4px', textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Timeline emocional</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { key: 'emociones',  label: 'Emociones' },
                    { key: 'intensidad', label: 'Intensidad' },
                  ].map(v => (
                    <button
                      key={v.key}
                      onClick={() => setVista(v.key)}
                      style={{
                        background:   vista === v.key ? '#1e1a3a' : 'transparent',
                        border:       `0.5px solid ${vista === v.key ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
                        borderRadius: '6px',
                        color:        vista === v.key ? 'var(--accent-purple)' : 'var(--text-muted)',
                        cursor:       'pointer',
                        fontSize:     '11px',
                        padding:      '5px 12px',
                        transition:   'all 0.2s ease',
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                {vista === 'emociones' ? (
                  <AreaChart data={timeline.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      {Object.entries(timeline.emociones).map(([nombre, color]) => (
                        <linearGradient key={nombre} id={`grad-${nombre}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0}   />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a30" />
                    <XAxis dataKey="mes" tick={{ fill: '#33334a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#33334a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#55558a' }} />
                    {Object.entries(timeline.emociones).map(([nombre, color]) => (
                      <Area key={nombre} type="monotone" dataKey={nombre} stroke={color} strokeWidth={1.5} fill={`url(#grad-${nombre})`} dot={{ fill: color, strokeWidth: 0, r: 3 }} />
                    ))}
                  </AreaChart>
                ) : (
                  <AreaChart data={timeline.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad-int" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6655cc" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6655cc" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a30" />
                    <XAxis dataKey="mes" tick={{ fill: '#33334a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 5]} tick={{ fill: '#33334a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="intensidad" stroke="#6655cc" strokeWidth={1.5} fill="url(#grad-int)" dot={{ fill: '#6655cc', strokeWidth: 0, r: 3 }} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Top listas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>

              {/* Top emociones */}
              <div className="card" style={{ padding: '20px' }}>
                <div className="section-title" style={{ marginBottom: '16px' }}>Emociones</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {general.topEmociones.map((e, i) => (
                    <div key={i} style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: e.color, boxShadow: `0 0 5px ${e.color}66`, flexShrink: 0 }} />
                      <span style={{ color: e.color, fontSize: '12px', flex: 1 }}>{e.nombre}</span>
                      <div style={{ flex: 2, height: '2px', background: 'var(--border-dim)', borderRadius: '1px' }}>
                        <div style={{
                          background:   e.color,
                          borderRadius: '1px',
                          height:       '100%',
                          opacity:      0.7,
                          width:        `${(e.count / general.topEmociones[0].count) * 100}%`,
                        }} />
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px', minWidth: '16px', textAlign: 'right' }}>{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top símbolos */}
              <div className="card" style={{ padding: '20px' }}>
                <div className="section-title" style={{ marginBottom: '16px' }}>Símbolos</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {general.topSimbolos.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sin símbolos aún</span>
                  ) : general.topSimbolos.map((s, i) => (
                    <div key={i} style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
                      <span style={{ color: '#335588', fontSize: '11px' }}>✦</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px', flex: 1 }}>{s.nombre}</span>
                      <div style={{ flex: 2, height: '2px', background: 'var(--border-dim)', borderRadius: '1px' }}>
                        <div style={{
                          background:   '#3a7fc1',
                          borderRadius: '1px',
                          height:       '100%',
                          opacity:      0.7,
                          width:        `${(s.count / general.topSimbolos[0].count) * 100}%`,
                        }} />
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px', minWidth: '16px', textAlign: 'right' }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top etiquetas */}
              <div className="card" style={{ padding: '20px' }}>
                <div className="section-title" style={{ marginBottom: '16px' }}>Etiquetas</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {general.topEtiquetas.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sin etiquetas aún</span>
                  ) : general.topEtiquetas.map((t, i) => (
                    <div key={i} style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
                      <span style={{ color: '#444488', fontSize: '11px' }}>#</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px', flex: 1 }}>{t.nombre}</span>
                      <div style={{ flex: 2, height: '2px', background: 'var(--border-dim)', borderRadius: '1px' }}>
                        <div style={{
                          background:   '#6655cc',
                          borderRadius: '1px',
                          height:       '100%',
                          opacity:      0.7,
                          width:        `${(t.count / general.topEtiquetas[0].count) * 100}%`,
                        }} />
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px', minWidth: '16px', textAlign: 'right' }}>{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </main>
  )
}