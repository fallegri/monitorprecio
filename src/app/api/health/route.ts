import { neon } from '@neondatabase/serverless'

function getTimestamp(): string {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'America/La_Paz',
    hour12: false,
  }).replace(' ', 'T') + '-04:00'
}

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    await sql`SELECT 1`
    return Response.json(
      { status: 'ok', db: 'connected', timestamp: getTimestamp() },
      { status: 200 }
    )
  } catch {
    return Response.json(
      { status: 'error', db: 'disconnected', timestamp: getTimestamp() },
      { status: 503 }
    )
  }
}
