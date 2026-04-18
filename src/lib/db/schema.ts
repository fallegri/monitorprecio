import {
  pgTable,
  uuid,
  text,
  boolean,
  decimal,
  bigserial,
  timestamp,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core'

export const categoryEnum = pgEnum('category', [
  'Alimentos',
  'Divisas',
  'Demografía',
])

export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
})

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  unit: text('unit').notNull(),
  category: categoryEnum('category').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const productDepartments = pgTable(
  'product_departments',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    departmentId: uuid('department_id')
      .notNull()
      .references(() => departments.id, { onDelete: 'restrict' }),
  },
  (t) => [unique().on(t.productId, t.departmentId)]
)

export const priceLogs = pgTable('price_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departments.id),
  price: decimal('price', { precision: 18, scale: 4 }).notNull(),
  sourceName: text('source_name').notNull(),
  sourceUrl: text('source_url').notNull(),
  observations: text('observations'),
  timestamp: timestamp('timestamp', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const monitoringConfig = pgTable('monitoring_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  cronExpression: text('cron_expression').notNull().default('0 8 * * *'),
  timezone: text('timezone').notNull().default('America/La_Paz'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Inferred types
export type Department = typeof departments.$inferSelect
export type NewDepartment = typeof departments.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductDepartment = typeof productDepartments.$inferSelect
export type PriceLog = typeof priceLogs.$inferSelect
export type NewPriceLog = typeof priceLogs.$inferInsert
export type MonitoringConfig = typeof monitoringConfig.$inferSelect
export type NewMonitoringConfig = typeof monitoringConfig.$inferInsert
