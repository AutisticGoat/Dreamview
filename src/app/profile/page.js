'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FadeIn, AnimatedButton, AnimatedLoader } from '@/components/animations'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router                             = useRouter()
  const [loadingData, setLoadingData]     = useState(true)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [exito, setExito]                 = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)

  const [form, setForm] = useState({
    nombre:          '',
    email:           '',
    passwordActual:  '',
    passwordNueva:   '',
    passwordConfirm: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setForm(prev => ({ ...prev, nombre: data.nombre, email: data.email }))
          setLoadingData(false)
        })
    }
  }, [status])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setExito('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')

    if (mostrarPassword) {
      if (form.passwordNueva !== form.passwordConfirm) { setError('Las contraseñas nuevas no coinciden'); return }
      if (form.passwordNueva && !form.passwordActual)  { setError('Debes ingresar tu contraseña actual'); return }
    }

    setLoading(true)

    try {
      const body = { nombre: form.nombre, email: form.email }
      if (mostrarPassword && form.passwordNueva) {
        body.passwordActual = form.passwordActual
        body.passwordNueva  = form.passwordNueva
      }

      const res = await fetch('/api/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      await update({ nombre: data.user.nombre, email: data.user.email })
      setExito('Perfil actualizado correctamente')
      setForm(prev => ({ ...prev, passwordActual: '', passwordNueva: '', passwordConfirm: '' }))
      setMostrarPassword(false)

    } catch {
      setError('Ocurrió un error, intenta de nuevo')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('¿Estás seguro? Esta acción eliminará tu cuenta y todos tus sueños permanentemente.')) return
    if (!confirm('Esta acción es irreversible. ¿Confirmas que deseas eliminar tu cuenta?')) return
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' })
      if (res.ok) await signOut({ callbackUrl: '/' })
    } catch {
      setError('Error al eliminar la cuenta')
    }
  }

  if (loadingData) return <AnimatedLoader />

  return (
    <main style={{ background: 'var(--bg-base)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      <div className="glow-orb pulse" style={{ width: '280px', height: '280px', background: '#3d2d8a18', top: '-50px', right: '-30px' }} />
      <div className="glow-orb pulse" style={{ width: '180px', height: '180px', background: '#1a3a6a12', bottom: '80px', left: '-20px', animationDelay: '1.5s' }} />

      <header style={{ alignItems: 'center', borderBottom: '0.5px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', padding: '16px 32px', position: 'relative', zIndex: 10 }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '16px' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none' }}>← Dashboard</Link>
          <div style={{ width: '0.5px', height: '16px', background: 'var(--border-subtle)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Mi perfil</span>
        </div>
      </header>

      <div style={{ margin: '0 auto', maxWidth: '560px', padding: '40px 24px', position: 'relative', zIndex: 2 }}>
        <FadeIn>

          <div style={{ alignItems: 'center', display: 'flex', gap: '16px', marginBottom: '36px' }}>
            <div style={{ alignItems: 'center', background: '#1e1535', border: '0.5px solid #3d2a6a', borderRadius: '50%', color: 'var(--accent-purple)', display: 'flex', fontSize: '22px', fontWeight: 500, height: '56px', justifyContent: 'center', width: '56px' }}>
              {form.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500 }}>{form.nombre}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{form.email}</div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#2a101566', border: '0.5px solid #aa556655', borderRadius: '8px', color: '#cc7788', fontSize: '12px', marginBottom: '20px', padding: '10px 14px' }}>
              {error}
            </div>
          )}
          {exito && (
            <div style={{ background: '#0f2a1566', border: '0.5px solid #33664455', borderRadius: '8px', color: '#55aa77', fontSize: '12px', marginBottom: '20px', padding: '10px 14px' }}>
              ✓ {exito}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required style={{ padding: '10px 14px' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ padding: '10px 14px' }} />
            </div>

            <hr className="divider" />

            <div style={{ marginBottom: '24px' }}>
              <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} style={{ alignItems: 'center', background: 'transparent', border: 'none', color: mostrarPassword ? 'var(--accent-purple)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', fontSize: '12px', gap: '8px', padding: 0, transition: 'color 0.2s ease' }}>
                <span style={{ fontSize: '14px' }}>{mostrarPassword ? '▾' : '▸'}</span>
                Cambiar contraseña
              </button>

              {mostrarPassword && (
                <FadeIn style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Contraseña actual</label>
                    <input type="password" name="passwordActual" value={form.passwordActual} onChange={handleChange} placeholder="Tu contraseña actual" style={{ padding: '10px 14px' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Nueva contraseña</label>
                    <input type="password" name="passwordNueva" value={form.passwordNueva} onChange={handleChange} placeholder="Mínimo 6 caracteres" style={{ padding: '10px 14px' }} />
                  </div>
                  <div>
                    <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Confirmar nueva contraseña</label>
                    <input type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} placeholder="Repite la nueva contraseña" style={{ padding: '10px 14px' }} />
                  </div>
                </FadeIn>
              )}
            </div>

            <AnimatedButton type="submit" disabled={loading} className="btn-primary" style={{ fontSize: '13px', opacity: loading ? 0.5 : 1, padding: '12px', width: '100%' }}>
              {loading ? 'Guardando cambios...' : 'Guardar cambios'}
            </AnimatedButton>

          </form>

          <hr className="divider" style={{ marginTop: '40px' }} />

          <div style={{ marginTop: '24px' }}>
            <div className="section-title" style={{ color: '#aa5566' }}>Zona de peligro</div>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Eliminar cuenta</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '3px' }}>Elimina tu cuenta y todos tus sueños permanentemente</div>
                </div>
                <button type="button" onClick={handleDeleteAccount} style={{ background: 'transparent', border: '0.5px solid #aa556655', borderRadius: '8px', color: '#aa5566', cursor: 'pointer', fontSize: '12px', padding: '7px 14px', transition: 'all 0.2s ease', flexShrink: 0, marginLeft: '16px' }}>
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </div>

        </FadeIn>
      </div>
    </main>
  )
}