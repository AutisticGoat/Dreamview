'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main style={{ alignItems: 'center', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '24px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>

      <div className="glow-orb pulse" style={{ width: '300px', height: '300px', background: '#8a2d2d18', top: '-60px', left: '-60px' }} />
      <div className="glow-orb pulse" style={{ width: '200px', height: '200px', background: '#6a1a1a12', bottom: '40px', right: '-40px', animationDelay: '1.5s' }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ color: '#aa5566', fontSize: '48px', marginBottom: '16px', opacity: 0.6 }}>
          ⚠
        </div>

        <h1 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 500, marginBottom: '10px' }}>
          Algo salió mal
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '32px', maxWidth: '320px' }}>
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al dashboard.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={reset}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '10px 24px' }}
          >
            Intentar de nuevo
          </button>
          <Link href="/dashboard" className="btn-ghost" style={{ fontSize: '13px', padding: '10px 24px', textDecoration: 'none' }}>
            Ir al dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}