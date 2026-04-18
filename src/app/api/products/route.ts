import { db } from '@/lib/db'
import {
  products,
  productDepartments,
  departments,
} from '@/lib/db/schema'
import { handleApiError } from '@/lib/utils/api-error'
import { CreateProductSchema } from '@/lib/validations/schemas'
import { eq, and, inArray } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') ?? undefined
    const departmentId = searchParams.get('departmentId') ?? undefined
    const isActiveParam = searchParams.get('isActive')
    const isActive =
      isActiveParam === 'true'
        ? true
        : isActiveParam === 'false'
          ? false
          : undefined

    // Build where conditions
    const conditions = []
    if (category) conditions.push(eq(products.category, category as 'Alimentos' | 'Divisas' | 'Demografía'))
    if (isActive !== undefined) conditions.push(eq(products.isActive, isActive))

    const rows = await db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    // Fetch departments for each product
    const productIds = rows.map((p) => p.id)
    let deptRows: Array<{
      productId: string
      departmentId: string
      deptName: string
      deptCode: string
    }> = []

    if (productIds.length > 0) {
      const joined = await db
        .select({
          productId: productDepartments.productId,
          departmentId: productDepartments.departmentId,
          deptName: departments.name,
          deptCode: departments.code,
        })
        .from(productDepartments)
        .innerJoin(
          departments,
          eq(productDepartments.departmentId, departments.id)
        )
        .where(inArray(productDepartments.productId, productIds))

      deptRows = joined
    }

    // Filter by departmentId if provided
    const filteredProductIds = departmentId
      ? new Set(
          deptRows
            .filter((d) => d.departmentId === departmentId)
            .map((d) => d.productId)
        )
      : null

    const result = rows
      .filter((p) => !filteredProductIds || filteredProductIds.has(p.id))
      .map((p) => ({
        ...p,
        departments: deptRows
          .filter((d) => d.productId === p.id)
          .map((d) => ({
            id: d.departmentId,
            name: d.deptName,
            code: d.deptCode,
          })),
      }))

    return Response.json(result)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = CreateProductSchema.parse(body)

    const [product] = await db
      .insert(products)
      .values({
        name: input.name,
        unit: input.unit,
        category: input.category,
      })
      .returning()

    if (input.departmentIds.length > 0) {
      await db.insert(productDepartments).values(
        input.departmentIds.map((deptId) => ({
          productId: product.id,
          departmentId: deptId,
        }))
      )
    }

    const deptRows = await db
      .select({
        id: departments.id,
        name: departments.name,
        code: departments.code,
      })
      .from(productDepartments)
      .innerJoin(
        departments,
        eq(productDepartments.departmentId, departments.id)
      )
      .where(eq(productDepartments.productId, product.id))

    return Response.json({ ...product, departments: deptRows }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
