import { db } from '@/lib/db'
import {
  products,
  productDepartments,
  departments,
  priceLogs,
} from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { PriceRecordSchema, serializePriceRecord } from './parser'
import type { ScraperAdapter } from './scrapers/base'
import type { RestApiAdapter } from './clients/base'
import { UnitelScraper } from './scrapers/unitel'
import { ElDeberScraper } from './scrapers/eldeber'
import { BcbApiClient } from './clients/bcb'

export interface EngineError {
  productId: string
  departmentId: string
  source: string
  reason: string
  timestamp: string
}

export interface EngineRunResult {
  successful: number
  failed: number
  errors: EngineError[]
  finishedAt: string
}

export interface EngineRunOptions {
  category?: 'Alimentos' | 'Divisas' | 'Demografía'
  departmentCode?: string
}

// Registry maps a product's sourceKey to its adapter
const ADAPTER_REGISTRY: Record<string, ScraperAdapter | RestApiAdapter> = {
  'unitel-web': new UnitelScraper(),
  'eldeber-web': new ElDeberScraper(),
  'bcb-api': new BcbApiClient(),
}

function getTimestamp(): string {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'America/La_Paz',
    hour12: false,
  }).replace(' ', 'T') + '-04:00'
}

export async function runEngine(
  options: EngineRunOptions = {}
): Promise<EngineRunResult> {
  const result: EngineRunResult = {
    successful: 0,
    failed: 0,
    errors: [],
    finishedAt: '',
  }

  // 1. Fetch active products with their departments
  const conditions = [eq(products.isActive, true)]
  if (options.category) {
    conditions.push(eq(products.category, options.category))
  }

  const activeProducts = await db
    .select()
    .from(products)
    .where(and(...conditions))

  if (activeProducts.length === 0) {
    result.finishedAt = getTimestamp()
    return result
  }

  const productIds = activeProducts.map((p) => p.id)

  // Fetch department associations
  let deptQuery = db
    .select({
      productId: productDepartments.productId,
      departmentId: productDepartments.departmentId,
      departmentCode: departments.code,
    })
    .from(productDepartments)
    .innerJoin(
      departments,
      eq(productDepartments.departmentId, departments.id)
    )
    .where(inArray(productDepartments.productId, productIds))

  const deptRows = await deptQuery

  // Filter by departmentCode if provided
  const filteredDeptRows = options.departmentCode
    ? deptRows.filter((d) => d.departmentCode === options.departmentCode)
    : deptRows

  // Build product → departments map
  const productDeptMap = new Map<
    string,
    Array<{ departmentId: string; departmentCode: string }>
  >()
  for (const row of filteredDeptRows) {
    if (!productDeptMap.has(row.productId)) {
      productDeptMap.set(row.productId, [])
    }
    productDeptMap.get(row.productId)!.push({
      departmentId: row.departmentId,
      departmentCode: row.departmentCode,
    })
  }

  // 2. Iterate over each product × department combination
  for (const product of activeProducts) {
    const depts = productDeptMap.get(product.id) ?? []

    for (const dept of depts) {
      // Resolve adapter — products need a sourceKey field (future enhancement)
      // For now, use a default adapter based on category
      const adapterKey = resolveAdapterKey(product.category)
      const adapter = ADAPTER_REGISTRY[adapterKey]

      if (!adapter) {
        result.failed++
        result.errors.push({
          productId: product.id,
          departmentId: dept.departmentId,
          source: adapterKey,
          reason: `Adaptador no encontrado: ${adapterKey}`,
          timestamp: getTimestamp(),
        })
        continue
      }

      try {
        const raw = await adapter.fetch(product.id, dept.departmentId)
        const validated = PriceRecordSchema.parse(raw)
        const serialized = serializePriceRecord(validated)

        await db.insert(priceLogs).values(serialized)
        result.successful++
      } catch (err) {
        result.failed++
        result.errors.push({
          productId: product.id,
          departmentId: dept.departmentId,
          source: adapter.sourceName,
          reason: err instanceof Error ? err.message : String(err),
          timestamp: getTimestamp(),
        })
      }
    }
  }

  result.finishedAt = getTimestamp()
  return result
}

function resolveAdapterKey(
  category: 'Alimentos' | 'Divisas' | 'Demografía'
): string {
  switch (category) {
    case 'Divisas':
      return 'bcb-api'
    case 'Alimentos':
      return 'unitel-web'
    case 'Demografía':
      return 'eldeber-web'
    default:
      return 'unitel-web'
  }
}
