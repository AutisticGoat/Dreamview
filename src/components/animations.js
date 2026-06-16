'use client'

import { motion } from 'framer-motion'

// Fade in desde abajo — para páginas y secciones
export function FadeIn({ children, delay = 0, duration = 0.4, style = {} }) {
  return (
    <motion.div
      initial={{   opacity: 0, y: 12 }}
      animate={{   opacity: 1, y: 0  }}
      exit={{      opacity: 0, y: 12 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// Fade in simple — para elementos sutiles
export function FadeInSimple({ children, delay = 0, duration = 0.3, style = {} }) {
  return (
    <motion.div
      initial={{   opacity: 0 }}
      animate={{   opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// Escala desde el centro — para cards y modales
export function ScaleIn({ children, delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{   opacity: 0, scale: 0.96 }}
      animate={{   opacity: 1, scale: 1    }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// Stagger — para listas de items
export function StaggerList({ children, style = {} }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, style = {} }) {
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y: 8  },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
      }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// Card con hover animado
export function AnimatedCard({ children, onClick, style = {} }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      whileTap={{   scale: 0.99 }}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// Botón animado
export function AnimatedButton({ children, onClick, className, style = {}, disabled = false, type = 'button' }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{   scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      className={className}
      style={style}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  )
}

// Punto pulsante — para el logo del sidebar
export function PulsingDot({ style = {} }) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          '0 0 4px #6655cc44',
          '0 0 12px #6655cc88',
          '0 0 4px #6655cc44',
        ],
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width:        '7px',
        height:       '7px',
        borderRadius: '50%',
        background:   '#6655cc',
        ...style,
      }}
    />
  )
}

// Loader animado
export function AnimatedLoader() {
  return (
    <main style={{ alignItems: 'center', background: 'var(--bg-base)', display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)' }}
        />
        <motion.span
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.1em' }}
        >
          CARGANDO
        </motion.span>
      </div>
    </main>
  )
}