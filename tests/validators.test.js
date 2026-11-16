import { describe, it, expect } from 'vitest'
import { registerSchema } from '@/lib/validators'

const valido = { nombre: 'Ana', email: 'ana@example.com', password: 'Segura#123' }

describe('registerSchema', () => {
  it('acepta datos válidos', () => {
    expect(registerSchema.safeParse(valido).success).toBe(true)
  })

  it.each([
    ['demasiado corta',  'Ab#1'],
    ['sin mayúscula',    'segura#123'],
    ['sin número',       'Segura#abc'],
    ['sin carácter especial', 'Segura1234'],
  ])('rechaza una contraseña %s', (_, password) => {
    expect(registerSchema.safeParse({ ...valido, password }).success).toBe(false)
  })

  it('rechaza un email inválido', () => {
    expect(registerSchema.safeParse({ ...valido, email: 'no-es-email' }).success).toBe(false)
  })

  it('rechaza un nombre de un solo carácter', () => {
    expect(registerSchema.safeParse({ ...valido, nombre: 'A' }).success).toBe(false)
  })
})