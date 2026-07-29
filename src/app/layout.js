import { Outfit } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import ParticlesBackground from '@/components/ParticlesBackground'
import AnimatedLayout from '@/components/AnimatedLayout'

const outfit = Outfit({
  subsets:  ['latin'],
  variable: '--font-inter',
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
            <AnimatedLayout>
              {children}
            </AnimatedLayout>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}