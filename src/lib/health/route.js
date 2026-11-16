import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status:  'ok',
      db:      'up',
      version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
      uptime:  Math.round(process.uptime()),
    })
  } catch (error) {
    console.error('Health check falló:', error)
    return NextResponse.json({ status: 'error', db: 'down' }, { status: 503 })
  }
}