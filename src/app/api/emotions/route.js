import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const emotions = await prisma.emotion.findMany({
      orderBy: { nombre: 'asc' }
    })
    return NextResponse.json(emotions)
  } catch (error) {
    console.error('Error al obtener emociones:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}