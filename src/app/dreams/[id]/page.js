'use client'

import useIsMobile from '@/hooks/useIsMobile'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FadeIn, AnimatedLoader } from '@/components/animations'

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

  if (error) {
    return (
      <main style={{ alignItems: 'center', background: 'var(--bg-base)', display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#aa5566', marginBottom: '16px' }}>{error}</p>
          <Link href="/dashboard" style={{ color: 'var(--accent-purple)', fontSize: '13px' }}>← Volver al dashboard</Link>
        </div>
      </main>
    )
  }

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

      <div className="glow-orb pulse" style={{ width: '300px', height: '300px', background: '#3d2d8a18', top: '-60px', right: '-40px' }} />
      <div className="glow-orb pulse" style={{ width: '200px', height: '200px', background: '#1a3a6a12', bottom: '60px', left: '-20px', animationDelay: '2s' }} />

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
        <FadeIn>

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

          <h1 style={{ color: 'var(--text-primary)', fontSize: isMobile ? '20px' : '26px', fontWeight: 500, lineHeight: 1.25, marginBottom: '16px' }}>
            {dream.titulo}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.85, marginBottom: '36px' }}>
            {dream.descripcion}
          </p>

          <hr className="divider" />

          {dream.emotions.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div className="section-title">Emociones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dream.emotions.map(e => (
                  <div key={e.emotionId} style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: e.emotion.colorHex, boxShadow: `0 0 6px ${e.emotion.colorHex}66`, flexShrink: 0 }} />
                    <span style={{ color: e.emotion.colorHex, fontSize: '12px', width: '90px' }}>{e.emotion.nombre}</span>
                    <div style={{ flex: 1, height: '2px', background: 'var(--border-dim)', borderRadius: '1px' }}>
                      <div style={{ background: e.emotion.colorHex, borderRadius: '1px', height: '100%', opacity: 0.7, width: `${(e.intensidad / 5) * 100}%`, transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', width: '28px', textAlign: 'right' }}>{e.intensidad}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <hr className="divider" />

          <div style={{ marginTop: '8px' }}>
            <div className="section-title">Conexiones</div>
            {conexiones.length === 0 ? (
              <div className="card" style={{ alignItems: 'center', display: 'flex', gap: '14px', padding: '14px 16px' }}>
                <div style={{ alignItems: 'center', background: '#1e1535', borderRadius: '8px', color: 'var(--accent-purple)', display: 'flex', fontSize: '16px', height: '32px', justifyContent: 'center', width: '32px', flexShrink: 0 }}>⟡</div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Este sueño no tiene conexiones con otros aún</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {conexiones.map((conexion, i) => (
                  <Link key={i} href={`/dreams/${conexion.suenoConectado.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '14px 16px' }}>
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
          <hr className="divider" />

          <div style={{ marginTop: '8px' }}>
            <div className="section-title">Interpretación</div>

            {!interpretacion ? (
              <div className="card" style={{ padding: '16px' }}>
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