import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/dreams') || pathname.startsWith('/stats') || pathname.startsWith('/explore') || pathname.startsWith('/profile'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/dreams/:path*',
    '/stats',
    '/explore',
    '/profile',
  ]
}