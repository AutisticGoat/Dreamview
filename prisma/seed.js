import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const emociones = [
    { nombre: 'Alegría',   colorHex: '#FFD700' },
    { nombre: 'Miedo',     colorHex: '#1E3A5F' },
    { nombre: 'Ansiedad',  colorHex: '#CC2936' },
    { nombre: 'Tristeza',  colorHex: '#5B7FA6' },
    { nombre: 'Nostalgia', colorHex: '#9B72AA' },
    { nombre: 'Confusión', colorHex: '#708090' },
    { nombre: 'Asombro',   colorHex: '#00CED1' },
    { nombre: 'Paz',       colorHex: '#90EE90' },
    { nombre: 'Angustia',  colorHex: '#8B0000' },
    { nombre: 'Euforia',   colorHex: '#FF6B35' },
  ]

  for (const emocion of emociones) {
    await prisma.emotion.upsert({
      where:  { nombre: emocion.nombre },
      update: {},
      create: emocion,
    })
  }

  console.log('✅ Emociones sembradas correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })