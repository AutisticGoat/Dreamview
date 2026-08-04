'use client'
import useIsMobile from '@/hooks/useIsMobile'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FadeIn, StaggerList, StaggerItem, AnimatedCard, PulsingDot, AnimatedLoader } from '@/components/animations'
import DreamFilters from '@/components/DreamFilters'
import Pagination from '@/components/Pagination'
import { SkeletonCard, SkeletonStat } from '@/components/Skeleton'

export default function Dashboard() {
  const isMobile = useIsMobile()
  const { data: session, status } = useSession()
  const router                    = useRouter()
  const [dreams, setDreams]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [queryString, setQueryString] = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filtros, setFiltros]       = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
  if (status === 'authenticated') {
    setLoading(true)
    fetch(`/api/dreams?page=${page}&limit=10&${filtros}`)
      .then(res => res.json())
      .then(async data => {
        const dreams = Array.isArray(data.dreams) ? data.dreams : []

        // Obtener conexiones para cada sueño
        const conteosConexiones = {}
        await Promise.all(dreams.map(async d => {
          const res  = await fetch(`/api/dreams/${d.id}/connections`)
          const data = await res.json()
          conteosConexiones[d.id] = Array.isArray(data) ? data.length : 0
        }))

        setDreams(dreams.map(d => ({ ...d, totalConexiones: conteosConexiones[d.id] ?? 0 })))
        setTotalPages(data.totalPages || 1)
        setLoading(false)
        })
        .catch(() => {
          setDreams([])
          setLoading(false)
        })
    }
  }, [status, page, filtros])

  if (status === 'loading' || loading) return (
  <main style={{ background: 'var(--bg-base)', display: 'flex', minHeight: '100vh' }}>
    {!isMobile && (
      <aside style={{ width: '56px', background: '#050512', borderRight: '0.5px solid var(--border-subtle)', flexShrink: 0 }} />
    )}
    <div style={{ flex: 1, padding: '24px 28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '28px' }}>
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  </main>
)

  const handleFilter = (params) => {
    setPage(1)
    setFiltros(params)
  }

  const hayFiltros  = queryString.length > 0
  const totalDreams = dreams.length

  const emocionFrecuente = (() => {
    const conteo = {}
    dreams.forEach(d => d.emotions.forEach(e => {
      const nombre = e.emotion.nombre
      conteo[nombre] = (conteo[nombre] || 0) + 1
    }))
    const top = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]
    return top ? top[0] : '—'
  })()

  const simboloFrecuente = (() => {
    const conteo = {}
    dreams.forEach(d => d.symbols.forEach(s => {
      const nombre = s.symbol.nombre
      conteo[nombre] = (conteo[nombre] || 0) + 1
    }))
    const top = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]
    return top ? top[0] : '—'
  })()

  return (
    <main style={{ background: 'var(--bg-base)', display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden', marginLeft: isMobile ? 0 : '56px',}}>

      {/* Orbes */}
      <div className="glow-orb pulse" style={{ width: '300px', height: '300px', background: '#3d2d8a18', top: '-60px', right: '80px' }} />
      <div className="glow-orb pulse" style={{ width: '200px', height: '200px', background: '#1a3a6a12', bottom: '40px', left: '80px', animationDelay: '2s' }} />

      {/* Sidebar */}
      <aside style={{
        display: isMobile ? 'none' : 'flex',
        background:    '#050512',
        borderRight:   '0.5px solid var(--border-subtle)',
        flexDirection: 'column',
        alignItems:    'center',
        padding:       '20px 0',
        height:        '100vh',
        gap:           '6px',
        width:         '56px',
        zIndex:        10,
        position: 'fixed',
        top:      0,
        left:     0,
        height:   '100vh',
      }}>
        <PulsingDot style={{ marginBottom: '16px' }} />
        {[
          { icon: '⊞', label: 'Dashboard',    active: true,  href: '/dashboard' },
          { icon: '◎', label: 'Explorar',     active: false, href: '/explore'   },
          { icon: '◈', label: 'Estadísticas', active: false, href: '/stats'     },
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
            transition:     'background 0.2s ease, color 0.2s ease',
            width:          '36px',
          }}>
            {item.icon}
          </Link>
        ))}
        <div style={{
          bottom:        '16px',
          display:       'flex',
          flexDirection: 'column',
          gap:           '6px',
          position:      'absolute',
        }}>
          <Link href="/profile" title="Perfil" style={{
            alignItems:     'center',
            background:     'transparent',
            borderRadius:   '8px',
            color:          'var(--text-muted)',
            display:        'flex',
            fontSize:       '16px',
            height:         '36px',
            justifyContent: 'center',
            textDecoration: 'none',
            width:          '36px',
          }}>
            ◉
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            title="Cerrar sesión"
            style={{
              alignItems:     'center',
              background:     'transparent',
              border:         'none',
              borderRadius:   '8px',
              color:          'var(--text-muted)',
              cursor:         'pointer',
              display:        'flex',
              fontSize:       '16px',
              height:         '36px',
              justifyContent: 'center',
              width:          '36px',
            }}
          >
            ⎋
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          position: 'relative', 
          zIndex: 2, 
          padding: isMobile ? '16px 16px 80px' : '24px 28px', 
        }}>

        <FadeIn>
          <header style={{
            alignItems: 'center',
            borderBottom: '0.5px solid var(--border-subtle)',
            display:'flex',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 16px' : '16px 28px' ,
          }}>
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '17px', fontWeight: 500 }}>
                Hola, {session?.user?.nombre} 👋
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                {hayFiltros
                  ? `${totalDreams} ${totalDreams === 1 ? 'resultado' : 'resultados'}`
                  : totalDreams === 0
                    ? 'Aún no tienes sueños registrados'
                    : `${totalDreams} ${totalDreams === 1 ? 'sueño registrado' : 'sueños registrados'}`}
              </p>
            </div>
            <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
              <Link
                href="/profile"
                title="Mi perfil"
                style={{
                  alignItems:     'center',
                  background:     'var(--bg-surface)',
                  border:         '0.5px solid var(--border-subtle)',
                  borderRadius:   '50%',
                  color:          'var(--accent-purple)',
                  display:        'flex',
                  fontSize:       '14px',
                  fontWeight:     500,
                  height:         '34px',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  width:          '34px',
                }}
              >
                {session?.user?.nombre?.[0]?.toUpperCase() ?? '?'}
              </Link>
              
              <Link href="/dreams/new" className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px', textDecoration: 'none' }}>
                + Nuevo sueño
              </Link>
            </div>
          </header>
        </FadeIn>

        <div style={{ padding: '24px 28px', flex: 1 }}>

          <FadeIn delay={0.1}>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '10px', 
                marginBottom: '28px'
                }}>
              {[
                { label: 'Sueños totales',     value: totalDreams,      color: 'var(--text-primary)', glow: '#6655cc' },
                { label: 'Emoción frecuente',  value: emocionFrecuente, color: '#cc7788',             glow: '#aa5566' },
                { label: 'Símbolo recurrente', value: simboloFrecuente, color: '#6699bb',             glow: '#335588' },
              ].map((stat, i) => (
                <div key={i} className="card" style={{ padding: '16px' }}>
                  <div className="glow-orb" style={{ width: '50px', height: '50px', background: stat.glow, top: '-10px', right: '-10px', filter: 'blur(24px)', opacity: 0.4 }} />
                  <div style={{ width: '18px', height: '1.5px', background: stat.glow, borderRadius: '1px', marginBottom: '10px' }} />
                  <div style={{ color: stat.color, fontSize: '20px', fontWeight: 500 }}>{stat.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', marginTop: '4px', textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <DreamFilters onFilter={handleFilter} />
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="section-title">
              {hayFiltros ? 'Resultados' : 'Sueños recientes'}
            </div>
          </FadeIn>

          {dreams.length === 0 ? (
            <FadeIn delay={0.3}>
              <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '16px', padding: '60px 0', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '28px', opacity: 0.4 }}>◎</div>
                {hayFiltros ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No se encontraron sueños con esos filtros</p>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>
                      Tu archivo onírico está en silencio.<br/>
                    </p>
                    <Link href="/dreams/new" className="btn-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
                      Registrar tu primer sueño
                    </Link>
                  </>
                )}
              </div>
            </FadeIn>
          ) : (
            <StaggerList>
              {dreams.map((dream) => (
                <StaggerItem key={dream.id}>
                  <AnimatedCard style={{ marginBottom: '8px' }}>
                    <Link
                      href={`/dreams/${dream.id}`}
                      className="card"
                      style={{ cursor: 'pointer', display: 'block', textDecoration: 'none' }}
                    >
                      <div style={{ background: 'linear-gradient(to bottom, var(--accent-purple), var(--accent-blue))', borderRadius: '2px 0 0 2px', bottom: 0, left: 0, position: 'absolute', top: 0, width: '2px' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>{dream.titulo}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                          {new Date(dream.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.6, marginBottom: '10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {dream.descripcion}
                      </p>
                      <div className="ibar-row" style={{ marginBottom: '10px' }}>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} className={`ibar ${n <= dream.intensidad ? 'ibar-on' : 'ibar-off'}`} />
                        ))}
                      </div>
                      {dream.totalConexiones > 0 && (
                      <div style={{ alignItems: 'center', display: 'flex', gap: '5px', marginBottom: '8px' }}>
                          <span style={{ color: '#3d2d8a', fontSize: '11px' }}>⟡</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                            {dream.totalConexiones} {dream.totalConexiones === 1 ? 'conexión' : 'conexiones'}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {dream.emotions.map(e => (
                          <span key={e.emotionId} className="tag" style={{ background: e.emotion.colorHex + '22', border: `0.5px solid ${e.emotion.colorHex}44`, color: e.emotion.colorHex }}>
                            {e.emotion.nombre}
                          </span>
                        ))}
                        {dream.tags.map(t => (
                          <span key={t.tagId} className="tag tag-label">#{t.tag.nombre}</span>
                        ))}
                        {dream.symbols.map(s => (
                          <span key={s.symbolId} className="tag tag-symbol">✦ {s.symbol.nombre}</span>
                        ))}
                      </div>
                    </Link>
                  </AnimatedCard>
                </StaggerItem>
              ))}
            </StaggerList>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
          <Link href="/dashboard" style={{ color: 'var(--text-muted)', display: 'flex', fontSize: '20px', textDecoration: 'none' }}>⊞</Link>
          <Link href="/explore"   style={{ color: 'var(--text-muted)', display: 'flex', fontSize: '20px', textDecoration: 'none' }}>◎</Link>
          <Link href="/stats"     style={{ color: 'var(--text-muted)', display: 'flex', fontSize: '20px', textDecoration: 'none' }}>◈</Link>
          <Link href="/profile"   style={{ color: 'var(--text-muted)', display: 'flex', fontSize: '20px', textDecoration: 'none' }}>◉</Link>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', padding: 0 }}
          >
            ⎋
          </button>
        </nav>
      )}
    </main>
  )
}