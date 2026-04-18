import { db } from '@/lib/db'
import {
  products,
  productDepartments,
  departments,
} from '@/lib/db/schema'
import { handleApiError } from '@/lib/utils/api-error'
import { UpdateProductSchema, PatchProductSchema } from '@/lib/validations/schemas'
import { eq } from 'drizzle-orm'

async function getProductWithDepts(id: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1)

  if (!product) return null

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
    .where(eq(productDepartments.productId, id))

  return { ...product, departments: deptRows }
}

export async function GET(
  _req: Request,
  ctx: RouteContext<'/api/products/[id]'>
) {
  try {
    const { id } = await ctx.params
    const product = await getProductWithDepts(id)
    if (!product) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    return Response.json(product)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/products/[id]'>
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const input = UpdateProductSchema.parse(body)

    const updateData: Partial<typeof products.$inferInsert> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.unit !== undefined) updateData.unit = input.unit
    if (input.category !== undefined) updateData.category = input.category
    updateData.updatedAt = new Date()

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning()

    if (!updated) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (input.departmentIds !== undefined) {
      await db
        .delete(productDepartments)
        .where(eq(productDepartments.productId, id))
      if (input.departmentIds.length > 0) {
        await db.insert(productDepartments).values(
          input.departmentIds.map((deptId) => ({
            productId: id,
            departmentId: deptId,
          }))
        )
      }
    }

    const product = await getProductWithDepts(id)
    return Response.json(product)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<'/api/products/[id]'>
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const input = PatchProductSchema.parse(body)

    const updateData: Partial<typeof products.$inferInsert> = {}
    if (input.isActive !== undefined) updateData.isActive = input.isActive
    if (input.name !== undefined) updateData.name = input.name
    if (input.unit !== undefined) updateData.unit = input.unit
    if (input.category !== undefined) updateData.category = input.category
    updateData.updatedAt = new Date()

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning()

    if (!updated) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (input.departmentIds !== undefined) {
      await db
        .delete(productDepartments)
        .where(eq(productDepartments.productId, id))
      if (input.departmentIds.length > 0) {
        await db.insert(productDepartments).values(
          input.departmentIds.map((deptId) => ({
            productId: id,
            departmentId: deptId,
          }))
        )
      }
    }

    const product = await getProductWithDepts(id)
    return Response.json(product)
  } catch (err) {
    return handleApiError(err)
  }
}
