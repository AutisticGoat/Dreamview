'use client'

import useIsMobile from '@/hooks/useIsMobile'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { FadeIn, ScaleIn, AnimatedButton, PulsingDot } from '@/components/animations'

function LoginForm() {
  const isMobile = useIsMobile()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const registered = searchParams.get('registered')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email:    form.email,
        password: form.password,
        rememberMe: rememberMe.toString(),
        redirect: false,
      })

      if (result?.error) { setError(result.error); return }
      router.push('/dashboard')

    } catch {
      setError('Ocurrió un error, intenta de nuevo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ 
        alignItems: 'center', 
        background: 'var(--bg-base)', 
        display: 'flex', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        padding: isMobile ? '16px' : '24px',
        position: 'relative', 
        overflow: 'hidden' 
      }}>

      <div className="glow-orb pulse" style={{ width: '300px', height: '300px', background: '#3d2d8a20', top: '-80px', left: '-60px' }} />
      <div className="glow-orb pulse" style={{ width: '200px', height: '200px', background: '#1a3a6a15', bottom: '40px', right: '-40px', animationDelay: '1.5s' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: isMobile ? '100%' : '400px', zIndex: 2 }}>

        <FadeIn>
          <div style={{ alignItems: 'center', display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '40px' }}>
            <PulsingDot />
            <span style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500, marginLeft: '4px' }}>DreamView</span>
          </div>
        </FadeIn>

        <ScaleIn delay={0.1}>
          <div className="card" style={{ padding: isMobile ? '24px 20px' : '32px'  }}>

            <h1 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 500, marginBottom: '6px' }}>
              Iniciar sesión
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '28px' }}>
              Continúa explorando tus sueños
            </p>

            {registered && (
              <div style={{ background: '#0f2a1566', border: '0.5px solid #33664455', borderRadius: '8px', color: '#55aa77', fontSize: '12px', marginBottom: '20px', padding: '10px 14px' }}>
                ✓ Cuenta creada correctamente, ahora inicia sesión
              </div>
            )}

            {error && (
              <div style={{ background: '#2a101566', border: '0.5px solid #aa556655', borderRadius: '8px', color: '#cc7788', fontSize: '12px', marginBottom: '20px', padding: '10px 14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Email
                </label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" style={{ padding: '10px 14px' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Contraseña
                </label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Tu contraseña" style={{ padding: '10px 14px' }} />
              </div>

              <div style={{ alignItems: 'center', display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{
                    accentColor: 'var(--accent-purple)',
                    cursor:      'pointer',
                    width:       '14px',
                    height:      '14px',
                  }}
                />
                <label htmlFor="rememberMe" style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>
                  Recuérdame
                </label>
              </div>

              <AnimatedButton
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ fontSize: '13px', opacity: loading ? 0.5 : 1, padding: '12px', width: '100%' }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </AnimatedButton>
            </form>
          </div>
        </ScaleIn>

        <FadeIn delay={0.3}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '20px', textAlign: 'center' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>
              Regístrate
            </Link>
          </p>
        </FadeIn>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}