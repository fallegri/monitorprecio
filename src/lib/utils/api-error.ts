import { ZodError } from 'zod'

export function handleApiError(error: unknown): Response {
  if (error instanceof ZodError) {
    const message = error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ')
    return Response.json({ error: message }, { status: 400 })
  }

  console.error('[API Error]', error)

  const isDev = process.env.NODE_ENV === 'development'
  return Response.json(
    { error: isDev ? String(error) : 'Error interno del servidor' },
    { status: 500 }
  )
}
