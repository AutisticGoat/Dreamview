import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ alignItems: 'center', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '24px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>

      <div className="glow-orb pulse" style={{ width: '300px', height: '300px', background: '#3d2d8a18', top: '-60px', left: '-60px' }} />
      <div className="glow-orb pulse" style={{ width: '200px', height: '200px', background: '#1a3a6a12', bottom: '40px', right: '-40px', animationDelay: '1.5s' }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          color:         'var(--accent-purple)',
          fontSize:      '80px',
          fontWeight:    500,
          lineHeight:    1,
          marginBottom:  '16px',
          opacity:       0.3,
        }}>
          404
        </div>

        <h1 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 500, marginBottom: '10px' }}>
          Esta página no existe
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '32px', maxWidth: '320px' }}>
          La página que buscas no se encontró o fue movida a otra dirección.
        </p>

        <Link href="/dashboard" className="btn-primary" style={{ fontSize: '13px', padding: '10px 24px', textDecoration: 'none' }}>
          Volver al dashboard
        </Link>
      </div>
    </main>
  )
}