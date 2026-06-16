'use client'

import { useCallback } from 'react'
import Particles from 'react-tsparticles'
import { loadSlim } from 'tsparticles-slim'

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100%',
        zIndex:        0,
        pointerEvents: 'none',
      }}
      options={{
        background:   { color: { value: 'transparent' } },
        fpsLimit:     60,
        particles: {
          number:  { value: 60, density: { enable: true, area: 900 } },
          color:   { value: ['#6655cc', '#3a7fc1', '#9977dd', '#4a9eda'] },
          shape:   { type: 'circle' },
          opacity: {
            value:     { min: 0.05, max: 0.3 },
            animation: { enable: true, speed: 0.8, sync: false },
          },
          size:  { value: { min: 0.5, max: 2 } },
          links: { enable: true, distance: 140, color: '#6655cc', opacity: 0.06, width: 0.5 },
          move:  { enable: true, speed: 0.4, random: true, outModes: { default: 'bounce' } },
        },
        interactivity: {
          events: { onHover: { enable: true, mode: 'grab' } },
          modes:  { grab: { distance: 120, links: { opacity: 0.15 } } },
        },
        detectRetina: true,
      }}
    />
  )
}