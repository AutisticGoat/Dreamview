'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FadeIn, StaggerList, StaggerItem, AnimatedCard, PulsingDot, AnimatedLoader } from '@/components/animations'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router                    = useRouter()
  const [dreams, setDreams]       = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/dreams')
        .then(res => res.json())
        .then(data => {
          setDreams(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(() => {
          setDreams([])
          setLoading(false)
        })
    }
  }, [status])

  if (status === 'loading' || loading) return <AnimatedLoader />

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
    <main style={{ background: 'var(--bg-base)', display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Orbes */}
      <div className="glow-orb pulse" style={{ width: '300px', height: '300px', background: '#3d2d8a18', top: '-60px', right: '80px' }} />
      <div className="glow-orb pulse" style={{ width: '200px', height: '200px', background: '#1a3a6a12', bottom: '40px', left: '80px', animationDelay: '2s' }} />

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
        <div style={{ flex: 1 }} />
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
      </aside>

      {/* Contenido principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>

        <FadeIn>
          <header style={{
            alignItems:     'center',
            borderBottom:   '0.5px solid var(--border-subtle)',
            display:        'flex',
            justifyContent: 'space-between',
            padding:        '16px 28px',
          }}>
            <div>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '17px', fontWeight: 500 }}>
                Hola, {session?.user?.nombre} 👋
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                {totalDreams === 0
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '28px' }}>
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

          <FadeIn delay={0.2}>
            <div className="section-title">Sueños recientes</div>
          </FadeIn>

          {dreams.length === 0 ? (
            <FadeIn delay={0.3}>
              <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '16px', padding: '60px 0', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '28px', opacity: 0.4 }}>◎</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Tu archivo de sueños está vacío</p>
                <Link href="/dreams/new" className="btn-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
                  Registra tu primer sueño
                </Link>
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
        </div>
      </div>
    </main>
  )
}