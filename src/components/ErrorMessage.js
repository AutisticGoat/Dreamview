export default function ErrorMessage({ mensaje, onRetry, href, hrefLabel }) {
  return (
    <main style={{ alignItems: 'center', background: 'var(--bg-base)', display: 'flex', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '320px' }}>
        <div style={{ color: '#aa5566', fontSize: '32px', marginBottom: '16px', opacity: 0.6 }}>⚠</div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
          Ocurrió un error
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
          {mensaje}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {onRetry && (
            <button onClick={onRetry} className="btn-primary" style={{ fontSize: '12px', padding: '8px 18px' }}>
              Reintentar
            </button>
          )}
          {href && (
            <a href={href} className="btn-ghost" style={{ fontSize: '12px', padding: '8px 18px', textDecoration: 'none' }}>
              {hrefLabel ?? 'Volver'}
            </a>
          )}
        </div>
      </div>
    </main>
  )
}