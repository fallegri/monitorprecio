import { z } from 'zod'

const CATEGORIES = ['Alimentos', 'Divisas', 'Demografía'] as const

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  unit: z.string().min(1, 'La unidad es requerida'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({
      message: 'La categoría debe ser Alimentos, Divisas o Demografía',
    }),
  }),
  departmentIds: z
    .array(z.string().uuid('ID de departamento inválido'))
    .min(1, 'Debe asociar al menos un departamento'),
})

export const UpdateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  unit: z.string().min(1, 'La unidad es requerida').optional(),
  category: z
    .enum(CATEGORIES, {
      errorMap: () => ({
        message: 'La categoría debe ser Alimentos, Divisas o Demografía',
      }),
    })
    .optional(),
  departmentIds: z
    .array(z.string().uuid('ID de departamento inválido'))
    .min(1, 'Debe asociar al menos un departamento')
    .optional(),
})

export const PatchProductSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  category: z.enum(CATEGORIES).optional(),
  departmentIds: z.array(z.string().uuid()).min(1).optional(),
})

export const UpdateMonitoringConfigSchema = z.object({
  cronExpression: z.string().min(1, 'La expresión cron es requerida'),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
export type PatchProductInput = z.infer<typeof PatchProductSchema>
export type UpdateMonitoringConfigInput = z.infer<
  typeof UpdateMonitoringConfigSchema
>
