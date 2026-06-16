import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import ParticlesBackground from '@/components/ParticlesBackground'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title:       'DreamView',
  description: 'Tu archivo digital de sueños',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.variable}>
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