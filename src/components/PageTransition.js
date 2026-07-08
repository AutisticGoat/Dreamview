'use client'

import { motion } from 'framer-motion'

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{   opacity: 0, y: 8  }}
      animate={{   opacity: 1, y: 0  }}
      exit={{      opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  )
}