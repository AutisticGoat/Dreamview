import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      cookies: {
        sessionToken: {
          name: `next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path:     '/',
            secure:   false,
          },
        },
      },
      credentials: {
        email:    { label: 'Email',      type: 'email'    },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Ingresa tu email y contraseña')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('No existe una cuenta con ese email')
        }

        const passwordCorrecta = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordCorrecta) {
          throw new Error('Contraseña incorrecta')
        }

        return {
          id:     user.id,
          email:  user.email,
          nombre: user.nombre,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id     = user.id
        token.nombre = user.nombre
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id     = token.id
        session.user.nombre = token.nombre
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }