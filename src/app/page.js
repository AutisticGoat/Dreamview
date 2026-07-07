'use client'

import useIsMobile from '@/hooks/useIsMobile'
import Link from 'next/link'
import { FadeIn, FadeInSimple, StaggerList, StaggerItem } from '@/components/animations'

export default function Home() {
  const features = [
    { icon: '◎', title: 'Registro emocional', desc: 'Captura emociones, símbolos y etiquetas de cada sueño' },
    { icon: '⟡', title: 'Conexiones',         desc: 'Descubre qué sueños comparten patrones y símbolos' },
    { icon: '◈', title: 'Visualización',      desc: 'Explora tu mundo onírico mediante grafos y timelines' },
  ]
  const isMobile = useIsMobile()

  return (
    <main style={{ background: 'var(--bg-base)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Orbes */}
      <div className="glow-orb pulse" style={{ width: '400px', height: '400px', background: '#3d2d8a20', top: '-100px', left: '-80px' }} />
      <div className="glow-orb pulse" style={{ width: '300px', height: '300px', background: '#1a3a6a15', top: '100px', right: '-60px', animationDelay: '1.5s' }} />
      <div className="glow-orb" style={{ width: '200px', height: '200px', background: '#3d2d8a12', bottom: '80px', left: '40%', filter: 'blur(80px)' }} />

      {/* Nav */}
      <nav style={{
        borderBottom:   '0.5px solid var(--border-subtle)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        isMobile ? '14px 20px' : '16px 40px',
        position:       'relative',
        zIndex:         10,
      }}>
        <FadeInSimple>
          <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--accent-purple)',
              boxShadow: '0 0 10px var(--glow-purple)',
            }} />
            {!isMobile && (
              <span style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500 }}>
                DreamView
              </span>
            )}
          </div>
        </FadeInSimple>

        <FadeInSimple delay={0.1}>
          <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
            <Link href="/auth/login" className="btn-ghost" style={{ padding: '7px 18px' }}>
              Ingresar
            </Link>
            <Link href="/auth/register" className="btn-primary" style={{ padding: '7px 18px' }}>
              Comenzar
            </Link>
          </div>
        </FadeInSimple>
      </nav>

      {/* Hero */}
      <section style={{
        alignItems:     'center',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        minHeight:      'calc(100vh - 65px)',
        padding:        '60px 24px',
        position:       'relative',
        textAlign:      'center',
        zIndex:         2,
      }}>

        <FadeIn delay={0.1}>
          <div style={{
            alignItems:    'center',
            color:         'var(--accent-purple)',
            display:       'flex',
            fontSize:      '11px',
            gap:           '12px',
            letterSpacing: '0.16em',
            marginBottom:  '24px',
            textTransform: 'uppercase',
          }}>
            <div style={{ width: '28px', height: '0.5px', background: '#6655cc66' }} />
            Archivo Digital de Sueños
            <div style={{ width: '28px', height: '0.5px', background: '#6655cc66' }} />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <h1 style={{
            color:        'var(--text-primary)',
            fontSize:     'clamp(32px, 5vw, 52px)',
            fontWeight:   500,
            lineHeight:   1.15,
            marginBottom: '20px',
            maxWidth:     '600px',
          }}>
            Tu subconsciente,{' '}
            <span style={{
              background:           'linear-gradient(135deg, #a090ee, #4a9eda)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
            }}>
              cartografiado
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p style={{
            color:        'var(--text-secondary)',
            fontSize:     '15px',
            lineHeight:   1.8,
            marginBottom: '40px',
            maxWidth:     '420px',
          }}>
            Registra cada sueño. Descubre los patrones emocionales que tu mente teje en silencio mientras el mundo duerme.
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/auth/register" className="btn-primary" style={{ fontSize: '14px', padding: '12px 28px', textDecoration: 'none' }}>
              Explorar mis sueños
            </Link>
            <Link href="/auth/login" className="btn-ghost" style={{ fontSize: '14px', padding: '12px 28px', textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div style={{
            alignItems:    'center',
            bottom:        '40px',
            display:       'flex',
            flexDirection: 'column',
            gap:           '8px',
            position:      'absolute',
          }}>
            <div style={{ width: '0.5px', height: '40px', background: 'linear-gradient(to bottom, #6655cc55, transparent)' }} />
            </div>
        </FadeIn>

        <StaggerList style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 '16px',
          marginTop:           '100px',
          maxWidth:            '700px',
          width:               '100%',
        }}>
          {features.map((f, i) => (
            <StaggerItem key={i}>
              <div className="card" style={{ textAlign: 'left' }}>
                <div style={{ color: 'var(--accent-purple)', fontSize: '18px', marginBottom: '10px' }}>{f.icon}</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>{f.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>

      </section>
    </main>
  )
}