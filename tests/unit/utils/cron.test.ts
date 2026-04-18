import { describe, it, expect } from 'vitest'
import { isValidCronExpression } from '@/lib/utils/cron'

describe('isValidCronExpression', () => {
  it('acepta expresiones cron válidas', () => {
    expect(isValidCronExpression('0 8 * * *')).toBe(true)
    expect(isValidCronExpression('0 8 * * 1')).toBe(true)
    expect(isValidCronExpression('0 8 1 * *')).toBe(true)
    expect(isValidCronExpression('*/5 * * * *')).toBe(true)
    expect(isValidCronExpression('0 9,17 * * *')).toBe(true)
    expect(isValidCronExpression('0 0 1-15 * *')).toBe(true)
  })

  it('rechaza expresiones cron inválidas', () => {
    expect(isValidCronExpression('')).toBe(false)
    expect(isValidCronExpression('invalid')).toBe(false)
    expect(isValidCronExpression('0 8 * *')).toBe(false) // solo 4 campos
    expect(isValidCronExpression('60 8 * * *')).toBe(false) // minuto > 59
    expect(isValidCronExpression('0 25 * * *')).toBe(false) // hora > 23
    expect(isValidCronExpression('0 8 32 * *')).toBe(false) // día > 31
    expect(isValidCronExpression('0 8 * 13 *')).toBe(false) // mes > 12
  })
})
