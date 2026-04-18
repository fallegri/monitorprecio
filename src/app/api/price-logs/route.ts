import { db } from '@/lib/db'
import { priceLogs } from '@/lib/db/schema'
import { handleApiError } from '@/lib/utils/api-error'
import { eq, and, gte, lte, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId') ?? undefined
    const departmentId = searchParams.get('departmentId') ?? undefined
    const from = searchParams.get('from') ?? undefined
    const to = searchParams.get('to') ?? undefined
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? '100', 10),
      1000
    )

    const conditions = []
    if (productId) conditions.push(eq(priceLogs.productId, productId))
    if (departmentId) conditions.push(eq(priceLogs.departmentId, departmentId))
    if (from) conditions.push(gte(priceLogs.timestamp, new Date(from)))
    if (to) conditions.push(lte(priceLogs.timestamp, new Date(to)))

    const rows = await db
      .select()
      .from(priceLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${priceLogs.timestamp} DESC`)
      .limit(limit)

    return Response.json(rows)
  } catch (err) {
    return handleApiError(err)
  }
}
