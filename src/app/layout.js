import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import ParticlesBackground from '@/components/ParticlesBackground'

import { Outfit } from 'next/font/google'

const outfit = Outfit({
  subsets:  ['latin'],
  variable: '--font-inter', // mantenemos la variable para no cambiar referencias
  weight:   ['300', '400', '500', '600'],
})

export const metadata = {
  title:       'DreamView',
  description: 'Tu archivo digital de sueños',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={outfit.variable}>
        <SessionProvider>
          <ParticlesBackground />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}