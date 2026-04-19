import { runEngine } from '@/lib/engine'
import { handleApiError } from '@/lib/utils/api-error'
import type { EngineRunOptions } from '@/lib/engine'

export async function POST(request: Request) {
  // Verify CRON_SECRET before any other operation
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()

  // Debug: log whether env var is set (never log the actual value)
  console.log('[cron/run] CRON_SECRET set:', !!process.env.CRON_SECRET)
  console.log('[cron/run] token received:', !!token)

  if (!token || token !== process.env.CRON_SECRET) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') ?? undefined
    const departmentCode = searchParams.get('departmentCode') ?? undefined

    const options: EngineRunOptions = {}
    if (
      category === 'Alimentos' ||
      category === 'Divisas' ||
      category === 'Demografía'
    ) {
      options.category = category
    }
    if (departmentCode) {
      options.departmentCode = departmentCode
    }

    const result = await runEngine(options)
    return Response.json(result)
  } catch (err) {
    return handleApiError(err)
  }
}
