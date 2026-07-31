'use client'

import useIsMobile from '@/hooks/useIsMobile'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const DreamGraph = dynamic(() => import('@/components/DreamGraph'), { ssr: false })

export default function ExplorePage() {
  const isMobile = useIsMobile()
  const { status }            = useSession()
  const router                = useRouter()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtroEmocion, setFiltroEmocion] = useState('')
  const [umbral, setUmbral]           = useState(4)
  const [umbralLocal, setUmbralLocal] = useState(4)  
  const [emociones, setEmociones]         = useState([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/graph').then(res => res.json()),
        fetch('/api/emotions').then(res => res.json()),
      ]).then(([g, e]) => {
        setData(g)
        setEmociones(Array.isArray(e) ? e : [])
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [status])

  const handleNodeClick = (id) => router.push(`/dreams/${id}`)

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

  const tieneData    = data?.nodos?.length > 0
  const emocionesEnGrafo = [...new Set(data?.nodos?.filter(n => n.emocion).map(n => n.emocion.nombre) ?? [])]

  return (
    <main style={{ background: 'var(--bg-base)', display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* Sidebar */}
      <aside style={{ 
          background: '#050512', 
          borderRight: '0.5px solid var(--border-subtle)', 
          display: isMobile ? 'none' : 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '20px 0', 
          gap: '6px', 
          width: '56px', 
          position: 'relative', 
          zIndex: 10, 
          flexShrink: 0 
        }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-purple)', boxShadow: '0 0 8px var(--glow-purple)', marginBottom: '16px' }} />
        {[
          { icon: '⊞', label: 'Dashboard',    active: false, href: '/dashboard' },
          { icon: '◎', label: 'Explorar',     active: true,  href: '/explore'   },
          { icon: '◈', label: 'Estadísticas', active: false, href: '/stats'     },
        ].map((item, i) => (
          <Link key={i} href={item.href} title={item.label} style={{ alignItems: 'center', background: item.active ? '#1e1a3a' : 'transparent', borderRadius: '8px', color: item.active ? 'var(--accent-purple)' : 'var(--text-muted)', display: 'flex', fontSize: '16px', height: '36px', justifyContent: 'center', textDecoration: 'none', width: '36px' }}>
            {item.icon}
          </Link>
        ))}
      </aside>

      {/* Contenido */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>

        {/* Topbar */}
        <header style={{ alignItems: 'center', borderBottom: '0.5px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', padding: isMobile ? '10px 12px' : '12px 20px', flexShrink: 0, gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500 }}>Explorar conexiones</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
              {tieneData ? `${data.nodos.length} sueños · ${data.enlaces.length} conexiones` : 'Sin datos aún'}
            </p>
          </div>

          {/* Controles de edición */}
          {tieneData && (
            <div style={{ alignItems: 'center', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

              {/* Filtro por emoción */}
              <select
                value={filtroEmocion}
                onChange={e => setFiltroEmocion(e.target.value)}
                style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: '8px', color: filtroEmocion ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '11px', padding: '6px 10px' }}
              >
                <option value="">Todas las emociones</option>
                {emocionesEnGrafo.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>

              {/* Umbral de conexión */}
              <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                  Umbral: <span style={{ color: 'var(--accent-purple)' }}>{umbralLocal} pts</span>
                </span>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={umbralLocal}
                  onChange={e => setUmbralLocal(parseInt(e.target.value))}
                  onMouseUp={e => setUmbral(parseInt(e.target.value))}
                  onTouchEnd={e => setUmbral(parseInt(e.target.value))}
                  style={{ width: isMobile ? '60px' : '80px', accentColor: 'var(--accent-purple)' }}
                />
              </div>

              {/* Resetear filtros */}
              {(filtroEmocion || umbral !== 4) && (
                <button
                  onClick={() => { setFiltroEmocion(''); setUmbral(4) }}
                  style={{ background: 'transparent', border: '0.5px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', padding: '6px 12px' }}
                >
                  Resetear
                </button>
              )}

              <Link href="/dreams/new" className="btn-primary" style={{ fontSize: '11px', padding: '6px 14px', textDecoration: 'none' }}>
                + Nuevo sueño
              </Link>
            </div>
          )}
        </header>

        {/* Grafo */}
        <div style={{ flex: 1, position: 'relative', paddingBottom: isMobile ? '60px' : '0'  }}>
          {!tieneData ? (
            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '32px', opacity: 0.3 }}>◎</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>
                El mapa de tu subconsciente está en blanco.<br/>Cada sueño es un nodo por descubrir.
              </p>
              <Link href="/dreams/new" className="btn-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>Registra tu primer sueño</Link>
            </div>
          ) : (
            <DreamGraph
              nodos={data.nodos}
              enlaces={data.enlaces}
              onNodeClick={handleNodeClick}
              filtroEmocion={filtroEmocion}
              umbral={umbral}
            />
          )}
        </div>
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
            { icon: '⊞', href: '/dashboard', active: false  },
            { icon: '◎', href: '/explore',   active: true },
            { icon: '◈', href: '/stats',     active: false },
            { icon: '◉', href: '/profile',   active: false },
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              style={{
                alignItems:     'center',
                background:     'transparent',
                border:         'none',
                color:          'var(--text-muted)',
                cursor:         'pointer',
                display:        'flex',
                flexDirection:  'column',
                fontSize:       '20px',
                padding:        0,
              }}
            >
              ⎋
            </button>
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