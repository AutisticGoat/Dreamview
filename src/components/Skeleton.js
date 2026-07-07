'use client'

export function SkeletonBox({ width = '100%', height = '16px', borderRadius = '6px', style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background:    'linear-gradient(90deg, #0e0e22 25%, #1a1a35 50%, #0e0e22 75%)',
      backgroundSize: '200% 100%',
      animation:     'skeleton-shimmer 1.5s infinite',
      ...style,
    }} />
  )
}

export function SkeletonCard({ style = {} }) {
  return (
    <div className="card" style={{ padding: '16px', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <SkeletonBox width="60%" height="14px" />
        <SkeletonBox width="15%" height="12px" />
      </div>
      <SkeletonBox width="100%" height="12px" style={{ marginBottom: '6px' }} />
      <SkeletonBox width="80%"  height="12px" style={{ marginBottom: '12px' }} />
      <div style={{ display: 'flex', gap: '6px' }}>
        <SkeletonBox width="60px" height="20px" borderRadius="20px" />
        <SkeletonBox width="60px" height="20px" borderRadius="20px" />
        <SkeletonBox width="60px" height="20px" borderRadius="20px" />
      </div>
    </div>
  )
}

export function SkeletonStat({ style = {} }) {
  return (
    <div className="card" style={{ padding: '16px', ...style }}>
      <SkeletonBox width="30%" height="3px" style={{ marginBottom: '10px' }} />
      <SkeletonBox width="50%" height="22px" style={{ marginBottom: '6px' }} />
      <SkeletonBox width="70%" height="10px" />
    </div>
  )
}

export function SkeletonDreamDetail({ style = {} }) {
  return (
    <div style={{ margin: '0 auto', maxWidth: '680px', padding: '40px 24px', ...style }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <SkeletonBox width="120px" height="24px" borderRadius="6px" />
        <SkeletonBox width="80px"  height="24px" borderRadius="6px" />
      </div>
      <SkeletonBox width="70%" height="30px" style={{ marginBottom: '16px' }} />
      <SkeletonBox width="100%" height="14px" style={{ marginBottom: '8px' }} />
      <SkeletonBox width="100%" height="14px" style={{ marginBottom: '8px' }} />
      <SkeletonBox width="85%"  height="14px" style={{ marginBottom: '8px' }} />
      <SkeletonBox width="90%"  height="14px" style={{ marginBottom: '36px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SkeletonBox width="100%" height="2px" />
        <SkeletonBox width="40%"  height="12px" />
        <SkeletonBox width="100%" height="8px"  borderRadius="4px" />
        <SkeletonBox width="100%" height="8px"  borderRadius="4px" />
      </div>
    </div>
  )
}