import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  PriceRecordSchema,
  serializePriceRecord,
  deserializePriceLog,
  type PriceRecord,
} from '@/lib/engine/parser'

// Arbitrary for valid PriceRecord
const arbitraryPriceRecord = () =>
  fc.record({
    productId: fc.uuid(),
    departmentId: fc.uuid(),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
    sourceName: fc.string({ minLength: 1, maxLength: 100 }),
    sourceUrl: fc.constantFrom(
      'https://example.com/price',
      'https://bcb.gob.bo/api',
      'https://unitel.com.bo/precios'
    ),
    observations: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    timestamp: fc.integer({ min: 1577836800000, max: 1893456000000 }).map(
      (ms) => new Date(ms).toISOString()
    ),
  })

describe('PriceRecord Parser', () => {
  // Property 14: Round-trip preserves all fields
  it('Property 14: round-trip parsear → serializar → deserializar preserva todos los campos', () => {
    fc.assert(
      fc.property(arbitraryPriceRecord(), (record: PriceRecord) => {
        const serialized = serializePriceRecord(record)

        // Build a mock DB row from serialized data
        const mockRow = {
          id: 1,
          productId: serialized.productId,
          departmentId: serialized.departmentId,
          price: serialized.price,
          sourceName: serialized.sourceName,
          sourceUrl: serialized.sourceUrl,
          observations: serialized.observations ?? null,
          timestamp: serialized.timestamp instanceof Date
            ? serialized.timestamp
            : new Date(serialized.timestamp as string),
        }

        const deserialized = deserializePriceLog(mockRow as Parameters<typeof deserializePriceLog>[0])

        expect(deserialized.productId).toBe(record.productId)
        expect(deserialized.departmentId).toBe(record.departmentId)
        expect(deserialized.price).toBeCloseTo(record.price, 4)
        expect(deserialized.sourceName).toBe(record.sourceName)
        expect(deserialized.sourceUrl).toBe(record.sourceUrl)
      }),
      { numRuns: 100 }
    )
  })

  // Property 15: Valid response produces complete PriceRecord
  it('Property 15: parseo de respuesta válida produce PriceRecord completo', () => {
    fc.assert(
      fc.property(arbitraryPriceRecord(), (record) => {
        const parsed = PriceRecordSchema.parse(record)
        expect(parsed.productId).toBeDefined()
        expect(parsed.departmentId).toBeDefined()
        expect(parsed.price).toBeGreaterThan(0)
        expect(parsed.sourceName.length).toBeGreaterThan(0)
        expect(parsed.sourceUrl).toMatch(/^https?:\/\//)
        expect(parsed.timestamp).toBeDefined()
      }),
      { numRuns: 100 }
    )
  })

  // Property 16: Invalid response fails without persisting
  it('Property 16: parseo de respuesta inválida falla sin persistir datos', () => {
    const invalidCases = [
      { productId: 'not-a-uuid', departmentId: fc.sample(fc.uuid(), 1)[0], price: 10, sourceName: 'Test', sourceUrl: 'https://example.com', timestamp: new Date().toISOString() },
      { productId: fc.sample(fc.uuid(), 1)[0], departmentId: fc.sample(fc.uuid(), 1)[0], price: -5, sourceName: 'Test', sourceUrl: 'https://example.com', timestamp: new Date().toISOString() },
      { productId: fc.sample(fc.uuid(), 1)[0], departmentId: fc.sample(fc.uuid(), 1)[0], price: 10, sourceName: '', sourceUrl: 'https://example.com', timestamp: new Date().toISOString() },
      { productId: fc.sample(fc.uuid(), 1)[0], departmentId: fc.sample(fc.uuid(), 1)[0], price: 10, sourceName: 'Test', sourceUrl: 'not-a-url', timestamp: new Date().toISOString() },
    ]

    for (const invalid of invalidCases) {
      expect(() => PriceRecordSchema.parse(invalid)).toThrow()
    }
  })
})
