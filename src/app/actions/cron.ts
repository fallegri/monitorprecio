'use server'

export interface RunNowResult {
  ok: boolean
  message: string
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
    return { ok: false, message: `Error ${res.status}: ${res.statusText}` }
  }

  const data = await res.json()
  return {
    ok: true,
    message: `✓ Completado: ${data.successful} exitosos, ${data.failed} fallidos`,
  }
}
