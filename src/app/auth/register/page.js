'use client'

import useIsMobile from '@/hooks/useIsMobile'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FadeIn, ScaleIn, AnimatedButton, PulsingDot } from '@/components/animations'

export default function RegisterPage() {
  const isMobile = useIsMobile()
  const router              = useRouter()
  const [form, setForm]     = useState({ nombre: '', email: '', password: '', passwordConfirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          nombre:   form.nombre,
          email:    form.email,
          password: form.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      router.push('/auth/login?registered=1')

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
              Crear cuenta
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '28px' }}>
              Comienza a registrar y explorar tus sueños
            </p>

            {error && (
              <div style={{ background: '#2a101566', border: '0.5px solid #aa556655', borderRadius: '8px', color: '#cc7788', fontSize: '12px', marginBottom: '20px', padding: '10px 14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Nombre
                </label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required minLength={2} placeholder="Tu nombre" style={{ padding: '10px 14px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Email
                </label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" style={{ padding: '10px 14px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Contraseña
                </label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Mínimo 6 caracteres" style={{ padding: '10px 14px' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Confirmar contraseña
                </label>
                <input type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} required minLength={6} placeholder="Repite tu contraseña" style={{ padding: '10px 14px' }} />
              </div>

              <AnimatedButton
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ fontSize: '13px', opacity: loading ? 0.5 : 1, padding: '12px', width: '100%' }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </AnimatedButton>
            </form>
          </div>
        </ScaleIn>

        <FadeIn delay={0.3}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '20px', textAlign: 'center' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>
              Inicia sesión
            </Link>
          </p>
        </FadeIn>
      </div>
    </main>
  )
}
