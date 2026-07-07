'use client'

import useIsMobile from '@/hooks/useIsMobile'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FadeIn, AnimatedButton, AnimatedLoader } from '@/components/animations'

export default function EditDreamPage() {
  const isMobile = useIsMobile()
  const router             = useRouter()
  const params             = useParams()
  const { status }         = useSession()
  const [emociones, setEmociones]         = useState([])
  const [loading, setLoading]             = useState(false)
  const [loadingData, setLoadingData]     = useState(true)
  const [error, setError]                 = useState('')
  const [etiquetaInput, setEtiquetaInput] = useState('')
  const [simboloInput, setSimboloInput]   = useState('')

  const [form, setForm] = useState({
    titulo:      '',
    descripcion: '',
    intensidad:  3,
    fecha:       '',
    emociones:   [],
    etiquetas:   [],
    simbolos:    [],
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    Promise.all([
      fetch('/api/emotions').then(res => res.json()),
      fetch(`/api/dreams/${params.id}`).then(res => res.json()),
    ]).then(([emocionesData, dreamData]) => {
      setEmociones(Array.isArray(emocionesData) ? emocionesData : [])
      if (dreamData.error) { setError(dreamData.error); return }
      setForm({
        titulo:      dreamData.titulo,
        descripcion: dreamData.descripcion,
        intensidad:  dreamData.intensidad,
        fecha:       new Date(dreamData.fecha).toISOString().split('T')[0],
        emociones:   dreamData.emotions.map(e => ({ emotionId: e.emotionId, intensidad: e.intensidad })),
        etiquetas:   dreamData.tags.map(t => t.tag.nombre),
        simbolos:    dreamData.symbols.map(s => s.symbol.nombre),
      })
      setLoadingData(false)
    })
  }, [status, params.id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleEmocion = (emotionId) => {
    const existe = form.emociones.find(e => e.emotionId === emotionId)
    if (existe) {
      setForm({ ...form, emociones: form.emociones.filter(e => e.emotionId !== emotionId) })
    } else {
      setForm({ ...form, emociones: [...form.emociones, { emotionId, intensidad: 3 }] })
    }
  }

  const updateIntensidadEmocion = (emotionId, intensidad) => {
    setForm({ ...form, emociones: form.emociones.map(e => e.emotionId === emotionId ? { ...e, intensidad: parseInt(intensidad) } : e) })
  }

  const agregarEtiqueta = (e) => {
    e?.preventDefault()
    const valor = etiquetaInput.trim().toLowerCase()
    if (valor && !form.etiquetas.includes(valor)) setForm({ ...form, etiquetas: [...form.etiquetas, valor] })
    setEtiquetaInput('')
  }

  const eliminarEtiqueta = (etiqueta) => setForm({ ...form, etiquetas: form.etiquetas.filter(e => e !== etiqueta) })

  const agregarSimbolo = (e) => {
    e?.preventDefault()
    const valor = simboloInput.trim().toLowerCase()
    if (valor && !form.simbolos.includes(valor)) setForm({ ...form, simbolos: [...form.simbolos, valor] })
    setSimboloInput('')
  }

  const eliminarSimbolo = (simbolo) => setForm({ ...form, simbolos: form.simbolos.filter(s => s !== simbolo) })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/dreams/${params.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, intensidad: parseInt(form.intensidad) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/dreams/${params.id}`)
    } catch {
      setError('Ocurrió un error, intenta de nuevo')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <AnimatedLoader />

  return (
    <main style={{ background: 'var(--bg-base)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      <div className="glow-orb pulse" style={{ width: '280px', height: '280px', background: '#3d2d8a18', top: '-50px', right: '-30px' }} />
      <div className="glow-orb pulse" style={{ width: '180px', height: '180px', background: '#1a3a6a12', bottom: '80px', left: '-20px', animationDelay: '1.5s' }} />

      <header style={{ alignItems: 'center', borderBottom: '0.5px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', padding: isMobile ? '12px 16px' : '16px 32px', position: 'relative', zIndex: 10 }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '16px' }}>
          <Link href={`/dreams/${params.id}`} style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none' }}>← Volver</Link>
          <div style={{ width: '0.5px', height: '16px', background: 'var(--border-subtle)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Editar sueño</span>
        </div>
      </header>

      <div style={{ margin: '0 auto', maxWidth: isMobile ? '100%' : '640px', padding: isMobile ? '24px 16px 80px' : '40px 24px' , position: 'relative', zIndex: 2 }}>
        <FadeIn>
          {error && (
            <div style={{ background: '#2a101566', border: '0.5px solid #aa556655', borderRadius: '8px', color: '#cc7788', fontSize: '13px', marginBottom: '24px', padding: '12px 16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Título del sueño</label>
              <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required style={{ padding: '10px 14px' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Fecha</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required style={{ padding: '10px 14px' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={6} style={{ padding: '10px 14px', resize: 'none' }} />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                Intensidad general — <span style={{ color: 'var(--text-primary)' }}>{form.intensidad} / 5</span>
              </label>
              <input type="range" name="intensidad" min="1" max="5" value={form.intensidad} onChange={handleChange} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Muy leve</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Muy intenso</span>
              </div>
            </div>

            <hr className="divider" />

            <div style={{ marginBottom: '28px' }}>
              <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase' }}>Emociones presentes</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {emociones.map(emocion => {
                  const seleccionada = form.emociones.find(e => e.emotionId === emocion.id)
                  return (
                    <div key={emocion.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <button type="button" onClick={() => toggleEmocion(emocion.id)} style={{ background: seleccionada ? emocion.colorHex + '22' : 'transparent', border: `0.5px solid ${seleccionada ? emocion.colorHex : 'var(--border-subtle)'}`, borderRadius: '20px', color: seleccionada ? emocion.colorHex : 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', padding: '5px 14px', transition: 'all 0.2s ease' }}>
                        {emocion.nombre}
                      </button>
                      {seleccionada && (
                        <div style={{ width: '80px' }}>
                          <input type="range" min="1" max="5" value={seleccionada.intensidad} onChange={(e) => updateIntensidadEmocion(emocion.id, e.target.value)} style={{ accentColor: emocion.colorHex }} />
                          <div style={{ color: 'var(--text-muted)', fontSize: '10px', textAlign: 'center' }}>{seleccionada.intensidad}/5</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <hr className="divider" />

            <div style={{ marginBottom: '28px' }}>
              <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Etiquetas</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input type="text" value={etiquetaInput} onChange={(e) => setEtiquetaInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarEtiqueta())} placeholder="Escribe y presiona Enter o +" style={{ padding: '8px 14px' }} />
                <button type="button" onClick={agregarEtiqueta} style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', flexShrink: 0, padding: '8px 14px' }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {form.etiquetas.map(etiqueta => (
                  <span key={etiqueta} className="tag tag-label" style={{ alignItems: 'center', display: 'inline-flex', gap: '6px' }}>
                    #{etiqueta}
                    <button type="button" onClick={() => eliminarEtiqueta(etiqueta)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>Símbolos</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input type="text" value={simboloInput} onChange={(e) => setSimboloInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarSimbolo())} placeholder="Escribe y presiona Enter o +" style={{ padding: '8px 14px' }} />
                <button type="button" onClick={agregarSimbolo} style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', flexShrink: 0, padding: '8px 14px' }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {form.simbolos.map(simbolo => (
                  <span key={simbolo} className="tag tag-symbol" style={{ alignItems: 'center', display: 'inline-flex', gap: '6px' }}>
                    ✦ {simbolo}
                    <button type="button" onClick={() => eliminarSimbolo(simbolo)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <AnimatedButton type="submit" disabled={loading} className="btn-primary" style={{ fontSize: '14px', opacity: loading ? 0.5 : 1, padding: '13px', width: '100%' }}>
              {loading ? 'Guardando cambios...' : 'Guardar cambios'}
            </AnimatedButton>

          </form>
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
            { icon: '⊞', href: '/dashboard', active: false },
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