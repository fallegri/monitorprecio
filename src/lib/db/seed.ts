import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const DEPARTMENTS = [
  { name: 'Santa Cruz', code: 'SCZ' },
  { name: 'La Paz', code: 'LPZ' },
  { name: 'Cochabamba', code: 'CBB' },
  { name: 'Oruro', code: 'ORU' },
  { name: 'Potosí', code: 'POT' },
  { name: 'Chuquisaca', code: 'CHU' },
  { name: 'Tarija', code: 'TJA' },
  { name: 'Beni', code: 'BEN' },
  { name: 'Pando', code: 'PAN' },
]

async function seed() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql, { schema })

  console.log('🌱 Seeding departments...')

  for (const dept of DEPARTMENTS) {
    await db
      .insert(schema.departments)
      .values(dept)
      .onConflictDoNothing({ target: schema.departments.code })
    console.log(`  ✓ ${dept.name} (${dept.code})`)
  }

  // Seed default monitoring config if not exists
  const existing = await db.select().from(schema.monitoringConfig).limit(1)
  if (existing.length === 0) {
    await db.insert(schema.monitoringConfig).values({
      cronExpression: '0 8 * * *',
      timezone: 'America/La_Paz',
    })
    console.log('  ✓ Default monitoring config created')
  }

  console.log('✅ Seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
