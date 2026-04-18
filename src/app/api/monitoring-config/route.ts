import { db } from '@/lib/db'
import { monitoringConfig } from '@/lib/db/schema'
import { handleApiError } from '@/lib/utils/api-error'
import { isValidCronExpression } from '@/lib/utils/cron'
import { UpdateMonitoringConfigSchema } from '@/lib/validations/schemas'

export async function GET() {
  try {
    const rows = await db.select().from(monitoringConfig).limit(1)
    if (rows.length === 0) {
      return Response.json(
        { error: 'Configuración de monitoreo no encontrada' },
        { status: 404 }
      )
    }
    return Response.json(rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const input = UpdateMonitoringConfigSchema.parse(body)

    if (!isValidCronExpression(input.cronExpression)) {
      return Response.json(
        { error: 'Expresión cron inválida. Use el formato: minuto hora día-mes mes día-semana (ej: 0 8 * * *)' },
        { status: 400 }
      )
    }

    const rows = await db.select().from(monitoringConfig).limit(1)

    let updated
    if (rows.length === 0) {
      ;[updated] = await db
        .insert(monitoringConfig)
        .values({ cronExpression: input.cronExpression })
        .returning()
    } else {
      ;[updated] = await db
        .update(monitoringConfig)
        .set({ cronExpression: input.cronExpression, updatedAt: new Date() })
        .returning()
    }

    return Response.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
