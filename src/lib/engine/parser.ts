import { z } from 'zod'
import type { priceLogs } from '@/lib/db/schema'

export const PriceRecordSchema = z.object({
  productId: z.string().uuid('productId debe ser un UUID válido'),
  departmentId: z.string().uuid('departmentId debe ser un UUID válido'),
  price: z.number().positive('El precio debe ser un número positivo'),
  sourceName: z.string().min(1, 'sourceName es requerido'),
  sourceUrl: z.string().url('sourceUrl debe ser una URL válida'),
  observations: z.string().optional(),
  timestamp: z
    .string()
    .datetime({ offset: true, message: 'timestamp debe ser ISO8601 con offset' }),
})

export type PriceRecord = z.infer<typeof PriceRecordSchema>

/**
 * Serializes a PriceRecord to the DB insert format.
 */
export function serializePriceRecord(
  record: PriceRecord
): typeof priceLogs.$inferInsert {
  return {
    productId: record.productId,
    departmentId: record.departmentId,
    price: record.price.toString(),
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    observations: record.observations ?? null,
    timestamp: new Date(record.timestamp),
  }
}

/**
 * Deserializes a DB price_log row back to a PriceRecord.
 */
export function deserializePriceLog(
  row: typeof priceLogs.$inferSelect
): PriceRecord {
  return PriceRecordSchema.parse({
    productId: row.productId,
    departmentId: row.departmentId,
    price: parseFloat(row.price),
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    observations: row.observations ?? undefined,
    timestamp: row.timestamp.toISOString(),
  })
}
