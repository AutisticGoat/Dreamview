'use client'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '24px' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        style={{
          background:   'transparent',
          border:       '0.5px solid var(--border-subtle)',
          borderRadius: '8px',
          color:        page === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
          cursor:       page === 1 ? 'default' : 'pointer',
          fontSize:     '13px',
          opacity:      page === 1 ? 0.4 : 1,
          padding:      '6px 12px',
        }}
      >
        ←
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            background:   p === page ? '#1e1a3a' : 'transparent',
            border:       `0.5px solid ${p === page ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
            borderRadius: '8px',
            color:        p === page ? 'var(--accent-purple)' : 'var(--text-muted)',
            cursor:       'pointer',
            fontSize:     '12px',
            fontWeight:   p === page ? 500 : 400,
            padding:      '6px 11px',
            transition:   'all 0.2s ease',
          }}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        style={{
          background:   'transparent',
          border:       '0.5px solid var(--border-subtle)',
          borderRadius: '8px',
          color:        page === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
          cursor:       page === totalPages ? 'default' : 'pointer',
          fontSize:     '13px',
          opacity:      page === totalPages ? 0.4 : 1,
          padding:      '6px 12px',
        }}
      >
        →
      </button>
    </div>
  )
}