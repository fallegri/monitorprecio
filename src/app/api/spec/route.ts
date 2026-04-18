export const dynamic = 'force-static'

const SPEC = {
  version: '1.0.0',
  models: {
    Product: {
      id: 'uuid',
      name: 'string',
      unit: 'string',
      category: 'Alimentos | Divisas | Demografía',
      isActive: 'boolean',
      createdAt: 'ISO8601',
      updatedAt: 'ISO8601',
    },
    PriceLog: {
      id: 'bigint',
      productId: 'uuid',
      departmentId: 'uuid',
      price: 'decimal',
      sourceName: 'string',
      sourceUrl: 'string',
      observations: 'string | null',
      timestamp: 'ISO8601',
    },
    Department: {
      id: 'uuid',
      name: 'string',
      code: 'string',
    },
    MonitoringConfig: {
      id: 'uuid',
      cronExpression: 'string',
      timezone: 'string',
      updatedAt: 'ISO8601',
    },
  },
}

export async function GET() {
  return Response.json(SPEC)
}
