'use server'

export interface RunNowResult {
  ok: boolean
  message: string
  successful: number
  failed: number
}

export async function runNow(): Promise<RunNowResult> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const res = await fetch(`${baseUrl}/api/cron/run`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
  })

  if (!res.ok) {
    return { ok: false, message: `Error ${res.status}: No autorizado o error interno`, successful: 0, failed: 0 }
  }

  const data = await res.json()
  const successful: number = data.successful ?? 0
  const failed: number = data.failed ?? 0

  let message: string
  if (successful === 0 && failed === 0) {
    message = '✓ Sin productos activos para relevar'
  } else if (successful > 0 && failed === 0) {
    message = `✓ Completado: ${successful} registros guardados`
  } else if (successful === 0 && failed > 0) {
    message = `⚠ ${failed} fuentes fallaron — los scrapers necesitan configuración`
  } else {
    message = `⚠ ${successful} exitosos, ${failed} fallidos`
  }

  return { ok: true, message, successful, failed }
}
