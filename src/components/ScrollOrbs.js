'use client'

import { useEffect, useState } from 'react'

export default function ScrollOrbs() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div style={{
        background:    '#3d2d8a40',
        borderRadius:  '50%',
        filter:        'blur(50px)',
        height:        '300px',
        opacity:       0.6,
        pointerEvents: 'none',
        position:      'fixed',
        right:         '-60px',
        top:           `${-60 + scrollY * 0.15}px`,
        transition:    'top 0.1s ease-out',
        width:         '300px',
        zIndex:        0,
      }} />
      <div style={{
        background:    '#1a3a6a40',
        borderRadius:  '50%',
        filter:        'blur(50px)',
        height:        '200px',
        left:          '-20px',
        opacity:       0.6,
        pointerEvents: 'none',
        position:      'fixed',
        bottom:        'auto',
        top:           `${300 - scrollY * 0.1}px`,
        transition:    'top 0.1s ease-out',
        width:         '200px',
        zIndex:        0,
      }} />
    </>
  )
}