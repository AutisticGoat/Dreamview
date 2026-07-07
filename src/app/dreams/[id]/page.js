'use client'

import useIsMobile from '@/hooks/useIsMobile'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FadeIn, AnimatedLoader } from '@/components/animations'
import ErrorMessage from '@/components/ErrorMessage'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'


export default function DreamPage() {
  const isMobile = useIsMobile()
  const { status }              = useSession()
  const router                  = useRouter()
  const params                  = useParams()
  const [dream, setDream]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [conexiones, setConexiones] = useState([])
  const [interpretacion, setInterpretacion] = useState(null)
  const [interpretando, setInterpretando] = useState(false)
  const [errorInterp, setErrorInterp] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch(`/api/dreams/${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) setError(data.error)
          else setDream(data)
          setLoading(false)
        })
    }
  }, [status, params.id])

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetch(`/api/dreams/${params.id}/connections`)
        .then(res => res.json())
        .then(data => setConexiones(Array.isArray(data) ? data : []))
    }
  }, [status, params.id])

  useEffect(() => {
    if (dream?.interpretacion) {
      setInterpretacion(dream.interpretacion)
    }
  }, [dream])

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este sueño?')) return
    const res = await fetch(`/api/dreams/${params.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/dashboard')
  }

  if (loading) return <AnimatedLoader />

  if (error) return (
    <ErrorMessage
      mensaje={error}
      href="/dashboard"
      hrefLabel="Volver al dashboard"
    />
  )

  const handleInterpretar = async () => {
    setInterpretando(true)
    setErrorInterp('')
    try {
      const res  = await fetch(`/api/dreams/${params.id}/interpret`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setErrorInterp(data.error); return }
      setInterpretacion(data.interpretacion)
    } catch {
      setErrorInterp('Error al generar la interpretación')
    } finally {
      setInterpretando(false)
    }
  }

  const handleEliminarInterpretacion = async () => {
    await fetch(`/api/dreams/${params.id}/interpret`, { method: 'DELETE' })
    setInterpretacion(null)
  }

  return (
    <main style={{ background: 'var(--bg-base)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      <div className="glow-orb pulse" style={{
        width:      '300px',
        height:     '300px',
        background: dream.emotions[0]
          ? `${dream.emotions[0].emotion.colorHex}40`
          : '#3d2d8a40',
        top:        '-60px',
        right:      '-40px',
      }} />
      <div className="glow-orb pulse" style={{
        width:         '200px',
        height:        '200px',
        background:    dream.emotions[1]
          ? `${dream.emotions[1].emotion.colorHex}30`
          : '#1a3a6a40',
        bottom:        '60px',
        left:          '-20px',
        animationDelay:'2s',
      }} />

      <header style={{ alignItems: 'center', borderBottom: '0.5px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', padding: isMobile ? '12px 16px' : '16px 32px' , position: 'relative', zIndex: 10 }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '16px' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>← Dashboard</Link>
          {
            !isMobile && (
            <>
              <div style={{ width: '0.5px', height: '16px', background: 'var(--border-subtle)' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{dream.titulo}</span>
            </>  
          )
          }
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href={`/dreams/${params.id}/edit`} style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', padding: '6px 14px', textDecoration: 'none' }}>
            Editar
          </Link>
          <button onClick={handleDelete} className="btn-danger">Eliminar sueño</button>
        </div>
      </header>

      <div style={{ 
          margin: '0 auto', 
          maxWidth: isMobile ? '100%' : '680px',
          padding: isMobile ? '24px 16px 80px' : '40px 24px',
          position: 'relative', 
          zIndex: 2 
        }}>
        {/* <FadeIn> */}

          <div style={{ alignItems: 'center', display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <span style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '11px', padding: '4px 12px' }}>
              {new Date(dream.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <div className="ibar-row" style={{ width: '80px' }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`ibar ${n <= dream.intensidad ? 'ibar-on' : 'ibar-off'}`} />
              ))}
            </div>
          </div>

          <FadeIn delay={0}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: isMobile ? '20px' : '26px', fontWeight: 500, lineHeight: 1.25, marginBottom: '16px' }}>
            {dream.titulo}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.85, marginBottom: '36px' }}>
            {dream.descripcion}
          </p>

          </FadeIn>
          
          {dream.emotions.length > 0 && (
          <FadeIn delay={0.1}>
            <div style={{ marginBottom: '28px' }}>
              <div className="section-title">Emociones</div>

              <ResponsiveContainer width="100%" height={220}>
                <RadarChart
                  data={dream.emotions.map(e => ({
                    emocion:   e.emotion.nombre,
                    intensidad: e.intensidad,
                    color:     e.emotion.colorHex,
                  }))}
                  margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                >
                  <PolarGrid
                    stroke="#1e1e3a"
                    strokeWidth={0.5}
                  />
                  <PolarAngleAxis
                    dataKey="emocion"
                    tick={{ fill: '#7777aa', fontSize: 11, fontFamily: 'var(--font-inter)' }}
                  />
                  <Radar
                    dataKey="intensidad"
                    stroke="#6655cc"
                    fill="#6655cc"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                    dot={(props) => {
                      const { cx, cy, payload } = props
                      return (
                        <circle
                          key={payload.emocion}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={payload.color}
                          stroke={payload.color}
                          strokeWidth={1}
                          style={{ filter: `drop-shadow(0 0 4px ${payload.color}88)` }}
                        />
                      )
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>

              {/* Lista de emociones debajo del radar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {dream.emotions.map(e => (
                  <div key={e.emotionId} style={{ alignItems: 'center', display: 'flex', gap: '6px' }}>
                    <div style={{
                      width:        '7px',
                      height:       '7px',
                      borderRadius: '50%',
                      background:   e.emotion.colorHex,
                      boxShadow:    `0 0 6px ${e.emotion.colorHex}66`,
                      animation:    'pulse-glow 2.5s ease-in-out infinite',
                      flexShrink:   0,
                    }} />
                    <span style={{ color: e.emotion.colorHex, fontSize: '11px' }}>
                      {e.emotion.nombre}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                      {e.intensidad}/5
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </FadeIn>
        )}

          <FadeIn delay={0.2}>
          {dream.tags.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div className="section-title">Etiquetas</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {dream.tags.map(t => (
                  <span key={t.tagId} className="tag tag-label">#{t.tag.nombre}</span>
                ))}
              </div>
            </div>
          )}
          </FadeIn>

          <FadeIn delay={0.3}>
          {dream.symbols.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div className="section-title">Símbolos</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {dream.symbols.map(s => (
                  <span key={s.symbolId} className="tag tag-symbol">✦ {s.symbol.nombre}</span>
                ))}
              </div>
            </div>
          )}
          </FadeIn>


          <FadeIn delay={0.4}>
          <hr className="divider" />
          <div style={{ marginTop: '8px' }}>
            <div className="section-title">Conexiones</div>
            {conexiones.length === 0 ? (
              <div className="border" style={{ alignItems: 'center', display: 'flex', gap: '14px', padding: '14px 16px' }}>
                <div style={{ alignItems: 'center', background: '#1e1535', borderRadius: '8px', color: 'var(--accent-purple)', display: 'flex', fontSize: '16px', height: '32px', justifyContent: 'center', width: '32px', flexShrink: 0 }}>⟡</div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Este sueño no tiene conexiones con otros aún</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {conexiones.map((conexion, i) => (
                  <Link key={i} href={`/dreams/${conexion.suenoConectado.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '14px 16px', border: '0.5px solid #2a3a6a' }}>
                      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
                          <div style={{ alignItems: 'center', background: '#1e1535', borderRadius: '6px', color: 'var(--accent-purple)', display: 'flex', fontSize: '13px', height: '26px', justifyContent: 'center', width: '26px', flexShrink: 0 }}>⟡</div>
                          <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>{conexion.suenoConectado.titulo}</span>
                        </div>
                        <span style={{ background: '#1e1535', border: '0.5px solid #3d2a6a', borderRadius: '20px', color: 'var(--accent-purple)', fontSize: '10px', padding: '2px 10px' }}>
                          {conexion.puntuacion} pts
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.6, marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {conexion.suenoConectado.descripcion}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {conexion.suenoConectado.emotions.map(e => (
                          <span key={e.emotionId} className="tag" style={{ background: e.emotion.colorHex + '22', border: `0.5px solid ${e.emotion.colorHex}44`, color: e.emotion.colorHex }}>{e.emotion.nombre}</span>
                        ))}
                        {conexion.suenoConectado.tags.map(t => (
                          <span key={t.tagId} className="tag tag-label">#{t.tag.nombre}</span>
                        ))}
                        {conexion.suenoConectado.symbols.map(s => (
                          <span key={s.symbolId} className="tag tag-symbol">✦ {s.symbol.nombre}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          </FadeIn>

          <FadeIn delay={0.5}>1
          <hr className="divider" />

          <div style={{ marginTop: '8px' }}>
            <div className="section-title">Interpretación</div>

            {!interpretacion ? (
              <div className="card" style={{ padding: '16px', border: '0.5px solid #3d2a6a'}}>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '14px', lineHeight: 1.6 }}>
                  Genera una interpretación psicológica de este sueño basada en su contenido, emociones y conexiones con otros sueños.
                </p>
                {errorInterp && (
                  <p style={{ color: '#cc7788', fontSize: '12px', marginBottom: '12px' }}>{errorInterp}</p>
                )}
                <button
                  onClick={handleInterpretar}
                  disabled={interpretando}
                  className="btn-primary"
                  style={{ fontSize: '12px', opacity: interpretando ? 0.5 : 1, padding: '8px 18px' }}
                >
                  {interpretando ? 'Interpretando...' : '✦ Interpretar sueño'}
                </button>
              </div>
            ) : (
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ whiteSpace: 'pre-line', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.8, marginBottom: '16px' }}>
                  {interpretacion}
                </div>
                <button
                  onClick={handleEliminarInterpretacion}
                  className="btn-danger"
                  style={{ fontSize: '11px' }}
                >
                  Regenerar interpretación
                </button>
              </div>
            )}
          </div>
          </FadeIn>


        {/* </FadeIn> */}
      </div>
      {isMobile && (
      <nav style={{
        background:     '#050512',
        borderTop:      '0.5px solid var(--border-subtle)',
        bottom:         0,
        display:        'flex',
        justifyContent: 'space-around',
        left:           0,
        padding:        '10px 0 14px',
        position:       'fixed',
        right:          0,
        zIndex:         50,
      }}>
        {[
          { icon: '⊞', href: '/dashboard', active: true  },
          { icon: '◎', href: '/explore',   active: false },
          { icon: '◈', href: '/stats',     active: false },
          { icon: '◉', href: '/profile',   active: false },
        ].map((item, i) => (
          <Link key={i} href={item.href} style={{
            alignItems:     'center',
            color:          item.active ? 'var(--accent-purple)' : 'var(--text-muted)',
            display:        'flex',
            flexDirection:  'column',
            fontSize:       '20px',
            textDecoration: 'none',
          }}>
            {item.icon}
          </Link>
        ))}
      </nav>
    )}
    </main>
  )
}