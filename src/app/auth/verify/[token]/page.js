'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerifyPage() {
  const params          = useParams()
  const router          = useRouter()
  const [estado, setEstado] = useState('verificando') // 'verificando' | 'exito' | 'error'

  useEffect(() => {
    fetch(`/api/auth/verify/${params.token}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setEstado('error')
        } else {
          setEstado('exito')
          setTimeout(() => router.push('/auth/login?verified=true'), 3000)
        }
      })
      .catch(() => setEstado('error'))
  }, [params.token])

  return (
    <main style={{ alignItems: 'center', background: 'var(--bg-base)', display: 'flex', justifyContent: 'center', minHeight: '100vh', padding: '24px', position: 'relative', overflow: 'hidden' }}>

      <div className="glow-orb pulse" style={{ width: '300px', height: '300px', background: '#3d2d8a20', top: '-80px', left: '-60px' }} />
      <div className="glow-orb pulse" style={{ width: '200px', height: '200px', background: '#1a3a6a15', bottom: '40px', right: '-40px', animationDelay: '1.5s' }} />

      <div style={{ maxWidth: '400px', position: 'relative', textAlign: 'center', width: '100%', zIndex: 2 }}>

        {estado === 'verificando' && (
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ animation: 'pulse-glow 1.5s ease-in-out infinite', background: 'var(--accent-purple)', borderRadius: '50%', boxShadow: '0 0 10px var(--glow-purple)', height: '10px', width: '10px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Verificando tu cuenta...</p>
          </div>
        )}

        {estado === 'exito' && (
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ color: '#55aa77', fontSize: '32px', marginBottom: '16px' }}>✓</div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
              Cuenta verificada
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
              Tu cuenta ha sido verificada correctamente. Serás redirigido al login en unos segundos.
            </p>
            <Link href="/auth/login?verified=true" className="btn-primary" style={{ fontSize: '13px', padding: '10px 24px', textDecoration: 'none' }}>
              Ir al login
            </Link>
          </div>
        )}

        {estado === 'error' && (
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ color: '#aa5566', fontSize: '32px', marginBottom: '16px' }}>⚠</div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
              Enlace inválido
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
              El enlace de verificación es inválido o ya fue usado.
            </p>
            <Link href="/auth/register" className="btn-primary" style={{ fontSize: '13px', padding: '10px 24px', textDecoration: 'none' }}>
              Registrarse de nuevo
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}